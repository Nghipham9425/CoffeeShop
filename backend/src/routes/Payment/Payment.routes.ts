import { Router } from "express";
import { paymentController } from "../../controllers/Payment/Payment.controller.js";
import { asyncHandler } from "../../middleware/asyncHandler.js";
import { optionalAuthMiddleware } from "../../middleware/authMiddleware.js";

export const paymentRoutes = Router();

paymentRoutes.post("/sepay/checkout", optionalAuthMiddleware, asyncHandler(paymentController.initializeSepay));
