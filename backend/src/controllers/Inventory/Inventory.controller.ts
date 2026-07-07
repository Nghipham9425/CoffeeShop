import type { Request, Response } from "express";
import { inventoryService } from "../../services/Inventory/Inventory.service.js";
import {
  createStockMovementSchema,
  inventoryQuerySchema,
  updateInventorySchema,
} from "../../validators/Inventory/Inventory.validator.js";

export const inventoryController = {
  async getInventories(req: Request, res: Response) {
    const query = inventoryQuerySchema.parse(req.query);
    res.json(await inventoryService.getInventories(query));
  },

  async updateInventory(req: Request, res: Response) {
    const payload = updateInventorySchema.parse(req.body);

    try {
      res.json(await inventoryService.updateInventory(Number(req.params.id), payload));
    } catch (error) {
      if (error instanceof Error && error.message === "INVENTORY_NOT_FOUND") {
        res.status(404).json({ message: "Không tìm thấy tồn kho" });
        return;
      }

      throw error;
    }
  },

  async createStockMovement(req: Request, res: Response) {
    const payload = createStockMovementSchema.parse(req.body);
    res.status(201).json(await inventoryService.createStockMovement(payload));
  },
};
