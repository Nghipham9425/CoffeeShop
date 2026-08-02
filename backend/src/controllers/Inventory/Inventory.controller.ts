import type { Request, Response } from "express";
import { inventoryService } from "../../services/Inventory/Inventory.service.js";
import {
  createStockMovementSchema,
  inventoryQuerySchema,
  stockMovementQuerySchema,
  updateInventoryThresholdSchema,
} from "../../validators/Inventory/Inventory.validator.js";

export const inventoryController = {
  async getInventories(req: Request, res: Response) {
    res.json(await inventoryService.getInventories(inventoryQuerySchema.parse(req.query)));
  },

  async updateThreshold(req: Request, res: Response) {
    try {
      res.json(await inventoryService.updateThreshold(Number(req.params.productId), updateInventoryThresholdSchema.parse(req.body)));
    } catch (error) {
      handleInventoryError(error, res);
    }
  },

  async getStockMovements(req: Request, res: Response) {
    res.json(await inventoryService.getStockMovements(stockMovementQuerySchema.parse(req.query)));
  },

  async createStockMovement(req: Request, res: Response) {
    try {
      res.status(201).json(await inventoryService.createStockMovement(createStockMovementSchema.parse(req.body)));
    } catch (error) {
      handleInventoryError(error, res);
    }
  },
};

function handleInventoryError(error: unknown, res: Response) {
  if (!(error instanceof Error)) throw error;
  const messages: Record<string, string> = {
    PRODUCT_NOT_FOUND: "Không tìm thấy sản phẩm.",
    INSUFFICIENT_STOCK: "Số lượng xuất vượt quá tồn kho hiện tại.",
    STOCK_UNCHANGED: "Số tồn kiểm kê không thay đổi.",
  };
  const message = messages[error.message];
  if (message) {
    res.status(error.message === "PRODUCT_NOT_FOUND" ? 404 : 400).json({ message });
    return;
  }
  throw error;
}
