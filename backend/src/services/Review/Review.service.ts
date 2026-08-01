import { reviewData } from "../../data/Review/Review.data.js";
import type { CreateReviewInput, UpdateReviewStatusInput } from "../../validators/Review/Review.validator.js";

function mapReview(review: Awaited<ReturnType<typeof reviewData.create>>) {
  return {
    id: review.id,
    rating: review.rating,
    content: review.content,
    status: review.status,
    createdAt: review.createdAt,
    user: review.user,
    product: review.product,
    order: review.order,
  };
}

export const reviewService = {
  async getApprovedByProduct(productId: number) {
    return (await reviewData.findApprovedByProduct(productId)).map(mapReview);
  },

  async getReviews() {
    return (await reviewData.findMany()).map(mapReview);
  },

  async createReview(userId: number, input: CreateReviewInput) {
    const eligibleOrder = await reviewData.findEligibleOrder(userId, input.orderId, input.productId);
    if (!eligibleOrder) throw new Error("REVIEW_ORDER_NOT_ELIGIBLE");
    if (await reviewData.findExisting(userId, input.orderId, input.productId)) {
      throw new Error("REVIEW_ALREADY_EXISTS");
    }
    return mapReview(await reviewData.create(userId, input));
  },

  async updateStatus(id: number, input: UpdateReviewStatusInput) {
    if (!(await reviewData.findById(id))) throw new Error("REVIEW_NOT_FOUND");
    return mapReview(await reviewData.updateStatus(id, input));
  },
};
