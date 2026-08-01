import type { Prisma } from "@prisma/client";
import { prisma } from "../prisma.js";
import type {
  CreateProductInput,
  CreateProductPriceInput,
  ProductQueryInput,
  UpdateProductInput,
} from "../../validators/Product/Product.validator.js";

function buildWhere(query: ProductQueryInput, includeInactive = false): Prisma.ProductWhereInput {
  return {
    isActive: includeInactive ? undefined : true,
    isRetail: query.isRetail,
    isB2b: query.isB2b,
    category: includeInactive
      ? query.categorySlug
        ? { slug: query.categorySlug }
        : undefined
      : { isActive: true, ...(query.categorySlug ? { slug: query.categorySlug } : {}) },
    OR: query.keyword
      ? [
          { name: { contains: query.keyword, mode: "insensitive" } },
          { description: { contains: query.keyword, mode: "insensitive" } },
        ]
      : undefined,
  };
}

export const productData = {
  findMany(query: ProductQueryInput = {}, includeInactive = false) {
    return prisma.product.findMany({
      where: buildWhere(query, includeInactive),
      include: {
        category: true,
        prices: {
          where: { isActive: true },
          orderBy: [{ priceType: "asc" }, { minQuantity: "asc" }],
        },
        inventories: true,
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
        inventories: true,
      },
    });
  },

  findAnyById(id: number) {
    return prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        prices: { orderBy: [{ priceType: "asc" }, { minQuantity: "asc" }] },
        inventories: true,
      },
    });
  },

  create(data: CreateProductInput & { slug: string }) {
    return prisma.product.create({
      data: {
        ...data,
        inventories: { create: { warehouse: "Kho thành phẩm", quantity: 0, minQuantity: 0 } },
      },
      include: {
        category: true,
        prices: true,
        inventories: true,
      },
    });
  },

  update(id: number, data: UpdateProductInput & { slug?: string }, createdById?: number) {
    return prisma.$transaction(async (tx) => {
      const current = await tx.product.findUniqueOrThrow({ where: { id } });
      const updated = await tx.product.update({
        where: { id },
        data,
        include: { category: true, prices: true, inventories: true },
      });

      const oldPrice = current.price === null ? null : Number(current.price);
      if (data.price !== undefined && oldPrice !== data.price) {
        await tx.priceAdjustment.create({
          data: {
            productId: id,
            createdById,
            priceType: "RETAIL",
            minQuantity: 1,
            oldPrice: current.price,
            newPrice: data.price,
          },
        });
      }

      return updated;
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
    return prisma.product.findFirst({
      where: { slug, isActive: true },
      include: {
        category: true,
        prices: {
          orderBy: [{ priceType: "asc" }, { minQuantity: "asc" }],
        },
        inventories: true,
      },
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
