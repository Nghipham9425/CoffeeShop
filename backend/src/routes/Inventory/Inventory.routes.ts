import { Router } from "express";
import { UserRole } from "@prisma/client";
import { inventoryController } from "../../controllers/Inventory/Inventory.controller.js";
import { asyncHandler } from "../../middleware/asyncHandler.js";
import { authMiddleware, authorizeRoles } from "../../middleware/authMiddleware.js";

export const inventoryRoutes = Router();

inventoryRoutes.use(authMiddleware, authorizeRoles(UserRole.ADMIN, UserRole.WAREHOUSE, UserRole.SALES));
inventoryRoutes.get("/", asyncHandler(inventoryController.getInventories));
inventoryRoutes.patch("/:id", asyncHandler(inventoryController.updateInventory));
inventoryRoutes.post("/movements", asyncHandler(inventoryController.createStockMovement));
