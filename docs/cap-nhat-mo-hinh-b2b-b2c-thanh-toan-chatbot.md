# Cập nhật mô hình dự án - B2B, bán lẻ, thanh toán và chatbot

## 1. Lý do cập nhật

Ban đầu dự án tập trung vào mô hình **B2B nhà máy sản xuất cà phê** theo hướng mua đi bán lại. Sau khi mở rộng yêu cầu, hệ thống cần hỗ trợ thêm **bán lẻ cho khách cá nhân**.

Vì vậy, dự án Phú Tài Coffee Works sẽ được thiết kế theo mô hình kết hợp:

- **B2B**: bán cho doanh nghiệp, đại lý, quán cà phê, chuỗi F&B.
- **B2C**: bán lẻ sản phẩm cà phê đóng gói cho khách cá nhân.
- **Chatbot**: tư vấn sản phẩm, quy trình mua hàng, báo giá, thanh toán.
- **Thanh toán**: phân biệt rõ thanh toán cho khách lẻ và khách doanh nghiệp.

## 2. Mô hình tổng quát mới

### 2.1. B2B - Khách doanh nghiệp

Khách doanh nghiệp thường không mua theo kiểu chọn sản phẩm rồi thanh toán online ngay như khách lẻ.

Lý do:

- Đơn hàng có số lượng lớn.
- Giá có thể thay đổi theo sản lượng, chiết khấu, hợp đồng.
- Có thể cần báo giá riêng.
- Có thể cần VAT, hợp đồng, điều khoản giao hàng.
- Có thể thanh toán cọc trước, thanh toán sau hoặc phát sinh công nợ.
- Có thể cần lịch giao hàng nhiều đợt.

Luồng phù hợp:

1. Khách doanh nghiệp xem sản phẩm/dịch vụ.
2. Khách gửi yêu cầu báo giá.
3. Nhân viên sales tư vấn.
4. Sales tạo báo giá.
5. Khách xác nhận báo giá.
6. Sales tạo đơn hàng/hợp đồng.
7. Kế toán ghi nhận thanh toán cọc hoặc chuyển khoản.
8. Kho/sản xuất chuẩn bị hàng.
9. Giao hàng.
10. Kế toán theo dõi thanh toán còn lại/công nợ.

### 2.2. B2C - Khách lẻ

Khách lẻ có thể mua trực tiếp trên website vì sản phẩm có giá niêm yết và số lượng nhỏ.

Luồng phù hợp:

1. Khách lẻ xem sản phẩm.
2. Thêm sản phẩm vào giỏ hàng.
3. Nhập thông tin giao hàng.
4. Chọn phương thức thanh toán.
5. Thanh toán online hoặc COD/chuyển khoản.
6. Hệ thống tạo đơn hàng bán lẻ.
7. Kho chuẩn bị hàng.
8. Giao hàng.
9. Đơn hàng hoàn tất.

## 3. Quy định thanh toán

### 3.1. Thanh toán cho khách lẻ

Khách lẻ có thể thanh toán online vì:

- Giá sản phẩm đã niêm yết.
- Số lượng đơn hàng nhỏ.
- Không cần hợp đồng riêng.
- Quy trình giống thương mại điện tử thông thường.

Phương thức thanh toán đề xuất:

- Thanh toán online qua cổng thanh toán sandbox/demo.
- Chuyển khoản ngân hàng.
- COD nếu muốn mô phỏng đơn giản.

Use case liên quan:

- Thêm sản phẩm vào giỏ hàng.
- Tạo đơn hàng bán lẻ.
- Thanh toán online.
- Nhận kết quả thanh toán.
- Theo dõi đơn hàng.

### 3.2. Thanh toán cho khách doanh nghiệp

Khách doanh nghiệp **không nên xử lý bằng thanh toán online trực tiếp như khách lẻ**.

Luồng thanh toán phù hợp:

- Báo giá trước.
- Ký hợp đồng hoặc xác nhận đơn hàng.
- Thanh toán cọc bằng chuyển khoản.
- Thanh toán phần còn lại sau khi giao hàng.
- Theo dõi công nợ.

Trạng thái thanh toán B2B:

- Chưa thanh toán
- Đã đặt cọc
- Thanh toán một phần
- Đã thanh toán
- Quá hạn

Chức năng liên quan:

- Quản lý báo giá.
- Quản lý hợp đồng/đơn hàng.
- Ghi nhận thanh toán.
- Quản lý công nợ.
- Xem công nợ quá hạn.

## 4. Actor cập nhật

| Actor | Mô tả | Ghi chú |
|---|---|---|
| Guest | Người truy cập chưa đăng nhập | Xem website, gửi báo giá/liên hệ |
| Retail Customer | Khách lẻ | Mua sản phẩm đóng gói, thanh toán online |
| B2B Customer | Khách doanh nghiệp | Gửi yêu cầu báo giá, mua sỉ, công nợ |
| Sales Staff | Nhân viên kinh doanh | Xử lý báo giá, chốt đơn B2B |
| Warehouse Staff | Nhân viên kho/sản xuất | Chuẩn bị hàng, cập nhật giao hàng |
| Accountant | Kế toán | Ghi nhận thanh toán, quản lý công nợ |
| Content Staff | Nhân viên nội dung | Quản lý bài viết |
| Admin | Quản trị viên | Quản lý toàn hệ thống |
| Chatbot | Tác nhân hỗ trợ tự động | Tư vấn sản phẩm, báo giá, thanh toán |
| Payment Gateway | Cổng thanh toán | Dùng cho khách lẻ, có thể demo/sandbox |

## 5. Use case cập nhật theo nhóm

### 5.1. Nhóm Public Website

| Mã | Use case | Actor |
|---|---|---|
| UC-P01 | Xem trang chủ | Guest, Retail Customer, B2B Customer |
| UC-P02 | Xem giới thiệu nhà máy | Guest, Retail Customer, B2B Customer |
| UC-P03 | Xem sản phẩm | Guest, Retail Customer, B2B Customer |
| UC-P04 | Xem dịch vụ gia công/OEM | Guest, B2B Customer |
| UC-P05 | Xem tin tức | Guest, Retail Customer, B2B Customer |
| UC-P06 | Gửi liên hệ | Guest, Retail Customer, B2B Customer |
| UC-P07 | Chat với chatbot | Guest, Retail Customer, B2B Customer |

### 5.2. Nhóm bán lẻ B2C

| Mã | Use case | Actor |
|---|---|---|
| UC-R01 | Xem sản phẩm bán lẻ | Retail Customer |
| UC-R02 | Xem chi tiết sản phẩm | Retail Customer |
| UC-R03 | Thêm sản phẩm vào giỏ hàng | Retail Customer |
| UC-R04 | Cập nhật giỏ hàng | Retail Customer |
| UC-R05 | Nhập thông tin giao hàng | Retail Customer |
| UC-R06 | Tạo đơn hàng bán lẻ | Retail Customer |
| UC-R07 | Thanh toán online | Retail Customer, Payment Gateway |
| UC-R08 | Nhận kết quả thanh toán | Retail Customer, Payment Gateway |
| UC-R09 | Theo dõi đơn hàng bán lẻ | Retail Customer |
| UC-R10 | Hủy đơn hàng nếu chưa xử lý | Retail Customer |

### 5.3. Nhóm B2B doanh nghiệp

| Mã | Use case | Actor |
|---|---|---|
| UC-B01 | Gửi yêu cầu báo giá | B2B Customer |
| UC-B02 | Theo dõi trạng thái yêu cầu báo giá | B2B Customer |
| UC-B03 | Nhận báo giá | B2B Customer, Sales Staff |
| UC-B04 | Xác nhận báo giá | B2B Customer |
| UC-B05 | Theo dõi đơn hàng B2B | B2B Customer |
| UC-B06 | Xem lịch sử mua hàng | B2B Customer |
| UC-B07 | Xem trạng thái thanh toán | B2B Customer |
| UC-B08 | Xem công nợ doanh nghiệp | B2B Customer |

### 5.4. Nhóm Sales

| Mã | Use case | Actor |
|---|---|---|
| UC-S01 | Xem yêu cầu báo giá | Sales Staff |
| UC-S02 | Xem chi tiết yêu cầu báo giá | Sales Staff |
| UC-S03 | Cập nhật trạng thái yêu cầu | Sales Staff |
| UC-S04 | Tạo báo giá | Sales Staff |
| UC-S05 | Chỉnh sửa báo giá | Sales Staff |
| UC-S06 | Gửi báo giá cho khách | Sales Staff |
| UC-S07 | Chuyển báo giá thành đơn hàng | Sales Staff |
| UC-S08 | Quản lý khách hàng doanh nghiệp | Sales Staff |
| UC-S09 | Ghi chú chăm sóc khách hàng | Sales Staff |

### 5.5. Nhóm kho/sản xuất

| Mã | Use case | Actor |
|---|---|---|
| UC-W01 | Xem đơn hàng cần xử lý | Warehouse Staff |
| UC-W02 | Kiểm tra tồn kho | Warehouse Staff |
| UC-W03 | Cập nhật trạng thái chuẩn bị hàng | Warehouse Staff |
| UC-W04 | Cập nhật trạng thái đóng gói | Warehouse Staff |
| UC-W05 | Cập nhật trạng thái giao hàng | Warehouse Staff |
| UC-W06 | Cập nhật tồn kho | Warehouse Staff |

### 5.6. Nhóm kế toán

| Mã | Use case | Actor |
|---|---|---|
| UC-A01 | Xem danh sách thanh toán | Accountant |
| UC-A02 | Ghi nhận thanh toán B2B | Accountant |
| UC-A03 | Đối soát thanh toán online B2C | Accountant |
| UC-A04 | Cập nhật trạng thái thanh toán | Accountant |
| UC-A05 | Quản lý công nợ | Accountant |
| UC-A06 | Xem công nợ quá hạn | Accountant |
| UC-A07 | Xem lịch sử thanh toán | Accountant |

### 5.7. Nhóm chatbot

| Mã | Use case | Actor |
|---|---|---|
| UC-CB01 | Tư vấn chọn sản phẩm | Chatbot |
| UC-CB02 | Hướng dẫn mua lẻ | Chatbot |
| UC-CB03 | Hướng dẫn gửi báo giá B2B | Chatbot |
| UC-CB04 | Trả lời câu hỏi về MOQ | Chatbot |
| UC-CB05 | Hướng dẫn thanh toán | Chatbot |
| UC-CB06 | Chuyển sang form liên hệ | Chatbot |
| UC-CB07 | Gợi ý sản phẩm theo nhu cầu | Chatbot |

### 5.8. Nhóm Admin

| Mã | Use case | Actor |
|---|---|---|
| UC-AD01 | Đăng nhập admin | Admin |
| UC-AD02 | Xem dashboard | Admin |
| UC-AD03 | Quản lý người dùng | Admin |
| UC-AD04 | Phân quyền | Admin |
| UC-AD05 | Quản lý sản phẩm | Admin |
| UC-AD06 | Quản lý danh mục | Admin |
| UC-AD07 | Quản lý khách hàng | Admin |
| UC-AD08 | Quản lý báo giá | Admin |
| UC-AD09 | Quản lý đơn hàng | Admin |
| UC-AD10 | Quản lý công nợ | Admin |
| UC-AD11 | Quản lý bài viết | Admin |
| UC-AD12 | Cấu hình chatbot | Admin |
| UC-AD13 | Cấu hình thanh toán | Admin |

## 6. Use case chi tiết bổ sung

### UC-R07 - Thanh toán online cho khách lẻ

| Thuộc tính | Nội dung |
|---|---|
| Actor chính | Retail Customer |
| Actor phụ | Payment Gateway |
| Mục tiêu | Khách lẻ thanh toán đơn hàng trực tuyến |
| Tiền điều kiện | Khách đã có sản phẩm trong giỏ hàng |
| Hậu điều kiện | Đơn hàng được ghi nhận thanh toán thành công hoặc thất bại |

Luồng chính:

1. Khách lẻ vào giỏ hàng.
2. Khách kiểm tra sản phẩm và số lượng.
3. Khách nhập thông tin giao hàng.
4. Khách chọn thanh toán online.
5. Hệ thống tạo giao dịch thanh toán.
6. Hệ thống chuyển khách sang cổng thanh toán.
7. Khách thanh toán.
8. Cổng thanh toán trả kết quả.
9. Hệ thống cập nhật trạng thái thanh toán.
10. Hệ thống tạo đơn hàng bán lẻ nếu thanh toán thành công.

Luồng thay thế:

- Nếu thanh toán thất bại, đơn hàng ở trạng thái chờ thanh toán hoặc hủy.
- Nếu khách đóng trang thanh toán, giao dịch ở trạng thái chờ xử lý.

### UC-B01 - Gửi yêu cầu báo giá B2B

| Thuộc tính | Nội dung |
|---|---|
| Actor chính | B2B Customer |
| Mục tiêu | Khách doanh nghiệp gửi nhu cầu mua sỉ/gia công |
| Tiền điều kiện | Khách truy cập website |
| Hậu điều kiện | Yêu cầu báo giá được tạo ở trạng thái mới |

Luồng chính:

1. Khách doanh nghiệp xem sản phẩm hoặc dịch vụ.
2. Khách vào trang yêu cầu báo giá.
3. Khách nhập tên công ty, người liên hệ, số điện thoại/email.
4. Khách nhập sản phẩm cần mua/gia công.
5. Khách nhập số lượng dự kiến.
6. Khách gửi yêu cầu.
7. Hệ thống lưu yêu cầu.
8. Sales nhận yêu cầu trong admin.

Ghi chú:

- Use case này không yêu cầu thanh toán online ngay.
- Thanh toán sẽ được xử lý sau khi có báo giá/hợp đồng.

### UC-A03 - Đối soát thanh toán online B2C

| Thuộc tính | Nội dung |
|---|---|
| Actor chính | Accountant |
| Actor phụ | Payment Gateway |
| Mục tiêu | Kiểm tra các giao dịch online của khách lẻ |
| Tiền điều kiện | Có đơn hàng bán lẻ thanh toán online |
| Hậu điều kiện | Giao dịch được xác nhận đúng trạng thái |

Luồng chính:

1. Kế toán vào trang thanh toán.
2. Hệ thống hiển thị danh sách giao dịch online.
3. Kế toán lọc giao dịch thành công/thất bại/chờ xử lý.
4. Kế toán kiểm tra giao dịch với cổng thanh toán.
5. Kế toán xác nhận đối soát.
6. Hệ thống cập nhật trạng thái đối soát.

### UC-CB01 - Chatbot tư vấn chọn sản phẩm

| Thuộc tính | Nội dung |
|---|---|
| Actor chính | Guest, Retail Customer, B2B Customer |
| Actor phụ | Chatbot |
| Mục tiêu | Tư vấn sản phẩm phù hợp với nhu cầu |
| Tiền điều kiện | Người dùng mở chatbot |
| Hậu điều kiện | Người dùng nhận được gợi ý hoặc được chuyển sang form liên hệ/báo giá |

Luồng chính:

1. Người dùng mở chatbot.
2. Chatbot hỏi nhu cầu: mua lẻ, mở quán, mua sỉ, gia công thương hiệu riêng.
3. Người dùng chọn nhu cầu.
4. Chatbot gợi ý sản phẩm/dịch vụ phù hợp.
5. Chatbot đề xuất hành động tiếp theo:
   - Mua ngay nếu là khách lẻ.
   - Gửi yêu cầu báo giá nếu là khách doanh nghiệp.
   - Liên hệ sales nếu cần tư vấn sâu.

## 7. Database bổ sung

### 7.1. Bảng carts

Lưu giỏ hàng của khách lẻ.

Trường chính:

- id
- customer_id
- session_id
- created_at
- updated_at

### 7.2. Bảng cart_items

Lưu sản phẩm trong giỏ hàng.

Trường chính:

- id
- cart_id
- product_id
- quantity
- unit_price

### 7.3. Bảng payments

Lưu giao dịch thanh toán.

Trường chính:

- id
- order_id
- payment_type
- payment_method
- amount
- status
- transaction_code
- paid_at
- created_at

Trong đó:

- `payment_type = B2C_ONLINE` cho thanh toán online của khách lẻ.
- `payment_type = B2B_TRANSFER` cho chuyển khoản doanh nghiệp.
- `payment_type = B2B_DEPOSIT` cho đặt cọc doanh nghiệp.

### 7.4. Bảng chatbot_messages

Lưu lịch sử hội thoại nếu cần.

Trường chính:

- id
- session_id
- customer_id
- sender
- message
- created_at

## 8. API bổ sung

### 8.1. Cart API

- `GET /api/cart`
- `POST /api/cart/items`
- `PUT /api/cart/items/{id}`
- `DELETE /api/cart/items/{id}`

### 8.2. Retail Order API

- `POST /api/retail-orders`
- `GET /api/retail-orders/{id}`
- `PUT /api/retail-orders/{id}/cancel`

### 8.3. Payment API

- `POST /api/payments/create`
- `POST /api/payments/callback`
- `GET /api/payments/{id}`
- `GET /api/payments/reconcile`

### 8.4. Chatbot API

- `POST /api/chatbot/message`
- `GET /api/chatbot/suggestions`
- `GET /api/chatbot/faqs`

## 9. Ưu tiên triển khai cho đồ án

Nếu thời gian có hạn, nên chia mức độ như sau:

### Mức bắt buộc

1. Website public.
2. Xem sản phẩm.
3. Gửi yêu cầu báo giá B2B.
4. Admin xem yêu cầu báo giá.
5. Quản lý sản phẩm.
6. Quản lý đơn hàng cơ bản.
7. Quản lý công nợ B2B.

### Mức nên có

8. Giỏ hàng khách lẻ.
9. Đặt hàng bán lẻ.
10. Thanh toán online demo/sandbox.
11. Chatbot rule-based.

### Mức mở rộng

12. Chatbot AI thật.
13. Tích hợp cổng thanh toán thật.
14. Tích hợp vận chuyển thật.
15. Tự động gửi email báo giá.

## 10. Kết luận cập nhật

Dự án Phú Tài Coffee Works nên được trình bày là hệ thống thương mại điện tử **kết hợp B2B và B2C**.

Trong đó:

- **B2B** là nghiệp vụ chính, tập trung vào báo giá, hợp đồng, đơn hàng lớn và công nợ.
- **B2C** là nghiệp vụ bổ sung, cho phép khách lẻ mua sản phẩm đóng gói và thanh toán online.
- **Thanh toán online** phù hợp với khách lẻ.
- **Khách doanh nghiệp** nên dùng báo giá, chuyển khoản, đặt cọc, thanh toán sau và quản lý công nợ.
- **Chatbot** hỗ trợ tư vấn cả hai nhóm khách hàng và giúp điều hướng người dùng đến đúng luồng mua hàng.
