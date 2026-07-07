# Phú Tài Coffee Works

Đồ án website thương mại điện tử cho mô hình nhà máy sản xuất, gia công và mua đi bán lại cà phê B2B/B2C.

- `frontend`: React + Vite, giao diện giới thiệu, sản phẩm, liên hệ và mua lẻ.
- `backend`: Node.js + Express + TypeScript + Prisma + PostgreSQL, API cho tài khoản, danh mục, sản phẩm, giá, báo giá, đơn hàng, thanh toán, tồn kho, chatbot và admin.
- `docs`: tài liệu kế hoạch, use case và mô hình hóa yêu cầu.

## Yêu cầu cài đặt

- Node.js 22+
- npm 10+
- Docker Desktop
- Git

## Cấu trúc thư mục

```text
Coffee_B2B/
  backend/
    prisma/
      schema.prisma
      seed.ts
    src/
      config/
      controllers/
      data/
      middleware/
      models/
      routes/
      services/
      tests/
      utils/
      validators/
  docs/
  frontend/
  docker-compose.yml
```

## Chạy PostgreSQL và pgAdmin

Tại thư mục gốc dự án:

```bash
docker compose up -d
```

Thông tin PostgreSQL:

```text
Host: localhost
Port: 5432
Database: coffee_b2b
Username: postgres
Password: postgres
```

pgAdmin:

```text
URL: http://localhost:5050
Email: admin@phutaicoffee.vn
Password: admin123
```

Khi tạo server trong pgAdmin:

```text
Host name/address: postgres
Port: 5432
Maintenance database: coffee_b2b
Username: postgres
Password: postgres
```

## Chạy backend local

```bash
cd backend
npm install
npm run db:generate
npm run db:push
npm run db:seed
npm run dev
```

Nếu dùng PowerShell trên Windows:

```powershell
cd backend
npm install
npm run db:generate
npm run db:push
npm run db:seed
npm run dev
```

Tạo file `backend/.env` trước khi chạy database:

```env
PORT=4000
NODE_ENV=development
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/coffee_b2b?schema=public"
JWT_SECRET="change-this-local-secret"
JWT_EXPIRES_IN="7d"
CLIENT_ORIGINS="http://localhost:3000,http://127.0.0.1:3000,http://localhost:5173,http://127.0.0.1:5173"
```

Backend API:

```text
http://localhost:4000
http://localhost:4000/api
http://localhost:4000/api-docs
```

Swagger API Docs:

- Mở `http://localhost:4000/api-docs`.
- Đăng nhập bằng `POST /api/auth/login` để lấy `token`.
- Bấm nút `Authorize` trong Swagger.
- Nhập token theo dạng `Bearer <token>`.
- Các endpoint có khóa sẽ gọi được bằng tài khoản admin/sales seed.

## Seed data

Lệnh seed:

```bash
cd backend
npm run db:seed
```

Dữ liệu mẫu có tiếng Việt rõ ràng, gồm:

- Danh mục: `Cà phê rang xay`, `Gia công OEM`.
- Sản phẩm: `Robusta rang mộc`, `Espresso Blend`, `Gia công nhãn riêng OEM`.
- Giá bán lẻ/B2B/VIP trong bảng `product_prices`.
- Đơn hàng khách lẻ thanh toán online demo.
- Khách doanh nghiệp B2B, báo giá, hợp đồng, hóa đơn và công nợ.
- Dữ liệu tồn kho, nhập hàng, đánh giá, chatbot và liên hệ.

Tài khoản admin seed:

```text
Email: admin@phutaicoffee.vn
Password: Admin@123
```

Tài khoản khách lẻ seed:

```text
Email: khachle@example.com
Password: Customer@123
```

## Endpoint chính

Public:

```text
GET  /api/health
GET  /api/categories
GET  /api/categories/:id
GET  /api/products
GET  /api/products/:id
POST /api/contact-messages
POST /api/auth/register
POST /api/auth/login
POST /api/quote-requests
```

Admin/Sales:

```text
POST   /api/categories
PATCH  /api/categories/:id
DELETE /api/categories/:id

POST   /api/products
PATCH  /api/products/:id
POST   /api/products/:id/prices

GET    /api/contact-messages
GET    /api/contact-messages/:id
PATCH  /api/contact-messages/:id/read-status

GET    /api/quote-requests
GET    /api/quote-requests/:id
PATCH  /api/quote-requests/:id/status

GET    /api/orders
GET    /api/orders/:id
PATCH  /api/orders/:id/status
PATCH  /api/orders/:id/shipment
PATCH  /api/orders/payments/:id/status

GET    /api/inventories
PATCH  /api/inventories/:id
POST   /api/inventories/movements

GET    /api/customers/retail
PATCH  /api/customers/retail/:id
GET    /api/customers/business
POST   /api/customers/business
PATCH  /api/customers/business/:id

GET    /api/reports/overview
```

Admin:

```text
DELETE /api/products/:id
DELETE /api/contact-messages/:id
```

## Các bảng chính trong database

Database hiện tại được thu gọn còn 25 bảng, vừa đủ cho đồ án thương mại điện tử cà phê:

```text
users
addresses
categories
products
product_prices
inventories
stock_movements
promotions
orders
order_items
payments
shipments
reviews
loyalty_profiles
business_customers
quote_requests
contracts
invoices
debts
suppliers
purchase_orders
purchase_order_items
chatbot_conversations
chatbot_messages
contact_messages
```

## Chạy frontend local

Mở terminal khác:

```bash
cd frontend
npm install
npm run dev
```

Frontend mặc định:

```text
http://localhost:5173
```

## Scripts backend

```bash
npm run dev          # chạy server local
npm run build        # build TypeScript
npm run typecheck    # kiểm tra type
npm run db:generate  # generate Prisma Client
npm run db:push      # đồng bộ schema Prisma vào PostgreSQL
npm run db:migrate   # tạo migration khi cần làm version DB nghiêm túc
npm run db:seed      # thêm dữ liệu mẫu
```

## Ghi chú

- File `.env` không commit lên GitHub.
- Docker hiện chỉ dùng cho PostgreSQL và pgAdmin. Backend/frontend chạy local bằng npm để code nhanh.
- Nếu muốn reset toàn bộ database Docker:

```bash
docker compose down -v
docker compose up -d
cd backend
npm run db:push
npm run db:seed
```
