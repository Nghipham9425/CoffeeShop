# Phu Tai Coffee Works

Do an website thuong mai dien tu cho nha may san xuat va mua di ban lai ca phe. Du an co 2 phan:

- `frontend`: React + Vite, giao dien website gioi thieu, san pham, lien he, mua le.
- `backend`: Node.js + Express + TypeScript + Prisma + PostgreSQL, API cho san pham, tai khoan, bao gia, don hang, thanh toan, ton kho, chatbot va admin.

## Yeu cau cai dat

- Node.js 22+
- npm 10+
- Docker Desktop
- Git

## Cau truc thu muc

```text
Coffee_B2B/
  backend/
    prisma/
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

## Chay database va pgAdmin

Tai thu muc goc du an:

```bash
docker compose up -d
```

Thong tin PostgreSQL:

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

Khi tao server trong pgAdmin:

```text
Host name/address: postgres
Port: 5432
Maintenance database: coffee_b2b
Username: postgres
Password: postgres
```

## Cac bang chinh trong database

Database hien tai duoc thu gon con 24 bang, vua du cho do an thuong mai dien tu ca phe:

```text
users
addresses
categories
products
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

Nhom chuc nang duoc bao phu:

```text
- Tai khoan, khach hang, dia chi
- San pham, danh muc, ton kho
- Khuyen mai
- Don hang, thanh toan, giao nhan, huy/hoan tien
- Danh gia san pham
- Khach hang than thiet/VIP
- B2B: bao gia, hop dong, hoa don, cong no
- Mua hang/nhap hang tu nha cung cap
- Chatbot tu van
- Lien he
```

## Chay backend local

```bash
cd backend
copy .env.example .env
npm install
npm run db:generate
npm run db:migrate
npm run db:seed
npm run dev
```

Neu chay tren PowerShell va chua co file `.env`, dung:

```powershell
Copy-Item .env.example .env
```

Backend API:

```text
http://localhost:4000
http://localhost:4000/api
```

Tai khoan admin seed:

```text
Email: admin@phutaicoffee.vn
Password: Admin@123
```

Tai khoan khach le seed:

```text
Email: khachle@example.com
Password: Customer@123
```

## Chay frontend local

Mo terminal khac:

```bash
cd frontend
npm install
npm run dev
```

Frontend mac dinh:

```text
http://localhost:5173
```

## Scripts backend

```bash
npm run dev          # chay server local
npm run build        # build TypeScript
npm run typecheck    # kiem tra type
npm run db:generate  # generate Prisma Client
npm run db:migrate   # tao migration va cap nhat DB
npm run db:seed      # them du lieu mau
```

## Scripts frontend

```bash
npm run dev
npm run build
npm run preview
```

## Ghi chu

- File `.env` khong commit len GitHub.
- Docker hien chi dung cho PostgreSQL va pgAdmin. Backend va frontend chay local bang npm de code nhanh.
- Neu muon xoa toan bo du lieu DB Docker:

```bash
docker compose down -v
```

Lenh tren se xoa volume PostgreSQL, chi dung khi muon reset DB.
