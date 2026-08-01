import { Router } from "express";
import { UserRole } from "@prisma/client";
import { reviewController } from "../../controllers/Review/Review.controller.js";
import { asyncHandler } from "../../middleware/asyncHandler.js";
import { authMiddleware, authorizeRoles } from "../../middleware/authMiddleware.js";

export const reviewRoutes = Router();

reviewRoutes.get("/products/:productId", asyncHandler(reviewController.getProductReviews));
reviewRoutes.post("/", authMiddleware, authorizeRoles(UserRole.CUSTOMER), asyncHandler(reviewController.createReview));
reviewRoutes.get("/", authMiddleware, authorizeRoles(UserRole.ADMIN), asyncHandler(reviewController.getReviews));
reviewRoutes.patch("/:id/status", authMiddleware, authorizeRoles(UserRole.ADMIN), asyncHandler(reviewController.updateReviewStatus));
