import type { Request, Response } from "express";
import { inventoryService } from "../../services/Inventory/Inventory.service.js";
import {
  createStockMovementSchema,
  inventoryQuerySchema,
  stockMovementQuerySchema,
  updateInventorySchema,
} from "../../validators/Inventory/Inventory.validator.js";

export const inventoryController = {
  async getInventories(req: Request, res: Response) {
    res.json(await inventoryService.getInventories(inventoryQuerySchema.parse(req.query)));
  },

  async updateInventory(req: Request, res: Response) {
    const payload = updateInventorySchema.parse(req.body);
    try {
      res.json(await inventoryService.updateInventory(Number(req.params.id), payload));
    } catch (error) {
      if (error instanceof Error && error.message === "INVENTORY_NOT_FOUND") {
        res.status(404).json({ message: "Không tìm thấy tồn kho." });
        return;
      }
      throw error;
    }
  },

  async getStockMovements(req: Request, res: Response) {
    res.json(await inventoryService.getStockMovements(stockMovementQuerySchema.parse(req.query)));
  },

  async createStockMovement(req: Request, res: Response) {
    const payload = createStockMovementSchema.parse(req.body);
    try {
      res.status(201).json(await inventoryService.createStockMovement(payload));
    } catch (error) {
      if (error instanceof Error) {
        const messages: Record<string, string> = {
          PRODUCT_NOT_FOUND: "Không tìm thấy sản phẩm.",
          INSUFFICIENT_STOCK: "Số lượng xuất vượt quá tồn kho hiện tại.",
          STOCK_UNCHANGED: "Số tồn kiểm kê không thay đổi.",
        };
        if (messages[error.message]) {
          res.status(400).json({ message: messages[error.message] });
          return;
        }
      }
      throw error;
    }
  },
};
