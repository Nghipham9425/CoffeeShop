import swaggerJsdoc from "swagger-jsdoc";

export const swaggerSpec = swaggerJsdoc({
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Phú Tài Coffee Works API",
      version: "0.1.0",
      description:
        "API cho đồ án thương mại điện tử nhà máy cà phê B2B/B2C: auth, danh mục, sản phẩm, báo giá và liên hệ.",
    },
    servers: [
      {
        url: "http://localhost:4000",
        description: "Local development",
      },
    ],
    tags: [
      { name: "Health" },
      { name: "Auth" },
      { name: "Categories" },
      { name: "Products" },
      { name: "Quote Requests" },
      { name: "Contact Messages" },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      schemas: {
        RegisterRequest: {
          type: "object",
          required: ["fullName", "email", "password"],
          properties: {
            fullName: { type: "string", example: "Nguyễn Văn A" },
            email: { type: "string", example: "customer@example.com" },
            phone: { type: "string", example: "0909123456" },
            password: { type: "string", example: "Customer@123" },
          },
        },
        LoginRequest: {
          type: "object",
          required: ["email", "password"],
          properties: {
            email: { type: "string", example: "admin@phutaicoffee.vn" },
            password: { type: "string", example: "Admin@123" },
          },
        },
        CategoryRequest: {
          type: "object",
          required: ["name"],
          properties: {
            name: { type: "string", example: "Cà phê rang xay" },
            slug: { type: "string", example: "ca-phe-rang-xay" },
            description: { type: "string", example: "Sản phẩm cà phê rang xay bán lẻ và bán sỉ." },
            isActive: { type: "boolean", example: true },
          },
        },
        ProductRequest: {
          type: "object",
          required: ["categoryId", "name"],
          properties: {
            categoryId: { type: "integer", example: 1 },
            name: { type: "string", example: "Robusta rang mộc" },
            slug: { type: "string", example: "robusta-rang-moc" },
            description: { type: "string", example: "Vị đậm, hậu cacao, phù hợp pha phin." },
            unit: { type: "string", example: "kg" },
            price: { type: "number", example: 145000 },
            minimumOrderKg: { type: "integer", example: 5 },
            imageUrl: { type: "string", example: "https://example.com/coffee.jpg" },
            isRetail: { type: "boolean", example: true },
            isB2b: { type: "boolean", example: true },
          },
        },
        ProductPriceRequest: {
          type: "object",
          required: ["priceType", "price"],
          properties: {
            priceType: {
              type: "string",
              enum: ["RETAIL", "WHOLESALE", "VIP", "B2B"],
              example: "B2B",
            },
            minQuantity: { type: "integer", example: 50 },
            price: { type: "number", example: 118000 },
            startAt: { type: "string", format: "date-time" },
            endAt: { type: "string", format: "date-time" },
            isActive: { type: "boolean", example: true },
          },
        },
        QuoteRequest: {
          type: "object",
          required: ["companyName", "contactName", "phoneOrEmail", "productNeed"],
          properties: {
            companyName: { type: "string", example: "Công ty TNHH Demo F&B" },
            contactName: { type: "string", example: "Anh Minh" },
            phoneOrEmail: { type: "string", example: "purchase@demofnb.vn" },
            productNeed: {
              type: "string",
              example: "Gia công cà phê rang xay private label 200kg/tháng",
            },
            expectedQuantityKg: { type: "integer", example: 200 },
            note: { type: "string", example: "Cần tư vấn profile rang và bao bì." },
          },
        },
        ContactMessage: {
          type: "object",
          required: ["fullName", "message"],
          properties: {
            fullName: { type: "string", example: "Khách liên hệ demo" },
            email: { type: "string", example: "contact@example.com" },
            phone: { type: "string", example: "0909123456" },
            subject: { type: "string", example: "Cần báo giá cà phê rang xay" },
            message: {
              type: "string",
              example: "Tôi cần tư vấn mua sỉ cà phê rang xay cho chuỗi quán.",
            },
          },
        },
        StatusUpdateRequest: {
          type: "object",
          required: ["status"],
          properties: {
            status: {
              type: "string",
              enum: ["NEW", "CONTACTED", "QUOTED", "CLOSED", "CANCELLED"],
              example: "CONTACTED",
            },
          },
        },
        ReadStatusRequest: {
          type: "object",
          required: ["isRead"],
          properties: {
            isRead: { type: "boolean", example: true },
          },
        },
      },
    },
    paths: {
      "/api/health": {
        get: {
          tags: ["Health"],
          summary: "Kiểm tra trạng thái API và database",
          responses: {
            "200": { description: "API hoạt động bình thường" },
          },
        },
      },
      "/api/auth/register": {
        post: {
          tags: ["Auth"],
          summary: "Đăng ký tài khoản khách hàng",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/RegisterRequest" },
              },
            },
          },
          responses: {
            "201": { description: "Đăng ký thành công" },
            "409": { description: "Email đã tồn tại" },
          },
        },
      },
      "/api/auth/login": {
        post: {
          tags: ["Auth"],
          summary: "Đăng nhập và nhận JWT token",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/LoginRequest" },
              },
            },
          },
          responses: {
            "200": { description: "Đăng nhập thành công" },
            "401": { description: "Email hoặc mật khẩu không đúng" },
          },
        },
      },
      "/api/auth/forgot-password": {
        post: {
          tags: ["Auth"],
          summary: "Gửi email đặt lại mật khẩu",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["email"],
                  properties: {
                    email: { type: "string", format: "email", example: "customer@example.com" },
                  },
                },
              },
            },
          },
          responses: {
            "200": { description: "Đã tiếp nhận yêu cầu" },
            "429": { description: "Gửi yêu cầu quá nhiều lần" },
          },
        },
      },
      "/api/auth/reset-password": {
        post: {
          tags: ["Auth"],
          summary: "Đặt mật khẩu mới bằng token nhận qua email",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["token", "newPassword", "confirmPassword"],
                  properties: {
                    token: { type: "string" },
                    newPassword: { type: "string", format: "password", example: "MatKhauMoi123" },
                    confirmPassword: { type: "string", format: "password", example: "MatKhauMoi123" },
                  },
                },
              },
            },
          },
          responses: {
            "200": { description: "Đặt lại mật khẩu thành công" },
            "400": { description: "Token không hợp lệ, hết hạn hoặc đã sử dụng" },
            "429": { description: "Thử đặt lại mật khẩu quá nhiều lần" },
          },
        },
      },
      "/api/categories": {
        get: {
          tags: ["Categories"],
          summary: "Lấy danh sách danh mục",
          parameters: [
            { name: "keyword", in: "query", schema: { type: "string" } },
            { name: "includeInactive", in: "query", schema: { type: "boolean" } },
          ],
          responses: {
            "200": { description: "Danh sách danh mục" },
          },
        },
        post: {
          tags: ["Categories"],
          summary: "Tạo danh mục",
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/CategoryRequest" },
              },
            },
          },
          responses: {
            "201": { description: "Tạo danh mục thành công" },
            "401": { description: "Chưa đăng nhập" },
            "403": { description: "Không có quyền" },
          },
        },
      },
      "/api/categories/{id}": {
        get: {
          tags: ["Categories"],
          summary: "Lấy chi tiết danh mục",
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
          responses: {
            "200": { description: "Chi tiết danh mục" },
            "404": { description: "Không tìm thấy danh mục" },
          },
        },
        patch: {
          tags: ["Categories"],
          summary: "Cập nhật danh mục",
          security: [{ bearerAuth: [] }],
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/CategoryRequest" },
              },
            },
          },
          responses: {
            "200": { description: "Cập nhật danh mục thành công" },
            "404": { description: "Không tìm thấy danh mục" },
          },
        },
        delete: {
          tags: ["Categories"],
          summary: "Xóa mềm danh mục",
          security: [{ bearerAuth: [] }],
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
          responses: {
            "204": { description: "Xóa thành công" },
            "404": { description: "Không tìm thấy danh mục" },
          },
        },
      },
      "/api/products": {
        get: {
          tags: ["Products"],
          summary: "Lấy danh sách sản phẩm",
          parameters: [
            { name: "keyword", in: "query", schema: { type: "string" } },
            { name: "categorySlug", in: "query", schema: { type: "string" } },
            { name: "isRetail", in: "query", schema: { type: "boolean" } },
            { name: "isB2b", in: "query", schema: { type: "boolean" } },
          ],
          responses: {
            "200": { description: "Danh sách sản phẩm" },
          },
        },
        post: {
          tags: ["Products"],
          summary: "Tạo sản phẩm",
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ProductRequest" },
              },
            },
          },
          responses: {
            "201": { description: "Tạo sản phẩm thành công" },
            "404": { description: "Không tìm thấy danh mục" },
          },
        },
      },
      "/api/products/{id}": {
        get: {
          tags: ["Products"],
          summary: "Lấy chi tiết sản phẩm",
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
          responses: {
            "200": { description: "Chi tiết sản phẩm" },
            "404": { description: "Không tìm thấy sản phẩm" },
          },
        },
        patch: {
          tags: ["Products"],
          summary: "Cập nhật sản phẩm",
          security: [{ bearerAuth: [] }],
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ProductRequest" },
              },
            },
          },
          responses: {
            "200": { description: "Cập nhật sản phẩm thành công" },
            "404": { description: "Không tìm thấy sản phẩm hoặc danh mục" },
          },
        },
        delete: {
          tags: ["Products"],
          summary: "Xóa mềm sản phẩm",
          security: [{ bearerAuth: [] }],
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
          responses: {
            "204": { description: "Xóa thành công" },
            "404": { description: "Không tìm thấy sản phẩm" },
          },
        },
      },
      "/api/products/{id}/prices": {
        post: {
          tags: ["Products"],
          summary: "Thêm hoặc cập nhật giá sản phẩm",
          security: [{ bearerAuth: [] }],
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ProductPriceRequest" },
              },
            },
          },
          responses: {
            "201": { description: "Lưu giá sản phẩm thành công" },
            "404": { description: "Không tìm thấy sản phẩm" },
          },
        },
      },
      "/api/quote-requests": {
        get: {
          tags: ["Quote Requests"],
          summary: "Lấy danh sách yêu cầu báo giá",
          security: [{ bearerAuth: [] }],
          responses: {
            "200": { description: "Danh sách yêu cầu báo giá" },
          },
        },
        post: {
          tags: ["Quote Requests"],
          summary: "Khách B2B gửi yêu cầu báo giá",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/QuoteRequest" },
              },
            },
          },
          responses: {
            "201": { description: "Gửi yêu cầu thành công" },
          },
        },
      },
      "/api/quote-requests/{id}": {
        get: {
          tags: ["Quote Requests"],
          summary: "Lấy chi tiết yêu cầu báo giá",
          security: [{ bearerAuth: [] }],
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
          responses: {
            "200": { description: "Chi tiết yêu cầu báo giá" },
            "404": { description: "Không tìm thấy yêu cầu báo giá" },
          },
        },
      },
      "/api/quote-requests/{id}/status": {
        patch: {
          tags: ["Quote Requests"],
          summary: "Cập nhật trạng thái yêu cầu báo giá",
          security: [{ bearerAuth: [] }],
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/StatusUpdateRequest" },
              },
            },
          },
          responses: {
            "200": { description: "Cập nhật trạng thái thành công" },
            "404": { description: "Không tìm thấy yêu cầu báo giá" },
          },
        },
      },
      "/api/contact-messages": {
        get: {
          tags: ["Contact Messages"],
          summary: "Lấy danh sách tin nhắn liên hệ",
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: "keyword", in: "query", schema: { type: "string" } },
            { name: "isRead", in: "query", schema: { type: "boolean" } },
          ],
          responses: {
            "200": { description: "Danh sách tin nhắn liên hệ" },
          },
        },
        post: {
          tags: ["Contact Messages"],
          summary: "Khách gửi tin nhắn liên hệ",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ContactMessage" },
              },
            },
          },
          responses: {
            "201": { description: "Gửi liên hệ thành công" },
          },
        },
      },
      "/api/contact-messages/{id}": {
        get: {
          tags: ["Contact Messages"],
          summary: "Lấy chi tiết tin nhắn liên hệ",
          security: [{ bearerAuth: [] }],
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
          responses: {
            "200": { description: "Chi tiết tin nhắn liên hệ" },
            "404": { description: "Không tìm thấy tin nhắn liên hệ" },
          },
        },
        delete: {
          tags: ["Contact Messages"],
          summary: "Xóa tin nhắn liên hệ",
          security: [{ bearerAuth: [] }],
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
          responses: {
            "204": { description: "Xóa thành công" },
            "404": { description: "Không tìm thấy tin nhắn liên hệ" },
          },
        },
      },
      "/api/contact-messages/{id}/read-status": {
        patch: {
          tags: ["Contact Messages"],
          summary: "Đánh dấu đã đọc/chưa đọc tin nhắn liên hệ",
          security: [{ bearerAuth: [] }],
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ReadStatusRequest" },
              },
            },
          },
          responses: {
            "200": { description: "Cập nhật trạng thái đọc thành công" },
            "404": { description: "Không tìm thấy tin nhắn liên hệ" },
          },
        },
      },
    },
  },
  apis: [],
});
