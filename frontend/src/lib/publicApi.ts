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
  paymentMethod: "COD" | "BANK_TRANSFER" | "MOMO" | "VNPAY" | "ZALOPAY";
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

  checkout(payload: CheckoutPayload) {
    return request<CheckoutOrder>("/orders/checkout", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
};

export function formatVnd(value: number | null | undefined) {
  if (value == null) return "Liên hệ";
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(value);
}
