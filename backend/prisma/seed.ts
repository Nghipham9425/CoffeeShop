import bcrypt from "bcryptjs";
import {
  ContractStatus,
  DebtStatus,
  DiscountType,
  InvoiceStatus,
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
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
    update: {},
    create: {
      fullName: "Admin Phu Tai Coffee",
      email: "admin@phutaicoffee.vn",
      passwordHash: adminPasswordHash,
      phone: "0886332533",
      role: UserRole.ADMIN,
    },
  });

  const customer = await prisma.user.upsert({
    where: { email: "khachle@example.com" },
    update: {},
    create: {
      fullName: "Khach le demo",
      email: "khachle@example.com",
      passwordHash: customerPasswordHash,
      phone: "0909000001",
      role: UserRole.CUSTOMER,
    },
  });

  const address = await prisma.address.upsert({
    where: { id: 1 },
    update: {},
    create: {
      userId: customer.id,
      receiverName: "Khach le demo",
      phone: "0909000001",
      province: "TP. Ho Chi Minh",
      district: "Tan Binh",
      ward: "Phuong 15",
      detail: "KCN Tan Binh",
      isDefault: true,
    },
  });

  const roastedCategory = await prisma.category.upsert({
    where: { slug: "ca-phe-rang-xay" },
    update: {},
    create: {
      name: "Ca phe rang xay",
      slug: "ca-phe-rang-xay",
      description: "San pham ca phe rang xay cho ban le va ban si.",
    },
  });

  const oemCategory = await prisma.category.upsert({
    where: { slug: "gia-cong-oem" },
    update: {},
    create: {
      name: "Gia cong OEM",
      slug: "gia-cong-oem",
      description: "Dich vu rang, phoi tron va dong goi theo thuong hieu rieng.",
    },
  });

  const robusta = await prisma.product.upsert({
    where: { slug: "robusta-rang-moc" },
    update: {},
    create: {
      categoryId: roastedCategory.id,
      name: "Robusta rang moc",
      slug: "robusta-rang-moc",
      description: "Vi dam, hau cacao, phu hop quan phin va dai ly.",
      price: 145000,
      minimumOrderKg: 5,
      isRetail: true,
      isB2b: true,
    },
  });

  const espresso = await prisma.product.upsert({
    where: { slug: "espresso-blend" },
    update: {},
    create: {
      categoryId: roastedCategory.id,
      name: "Espresso Blend",
      slug: "espresso-blend",
      description: "Blend on dinh crema cho quan may, nha hang va khach san.",
      price: 185000,
      minimumOrderKg: 5,
      isRetail: true,
      isB2b: true,
    },
  });

  await prisma.product.upsert({
    where: { slug: "oem-private-label" },
    update: {},
    create: {
      categoryId: oemCategory.id,
      name: "OEM Private Label",
      slug: "oem-private-label",
      description: "Gia cong profile rang, blend va bao bi theo yeu cau doanh nghiep.",
      minimumOrderKg: 50,
      isRetail: false,
      isB2b: true,
    },
  });

  await prisma.inventory.upsert({
    where: { productId_warehouse: { productId: robusta.id, warehouse: "Kho thanh pham" } },
    update: { quantity: 120, minQuantity: 20 },
    create: {
      productId: robusta.id,
      quantity: 120,
      minQuantity: 20,
      warehouse: "Kho thanh pham",
    },
  });

  await prisma.inventory.upsert({
    where: { productId_warehouse: { productId: espresso.id, warehouse: "Kho thanh pham" } },
    update: { quantity: 80, minQuantity: 15 },
    create: {
      productId: espresso.id,
      quantity: 80,
      minQuantity: 15,
      warehouse: "Kho thanh pham",
    },
  });

  await prisma.stockMovement.createMany({
    data: [
      {
        productId: robusta.id,
        type: StockMovementType.IMPORT,
        quantity: 120,
        reason: "Nhap kho dau ky",
        reference: "OPENING-STOCK",
      },
      {
        productId: espresso.id,
        type: StockMovementType.IMPORT,
        quantity: 80,
        reason: "Nhap kho dau ky",
        reference: "OPENING-STOCK",
      },
    ],
  });

  const promotion = await prisma.promotion.upsert({
    where: { code: "RETAIL10" },
    update: {},
    create: {
      name: "Giam 10% cho khach mua le",
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
    update: {},
    create: {
      userId: customer.id,
      addressId: address.id,
      promotionId: promotion.id,
      orderCode: "PTCW-RETAIL-0001",
      customerName: "Khach le demo",
      customerPhone: "0909000001",
      customerEmail: "khachle@example.com",
      subtotal: 515000,
      shippingFee: 30000,
      discountAmount: 0,
      totalAmount: 545000,
      status: OrderStatus.CONFIRMED,
      note: "Don hang khach le thanh toan online demo.",
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
    update: {},
    create: {
      orderId: retailOrder.id,
      carrier: "Giao hang nhanh",
      trackingCode: "GHN-DEMO-0001",
      status: ShipmentStatus.PACKED,
      note: "Don hang da dong goi, cho lay hang.",
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
    update: {},
    create: {
      userId: customer.id,
      productId: robusta.id,
      orderId: retailOrder.id,
      rating: 5,
      content: "Ca phe thom, phu hop pha phin.",
      status: ReviewStatus.APPROVED,
    },
  });

  const businessCustomer = await prisma.businessCustomer.upsert({
    where: { taxCode: "0312345678" },
    update: {},
    create: {
      companyName: "Cong ty TNHH Demo F&B",
      taxCode: "0312345678",
      contactName: "Anh Minh",
      phone: "0912000000",
      email: "purchase@demofnb.vn",
      address: "Quan 1, TP. Ho Chi Minh",
      note: "Khach doanh nghiep mua si va OEM.",
    },
  });

  await prisma.quoteRequest.upsert({
    where: { id: 1 },
    update: {},
    create: {
      businessCustomerId: businessCustomer.id,
      companyName: businessCustomer.companyName,
      contactName: businessCustomer.contactName,
      phoneOrEmail: businessCustomer.email ?? businessCustomer.phone,
      productNeed: "Gia cong ca phe rang xay private label 200kg/thang",
      expectedQuantityKg: 200,
      note: "Can tu van profile rang va bao bi.",
      status: QuoteRequestStatus.CONTACTED,
    },
  });

  const contract = await prisma.contract.upsert({
    where: { contractCode: "HD-B2B-0001" },
    update: {},
    create: {
      businessCustomerId: businessCustomer.id,
      contractCode: "HD-B2B-0001",
      title: "Hop dong gia cong ca phe private label",
      totalValue: 45000000,
      depositPercent: 30,
      status: ContractStatus.ACTIVE,
      note: "Thanh toan theo dot, khong thanh toan online.",
    },
  });

  const invoice = await prisma.invoice.upsert({
    where: { invoiceCode: "INV-B2B-0001" },
    update: {},
    create: {
      businessCustomerId: businessCustomer.id,
      contractId: contract.id,
      invoiceCode: "INV-B2B-0001",
      amount: 45000000,
      paidAmount: 13500000,
      dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14),
      status: InvoiceStatus.PARTIAL,
      note: "Da coc 30%, con lai theo cong no.",
    },
  });

  await prisma.debt.upsert({
    where: { debtCode: "CN-B2B-0001" },
    update: {},
    create: {
      businessCustomerId: businessCustomer.id,
      invoiceId: invoice.id,
      debtCode: "CN-B2B-0001",
      originalAmount: 31500000,
      remainingAmount: 31500000,
      dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14),
      status: DebtStatus.OPEN,
      note: "Cong no con lai sau tien coc.",
    },
  });

  const supplier = await prisma.supplier.upsert({
    where: { name: "Hop tac xa ca phe Lam Dong" },
    update: {},
    create: {
      name: "Hop tac xa ca phe Lam Dong",
      phone: "0263000000",
      email: "supplier@example.com",
      address: "Lam Dong",
      note: "Nha cung cap hat nhan Robusta va Arabica.",
    },
  });

  await prisma.purchaseOrder.upsert({
    where: { purchaseCode: "PO-0001" },
    update: {},
    create: {
      supplierId: supplier.id,
      purchaseCode: "PO-0001",
      expectedDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
      receivedAt: new Date(),
      totalAmount: 18000000,
      status: PurchaseOrderStatus.RECEIVED,
      note: "Dat mua hang dau vao cho san xuat.",
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
      topic: "Tu van mua le va bao gia B2B",
      isResolved: false,
      messages: {
        create: [
          {
            sender: "CUSTOMER",
            content: "Minh muon mua 2kg ca phe va hoi them gia si.",
            intent: "retail_and_b2b_quote",
          },
          {
            sender: "BOT",
            content:
              "Nen chon Robusta rang moc neu can vi dam de pha phin. Neu mua si, minh se ghi nhan so luong de nhan vien sales bao gia.",
            intent: "ai_buying_advice",
          },
        ],
      },
    },
  });

  await prisma.contactMessage.create({
    data: {
      fullName: "Khach lien he demo",
      phone: "0909123456",
      email: "contact@example.com",
      subject: "Can bao gia ca phe rang xay",
      message: "Toi can tu van mua si ca phe rang xay cho chuoi quan.",
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
