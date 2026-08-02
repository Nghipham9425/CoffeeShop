import { PrismaClient, StockMovementType } from "@prisma/client";

const prisma = new PrismaClient();
const warehouse = "Kho thành phẩm";
const reference = "SEED-INVENTORY-DEMO-2026";

function initialQuantityKg(index: number) {
  return 40 + (index % 6) * 25;
}

async function main() {
  await prisma.product.updateMany({
    data: {
      retailUnitName: "kg",
      retailUnitGram: 1000,
      b2bUnitName: "kg",
      b2bUnitGram: 1000,
    },
  });
  await prisma.productPrice.updateMany({ data: { unitGram: 1000 } });

  const products = await prisma.product.findMany({
    where: { isActive: true, isRetail: true },
    select: { id: true },
    orderBy: { id: "asc" },
  });

  for (const [index, product] of products.entries()) {
    const quantity = initialQuantityKg(index);
    const minQuantity = Math.max(10, Math.floor(quantity * 0.15));
    const inventory = await prisma.inventory.upsert({
      where: { productId_warehouse: { productId: product.id, warehouse } },
      create: { productId: product.id, warehouse, quantity, minQuantity },
      update: { quantity, minQuantity },
    });

    await prisma.stockMovement.deleteMany({ where: { productId: product.id, reference } });
    await prisma.stockMovement.create({
      data: {
        productId: product.id,
        warehouse,
        type: StockMovementType.IMPORT,
        quantity,
        balanceAfter: inventory.quantity,
        reason: "Nhập tồn đầu kỳ cho dữ liệu mẫu",
        reference,
      },
    });
  }

  console.log(`Đã khởi tạo tồn kho theo kg cho ${products.length} sản phẩm bán lẻ.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
