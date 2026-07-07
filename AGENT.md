# AGENT.md - Tiến độ dự án Phú Tài Coffee Works

Cập nhật lần cuối: 07/07/2026
Thư mục dự án: `D:\Coffee_B2B`

## Mục tiêu

Xây dựng website thương mại điện tử cho nhà máy sản xuất, rang xay, gia công và mua đi bán lại cà phê theo mô hình B2B/B2C.

Phạm vi chính:
- Website giới thiệu nhà máy, dịch vụ rang xay, OEM/private label và sản phẩm cà phê.
- B2C: khách lẻ xem sản phẩm, mua hàng, COD/online mock, giao nhận, đánh giá.
- B2B: khách doanh nghiệp gửi yêu cầu báo giá, quản lý hợp đồng, hóa đơn và công nợ.
- Admin: quản lý sản phẩm, danh mục, bảng giá, đơn hàng, tồn kho, khách hàng, báo giá, liên hệ và báo cáo.
- Chatbot/AI tư vấn mua hàng sẽ làm sau.

## Công nghệ

Frontend:
- React + Vite + TypeScript
- Tailwind CSS
- React Router
- Lucide icons
- Component style gần shadcn, tự tách component theo module admin/client.

Backend:
- Node.js + Express + TypeScript
- Prisma ORM
- PostgreSQL
- JWT auth
- Zod validation
- Swagger API docs

Database/dev:
- PostgreSQL và pgAdmin chạy bằng Docker Compose.
- Backend ưu tiên chạy local.
- Frontend chạy Vite.

## Cập nhật mới nhất

Đã hoàn thành trong lượt gần nhất:
- Backend mở CORS cho `localhost:3000`, `127.0.0.1:3000`, `localhost:5173`, `127.0.0.1:5173` qua `CLIENT_ORIGINS`.
- Thêm API admin cho đơn hàng:
  - `GET /api/orders`
  - `GET /api/orders/:id`
  - `PATCH /api/orders/:id/status`
  - `PATCH /api/orders/:id/shipment`
  - `PATCH /api/orders/payments/:id/status`
- Thêm API admin cho tồn kho:
  - `GET /api/inventories`
  - `PATCH /api/inventories/:id`
  - `POST /api/inventories/movements`
- Thêm API admin cho khách hàng:
  - `GET /api/customers/retail`
  - `PATCH /api/customers/retail/:id`
  - `GET /api/customers/business`
  - `POST /api/customers/business`
  - `PATCH /api/customers/business/:id`
- Thêm API báo cáo:
  - `GET /api/reports/overview`
- Admin đã nối dữ liệu thật cho:
  - Danh mục
  - Sản phẩm và giá B2C/B2B/VIP
  - Đơn hàng
  - Tồn kho
  - Khách hàng
  - Liên hệ
  - Báo cáo
- README đã bỏ hướng dẫn copy `.env.example`, thay bằng block `.env` tự tạo để không cần push file env mẫu.
- `npm run build` backend pass.
- `npm run build` frontend pass.

## API đã có

Public:
- `GET /api/health`
- `GET /api/categories`
- `GET /api/categories/:id`
- `GET /api/products`
- `GET /api/products/:id`
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/quote-requests`
- `POST /api/contact-messages`

Admin/Sales:
- CRUD danh mục: `/api/categories`
- CRUD sản phẩm: `/api/products`
- Thêm/cập nhật giá sản phẩm: `/api/products/:id/prices`
- Quản lý báo giá: `/api/quote-requests`
- Quản lý liên hệ: `/api/contact-messages`
- Quản lý đơn hàng: `/api/orders`
- Quản lý tồn kho: `/api/inventories`
- Quản lý khách hàng: `/api/customers`
- Báo cáo tổng quan: `/api/reports/overview`

## Database

Nguồn chuẩn: `backend/prisma/schema.prisma`

Hiện có 25 bảng:
- Tài khoản: `users`, `addresses`
- Sản phẩm/kho: `categories`, `products`, `product_prices`, `inventories`, `stock_movements`
- B2C: `promotions`, `orders`, `order_items`, `payments`, `shipments`, `reviews`, `loyalty_profiles`
- B2B/công nợ: `business_customers`, `quote_requests`, `contracts`, `invoices`, `debts`
- Mua hàng: `suppliers`, `purchase_orders`, `purchase_order_items`
- Chatbot/liên hệ: `chatbot_conversations`, `chatbot_messages`, `contact_messages`

Tài liệu DB:
- `docs/cau_truc_database_phu_tai_coffee_works.docx`
- `docs/erd_class_diagrams.md`

## Frontend

Public pages:
- `frontend/src/pages/client/Home/HomePage.tsx`
- `frontend/src/pages/client/Products/ProductsPage.tsx`
- `frontend/src/pages/client/Services/ServicesPage.tsx`
- `frontend/src/pages/client/Quote/QuotePage.tsx`
- `frontend/src/pages/client/About/AboutPage.tsx`
- `frontend/src/pages/client/Contact/ContactPage.tsx`

Admin pages:
- `frontend/src/pages/admin/home/HomePage.tsx`
- `frontend/src/pages/admin/login/LoginPage.tsx`
- `frontend/src/pages/admin/products/ProductsPage.tsx`
- `frontend/src/pages/admin/categories/CategoriesPage.tsx`
- `frontend/src/pages/admin/orders/OrdersPage.tsx`
- `frontend/src/pages/admin/quotes/QuotesPage.tsx`
- `frontend/src/pages/admin/customers/CustomersPage.tsx`
- `frontend/src/pages/admin/inventory/InventoryPage.tsx`
- `frontend/src/pages/admin/contacts/ContactsPage.tsx`
- `frontend/src/pages/admin/reports/ReportsPage.tsx`

Admin components:
- `frontend/src/components/admin/AdminAuthCard.tsx`
- `frontend/src/components/admin/AdminMetricCard.tsx`
- `frontend/src/components/admin/AdminPanel.tsx`
- `frontend/src/components/admin/AdminSidebar.tsx`
- `frontend/src/components/admin/AdminStatusBadge.tsx`
- `frontend/src/components/admin/AdminTopbar.tsx`

API helper:
- `frontend/src/lib/adminApi.ts`

## Lệnh chạy

Database:
```bash
docker compose up -d
```

Backend:
```bash
cd backend
npm install
npm run db:generate
npm run db:push
npm run db:seed
npm run dev
```

Frontend:
```bash
cd frontend
npm install
npm run dev
```

Build:
```bash
cd backend
npm run build

cd ../frontend
npm run build
```

## Tài khoản seed

Admin:
```text
Email: admin@phutaicoffee.vn
Password: Admin@123
```

Khách lẻ:
```text
Email: khachle@example.com
Password: Customer@123
```

## Việc nên làm tiếp

Ưu tiên gần nhất:
1. Test thủ công toàn bộ admin CRUD trên browser với backend và database thật.
2. Làm API tạo đơn hàng B2C từ giỏ hàng phía client.
3. Làm promotion/voucher CRUD và áp dụng mã giảm giá khi checkout.
4. Làm CRUD hợp đồng, hóa đơn, công nợ B2B.
5. Làm chatbot tư vấn mua hàng bản mock trước, AI thật sau.
6. Thêm test backend cho auth, product, order, inventory.
7. Bổ sung Swagger docs cho các endpoint mới.
