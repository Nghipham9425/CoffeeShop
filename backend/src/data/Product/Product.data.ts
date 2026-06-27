import type { Prisma } from "@prisma/client";
import { prisma } from "../prisma.js";
import type { ProductQueryInput } from "../../validators/Product/Product.validator.js";

function buildWhere(query: ProductQueryInput): Prisma.ProductWhereInput {
  return {
    isActive: true,
    isRetail: query.isRetail,
    isB2b: query.isB2b,
    category: query.categorySlug ? { slug: query.categorySlug } : undefined,
    OR: query.keyword
      ? [
          { name: { contains: query.keyword, mode: "insensitive" } },
          { description: { contains: query.keyword, mode: "insensitive" } },
        ]
      : undefined,
  };
}

export const productData = {
  findMany(query: ProductQueryInput = {}) {
    return prisma.product.findMany({
      where: buildWhere(query),
      include: { category: true },
      orderBy: { createdAt: "desc" },
    });
  },

  findById(id: number) {
    return prisma.product.findFirst({
      where: { id, isActive: true },
      include: { category: true },
    });
  },
};
