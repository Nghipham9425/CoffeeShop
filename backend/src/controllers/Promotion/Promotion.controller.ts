import { Request, Response } from 'express';
import { PromotionService } from '../../services/Promotion/Promotion.service.js';
import { createProductPriceSchema, createOrderPromotionSchema } from '../../validators/Promotion/Promotion.validator.js';
import { ProductPriceType } from '@prisma/client';

export const createProductPromotion = async (req: Request, res: Response) => {
  // Validate dữ liệu
  const validatedData = createProductPriceSchema.parse(req.body);
  
  const result = await PromotionService.createProductPrices({
  ...validatedData,
  priceType: validatedData.priceType as ProductPriceType,
  startAt: new Date(validatedData.startAt),
  endAt: new Date(validatedData.endAt),
});

  res.status(201).json({
    success: true,
    message: `Đã áp dụng khuyến mãi cho ${result.length} sản phẩm`,
    data: result,
  });
};

export const createOrderPromotion = async (req: Request, res: Response) => {
  const validatedData = createOrderPromotionSchema.parse(req.body);
  const result = await PromotionService.createOrderPromotion({
    ...validatedData,
    startAt: new Date(validatedData.startAt),
    endAt: new Date(validatedData.endAt),
  });

  res.status(201).json({ success: true, data: result });
};