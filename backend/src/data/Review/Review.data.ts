import { ReviewStatus } from "@prisma/client";
import { prisma } from "../prisma.js";
import type { CreateReviewInput, UpdateReviewStatusInput } from "../../validators/Review/Review.validator.js";

const reviewInclude = {
  user: { select: { id: true, fullName: true } },
  product: { select: { id: true, name: true } },
  order: { select: { id: true, orderCode: true, status: true } },
};

export const reviewData = {
  findApprovedByProduct(productId: number) {
    return prisma.review.findMany({
      where: { productId, status: ReviewStatus.APPROVED },
      include: reviewInclude,
      orderBy: { createdAt: "desc" },
    });
  },

  findMany() {
    return prisma.review.findMany({ include: reviewInclude, orderBy: { createdAt: "desc" } });
  },

  findEligibleOrder(userId: number, orderId: number, productId: number) {
    return prisma.order.findFirst({
      where: {
        id: orderId,
        userId,
        status: "COMPLETED",
        items: { some: { productId } },
      },
      select: { id: true },
    });
  },

  findExisting(userId: number, orderId: number, productId: number) {
    return prisma.review.findFirst({ where: { userId, orderId, productId } });
  },

  create(userId: number, input: CreateReviewInput) {
    return prisma.review.create({
      data: { ...input, userId, content: input.content || null, status: ReviewStatus.APPROVED },
      include: reviewInclude,
    });
  },

  findById(id: number) {
    return prisma.review.findUnique({ where: { id } });
  },

  updateStatus(id: number, input: UpdateReviewStatusInput) {
    return prisma.review.update({ where: { id }, data: input, include: reviewInclude });
  },
};
