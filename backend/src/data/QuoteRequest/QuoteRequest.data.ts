import { prisma } from "../prisma.js";
import type { CreateQuoteRequestInput, CreateQuotationInput, UpdateQuoteRequestStatusInput } from "../../validators/QuoteRequest/QuoteRequest.validator.js";

const quoteInclude = {
  items: { include: { product: { select: { id: true, name: true, unit: true } } }, orderBy: { id: "asc" as const } },
  contract: { select: { id: true, contractCode: true, status: true } },
  order: { select: { id: true, orderCode: true, status: true } },
};

export const quoteRequestData = {
  findMany() { return prisma.quoteRequest.findMany({ include: quoteInclude, orderBy: { createdAt: "desc" } }); },
  findById(id: number) { return prisma.quoteRequest.findUnique({ where: { id }, include: quoteInclude }); },
  findPublic(id: number, accessTokenHash: string) { return prisma.quoteRequest.findFirst({ where: { id, accessTokenHash }, include: quoteInclude }); },
  create(data: CreateQuoteRequestInput, accessTokenHash: string) { return prisma.quoteRequest.create({ data: { ...data, accessTokenHash }, include: quoteInclude }); },
  updateStatus(id: number, data: UpdateQuoteRequestStatusInput) { return prisma.quoteRequest.update({ where: { id }, data, include: quoteInclude }); },

  async setQuotation(id: number, input: CreateQuotationInput) {
    return prisma.$transaction(async (tx) => {
      const subtotal = input.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
      const discountAmount = Math.min(subtotal, input.discountAmount);
      await tx.quoteRequestItem.deleteMany({ where: { quoteRequestId: id } });
      await tx.quoteRequest.update({
        where: { id },
        data: {
          subtotal,
          discountAmount,
          totalAmount: subtotal - discountAmount,
          validUntil: input.validUntil,
          salesNote: input.salesNote,
          status: "QUOTED",
          items: { create: input.items.map((item) => ({ ...item, lineTotal: item.quantity * item.unitPrice })) },
        },
      });
      return tx.quoteRequest.findUniqueOrThrow({ where: { id }, include: quoteInclude });
    });
  },

  respond(id: number, status: "ACCEPTED" | "REJECTED") {
    return prisma.quoteRequest.update({ where: { id }, data: { status, customerRespondedAt: new Date() }, include: quoteInclude });
  },

  async convert(id: number, target: "CONTRACT" | "ORDER") {
    return prisma.$transaction(async (tx) => {
      const quote = await tx.quoteRequest.findUniqueOrThrow({ where: { id }, include: { items: true } });
      let businessCustomerId = quote.businessCustomerId;
      if (!businessCustomerId) {
        const isEmail = quote.phoneOrEmail.includes("@");
        const customer = await tx.businessCustomer.create({ data: { companyName: quote.companyName, contactName: quote.contactName, phone: isEmail ? "Chưa cập nhật" : quote.phoneOrEmail, email: isEmail ? quote.phoneOrEmail : undefined, note: `Tạo từ yêu cầu báo giá #${quote.id}` } });
        businessCustomerId = customer.id;
      }

      if (target === "CONTRACT") {
        const contract = await tx.contract.create({ data: { businessCustomerId, quoteRequestId: id, contractCode: `HD${Date.now().toString().slice(-10)}`, title: `Cung ứng cà phê - ${quote.companyName}`, totalValue: quote.totalAmount, status: "DRAFT", note: quote.salesNote } });
        await tx.quoteRequest.update({ where: { id }, data: { businessCustomerId, status: "CONVERTED", convertedAt: new Date() } });
        return { target, id: contract.id, code: contract.contractCode };
      }

      if (!quote.items.length || quote.items.some((item) => !item.productId)) throw new Error("QUOTE_ITEMS_REQUIRE_PRODUCTS");
      for (const item of quote.items) {
        const inventory = await tx.inventory.findFirst({ where: { productId: item.productId! }, orderBy: { quantity: "desc" } });
        if (!inventory || inventory.quantity < item.quantity) throw new Error(`INSUFFICIENT_STOCK:${item.description}`);
      }
      const orderCode = `B2B${Date.now().toString().slice(-10)}`;
      const order = await tx.order.create({ data: { businessCustomerId, quoteRequestId: id, channel: "B2B", orderCode, customerName: quote.contactName, customerPhone: quote.phoneOrEmail.includes("@") ? "Chưa cập nhật" : quote.phoneOrEmail, customerEmail: quote.phoneOrEmail.includes("@") ? quote.phoneOrEmail : undefined, subtotal: quote.subtotal, discountAmount: quote.discountAmount, totalAmount: quote.totalAmount, note: `Chuyển từ báo giá #${id}\n${quote.salesNote ?? ""}`, items: { create: quote.items.map((item) => ({ productId: item.productId!, quantity: item.quantity, unitPrice: item.unitPrice, lineTotal: item.lineTotal })) }, payments: { create: { method: "BANK_TRANSFER", status: "PENDING", amount: quote.totalAmount } }, shipment: { create: { status: "WAITING", carrier: "Thỏa thuận B2B" } } } });
      for (const item of quote.items) {
        const inventory = await tx.inventory.findFirstOrThrow({ where: { productId: item.productId! }, orderBy: { quantity: "desc" } });
        await tx.inventory.update({ where: { id: inventory.id }, data: { quantity: { decrement: item.quantity } } });
        await tx.stockMovement.create({ data: { productId: item.productId!, type: "EXPORT", quantity: item.quantity, warehouse: inventory.warehouse, balanceAfter: inventory.quantity - item.quantity, reason: "Giữ hàng cho đơn B2B", reference: orderCode } });
      }
      await tx.quoteRequest.update({ where: { id }, data: { businessCustomerId, status: "CONVERTED", convertedAt: new Date() } });
      return { target, id: order.id, code: order.orderCode };
    });
  },
};
