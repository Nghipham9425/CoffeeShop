import bcrypt from "bcryptjs";
import {
  ContractStatus,
  DebtStatus,
  DiscountType,
  InvoiceStatus,
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
  ProductPriceType,
  PromotionStatus,
  PrismaClient,
  QuoteRequestStatus,
  ReviewStatus,
  ShipmentStatus,
  StockMovementType,
  UserRole,
} from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const adminPasswordHash = await bcrypt.hash("Admin@123", 10);
  const customerPasswordHash = await bcrypt.hash("Customer@123", 10);
  const staffPasswordHash = await bcrypt.hash("Staff@123", 10);

  await prisma.user.upsert({
    where: { email: "admin@phutaicoffee.vn" },
    update: {
      fullName: "Quản trị viên Phú Tài Coffee Works",
      phone: "0886332533",
      role: UserRole.ADMIN,
    },
    create: {
      fullName: "Quản trị viên Phú Tài Coffee Works",
      email: "admin@phutaicoffee.vn",
      passwordHash: adminPasswordHash,
      phone: "0886332533",
      role: UserRole.ADMIN,
    },
  });

  const staffAccounts = [
    { email: "sales@phutaicoffee.vn", fullName: "Nhân viên kinh doanh demo", phone: "0909000011", role: UserRole.SALES },
    { email: "warehouse@phutaicoffee.vn", fullName: "Nhân viên kho demo", phone: "0909000012", role: UserRole.WAREHOUSE },
    { email: "accountant@phutaicoffee.vn", fullName: "Kế toán demo", phone: "0909000013", role: UserRole.ACCOUNTANT },
  ];
  for (const account of staffAccounts) {
    await prisma.user.upsert({
      where: { email: account.email },
      update: { fullName: account.fullName, phone: account.phone, role: account.role, isActive: true },
      create: { ...account, passwordHash: staffPasswordHash },
    });
  }

  const customer = await prisma.user.upsert({
    where: { email: "khachle@example.com" },
    update: {
      fullName: "Khách lẻ demo",
      phone: "0909000001",
      role: UserRole.CUSTOMER,
    },
    create: {
      fullName: "Khách lẻ demo",
      email: "khachle@example.com",
      passwordHash: customerPasswordHash,
      phone: "0909000001",
      role: UserRole.CUSTOMER,
    },
  });

  const address = await prisma.address.upsert({
    where: { id: 1 },
    update: {
      userId: customer.id,
      receiverName: "Khách lẻ demo",
      phone: "0909000001",
      province: "TP. Hồ Chí Minh",
      district: "Tân Bình",
      ward: "Phường 15",
      detail: "KCN Tân Bình",
      isDefault: true,
    },
    create: {
      userId: customer.id,
      receiverName: "Khách lẻ demo",
      phone: "0909000001",
      province: "TP. Hồ Chí Minh",
      district: "Tân Bình",
      ward: "Phường 15",
      detail: "KCN Tân Bình",
      isDefault: true,
    },
  });

  const roastedCategory = await prisma.category.upsert({
    where: { slug: "ca-phe-rang-xay" },
    update: {
      name: "Cà phê rang xay",
      description: "Sản phẩm cà phê rang xay cho bán lẻ và bán sỉ.",
    },
    create: {
      name: "Cà phê rang xay",
      slug: "ca-phe-rang-xay",
      description: "Sản phẩm cà phê rang xay cho bán lẻ và bán sỉ.",
    },
  });

  const oemCategory = await prisma.category.upsert({
    where: { slug: "gia-cong-oem" },
    update: {
      name: "Gia công OEM",
      description: "Dịch vụ rang, phối trộn và đóng gói theo thương hiệu riêng.",
    },
    create: {
      name: "Gia công OEM",
      slug: "gia-cong-oem",
      description: "Dịch vụ rang, phối trộn và đóng gói theo thương hiệu riêng.",
    },
  });

  const dripBagCategory = await prisma.category.upsert({
    where: { slug: "ca-phe-tui-loc" },
    update: {
      name: "Cà phê túi lọc",
      description: "Drip bag tiện lợi, giữ trọn hương vị cà phê rang xay nguyên chất.",
    },
    create: {
      name: "Cà phê túi lọc",
      slug: "ca-phe-tui-loc",
      description: "Drip bag tiện lợi, giữ trọn hương vị cà phê rang xay nguyên chất.",
    },
  });

  const instantCategory = await prisma.category.upsert({
    where: { slug: "ca-phe-hoa-tan" },
    update: {
      name: "Cà phê hòa tan",
      description: "Cà phê hòa tan đóng gói tiện dụng cho gia đình, văn phòng và khách sạn.",
    },
    create: {
      name: "Cà phê hòa tan",
      slug: "ca-phe-hoa-tan",
      description: "Cà phê hòa tan đóng gói tiện dụng cho gia đình, văn phòng và khách sạn.",
    },
  });

  const robusta = await prisma.product.upsert({
    where: { slug: "robusta-rang-moc" },
    update: {
      categoryId: roastedCategory.id,
      name: "Robusta Buôn Ma Thuột rang mộc",
      description: "Robusta chọn lọc từ Buôn Ma Thuột, rang vừa đậm với hương cacao, hạt dẻ và hậu vị kéo dài. Phù hợp pha phin, cà phê sữa đá và phối blend cho quán.",
      unit: "túi 500g",
      price: 145000,
      minimumOrderKg: 1,
      imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Roasted_coffee_beans.jpg/1280px-Roasted_coffee_beans.jpg",
      isRetail: true,
      isB2b: true,
    },
    create: {
      categoryId: roastedCategory.id,
      name: "Robusta Buôn Ma Thuột rang mộc",
      slug: "robusta-rang-moc",
      description: "Robusta chọn lọc từ Buôn Ma Thuột, rang vừa đậm với hương cacao, hạt dẻ và hậu vị kéo dài. Phù hợp pha phin, cà phê sữa đá và phối blend cho quán.",
      unit: "túi 500g",
      price: 145000,
      minimumOrderKg: 1,
      imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Roasted_coffee_beans.jpg/1280px-Roasted_coffee_beans.jpg",
      isRetail: true,
      isB2b: true,
    },
  });

  const espresso = await prisma.product.upsert({
    where: { slug: "espresso-blend" },
    update: {
      categoryId: roastedCategory.id,
      name: "Espresso House Blend",
      description: "Phối trộn Arabica và Robusta theo tỷ lệ cân bằng, vị chocolate đen, caramel và độ ngọt tự nhiên. Crema dày, ổn định khi pha espresso, latte hoặc cappuccino.",
      unit: "túi 500g",
      price: 185000,
      minimumOrderKg: 1,
      imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Roasted_coffee_beans_on_the_surface._02.jpg/1280px-Roasted_coffee_beans_on_the_surface._02.jpg",
      isRetail: true,
      isB2b: true,
    },
    create: {
      categoryId: roastedCategory.id,
      name: "Espresso House Blend",
      slug: "espresso-blend",
      description: "Phối trộn Arabica và Robusta theo tỷ lệ cân bằng, vị chocolate đen, caramel và độ ngọt tự nhiên. Crema dày, ổn định khi pha espresso, latte hoặc cappuccino.",
      unit: "túi 500g",
      price: 185000,
      minimumOrderKg: 1,
      imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Roasted_coffee_beans_on_the_surface._02.jpg/1280px-Roasted_coffee_beans_on_the_surface._02.jpg",
      isRetail: true,
      isB2b: true,
    },
  });

  const sampleProductInputs = [
    {
      categoryId: roastedCategory.id,
      slug: "arabica-cau-dat-honey",
      name: "Arabica Cầu Đất Honey",
      description: "Arabica Cầu Đất chế biến honey, rang sáng vừa để làm nổi bật hương cam vàng, mật ong và hoa trắng. Vị chua thanh, hậu ngọt sạch, phù hợp pour over và pha máy.",
      unit: "túi 500g",
      price: 245000,
      minimumOrderKg: 1,
      imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/49/Roasted_arabica_coffee_beans_Minca.jpg/1280px-Roasted_arabica_coffee_beans_Minca.jpg",
      isB2b: true,
      stock: 64,
      minStock: 12,
      wholesalePrice: 218000,
    },
    {
      categoryId: roastedCategory.id,
      slug: "phin-blend-truyen-thong",
      name: "Phin Blend truyền thống",
      description: "Blend dành riêng cho pha phin với thể chất dày, hương chocolate, bơ và chút khói nhẹ. Khi kết hợp cùng sữa đặc vẫn giữ được vị cà phê rõ ràng.",
      unit: "túi 500g",
      price: 165000,
      minimumOrderKg: 1,
      imageUrl: "https://upload.wikimedia.org/wikipedia/commons/d/dd/Vietnamese_coffee_brewing_with_metal_filter.jpg",
      isB2b: true,
      stock: 95,
      minStock: 18,
      wholesalePrice: 138000,
    },
    {
      categoryId: roastedCategory.id,
      slug: "arabica-natural-da-lat",
      name: "Arabica Natural Đà Lạt",
      description: "Hạt Arabica sơ chế natural cho hương dâu chín, cacao và rượu vang nhẹ. Rang medium-light, thích hợp V60, AeroPress hoặc espresso hiện đại.",
      unit: "túi 250g",
      price: 175000,
      minimumOrderKg: 1,
      imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/38/Roasted_coffee_beans_on_the_surface._01.jpg/1280px-Roasted_coffee_beans_on_the_surface._01.jpg",
      isB2b: true,
      stock: 48,
      minStock: 10,
      wholesalePrice: 152000,
    },
    {
      categoryId: roastedCategory.id,
      slug: "cold-brew-smooth-blend",
      name: "Cold Brew Smooth Blend",
      description: "Blend rang vừa cho phương pháp ủ lạnh, vị êm, ít chua với hương caramel, hạnh nhân và chocolate sữa. Dễ dùng tại nhà hoặc pha theo mẻ cho quán.",
      unit: "túi 500g",
      price: 205000,
      minimumOrderKg: 1,
      imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/46/Preparation_of_cold_brew_coffee_02.jpg/1280px-Preparation_of_cold_brew_coffee_02.jpg",
      isB2b: true,
      stock: 52,
      minStock: 10,
      wholesalePrice: 178000,
    },
    {
      categoryId: dripBagCategory.id,
      slug: "drip-bag-arabica-cau-dat",
      name: "Drip Bag Arabica Cầu Đất",
      description: "Cà phê túi lọc dùng một lần, mỗi gói 12g được đóng khí nitơ để giữ hương. Vị cam, mật ong và hạt dẻ; chỉ cần ly và nước nóng để pha.",
      unit: "hộp 10 gói",
      price: 139000,
      minimumOrderKg: 1,
      imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9c/Instant_drip_coffee_%283646962377%29.jpg/1280px-Instant_drip_coffee_%283646962377%29.jpg",
      isB2b: true,
      stock: 110,
      minStock: 20,
      wholesalePrice: 118000,
    },
    {
      categoryId: dripBagCategory.id,
      slug: "drip-bag-phin-blend",
      name: "Drip Bag Phin Blend",
      description: "Phiên bản drip bag đậm vị dành cho người yêu cà phê Việt. Hương cacao và caramel, thể chất vừa, tiện mang theo khi đi làm hoặc du lịch.",
      unit: "hộp 10 gói",
      price: 119000,
      minimumOrderKg: 1,
      imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/61/Single_drip_coffee_filter.jpg/1280px-Single_drip_coffee_filter.jpg",
      isB2b: true,
      stock: 125,
      minStock: 20,
      wholesalePrice: 99000,
    },
    {
      categoryId: instantCategory.id,
      slug: "ca-phe-hoa-tan-den-nguyen-chat",
      name: "Cà phê hòa tan đen nguyên chất",
      description: "Cà phê hòa tan không đường, vị đậm vừa và hậu cacao. Mỗi gói định lượng sẵn cho một ly, phù hợp văn phòng và khách hàng cần pha nhanh.",
      unit: "hộp 20 gói",
      price: 89000,
      minimumOrderKg: 1,
      imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/26/Instant_coffee.jpg/1280px-Instant_coffee.jpg",
      isB2b: true,
      stock: 150,
      minStock: 30,
      wholesalePrice: 74000,
    },
    {
      categoryId: instantCategory.id,
      slug: "ca-phe-sua-hoa-tan-3-trong-1",
      name: "Cà phê sữa hòa tan 3 trong 1",
      description: "Công thức cân bằng giữa cà phê, sữa và độ ngọt, hương thơm dễ uống. Quy cách 20 gói phù hợp dùng tại nhà, văn phòng hoặc làm quà tặng.",
      unit: "hộp 20 gói",
      price: 95000,
      minimumOrderKg: 1,
      imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9d/Coffee1231.jpg/1280px-Coffee1231.jpg",
      isB2b: true,
      stock: 140,
      minStock: 30,
      wholesalePrice: 79000,
    },
  ];

  const sampleProducts = await Promise.all(
    sampleProductInputs.map((product) =>
      prisma.product.upsert({
        where: { slug: product.slug },
        update: {
          categoryId: product.categoryId,
          name: product.name,
          description: product.description,
          unit: product.unit,
          price: product.price,
          minimumOrderKg: product.minimumOrderKg,
          imageUrl: product.imageUrl,
          isRetail: true,
          isB2b: product.isB2b,
          isActive: true,
        },
        create: {
          categoryId: product.categoryId,
          slug: product.slug,
          name: product.name,
          description: product.description,
          unit: product.unit,
          price: product.price,
          minimumOrderKg: product.minimumOrderKg,
          imageUrl: product.imageUrl,
          isRetail: true,
          isB2b: product.isB2b,
        },
      }),
    ),
  );

  await Promise.all(
    sampleProducts.flatMap((product, index) => {
      const input = sampleProductInputs[index];
      return [
        prisma.inventory.upsert({
          where: { productId_warehouse: { productId: product.id, warehouse: "Kho thành phẩm" } },
          update: { quantity: input.stock, minQuantity: input.minStock },
          create: {
            productId: product.id,
            quantity: input.stock,
            minQuantity: input.minStock,
            warehouse: "Kho thành phẩm",
          },
        }),
        prisma.productPrice.upsert({
          where: {
            productId_priceType_minQuantity: {
              productId: product.id,
              priceType: ProductPriceType.RETAIL,
              minQuantity: 1,
            },
          },
          update: { price: input.price, isActive: true },
          create: {
            productId: product.id,
            priceType: ProductPriceType.RETAIL,
            minQuantity: 1,
            price: input.price,
          },
        }),
        prisma.productPrice.upsert({
          where: {
            productId_priceType_minQuantity: {
              productId: product.id,
              priceType: ProductPriceType.B2B,
              minQuantity: 20,
            },
          },
          update: { price: input.wholesalePrice, isActive: true },
          create: {
            productId: product.id,
            priceType: ProductPriceType.B2B,
            minQuantity: 20,
            price: input.wholesalePrice,
          },
        }),
      ];
    }),
  );

  await prisma.product.upsert({
    where: { slug: "oem-private-label" },
    update: {
      categoryId: oemCategory.id,
      name: "Gia công nhãn riêng OEM",
      description: "Gia công profile rang, blend và bao bì theo yêu cầu doanh nghiệp.",
      minimumOrderKg: 50,
      isRetail: false,
      isB2b: true,
    },
    create: {
      categoryId: oemCategory.id,
      name: "Gia công nhãn riêng OEM",
      slug: "oem-private-label",
      description: "Gia công profile rang, blend và bao bì theo yêu cầu doanh nghiệp.",
      minimumOrderKg: 50,
      isRetail: false,
      isB2b: true,
    },
  });

  await prisma.inventory.upsert({
    where: { productId_warehouse: { productId: robusta.id, warehouse: "Kho thành phẩm" } },
    update: { quantity: 120, minQuantity: 20 },
    create: {
      productId: robusta.id,
      quantity: 120,
      minQuantity: 20,
      warehouse: "Kho thành phẩm",
    },
  });

  await prisma.inventory.upsert({
    where: { productId_warehouse: { productId: espresso.id, warehouse: "Kho thành phẩm" } },
    update: { quantity: 80, minQuantity: 15 },
    create: {
      productId: espresso.id,
      quantity: 80,
      minQuantity: 15,
      warehouse: "Kho thành phẩm",
    },
  });

  await prisma.stockMovement.createMany({
    data: [
      {
        productId: robusta.id,
        type: StockMovementType.IMPORT,
        quantity: 120,
        reason: "Nhập kho đầu kỳ",
        reference: "OPENING-STOCK",
      },
      {
        productId: espresso.id,
        type: StockMovementType.IMPORT,
        quantity: 80,
        reason: "Nhập kho đầu kỳ",
        reference: "OPENING-STOCK",
      },
    ],
  });

  await prisma.productPrice.upsert({
    where: {
      productId_priceType_minQuantity: {
        productId: robusta.id,
        priceType: ProductPriceType.RETAIL,
        minQuantity: 1,
      },
    },
    update: { price: 145000, isActive: true },
    create: {
      productId: robusta.id,
      priceType: ProductPriceType.RETAIL,
      minQuantity: 1,
      price: 145000,
    },
  });

  await prisma.productPrice.upsert({
    where: {
      productId_priceType_minQuantity: {
        productId: robusta.id,
        priceType: ProductPriceType.B2B,
        minQuantity: 50,
      },
    },
    update: { price: 118000, isActive: true },
    create: {
      productId: robusta.id,
      priceType: ProductPriceType.B2B,
      minQuantity: 50,
      price: 118000,
    },
  });

  await prisma.productPrice.upsert({
    where: {
      productId_priceType_minQuantity: {
        productId: espresso.id,
        priceType: ProductPriceType.RETAIL,
        minQuantity: 1,
      },
    },
    update: { price: 185000, isActive: true },
    create: {
      productId: espresso.id,
      priceType: ProductPriceType.RETAIL,
      minQuantity: 1,
      price: 185000,
    },
  });

  await prisma.productPrice.upsert({
    where: {
      productId_priceType_minQuantity: {
        productId: espresso.id,
        priceType: ProductPriceType.VIP,
        minQuantity: 5,
      },
    },
    update: { price: 170000, isActive: true },
    create: {
      productId: espresso.id,
      priceType: ProductPriceType.VIP,
      minQuantity: 5,
      price: 170000,
    },
  });

  const promotion = await prisma.promotion.upsert({
    where: { code: "RETAIL10" },
    update: {
      name: "Giảm 10% cho khách mua lẻ",
      discountType: DiscountType.PERCENT,
      discountValue: 10,
      minOrderAmount: 300000,
      status: PromotionStatus.ACTIVE,
    },
    create: {
      name: "Giảm 10% cho khách mua lẻ",
      code: "RETAIL10",
      discountType: DiscountType.PERCENT,
      discountValue: 10,
      minOrderAmount: 300000,
      startAt: new Date(),
      endAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
      status: PromotionStatus.ACTIVE,
    },
  });

  await prisma.loyaltyProfile.upsert({
    where: { userId: customer.id },
    update: {
      tier: "VIP",
      points: 320,
      totalSpent: 545000,
      orderCount: 1,
      lastPurchaseAt: new Date(),
    },
    create: {
      userId: customer.id,
      tier: "VIP",
      points: 320,
      totalSpent: 545000,
      orderCount: 1,
      lastPurchaseAt: new Date(),
    },
  });

  const retailOrder = await prisma.order.upsert({
    where: { orderCode: "PTCW-RETAIL-0001" },
    update: {
      userId: customer.id,
      addressId: address.id,
      promotionId: promotion.id,
      customerName: "Khách lẻ demo",
      customerPhone: "0909000001",
      customerEmail: "khachle@example.com",
      subtotal: 515000,
      shippingFee: 30000,
      discountAmount: 0,
      totalAmount: 545000,
      status: OrderStatus.CONFIRMED,
      note: "Đơn hàng khách lẻ thanh toán online demo.",
    },
    create: {
      userId: customer.id,
      addressId: address.id,
      promotionId: promotion.id,
      orderCode: "PTCW-RETAIL-0001",
      customerName: "Khách lẻ demo",
      customerPhone: "0909000001",
      customerEmail: "khachle@example.com",
      subtotal: 515000,
      shippingFee: 30000,
      discountAmount: 0,
      totalAmount: 545000,
      status: OrderStatus.CONFIRMED,
      note: "Đơn hàng khách lẻ thanh toán online demo.",
      items: {
        create: [
          {
            productId: robusta.id,
            quantity: 2,
            unitPrice: 145000,
            lineTotal: 290000,
          },
          {
            productId: espresso.id,
            quantity: 1,
            unitPrice: 225000,
            lineTotal: 225000,
          },
        ],
      },
    },
  });

  await prisma.payment.upsert({
    where: { id: 1 },
    update: {},
    create: {
      orderId: retailOrder.id,
      method: PaymentMethod.VNPAY,
      status: PaymentStatus.PAID,
      amount: 545000,
      transactionCode: "VNPAY-DEMO-0001",
      paidAt: new Date(),
    },
  });

  await prisma.shipment.upsert({
    where: { orderId: retailOrder.id },
    update: {
      carrier: "Giao hàng nhanh",
      trackingCode: "GHN-DEMO-0001",
      status: ShipmentStatus.PACKED,
      note: "Đơn hàng đã đóng gói, chờ lấy hàng.",
    },
    create: {
      orderId: retailOrder.id,
      carrier: "Giao hàng nhanh",
      trackingCode: "GHN-DEMO-0001",
      status: ShipmentStatus.PACKED,
      note: "Đơn hàng đã đóng gói, chờ lấy hàng.",
    },
  });

  await prisma.review.upsert({
    where: {
      userId_productId_orderId: {
        userId: customer.id,
        productId: robusta.id,
        orderId: retailOrder.id,
      },
    },
    update: {
      rating: 5,
      content: "Cà phê thơm, phù hợp pha phin.",
      status: ReviewStatus.APPROVED,
    },
    create: {
      userId: customer.id,
      productId: robusta.id,
      orderId: retailOrder.id,
      rating: 5,
      content: "Cà phê thơm, phù hợp pha phin.",
      status: ReviewStatus.APPROVED,
    },
  });

  const businessCustomer = await prisma.businessCustomer.upsert({
    where: { taxCode: "0312345678" },
    update: {
      companyName: "Công ty TNHH Demo F&B",
      contactName: "Anh Minh",
      phone: "0912000000",
      email: "purchase@demofnb.vn",
      address: "Quận 1, TP. Hồ Chí Minh",
      note: "Khách doanh nghiệp mua sỉ và OEM.",
    },
    create: {
      companyName: "Công ty TNHH Demo F&B",
      taxCode: "0312345678",
      contactName: "Anh Minh",
      phone: "0912000000",
      email: "purchase@demofnb.vn",
      address: "Quận 1, TP. Hồ Chí Minh",
      note: "Khách doanh nghiệp mua sỉ và OEM.",
    },
  });

  await prisma.quoteRequest.upsert({
    where: { id: 1 },
    update: {
      businessCustomerId: businessCustomer.id,
      companyName: businessCustomer.companyName,
      contactName: businessCustomer.contactName,
      phoneOrEmail: businessCustomer.email ?? businessCustomer.phone,
      productNeed: "Gia công cà phê rang xay private label 200kg/tháng",
      expectedQuantityKg: 200,
      note: "Cần tư vấn profile rang và bao bì.",
      status: QuoteRequestStatus.CONTACTED,
    },
    create: {
      businessCustomerId: businessCustomer.id,
      companyName: businessCustomer.companyName,
      contactName: businessCustomer.contactName,
      phoneOrEmail: businessCustomer.email ?? businessCustomer.phone,
      productNeed: "Gia công cà phê rang xay private label 200kg/tháng",
      expectedQuantityKg: 200,
      note: "Cần tư vấn profile rang và bao bì.",
      status: QuoteRequestStatus.CONTACTED,
    },
  });

  const contract = await prisma.contract.upsert({
    where: { contractCode: "HD-B2B-0001" },
    update: {
      businessCustomerId: businessCustomer.id,
      title: "Hợp đồng gia công cà phê private label",
      totalValue: 45000000,
      depositPercent: 30,
      status: ContractStatus.ACTIVE,
      note: "Thanh toán theo đợt, không thanh toán online.",
    },
    create: {
      businessCustomerId: businessCustomer.id,
      contractCode: "HD-B2B-0001",
      title: "Hợp đồng gia công cà phê private label",
      totalValue: 45000000,
      depositPercent: 30,
      status: ContractStatus.ACTIVE,
      note: "Thanh toán theo đợt, không thanh toán online.",
    },
  });

  const invoice = await prisma.invoice.upsert({
    where: { invoiceCode: "INV-B2B-0001" },
    update: {
      businessCustomerId: businessCustomer.id,
      contractId: contract.id,
      amount: 45000000,
      paidAmount: 13500000,
      status: InvoiceStatus.PARTIAL,
      note: "Đã cọc 30%, còn lại theo công nợ.",
    },
    create: {
      businessCustomerId: businessCustomer.id,
      contractId: contract.id,
      invoiceCode: "INV-B2B-0001",
      amount: 45000000,
      paidAmount: 13500000,
      dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14),
      status: InvoiceStatus.PARTIAL,
      note: "Đã cọc 30%, còn lại theo công nợ.",
    },
  });

  await prisma.debt.upsert({
    where: { debtCode: "CN-B2B-0001" },
    update: {
      businessCustomerId: businessCustomer.id,
      invoiceId: invoice.id,
      originalAmount: 31500000,
      remainingAmount: 31500000,
      status: DebtStatus.OPEN,
      note: "Công nợ còn lại sau tiền cọc.",
    },
    create: {
      businessCustomerId: businessCustomer.id,
      invoiceId: invoice.id,
      debtCode: "CN-B2B-0001",
      originalAmount: 31500000,
      remainingAmount: 31500000,
      dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14),
      status: DebtStatus.OPEN,
      note: "Công nợ còn lại sau tiền cọc.",
    },
  });

  const conversation = await prisma.chatbotConversation.create({
    data: {
      userId: customer.id,
      topic: "Tư vấn mua lẻ và báo giá B2B",
      isResolved: false,
      messages: {
        create: [
          {
            sender: "CUSTOMER",
            content: "Mình muốn mua 2kg cà phê và hỏi thêm giá sỉ.",
            intent: "retail_and_b2b_quote",
          },
          {
            sender: "BOT",
            content:
              "Nên chọn Robusta rang mộc nếu cần vị đậm để pha phin. Nếu mua sỉ, mình sẽ ghi nhận số lượng để nhân viên sales báo giá.",
            intent: "ai_buying_advice",
          },
        ],
      },
    },
  });

  console.log("Seed done", { conversationId: conversation.id });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
