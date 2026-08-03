import { adminAuth, type AdminUser } from "./adminApi";

const API_BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:4000/api";

export type ProfileAddress = {
  id: number;
  receiverName: string;
  phone: string;
  province: string;
  district: string;
  ward: string;
  detail: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
};

export type CustomerProfile = AdminUser & {
  createdAt: string;
  orderCount: number;
  addresses: ProfileAddress[];
  loyaltyProfile: {
    tier: "REGULAR" | "SILVER" | "GOLD" | "VIP";
    points: number;
    totalSpent: number;
    orderCount: number;
    lastPurchaseAt: string | null;
  } | null;
};

export type UserNotification = {
  id: number;
  type: "ORDER_CREATED" | "ORDER_STATUS_CHANGED" | "PAYMENT_UPDATED" | "GENERAL";
  title: string;
  content: string;
  link: string | null;
  isRead: boolean;
  createdAt: string;
};

export type AddressPayload = Pick<ProfileAddress, "receiverName" | "phone" | "province" | "district" | "ward" | "detail"> & { isDefault?: boolean };

export type CustomerOrderHistory = {
  id: number;
  orderCode: string;
  status: "PENDING" | "CONFIRMED" | "PACKING" | "SHIPPING" | "COMPLETED" | "CANCELLED";
  totalAmount: number;
  createdAt: string;
  items: Array<{
    id: number;
    productId: number;
    productName: string;
    unit: string;
    quantity: number;
    review: { id: number; rating: number; status: "PENDING" | "APPROVED" | "REJECTED" } | null;
  }>;
  payment: { method: string; status: string; paidAt: string | null } | null;
  shipment: { status: string; carrier: string | null; trackingCode: string | null } | null;
  returnRequest: {
    id: number;
    type: "RETURN" | "EXCHANGE" | "REFUND";
    reason: string;
    status: "REQUESTED" | "REVIEWING" | "APPROVED" | "REJECTED" | "COMPLETED" | "CANCELLED";
    resolutionNote: string | null;
    createdAt: string;
  } | null;
};

export type CustomerB2BQuote = {
  id: number;
  companyName: string;
  productNeed: string;
  expectedQuantityKg: number | null;
  status: "NEW" | "CONTACTED" | "QUOTED" | "ACCEPTED" | "REJECTED" | "CONVERTED" | "CLOSED" | "CANCELLED";
  subtotal: number;
  discountAmount: number;
  totalAmount: number;
  validUntil: string | null;
  salesNote: string | null;
  createdAt: string;
  items: Array<{ id: number; description: string; quantity: number; unit: string; unitPrice: number; lineTotal: number }>;
  contract: { id: number; contractCode: string; status: string } | null;
  order: { id: number; orderCode: string; status: string } | null;
};

export type CustomerB2BOverview = {
  id: number;
  companyName: string;
  taxCode: string | null;
  contactName: string;
  phone: string;
  email: string | null;
  address: string | null;
  quoteRequests: CustomerB2BQuote[];
  contracts: Array<{ id: number; contractCode: string; title: string; totalValue: number | null; depositPercent: number; status: "DRAFT" | "ACTIVE" | "COMPLETED" | "CANCELLED"; note: string | null; createdAt: string }>;
  invoices: Array<{ id: number; invoiceCode: string; amount: number; paidAmount: number; dueDate: string | null; status: "UNPAID" | "PARTIAL" | "PAID" | "OVERDUE" | "CANCELLED"; note: string | null; createdAt: string; contract: { id: number; contractCode: string } | null }>;
  debts: Array<{ id: number; debtCode: string; originalAmount: number; remainingAmount: number; dueDate: string | null; status: "OPEN" | "PARTIAL" | "CLEARED" | "OVERDUE"; note: string | null; createdAt: string; invoice: { id: number; invoiceCode: string; amount: number; paidAmount: number } | null; payments: Array<{ id: number; amount: number; transactionCode: string | null; paidAt: string; note: string | null }> }>;
} | null;

async function request<T>(path: string, options: RequestInit = {}) {
  const token = adminAuth.getToken();
  if (!token) throw new Error("Vui lòng đăng nhập để tiếp tục.");
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}`, ...options.headers },
  });
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    const firstIssue = Array.isArray(body?.errors) ? body.errors[0] : null;
    throw new Error(firstIssue?.message || body?.message || "Không thể xử lý yêu cầu.");
  }
  if (response.status === 204) return null as T;
  return (await response.json()) as T;
}

export const profileApi = {
  me: () => request<CustomerProfile>("/auth/me"),
  notifications: () => request<{ unreadCount: number; items: UserNotification[] }>("/notifications/me"),
  markNotificationRead: (id: number) => request<void>(`/notifications/${id}/read`, { method: "PATCH" }),
  markAllNotificationsRead: () => request<void>("/notifications/read-all", { method: "PATCH" }),
  updateProfile: (payload: { fullName?: string; phone?: string | null }) => request<AdminUser>("/auth/me", { method: "PATCH", body: JSON.stringify(payload) }),
  changePassword: (payload: { currentPassword: string; newPassword: string; confirmPassword: string }) => request<void>("/auth/me/password", { method: "PATCH", body: JSON.stringify(payload) }),
  createAddress: (payload: AddressPayload) => request<ProfileAddress>("/auth/me/addresses", { method: "POST", body: JSON.stringify(payload) }),
  updateAddress: (id: number, payload: Partial<AddressPayload>) => request<ProfileAddress>(`/auth/me/addresses/${id}`, { method: "PATCH", body: JSON.stringify(payload) }),
  deleteAddress: (id: number) => request<void>(`/auth/me/addresses/${id}`, { method: "DELETE" }),
  orderHistory: () => request<CustomerOrderHistory[]>("/auth/me/orders"),
  b2bOverview: () => request<CustomerB2BOverview>("/b2b/me"),
  respondB2BQuote: (id: number, action: "ACCEPT" | "REJECT") => request<CustomerB2BQuote>(`/quote-requests/mine/${id}/respond`, { method: "POST", body: JSON.stringify({ action }) }),
  createReview: (payload: { orderId: number; productId: number; rating: number; content?: string }) =>
    request<{ id: number; rating: number; status: "PENDING" | "APPROVED" | "REJECTED" }>("/reviews", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  cancelOrder: (orderId: number, reason: string) => request<CustomerOrderHistory>(`/orders/${orderId}/cancel`, {
    method: "POST",
    body: JSON.stringify({ reason }),
  }),
  createReturnRequest: (orderId: number, payload: { type: "RETURN" | "EXCHANGE" | "REFUND"; reason: string }) =>
    request<NonNullable<CustomerOrderHistory["returnRequest"]>>(`/orders/${orderId}/return-requests`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),
};
