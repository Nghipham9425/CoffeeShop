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
  priceType: string;
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
  status: "NEW" | "CONTACTED" | "QUOTED" | "CLOSED" | "CANCELLED";
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
    throw new Error(body?.message ?? `API lỗi ${response.status}`);
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
  login(email: string, password: string) {
    return request<LoginResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  },

  health() {
    return request<HealthStatus>("/health");
  },

  categories() {
    return request<Category[]>("/categories");
  },

  products() {
    return request<Product[]>("/products");
  },

  quoteRequests(token: string) {
    return request<QuoteRequest[]>("/quote-requests", {
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
