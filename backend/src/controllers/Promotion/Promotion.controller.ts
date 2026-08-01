import { Request, Response } from 'express';
import { PromotionService } from '../../services/Promotion/Promotion.service.js';
import { createProductPriceSchema, createOrderPromotionSchema, validateVoucherSchema } from '../../validators/Promotion/Promotion.validator.js';

export const createProductPromotion = async (req: Request, res: Response) => {
  // Validate dữ liệu
  const validatedData = createProductPriceSchema.parse(req.body);
  
  const result = await PromotionService.createProductPrices({
    ...validatedData,
    createdById: req.user?.userId,
  });

  res.status(201).json({
    success: true,
    message: `Đã cập nhật giá cho ${result.length} sản phẩm`,
    data: result,
  });
};

export const createOrderPromotion = async (req: Request, res: Response) => {
  const validatedData = createOrderPromotionSchema.parse(req.body);
  try {
    const result = await PromotionService.createOrderPromotion({ ...validatedData, startAt: new Date(validatedData.startAt), endAt: new Date(validatedData.endAt) });
    res.status(201).json({ success: true, data: result });
  } catch (error) {
    if (error instanceof Error && error.message === 'VOUCHER_CODE_EXISTS') { res.status(409).json({ message: 'Mã voucher đã tồn tại.' }); return; }
    throw error;
  }
};

export const getPriceHistory = async (req: Request, res: Response) => {
  const productId = req.query.productId ? Number(req.query.productId) : undefined;
  const rows = await PromotionService.listPriceHistory(productId);
  res.json(rows.map((row) => ({ ...row, oldPrice: row.oldPrice == null ? null : Number(row.oldPrice), newPrice: Number(row.newPrice) })));
};

export const getOrderPromotions = async (_req: Request, res: Response) => {
  const rows = await PromotionService.listOrderPromotions();
  res.json(rows.map((row) => ({ ...row, discountValue: Number(row.discountValue), minOrderAmount: row.minOrderAmount == null ? null : Number(row.minOrderAmount) })));
};

export const validateVoucher = async (req: Request, res: Response) => {
  const input = validateVoucherSchema.parse(req.body);
  try {
    const result = await PromotionService.validateVoucher(input.code, input.subtotal);
    res.json({
      id: result.promotion.id,
      code: result.promotion.code,
      name: result.promotion.name,
      discountType: result.promotion.discountType,
      discountValue: Number(result.promotion.discountValue),
      discountAmount: result.discountAmount,
      totalAfterDiscount: result.totalAfterDiscount,
    });
  } catch (error) {
    if (error instanceof Error) {
      const message = error.message === 'VOUCHER_NOT_FOUND'
        ? 'Mã giảm giá không tồn tại.'
        : error.message === 'VOUCHER_INACTIVE'
          ? 'Mã giảm giá đã hết hạn hoặc chưa được kích hoạt.'
          : error.message.startsWith('VOUCHER_MIN_ORDER:')
            ? `Đơn hàng chưa đạt giá trị tối thiểu ${Number(error.message.split(':')[1]).toLocaleString('vi-VN')} đ.`
            : error.message;
      res.status(400).json({ message });
      return;
    }
    throw error;
  }
};
