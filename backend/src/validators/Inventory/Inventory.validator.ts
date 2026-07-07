import { StockMovementType } from "@prisma/client";
import { z } from "zod";

export const inventoryQuerySchema = z.object({
  keyword: z.string().trim().optional(),
  lowStock: z.coerce.boolean().optional(),
});

export const updateInventorySchema = z.object({
  quantity: z.coerce.number().int().min(0).optional(),
  minQuantity: z.coerce.number().int().min(0).optional(),
  warehouse: z.string().trim().min(1).optional(),
});

export const createStockMovementSchema = z.object({
  productId: z.coerce.number().int().positive(),
  type: z.nativeEnum(StockMovementType),
  quantity: z.coerce.number().int().positive(),
  reason: z.string().trim().optional(),
  reference: z.string().trim().optional(),
  warehouse: z.string().trim().min(1).default("Kho chinh"),
});

export type InventoryQueryInput = z.infer<typeof inventoryQuerySchema>;
export type UpdateInventoryInput = z.infer<typeof updateInventorySchema>;
export type CreateStockMovementInput = z.infer<typeof createStockMovementSchema>;
