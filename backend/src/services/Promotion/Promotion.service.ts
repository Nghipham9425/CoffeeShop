import { prisma } from '../../data/prisma.js';
import { ProductPriceType, DiscountType } from '@prisma/client';

export class PromotionService {
  static async createProductPrices(data: {
    productIds: number[];
    priceType: ProductPriceType;
    price: number;
    minQuantity: number;
    startAt: Date;
    endAt: Date;
  }) {
    const { productIds, priceType, price, minQuantity, startAt, endAt } = data;

    const result = await prisma.$transaction(
      productIds.map((productId) =>
        prisma.productPrice.upsert({
          where: {
            productId_priceType_minQuantity: {
              productId,
              priceType,
              minQuantity
            }
          },
          update: {
            price,
            startAt,
            endAt,
            isActive: true,
            updatedAt: new Date()
          },
          create: {
            productId,
            priceType,
            price,
            minQuantity,
            startAt,
            endAt,
            isActive: true
          },
        })
      )
    );
    return result;
  }

  static async createOrderPromotion(data: any) {
    return await prisma.promotion.create({
      data: {
        ...data,
        status: 'ACTIVE',
      },
    });
  }
}