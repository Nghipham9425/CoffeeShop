# Phú Tài Coffee Works

## Cập nhật API nghiệp vụ

- Giá sản phẩm dùng `product_prices`; không dùng `products.price` trong checkout hoặc trang quản trị.
- Quản lý giá: `GET /api/products/:id/prices`, `POST /api/products/:id/prices`, `GET /api/products/:id/price-history`.
- Các route giá cũ dưới `/api/promotions` đã ngừng sử dụng. Promotion chỉ quản lý voucher/khuyến mãi.
- SePay dùng webhook chuẩn: `POST /api/sepay/webhook`. Khi khởi tạo thanh toán phải gửi `orderId` và `orderCode`.
- Sau khi thay đổi Prisma schema, chạy `cd backend && npm run db:push && npm run db:generate`.

Đồ án website thương mại điện tử cho mô hình nhà máy sản xuất, gia công và mua đi bán lại cà phê B2B/B2C.

- `frontend`: React + Vite, giao diện giới thiệu, sản phẩm, liên hệ và mua lẻ.
- `backend`: Node.js + Express + TypeScript + Prisma + PostgreSQL, API cho tài khoản, danh mục, sản phẩm, giá, báo giá, đơn hàng, thanh toán, tồn kho, chatbot và admin.
- `docs`: tài liệu kế hoạch, use case và mô hình hóa yêu cầu.

## Yêu cầu cài đặt

- Node.js 22+
- npm 10+
- Docker Desktop
- Git

## Cài project cho nhóm

Clone project:

```bash
git clone https://github.com/Nghipham9425/CoffeeShop.git
cd CoffeeShop
```

Tạo file `backend/.env` trước khi chạy backend. File này không commit lên GitHub.

```env
PORT=4000
NODE_ENV=development
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/coffee_b2b?schema=public"
JWT_SECRET="change-this-local-secret"
JWT_EXPIRES_IN="7d"
CLIENT_ORIGINS="http://localhost:3000,http://127.0.0.1:3000,http://localhost:5173,http://127.0.0.1:5173"
GOOGLE_CLIENT_ID="your-web-client-id.apps.googleusercontent.com"
```

Chạy database PostgreSQL và pgAdmin:

```bash
docker compose up -d
```

Chạy backend:

```bash
cd backend
npm install
npm run db:generate
npm run db:push
npm run db:seed
npm run dev
```

Mở terminal khác để chạy frontend:

```bash
cd frontend
npm install
npm run dev
```

URL sau khi chạy:

```text
Frontend: http://localhost:5173
Admin:    http://localhost:5173/admin
Backend:  http://localhost:4000/api
Swagger:  http://localhost:4000/api-docs
pgAdmin:  http://localhost:5050
```

Tài khoản admin seed:

```text
Email: admin@phutaicoffee.vn
Password: Admin@123
```

Nếu frontend chạy ở port khác, thêm origin đó vào `CLIENT_ORIGINS` trong `backend/.env`.

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
GOOGLE_CLIENT_ID="your-web-client-id.apps.googleusercontent.com"
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

Database hiện tại có 27 bảng, vừa đủ cho đồ án thương mại điện tử cà phê:

```text
users
oauth_accounts
password_reset_tokens
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

Để bật đăng nhập Google, tạo file `frontend/.env`:

```env
VITE_API_URL="http://localhost:4000/api"
VITE_GOOGLE_CLIENT_ID="your-web-client-id.apps.googleusercontent.com"
```

Hai biến `GOOGLE_CLIENT_ID` và `VITE_GOOGLE_CLIENT_ID` phải dùng cùng một Web Client ID. Trong Google Cloud Console, thêm origin frontend đang chạy, ví dụ `http://localhost:3000` hoặc `http://localhost:5173`.

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

## Tài khoản thử nghiệm

Chạy `npm run db:seed` trước khi dùng các tài khoản trong môi trường phát triển.

| Vai trò | Email | Mật khẩu | Phạm vi kiểm thử |
| --- | --- | --- | --- |
| Quản trị viên | `admin@phutaicoffee.vn` | `Admin@123` | Toàn bộ chức năng quản trị, quản lý người dùng và duyệt voucher |
| Nhân viên kinh doanh | `sales@phutaicoffee.vn` | `Staff@123` | Đơn hàng, báo giá B2B, khách hàng, sản phẩm và tạo voucher chờ duyệt |
| Nhân viên kho | `warehouse@phutaicoffee.vn` | `Staff@123` | Chỉ quản lý kho, tồn kho và lịch sử nhập/xuất kho |
| Kế toán | `accountant@phutaicoffee.vn` | `Staff@123` | Công nợ B2B, đơn hàng và báo cáo |
| Khách hàng B2C | `khachle@example.com` | `Customer@123` | Hồ sơ, giỏ hàng, đặt hàng và lịch sử đơn hàng |

Mật khẩu trên chỉ dùng để kiểm thử ở local. Cần thay đổi mật khẩu trước khi triển khai thực tế.
