import { PrismaClient, ProductPriceType } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const products = await prisma.product.findMany({
    select: { id: true, retailUnitGram: true, b2bUnitGram: true },
  });
  const productMap = new Map(products.map((product) => [product.id, product]));

  for (const product of products) {
    await prisma.productPrice.updateMany({
      where: { productId: product.id, priceType: ProductPriceType.RETAIL },
      data: { unitGram: product.retailUnitGram },
    });
    await prisma.productPrice.updateMany({
      where: { productId: product.id, priceType: { in: [ProductPriceType.B2B, ProductPriceType.WHOLESALE, ProductPriceType.VIP] } },
      data: { unitGram: product.b2bUnitGram },
    });
  }

  const inventories = await prisma.inventory.findMany();
  for (const inventory of inventories) {
    const product = productMap.get(inventory.productId);
    if (!product || inventory.quantity >= 1000) continue;
    await prisma.inventory.update({
      where: { id: inventory.id },
      data: {
        quantity: inventory.quantity * product.retailUnitGram,
        minQuantity: inventory.minQuantity * product.retailUnitGram,
      },
    });
  }

  const movements = await prisma.stockMovement.findMany();
  for (const movement of movements) {
    const product = productMap.get(movement.productId);
    if (!product || movement.quantity >= 1000) continue;
    await prisma.stockMovement.update({
      where: { id: movement.id },
      data: {
        quantity: movement.quantity * product.retailUnitGram,
        balanceAfter: movement.balanceAfter === null ? null : movement.balanceAfter * product.retailUnitGram,
      },
    });
  }

  const orderItems = await prisma.orderItem.findMany({ include: { order: { select: { channel: true } } } });
  for (const item of orderItems) {
    if (item.quantityGram > 0) continue;
    const product = productMap.get(item.productId);
    if (!product) continue;
    const unitGram = item.order.channel === "B2B" ? product.b2bUnitGram : product.retailUnitGram;
    await prisma.orderItem.update({ where: { id: item.id }, data: { unitGram, quantityGram: item.quantity * unitGram } });
  }

  const allocations = await prisma.orderItemInventoryAllocation.findMany({ include: { orderItem: { include: { order: { select: { channel: true } } } } } });
  for (const allocation of allocations) {
    const product = productMap.get(allocation.orderItem.productId);
    if (!product || allocation.quantity >= 1000) continue;
    const unitGram = allocation.orderItem.order.channel === "B2B" ? product.b2bUnitGram : product.retailUnitGram;
    await prisma.orderItemInventoryAllocation.update({ where: { id: allocation.id }, data: { quantity: allocation.quantity * unitGram } });
  }

  console.log("Đã quy đổi dữ liệu tồn kho, phiếu kho và phân bổ đơn hàng sang gram.");
}

main()
  .catch((error) => { console.error(error); process.exitCode = 1; })
  .finally(async () => { await prisma.$disconnect(); });
