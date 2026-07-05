# ERD và Class Diagram - Phú Tài Coffee Works

Tài liệu này tách sơ đồ thành nhiều phần nhỏ để dễ nhìn, dễ chụp màn hình và dễ đưa vào báo cáo đồ án.

## 1. ERD - Tài khoản, khách hàng và tương tác

```mermaid
erDiagram
    users {
        int id PK
        string full_name
        string email UK
        string phone
        enum role
        boolean is_active
    }

    addresses {
        int id PK
        int user_id FK
        string receiver_name
        string phone
        string province
        string district
        string ward
        string detail
        boolean is_default
    }

    loyalty_profiles {
        int id PK
        int user_id FK
        string tier
        int points
        decimal total_spent
        int order_count
    }

    reviews {
        int id PK
        int user_id FK
        int product_id FK
        int order_id FK
        int rating
        enum status
    }

    chatbot_conversations {
        int id PK
        int user_id FK
        string guest_name
        string guest_phone
        string topic
        boolean is_resolved
    }

    chatbot_messages {
        int id PK
        int conversation_id FK
        enum sender
        string content
        string intent
    }

    contact_messages {
        int id PK
        string full_name
        string email
        string phone
        string subject
        string message
        boolean is_read
    }

    users ||--o{ addresses : "có"
    users ||--o| loyalty_profiles : "tích điểm"
    users ||--o{ reviews : "gửi"
    users ||--o{ chatbot_conversations : "tạo"
    chatbot_conversations ||--o{ chatbot_messages : "gồm"
```

## 2. ERD - Sản phẩm, bảng giá, kho và mua hàng

```mermaid
erDiagram
    categories {
        int id PK
        string name
        string slug UK
        string description
        boolean is_active
    }

    products {
        int id PK
        int category_id FK
        string name
        string slug UK
        string unit
        decimal price
        int minimum_order_kg
        boolean is_retail
        boolean is_b2b
        boolean is_active
    }

    product_prices {
        int id PK
        int product_id FK
        enum price_type
        int min_quantity
        decimal price
        datetime start_at
        datetime end_at
        boolean is_active
    }

    inventories {
        int id PK
        int product_id FK
        int quantity
        int min_quantity
        string warehouse
    }

    stock_movements {
        int id PK
        int product_id FK
        enum type
        int quantity
        string reason
        string reference
    }

    suppliers {
        int id PK
        string name UK
        string phone
        string email
        string address
    }

    purchase_orders {
        int id PK
        int supplier_id FK
        string purchase_code UK
        datetime expected_date
        datetime received_at
        decimal total_amount
        enum status
    }

    purchase_order_items {
        int id PK
        int purchase_order_id FK
        int product_id FK
        int quantity
        decimal unit_cost
        decimal line_total
    }

    categories ||--o{ products : "phân loại"
    products ||--o{ product_prices : "có giá"
    products ||--o{ inventories : "tồn kho"
    products ||--o{ stock_movements : "biến động"
    suppliers ||--o{ purchase_orders : "cung cấp"
    purchase_orders ||--o{ purchase_order_items : "gồm"
    products ||--o{ purchase_order_items : "được nhập"
```

## 3. ERD - Bán lẻ B2C, đơn hàng, thanh toán và giao nhận

```mermaid
erDiagram
    users {
        int id PK
        string full_name
        string email UK
        string phone
    }

    addresses {
        int id PK
        int user_id FK
        string receiver_name
        string phone
        string detail
    }

    promotions {
        int id PK
        string name
        string code UK
        enum discount_type
        decimal discount_value
        decimal min_order_amount
        enum status
    }

    orders {
        int id PK
        int user_id FK
        int address_id FK
        int promotion_id FK
        string order_code UK
        string customer_name
        string customer_phone
        decimal subtotal
        decimal shipping_fee
        decimal discount_amount
        decimal total_amount
        enum status
    }

    order_items {
        int id PK
        int order_id FK
        int product_id FK
        int quantity
        decimal unit_price
        decimal line_total
    }

    products {
        int id PK
        string name
        decimal price
        boolean is_retail
        boolean is_b2b
    }

    payments {
        int id PK
        int order_id FK
        enum method
        enum status
        decimal amount
        string transaction_code
        datetime paid_at
    }

    shipments {
        int id PK
        int order_id FK
        string carrier
        string tracking_code
        enum status
        datetime shipped_at
        datetime delivered_at
    }

    reviews {
        int id PK
        int user_id FK
        int product_id FK
        int order_id FK
        int rating
        enum status
    }

    users ||--o{ addresses : "lưu"
    users ||--o{ orders : "đặt"
    addresses ||--o{ orders : "nhận hàng"
    promotions ||--o{ orders : "áp dụng"
    orders ||--|{ order_items : "gồm"
    products ||--o{ order_items : "được mua"
    orders ||--o{ payments : "thanh toán"
    orders ||--o| shipments : "giao hàng"
    users ||--o{ reviews : "đánh giá"
    products ||--o{ reviews : "nhận đánh giá"
    orders ||--o{ reviews : "sau mua"
```

## 4. ERD - B2B, báo giá, hợp đồng, hóa đơn và công nợ

```mermaid
erDiagram
    business_customers {
        int id PK
        string company_name
        string tax_code UK
        string contact_name
        string phone
        string email
        string address
    }

    quote_requests {
        int id PK
        int business_customer_id FK
        string company_name
        string contact_name
        string phone_or_email
        string product_need
        int expected_quantity_kg
        enum status
    }

    contracts {
        int id PK
        int business_customer_id FK
        string contract_code UK
        string title
        datetime start_date
        datetime end_date
        decimal total_value
        int deposit_percent
        enum status
    }

    invoices {
        int id PK
        int business_customer_id FK
        int contract_id FK
        string invoice_code UK
        decimal amount
        decimal paid_amount
        datetime due_date
        enum status
    }

    debts {
        int id PK
        int business_customer_id FK
        int invoice_id FK
        string debt_code UK
        decimal original_amount
        decimal remaining_amount
        datetime due_date
        enum status
    }

    business_customers ||--o{ quote_requests : "gửi yêu cầu"
    business_customers ||--o{ contracts : "ký"
    contracts ||--o{ invoices : "phát sinh"
    business_customers ||--o{ invoices : "nhận"
    invoices ||--o{ debts : "tạo công nợ"
    business_customers ||--o{ debts : "theo dõi"
```

## 5. Class Diagram tổng quát theo phân hệ

```mermaid
classDiagram
direction LR

namespace TaiKhoan {
    class User {
        +Int id
        +String fullName
        +String email
        +String phone
        +UserRole role
        +Boolean isActive
    }

    class Address {
        +Int id
        +String receiverName
        +String phone
        +String detail
        +Boolean isDefault
    }

    class LoyaltyProfile {
        +Int id
        +String tier
        +Int points
        +Decimal totalSpent
        +Int orderCount
    }
}

namespace SanPhamKho {
    class Category {
        +Int id
        +String name
        +String slug
        +Boolean isActive
    }

    class Product {
        +Int id
        +String name
        +String slug
        +Decimal price
        +Int minimumOrderKg
        +Boolean isRetail
        +Boolean isB2b
    }

    class ProductPrice {
        +Int id
        +ProductPriceType priceType
        +Int minQuantity
        +Decimal price
    }

    class Inventory {
        +Int id
        +Int quantity
        +Int minQuantity
        +String warehouse
    }

    class StockMovement {
        +Int id
        +StockMovementType type
        +Int quantity
        +String reason
    }
}

namespace BanLeB2C {
    class Promotion {
        +Int id
        +String code
        +DiscountType discountType
        +Decimal discountValue
        +PromotionStatus status
    }

    class Order {
        +Int id
        +String orderCode
        +String customerName
        +Decimal totalAmount
        +OrderStatus status
    }

    class OrderItem {
        +Int id
        +Int quantity
        +Decimal unitPrice
        +Decimal lineTotal
    }

    class Payment {
        +Int id
        +PaymentMethod method
        +PaymentStatus status
        +Decimal amount
    }

    class Shipment {
        +Int id
        +String carrier
        +String trackingCode
        +ShipmentStatus status
    }

    class Review {
        +Int id
        +Int rating
        +String content
        +ReviewStatus status
    }
}

namespace DoanhNghiepB2B {
    class BusinessCustomer {
        +Int id
        +String companyName
        +String taxCode
        +String contactName
        +String phone
    }

    class QuoteRequest {
        +Int id
        +String productNeed
        +Int expectedQuantityKg
        +QuoteRequestStatus status
    }

    class Contract {
        +Int id
        +String contractCode
        +Decimal totalValue
        +Int depositPercent
        +ContractStatus status
    }

    class Invoice {
        +Int id
        +String invoiceCode
        +Decimal amount
        +Decimal paidAmount
        +InvoiceStatus status
    }

    class Debt {
        +Int id
        +String debtCode
        +Decimal originalAmount
        +Decimal remainingAmount
        +DebtStatus status
    }
}

namespace ChatbotLienHe {
    class ChatbotConversation {
        +Int id
        +String guestName
        +String topic
        +Boolean isResolved
    }

    class ChatbotMessage {
        +Int id
        +ChatbotSender sender
        +String content
        +String intent
    }

    class ContactMessage {
        +Int id
        +String fullName
        +String phone
        +String subject
        +Boolean isRead
    }
}

User "1" --> "0..*" Address
User "1" --> "0..1" LoyaltyProfile
User "1" --> "0..*" Order
User "1" --> "0..*" Review
User "1" --> "0..*" ChatbotConversation

Category "1" --> "0..*" Product
Product "1" --> "0..*" ProductPrice
Product "1" --> "0..*" Inventory
Product "1" --> "0..*" StockMovement
Product "1" --> "0..*" OrderItem
Product "1" --> "0..*" Review

Promotion "1" --> "0..*" Order
Order "1" --> "1..*" OrderItem
Order "1" --> "0..*" Payment
Order "1" --> "0..1" Shipment
Order "1" --> "0..*" Review

BusinessCustomer "1" --> "0..*" QuoteRequest
BusinessCustomer "1" --> "0..*" Contract
BusinessCustomer "1" --> "0..*" Invoice
BusinessCustomer "1" --> "0..*" Debt
Contract "1" --> "0..*" Invoice
Invoice "1" --> "0..*" Debt

ChatbotConversation "1" --> "0..*" ChatbotMessage
```

## 6. Enum chính

```mermaid
classDiagram
direction TB

class UserRole {
    <<enumeration>>
    ADMIN
    SALES
    WAREHOUSE
    ACCOUNTANT
    CUSTOMER
}

class ProductPriceType {
    <<enumeration>>
    RETAIL
    WHOLESALE
    VIP
    B2B
}

class OrderStatus {
    <<enumeration>>
    PENDING
    CONFIRMED
    PACKING
    SHIPPING
    COMPLETED
    CANCELLED
}

class PaymentMethod {
    <<enumeration>>
    COD
    BANK_TRANSFER
    MOMO
    VNPAY
    ZALOPAY
}

class PaymentStatus {
    <<enumeration>>
    PENDING
    PAID
    FAILED
    REFUNDED
}

class QuoteRequestStatus {
    <<enumeration>>
    NEW
    CONTACTED
    QUOTED
    CLOSED
    CANCELLED
}

class ContractStatus {
    <<enumeration>>
    DRAFT
    ACTIVE
    COMPLETED
    CANCELLED
}

class InvoiceStatus {
    <<enumeration>>
    UNPAID
    PARTIAL
    PAID
    OVERDUE
    CANCELLED
}

class DebtStatus {
    <<enumeration>>
    OPEN
    PARTIAL
    CLEARED
    OVERDUE
}
```
