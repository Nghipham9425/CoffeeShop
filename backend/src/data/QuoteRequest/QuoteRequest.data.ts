import { prisma } from "../prisma.js";
import type {
  CreateQuoteRequestInput,
  CreateQuotationInput,
  UpdateQuoteRequestStatusInput,
} from "../../validators/QuoteRequest/QuoteRequest.validator.js";

const warehouse = "Kho thành phẩm";
const quoteInclude = {
  items: { include: { product: { select: { id: true, name: true, unit: true } } }, orderBy: { id: "asc" as const } },
  contract: { select: { id: true, contractCode: true, status: true } },
  order: { select: { id: true, orderCode: true, status: true } },
};

export const quoteRequestData = {
  findMany() {
    return prisma.quoteRequest.findMany({ include: quoteInclude, orderBy: { createdAt: "desc" } });
  },
  findById(id: number) {
    return prisma.quoteRequest.findUnique({ where: { id }, include: quoteInclude });
  },
  findPublic(id: number, accessTokenHash: string) {
    return prisma.quoteRequest.findFirst({ where: { id, accessTokenHash }, include: quoteInclude });
  },
  findForUser(id: number, userId: number) {
    return prisma.quoteRequest.findFirst({ where: { id, businessCustomer: { userId } }, include: quoteInclude });
  },
  create(data: CreateQuoteRequestInput, accessTokenHash: string) {
    return prisma.quoteRequest.create({ data: { ...data, accessTokenHash }, include: quoteInclude });
  },
  async createForUser(userId: number, data: CreateQuoteRequestInput, accessTokenHash: string) {
    return prisma.$transaction(async (tx) => {
      const user = await tx.user.findUniqueOrThrow({ where: { id: userId }, select: { fullName: true, email: true, phone: true } });
      const phone = data.phoneOrEmail.includes("@") ? (user.phone ?? "Chưa cập nhật") : data.phoneOrEmail;
      const businessCustomer = await tx.businessCustomer.upsert({
        where: { userId },
        create: { userId, companyName: data.companyName, contactName: data.contactName, phone, email: user.email },
        update: { companyName: data.companyName, contactName: data.contactName, phone, email: user.email },
      });
      return tx.quoteRequest.create({
        data: { ...data, businessCustomerId: businessCustomer.id, accessTokenHash },
        include: quoteInclude,
      });
    });
  },
  updateStatus(id: number, data: UpdateQuoteRequestStatusInput) {
    return prisma.quoteRequest.update({ where: { id }, data, include: quoteInclude });
  },

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
    return prisma.quoteRequest.update({
      where: { id },
      data: { status, customerRespondedAt: new Date() },
      include: quoteInclude,
    });
  },

  async convert(id: number, target: "CONTRACT" | "ORDER") {
    return prisma.$transaction(async (tx) => {
      const quote = await tx.quoteRequest.findUniqueOrThrow({ where: { id }, include: { items: true } });
      let businessCustomerId = quote.businessCustomerId;

      if (!businessCustomerId) {
        const isEmail = quote.phoneOrEmail.includes("@");
        const customer = await tx.businessCustomer.create({
          data: {
            companyName: quote.companyName,
            contactName: quote.contactName,
            phone: isEmail ? "Chưa cập nhật" : quote.phoneOrEmail,
            email: isEmail ? quote.phoneOrEmail : undefined,
            note: `Tạo từ yêu cầu báo giá #${quote.id}`,
          },
        });
        businessCustomerId = customer.id;
      }

      if (target === "CONTRACT") {
        const contract = await tx.contract.create({
          data: {
            businessCustomerId,
            quoteRequestId: id,
            contractCode: `HD${Date.now().toString().slice(-10)}`,
            title: `Cung ứng cà phê - ${quote.companyName}`,
            totalValue: quote.totalAmount,
            status: "DRAFT",
            note: quote.salesNote,
          },
        });
        await tx.quoteRequest.update({
          where: { id },
          data: { businessCustomerId, status: "CONVERTED", convertedAt: new Date() },
        });
        return { target, id: contract.id, code: contract.contractCode };
      }

      if (!quote.items.length || quote.items.some((item) => !item.productId)) {
        throw new Error("QUOTE_ITEMS_REQUIRE_PRODUCTS");
      }

      const productIds = quote.items.map((item) => item.productId!);
      const products = await tx.product.findMany({
        where: { id: { in: productIds }, isActive: true, isB2b: true },
        select: { id: true, minimumOrderKg: true },
      });
      const productById = new Map(products.map((product) => [product.id, product]));
      const requiredQuantities = new Map<number, number>();

      for (const item of quote.items) {
        const product = productById.get(item.productId!);
        if (!product) throw new Error(`PRODUCT_NOT_FOUND:${item.description}`);
        if (item.quantity < product.minimumOrderKg) {
          throw new Error(`MOQ_NOT_MET:${item.description}:${product.minimumOrderKg}`);
        }
        requiredQuantities.set(item.productId!, (requiredQuantities.get(item.productId!) ?? 0) + item.quantity);
      }

      for (const [productId, quantity] of requiredQuantities) {
        const inventory = await tx.inventory.findFirst({
          where: { productId, warehouse },
          select: { quantity: true },
        });
        if (!inventory || inventory.quantity < quantity) throw new Error("INSUFFICIENT_STOCK");
      }

      const orderCode = `B2B${Date.now().toString().slice(-10)}`;
      const order = await tx.order.create({
        data: {
          businessCustomerId,
          quoteRequestId: id,
          channel: "B2B",
          orderCode,
          customerName: quote.contactName,
          customerPhone: quote.phoneOrEmail.includes("@") ? "Chưa cập nhật" : quote.phoneOrEmail,
          customerEmail: quote.phoneOrEmail.includes("@") ? quote.phoneOrEmail : undefined,
          subtotal: quote.subtotal,
          discountAmount: quote.discountAmount,
          totalAmount: quote.totalAmount,
          note: `Chuyển từ báo giá #${id}\n${quote.salesNote ?? ""}`,
          items: {
            create: quote.items.map((item) => ({
              productId: item.productId!,
              quantity: item.quantity,
              unitGram: 1000,
              quantityGram: item.quantity * 1000,
              unitPrice: item.unitPrice,
              lineTotal: item.lineTotal,
            })),
          },
          payments: { create: { method: "BANK_TRANSFER", status: "PENDING", amount: quote.totalAmount } },
          shipment: { create: { status: "WAITING", carrier: "Thỏa thuận B2B" } },
        },
        include: { items: true },
      });

      for (const orderItem of order.items) {
        const inventory = await tx.inventory.findFirstOrThrow({ where: { productId: orderItem.productId, warehouse } });
        const updated = await tx.inventory.updateMany({
          where: { id: inventory.id, quantity: { gte: orderItem.quantity } },
          data: { quantity: { decrement: orderItem.quantity } },
        });
        if (updated.count !== 1) throw new Error("INSUFFICIENT_STOCK");

        await tx.stockMovement.create({
          data: {
            productId: orderItem.productId,
            type: "EXPORT",
            quantity: orderItem.quantity,
            warehouse: inventory.warehouse,
            balanceAfter: inventory.quantity - orderItem.quantity,
            reason: "Xuất kho theo đơn B2B",
            reference: orderCode,
          },
        });
      }

      await tx.quoteRequest.update({
        where: { id },
        data: { businessCustomerId, status: "CONVERTED", convertedAt: new Date() },
      });
      return { target, id: order.id, code: order.orderCode };
    });
  },
};
