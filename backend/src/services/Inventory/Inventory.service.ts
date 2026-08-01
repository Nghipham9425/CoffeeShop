import { inventoryData } from "../../data/Inventory/Inventory.data.js";
import type {
  CreateStockMovementInput,
  InventoryQueryInput,
  StockMovementQueryInput,
  UpdateInventoryInput,
} from "../../validators/Inventory/Inventory.validator.js";

type InventoryRecord = Awaited<ReturnType<typeof inventoryData.findMany>>[number];

function mapInventory(item: InventoryRecord) {
  return {
    id: item.id,
    productId: item.productId,
    productName: item.product.name,
    categoryName: item.product.category.name,
    quantity: item.quantity,
    minQuantity: item.minQuantity,
    warehouse: item.warehouse,
    isLowStock: item.quantity <= item.minQuantity,
    updatedAt: item.updatedAt,
  };
}

export const inventoryService = {
  async getInventories(query: InventoryQueryInput) {
    const inventories = await inventoryData.findMany(query);
    const mapped = inventories.map(mapInventory);
    return query.lowStock ? mapped.filter((item) => item.isLowStock) : mapped;
  },

  async updateInventory(id: number, input: UpdateInventoryInput) {
    const existing = await inventoryData.findById(id);
    if (!existing) throw new Error("INVENTORY_NOT_FOUND");

    return mapInventory(await inventoryData.update(id, input));
  },

  async getStockMovements(query: StockMovementQueryInput) {
    return (await inventoryData.findMovements(query)).map((movement) => ({
      id: movement.id,
      productId: movement.productId,
      productName: movement.product.name,
      type: movement.type,
      quantity: movement.quantity,
      warehouse: movement.warehouse,
      balanceAfter: movement.balanceAfter,
      reason: movement.reason,
      reference: movement.reference,
      createdAt: movement.createdAt,
    }));
  },

  async createStockMovement(input: CreateStockMovementInput) {
    const result = await inventoryData.createMovement(input);
    return {
      movement: {
        id: result.movement.id,
        productId: result.movement.productId,
        type: result.movement.type,
        quantity: result.movement.quantity,
        reason: result.movement.reason,
        reference: result.movement.reference,
        warehouse: result.movement.warehouse,
        balanceAfter: result.movement.balanceAfter,
        createdAt: result.movement.createdAt,
      },
      inventory: mapInventory(result.inventory),
    };
  },
};
