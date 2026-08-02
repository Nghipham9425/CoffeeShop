import { PrismaClient, ProductPriceType } from "@prisma/client";

const prisma = new PrismaClient();

type CatalogItem = {
  slug: string;
  name: string;
  description: string;
  retailPrice: number;
  b2bPrice: number;
  minimumOrderKg: number;
  imageUrl: string;
};

const catalog: CatalogItem[] = [
  {
    slug: "robusta-rang-moc",
    name: "Robusta Buôn Ma Thuột rang mộc",
    description: "Cà phê Robusta tuyển chọn từ Buôn Ma Thuột, rang vừa đậm với hương cacao và hạt dẻ. Bán theo quy cách 1 kg, phù hợp pha phin, cà phê sữa đá và làm nền cho các dòng blend.",
    retailPrice: 145000,
    b2bPrice: 118000,
    minimumOrderKg: 20,
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Roasted_coffee_beans.jpg/1280px-Roasted_coffee_beans.jpg",
  },
  {
    slug: "espresso-blend",
    name: "Espresso House Blend",
    description: "Blend Arabica và Robusta cân bằng vị chocolate đen, caramel và độ ngọt tự nhiên. Quy cách 1 kg; crema ổn định cho espresso, latte và cappuccino.",
    retailPrice: 185000,
    b2bPrice: 165000,
    minimumOrderKg: 20,
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Roasted_coffee_beans_on_the_surface._02.jpg/1280px-Roasted_coffee_beans_on_the_surface._02.jpg",
  },
  {
    slug: "arabica-cau-dat-honey",
    name: "Arabica Cầu Đất Honey",
    description: "Arabica Cầu Đất chế biến honey, rang sáng vừa để làm nổi bật hương cam vàng, mật ong và hoa trắng. Quy cách 1 kg, phù hợp pour over, pha máy và phân khúc cà phê đặc sản.",
    retailPrice: 245000,
    b2bPrice: 218000,
    minimumOrderKg: 20,
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/49/Roasted_arabica_coffee_beans_Minca.jpg/1280px-Roasted_arabica_coffee_beans_Minca.jpg",
  },
  {
    slug: "phin-blend-truyen-thong",
    name: "Phin Blend truyền thống",
    description: "Blend dành cho pha phin với thể chất dày, hương chocolate, bơ và chút khói nhẹ. Quy cách 1 kg, giữ vị cà phê rõ ràng khi pha cùng sữa đặc.",
    retailPrice: 165000,
    b2bPrice: 138000,
    minimumOrderKg: 20,
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/d/dd/Vietnamese_coffee_brewing_with_metal_filter.jpg",
  },
  {
    slug: "arabica-natural-da-lat",
    name: "Arabica Natural Đà Lạt",
    description: "Arabica sơ chế natural mang hương dâu chín, cacao và rượu vang nhẹ. Quy cách 1 kg, rang medium-light, thích hợp V60, AeroPress hoặc espresso hiện đại.",
    retailPrice: 235000,
    b2bPrice: 205000,
    minimumOrderKg: 20,
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/38/Roasted_coffee_beans_on_the_surface._01.jpg/1280px-Roasted_coffee_beans_on_the_surface._01.jpg",
  },
  {
    slug: "cold-brew-smooth-blend",
    name: "Cold Brew Smooth Blend",
    description: "Blend rang vừa cho phương pháp ủ lạnh, vị êm, ít chua với hương caramel, hạnh nhân và chocolate sữa. Bán theo 1 kg cho gia đình, quán và đơn hàng thử nghiệm.",
    retailPrice: 205000,
    b2bPrice: 178000,
    minimumOrderKg: 20,
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/46/Preparation_of_cold_brew_coffee_02.jpg/1280px-Preparation_of_cold_brew_coffee_02.jpg",
  },
  {
    slug: "arabica-son-la-washed",
    name: "Arabica Sơn La Washed",
    description: "Arabica Sơn La sơ chế washed có hương cam, đường nâu và hậu vị sạch. Quy cách 1 kg, phù hợp quán cà phê cần nguyên liệu ổn định cho pha máy hoặc pour over.",
    retailPrice: 225000,
    b2bPrice: 198000,
    minimumOrderKg: 20,
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8c/Coffee_beans_2.jpg/1280px-Coffee_beans_2.jpg",
  },
  {
    slug: "culi-dak-lak-rang-vua",
    name: "Culi Đắk Lắk rang vừa",
    description: "Cà phê Culi Đắk Lắk rang vừa, vị đậm, hương gỗ và cacao. Quy cách 1 kg, phù hợp pha phin, pha máy và phối trộn cho quán cà phê.",
    retailPrice: 175000,
    b2bPrice: 148000,
    minimumOrderKg: 20,
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/Coffee_beans_in_a_bag.jpg/1280px-Coffee_beans_in_a_bag.jpg",
  },
  {
    slug: "ca-phe-hoa-tan-den-nguyen-chat",
    name: "Cà phê hòa tan đen nguyên chất",
    description: "Cà phê hòa tan đen nguyên chất, vị đậm vừa và hậu cacao. Cung cấp theo quy cách 1 kg cho văn phòng, khách sạn và đơn vị pha chế số lượng lớn.",
    retailPrice: 320000,
    b2bPrice: 285000,
    minimumOrderKg: 20,
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/26/Instant_coffee.jpg/1280px-Instant_coffee.jpg",
  },
  {
    slug: "ca-phe-sua-hoa-tan-3-trong-1",
    name: "Cà phê sữa hòa tan 3 trong 1",
    description: "Nguyên liệu cà phê sữa hòa tan 3 trong 1, công thức cân bằng cà phê, sữa và độ ngọt. Bán theo quy cách 1 kg phục vụ sản xuất và phân phối.",
    retailPrice: 290000,
    b2bPrice: 255000,
    minimumOrderKg: 20,
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9d/Coffee1231.jpg/1280px-Coffee1231.jpg",
  },
];

async function main() {
  await prisma.product.updateMany({ where: { slug: "drip-bag-arabica-cau-dat" }, data: { slug: "arabica-son-la-washed" } });
  await prisma.product.updateMany({ where: { slug: "drip-bag-phin-blend" }, data: { slug: "culi-dak-lak-rang-vua" } });

  const category = await prisma.category.findUniqueOrThrow({ where: { slug: "ca-phe-rang-xay" } });
  const instantCategory = await prisma.category.findUnique({ where: { slug: "ca-phe-hoa-tan" } });

  for (const item of catalog) {
    const isInstant = item.slug === "ca-phe-hoa-tan-den-nguyen-chat" || item.slug === "ca-phe-sua-hoa-tan-3-trong-1";
    const product = await prisma.product.update({
      where: { slug: item.slug },
      data: {
        categoryId: isInstant && instantCategory ? instantCategory.id : category.id,
        name: item.name,
        description: item.description,
        unit: "kg",
        price: item.retailPrice,
        minimumOrderKg: item.minimumOrderKg,
        imageUrl: item.imageUrl,
        isRetail: true,
        isB2b: true,
        isActive: true,
        retailUnitName: "kg",
        retailUnitGram: 1000,
        b2bUnitName: "kg",
        b2bUnitGram: 1000,
      },
    });

    await prisma.productPrice.updateMany({
      where: { productId: product.id, priceType: ProductPriceType.B2B },
      data: { isActive: false },
    });
    await prisma.productPrice.upsert({
      where: { productId_priceType_minQuantity: { productId: product.id, priceType: ProductPriceType.RETAIL, minQuantity: 1 } },
      create: { productId: product.id, priceType: ProductPriceType.RETAIL, minQuantity: 1, unitGram: 1000, price: item.retailPrice },
      update: { price: item.retailPrice, unitGram: 1000, isActive: true },
    });
    await prisma.productPrice.upsert({
      where: { productId_priceType_minQuantity: { productId: product.id, priceType: ProductPriceType.B2B, minQuantity: item.minimumOrderKg } },
      create: { productId: product.id, priceType: ProductPriceType.B2B, minQuantity: item.minimumOrderKg, unitGram: 1000, price: item.b2bPrice },
      update: { price: item.b2bPrice, unitGram: 1000, isActive: true },
    });
  }

  await prisma.product.updateMany({
    where: { slug: "oem-private-label" },
    data: { unit: "kg", retailUnitName: "kg", retailUnitGram: 1000, b2bUnitName: "kg", b2bUnitGram: 1000, minimumOrderKg: 50, isRetail: false, isB2b: true },
  });
  await prisma.product.updateMany({
    where: { slug: "gia-cong-nhan-rieng-oem" },
    data: { isActive: false, isRetail: false },
  });

  console.log(`Đã chuẩn hóa ${catalog.length} sản phẩm nhà máy theo quy cách kg.`);
}

main()
  .catch((error) => { console.error(error); process.exitCode = 1; })
  .finally(async () => { await prisma.$disconnect(); });
