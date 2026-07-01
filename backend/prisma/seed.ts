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
  PurchaseOrderStatus,
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

  const robusta = await prisma.product.upsert({
    where: { slug: "robusta-rang-moc" },
    update: {
      categoryId: roastedCategory.id,
      name: "Robusta rang mộc",
      description: "Vị đậm, hậu cacao, phù hợp quán pha phin và đại lý.",
      price: 145000,
      minimumOrderKg: 5,
      isRetail: true,
      isB2b: true,
    },
    create: {
      categoryId: roastedCategory.id,
      name: "Robusta rang mộc",
      slug: "robusta-rang-moc",
      description: "Vị đậm, hậu cacao, phù hợp quán pha phin và đại lý.",
      price: 145000,
      minimumOrderKg: 5,
      isRetail: true,
      isB2b: true,
    },
  });

  const espresso = await prisma.product.upsert({
    where: { slug: "espresso-blend" },
    update: {
      categoryId: roastedCategory.id,
      name: "Espresso Blend",
      description: "Blend ổn định crema cho quán máy, nhà hàng và khách sạn.",
      price: 185000,
      minimumOrderKg: 5,
      isRetail: true,
      isB2b: true,
    },
    create: {
      categoryId: roastedCategory.id,
      name: "Espresso Blend",
      slug: "espresso-blend",
      description: "Blend ổn định crema cho quán máy, nhà hàng và khách sạn.",
      price: 185000,
      minimumOrderKg: 5,
      isRetail: true,
      isB2b: true,
    },
  });

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

  await prisma.inventory.deleteMany({
    where: { warehouse: "Kho thanh pham" },
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

  await prisma.supplier.updateMany({
    where: { name: "Hop tac xa ca phe Lam Dong" },
    data: {
      name: "Hợp tác xã cà phê Lâm Đồng",
      address: "Lâm Đồng",
      note: "Nhà cung cấp hạt nhân Robusta và Arabica.",
    },
  });

  const supplier = await prisma.supplier.upsert({
    where: { name: "Hợp tác xã cà phê Lâm Đồng" },
    update: {
      phone: "0263000000",
      email: "supplier@example.com",
      address: "Lâm Đồng",
      note: "Nhà cung cấp hạt nhân Robusta và Arabica.",
    },
    create: {
      name: "Hợp tác xã cà phê Lâm Đồng",
      phone: "0263000000",
      email: "supplier@example.com",
      address: "Lâm Đồng",
      note: "Nhà cung cấp hạt nhân Robusta và Arabica.",
    },
  });

  await prisma.purchaseOrder.upsert({
    where: { purchaseCode: "PO-0001" },
    update: {
      supplierId: supplier.id,
      totalAmount: 18000000,
      status: PurchaseOrderStatus.RECEIVED,
      note: "Đặt mua hàng đầu vào cho sản xuất.",
    },
    create: {
      supplierId: supplier.id,
      purchaseCode: "PO-0001",
      expectedDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
      receivedAt: new Date(),
      totalAmount: 18000000,
      status: PurchaseOrderStatus.RECEIVED,
      note: "Đặt mua hàng đầu vào cho sản xuất.",
      items: {
        create: [
          {
            productId: robusta.id,
            quantity: 100,
            unitCost: 90000,
            lineTotal: 9000000,
          },
          {
            productId: espresso.id,
            quantity: 60,
            unitCost: 150000,
            lineTotal: 9000000,
          },
        ],
      },
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

  await prisma.contactMessage.create({
    data: {
      fullName: "Khách liên hệ demo",
      phone: "0909123456",
      email: "contact@example.com",
      subject: "Cần báo giá cà phê rang xay",
      message: "Tôi cần tư vấn mua sỉ cà phê rang xay cho chuỗi quán.",
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
