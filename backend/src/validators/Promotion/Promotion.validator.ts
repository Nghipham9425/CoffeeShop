import { z } from 'zod';
import { DiscountType } from '@prisma/client';

export const createProductPriceSchema = z.object({
  productIds: z.array(z.number()).min(1, 'Vui lòng chọn ít nhất 1 sản phẩm'),
  price: z.number().min(0, 'Giá sản phẩm không hợp lệ'),
});

export const createOrderPromotionSchema = z.object({
  name: z.string().min(3, 'Tên khuyến mãi quá ngắn'),
  code: z.string().trim().min(3, 'Mã voucher phải có ít nhất 3 ký tự').max(50).transform((value) => value.toUpperCase()),
  discountType: z.nativeEnum(DiscountType),
  discountValue: z.number().positive('Mức giảm phải lớn hơn 0'),
  minOrderAmount: z.number().min(0).optional(),
  startAt: z.string().datetime(),
  endAt: z.string().datetime(),
}).superRefine((data, context) => {
  if (new Date(data.endAt) <= new Date(data.startAt)) context.addIssue({ code: 'custom', path: ['endAt'], message: 'Thời gian kết thúc phải sau thời gian bắt đầu' });
  if (data.discountType === DiscountType.PERCENT && data.discountValue > 100) context.addIssue({ code: 'custom', path: ['discountValue'], message: 'Mức giảm phần trăm không được vượt quá 100%' });
});

export const validateVoucherSchema = z.object({
  code: z.string().trim().min(1, 'Vui lòng nhập mã giảm giá').transform((value) => value.toUpperCase()),
  subtotal: z.coerce.number().positive('Giỏ hàng phải có sản phẩm'),
});
