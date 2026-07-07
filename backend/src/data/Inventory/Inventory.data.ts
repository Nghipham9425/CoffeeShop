import type { Prisma } from "@prisma/client";
import { prisma } from "../prisma.js";
import type {
  CreateStockMovementInput,
  InventoryQueryInput,
  UpdateInventoryInput,
} from "../../validators/Inventory/Inventory.validator.js";

const inventoryInclude = {
  product: { include: { category: true } },
} satisfies Prisma.InventoryInclude;

function buildWhere(query: InventoryQueryInput): Prisma.InventoryWhereInput {
  return {
    product: query.keyword
      ? {
          OR: [
            { name: { contains: query.keyword, mode: "insensitive" } },
            { slug: { contains: query.keyword, mode: "insensitive" } },
          ],
        }
      : undefined,
  };
}

export const inventoryData = {
  findMany(query: InventoryQueryInput) {
    return prisma.inventory.findMany({
      where: buildWhere(query),
      include: inventoryInclude,
      orderBy: [{ quantity: "asc" }, { updatedAt: "desc" }],
    });
  },

  findById(id: number) {
    return prisma.inventory.findUnique({
      where: { id },
      include: inventoryInclude,
    });
  },

  update(id: number, input: UpdateInventoryInput) {
    return prisma.inventory.update({
      where: { id },
      data: input,
      include: inventoryInclude,
    });
  },

  async createMovement(input: CreateStockMovementInput) {
    const multiplier = input.type === "EXPORT" ? -1 : 1;

    return prisma.$transaction(async (tx) => {
      const movement = await tx.stockMovement.create({
        data: {
          productId: input.productId,
          type: input.type,
          quantity: input.quantity,
          reason: input.reason,
          reference: input.reference,
        },
      });

      const inventory = await tx.inventory.upsert({
        where: {
          productId_warehouse: {
            productId: input.productId,
            warehouse: input.warehouse,
          },
        },
        create: {
          productId: input.productId,
          warehouse: input.warehouse,
          quantity: input.type === "EXPORT" ? 0 : input.quantity,
          minQuantity: 0,
        },
        update: {
          quantity: {
            increment: input.type === "ADJUSTMENT" ? input.quantity : input.quantity * multiplier,
          },
        },
        include: inventoryInclude,
      });

      return { movement, inventory };
    });
  },
};
