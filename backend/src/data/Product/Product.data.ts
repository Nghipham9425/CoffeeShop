import type { Prisma } from "@prisma/client";
import { prisma } from "../prisma.js";
import type {
  CreateProductInput,
  CreateProductPriceInput,
  ProductQueryInput,
  UpdateProductInput,
} from "../../validators/Product/Product.validator.js";

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
      include: {
        category: true,
        prices: {
          where: { isActive: true },
          orderBy: [{ priceType: "asc" }, { minQuantity: "asc" }],
        },
      },
      orderBy: { createdAt: "desc" },
    });
  },

  findById(id: number) {
    return prisma.product.findFirst({
      where: { id, isActive: true },
      include: {
        category: true,
        prices: {
          orderBy: [{ priceType: "asc" }, { minQuantity: "asc" }],
        },
      },
    });
  },

  create(data: CreateProductInput & { slug: string }) {
    return prisma.product.create({
      data,
      include: {
        category: true,
        prices: true,
      },
    });
  },

  update(id: number, data: UpdateProductInput & { slug?: string }) {
    return prisma.product.update({
      where: { id },
      data,
      include: {
        category: true,
        prices: true,
      },
    });
  },

  softDelete(id: number) {
    return prisma.product.update({
      where: { id },
      data: { isActive: false },
    });
  },

  findCategoryById(id: number) {
    return prisma.category.findFirst({
      where: { id, isActive: true },
    });
  },

  findBySlug(slug: string) {
    return prisma.product.findUnique({
      where: { slug },
    });
  },

  upsertPrice(productId: number, input: CreateProductPriceInput) {
    return prisma.productPrice.upsert({
      where: {
        productId_priceType_minQuantity: {
          productId,
          priceType: input.priceType,
          minQuantity: input.minQuantity,
        },
      },
      update: {
        price: input.price,
        startAt: input.startAt,
        endAt: input.endAt,
        isActive: input.isActive,
      },
      create: {
        productId,
        ...input,
      },
    });
  },
};
