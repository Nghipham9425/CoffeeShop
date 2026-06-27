# Kế hoạch dự án B2B nhà máy sản xuất cà phê - Mô hình "Mua đi bán lại"

## 1. Tổng quan dự án

> Cập nhật: dự án hiện mở rộng thành mô hình kết hợp B2B và B2C. B2B vẫn là nghiệp vụ chính cho khách doanh nghiệp, còn B2C hỗ trợ khách lẻ mua sản phẩm đóng gói và thanh toán online. Chi tiết bổ sung nằm tại `docs/cap-nhat-mo-hinh-b2b-b2c-thanh-toan-chatbot.md`.

### 1.1. Tên dự án

**Phú Tài Coffee Works - Website B2B cho nhà máy sản xuất và phân phối cà phê**

### 1.2. Mô hình kinh doanh

Dự án mô phỏng mô hình **B2B mua đi bán lại** trong lĩnh vực cà phê.

Nhà máy hoặc doanh nghiệp phân phối sẽ nhập, sản xuất, rang xay, đóng gói hoặc mua sản phẩm cà phê từ nguồn cung. Sau đó bán lại cho các khách hàng doanh nghiệp như:

- Quán cà phê
- Đại lý
- Nhà phân phối
- Khách sạn, nhà hàng, văn phòng
- Chuỗi F&B
- Doanh nghiệp muốn làm thương hiệu cà phê riêng

Website không tập trung vào bán lẻ từng ly cà phê cho người dùng cuối, mà tập trung vào **giới thiệu năng lực nhà máy, sản phẩm sỉ, nhận yêu cầu báo giá, quản lý đơn hàng và hỗ trợ giao dịch B2B**.

### 1.3. Mục tiêu dự án

- Xây dựng website giới thiệu nhà máy sản xuất cà phê Phú Tài Coffee Works.
- Cho phép khách hàng doanh nghiệp xem sản phẩm, dịch vụ và gửi yêu cầu báo giá.
- Mô phỏng quy trình B2B từ xem sản phẩm, yêu cầu báo giá, tạo đơn hàng, xác nhận thanh toán đến giao hàng.
- Xây dựng trang quản trị cho nhân viên nội bộ xử lý sản phẩm, khách hàng, báo giá, đơn hàng, công nợ.
- Làm nền tảng để phát triển backend bằng .NET Core và PostgreSQL.

## 2. Phạm vi dự án

### 2.1. Phạm vi frontend public

Website public dành cho khách hàng doanh nghiệp, gồm:

- Trang chủ giới thiệu nhà máy
- Trang giới thiệu về nhà máy
- Trang sản phẩm cà phê
- Trang dịch vụ gia công/OEM/private label
- Trang yêu cầu báo giá
- Trang liên hệ
- Trang tin tức hoặc kiến thức cà phê

### 2.2. Phạm vi admin

Trang admin dành cho nhân viên nội bộ, gồm:

- Quản lý sản phẩm
- Quản lý danh mục sản phẩm
- Quản lý khách hàng doanh nghiệp
- Quản lý yêu cầu báo giá
- Quản lý đơn hàng
- Quản lý thanh toán
- Quản lý công nợ
- Quản lý bài viết/tin tức
- Thống kê dashboard cơ bản

### 2.3. Phạm vi backend

Backend dùng để cung cấp API cho frontend và admin:

- API xác thực người dùng
- API sản phẩm
- API khách hàng
- API báo giá
- API đơn hàng
- API công nợ
- API bài viết
- API dashboard

### 2.4. Ngoài phạm vi đồ án giai đoạn đầu

- Thanh toán online thật qua ngân hàng.
- Tích hợp đơn vị vận chuyển thật.
- Chatbot AI thật có kết nối model.
- ERP/kế toán hoàn chỉnh.
- Tự động xuất hóa đơn điện tử.

Các chức năng trên có thể ghi vào hướng phát triển tương lai.

## 3. Công nghệ sử dụng

### 3.1. Frontend

- React
- Vite
- TypeScript
- Tailwind CSS
- React Router
- Lucide React / React Icons
- Shadcn-style UI components

### 3.2. Backend

- .NET Core Web API
- Entity Framework Core
- PostgreSQL
- Swagger/OpenAPI

### 3.3. Database

- PostgreSQL

Lý do chọn PostgreSQL:

- Phù hợp dữ liệu nghiệp vụ như sản phẩm, đơn hàng, công nợ.
- Hỗ trợ quan hệ dữ liệu tốt.
- Phù hợp khi mở rộng dự án.
- Dễ kết nối với .NET thông qua Entity Framework Core và Npgsql.

### 3.4. Quản lý cấu hình

- Không để connection string thật trong code public.
- Dùng `appsettings.Development.json`, biến môi trường hoặc `.env.example`.
- File chứa password thật không commit lên Git.

## 4. Đối tượng sử dụng hệ thống

### 4.1. Khách hàng doanh nghiệp

Là người truy cập website để tìm hiểu sản phẩm và gửi yêu cầu mua sỉ.

Khách hàng có thể là:

- Chủ quán cà phê
- Đại lý phân phối
- Nhà hàng/khách sạn
- Công ty cần cà phê văn phòng
- Doanh nghiệp muốn làm thương hiệu riêng

### 4.2. Nhân viên kinh doanh

Phụ trách:

- Xem yêu cầu báo giá
- Tư vấn khách hàng
- Tạo báo giá
- Chuyển báo giá thành đơn hàng
- Theo dõi tình trạng chăm sóc khách

### 4.3. Nhân viên kho/sản xuất

Phụ trách:

- Kiểm tra tồn kho
- Chuẩn bị hàng
- Cập nhật trạng thái sản xuất/đóng gói
- Cập nhật trạng thái giao hàng

### 4.4. Kế toán

Phụ trách:

- Theo dõi thanh toán
- Quản lý công nợ
- Xác nhận đã thanh toán
- Ghi nhận còn nợ/quá hạn

### 4.5. Quản trị viên

Phụ trách:

- Quản lý tài khoản nhân viên
- Quản lý quyền truy cập
- Quản lý toàn bộ dữ liệu hệ thống
- Xem dashboard tổng quan

## 5. Role trong hệ thống

| Role | Mô tả | Quyền chính |
|---|---|---|
| Guest | Người chưa đăng nhập | Xem trang chủ, sản phẩm, dịch vụ, gửi liên hệ/báo giá |
| B2B Customer | Khách hàng doanh nghiệp | Xem sản phẩm, gửi yêu cầu báo giá, theo dõi đơn hàng nếu có tài khoản |
| Sales Staff | Nhân viên kinh doanh | Xem khách hàng, xử lý yêu cầu báo giá, tạo đơn hàng |
| Warehouse Staff | Nhân viên kho/sản xuất | Xem đơn hàng, cập nhật đóng gói/giao hàng |
| Accountant | Kế toán | Theo dõi thanh toán, công nợ |
| Admin | Quản trị viên | Quản lý toàn bộ hệ thống |

## 6. Use case tổng quát

Chi tiết actor, bảng phân quyền use case và mô tả use case chi tiết được tách riêng tại file `docs/usecase-va-actor-b2b-ca-phe.md`.

### 6.1. Nhóm khách hàng doanh nghiệp

1. Xem thông tin nhà máy.
2. Xem danh mục sản phẩm.
3. Xem chi tiết sản phẩm.
4. Xem dịch vụ gia công/OEM/private label.
5. Gửi yêu cầu báo giá.
6. Gửi thông tin liên hệ.
7. Xem tin tức/kiến thức cà phê.
8. Đăng ký tài khoản doanh nghiệp.
9. Đăng nhập.
10. Theo dõi đơn hàng.

### 6.2. Nhóm nhân viên kinh doanh

11. Xem danh sách yêu cầu báo giá.
12. Xem chi tiết yêu cầu báo giá.
13. Cập nhật trạng thái yêu cầu báo giá.
14. Tạo báo giá cho khách hàng.
15. Chuyển báo giá thành đơn hàng.
16. Quản lý thông tin khách hàng.
17. Ghi chú lịch sử tư vấn khách hàng.

### 6.3. Nhóm admin

18. Quản lý sản phẩm.
19. Quản lý danh mục sản phẩm.
20. Quản lý bài viết.
21. Quản lý người dùng.
22. Phân quyền nhân viên.
23. Xem dashboard tổng quan.

### 6.4. Nhóm kho/sản xuất

24. Xem đơn hàng cần xử lý.
25. Cập nhật trạng thái chuẩn bị hàng.
26. Cập nhật trạng thái đóng gói.
27. Cập nhật trạng thái giao hàng.
28. Theo dõi tồn kho cơ bản.

### 6.5. Nhóm kế toán

29. Xem danh sách đơn hàng cần thanh toán.
30. Cập nhật trạng thái thanh toán.
31. Quản lý công nợ.
32. Xem công nợ quá hạn.
33. Xem lịch sử thanh toán của khách hàng.

## 7. Chức năng chi tiết

### 7.1. Trang chủ

Mục tiêu:

- Giới thiệu thương hiệu Phú Tài Coffee Works.
- Trình bày năng lực nhà máy.
- Dẫn khách hàng đến trang sản phẩm, dịch vụ và báo giá.

Nội dung chính:

- Hero banner
- Thế mạnh nhà máy
- Dịch vụ sản xuất/gia công
- Con số nổi bật
- Hạng mục sản phẩm
- Quy trình mua hàng B2B
- Tin tức mới nhất

### 7.2. Trang sản phẩm

Chức năng:

- Hiển thị danh sách sản phẩm.
- Lọc theo danh mục.
- Xem chi tiết sản phẩm.
- Gửi yêu cầu báo giá theo sản phẩm.

Sản phẩm mẫu:

- Cà phê hạt rang
- Cà phê rang xay
- Cà phê hòa tan
- Cà phê túi lọc
- Capsule
- Sản phẩm OEM/private label

### 7.3. Trang dịch vụ

Dịch vụ chính:

- Cung ứng cà phê sỉ
- Gia công cà phê hạt rang
- Gia công cà phê rang xay
- Gia công cà phê hòa tan
- Private label
- OEM/ODM
- Đóng gói bao bì theo yêu cầu

### 7.4. Trang yêu cầu báo giá

Form gồm:

- Tên công ty
- Người liên hệ
- Số điện thoại/email
- Sản phẩm cần báo giá
- Số lượng dự kiến
- Ghi chú yêu cầu

Luồng xử lý:

1. Khách gửi form.
2. Hệ thống lưu yêu cầu.
3. Nhân viên sales xem yêu cầu.
4. Sales cập nhật trạng thái.
5. Sales tạo báo giá hoặc liên hệ khách hàng.

### 7.5. Admin dashboard

Dashboard hiển thị:

- Số yêu cầu báo giá mới
- Số đơn hàng đang xử lý
- Doanh thu dự kiến
- Công nợ quá hạn
- Sản phẩm tồn kho thấp

### 7.6. Quản lý công nợ

Chức năng công nợ nên nằm trong admin, không hiển thị ở website public.

Thông tin cần quản lý:

- Khách hàng
- Đơn hàng liên quan
- Tổng tiền đơn hàng
- Số tiền đã thanh toán
- Số tiền còn nợ
- Ngày đến hạn
- Trạng thái: chưa thanh toán, thanh toán một phần, đã thanh toán, quá hạn

## 8. Thiết kế database dự kiến

### 8.1. Bảng users

Lưu thông tin tài khoản đăng nhập.

Trường chính:

- id
- full_name
- email
- password_hash
- role
- status
- created_at

### 8.2. Bảng customers

Lưu thông tin khách hàng doanh nghiệp.

Trường chính:

- id
- company_name
- contact_name
- phone
- email
- address
- tax_code
- customer_type
- created_at

### 8.3. Bảng product_categories

Lưu danh mục sản phẩm.

Trường chính:

- id
- name
- description
- status

### 8.4. Bảng products

Lưu sản phẩm.

Trường chính:

- id
- category_id
- name
- description
- unit
- wholesale_price
- minimum_order_quantity
- image_url
- status

### 8.5. Bảng quote_requests

Lưu yêu cầu báo giá từ khách.

Trường chính:

- id
- customer_name
- company_name
- phone_or_email
- product_need
- expected_quantity
- note
- status
- created_at

### 8.6. Bảng quotations

Lưu báo giá do sales tạo.

Trường chính:

- id
- quote_request_id
- customer_id
- total_amount
- valid_until
- status
- created_by
- created_at

### 8.7. Bảng orders

Lưu đơn hàng B2B.

Trường chính:

- id
- customer_id
- quotation_id
- order_code
- total_amount
- payment_status
- order_status
- delivery_status
- created_at

### 8.8. Bảng order_items

Lưu chi tiết sản phẩm trong đơn hàng.

Trường chính:

- id
- order_id
- product_id
- quantity
- unit_price
- total_price

### 8.9. Bảng payments

Lưu lịch sử thanh toán.

Trường chính:

- id
- order_id
- amount
- payment_method
- payment_date
- note

### 8.10. Bảng debts

Lưu công nợ.

Trường chính:

- id
- customer_id
- order_id
- total_amount
- paid_amount
- remaining_amount
- due_date
- status

### 8.11. Bảng posts

Lưu bài viết/tin tức.

Trường chính:

- id
- title
- slug
- content
- thumbnail_url
- status
- created_at

## 9. Luồng nghiệp vụ chính

### 9.1. Luồng yêu cầu báo giá

1. Khách hàng vào website.
2. Khách hàng xem sản phẩm/dịch vụ.
3. Khách hàng gửi yêu cầu báo giá.
4. Hệ thống lưu yêu cầu ở trạng thái "Mới".
5. Sales xem yêu cầu trong admin.
6. Sales liên hệ khách hàng và tạo báo giá.
7. Khách xác nhận báo giá.
8. Sales chuyển thành đơn hàng.

### 9.2. Luồng đơn hàng

1. Sales tạo đơn hàng từ báo giá.
2. Kho/sản xuất nhận đơn cần xử lý.
3. Kho cập nhật trạng thái chuẩn bị hàng.
4. Kho cập nhật trạng thái đóng gói.
5. Kho cập nhật trạng thái giao hàng.
6. Kế toán cập nhật thanh toán.
7. Đơn hàng hoàn tất.

### 9.3. Luồng công nợ

1. Đơn hàng được tạo với tổng tiền.
2. Khách thanh toán cọc hoặc thanh toán một phần.
3. Hệ thống ghi nhận số tiền đã thanh toán.
4. Phần còn lại được đưa vào công nợ.
5. Kế toán theo dõi hạn thanh toán.
6. Nếu quá hạn, công nợ chuyển trạng thái "Quá hạn".
7. Khi khách thanh toán đủ, công nợ chuyển thành "Đã thanh toán".

## 10. Kế hoạch thực hiện đồ án

### Giai đoạn 1: Phân tích và lập kế hoạch

Thời gian dự kiến: 2-3 ngày

Công việc:

- Xác định đề tài.
- Xác định mô hình B2B mua đi bán lại.
- Xác định role người dùng.
- Xác định chức năng chính.
- Lập use case tổng quát.
- Lập database dự kiến.

Kết quả:

- File kế hoạch dự án.
- Danh sách use case.
- Sơ đồ use case.
- Mô tả database ban đầu.

### Giai đoạn 2: Thiết kế giao diện frontend

Thời gian dự kiến: 5-7 ngày

Công việc:

- Tạo cấu trúc React.
- Thiết kế layout public website.
- Làm trang chủ.
- Làm trang sản phẩm.
- Làm trang dịch vụ.
- Làm trang báo giá.
- Làm trang liên hệ.
- Làm giao diện admin cơ bản.

Kết quả:

- Website public có thể chạy được.
- Admin layout cơ bản.
- Responsive desktop/mobile cơ bản.

### Giai đoạn 3: Khởi tạo backend

Thời gian dự kiến: 2-3 ngày

Công việc:

- Tạo project .NET Core Web API.
- Cấu hình PostgreSQL.
- Tạo cấu trúc thư mục backend.
- Tạo entity cơ bản.
- Tạo DbContext.
- Tạo migration.
- Tạo API test.

Kết quả:

- Backend chạy được.
- Kết nối database thành công.
- Swagger/OpenAPI hoạt động.

### Giai đoạn 4: Xây dựng chức năng chính

Thời gian dự kiến: 7-10 ngày

Công việc:

- API sản phẩm.
- API danh mục.
- API yêu cầu báo giá.
- API khách hàng.
- API đơn hàng.
- API công nợ.
- Kết nối frontend với backend.
- Hiển thị dữ liệu thật từ database.

Kết quả:

- Khách có thể gửi yêu cầu báo giá.
- Admin có thể xem và xử lý yêu cầu.
- Admin có thể quản lý sản phẩm, đơn hàng, công nợ.

### Giai đoạn 5: Kiểm thử và hoàn thiện

Thời gian dự kiến: 3-5 ngày

Công việc:

- Kiểm thử form.
- Kiểm thử API.
- Kiểm thử role.
- Kiểm thử responsive.
- Sửa lỗi giao diện.
- Hoàn thiện báo cáo.
- Chuẩn bị demo.

Kết quả:

- Dự án chạy ổn định.
- Có dữ liệu demo.
- Có tài liệu báo cáo.
- Có slide thuyết trình nếu cần.

## 11. Phân công công việc theo role trong nhóm

### 11.1. Project Manager / Leader

Nhiệm vụ:

- Quản lý tiến độ.
- Chia việc cho các thành viên.
- Kiểm tra chất lượng.
- Tổng hợp báo cáo.

### 11.2. Business Analyst

Nhiệm vụ:

- Phân tích nghiệp vụ B2B.
- Viết use case.
- Mô tả luồng nghiệp vụ.
- Làm tài liệu yêu cầu chức năng.

### 11.3. UI/UX Designer

Nhiệm vụ:

- Thiết kế bố cục giao diện.
- Chọn màu sắc, font, hình ảnh.
- Thiết kế wireframe hoặc mockup.
- Đảm bảo giao diện phù hợp nhà máy cà phê.

### 11.4. Frontend Developer

Nhiệm vụ:

- Xây dựng giao diện React.
- Tạo component dùng lại.
- Tạo routing.
- Kết nối API.
- Xử lý form và validation phía client.

### 11.5. Backend Developer

Nhiệm vụ:

- Tạo .NET Core Web API.
- Thiết kế entity.
- Kết nối PostgreSQL.
- Xây dựng API.
- Xử lý phân quyền.

### 11.6. Database Designer

Nhiệm vụ:

- Thiết kế schema PostgreSQL.
- Xác định quan hệ giữa các bảng.
- Tạo migration.
- Chuẩn bị dữ liệu mẫu.

### 11.7. Tester

Nhiệm vụ:

- Viết test case.
- Kiểm thử chức năng.
- Kiểm thử giao diện.
- Ghi nhận lỗi và xác nhận sửa lỗi.

## 12. Cấu trúc thư mục dự án

```text
Coffee_B2B/
  frontend/
    src/
      components/
      layouts/
      pages/
      data/
      lib/
    package.json
    vite.config.ts

  backend/
    Controllers/
    Models/
    Entities/
    Data/
    DTOs/
    Services/
    Program.cs
    appsettings.json

  docs/
    ke-hoach-du-an-b2b-nha-may-ca-phe.md
```

## 13. API dự kiến

### 13.1. Products

- `GET /api/products`
- `GET /api/products/{id}`
- `POST /api/products`
- `PUT /api/products/{id}`
- `DELETE /api/products/{id}`

### 13.2. Quote Requests

- `GET /api/quote-requests`
- `GET /api/quote-requests/{id}`
- `POST /api/quote-requests`
- `PUT /api/quote-requests/{id}/status`

### 13.3. Customers

- `GET /api/customers`
- `GET /api/customers/{id}`
- `POST /api/customers`
- `PUT /api/customers/{id}`

### 13.4. Orders

- `GET /api/orders`
- `GET /api/orders/{id}`
- `POST /api/orders`
- `PUT /api/orders/{id}/status`

### 13.5. Debts

- `GET /api/debts`
- `GET /api/debts/overdue`
- `PUT /api/debts/{id}/payment`

## 14. Dữ liệu demo cần chuẩn bị

### 14.1. Sản phẩm

- Robusta rang mộc pha phin
- Arabica Cầu Đất
- Espresso Blend
- Cà phê hòa tan
- Cà phê túi lọc
- Capsule
- OEM/private label

### 14.2. Khách hàng

- Công ty TNHH F&B Minh Anh
- Chuỗi cà phê Sunrise
- Đại lý cà phê Gia Phát
- Khách sạn An Bình

### 14.3. Đơn hàng

- Đơn hàng 50kg cà phê rang xay
- Đơn hàng 100kg espresso blend
- Đơn hàng OEM 300kg đóng gói thương hiệu riêng

### 14.4. Công nợ

- Công nợ chưa thanh toán
- Công nợ thanh toán một phần
- Công nợ quá hạn

## 15. Tiêu chí hoàn thành đồ án

Dự án được xem là hoàn thành khi:

- Website public có đầy đủ trang chính.
- Admin có giao diện quản lý nghiệp vụ cơ bản.
- Backend chạy được và có API chính.
- Database PostgreSQL có schema cơ bản.
- Khách hàng có thể gửi yêu cầu báo giá.
- Admin có thể xem yêu cầu báo giá.
- Có mô phỏng quản lý đơn hàng và công nợ.
- Có tài liệu kế hoạch, use case và mô tả database.
- Có dữ liệu demo để trình bày.

## 16. Hướng phát triển tương lai

- Tích hợp chatbot tư vấn sản phẩm.
- Tích hợp email tự động gửi báo giá.
- Tích hợp thanh toán online.
- Tích hợp quản lý vận chuyển.
- Tích hợp xuất file PDF báo giá/hợp đồng.
- Tích hợp biểu đồ doanh thu và công nợ.
- Tích hợp phân quyền chi tiết theo nhân viên.
- Tích hợp hệ thống đánh giá khách hàng B2B.

## 17. Kết luận

Dự án Phú Tài Coffee Works mô phỏng một hệ thống thương mại điện tử B2B cho nhà máy sản xuất và phân phối cà phê theo mô hình mua đi bán lại. Hệ thống tập trung vào quy trình thực tế của giao dịch doanh nghiệp: giới thiệu năng lực, trưng bày sản phẩm, tiếp nhận báo giá, tạo đơn hàng, xử lý thanh toán và theo dõi công nợ.

Đây là đề tài phù hợp để thể hiện kiến thức về phân tích hệ thống, thiết kế giao diện, xây dựng backend API, thiết kế database và mô phỏng nghiệp vụ thương mại điện tử B2B.
