import { Router } from "express";
import { paymentController } from "../../controllers/Payment/Payment.controller.js";
import { asyncHandler } from "../../middleware/asyncHandler.js";

export const paymentRoutes = Router();

paymentRoutes.post("/sepay/checkout", asyncHandler(paymentController.initializeSepay));
paymentRoutes.post("/sepay/webhook", asyncHandler(paymentController.receiveSepayWebhook));
