import { inventoryData } from "../../data/Inventory/Inventory.data.js";
import type {
  CreateStockMovementInput,
  InventoryQueryInput,
  StockMovementQueryInput,
  UpdateInventoryThresholdInput,
} from "../../validators/Inventory/Inventory.validator.js";

function mapInventory(product: Awaited<ReturnType<typeof inventoryData.findProductOverview>>[number]) {
  const inventory = product.inventories[0];
  const quantity = inventory?.quantity ?? 0;
  const minQuantity = inventory?.minQuantity ?? 0;

  return {
    productId: product.id,
    productName: product.name,
    categoryName: product.category.name,
    warehouse: "Kho thành phẩm",
    quantity,
    minQuantity,
    unit: "kg",
    isLowStock: quantity <= minQuantity,
    updatedAt: inventory?.updatedAt ?? product.updatedAt,
  };
}

export const inventoryService = {
  async getInventories(query: InventoryQueryInput) {
    const inventories = (await inventoryData.findProductOverview(query)).map(mapInventory);
    return query.lowStock ? inventories.filter((item) => item.isLowStock) : inventories;
  },

  async updateThreshold(productId: number, input: UpdateInventoryThresholdInput) {
    const product = await inventoryData.findProduct(productId);
    if (!product) throw new Error("PRODUCT_NOT_FOUND");
    const inventory = await inventoryData.setThreshold(productId, input);
    return mapInventory({ ...inventory.product, inventories: [inventory] });
  },

  async getStockMovements(query: StockMovementQueryInput) {
    return (await inventoryData.findMovements(query)).map((movement) => ({
      id: movement.id,
      productId: movement.productId,
      productName: movement.product.name,
      type: movement.type,
      quantity: movement.quantity,
      balanceAfter: movement.balanceAfter,
      warehouse: movement.warehouse,
      reason: movement.reason,
      reference: movement.reference,
      createdAt: movement.createdAt,
    }));
  },

  async createStockMovement(input: CreateStockMovementInput) {
    const result = await inventoryData.createMovement(input);
    return {
      movement: result.movement,
      inventory: mapInventory({ ...result.inventory.product, inventories: [result.inventory] }),
    };
  },
};
