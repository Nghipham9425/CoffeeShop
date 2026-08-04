import { prisma } from '../../data/prisma.js';
import { DiscountType, PromotionStatus, UserRole } from '@prisma/client';

export class PromotionService {
  static async createProductPrices(data: {
    productIds: number[];
    price: number;
    createdById?: number;
  }) {
    const { productIds, price, createdById } = data;

    return prisma.$transaction(async (tx) => {
      const result = [];
      for (const productId of productIds) {
        const current = await tx.product.findFirst({ where: { id: productId, isActive: true } });
        if (!current) throw new Error('PRODUCT_NOT_FOUND');
        const updated = await tx.product.update({ where: { id: productId }, data: { price } });
        if (Number(current.price) !== price) {
          await tx.priceAdjustment.create({ data: { productId, createdById, priceType: 'RETAIL', minQuantity: 1, oldPrice: current.price, newPrice: price } });
        }
        result.push(updated);
      }
      return result;
    });
  }

  static async createOrderPromotion(data: any, actor: { id: number; role: UserRole }) {
    if (await prisma.promotion.findFirst({ where: { code: { equals: data.code, mode: 'insensitive' } } })) throw new Error('VOUCHER_CODE_EXISTS');
    const createdByAdmin = actor.role === UserRole.ADMIN;
    return await prisma.promotion.create({
      data: {
        ...data,
        status: createdByAdmin ? PromotionStatus.ACTIVE : PromotionStatus.DRAFT,
        createdById: actor.id,
        approvedById: createdByAdmin ? actor.id : undefined,
        approvedAt: createdByAdmin ? new Date() : undefined,
      },
      include: { createdBy: { select: { id: true, fullName: true } }, approvedBy: { select: { id: true, fullName: true } }, _count: { select: { orders: true } } },
    });
  }

  static async validateVoucher(code: string, subtotal: number) {
    const promotion = await prisma.promotion.findFirst({
      where: { code: { equals: code.trim(), mode: 'insensitive' } },
    });
    if (!promotion) throw new Error('VOUCHER_NOT_FOUND');

    const now = new Date();
    if (promotion.status !== PromotionStatus.ACTIVE || promotion.startAt > now || promotion.endAt < now) {
      throw new Error('VOUCHER_INACTIVE');
    }

    const minimum = Number(promotion.minOrderAmount ?? 0);
    if (subtotal < minimum) throw new Error(`VOUCHER_MIN_ORDER:${minimum}`);

    const value = Number(promotion.discountValue);
    const rawDiscount = promotion.discountType === DiscountType.PERCENT ? subtotal * value / 100 : value;
    const discountAmount = Math.max(0, Math.min(subtotal, rawDiscount));
    return {
      promotion,
      discountAmount,
      totalAfterDiscount: subtotal - discountAmount,
    };
  }

  static listPriceHistory(productId?: number) {
    return prisma.priceAdjustment.findMany({
      where: { productId },
      include: { product: { select: { id: true, name: true } }, createdBy: { select: { id: true, fullName: true } } },
      orderBy: { createdAt: 'desc' },
      take: 200,
    });
  }

  static listOrderPromotions() {
    return prisma.promotion.findMany({ orderBy: { createdAt: 'desc' }, include: { _count: { select: { orders: true } }, createdBy: { select: { id: true, fullName: true } }, approvedBy: { select: { id: true, fullName: true } } } });
  }

  static async approveOrderPromotion(id: number, approvedById: number) {
    const promotion = await prisma.promotion.findUnique({ where: { id } });
    if (!promotion) throw new Error('VOUCHER_NOT_FOUND');
    if (promotion.status !== PromotionStatus.DRAFT) throw new Error('VOUCHER_NOT_DRAFT');
    if (promotion.endAt < new Date()) throw new Error('VOUCHER_EXPIRED');
    return prisma.promotion.update({
      where: { id },
      data: { status: PromotionStatus.ACTIVE, approvedById, approvedAt: new Date() },
      include: { _count: { select: { orders: true } }, createdBy: { select: { id: true, fullName: true } }, approvedBy: { select: { id: true, fullName: true } } },
    });
  }

  static async updateOrderPromotionStatus(id: number, status: 'ACTIVE' | 'DISABLED') {
    const promotion = await prisma.promotion.findUnique({ where: { id } });
    if (!promotion) throw new Error('VOUCHER_NOT_FOUND');
    if (promotion.endAt < new Date()) throw new Error('VOUCHER_EXPIRED');

    return prisma.promotion.update({ where: { id }, data: { status } });
  }

  static async deleteUnusedOrderPromotion(id: number) {
    const promotion = await prisma.promotion.findUnique({ where: { id }, include: { _count: { select: { orders: true } } } });
    if (!promotion) throw new Error('VOUCHER_NOT_FOUND');
    if (promotion._count.orders > 0) throw new Error('VOUCHER_ALREADY_USED');

    await prisma.promotion.delete({ where: { id } });
  }
}
