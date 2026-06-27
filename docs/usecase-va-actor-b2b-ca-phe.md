# Actor và Use Case - Dự án B2B nhà máy sản xuất cà phê

## 1. Mục đích tài liệu

> Cập nhật: hệ thống có thêm khách lẻ, giỏ hàng, thanh toán online cho B2C và chatbot tư vấn. Chi tiết bổ sung nằm tại `docs/cap-nhat-mo-hinh-b2b-b2c-thanh-toan-chatbot.md`.

Tài liệu này tổng hợp các **actor** và **use case** chính cho hệ thống thương mại điện tử B2B của **Phú Tài Coffee Works**.

Hệ thống mô phỏng mô hình **mua đi bán lại** trong lĩnh vực cà phê, trong đó doanh nghiệp nhập/sản xuất/gia công cà phê và bán lại cho khách hàng doanh nghiệp như quán cà phê, đại lý, nhà phân phối, khách sạn, nhà hàng hoặc chuỗi F&B.

## 2. Danh sách Actor

| STT | Actor | Mô tả |
|---|---|---|
| 1 | Guest | Người truy cập website chưa đăng nhập |
| 2 | B2B Customer | Khách hàng doanh nghiệp có nhu cầu mua sỉ/gia công cà phê |
| 3 | Sales Staff | Nhân viên kinh doanh phụ trách tư vấn, báo giá, chốt đơn |
| 4 | Warehouse Staff | Nhân viên kho/sản xuất phụ trách chuẩn bị hàng, đóng gói, cập nhật giao hàng |
| 5 | Accountant | Kế toán phụ trách thanh toán, công nợ |
| 6 | Content Staff | Nhân viên nội dung phụ trách bài viết, tin tức, hình ảnh |
| 7 | Admin | Quản trị viên hệ thống, có toàn quyền |

## 3. Mô tả Actor chi tiết

### 3.1. Guest

Guest là người dùng truy cập website public nhưng chưa đăng nhập.

Guest có thể:

- Xem trang chủ.
- Xem thông tin nhà máy.
- Xem danh mục sản phẩm.
- Xem dịch vụ gia công/OEM.
- Xem tin tức.
- Gửi form liên hệ.
- Gửi yêu cầu báo giá.

Guest không thể:

- Theo dõi đơn hàng.
- Xem lịch sử báo giá.
- Xem công nợ.
- Truy cập trang admin.

### 3.2. B2B Customer

B2B Customer là khách hàng doanh nghiệp có tài khoản hoặc được hệ thống ghi nhận thông tin sau khi gửi yêu cầu báo giá.

B2B Customer có thể:

- Xem sản phẩm.
- Gửi yêu cầu báo giá.
- Theo dõi trạng thái báo giá.
- Theo dõi đơn hàng.
- Xem lịch sử mua hàng.
- Xem thông tin thanh toán/công nợ của doanh nghiệp mình nếu hệ thống hỗ trợ.

### 3.3. Sales Staff

Sales Staff là nhân viên kinh doanh.

Sales Staff có thể:

- Xem danh sách yêu cầu báo giá.
- Xem chi tiết yêu cầu báo giá.
- Cập nhật trạng thái yêu cầu báo giá.
- Tạo báo giá cho khách hàng.
- Tạo đơn hàng từ báo giá.
- Quản lý thông tin khách hàng.
- Ghi chú quá trình tư vấn.

### 3.4. Warehouse Staff

Warehouse Staff là nhân viên kho hoặc sản xuất.

Warehouse Staff có thể:

- Xem danh sách đơn hàng cần xử lý.
- Kiểm tra tồn kho.
- Cập nhật trạng thái chuẩn bị hàng.
- Cập nhật trạng thái đóng gói.
- Cập nhật trạng thái giao hàng.

### 3.5. Accountant

Accountant là kế toán phụ trách thanh toán và công nợ.

Accountant có thể:

- Xem danh sách đơn hàng.
- Cập nhật trạng thái thanh toán.
- Ghi nhận khoản thanh toán.
- Quản lý công nợ.
- Theo dõi công nợ quá hạn.
- Xem lịch sử thanh toán của khách hàng.

### 3.6. Content Staff

Content Staff là nhân viên phụ trách nội dung website.

Content Staff có thể:

- Tạo bài viết.
- Chỉnh sửa bài viết.
- Ẩn/hiện bài viết.
- Cập nhật hình ảnh, nội dung giới thiệu.

### 3.7. Admin

Admin là quản trị viên cao nhất.

Admin có thể:

- Quản lý toàn bộ tài khoản.
- Phân quyền nhân viên.
- Quản lý sản phẩm.
- Quản lý danh mục.
- Quản lý khách hàng.
- Quản lý báo giá.
- Quản lý đơn hàng.
- Quản lý công nợ.
- Xem dashboard.
- Cấu hình hệ thống.

## 4. Use Case tổng quát theo Actor

### 4.1. Guest

| Mã use case | Tên use case | Mô tả ngắn |
|---|---|---|
| UC-G01 | Xem trang chủ | Guest xem thông tin tổng quan về nhà máy |
| UC-G02 | Xem giới thiệu nhà máy | Guest xem năng lực, quy trình và thế mạnh |
| UC-G03 | Xem danh sách sản phẩm | Guest xem sản phẩm cà phê bán sỉ |
| UC-G04 | Xem chi tiết sản phẩm | Guest xem thông tin chi tiết một sản phẩm |
| UC-G05 | Xem dịch vụ gia công | Guest xem dịch vụ OEM/private label |
| UC-G06 | Gửi yêu cầu báo giá | Guest gửi thông tin cần báo giá |
| UC-G07 | Gửi liên hệ | Guest gửi form liên hệ |
| UC-G08 | Xem tin tức | Guest xem bài viết/kiến thức cà phê |

### 4.2. B2B Customer

| Mã use case | Tên use case | Mô tả ngắn |
|---|---|---|
| UC-C01 | Đăng ký tài khoản | Khách hàng doanh nghiệp tạo tài khoản |
| UC-C02 | Đăng nhập | Khách hàng đăng nhập hệ thống |
| UC-C03 | Cập nhật thông tin doanh nghiệp | Khách cập nhật tên công ty, MST, địa chỉ |
| UC-C04 | Gửi yêu cầu báo giá | Khách gửi yêu cầu mua sỉ/gia công |
| UC-C05 | Theo dõi trạng thái báo giá | Khách xem báo giá đang xử lý/đã phản hồi |
| UC-C06 | Xem lịch sử đơn hàng | Khách xem các đơn đã mua |
| UC-C07 | Xem chi tiết đơn hàng | Khách xem sản phẩm, số lượng, trạng thái |
| UC-C08 | Xem thông tin thanh toán | Khách xem trạng thái thanh toán |
| UC-C09 | Xem công nợ | Khách xem số tiền còn nợ nếu được cấp quyền |

### 4.3. Sales Staff

| Mã use case | Tên use case | Mô tả ngắn |
|---|---|---|
| UC-S01 | Xem yêu cầu báo giá | Sales xem danh sách yêu cầu từ khách |
| UC-S02 | Xem chi tiết yêu cầu báo giá | Sales xem nội dung yêu cầu cụ thể |
| UC-S03 | Cập nhật trạng thái yêu cầu | Sales chuyển trạng thái mới/đang xử lý/đã phản hồi |
| UC-S04 | Tạo báo giá | Sales tạo báo giá cho khách |
| UC-S05 | Chỉnh sửa báo giá | Sales cập nhật giá, số lượng, hạn báo giá |
| UC-S06 | Gửi báo giá cho khách | Sales gửi báo giá qua hệ thống/email |
| UC-S07 | Chuyển báo giá thành đơn hàng | Sales tạo đơn hàng khi khách đồng ý |
| UC-S08 | Quản lý khách hàng | Sales thêm/sửa thông tin khách hàng |
| UC-S09 | Ghi chú chăm sóc khách hàng | Sales lưu lịch sử tư vấn |

### 4.4. Warehouse Staff

| Mã use case | Tên use case | Mô tả ngắn |
|---|---|---|
| UC-W01 | Xem đơn hàng cần xử lý | Kho xem đơn hàng mới |
| UC-W02 | Kiểm tra tồn kho | Kho kiểm tra số lượng hàng |
| UC-W03 | Cập nhật trạng thái chuẩn bị hàng | Kho xác nhận đang chuẩn bị |
| UC-W04 | Cập nhật trạng thái đóng gói | Kho xác nhận đã đóng gói |
| UC-W05 | Cập nhật trạng thái giao hàng | Kho cập nhật đang giao/đã giao |
| UC-W06 | Cập nhật tồn kho | Kho điều chỉnh tồn kho sau đơn hàng |

### 4.5. Accountant

| Mã use case | Tên use case | Mô tả ngắn |
|---|---|---|
| UC-A01 | Xem danh sách thanh toán | Kế toán xem đơn cần thanh toán |
| UC-A02 | Ghi nhận thanh toán | Kế toán nhập khoản tiền đã nhận |
| UC-A03 | Cập nhật trạng thái thanh toán | Kế toán đổi chưa thanh toán/thanh toán một phần/đã thanh toán |
| UC-A04 | Quản lý công nợ | Kế toán xem và cập nhật công nợ |
| UC-A05 | Xem công nợ quá hạn | Kế toán lọc danh sách nợ quá hạn |
| UC-A06 | Xem lịch sử thanh toán | Kế toán xem các lần thanh toán của khách |

### 4.6. Content Staff

| Mã use case | Tên use case | Mô tả ngắn |
|---|---|---|
| UC-CT01 | Quản lý bài viết | Content xem danh sách bài viết |
| UC-CT02 | Tạo bài viết | Content tạo tin tức/kiến thức cà phê |
| UC-CT03 | Cập nhật bài viết | Content sửa nội dung |
| UC-CT04 | Ẩn/hiện bài viết | Content đổi trạng thái bài viết |

### 4.7. Admin

| Mã use case | Tên use case | Mô tả ngắn |
|---|---|---|
| UC-AD01 | Đăng nhập admin | Admin đăng nhập trang quản trị |
| UC-AD02 | Xem dashboard | Admin xem số liệu tổng quan |
| UC-AD03 | Quản lý người dùng | Admin tạo/sửa/khóa tài khoản |
| UC-AD04 | Phân quyền | Admin gán role cho nhân viên |
| UC-AD05 | Quản lý sản phẩm | Admin thêm/sửa/xóa sản phẩm |
| UC-AD06 | Quản lý danh mục | Admin quản lý danh mục sản phẩm |
| UC-AD07 | Quản lý khách hàng | Admin quản lý khách hàng doanh nghiệp |
| UC-AD08 | Quản lý báo giá | Admin xem và điều phối báo giá |
| UC-AD09 | Quản lý đơn hàng | Admin xem và cập nhật đơn hàng |
| UC-AD10 | Quản lý công nợ | Admin xem toàn bộ công nợ |
| UC-AD11 | Quản lý nội dung | Admin quản lý bài viết |
| UC-AD12 | Cấu hình hệ thống | Admin cấu hình thông tin website |

## 5. Use Case chi tiết

### UC-G06 - Gửi yêu cầu báo giá

| Thuộc tính | Nội dung |
|---|---|
| Actor chính | Guest, B2B Customer |
| Mục tiêu | Khách hàng gửi nhu cầu mua sỉ/gia công cà phê cho nhà máy |
| Tiền điều kiện | Khách truy cập được website |
| Hậu điều kiện | Hệ thống lưu yêu cầu báo giá ở trạng thái "Mới" |

Luồng chính:

1. Khách vào trang yêu cầu báo giá.
2. Hệ thống hiển thị form báo giá.
3. Khách nhập tên công ty, người liên hệ, số điện thoại/email.
4. Khách nhập sản phẩm cần báo giá và số lượng dự kiến.
5. Khách nhập ghi chú nếu có.
6. Khách bấm gửi yêu cầu.
7. Hệ thống kiểm tra dữ liệu.
8. Hệ thống lưu yêu cầu báo giá.
9. Hệ thống thông báo gửi thành công.

Luồng thay thế:

- Nếu thiếu thông tin bắt buộc, hệ thống hiển thị lỗi.
- Nếu lỗi hệ thống, yêu cầu không được lưu và hiển thị thông báo thất bại.

### UC-S04 - Tạo báo giá

| Thuộc tính | Nội dung |
|---|---|
| Actor chính | Sales Staff |
| Mục tiêu | Tạo báo giá cho khách hàng dựa trên yêu cầu |
| Tiền điều kiện | Sales đã đăng nhập và có yêu cầu báo giá |
| Hậu điều kiện | Báo giá được tạo và gắn với khách hàng/yêu cầu |

Luồng chính:

1. Sales vào trang quản lý yêu cầu báo giá.
2. Sales chọn một yêu cầu cần xử lý.
3. Sales xem thông tin sản phẩm, số lượng, ghi chú.
4. Sales nhập đơn giá, chiết khấu, thời hạn báo giá.
5. Sales lưu báo giá.
6. Hệ thống tạo báo giá.
7. Hệ thống cập nhật trạng thái yêu cầu là "Đã báo giá".

Luồng thay thế:

- Nếu thiếu giá hoặc số lượng, hệ thống yêu cầu nhập lại.
- Nếu báo giá hết hạn, sales cần tạo báo giá mới.

### UC-S07 - Chuyển báo giá thành đơn hàng

| Thuộc tính | Nội dung |
|---|---|
| Actor chính | Sales Staff |
| Mục tiêu | Tạo đơn hàng khi khách đồng ý báo giá |
| Tiền điều kiện | Báo giá đang ở trạng thái hợp lệ |
| Hậu điều kiện | Đơn hàng mới được tạo |

Luồng chính:

1. Sales mở chi tiết báo giá.
2. Sales xác nhận khách hàng đồng ý.
3. Sales bấm tạo đơn hàng.
4. Hệ thống tạo đơn hàng từ báo giá.
5. Hệ thống chuyển trạng thái đơn hàng sang "Mới".
6. Hệ thống chuyển đơn hàng cho kho/sản xuất xử lý.

### UC-W03 - Cập nhật trạng thái chuẩn bị hàng

| Thuộc tính | Nội dung |
|---|---|
| Actor chính | Warehouse Staff |
| Mục tiêu | Cập nhật tiến độ xử lý đơn hàng |
| Tiền điều kiện | Đơn hàng đã được tạo |
| Hậu điều kiện | Trạng thái đơn hàng được cập nhật |

Luồng chính:

1. Nhân viên kho đăng nhập admin.
2. Nhân viên kho mở danh sách đơn hàng.
3. Nhân viên kho chọn đơn hàng cần xử lý.
4. Nhân viên kho kiểm tra tồn kho/sản xuất.
5. Nhân viên kho cập nhật trạng thái "Đang chuẩn bị hàng".
6. Hệ thống lưu trạng thái mới.

### UC-A02 - Ghi nhận thanh toán

| Thuộc tính | Nội dung |
|---|---|
| Actor chính | Accountant |
| Mục tiêu | Ghi nhận khoản thanh toán của khách hàng |
| Tiền điều kiện | Đơn hàng đã tồn tại |
| Hậu điều kiện | Thanh toán và công nợ được cập nhật |

Luồng chính:

1. Kế toán mở danh sách đơn hàng/công nợ.
2. Kế toán chọn đơn hàng cần cập nhật.
3. Kế toán nhập số tiền khách đã thanh toán.
4. Kế toán chọn phương thức thanh toán.
5. Hệ thống lưu lịch sử thanh toán.
6. Hệ thống tính lại số tiền còn nợ.
7. Hệ thống cập nhật trạng thái thanh toán.

Luồng thay thế:

- Nếu số tiền thanh toán lớn hơn số tiền còn nợ, hệ thống báo lỗi.
- Nếu thanh toán đủ, trạng thái chuyển thành "Đã thanh toán".
- Nếu thanh toán một phần, trạng thái chuyển thành "Thanh toán một phần".

### UC-A04 - Quản lý công nợ

| Thuộc tính | Nội dung |
|---|---|
| Actor chính | Accountant, Admin |
| Mục tiêu | Theo dõi số tiền khách hàng còn nợ |
| Tiền điều kiện | Có đơn hàng phát sinh thanh toán |
| Hậu điều kiện | Công nợ được theo dõi và cập nhật |

Luồng chính:

1. Kế toán vào trang công nợ.
2. Hệ thống hiển thị danh sách công nợ.
3. Kế toán lọc theo khách hàng, trạng thái hoặc ngày đến hạn.
4. Kế toán xem chi tiết công nợ.
5. Kế toán cập nhật thanh toán nếu khách trả thêm.
6. Hệ thống cập nhật số tiền còn nợ.

### UC-AD05 - Quản lý sản phẩm

| Thuộc tính | Nội dung |
|---|---|
| Actor chính | Admin |
| Mục tiêu | Quản lý danh sách sản phẩm cà phê |
| Tiền điều kiện | Admin đã đăng nhập |
| Hậu điều kiện | Dữ liệu sản phẩm được cập nhật |

Luồng chính:

1. Admin vào trang quản lý sản phẩm.
2. Hệ thống hiển thị danh sách sản phẩm.
3. Admin thêm, sửa hoặc ẩn sản phẩm.
4. Admin nhập thông tin sản phẩm.
5. Hệ thống kiểm tra dữ liệu.
6. Hệ thống lưu sản phẩm.

## 6. Quan hệ Actor - Use Case

| Use case | Guest | B2B Customer | Sales | Warehouse | Accountant | Content | Admin |
|---|---|---|---|---|---|---|---|
| Xem trang chủ | x | x |  |  |  |  |  |
| Xem sản phẩm | x | x |  |  |  |  |  |
| Gửi yêu cầu báo giá | x | x |  |  |  |  |  |
| Theo dõi đơn hàng |  | x |  |  |  |  |  |
| Xem yêu cầu báo giá |  |  | x |  |  |  | x |
| Tạo báo giá |  |  | x |  |  |  | x |
| Tạo đơn hàng |  |  | x |  |  |  | x |
| Cập nhật trạng thái kho |  |  |  | x |  |  | x |
| Ghi nhận thanh toán |  |  |  |  | x |  | x |
| Quản lý công nợ |  |  |  |  | x |  | x |
| Quản lý bài viết |  |  |  |  |  | x | x |
| Quản lý người dùng |  |  |  |  |  |  | x |

## 7. Gợi ý vẽ Use Case tổng quát

Khi vẽ UML use case tổng quát, có thể chia hệ thống thành các nhóm:

### Public Website

Actor:

- Guest
- B2B Customer

Use case:

- Xem trang chủ
- Xem sản phẩm
- Xem dịch vụ
- Gửi yêu cầu báo giá
- Gửi liên hệ
- Xem tin tức
- Đăng ký
- Đăng nhập

### Sales Management

Actor:

- Sales Staff
- Admin

Use case:

- Xem yêu cầu báo giá
- Tạo báo giá
- Gửi báo giá
- Chuyển báo giá thành đơn hàng
- Quản lý khách hàng

### Order & Warehouse Management

Actor:

- Warehouse Staff
- Admin

Use case:

- Xem đơn hàng
- Kiểm tra tồn kho
- Cập nhật chuẩn bị hàng
- Cập nhật đóng gói
- Cập nhật giao hàng

### Accounting & Debt Management

Actor:

- Accountant
- Admin

Use case:

- Ghi nhận thanh toán
- Quản lý công nợ
- Xem công nợ quá hạn
- Xem lịch sử thanh toán

### System Administration

Actor:

- Admin
- Content Staff

Use case:

- Quản lý sản phẩm
- Quản lý danh mục
- Quản lý bài viết
- Quản lý người dùng
- Phân quyền
- Xem dashboard

## 8. Danh sách use case ưu tiên làm trong đồ án

Nếu thời gian làm đồ án có hạn, nên ưu tiên các use case sau:

1. Xem trang chủ.
2. Xem danh sách sản phẩm.
3. Xem dịch vụ gia công.
4. Gửi yêu cầu báo giá.
5. Admin đăng nhập.
6. Admin xem dashboard.
7. Admin quản lý sản phẩm.
8. Sales xem yêu cầu báo giá.
9. Sales tạo báo giá.
10. Sales tạo đơn hàng.
11. Kế toán cập nhật thanh toán.
12. Kế toán quản lý công nợ.

Các use case còn lại có thể đưa vào phần mở rộng hoặc hướng phát triển.
