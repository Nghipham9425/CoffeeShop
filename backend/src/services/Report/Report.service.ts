import { reportData } from "../../data/Report/Report.data.js";

export const reportService = {
  async getOverview() {
    const data = await reportData.overview();
    const productNameById = new Map(data.products.map((product) => [product.id, product.name]));

    return {
      productCount: data.productCount,
      categoryCount: data.categoryCount,
      orderCount: data.orderCount,
      pendingOrderCount: data.pendingOrderCount,
      completedOrderCount: data.completedOrderCount,
      quoteCount: data.quoteCount,
      retailCustomerCount: data.retailCustomerCount,
      businessCustomerCount: data.businessCustomerCount,
      revenueLast30Days: Number(data.revenueLast30Days ?? 0),
      lowStockItems: data.lowStockItems
        .filter((item) => item.quantity <= item.minQuantity)
        .map((item) => ({
          id: item.id,
          productName: item.product.name,
          quantity: item.quantity,
          minQuantity: item.minQuantity,
          warehouse: item.warehouse,
        })),
      recentOrders: data.recentOrders.map((order) => ({
        ...order,
        totalAmount: Number(order.totalAmount),
      })),
      topProducts: data.topProducts.map((item) => ({
        productId: item.productId,
        productName: productNameById.get(item.productId) ?? `Sản phẩm #${item.productId}`,
        quantity: item._sum.quantity ?? 0,
        revenue: Number(item._sum.lineTotal ?? 0),
      })),
    };
  },
};
