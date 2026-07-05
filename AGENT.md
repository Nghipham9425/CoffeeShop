# AGENT.md - Tiến độ dự án Phú Tài Coffee Works

Cập nhật lần cuối: 05/07/2026  
Thư mục dự án: `D:\Coffee_B2B`

## 1. Mục tiêu dự án

Xây dựng website thương mại điện tử cho nhà máy sản xuất cà phê theo mô hình B2B/B2C.

Phạm vi chính:
- Website giới thiệu nhà máy, dịch vụ rang xay, gia công, OEM/private label.
- Bán lẻ B2C: xem sản phẩm, đặt hàng, thanh toán online/COD, giao nhận, đánh giá.
- Bán doanh nghiệp B2B: gửi yêu cầu báo giá, quản lý khách doanh nghiệp, hợp đồng, hóa đơn, công nợ.
- Admin: quản lý sản phẩm, danh mục, bảng giá, tồn kho, báo giá, liên hệ, đơn hàng, khách hàng, báo cáo.
- Chatbot/AI tư vấn mua hàng theo nhu cầu khách.

## 2. Công nghệ đang dùng

Frontend:
- React + Vite + TypeScript
- Tailwind CSS
- React Router
- Lucide icons
- Component style gần shadcn, chưa cài shadcn CLI chính thức

Backend:
- Node.js + Express + TypeScript
- Prisma ORM
- PostgreSQL
- JWT auth
- Zod validation
- Swagger API docs

Database/devops:
- PostgreSQL qua Docker Compose
- pgAdmin qua Docker Compose
- Backend ưu tiên chạy local, database chạy container

## 3. Trạng thái Git hiện tại

Commit gần nhất:
- `5d6d165 docs: add swagger api documentation`

Worktree hiện có thay đổi chưa commit:
- Tài liệu mới trong `docs/`.
- Public pages đã được chuyển sang `frontend/src/pages/client/`.
- Admin UI đã tách lại theo cấu trúc `frontend/src/pages/admin/<module>/<ModulePage>.tsx`.
- Chưa commit/push các thay đổi mới.

Các file/thư mục đáng chú ý đang uncommitted:
- `AGENT.md`
- `docs/cau_truc_database_phu_tai_coffee_works.docx`
- `docs/erd_class_diagrams.md`
- `docs/mo_ta_csdl_phu_tai_coffee_works.docx`
- `frontend/src/components/admin/`
- `frontend/src/data/admin.ts`
- `frontend/src/lib/adminApi.ts`
- `frontend/src/pages/client/`
- `frontend/src/pages/admin/`

## 4. Backend hiện tại

Cấu trúc backend:
- `src/config`: cấu hình env, swagger
- `src/controllers`: nhận request/response
- `src/data`: truy cập Prisma/database
- `src/middleware`: auth, error handler, async handler, not found
- `src/models`: kiểu dữ liệu trả về
- `src/routes`: định tuyến API
- `src/services`: xử lý nghiệp vụ
- `src/utils`: tiện ích
- `src/validators`: validate input bằng Zod

API đã có:
- `GET /api/health`
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/categories`
- `GET /api/categories/:id`
- `POST /api/categories` protected
- `PATCH /api/categories/:id` protected
- `DELETE /api/categories/:id` protected
- `GET /api/products`
- `GET /api/products/:id`
- `POST /api/products` protected
- `PATCH /api/products/:id` protected
- `DELETE /api/products/:id` protected
- `POST /api/products/:id/prices` protected
- `POST /api/quote-requests`
- `GET /api/quote-requests` protected
- `GET /api/quote-requests/:id` protected
- `PATCH /api/quote-requests/:id/status` protected
- `POST /api/contact-messages`
- `GET /api/contact-messages` protected
- `GET /api/contact-messages/:id` protected
- `PATCH /api/contact-messages/:id/read-status` protected
- `DELETE /api/contact-messages/:id` protected

Backend đã có:
- Auth cơ bản bằng email/password.
- Trường `phone` trong đăng ký tài khoản.
- Phân quyền theo role qua JWT.
- CRUD danh mục.
- CRUD sản phẩm và bảng giá sản phẩm.
- Tạo/xử lý yêu cầu báo giá B2B.
- Tạo/xử lý tin nhắn liên hệ.
- Swagger docs.
- Seed data có admin/customer/category/product/price/inventory/order/payment/shipment/B2B/contact/chatbot.

Backend chưa làm:
- API đơn hàng B2C hoàn chỉnh.
- API thanh toán online thật.
- API giao nhận.
- API tồn kho/stock movement.
- API promotion/voucher.
- API khách hàng/VIP/loyalty.
- API B2B hợp đồng/hóa đơn/công nợ.
- API chatbot thật.
- Unit/integration tests.

## 5. Database hiện tại

Nguồn chuẩn: `backend/prisma/schema.prisma`

Hiện có:
- 25 bảng
- 16 enum

Nhóm bảng:
- Tài khoản: `users`, `addresses`
- Sản phẩm/kho: `categories`, `products`, `product_prices`, `inventories`, `stock_movements`
- Bán hàng B2C: `promotions`, `orders`, `order_items`, `payments`, `shipments`, `reviews`, `loyalty_profiles`
- B2B/công nợ: `business_customers`, `quote_requests`, `contracts`, `invoices`, `debts`
- Mua hàng: `suppliers`, `purchase_orders`, `purchase_order_items`
- Chatbot/liên hệ: `chatbot_conversations`, `chatbot_messages`, `contact_messages`

Tài liệu DB đã tạo:
- `docs/cau_truc_database_phu_tai_coffee_works.docx`
  - Có ý nghĩa từng bảng.
  - Có cột DB, kiểu dữ liệu, khóa/ràng buộc, nullable, giải thích.
  - Có bảng quan hệ tổng hợp.
  - Có enum/trạng thái nghiệp vụ.
  - Đã bỏ cột `Field Prisma` theo yêu cầu.

ERD/Class diagram:
- `docs/erd_class_diagrams.md`
  - ERD tài khoản/khách hàng/tương tác.
  - ERD sản phẩm/kho/giá/mua hàng.
  - ERD B2C.
  - ERD B2B.
  - Class Diagram tổng quát.
  - Enum diagram.

## 6. Frontend hiện tại

Public website:
- Đã có các trang:
  - Home
  - Sản phẩm
  - Dịch vụ
  - Báo giá
  - Về nhà máy
  - Liên hệ
- Tên thương hiệu đang dùng: Phú Tài Coffee Works.
- Cấu trúc public page đã chuyển sang:
  - `frontend/src/pages/client/Home/HomePage.tsx`
  - `frontend/src/pages/client/Products/ProductsPage.tsx`
  - `frontend/src/pages/client/Services/ServicesPage.tsx`
  - `frontend/src/pages/client/Quote/QuotePage.tsx`
  - `frontend/src/pages/client/About/AboutPage.tsx`
  - `frontend/src/pages/client/Contact/ContactPage.tsx`

Admin UI:
- Đã tách theo module trong `frontend/src/pages/admin/`.
- Route admin trong `frontend/src/App.tsx` đã bỏ `AdminResourcePage` bị thiếu.
- `npm run build` frontend đã pass sau khi hoàn thiện admin page.
- Dev server frontend đang chạy ở `http://127.0.0.1:5173/admin` trong phiên hiện tại.
- Backend `localhost:4000` hiện chưa chạy, nên các page nối API sẽ cần bật backend để có dữ liệu thật.
- Login admin đã tách sang trang riêng `http://127.0.0.1:5173/admin/dang-nhap`.
- `AdminLayout` đã kiểm tra token và role trước khi cho vào trang quản trị.
- Menu sidebar đã bỏ scrollbar dọc theo yêu cầu giao diện.
- Các panel admin đã đổi wording theo ngôn ngữ nghiệp vụ, không hiển thị chữ kỹ thuật như "API" ở giao diện chính.

Cấu trúc admin page hiện tại:
- `frontend/src/pages/admin/home/HomePage.tsx`
- `frontend/src/pages/admin/login/LoginPage.tsx`
- `frontend/src/pages/admin/products/ProductsPage.tsx`
- `frontend/src/pages/admin/categories/CategoriesPage.tsx`
- `frontend/src/pages/admin/quotes/QuotesPage.tsx`
- `frontend/src/pages/admin/contacts/ContactsPage.tsx`
- `frontend/src/pages/admin/orders/OrdersPage.tsx`
- `frontend/src/pages/admin/customers/CustomersPage.tsx`
- `frontend/src/pages/admin/inventory/InventoryPage.tsx`
- `frontend/src/pages/admin/reports/ReportsPage.tsx`
- `frontend/src/pages/admin/shared/AdminPageShell.tsx`
- `frontend/src/pages/admin/shared/ApiState.tsx`
- `frontend/src/pages/admin/shared/ResourceNoticePage.tsx`

Component admin đã tách:
- `frontend/src/components/admin/AdminAuthCard.tsx`
- `frontend/src/components/admin/AdminMetricCard.tsx`
- `frontend/src/components/admin/AdminPanel.tsx`
- `frontend/src/components/admin/AdminSidebar.tsx`
- `frontend/src/components/admin/AdminStatusBadge.tsx`
- `frontend/src/components/admin/AdminTopbar.tsx`

API helper admin:
- `frontend/src/lib/adminApi.ts`

Data nav/admin fallback:
- `frontend/src/data/admin.ts`

Admin API đã nối thật:
- Tổng quan: `GET /health`, `GET /categories`, `GET /products`, protected `GET /quote-requests`, `GET /contact-messages`
- Sản phẩm: `GET /products`
- Danh mục: `GET /categories`
- Báo giá B2B: `GET /quote-requests`, `PATCH /quote-requests/:id/status`
- Liên hệ: `GET /contact-messages`, `PATCH /contact-messages/:id/read-status`

Admin page đang là màn hình chờ API:
- Đơn hàng
- Khách hàng
- Tồn kho
- Báo cáo

Palette admin:
- `#E8D3C7`
- `#C7A792`
- `#AA7864`
- `#553B2F`

Tài khoản seed admin:
```text
Email: admin@phutaicoffee.vn
Password: Admin@123
```

## 7. Tài liệu đã có

Trong `docs/`:
- `ke-hoach-du-an-b2b-nha-may-ca-phe.md`
- `cap-nhat-mo-hinh-b2b-b2c-thanh-toan-chatbot.md`
- `usecase-va-actor-b2b-ca-phe.md`
- `staruml-usecase-layout.md`
- `erd_class_diagrams.md`
- `cau_truc_database_phu_tai_coffee_works.docx`
- `mo_ta_csdl_phu_tai_coffee_works.docx` bản cũ, nên ưu tiên bản `cau_truc_database...`

## 8. Lệnh chạy dự án

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

Build kiểm tra:
```bash
cd backend
npm run build

cd ../frontend
npm run build
```

Swagger:
```text
http://localhost:4000/api-docs
```

Health check:
```text
http://localhost:4000/api/health
```

Admin frontend:
```text
http://127.0.0.1:5173/admin
```

## 9. Việc nên làm tiếp

Ưu tiên gần nhất:
1. Bật backend và kiểm thử admin UI với dữ liệu thật:
   - Đăng nhập admin.
   - Xem sản phẩm/danh mục.
   - Cập nhật trạng thái báo giá.
   - Đánh dấu tin nhắn liên hệ đã đọc/chưa đọc.
2. Làm API Order B2C:
   - Tạo đơn hàng.
   - Tính subtotal/shipping/discount/total.
   - Tạo order items.
   - Tạo payment COD/bank/mock online.
3. Làm API quản lý đơn hàng admin:
   - List/detail order.
   - Update status.
   - Hủy đơn/hoàn tiền mock.
4. Làm API tồn kho:
   - Xem tồn kho.
   - Nhập/xuất/điều chỉnh kho.
   - Cảnh báo tồn dưới minQuantity.
5. Làm API promotion/voucher.
6. Làm API B2B công nợ:
   - Business customers.
   - Contracts.
   - Invoices.
   - Debts.
7. Thêm test cơ bản cho backend.
8. Rà lại README sau khi admin và order API ổn định.

## 10. Ghi chú cho agent tiếp theo

- Không tự revert các thay đổi frontend/admin chưa commit nếu chưa hỏi user.
- Frontend admin hiện đã build pass, không còn thiếu `AdminResourcePage`.
- Khi tạo tài liệu tiếng Việt bằng PowerShell + Python, phải ép UTF-8 để tránh lỗi dấu:
  - `$OutputEncoding = [System.Text.UTF8Encoding]::new($false)`
  - `$env:PYTHONIOENCODING='utf-8'`
- Khi làm DOCX, nếu máy không có LibreOffice/`soffice` thì không render QA được; cần báo rõ nếu xuất file Word/PDF.
- User thích giao tiếp tiếng Việt, casual, đi nhanh nhưng cần ghi rõ phần nào thật, phần nào mock/chưa triển khai.
