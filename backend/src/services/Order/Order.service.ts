import { OrderStatus, PaymentMethod, PaymentStatus, Prisma, ShipmentStatus } from "@prisma/client";
import { orderData } from "../../data/Order/Order.data.js";
import type {
  CheckoutInput,
  OrderQueryInput,
  UpdateOrderStatusInput,
  UpdatePaymentStatusInput,
  UpsertShipmentInput,
  CreateReturnRequestInput,
  UpdateReturnRequestInput,
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
  async checkout(input: CheckoutInput, userId?: number) {
    const orderCode = `PT${Date.now().toString().slice(-8)}${Math.floor(Math.random() * 90 + 10)}`;

    try {
      return mapOrder(await orderData.checkout({ ...input, orderCode, userId }));
    } catch (error) {
      if (error instanceof Error && error.message.startsWith("INSUFFICIENT_STOCK:")) {
        const productName = error.message.replace("INSUFFICIENT_STOCK:", "");
        throw new Error(`Sản phẩm "${productName}" không đủ tồn kho`);
      }

      if (error instanceof Error && error.message.startsWith("PRODUCT_PRICE_NOT_FOUND:")) {
        const productName = error.message.replace("PRODUCT_PRICE_NOT_FOUND:", "");
        throw new Error(`Sản phẩm "${productName}" chưa có giá bán lẻ`);
      }

      if (error instanceof Error && error.message === "PRODUCT_NOT_FOUND") {
        throw new Error("Có sản phẩm không còn bán lẻ hoặc không tồn tại");
      }

      if (error instanceof Error && ["VOUCHER_NOT_FOUND", "VOUCHER_INACTIVE"].includes(error.message)) {
        throw new Error(error.message === "VOUCHER_NOT_FOUND" ? "Mã giảm giá không tồn tại" : "Mã giảm giá đã hết hạn hoặc chưa được kích hoạt");
      }

      if (error instanceof Error && error.message.startsWith("VOUCHER_MIN_ORDER:")) {
        const minimum = Number(error.message.split(":")[1]);
        throw new Error(`Đơn hàng chưa đạt giá trị tối thiểu ${minimum.toLocaleString("vi-VN")} đ`);
      }

      throw error;
    }
  },

  async getOrders(query: OrderQueryInput) {
    const orders = await orderData.findMany(query);
    return orders.map(mapOrder);
  },

  async cancelCustomerOrder(id: number, userId: number, reason: string) {
    const order = await orderData.findCustomerOrder(id, userId);
    if (!order) throw new Error("ORDER_NOT_FOUND");
    if (order.status !== OrderStatus.PENDING) throw new Error("ORDER_NOT_CANCELLABLE");
    if (order.payments.some((payment) => payment.status === PaymentStatus.PAID)) throw new Error("PAID_ORDER_REQUIRES_REFUND_REQUEST");
    return mapOrder(await orderData.cancelCustomerOrder(id, userId, reason));
  },

  async createReturnRequest(id: number, userId: number, input: CreateReturnRequestInput) {
    const order = await orderData.findCustomerOrder(id, userId);
    if (!order) throw new Error("ORDER_NOT_FOUND");
    if (order.status !== OrderStatus.COMPLETED) throw new Error("RETURN_REQUIRES_COMPLETED_ORDER");
    if (await orderData.findActiveReturnRequest(id, userId)) throw new Error("RETURN_REQUEST_ALREADY_EXISTS");
    return orderData.createReturnRequest(id, userId, input);
  },

  listReturnRequests() {
    return orderData.listReturnRequests();
  },

  async updateReturnRequest(id: number, input: UpdateReturnRequestInput) {
    const current = await orderData.findReturnRequest(id);
    if (!current) throw new Error("RETURN_REQUEST_NOT_FOUND");
    const transitions: Record<string, string[]> = {
      REQUESTED: ["REVIEWING", "APPROVED", "REJECTED", "CANCELLED"],
      REVIEWING: ["APPROVED", "REJECTED"],
      APPROVED: ["COMPLETED"],
      REJECTED: [], COMPLETED: [], CANCELLED: [],
    };
    if (!transitions[current.status]?.includes(input.status)) throw new Error("INVALID_RETURN_STATUS_TRANSITION");
    return input.status === "COMPLETED"
      ? orderData.completeReturnRequest(id, input)
      : orderData.updateReturnRequest(id, input);
  },

  async getOrderById(id: number) {
    const order = await orderData.findById(id);
    return order ? mapOrder(order) : null;
  },

  async getPublicPaymentStatus(id: number, orderCode: string) {
    const order = await orderData.findPaymentStatus(id, orderCode);
    if (!order) return null;

    const payment = order.payments[0] ?? null;
    return {
      orderId: order.id,
      orderCode: order.orderCode,
      orderStatus: order.status,
      paymentStatus: payment?.status ?? null,
      paymentMethod: payment?.method ?? null,
      paidAt: payment?.paidAt ?? null,
    };
  },

  async trackOrder(code: string) {
    const order = await orderData.findTrackableOrder(code.trim().toUpperCase());
    if (!order) return null;

    return {
      id: order.id,
      orderCode: order.orderCode,
      status: order.status,
      totalAmount: Number(order.totalAmount),
      createdAt: order.createdAt,
      items: order.items.map((item) => ({ id: item.id, productName: item.product.name, unit: item.product.unit, quantity: item.quantity })),
      payment: order.payments[0] ?? null,
      shipment: order.shipment,
    };
  },

  async updateOrderStatus(id: number, input: UpdateOrderStatusInput) {
    const order = await orderData.findById(id);
    if (!order) throw new Error("ORDER_NOT_FOUND");

    const payment = order.payments[0];
    const shipment = order.shipment;
    const allowedTransitions: Partial<Record<OrderStatus, OrderStatus[]>> = {
      [OrderStatus.PENDING]: [OrderStatus.CONFIRMED, OrderStatus.CANCELLED],
      [OrderStatus.CONFIRMED]: [OrderStatus.PACKING, OrderStatus.CANCELLED],
      [OrderStatus.PACKING]: [OrderStatus.SHIPPING],
      [OrderStatus.SHIPPING]: [OrderStatus.COMPLETED],
    };

    if (!allowedTransitions[order.status]?.includes(input.status)) {
      throw new Error("INVALID_ORDER_STATUS_TRANSITION");
    }

    if (
      input.status === OrderStatus.CONFIRMED
      && payment
      && (payment.method === PaymentMethod.SEPAY || payment.method === PaymentMethod.BANK_TRANSFER)
      && payment.status !== PaymentStatus.PAID
    ) {
      throw new Error("PAYMENT_MUST_BE_CONFIRMED");
    }

    if (input.status === OrderStatus.SHIPPING && shipment?.status !== ShipmentStatus.SHIPPED) {
      throw new Error("SHIPMENT_MUST_BE_SHIPPED");
    }

    if (input.status === OrderStatus.COMPLETED && shipment?.status !== ShipmentStatus.DELIVERED) {
      throw new Error("SHIPMENT_MUST_BE_DELIVERED");
    }

    const updated = input.status === OrderStatus.CANCELLED
      ? await orderData.cancelAdminOrder(id, input)
      : input.status === OrderStatus.COMPLETED
        ? await orderData.completeB2cOrder(id, input)
        : await orderData.updateStatus(id, input);

    // COD is collected after successful delivery, not while the order is new.
    if (input.status === OrderStatus.COMPLETED && payment?.method === PaymentMethod.COD && payment.status === PaymentStatus.PENDING) {
      await orderData.updatePaymentStatus(payment.id, { status: PaymentStatus.PAID });
    }
    return mapOrder(updated);
  },

  async updatePaymentStatus(id: number, input: UpdatePaymentStatusInput) {
    const payment = await orderData.findPaymentById(id);
    if (!payment) throw new Error("PAYMENT_NOT_FOUND");

    if (payment.method === PaymentMethod.SEPAY) {
      throw new Error("SEPAY_PAYMENT_MANAGED_BY_WEBHOOK");
    }

    if (payment.method === PaymentMethod.COD && input.status === PaymentStatus.PAID && payment.order.status !== OrderStatus.COMPLETED) {
      throw new Error("COD_CAN_ONLY_BE_PAID_AFTER_DELIVERY");
    }

    if (payment.status === PaymentStatus.PAID && input.status === PaymentStatus.REFUNDED && payment.order.status !== OrderStatus.CANCELLED) {
      throw new Error("REFUND_REQUIRES_CANCELLED_ORDER");
    }

    return mapPayment(await orderData.updatePaymentStatus(id, input));
  },

  async upsertShipment(orderId: number, input: UpsertShipmentInput) {
    const order = await orderData.findById(orderId);
    if (!order) throw new Error("ORDER_NOT_FOUND");

    const currentStatus = order.shipment?.status ?? ShipmentStatus.WAITING;
    const nextStatus = input.status ?? currentStatus;
    const allowedTransitions: Record<ShipmentStatus, ShipmentStatus[]> = {
      [ShipmentStatus.WAITING]: [ShipmentStatus.WAITING, ShipmentStatus.PACKED],
      [ShipmentStatus.PACKED]: [ShipmentStatus.PACKED, ShipmentStatus.SHIPPED],
      [ShipmentStatus.SHIPPED]: [ShipmentStatus.SHIPPED, ShipmentStatus.DELIVERED, ShipmentStatus.RETURNED],
      [ShipmentStatus.DELIVERED]: [ShipmentStatus.DELIVERED],
      [ShipmentStatus.RETURNED]: [ShipmentStatus.RETURNED],
    };
    if (!allowedTransitions[currentStatus].includes(nextStatus)) {
      throw new Error("INVALID_SHIPMENT_STATUS_TRANSITION");
    }

    return mapShipment(await orderData.upsertShipment(orderId, { ...input, status: nextStatus }));
  },
};
