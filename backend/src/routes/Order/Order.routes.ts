import { Router } from "express";
import { UserRole } from "@prisma/client";
import { orderController } from "../../controllers/Order/Order.controller.js";
import { asyncHandler } from "../../middleware/asyncHandler.js";
import { authMiddleware, authorizeRoles, optionalAuthMiddleware } from "../../middleware/authMiddleware.js";

export const orderRoutes = Router();

orderRoutes.post("/checkout", optionalAuthMiddleware, asyncHandler(orderController.checkout));
orderRoutes.get("/track", asyncHandler(orderController.trackOrder));
orderRoutes.get("/:id/payment-status", asyncHandler(orderController.getPublicPaymentStatus));

orderRoutes.post("/:id/cancel", authMiddleware, authorizeRoles(UserRole.CUSTOMER), asyncHandler(orderController.cancelCustomerOrder));
orderRoutes.post("/:id/return-requests", authMiddleware, authorizeRoles(UserRole.CUSTOMER), asyncHandler(orderController.createReturnRequest));

orderRoutes.use(authMiddleware, authorizeRoles(UserRole.ADMIN, UserRole.SALES, UserRole.ACCOUNTANT));
orderRoutes.get("/", asyncHandler(orderController.getOrders));
orderRoutes.get("/return-requests/all", asyncHandler(orderController.getReturnRequests));
orderRoutes.patch("/return-requests/:id", asyncHandler(orderController.updateReturnRequest));
orderRoutes.get("/:id", asyncHandler(orderController.getOrderById));
orderRoutes.patch("/:id/status", asyncHandler(orderController.updateOrderStatus));
orderRoutes.patch("/:id/shipment", asyncHandler(orderController.upsertShipment));
orderRoutes.patch("/payments/:id/status", asyncHandler(orderController.updatePaymentStatus));
