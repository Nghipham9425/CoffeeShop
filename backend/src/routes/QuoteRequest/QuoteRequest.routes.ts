import { Router } from "express";
import { UserRole } from "@prisma/client";
import { quoteRequestController } from "../../controllers/QuoteRequest/QuoteRequest.controller.js";
import { asyncHandler } from "../../middleware/asyncHandler.js";
import { authMiddleware, authorizeRoles } from "../../middleware/authMiddleware.js";

export const quoteRequestRoutes = Router();

quoteRequestRoutes.post("/", asyncHandler(quoteRequestController.createQuoteRequest));
quoteRequestRoutes.get(
  "/",
  authMiddleware,
  authorizeRoles(UserRole.ADMIN, UserRole.SALES),
  asyncHandler(quoteRequestController.getQuoteRequests),
);
