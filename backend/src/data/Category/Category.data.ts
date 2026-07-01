import type { Prisma } from "@prisma/client";
import { prisma } from "../prisma.js";
import type {
  CategoryQueryInput,
  CreateCategoryInput,
  UpdateCategoryInput,
} from "../../validators/Category/Category.validator.js";

function buildWhere(query: CategoryQueryInput): Prisma.CategoryWhereInput {
  return {
    isActive: query.includeInactive ? undefined : true,
    OR: query.keyword
      ? [
          { name: { contains: query.keyword, mode: "insensitive" } },
          { description: { contains: query.keyword, mode: "insensitive" } },
        ]
      : undefined,
  };
}

const categoryInclude = {
  _count: {
    select: {
      products: {
        where: { isActive: true },
      },
    },
  },
} satisfies Prisma.CategoryInclude;

export const categoryData = {
  findMany(query: CategoryQueryInput) {
    return prisma.category.findMany({
      where: buildWhere(query),
      include: categoryInclude,
      orderBy: { createdAt: "desc" },
    });
  },

  findById(id: number) {
    return prisma.category.findFirst({
      where: { id },
      include: categoryInclude,
    });
  },

  findActiveById(id: number) {
    return prisma.category.findFirst({
      where: { id, isActive: true },
      include: categoryInclude,
    });
  },

  findBySlug(slug: string) {
    return prisma.category.findUnique({
      where: { slug },
    });
  },

  create(data: CreateCategoryInput & { slug: string }) {
    return prisma.category.create({
      data,
      include: categoryInclude,
    });
  },

  update(id: number, data: UpdateCategoryInput & { slug?: string }) {
    return prisma.category.update({
      where: { id },
      data,
      include: categoryInclude,
    });
  },

  softDelete(id: number) {
    return prisma.category.update({
      where: { id },
      data: { isActive: false },
      include: categoryInclude,
    });
  },
};
