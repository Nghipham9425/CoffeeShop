import type { Prisma } from "@prisma/client";
import { prisma } from "../prisma.js";
import type {
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
};
