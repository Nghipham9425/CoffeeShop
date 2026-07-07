import { Prisma } from "@prisma/client";
import { orderData } from "../../data/Order/Order.data.js";
import type {
  OrderQueryInput,
  UpdateOrderStatusInput,
  UpdatePaymentStatusInput,
  UpsertShipmentInput,
} from "../../validators/Order/Order.validator.js";

type OrderRecord = Awaited<ReturnType<typeof orderData.findMany>>[number];
type PaymentRecord = Awaited<ReturnType<typeof orderData.updatePaymentStatus>>;
type ShipmentRecord = Awaited<ReturnType<typeof orderData.upsertShipment>>;

function toNumber(value: Prisma.Decimal | number | null | undefined) {
  return value == null ? null : Number(value);
}

function mapPayment(payment: PaymentRecord) {
  return {
    id: payment.id,
    orderId: payment.orderId,
    method: payment.method,
    status: payment.status,
    amount: Number(payment.amount),
    transactionCode: payment.transactionCode,
    paidAt: payment.paidAt,
    createdAt: payment.createdAt,
  };
}

function mapShipment(shipment: ShipmentRecord | null) {
  if (!shipment) return null;
  return {
    id: shipment.id,
    orderId: shipment.orderId,
    carrier: shipment.carrier,
    trackingCode: shipment.trackingCode,
    status: shipment.status,
    note: shipment.note,
    shippedAt: shipment.shippedAt,
    deliveredAt: shipment.deliveredAt,
  };
}

function mapOrder(order: OrderRecord) {
  return {
    id: order.id,
    orderCode: order.orderCode,
    customerName: order.customerName,
    customerPhone: order.customerPhone,
    customerEmail: order.customerEmail,
    subtotal: Number(order.subtotal),
    shippingFee: Number(order.shippingFee),
    discountAmount: Number(order.discountAmount),
    totalAmount: Number(order.totalAmount),
    note: order.note,
    cancelReason: order.cancelReason,
    refundAmount: toNumber(order.refundAmount),
    status: order.status,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
    user: order.user,
    promotion: order.promotion
      ? {
          id: order.promotion.id,
          name: order.promotion.name,
          code: order.promotion.code,
        }
      : null,
    items: order.items.map((item) => ({
      id: item.id,
      productId: item.productId,
      productName: item.product.name,
      unit: item.product.unit,
      quantity: item.quantity,
      unitPrice: Number(item.unitPrice),
      lineTotal: Number(item.lineTotal),
    })),
    payments: order.payments.map(mapPayment),
    shipment: mapShipment(order.shipment),
  };
}

export const orderService = {
  async getOrders(query: OrderQueryInput) {
    const orders = await orderData.findMany(query);
    return orders.map(mapOrder);
  },

  async getOrderById(id: number) {
    const order = await orderData.findById(id);
    return order ? mapOrder(order) : null;
  },

  async updateOrderStatus(id: number, input: UpdateOrderStatusInput) {
    const order = await orderData.findById(id);
    if (!order) throw new Error("ORDER_NOT_FOUND");

    const updated = await orderData.updateStatus(id, input);
    return mapOrder(updated);
  },

  async updatePaymentStatus(id: number, input: UpdatePaymentStatusInput) {
    return mapPayment(await orderData.updatePaymentStatus(id, input));
  },

  async upsertShipment(orderId: number, input: UpsertShipmentInput) {
    const order = await orderData.findById(orderId);
    if (!order) throw new Error("ORDER_NOT_FOUND");

    return mapShipment(await orderData.upsertShipment(orderId, input));
  },
};
