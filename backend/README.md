# Phu Tai Coffee Works Backend

Backend Node.js + Express + TypeScript + Prisma + PostgreSQL cho do an nha may san xuat ca phe B2B/B2C.

## Cau truc

```text
src/
  config/                    cau hinh env
  controllers/
    Product/Product.controller.ts
    Auth/Auth.controller.ts
  data/
    Product/Product.data.ts  Prisma query theo module
    Auth/User.data.ts
  middleware/                middleware dung chung
  models/
    Product/Product.model.ts type/model dung trong ung dung
  routes/
    Product/Product.routes.ts
    Auth/Auth.routes.ts
  services/
    Product/Product.service.ts
    Auth/Auth.service.ts
  tests/                     test sau nay
  utils/                     ham tien ich
  validators/
    Product/Product.validator.ts
    Auth/Auth.validator.ts
```

## Chay database bang Docker

Tu thu muc goc `D:\Coffee_B2B`:

```bash
docker compose up -d
```

Compose hien tai chay PostgreSQL va pgAdmin:

```text
PostgreSQL: localhost:5432
Database:   coffee_b2b
User:       postgres
Password:   postgres

pgAdmin:    http://localhost:5050
Email:      admin@phutaicoffee.vn
Password:   admin123
```

## Chay backend local

```bash
cp .env.example .env
npm install
npm run db:generate
npm run db:migrate
npm run db:seed
npm run dev
```

Neu dung PowerShell tren Windows:

```powershell
Copy-Item .env.example .env
```

API mac dinh:

```text
http://localhost:4000/api
```

## Endpoint mau

```text
POST /api/auth/register
POST /api/auth/login
GET  /api/products
GET  /api/products/:id
POST /api/quote-requests
GET  /api/quote-requests  Bearer token, role ADMIN/SALES
GET  /api/health
```

## Database

Sau khi tao database PostgreSQL `coffee_b2b` va sua `DATABASE_URL` trong `.env`:

```bash
npm run db:migrate
npm run db:seed
```

Database hien tai gom 24 bang chinh:

```text
users, addresses, categories, products, inventories, stock_movements,
promotions, orders, order_items, payments, shipments, reviews,
loyalty_profiles, business_customers, quote_requests, contracts,
invoices, debts, suppliers, purchase_orders, purchase_order_items,
chatbot_conversations, chatbot_messages, contact_messages
```

Tai khoan seed:

```text
Email: admin@phutaicoffee.vn
Password: Admin@123
```
