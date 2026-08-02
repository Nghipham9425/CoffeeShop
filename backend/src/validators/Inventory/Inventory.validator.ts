import { StockMovementType } from "@prisma/client";
import { z } from "zod";

export const inventoryQuerySchema = z.object({
  keyword: z.string().trim().optional(),
  lowStock: z.coerce.boolean().optional(),
});

export const stockMovementQuerySchema = z.object({
  productId: z.coerce.number().int().positive().optional(),
  type: z.nativeEnum(StockMovementType).optional(),
});

export const updateInventoryThresholdSchema = z.object({
  minQuantity: z.coerce.number().min(0, "Ngưỡng cảnh báo không được âm."),
});

export const createStockMovementSchema = z.object({
  productId: z.coerce.number().int().positive("Sản phẩm không hợp lệ."),
  type: z.enum([StockMovementType.IMPORT, StockMovementType.EXPORT, StockMovementType.ADJUSTMENT]),
  quantity: z.coerce.number().positive("Số lượng phải lớn hơn 0."),
  reason: z.string().trim().min(2, "Vui lòng nhập lý do.").max(250),
  reference: z.string().trim().max(100).optional(),
});

export type InventoryQueryInput = z.infer<typeof inventoryQuerySchema>;
export type StockMovementQueryInput = z.infer<typeof stockMovementQuerySchema>;
export type UpdateInventoryThresholdInput = z.infer<typeof updateInventoryThresholdSchema>;
export type CreateStockMovementInput = z.infer<typeof createStockMovementSchema>;
