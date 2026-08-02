const API_BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:4000/api";
const TOKEN_KEY = "phu_tai_admin_token";
const USER_KEY = "phu_tai_admin_user";

export type AdminUser = {
  id: number;
  fullName: string;
  email: string;
  phone: string | null;
  role: string;
  isActive: boolean;
};

export type Category = {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  isActive: boolean;
  productCount: number;
};

export type ProductPrice = {
  id: number;
  productId?: number;
  priceType: "RETAIL" | "WHOLESALE" | "VIP" | "B2B";
  minQuantity: number;
  price: number;
  startAt: string | null;
  endAt: string | null;
  isActive: boolean;
};

export type Product = {
  id: number;
  categoryId: number;
  categoryName: string;
  name: string;
  slug: string;
  description: string | null;
  unit: string;
  price: number | null;
  minimumOrderKg: number;
  imageUrl: string | null;
  isRetail: boolean;
  isB2b: boolean;
  isActive: boolean;
  stockQuantity: number;
  prices: ProductPrice[];
};

export type QuoteRequest = {
  id: number;
  companyName: string;
  contactName: string;
  phoneOrEmail: string;
  productNeed: string;
  expectedQuantityKg: number | null;
  note: string | null;
  status: "NEW" | "CONTACTED" | "QUOTED" | "ACCEPTED" | "REJECTED" | "CONVERTED" | "CLOSED" | "CANCELLED";
  subtotal: number;
  discountAmount: number;
  totalAmount: number;
  validUntil: string | null;
  salesNote: string | null;
  customerRespondedAt: string | null;
  convertedAt: string | null;
  items: Array<{ id: number; productId: number | null; description: string; quantity: number; unit: string; unitPrice: number; lineTotal: number; product: { id: number; name: string; unit: string } | null }>;
  contract: { id: number; contractCode: string; status: string } | null;
  order: { id: number; orderCode: string; status: string } | null;
  createdAt: string;
};

export type ContactMessage = {
  id: number;
  fullName: string;
  email: string | null;
  phone: string | null;
  subject: string | null;
  message: string;
  isRead: boolean;
  createdAt: string;
};

export type HealthStatus = {
  status: string;
  database: string;
  timestamp: string;
};

export type AdminOrder = {
  id: number;
  orderCode: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string | null;
  subtotal: number;
  shippingFee: number;
  discountAmount: number;
  totalAmount: number;
  note: string | null;
  cancelReason: string | null;
  refundAmount: number | null;
  status: "PENDING" | "CONFIRMED" | "PACKING" | "SHIPPING" | "COMPLETED" | "CANCELLED";
  createdAt: string;
  updatedAt: string;
  items: Array<{
    id: number;
    productId: number;
    productName: string;
    unit: string;
    quantity: number;
    unitPrice: number;
    lineTotal: number;
  }>;
  payments: Array<{
    id: number;
    method: "COD" | "BANK_TRANSFER" | "SEPAY" | "MOMO" | "VNPAY" | "ZALOPAY";
    status: "PENDING" | "PAID" | "FAILED" | "REFUNDED";
    amount: number;
    transactionCode: string | null;
    paidAt: string | null;
  }>;
  shipment: {
    id: number;
    carrier: string | null;
    trackingCode: string | null;
    status: "WAITING" | "PACKED" | "SHIPPED" | "DELIVERED" | "RETURNED";
    note: string | null;
  } | null;
};

export type AdminReturnRequest = {
  id: number;
  type: "RETURN" | "EXCHANGE" | "REFUND";
  reason: string;
  status: "REQUESTED" | "REVIEWING" | "APPROVED" | "REJECTED" | "COMPLETED" | "CANCELLED";
  resolutionNote: string | null;
  createdAt: string;
  user: { id: number; fullName: string; email: string; phone: string | null };
  order: { id: number; orderCode: string; totalAmount: number; status: string };
};

export type AdminReview = {
  id: number;
  rating: number;
  content: string | null;
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: string;
  user: { id: number; fullName: string };
  product: { id: number; name: string };
  order: { id: number; orderCode: string; status: string } | null;
};

export type AdminInventory = {
  productId: number;
  productName: string;
  categoryName: string;
  quantity: number;
  minQuantity: number;
  warehouse: string;
  unit: "kg";
  isLowStock: boolean;
  updatedAt: string;
};

export type StockMovement = {
  id: number;
  productId: number;
  productName: string;
  type: "IMPORT" | "EXPORT" | "ADJUSTMENT" | "RETURN";
  quantity: number;
  warehouse: string;
  balanceAfter: number | null;
  reason: string | null;
  reference: string | null;
  createdAt: string;
};

export type RetailCustomer = {
  id: number;
  fullName: string;
  email: string;
  phone: string | null;
  isActive: boolean;
  createdAt: string;
  orderCount: number;
  reviewCount: number;
  loyalty: {
    tier: string;
    points: number;
    totalSpent: number;
    orderCount: number;
  } | null;
};

export type BusinessCustomer = {
  id: number;
  companyName: string;
  taxCode: string | null;
  contactName: string;
  phone: string;
  email: string | null;
  address: string | null;
  note: string | null;
  createdAt: string;
  quoteRequestCount: number;
  contractCount: number;
  invoiceCount: number;
  debtCount: number;
};

export type B2BContract = {
  id: number; contractCode: string; title: string; totalValue: number | null; depositPercent: number;
  status: "DRAFT" | "ACTIVE" | "COMPLETED" | "CANCELLED"; note: string | null; createdAt: string;
  businessCustomer: { id: number; companyName: string; contactName: string };
};
export type B2BInvoice = {
  id: number; invoiceCode: string; amount: number; paidAmount: number; dueDate: string | null;
  status: "UNPAID" | "PARTIAL" | "PAID" | "OVERDUE" | "CANCELLED"; note: string | null; createdAt: string;
  businessCustomer: { id: number; companyName: string }; contract: { id: number; contractCode: string } | null;
  debts: Array<{ id: number; debtCode: string; remainingAmount: number; status: string }>;
};
export type B2BDebt = {
  id: number; debtCode: string; originalAmount: number; remainingAmount: number; dueDate: string | null;
  status: "OPEN" | "PARTIAL" | "CLEARED" | "OVERDUE"; note: string | null; createdAt: string;
  businessCustomer: { id: number; companyName: string }; invoice: { id: number; invoiceCode: string; amount: number; paidAmount: number } | null;
  payments: Array<{ id: number; amount: number; transactionCode: string | null; paidAt: string; note: string | null }>;
};
export type B2BOverview = { contracts: B2BContract[]; invoices: B2BInvoice[]; debts: B2BDebt[] };

export type ReportOverview = {
  productCount: number;
  categoryCount: number;
  orderCount: number;
  pendingOrderCount: number;
  completedOrderCount: number;
  quoteCount: number;
  unreadContactCount: number;
  retailCustomerCount: number;
  businessCustomerCount: number;
  revenueLast30Days: number;
  lowStockItems: Array<{
    id: number;
    productName: string;
    quantity: number;
    minQuantity: number;
    warehouse: string;
  }>;
  recentOrders: Array<{
    id: number;
    orderCode: string;
    customerName: string;
    status: AdminOrder["status"];
    totalAmount: number;
    createdAt: string;
  }>;
  topProducts: Array<{
    productId: number;
    productName: string;
    quantity: number;
    revenue: number;
  }>;
};

export type CategoryPayload = {
  name: string;
  slug?: string;
  description?: string;
  isActive?: boolean;
};

export type ProductPayload = {
  categoryId: number;
  name: string;
  slug?: string;
  description?: string;
  unit?: string;
  price?: number;
  minimumOrderKg?: number;
  imageUrl?: string;
  isRetail?: boolean;
  isB2b?: boolean;
  isActive?: boolean;
};

export type ProductPricePayload = {
  priceType: ProductPrice["priceType"];
  minQuantity: number;
  price: number;
  startAt?: string;
  endAt?: string;
  isActive?: boolean;
};

export type RegisterPayload = {
  fullName: string;
  email: string;
  password: string;
  phone?: string;
};

type LoginResponse = {
  user: AdminUser;
  token: string;
};

async function request<T>(path: string, options: RequestInit = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    const firstIssue = Array.isArray(body?.errors) ? body.errors[0] : null;
    const issuePath = Array.isArray(firstIssue?.path) && firstIssue.path.length ? `${firstIssue.path.join(".")}: ` : "";
    const issueMessage = firstIssue?.message ? `${issuePath}${firstIssue.message}` : "";
    throw new Error(issueMessage || body?.message || `API lỗi ${response.status}`);
  }

  if (response.status === 204) {
    return null as T;
  }

  return (await response.json()) as T;
}

function authHeaders(token: string) {
  return {
    Authorization: `Bearer ${token}`,
  };
}

function buildQuery(params: Record<string, string | number | boolean | undefined>) {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== "") {
      query.set(key, String(value));
    }
  });

  const value = query.toString();
  return value ? `?${value}` : "";
}

export const adminAuth = {
  getToken() {
    return localStorage.getItem(TOKEN_KEY);
  },

  getUser() {
    const rawUser = localStorage.getItem(USER_KEY);

    if (!rawUser) return null;

    try {
      return JSON.parse(rawUser) as AdminUser;
    } catch {
      localStorage.removeItem(USER_KEY);
      return null;
    }
  },

  setSession(token: string, user: AdminUser) {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },

  clearSession() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },
};

export const adminApi = {
  async uploadProductImage(token: string, image: File) {
    const formData = new FormData();
    formData.append("image", image);
    const response = await fetch(`${API_BASE_URL}/uploads/products`, {
      method: "POST",
      headers: authHeaders(token),
      body: formData,
    });
    if (!response.ok) {
      const body = await response.json().catch(() => null);
      throw new Error(body?.message || `Không thể tải ảnh lên (HTTP ${response.status}).`);
    }
    return (await response.json()) as { url: string; publicId: string };
  },

  login(email: string, password: string) {
    return request<LoginResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  },

  googleLogin(credential: string) {
    return request<LoginResponse>("/auth/google", {
      method: "POST",
      body: JSON.stringify({ credential }),
    });
  },

  register(payload: RegisterPayload) {
    return request<LoginResponse>("/auth/register", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  forgotPassword(email: string) {
    return request<{ message: string }>("/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
  },

  resetPassword(payload: { token: string; newPassword: string; confirmPassword: string }) {
    return request<{ message: string }>("/auth/reset-password", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  health() {
    return request<HealthStatus>("/health");
  },

  categories(params: { keyword?: string; includeInactive?: boolean } = {}) {
    return request<Category[]>(`/categories${buildQuery(params)}`);
  },

  createCategory(token: string, payload: CategoryPayload) {
    return request<Category>("/categories", {
      method: "POST",
      headers: authHeaders(token),
      body: JSON.stringify(payload),
    });
  },

  updateCategory(token: string, id: number, payload: Partial<CategoryPayload>) {
    return request<Category>(`/categories/${id}`, {
      method: "PATCH",
      headers: authHeaders(token),
      body: JSON.stringify(payload),
    });
  },

  deleteCategory(token: string, id: number) {
    return request<void>(`/categories/${id}`, {
      method: "DELETE",
      headers: authHeaders(token),
    });
  },

  products(params: { keyword?: string; categorySlug?: string; isRetail?: boolean; isB2b?: boolean } = {}) {
    return request<Product[]>(`/products${buildQuery(params)}`);
  },

  adminProducts(token: string, params: { keyword?: string; categorySlug?: string; isRetail?: boolean; isB2b?: boolean } = {}) {
    return request<Product[]>(`/products/admin/list${buildQuery(params)}`, { headers: authHeaders(token) });
  },

  createProduct(token: string, payload: ProductPayload) {
    return request<Product>("/products", {
      method: "POST",
      headers: authHeaders(token),
      body: JSON.stringify(payload),
    });
  },

  updateProduct(token: string, id: number, payload: Partial<ProductPayload>) {
    return request<Product>(`/products/${id}`, {
      method: "PATCH",
      headers: authHeaders(token),
      body: JSON.stringify(payload),
    });
  },

  deleteProduct(token: string, id: number) {
    return request<void>(`/products/${id}`, {
      method: "DELETE",
      headers: authHeaders(token),
    });
  },

  addProductPrice(token: string, id: number, payload: ProductPricePayload) {
    return request<ProductPrice>(`/products/${id}/prices`, {
      method: "POST",
      headers: authHeaders(token),
      body: JSON.stringify(payload),
    });
  },

  quoteRequests(token: string) {
    return request<QuoteRequest[]>("/quote-requests", {
      headers: authHeaders(token),
    });
  },

  quoteRequest(token: string, id: number) {
    return request<QuoteRequest>(`/quote-requests/${id}`, {
      headers: authHeaders(token),
    });
  },

  updateQuoteStatus(token: string, id: number, status: QuoteRequest["status"]) {
    return request<QuoteRequest>(`/quote-requests/${id}/status`, {
      method: "PATCH",
      headers: authHeaders(token),
      body: JSON.stringify({ status }),
    });
  },

  createQuotation(token: string, id: number, payload: { items: Array<{ productId?: number; description: string; quantity: number; unit: string; unitPrice: number }>; discountAmount: number; validUntil: string; salesNote?: string }) {
    return request<QuoteRequest>(`/quote-requests/${id}/quotation`, { method: "PUT", headers: authHeaders(token), body: JSON.stringify(payload) });
  },

  convertQuotation(token: string, id: number, target: "CONTRACT" | "ORDER") {
    return request<{ target: string; id: number; code: string }>(`/quote-requests/${id}/convert`, { method: "POST", headers: authHeaders(token), body: JSON.stringify({ target }) });
  },

  contactMessages(token: string) {
    return request<ContactMessage[]>("/contact-messages", {
      headers: authHeaders(token),
    });
  },

  updateContactReadStatus(token: string, id: number, isRead: boolean) {
    return request<ContactMessage>(`/contact-messages/${id}/read-status`, {
      method: "PATCH",
      headers: authHeaders(token),
      body: JSON.stringify({ isRead }),
    });
  },

  deleteContactMessage(token: string, id: number) {
    return request<void>(`/contact-messages/${id}`, {
      method: "DELETE",
      headers: authHeaders(token),
    });
  },

  orders(token: string, params: { keyword?: string; status?: AdminOrder["status"] } = {}) {
    return request<AdminOrder[]>(`/orders${buildQuery(params)}`, {
      headers: authHeaders(token),
    });
  },

  order(token: string, id: number) {
    return request<AdminOrder>(`/orders/${id}`, {
      headers: authHeaders(token),
    });
  },

  updateOrderStatus(token: string, id: number, payload: { status: AdminOrder["status"]; cancelReason?: string; refundAmount?: number }) {
    return request<AdminOrder>(`/orders/${id}/status`, {
      method: "PATCH",
      headers: authHeaders(token),
      body: JSON.stringify(payload),
    });
  },

  updatePaymentStatus(token: string, id: number, payload: { status: AdminOrder["payments"][number]["status"]; transactionCode?: string }) {
    return request<AdminOrder["payments"][number]>(`/orders/payments/${id}/status`, {
      method: "PATCH",
      headers: authHeaders(token),
      body: JSON.stringify(payload),
    });
  },

  upsertShipment(token: string, id: number, payload: { carrier?: string; trackingCode?: string; status?: NonNullable<AdminOrder["shipment"]>["status"]; note?: string }) {
    return request<NonNullable<AdminOrder["shipment"]>>(`/orders/${id}/shipment`, {
      method: "PATCH",
      headers: authHeaders(token),
      body: JSON.stringify(payload),
    });
  },

  inventories(token: string, params: { keyword?: string; lowStock?: boolean } = {}) {
    return request<AdminInventory[]>(`/inventories${buildQuery(params)}`, {
      headers: authHeaders(token),
    });
  },

  updateInventory(token: string, productId: number, payload: Pick<AdminInventory, "minQuantity">) {
    return request<AdminInventory>(`/inventories/${productId}/threshold`, {
      method: "PATCH",
      headers: authHeaders(token),
      body: JSON.stringify(payload),
    });
  },

  createStockMovement(token: string, payload: { productId: number; type: "IMPORT" | "EXPORT" | "ADJUSTMENT"; quantity: number; reason: string; reference?: string }) {
    return request<{ inventory: AdminInventory }>("/inventories/movements", {
      method: "POST",
      headers: authHeaders(token),
      body: JSON.stringify(payload),
    });
  },

  stockMovements(token: string, params: { productId?: number; type?: StockMovement["type"] } = {}) {
    return request<StockMovement[]>(`/inventories/movements${buildQuery(params)}`, { headers: authHeaders(token) });
  },

  retailCustomers(token: string, params: { keyword?: string } = {}) {
    return request<RetailCustomer[]>(`/customers/retail${buildQuery(params)}`, {
      headers: authHeaders(token),
    });
  },

  updateRetailCustomer(token: string, id: number, payload: Partial<Pick<RetailCustomer, "fullName" | "phone" | "isActive">>) {
    return request<RetailCustomer>(`/customers/retail/${id}`, {
      method: "PATCH",
      headers: authHeaders(token),
      body: JSON.stringify(payload),
    });
  },

  businessCustomers(token: string, params: { keyword?: string } = {}) {
    return request<BusinessCustomer[]>(`/customers/business${buildQuery(params)}`, {
      headers: authHeaders(token),
    });
  },

  createBusinessCustomer(token: string, payload: Pick<BusinessCustomer, "companyName" | "contactName" | "phone"> & Partial<Pick<BusinessCustomer, "taxCode" | "email" | "address" | "note">>) {
    return request<BusinessCustomer>("/customers/business", {
      method: "POST",
      headers: authHeaders(token),
      body: JSON.stringify(payload),
    });
  },

  updateBusinessCustomer(token: string, id: number, payload: Partial<Pick<BusinessCustomer, "companyName" | "taxCode" | "contactName" | "phone" | "email" | "address" | "note">>) {
    return request<BusinessCustomer>(`/customers/business/${id}`, {
      method: "PATCH",
      headers: authHeaders(token),
      body: JSON.stringify(payload),
    });
  },

  reportOverview(token: string) {
    return request<ReportOverview>("/reports/overview", {
      headers: authHeaders(token),
    });
  },
  b2bOverview(token: string) { return request<B2BOverview>("/b2b", { headers: authHeaders(token) }); },
  updateB2BContract(token: string, id: number, payload: { status: B2BContract["status"]; note?: string }) { return request<B2BContract>(`/b2b/contracts/${id}`, { method: "PATCH", headers: authHeaders(token), body: JSON.stringify(payload) }); },
  createB2BInvoice(token: string, payload: { businessCustomerId: number; contractId?: number; amount: number; dueDate?: string; note?: string }) { return request<B2BInvoice>("/b2b/invoices", { method: "POST", headers: authHeaders(token), body: JSON.stringify(payload) }); },
  recordDebtPayment(token: string, debtId: number, payload: { amount: number; transactionCode?: string; paidAt?: string; note?: string }) { return request<B2BDebt>(`/b2b/debts/${debtId}/payments`, { method: "POST", headers: authHeaders(token), body: JSON.stringify(payload) }); },

  returnRequests(token: string) { return request<AdminReturnRequest[]>("/orders/return-requests/all", { headers: authHeaders(token) }); },
  updateReturnRequest(token: string, id: number, payload: { status: AdminReturnRequest["status"]; resolutionNote?: string }) { return request<AdminReturnRequest>(`/orders/return-requests/${id}`, { method: "PATCH", headers: authHeaders(token), body: JSON.stringify(payload) }); },
  reviews(token: string) { return request<AdminReview[]>("/reviews", { headers: authHeaders(token) }); },
  updateReviewStatus(token: string, id: number, status: AdminReview["status"]) { return request<AdminReview>(`/reviews/${id}/status`, { method: "PATCH", headers: authHeaders(token), body: JSON.stringify({ status }) }); },
};

export function formatCurrency(value: number | null | undefined) {
  if (value == null) return "Chưa đặt";
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(value);
}

export function formatDate(value: string) {
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}
