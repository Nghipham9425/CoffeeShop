import type { Prisma } from "@prisma/client";
import { prisma } from "../prisma.js";
import type {
  CheckoutInput,
  OrderQueryInput,
  UpdateOrderStatusInput,
  UpdatePaymentStatusInput,
  UpsertShipmentInput,
  CreateReturnRequestInput,
  UpdateReturnRequestInput,
} from "../../validators/Order/Order.validator.js";
import { PromotionService } from "../../services/Promotion/Promotion.service.js";

const orderInclude = {
  user: { select: { id: true, fullName: true, email: true, phone: true } },
  promotion: true,
  items: { include: { product: { select: { id: true, name: true, unit: true } }, allocations: true } },
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

  findCustomerOrder(id: number, userId: number) {
    return prisma.order.findFirst({ where: { id, userId }, include: orderInclude });
  },

  async cancelCustomerOrder(id: number, userId: number, reason: string) {
    return prisma.$transaction(async (tx) => {
      const order = await tx.order.findFirst({
        where: { id, userId, status: "PENDING" },
        include: { items: { include: { allocations: { include: { inventory: true } } } }, payments: true },
      });
      if (!order) throw new Error("ORDER_NOT_CANCELLABLE");
      if (order.payments.some((payment) => payment.status === "PAID")) throw new Error("PAID_ORDER_REQUIRES_REFUND_REQUEST");

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
                type: "RETURN",
                quantity: allocation.quantity,
                warehouse: allocation.inventory.warehouse,
                balanceAfter: inventory.quantity,
                reason: "Hoàn kho do khách hủy đơn",
                reference: order.orderCode,
              },
            });
          }
          continue;
        }
        const inventory = await tx.inventory.findFirst({ where: { productId: item.productId }, orderBy: { quantity: "desc" } });
        if (inventory) {
          const quantity = item.quantity;
          await tx.inventory.update({ where: { id: inventory.id }, data: { quantity: { increment: quantity } } });
          await tx.stockMovement.create({ data: { productId: item.productId, type: "RETURN", quantity, warehouse: inventory.warehouse, balanceAfter: inventory.quantity + quantity, reason: "Hoàn kho do khách hủy đơn", reference: order.orderCode } });
        }
      }

      await tx.payment.updateMany({ where: { orderId: id, status: "PENDING" }, data: { status: "FAILED" } });
      await tx.order.update({ where: { id }, data: { status: "CANCELLED", cancelReason: reason } });
      return tx.order.findUniqueOrThrow({ where: { id }, include: orderInclude });
    });
  },

  async cancelAdminOrder(id: number, input: UpdateOrderStatusInput) {
    return prisma.$transaction(async (tx) => {
      const order = await tx.order.findFirst({
        where: { id, status: { in: ["PENDING", "CONFIRMED"] } },
        include: { items: { include: { allocations: { include: { inventory: true } } } }, payments: true },
      });
      if (!order) throw new Error("ORDER_NOT_CANCELLABLE");

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
                type: "RETURN",
                quantity: allocation.quantity,
                warehouse: allocation.inventory.warehouse,
                balanceAfter: inventory.quantity,
                reason: "Hoàn kho do quản trị viên hủy đơn",
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
            type: "RETURN",
            quantity: item.quantity,
            warehouse: inventory.warehouse,
            balanceAfter: inventory.quantity + item.quantity,
            reason: "Hoàn kho do quản trị viên hủy đơn",
            reference: order.orderCode,
          },
        });
      }

      await tx.payment.updateMany({
        where: { orderId: id, status: "PENDING" },
        data: { status: "FAILED" },
      });
      return tx.order.update({
        where: { id },
        data: {
          status: "CANCELLED",
          cancelReason: input.cancelReason,
          refundAmount: input.refundAmount,
        },
        include: orderInclude,
      });
    });
  },

  findActiveReturnRequest(orderId: number, userId: number) {
    return prisma.returnRequest.findFirst({ where: { orderId, userId, status: { in: ["REQUESTED", "REVIEWING", "APPROVED"] } } });
  },

  createReturnRequest(orderId: number, userId: number, input: CreateReturnRequestInput) {
    return prisma.returnRequest.create({ data: { orderId, userId, ...input } });
  },

  listReturnRequests() {
    return prisma.returnRequest.findMany({ include: { user: { select: { id: true, fullName: true, email: true, phone: true } }, order: { select: { id: true, orderCode: true, totalAmount: true, status: true } } }, orderBy: { createdAt: "desc" } });
  },

  findReturnRequest(id: number) {
    return prisma.returnRequest.findUnique({ where: { id } });
  },

  updateReturnRequest(id: number, input: UpdateReturnRequestInput) {
    return prisma.returnRequest.update({ where: { id }, data: input, include: { user: { select: { id: true, fullName: true, email: true, phone: true } }, order: { select: { id: true, orderCode: true, totalAmount: true, status: true } } } });
  },

  async completeReturnRequest(id: number, input: UpdateReturnRequestInput) {
    return prisma.$transaction(async (tx) => {
      const request = await tx.returnRequest.findFirst({
        where: { id, status: "APPROVED" },
        include: {
          order: {
            include: {
              items: { include: { allocations: { include: { inventory: true } } } },
              payments: true,
            },
          },
        },
      });
      if (!request) throw new Error("RETURN_REQUEST_NOT_APPROVED");

      const completed = await tx.returnRequest.updateMany({
        where: { id, status: "APPROVED" },
        data: { status: "COMPLETED", resolutionNote: input.resolutionNote, processedAt: new Date() },
      });
      if (completed.count !== 1) throw new Error("RETURN_REQUEST_ALREADY_PROCESSED");

      if (request.type === "RETURN") {
        for (const item of request.order.items) {
          for (const allocation of item.allocations) {
            const inventory = await tx.inventory.update({
              where: { id: allocation.inventoryId },
              data: { quantity: { increment: allocation.quantity } },
            });
            await tx.stockMovement.create({
              data: {
                productId: item.productId,
                type: "RETURN",
                quantity: allocation.quantity,
                warehouse: allocation.inventory.warehouse,
                balanceAfter: inventory.quantity,
                reason: "Hoàn kho theo yêu cầu trả hàng",
                reference: request.order.orderCode,
              },
            });
          }
        }
      }

      if (request.type === "RETURN" || request.type === "REFUND") {
        await tx.payment.updateMany({
          where: { orderId: request.orderId, status: "PAID" },
          data: { status: "REFUNDED" },
        });
        await tx.order.update({
          where: { id: request.orderId },
          data: { refundAmount: request.order.totalAmount },
        });
      }

      return tx.returnRequest.findUniqueOrThrow({
        where: { id },
        include: { user: { select: { id: true, fullName: true, email: true, phone: true } }, order: { select: { id: true, orderCode: true, totalAmount: true, status: true } } },
      });
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

  findTrackableOrder(code: string) {
    return prisma.order.findFirst({
      where: {
        OR: [
          { orderCode: { equals: code, mode: "insensitive" } },
          { shipment: { is: { trackingCode: { equals: code, mode: "insensitive" } } } },
        ],
      },
      select: {
        id: true,
        orderCode: true,
        status: true,
        totalAmount: true,
        createdAt: true,
        items: { select: { id: true, quantity: true, product: { select: { name: true, unit: true } } } },
        payments: { select: { method: true, status: true, paidAt: true }, orderBy: { id: "asc" }, take: 1 },
        shipment: { select: { status: true, carrier: true, trackingCode: true, shippedAt: true, deliveredAt: true } },
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

  async completeB2cOrder(id: number, input: UpdateOrderStatusInput) {
    return prisma.$transaction(async (tx) => {
      const order = await tx.order.update({
        where: { id },
        data: { status: input.status, cancelReason: input.cancelReason, refundAmount: input.refundAmount },
        include: orderInclude,
      });
      if (order.channel === "B2C" && order.userId) {
        const existing = await tx.loyaltyProfile.findUnique({ where: { userId: order.userId } });
        const totalSpent = Number(existing?.totalSpent ?? 0) + Number(order.totalAmount);
        const points = (existing?.points ?? 0) + Math.floor(Number(order.totalAmount) / 10_000);
        const tier = totalSpent >= 30_000_000 ? "VIP"
          : totalSpent >= 10_000_000 ? "GOLD"
            : totalSpent >= 3_000_000 ? "SILVER" : "REGULAR";
        await tx.loyaltyProfile.upsert({
          where: { userId: order.userId },
          create: { userId: order.userId, totalSpent: order.totalAmount, points: Math.floor(Number(order.totalAmount) / 10_000), orderCount: 1, tier, lastPurchaseAt: new Date() },
          update: { totalSpent, points, orderCount: { increment: 1 }, tier, lastPurchaseAt: new Date() },
        });
      }
      return order;
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
      const now = new Date();
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
              AND: [
                { OR: [{ startAt: null }, { startAt: { lte: now } }] },
                { OR: [{ endAt: null }, { endAt: { gte: now } }] },
              ],
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

        const quantityGram = item.quantity * 1000;
        const totalStock = product.inventories.reduce((total, inventory) => total + inventory.quantity, 0);
        if (totalStock < item.quantity) {
          throw new Error(`INSUFFICIENT_STOCK:${product.name}`);
        }

        let remainingQuantity = item.quantity;
        const allocations = product.inventories
          .filter((inventory) => inventory.quantity > 0)
          .map((inventory) => {
            const allocatedQuantity = Math.min(inventory.quantity, remainingQuantity);
            remainingQuantity -= allocatedQuantity;
            return { inventory, quantity: allocatedQuantity };
          })
          .filter((allocation) => allocation.quantity > 0);

        const matchedPrice = product.prices.find((price) => price.minQuantity <= item.quantity);
        const unitPrice = Number(matchedPrice?.price ?? 0);

        if (unitPrice <= 0) {
          throw new Error(`PRODUCT_PRICE_NOT_FOUND:${product.name}`);
        }

        const lineTotal = unitPrice * item.quantity;
        subtotal += lineTotal;

        orderItems.push({
          product,
          allocations,
          quantity: item.quantity,
          quantityGram,
          unitGram: 1000,
          unitPrice,
          lineTotal,
        });
      }

      const voucher = input.voucherCode
        ? await PromotionService.validateVoucher(input.voucherCode, subtotal)
        : null;
      const discountAmount = voucher?.discountAmount ?? 0;
      const totalAmount = Math.max(0, subtotal - discountAmount + input.shippingFee);
      const order = await tx.order.create({
        data: {
          orderCode: input.orderCode,
          userId: input.userId,
          promotionId: voucher?.promotion.id,
          customerName: input.customerName,
          customerPhone: input.customerPhone,
          customerEmail: input.customerEmail || undefined,
          subtotal,
          shippingFee: input.shippingFee,
          discountAmount,
          totalAmount,
          note: [input.note, `Địa chỉ giao hàng: ${input.address}`].filter(Boolean).join("\n"),
          status: "PENDING",
          items: {
            create: orderItems.map((item) => ({
              productId: item.product.id,
              quantity: item.quantity,
              unitGram: item.unitGram,
              quantityGram: item.quantityGram,
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
        const orderItem = order.items.find((createdItem) => createdItem.productId === item.product.id);
        if (!orderItem) throw new Error("ORDER_ITEM_NOT_FOUND");
        for (const allocation of item.allocations) {
          const stockUpdate = await tx.inventory.updateMany({
            where: {
              id: allocation.inventory.id,
              quantity: { gte: allocation.quantity },
            },
            data: { quantity: { decrement: allocation.quantity } },
          });
          if (stockUpdate.count !== 1) {
            throw new Error(`INSUFFICIENT_STOCK:${item.product.name}`);
          }

          await tx.stockMovement.create({
            data: {
              productId: item.product.id,
              type: "EXPORT",
              quantity: allocation.quantity,
              warehouse: allocation.inventory.warehouse,
              balanceAfter: allocation.inventory.quantity - allocation.quantity,
              reason: "Xuất kho theo đơn hàng B2C",
              reference: input.orderCode,
            },
          });
          await tx.orderItemInventoryAllocation.create({
            data: {
              orderItemId: orderItem.id,
              inventoryId: allocation.inventory.id,
              quantity: allocation.quantity,
            },
          });
        }
      }

      return order;
    });
  },
};
