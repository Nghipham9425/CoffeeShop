const API_BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:4000/api";

export type PublicProduct = {
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
  stockQuantity: number;
  prices: Array<{
    id: number;
    priceType: string;
    minQuantity: number;
    price: number;
    startAt: string | null;
    endAt: string | null;
    isActive: boolean;
  }>;
};

export type CheckoutPayload = {
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  address: string;
  note?: string;
  paymentMethod: "COD" | "BANK_TRANSFER" | "SEPAY" | "MOMO" | "VNPAY" | "ZALOPAY";
  shippingFee: number;
  voucherCode?: string;
  items: Array<{
    productId: number;
    quantity: number;
  }>;
};

export type CheckoutOrder = {
  id: number;
  orderCode: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string | null;
  totalAmount: number;
  status: string;
  createdAt: string;
};

export type SepayCheckoutSession = {
  checkoutUrl: string;
  fields: Record<string, string | number>;
};

export type TrackedOrder = {
  id: number;
  orderCode: string;
  status: string;
  totalAmount: number;
  createdAt: string;
  items: Array<{ id: number; productName: string; unit: string; quantity: number }>;
  payment: { method: string; status: string; paidAt: string | null } | null;
  shipment: { status: string; carrier: string | null; trackingCode: string | null; shippedAt: string | null; deliveredAt: string | null } | null;
};

export type PublicPaymentStatus = {
  orderId: number;
  orderCode: string;
  orderStatus: string;
  paymentStatus: "PENDING" | "PAID" | "FAILED" | "REFUNDED" | null;
  paymentMethod: string | null;
  paidAt: string | null;
};

export type QuoteRequestPayload = {
  companyName: string;
  contactName: string;
  phoneOrEmail: string;
  productNeed: string;
  expectedQuantityKg?: number;
  note?: string;
};

export type PublicQuotation = {
  id: number;
  companyName: string;
  contactName: string;
  productNeed: string;
  status: "NEW" | "CONTACTED" | "QUOTED" | "ACCEPTED" | "REJECTED" | "CONVERTED" | "CLOSED" | "CANCELLED";
  subtotal: number;
  discountAmount: number;
  totalAmount: number;
  validUntil: string | null;
  salesNote: string | null;
  items: Array<{ id: number; description: string; quantity: number; unit: string; unitPrice: number; lineTotal: number }>;
  contract: { id: number; contractCode: string; status: string } | null;
  order: { id: number; orderCode: string; status: string } | null;
};

export type PublicReview = {
  id: number;
  rating: number;
  content: string | null;
  createdAt: string;
  user: { id: number; fullName: string };
};

export type VoucherPreview = {
  id: number;
  code: string;
  name: string;
  discountType: "PERCENT" | "FIXED_AMOUNT";
  discountValue: number;
  discountAmount: number;
  totalAfterDiscount: number;
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
    throw new Error(firstIssue?.message || body?.message || `API lỗi ${response.status}`);
  }

  return (await response.json()) as T;
}

export const publicApi = {
  products() {
    return request<PublicProduct[]>("/products?isRetail=true");
  },

  product(id: number) {
    return request<PublicProduct>(`/products/${id}`);
  },

  productBySlug(slug: string) {
    return request<PublicProduct>(`/products/slug/${encodeURIComponent(slug)}`);
  },

  productReviews(productId: number) {
    return request<PublicReview[]>(`/reviews/products/${productId}`);
  },

  validateVoucher(code: string, subtotal: number) {
    return request<VoucherPreview>("/promotions/validate", {
      method: "POST",
      body: JSON.stringify({ code, subtotal }),
    });
  },

  checkout(payload: CheckoutPayload, token?: string | null) {
    return request<CheckoutOrder>("/orders/checkout", {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      body: JSON.stringify(payload),
    });
  },

  initializeSepay(orderId: number, orderCode: string, token?: string | null) {
    return request<SepayCheckoutSession>("/payments/sepay/checkout", {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      body: JSON.stringify({ orderId, orderCode }),
    });
  },

  paymentStatus(orderId: number, orderCode: string) {
    return request<PublicPaymentStatus>(`/orders/${orderId}/payment-status?orderCode=${encodeURIComponent(orderCode)}`);
  },

  trackOrder(code: string) {
    return request<TrackedOrder>(`/orders/track?code=${encodeURIComponent(code)}`);
  },

  createQuoteRequest(payload: QuoteRequestPayload) {
    return request<{ id: number; accessToken: string }>("/quote-requests", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  publicQuotation(id: number, token: string) {
    return request<PublicQuotation>(`/quote-requests/public/${id}?token=${encodeURIComponent(token)}`);
  },

  respondQuotation(id: number, token: string, action: "ACCEPT" | "REJECT") {
    return request<PublicQuotation>(`/quote-requests/public/${id}/respond`, { method: "POST", body: JSON.stringify({ token, action }) });
  },
};

export function formatVnd(value: number | null | undefined) {
  if (value == null) return "Liên hệ";
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(value);
}
