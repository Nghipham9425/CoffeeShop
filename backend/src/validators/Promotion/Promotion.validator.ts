import { z } from 'zod';
import { ProductPriceType, DiscountType } from '@prisma/client';

export const createProductPriceSchema = z.object({
  productIds: z.array(z.number()).min(1, 'Vui lòng chọn ít nhất 1 sản phẩm'),
  priceType: z.nativeEnum(ProductPriceType, {
    message: 'Kênh áp dụng (priceType) không hợp lệ so với Database'
  }),
  price: z.number().min(0, 'Giá khuyến mãi không hợp lệ'),
  minQuantity: z.number().min(1).default(1),
  startAt: z.string().datetime(),
  endAt: z.string().datetime(),
});

export const createOrderPromotionSchema = z.object({
  name: z.string().min(3, 'Tên khuyến mãi quá ngắn'),
  code: z.string().optional(),
  discountType: z.enum(['PERCENTAGE', 'FIXED_AMOUNT']),
  discountValue: z.number().min(0),
  minOrderAmount: z.number().min(0).optional(),
  startAt: z.string().datetime(),
  endAt: z.string().datetime(),
});