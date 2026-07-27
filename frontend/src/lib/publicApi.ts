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
};

export type CheckoutPayload = {
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  address: string;
  note?: string;
  paymentMethod: "COD" | "BANK_TRANSFER" | "SEPAY" | "MOMO" | "VNPAY" | "ZALOPAY";
  shippingFee: number;
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

  checkout(payload: CheckoutPayload, token?: string | null) {
    return request<CheckoutOrder>("/orders/checkout", {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      body: JSON.stringify(payload),
    });
  },

  initializeSepay(orderId: number) {
    return request<SepayCheckoutSession>("/payments/sepay/checkout", {
      method: "POST",
      body: JSON.stringify({ orderId }),
    });
  },

  paymentStatus(orderId: number, orderCode: string) {
    return request<PublicPaymentStatus>(`/orders/${orderId}/payment-status?orderCode=${encodeURIComponent(orderCode)}`);
  },

  trackOrder(trackingCode: string) {
    return request<TrackedOrder>(`/orders/track?trackingCode=${encodeURIComponent(trackingCode)}`);
  },

  createQuoteRequest(payload: QuoteRequestPayload) {
    return request<{ id: number }>("/quote-requests", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
};

export function formatVnd(value: number | null | undefined) {
  if (value == null) return "Liên hệ";
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(value);
}
