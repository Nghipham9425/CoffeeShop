import type { Prisma } from "@prisma/client";
import { prisma } from "../prisma.js";
import type {
  CheckoutInput,
  OrderQueryInput,
  UpdateOrderStatusInput,
  UpdatePaymentStatusInput,
  UpsertShipmentInput,
} from "../../validators/Order/Order.validator.js";

const orderInclude = {
  user: { select: { id: true, fullName: true, email: true, phone: true } },
  promotion: true,
  items: { include: { product: { select: { id: true, name: true, unit: true } } } },
  payments: true,
  shipment: true,
} satisfies Prisma.OrderInclude;

function buildWhere(query: OrderQueryInput): Prisma.OrderWhereInput {
  return {
    status: query.status,
    OR: query.keyword
      ? [
          { orderCode: { contains: query.keyword, mode: "insensitive" } },
          { customerName: { contains: query.keyword, mode: "insensitive" } },
          { customerPhone: { contains: query.keyword, mode: "insensitive" } },
          { customerEmail: { contains: query.keyword, mode: "insensitive" } },
        ]
      : undefined,
  };
}

export const orderData = {
  findMany(query: OrderQueryInput) {
    return prisma.order.findMany({
      where: buildWhere(query),
      include: orderInclude,
      orderBy: { createdAt: "desc" },
    });
  },

  findById(id: number) {
    return prisma.order.findUnique({
      where: { id },
      include: orderInclude,
    });
  },

  findPaymentStatus(id: number, orderCode: string) {
    return prisma.order.findFirst({
      where: { id, orderCode },
      select: {
        id: true,
        orderCode: true,
        status: true,
        payments: {
          select: { method: true, status: true, paidAt: true },
          orderBy: { id: "asc" },
          take: 1,
        },
      },
    });
  },

  findTrackingOrder(trackingCode: string) {
    return prisma.shipment.findFirst({
      where: { trackingCode },
      select: {
        status: true,
        carrier: true,
        trackingCode: true,
        shippedAt: true,
        deliveredAt: true,
        order: {
          select: {
            id: true,
            orderCode: true,
            status: true,
            totalAmount: true,
            createdAt: true,
            items: { select: { id: true, quantity: true, product: { select: { name: true, unit: true } } } },
            payments: { select: { method: true, status: true, paidAt: true }, orderBy: { id: "asc" }, take: 1 },
          },
        },
      },
    });
  },

  updateStatus(id: number, input: UpdateOrderStatusInput) {
    return prisma.order.update({
      where: { id },
      data: {
        status: input.status,
        cancelReason: input.cancelReason,
        refundAmount: input.refundAmount,
      },
      include: orderInclude,
    });
  },

  updatePaymentStatus(id: number, input: UpdatePaymentStatusInput) {
    return prisma.payment.update({
      where: { id },
      data: {
        status: input.status,
        transactionCode: input.transactionCode,
        paidAt: input.status === "PAID" ? new Date() : undefined,
      },
    });
  },

  findPaymentById(id: number) {
    return prisma.payment.findUnique({
      where: { id },
      include: { order: { select: { status: true } } },
    });
  },

  upsertShipment(orderId: number, input: UpsertShipmentInput) {
    return prisma.shipment.upsert({
      where: { orderId },
      create: {
        orderId,
        carrier: input.carrier,
        trackingCode: input.trackingCode,
        status: input.status,
        note: input.note,
        shippedAt: input.status === "SHIPPED" ? new Date() : undefined,
        deliveredAt: input.status === "DELIVERED" ? new Date() : undefined,
      },
      update: {
        carrier: input.carrier,
        trackingCode: input.trackingCode,
        status: input.status,
        note: input.note,
        shippedAt: input.status === "SHIPPED" ? new Date() : undefined,
        deliveredAt: input.status === "DELIVERED" ? new Date() : undefined,
      },
    });
  },

  async checkout(input: CheckoutInput & { orderCode: string; userId?: number }) {
    return prisma.$transaction(async (tx) => {
      const productIds = input.items.map((item) => item.productId);
      const products = await tx.product.findMany({
        where: {
          id: { in: productIds },
          isActive: true,
          isRetail: true,
        },
        include: {
          category: true,
          prices: {
            where: {
              isActive: true,
              priceType: "RETAIL",
            },
            orderBy: { minQuantity: "desc" },
          },
          inventories: {
            orderBy: { quantity: "desc" },
          },
        },
      });

      const productById = new Map(products.map((product) => [product.id, product]));
      let subtotal = 0;
      const orderItems = [];

      for (const item of input.items) {
        const product = productById.get(item.productId);

        if (!product) {
          throw new Error("PRODUCT_NOT_FOUND");
        }

        const inventory = product.inventories[0];
        if (!inventory || inventory.quantity < item.quantity) {
          throw new Error(`INSUFFICIENT_STOCK:${product.name}`);
        }

        const matchedPrice = product.prices.find((price) => price.minQuantity <= item.quantity);
        const unitPrice = Number(matchedPrice?.price ?? product.price ?? 0);

        if (unitPrice <= 0) {
          throw new Error(`PRODUCT_PRICE_NOT_FOUND:${product.name}`);
        }

        const lineTotal = unitPrice * item.quantity;
        subtotal += lineTotal;

        orderItems.push({
          product,
          inventory,
          quantity: item.quantity,
          unitPrice,
          lineTotal,
        });
      }

      const totalAmount = subtotal + input.shippingFee;
      const order = await tx.order.create({
        data: {
          orderCode: input.orderCode,
          userId: input.userId,
          customerName: input.customerName,
          customerPhone: input.customerPhone,
          customerEmail: input.customerEmail || undefined,
          subtotal,
          shippingFee: input.shippingFee,
          discountAmount: 0,
          totalAmount,
          note: [input.note, `Địa chỉ giao hàng: ${input.address}`].filter(Boolean).join("\n"),
          status: "PENDING",
          items: {
            create: orderItems.map((item) => ({
              productId: item.product.id,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              lineTotal: item.lineTotal,
            })),
          },
          payments: {
            create: {
              method: input.paymentMethod,
              status: "PENDING",
              amount: totalAmount,
              transactionCode: undefined,
              paidAt: undefined,
            },
          },
          shipment: {
            create: {
              carrier: "Nội bộ",
              status: "WAITING",
              note: input.address,
            },
          },
        },
        include: orderInclude,
      });

      for (const item of orderItems) {
        await tx.inventory.update({
          where: { id: item.inventory.id },
          data: {
            quantity: { decrement: item.quantity },
          },
        });

        await tx.stockMovement.create({
          data: {
            productId: item.product.id,
            type: "EXPORT",
            quantity: item.quantity,
            reason: "Xuất kho theo đơn hàng B2C",
            reference: input.orderCode,
          },
        });
      }

      return order;
    });
  },
};
