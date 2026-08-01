import { ReviewStatus } from "@prisma/client";
import { z } from "zod";

export const createReviewSchema = z.object({
  orderId: z.coerce.number().int().positive(),
  productId: z.coerce.number().int().positive(),
  rating: z.coerce.number().int().min(1, "Vui lòng chọn từ 1 đến 5 sao.").max(5, "Vui lòng chọn từ 1 đến 5 sao."),
  content: z.string().trim().max(1000, "Nội dung đánh giá không được vượt quá 1000 ký tự.").optional(),
});

export const updateReviewStatusSchema = z.object({
  status: z.enum([ReviewStatus.APPROVED, ReviewStatus.REJECTED]),
});

export type CreateReviewInput = z.infer<typeof createReviewSchema>;
export type UpdateReviewStatusInput = z.infer<typeof updateReviewStatusSchema>;
