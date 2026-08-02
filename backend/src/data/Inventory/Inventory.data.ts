import { prisma } from "../prisma.js";
import type {
  CreateStockMovementInput,
  InventoryQueryInput,
  StockMovementQueryInput,
  UpdateInventoryThresholdInput,
} from "../../validators/Inventory/Inventory.validator.js";

const warehouse = "Kho thành phẩm";

export const inventoryData = {
  findProductOverview(query: InventoryQueryInput) {
    return prisma.product.findMany({
      where: {
        isActive: true,
        isRetail: true,
        OR: query.keyword
          ? [
              { name: { contains: query.keyword, mode: "insensitive" } },
              { slug: { contains: query.keyword, mode: "insensitive" } },
            ]
          : undefined,
      },
      include: {
        category: { select: { name: true } },
        inventories: { where: { warehouse }, take: 1 },
      },
      orderBy: { name: "asc" },
    });
  },

  findProduct(productId: number) {
    return prisma.product.findFirst({
      where: { id: productId, isActive: true },
      select: { id: true, name: true },
    });
  },

  setThreshold(productId: number, input: UpdateInventoryThresholdInput) {
    return prisma.inventory.upsert({
      where: { productId_warehouse: { productId, warehouse } },
      create: { productId, warehouse, quantity: 0, minQuantity: input.minQuantity },
      update: { minQuantity: input.minQuantity },
      include: { product: { include: { category: true } } },
    });
  },

  findMovements(query: StockMovementQueryInput) {
    return prisma.stockMovement.findMany({
      where: { productId: query.productId, type: query.type, warehouse },
      include: { product: { select: { id: true, name: true } } },
      orderBy: { createdAt: "desc" },
      take: 500,
    });
  },

  async createMovement(input: CreateStockMovementInput) {
    return prisma.$transaction(async (tx) => {
      const product = await tx.product.findFirst({
        where: { id: input.productId, isActive: true },
        select: { id: true, name: true },
      });
      if (!product) throw new Error("PRODUCT_NOT_FOUND");

      const current = await tx.inventory.upsert({
        where: { productId_warehouse: { productId: input.productId, warehouse } },
        create: { productId: input.productId, warehouse, quantity: 0, minQuantity: 0 },
        update: {},
      });
      const nextQuantity = input.type === "IMPORT"
        ? current.quantity + input.quantity
        : input.type === "EXPORT"
          ? current.quantity - input.quantity
          : input.quantity;

      if (input.type === "EXPORT" && nextQuantity < 0) throw new Error("INSUFFICIENT_STOCK");
      if (input.type === "ADJUSTMENT" && nextQuantity === current.quantity) throw new Error("STOCK_UNCHANGED");

      const inventory = await tx.inventory.update({
        where: { id: current.id },
        data: { quantity: nextQuantity },
        include: { product: { include: { category: true } } },
      });
      const movement = await tx.stockMovement.create({
        data: {
          productId: input.productId,
          type: input.type,
          quantity: input.type === "ADJUSTMENT" ? Math.abs(nextQuantity - current.quantity) : input.quantity,
          warehouse,
          balanceAfter: nextQuantity,
          reason: input.reason,
          reference: input.reference,
        },
      });

      return { movement, inventory };
    });
  },
};
