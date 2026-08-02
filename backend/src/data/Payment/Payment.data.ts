import { OrderStatus, PaymentMethod, PaymentStatus, StockMovementType } from "@prisma/client";
import { prisma } from "../prisma.js";

export const paymentData = {
  findSepayOrder(orderId: number) {
    return prisma.order.findUnique({
      where: { id: orderId },
      include: { payments: { where: { method: PaymentMethod.SEPAY } } },
    });
  },

  findSepayOrderByCode(orderCode: string) {
    return prisma.order.findUnique({
      where: { orderCode },
      include: { payments: { where: { method: PaymentMethod.SEPAY } } },
    });
  },

  async confirmSepayPayment(orderId: number, amount: number, transactionCode?: string) {
    return prisma.$transaction(async (tx) => {
      const payment = await tx.payment.findFirst({
        where: { orderId, method: PaymentMethod.SEPAY },
      });
      if (!payment || Number(payment.amount) !== amount) return false;
      if (payment.status === PaymentStatus.PAID) return true;
      if (payment.status !== PaymentStatus.PENDING) return false;

      const updated = await tx.payment.updateMany({
        where: { id: payment.id, status: PaymentStatus.PENDING },
        data: {
          status: PaymentStatus.PAID,
          transactionCode: transactionCode?.trim() || undefined,
          paidAt: new Date(),
        },
      });
      if (updated.count !== 1) return false;

      // A successful SePay webhook is the payment confirmation. The order is
      // ready for warehouse processing, but it must not be completed yet.
      await tx.order.updateMany({
        where: { id: orderId, status: OrderStatus.PENDING },
        data: { status: OrderStatus.CONFIRMED },
      });

      return true;
    });
  },

  findExpiredSepayOrderIds(cutoff: Date) {
    return prisma.order.findMany({
      where: {
        status: OrderStatus.PENDING,
        createdAt: { lt: cutoff },
        payments: { some: { method: PaymentMethod.SEPAY, status: PaymentStatus.PENDING } },
      },
      select: { id: true },
    });
  },

  async expireSepayOrder(orderId: number) {
    return prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: { id: orderId },
        include: { items: { include: { allocations: { include: { inventory: true } } } }, payments: true },
      });
      if (!order || order.status !== OrderStatus.PENDING) return false;

      const expiredPayment = await tx.payment.updateMany({
        where: { orderId, method: PaymentMethod.SEPAY, status: PaymentStatus.PENDING },
        data: { status: PaymentStatus.FAILED },
      });
      if (expiredPayment.count !== 1) return false;

      const cancelledOrder = await tx.order.updateMany({
        where: { id: orderId, status: OrderStatus.PENDING },
        data: {
          status: OrderStatus.CANCELLED,
          cancelReason: "Quá thời hạn chờ thanh toán SePay.",
        },
      });
      if (cancelledOrder.count !== 1) return false;

      for (const item of order.items) {
        if (item.allocations.length) {
          for (const allocation of item.allocations) {
            const inventory = await tx.inventory.update({
              where: { id: allocation.inventoryId },
              data: { quantity: { increment: allocation.quantity } },
            });
            await tx.stockMovement.create({
              data: {
                productId: item.productId,
                type: StockMovementType.RETURN,
                quantity: allocation.quantity,
                warehouse: allocation.inventory.warehouse,
                balanceAfter: inventory.quantity,
                reason: "Hoàn tồn do đơn SePay quá hạn thanh toán.",
                reference: order.orderCode,
              },
            });
          }
          continue;
        }
        const inventory = await tx.inventory.findFirst({
          where: { productId: item.productId },
          orderBy: { quantity: "desc" },
        });
        if (!inventory) continue;

        await tx.inventory.update({
          where: { id: inventory.id },
          data: { quantity: { increment: item.quantity } },
        });
        await tx.stockMovement.create({
          data: {
            productId: item.productId,
            type: StockMovementType.RETURN,
            quantity: item.quantity,
            warehouse: inventory.warehouse,
            balanceAfter: inventory.quantity + item.quantity,
            reason: "Hoàn tồn do đơn SePay quá hạn thanh toán.",
            reference: order.orderCode,
          },
        });
      }
      return true;
    });
  },
};
