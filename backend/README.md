# Phú Tài Coffee Works Backend

Backend Node.js + Express + TypeScript + Prisma + PostgreSQL cho đồ án nhà máy sản xuất cà phê B2B/B2C.

## Cấu trúc module

```text
src/
  config/
  controllers/
    Auth/Auth.controller.ts
    Category/Category.controller.ts
    Product/Product.controller.ts
    QuoteRequest/QuoteRequest.controller.ts
  data/
    Auth/User.data.ts
    Category/Category.data.ts
    Product/Product.data.ts
    QuoteRequest/QuoteRequest.data.ts
  middleware/
  models/
    Category/Category.model.ts
    Product/Product.model.ts
  routes/
    Auth/Auth.routes.ts
    Category/Category.routes.ts
    Product/Product.routes.ts
    QuoteRequest/QuoteRequest.routes.ts
  services/
    Auth/Auth.service.ts
    Category/Category.service.ts
    Product/Product.service.ts
    QuoteRequest/QuoteRequest.service.ts
  tests/
  utils/
  validators/
    Auth/Auth.validator.ts
    Category/Category.validator.ts
    Product/Product.validator.ts
    QuoteRequest/QuoteRequest.validator.ts
```

## Chạy database bằng Docker

Từ thư mục gốc `D:\Coffee_B2B`:

```bash
docker compose up -d
```

Compose hiện tại chỉ chạy PostgreSQL và pgAdmin:

```text
PostgreSQL: localhost:5432
Database:   coffee_b2b
User:       postgres
Password:   postgres

pgAdmin:    http://localhost:5050
Email:      admin@phutaicoffee.vn
Password:   admin123
```

## Chạy backend local

```bash
npm install
cp .env.example .env
npm run db:generate
npm run db:push
npm run db:seed
npm run dev
```

PowerShell:

```powershell
npm install
Copy-Item .env.example .env
npm run db:generate
npm run db:push
npm run db:seed
npm run dev
```

API mặc định:

```text
http://localhost:4000/api
http://localhost:4000/api-docs
```

## Swagger API Docs

Sau khi chạy backend:

```text
http://localhost:4000/api-docs
```

Cách dùng endpoint cần đăng nhập:

1. Gọi `POST /api/auth/login`.
2. Copy `token` trả về.
3. Bấm `Authorize` ở góc phải Swagger.
4. Nhập `Bearer <token>`.
5. Gọi các API admin/sales như tạo danh mục, tạo sản phẩm, cập nhật báo giá.

## Seed data

```bash
npm run db:seed
```

Seed hiện có:

- Admin: `admin@phutaicoffee.vn` / `Admin@123`
- Khách lẻ: `khachle@example.com` / `Customer@123`
- Danh mục, sản phẩm, giá B2C/B2B/VIP, tồn kho.
- Đơn hàng, thanh toán online demo, giao nhận, đánh giá.
- Khách B2B, báo giá, hợp đồng, hóa đơn, công nợ.
- Chatbot và liên hệ.

## Endpoint mẫu

```text
POST /api/auth/register
POST /api/auth/login

POST /api/contact-messages
GET  /api/contact-messages                  ADMIN/SALES
GET  /api/contact-messages/:id              ADMIN/SALES
PATCH /api/contact-messages/:id/read-status ADMIN/SALES
DELETE /api/contact-messages/:id            ADMIN

GET  /api/categories
GET  /api/categories/:id
POST /api/categories              ADMIN/SALES
PATCH /api/categories/:id         ADMIN/SALES
DELETE /api/categories/:id        ADMIN

GET  /api/products
GET  /api/products/:id
POST /api/products                ADMIN/SALES
PATCH /api/products/:id           ADMIN/SALES
DELETE /api/products/:id          ADMIN
POST /api/products/:id/prices     ADMIN/SALES

POST /api/quote-requests
GET  /api/quote-requests          ADMIN/SALES
GET  /api/quote-requests/:id      ADMIN/SALES
PATCH /api/quote-requests/:id/status ADMIN/SALES
GET  /api/health
```

## Database

Database hiện tại gồm 25 bảng chính:

```text
users, addresses, categories, products, product_prices, inventories, stock_movements,
promotions, orders, order_items, payments, shipments, reviews,
loyalty_profiles, business_customers, quote_requests, contracts,
invoices, debts, suppliers, purchase_orders, purchase_order_items,
chatbot_conversations, chatbot_messages, contact_messages
```
