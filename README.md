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
cp .env.example .env
npm run db:generate
npm run db:push
npm run db:seed
npm run dev
```

Nếu dùng PowerShell trên Windows:

```powershell
cd backend
npm install
Copy-Item .env.example .env
npm run db:generate
npm run db:push
npm run db:seed
npm run dev
```

Backend API:

```text
http://localhost:4000
http://localhost:4000/api
```

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
```

Admin:

```text
DELETE /api/products/:id
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
