import { Router } from "express";
import { UserRole } from "@prisma/client";
import { quoteRequestController } from "../../controllers/QuoteRequest/QuoteRequest.controller.js";
import { asyncHandler } from "../../middleware/asyncHandler.js";
import { authMiddleware, authorizeRoles, optionalAuthMiddleware } from "../../middleware/authMiddleware.js";

export const quoteRequestRoutes = Router();

quoteRequestRoutes.post("/", optionalAuthMiddleware, asyncHandler(quoteRequestController.createQuoteRequest));
quoteRequestRoutes.get("/public/:id", asyncHandler(quoteRequestController.getPublicQuote));
quoteRequestRoutes.post("/public/:id/respond", asyncHandler(quoteRequestController.respondQuotation));
quoteRequestRoutes.post("/mine/:id/respond", authMiddleware, asyncHandler(quoteRequestController.respondQuotationForUser));
quoteRequestRoutes.get(
  "/",
  authMiddleware,
  authorizeRoles(UserRole.ADMIN, UserRole.SALES),
  asyncHandler(quoteRequestController.getQuoteRequests),
);
quoteRequestRoutes.get(
  "/:id",
  authMiddleware,
  authorizeRoles(UserRole.ADMIN, UserRole.SALES),
  asyncHandler(quoteRequestController.getQuoteRequestById),
);
quoteRequestRoutes.patch(
  "/:id/status",
  authMiddleware,
  authorizeRoles(UserRole.ADMIN, UserRole.SALES),
  asyncHandler(quoteRequestController.updateQuoteRequestStatus),
);
quoteRequestRoutes.put("/:id/quotation", authMiddleware, authorizeRoles(UserRole.ADMIN, UserRole.SALES), asyncHandler(quoteRequestController.createQuotation));
quoteRequestRoutes.post("/:id/convert", authMiddleware, authorizeRoles(UserRole.ADMIN, UserRole.SALES), asyncHandler(quoteRequestController.convertQuotation));
