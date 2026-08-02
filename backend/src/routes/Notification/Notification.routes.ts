import { Router } from "express";
import { notificationController } from "../../controllers/Notification/Notification.controller.js";
import { asyncHandler } from "../../middleware/asyncHandler.js";
import { authMiddleware } from "../../middleware/authMiddleware.js";

export const notificationRoutes = Router();
notificationRoutes.use(authMiddleware);
notificationRoutes.get("/me", asyncHandler(notificationController.listMine));
notificationRoutes.patch("/:id/read", asyncHandler(notificationController.markRead));
notificationRoutes.patch("/read-all", asyncHandler(notificationController.markAllRead));
