import { prisma } from "../prisma.js";

export const reportData = {
  async overview() {
    const fromDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const [
      productCount,
      categoryCount,
      orderCount,
      pendingOrderCount,
      completedOrderCount,
      quoteCount,
      unreadContactCount,
      retailCustomerCount,
      businessCustomerCount,
      lowStockItems,
      revenue,
      recentOrders,
      topProducts,
    ] = await Promise.all([
      prisma.product.count({ where: { isActive: true } }),
      prisma.category.count({ where: { isActive: true } }),
      prisma.order.count(),
      prisma.order.count({ where: { status: "PENDING" } }),
      prisma.order.count({ where: { status: "COMPLETED" } }),
      prisma.quoteRequest.count(),
      prisma.contactMessage.count({ where: { isRead: false } }),
      prisma.user.count({ where: { role: "CUSTOMER" } }),
      prisma.businessCustomer.count(),
      prisma.inventory.findMany({
        include: { product: { select: { name: true } } },
        orderBy: { quantity: "asc" },
        take: 6,
      }),
      prisma.order.aggregate({
        where: {
          status: "COMPLETED",
          createdAt: { gte: fromDate },
        },
        _sum: { totalAmount: true },
      }),
      prisma.order.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
        select: {
          id: true,
          orderCode: true,
          customerName: true,
          status: true,
          totalAmount: true,
          createdAt: true,
        },
      }),
      prisma.orderItem.groupBy({
        by: ["productId"],
        _sum: { quantity: true, lineTotal: true },
        orderBy: { _sum: { lineTotal: "desc" } },
        take: 5,
      }),
    ]);

    const productIds = topProducts.map((item) => item.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, name: true },
    });

    return {
      productCount,
      categoryCount,
      orderCount,
      pendingOrderCount,
      completedOrderCount,
      quoteCount,
      unreadContactCount,
      retailCustomerCount,
      businessCustomerCount,
      revenueLast30Days: revenue._sum.totalAmount,
      lowStockItems,
      recentOrders,
      topProducts,
      products,
    };
  },
};
