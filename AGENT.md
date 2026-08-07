# AGENT.md - Tiến độ dự án Phú Tài Coffee Works

## Cập nhật kho, giá và đánh giá (01/08/2026)

- Màn quản lý kho hiển thị tồn hiện tại theo từng sản phẩm; mỗi dòng có thao tác Nhập kho, Xuất kho, Kiểm kê và Lịch sử.
- Backend từ chối xuất vượt tồn và ghi lại tồn sau mỗi phiếu kho.
- API sản phẩm trả tồn khả dụng; danh sách, chi tiết sản phẩm và giỏ hàng giới hạn số lượng mua theo tồn thực tế.
- Checkout B2C trừ tồn trong transaction và dùng cập nhật có điều kiện để không phát sinh tồn âm khi nhiều khách đặt đồng thời.
- Hủy đơn đang chờ hoặc đã xác nhận hoàn lại đúng số lượng vào kho và tạo phiếu hoàn kho; thao tác hủy lặp lại bị từ chối.
- Sản phẩm mới tự tạo bản ghi tồn kho mặc định bằng 0; dữ liệu sản phẩm cũ đã được bổ sung bản ghi kho còn thiếu.
- Giá bán lẻ được chỉnh trực tiếp trên sản phẩm và lưu lịch sử giá cũ, giá mới, người sửa, thời điểm sửa.
- Đánh giá từ đơn hàng hoàn thành hiển thị ngay; quản trị viên chỉ ẩn nội dung vi phạm và có thể hiện lại.
- Sản phẩm và danh mục đã ẩn vẫn xuất hiện trong trang quản trị để khôi phục, nhưng không xuất hiện ở website khách hàng.
- Đã kiểm tra build frontend/backend và xác minh API xuất vượt tồn, ẩn/hiện sản phẩm, ẩn/hiện danh mục.

Cập nhật lần cuối: 28/07/2026
Thư mục dự án: `D:\Coffee_B2B`

## Cập nhật chuẩn hóa nghiệp vụ (02/08/2026)

- `product_prices` là nguồn giá nghiệp vụ duy nhất; `products.price` chỉ còn để tương thích dữ liệu cũ.
- API giá được đặt dưới Product: `GET/POST /api/products/:id/prices`, `GET /api/products/:id/price-history`.
- Mỗi thay đổi giá tạo bản ghi `price_adjustments` trong cùng transaction.
- `PATCH /api/inventories/:id` chỉ sửa ngưỡng cảnh báo; thay đổi tồn phải qua phiếu kho.
- Đơn B2C lưu phân bổ kho theo từng dòng đơn (`order_item_inventory_allocations`) để hoàn kho đúng kho đã xuất.
- Chatbot dùng token phiên ngẫu nhiên cho khách vãng lai; tài khoản chỉ truy cập hội thoại thuộc sở hữu, nhân sự nội bộ có quyền xem hỗ trợ.
- Checkout chỉ nhận COD, chuyển khoản và SePay. SePay yêu cầu `orderId` cùng `orderCode`; webhook chuẩn duy nhất là `POST /api/sepay/webhook`.
- Loyalty Profile được tạo khi đăng ký/đăng nhập Google tạo tài khoản mới. Đơn B2C hoàn thành tích 1 điểm trên mỗi 10.000 VNĐ và tự cập nhật hạng.

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
- Hoàn thiện luồng quên mật khẩu và đặt lại mật khẩu:
  - `POST /api/auth/forgot-password`
  - `POST /api/auth/reset-password`
  - Gửi email thật qua Gmail SMTP.
  - Token ngẫu nhiên chỉ lưu bản băm trong PostgreSQL, dùng một lần và có thời hạn.
  - Giới hạn tần suất gọi API để hạn chế spam email và thử token liên tục.
- Thêm trang `/quen-mat-khau` và `/dat-lai-mat-khau`, nối từ trang đăng nhập.
- Thêm bảng `password_reset_tokens`.
- Đã kiểm tra kết nối SMTP và gửi email thử thành công.
- Đã bổ sung hai API khôi phục mật khẩu vào Swagger.
- Hoàn thiện đăng nhập Google bằng Google Identity Services:
  - `POST /api/auth/google`
  - Backend xác minh Google ID token và audience trước khi cấp JWT của hệ thống.
  - Tự liên kết tài khoản cũ theo email đã xác minh hoặc tạo tài khoản mới.
  - Thêm bảng `oauth_accounts` để lưu liên kết nhà cung cấp OAuth.
  - Frontend chỉ hoạt động khi cả backend và frontend dùng cùng `GOOGLE_CLIENT_ID`.
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
- `POST /api/auth/forgot-password`
- `POST /api/auth/reset-password`
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

Hiện có 27 bảng:
- Tài khoản: `users`, `oauth_accounts`, `addresses`, `password_reset_tokens`
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
- `frontend/src/pages/client/Auth/AuthPage.tsx`
- `frontend/src/pages/client/Auth/ForgotPasswordPage.tsx`
- `frontend/src/pages/client/Auth/ResetPasswordPage.tsx`

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
1. Cấu hình Google Web Client ID và test đăng nhập Google thật trên trình duyệt; Facebook OAuth có thể làm sau.
2. Test thủ công toàn bộ admin CRUD trên browser với backend và database thật.
3. Hoàn thiện giới hạn sử dụng voucher theo khách hàng và bổ sung thống kê hiệu quả chương trình.
4. Làm CRUD hợp đồng, hóa đơn, công nợ B2B.
5. Làm chatbot tư vấn mua hàng bản mock trước, AI thật sau.
6. Thêm test backend cho auth, product, order, inventory.
7. Tiếp tục bổ sung Swagger docs cho các endpoint còn thiếu.

## Cập nhật nghiệp vụ thương mại điện tử

Đã hoàn thành:
- Voucher là mã giảm giá độc lập: quản trị viên tạo mã, khách hàng nhập mã ở bước thanh toán, backend kiểm tra thời hạn, trạng thái, giá trị đơn tối thiểu và tự tính số tiền giảm.
- Chính sách giá được tách khỏi voucher: hỗ trợ giá bán lẻ, bán sỉ, VIP/B2B, số lượng tối thiểu và thời gian áp dụng.
- Mọi lần cập nhật chính sách giá đều ghi lại giá cũ, giá mới, người thực hiện và thời điểm thay đổi để tra cứu lịch sử.
- Khách chỉ được đánh giá sản phẩm thuộc đơn đã hoàn thành; quản trị viên có thể duyệt hoặc từ chối đánh giá.
- Khách có thể hủy đơn đang chờ xử lý và gửi yêu cầu đổi, trả hoặc hoàn tiền cho đơn đã hoàn thành.
- Quy trình báo giá B2B đã có lập báo giá chi tiết, phản hồi chấp nhận/từ chối và chuyển báo giá thành hợp đồng hoặc đơn hàng.

Trang quản trị mới:
- Voucher: `/admin/khuyen-mai`
- Chính sách giá và lịch sử giá: `/admin/chinh-sach-gia`
- Đánh giá sản phẩm: `/admin/danh-gia`
- Đổi trả và hoàn tiền: `/admin/doi-tra`

## Cập nhật SEO và điều hướng nội dung

- Trang Liên hệ độc lập đã được bỏ khỏi giao diện vì trùng với quy trình Báo giá; URL cũ tự chuyển sang `/bao-gia`.
- URL chi tiết sản phẩm dùng slug thân thiện, ví dụ `/san-pham/ca-phe-sua-hoa-tan-3-trong-1`.
- Link sản phẩm bằng ID cũ vẫn được hỗ trợ và tự chuyển sang URL slug chuẩn.
- Trang danh sách và chi tiết sản phẩm có title, meta description, canonical URL, Open Graph, Twitter Card và dữ liệu có cấu trúc Product theo Schema.org.
- API công khai đã có endpoint tra cứu sản phẩm bằng slug: `GET /api/products/slug/:slug`.
