import { Router } from "express";
import { UserRole } from "@prisma/client";
import { orderController } from "../../controllers/Order/Order.controller.js";
import { asyncHandler } from "../../middleware/asyncHandler.js";
import { authMiddleware, authorizeRoles, optionalAuthMiddleware } from "../../middleware/authMiddleware.js";

export const orderRoutes = Router();

orderRoutes.post("/checkout", optionalAuthMiddleware, asyncHandler(orderController.checkout));
orderRoutes.get("/track", asyncHandler(orderController.trackOrder));
orderRoutes.get("/:id/payment-status", asyncHandler(orderController.getPublicPaymentStatus));

orderRoutes.use(authMiddleware, authorizeRoles(UserRole.ADMIN, UserRole.SALES, UserRole.ACCOUNTANT));
orderRoutes.get("/", asyncHandler(orderController.getOrders));
orderRoutes.get("/:id", asyncHandler(orderController.getOrderById));
orderRoutes.patch("/:id/status", asyncHandler(orderController.updateOrderStatus));
orderRoutes.patch("/:id/shipment", asyncHandler(orderController.upsertShipment));
orderRoutes.patch("/payments/:id/status", asyncHandler(orderController.updatePaymentStatus));
