import type { Request, Response } from "express";
import { reviewService } from "../../services/Review/Review.service.js";
import { createReviewSchema, updateReviewStatusSchema } from "../../validators/Review/Review.validator.js";

export const reviewController = {
  async getProductReviews(req: Request, res: Response) {
    res.json(await reviewService.getApprovedByProduct(Number(req.params.productId)));
  },

  async getReviews(_req: Request, res: Response) {
    res.json(await reviewService.getReviews());
  },

  async createReview(req: Request, res: Response) {
    try {
      const review = await reviewService.createReview(req.user!.userId, createReviewSchema.parse(req.body));
      res.status(201).json(review);
    } catch (error) {
      if (error instanceof Error && error.message === "REVIEW_ORDER_NOT_ELIGIBLE") {
        res.status(403).json({ message: "Bạn chỉ có thể đánh giá sản phẩm thuộc đơn hàng đã hoàn tất." });
        return;
      }
      if (error instanceof Error && error.message === "REVIEW_ALREADY_EXISTS") {
        res.status(409).json({ message: "Sản phẩm này đã được đánh giá trong đơn hàng." });
        return;
      }
      throw error;
    }
  },

  async updateReviewStatus(req: Request, res: Response) {
    try {
      res.json(await reviewService.updateStatus(Number(req.params.id), updateReviewStatusSchema.parse(req.body)));
    } catch (error) {
      if (error instanceof Error && error.message === "REVIEW_NOT_FOUND") {
        res.status(404).json({ message: "Không tìm thấy đánh giá." });
        return;
      }
      throw error;
    }
  },
};
