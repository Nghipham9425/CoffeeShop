import type { Prisma } from "@prisma/client";
import { prisma } from "../prisma.js";
import type {
  CreateStockMovementInput,
  InventoryQueryInput,
  StockMovementQueryInput,
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
    return prisma.inventory.findUnique({ where: { id }, include: inventoryInclude });
  },

  update(id: number, input: UpdateInventoryInput) {
    return prisma.$transaction(async (tx) => {
      const current = await tx.inventory.findUniqueOrThrow({ where: { id } });
      const updated = await tx.inventory.update({ where: { id }, data: input, include: inventoryInclude });

      if (input.quantity !== undefined && input.quantity !== current.quantity) {
        await tx.stockMovement.create({
          data: {
            productId: current.productId,
            type: "ADJUSTMENT",
            quantity: Math.abs(input.quantity - current.quantity),
            warehouse: current.warehouse,
            balanceAfter: input.quantity,
            reason: "Điều chỉnh tồn trực tiếp",
          },
        });
      }
      return updated;
    });
  },

  findMovements(query: StockMovementQueryInput) {
    return prisma.stockMovement.findMany({
      where: {
        productId: query.productId,
        warehouse: query.warehouse || undefined,
        type: query.type,
      },
      include: { product: { select: { id: true, name: true } } },
      orderBy: { createdAt: "desc" },
      take: 500,
    });
  },

  async createMovement(input: CreateStockMovementInput) {
    return prisma.$transaction(async (tx) => {
      const product = await tx.product.findFirst({
        where: { id: input.productId, isActive: true },
        select: { id: true },
      });
      if (!product) throw new Error("PRODUCT_NOT_FOUND");

      const current = await tx.inventory.findUnique({
        where: { productId_warehouse: { productId: input.productId, warehouse: input.warehouse } },
      });
      const currentQuantity = current?.quantity ?? 0;
      let nextQuantity = currentQuantity;
      let movementQuantity = input.quantity;

      if (input.type === "EXPORT") {
        if (currentQuantity < input.quantity) throw new Error("INSUFFICIENT_STOCK");
        nextQuantity = currentQuantity - input.quantity;
      } else if (input.type === "ADJUSTMENT") {
        nextQuantity = input.quantity;
        movementQuantity = Math.abs(nextQuantity - currentQuantity);
        if (movementQuantity === 0) throw new Error("STOCK_UNCHANGED");
      } else {
        nextQuantity = currentQuantity + input.quantity;
      }

      const inventory = await tx.inventory.upsert({
        where: { productId_warehouse: { productId: input.productId, warehouse: input.warehouse } },
        create: {
          productId: input.productId,
          warehouse: input.warehouse,
          quantity: nextQuantity,
          minQuantity: 0,
        },
        update: { quantity: nextQuantity },
        include: inventoryInclude,
      });

      const movement = await tx.stockMovement.create({
        data: {
          productId: input.productId,
          type: input.type,
          quantity: movementQuantity,
          warehouse: input.warehouse,
          balanceAfter: nextQuantity,
          reason: input.reason,
          reference: input.reference,
        },
      });
      return { movement, inventory };
    });
  },
};
