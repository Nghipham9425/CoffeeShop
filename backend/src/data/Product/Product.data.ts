import type { Prisma } from "@prisma/client";
import { prisma } from "../prisma.js";
import type {
  CreateProductInput,
  CreateProductPriceInput,
  ProductQueryInput,
  UpdateProductInput,
} from "../../validators/Product/Product.validator.js";

const defaultWarehouse = "Kho thành phẩm";

function buildWhere(query: ProductQueryInput, includeInactive = false): Prisma.ProductWhereInput {
  return {
    isActive: includeInactive ? undefined : true,
    isRetail: query.isRetail,
    isB2b: query.isB2b,
    category: includeInactive
      ? query.categorySlug ? { slug: query.categorySlug } : undefined
      : { isActive: true, ...(query.categorySlug ? { slug: query.categorySlug } : {}) },
    OR: query.keyword
      ? [{ name: { contains: query.keyword, mode: "insensitive" } }, { description: { contains: query.keyword, mode: "insensitive" } }]
      : undefined,
  };
}

const productInclude = {
  category: true,
  prices: { orderBy: [{ priceType: "asc" }, { minQuantity: "asc" }] },
  inventories: { where: { warehouse: "Kho thành phẩm" }, take: 1 },
} satisfies Prisma.ProductInclude;

export const productData = {
  findMany(query: ProductQueryInput = {}, includeInactive = false) {
    return prisma.product.findMany({ where: buildWhere(query, includeInactive), include: productInclude, orderBy: { createdAt: "desc" } });
  },

  findById(id: number) {
    return prisma.product.findFirst({ where: { id, isActive: true }, include: productInclude });
  },

  findAnyById(id: number) {
    return prisma.product.findUnique({ where: { id }, include: productInclude });
  },

  findBySlug(slug: string) {
    return prisma.product.findFirst({ where: { slug, isActive: true }, include: productInclude });
  },

  create(data: CreateProductInput & { slug: string }) {
    const { price, ...productInput } = data;
    return prisma.product.create({
      data: {
        ...productInput,
        inventories: { create: { warehouse: defaultWarehouse, quantity: 0, minQuantity: 0 } },
        ...(price === undefined ? {} : { prices: { create: { priceType: "RETAIL", minQuantity: 1, unitGram: productInput.retailUnitGram, price } } }),
      },
      include: productInclude,
    });
  },

  update(id: number, data: UpdateProductInput & { slug?: string }, createdById?: number) {
    return prisma.$transaction(async (tx) => {
      const { price, ...productInput } = data;
      const currentPrice = price === undefined ? null : await tx.productPrice.findUnique({ where: { productId_priceType_minQuantity: { productId: id, priceType: "RETAIL", minQuantity: 1 } } });
      const updated = await tx.product.update({ where: { id }, data: productInput, include: productInclude });
      if (price !== undefined && Number(currentPrice?.price ?? -1) !== price) {
        await tx.productPrice.upsert({
          where: { productId_priceType_minQuantity: { productId: id, priceType: "RETAIL", minQuantity: 1 } },
          update: { price, unitGram: updated.retailUnitGram, isActive: true, startAt: null, endAt: null },
          create: { productId: id, priceType: "RETAIL", minQuantity: 1, unitGram: updated.retailUnitGram, price },
        });
        await tx.priceAdjustment.create({ data: { productId: id, createdById, priceType: "RETAIL", minQuantity: 1, oldPrice: currentPrice?.price ?? null, newPrice: price } });
      }
      return updated;
    });
  },

  softDelete(id: number) {
    return prisma.product.update({ where: { id }, data: { isActive: false } });
  },

  findCategoryById(id: number) {
    return prisma.category.findFirst({ where: { id, isActive: true } });
  },

  upsertPrice(productId: number, input: CreateProductPriceInput & { unitGram: number }, createdById?: number) {
    return prisma.$transaction(async (tx) => {
      const where = { productId_priceType_minQuantity: { productId, priceType: input.priceType, minQuantity: input.minQuantity } };
      const current = await tx.productPrice.findUnique({ where });
      const price = await tx.productPrice.upsert({
        where,
        update: { price: input.price, unitGram: input.unitGram, startAt: input.startAt, endAt: input.endAt, isActive: input.isActive },
        create: { productId, ...input },
      });
      const changed = !current || Number(current.price) !== input.price || current.unitGram !== input.unitGram || current.startAt?.getTime() !== input.startAt?.getTime() || current.endAt?.getTime() !== input.endAt?.getTime() || current.isActive !== input.isActive;
      if (changed) {
        await tx.priceAdjustment.create({ data: { productId, createdById, priceType: input.priceType, minQuantity: input.minQuantity, oldPrice: current?.price ?? null, newPrice: input.price, startAt: input.startAt, endAt: input.endAt } });
      }
      return price;
    });
  },

  findPriceHistory(productId: number) {
    return prisma.priceAdjustment.findMany({ where: { productId }, include: { createdBy: { select: { id: true, fullName: true } } }, orderBy: { createdAt: "desc" }, take: 200 });
  },

  findByIds(ids: number[]) {
    return prisma.product.findMany({ where: { id: { in: ids }, isActive: true }, include: productInclude });
  },
};
