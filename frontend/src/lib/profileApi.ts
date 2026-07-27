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
};

export type AddressPayload = Pick<ProfileAddress, "receiverName" | "phone" | "province" | "district" | "ward" | "detail"> & { isDefault?: boolean };

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
  updateProfile: (payload: { fullName?: string; phone?: string | null }) => request<AdminUser>("/auth/me", { method: "PATCH", body: JSON.stringify(payload) }),
  changePassword: (payload: { currentPassword: string; newPassword: string; confirmPassword: string }) => request<void>("/auth/me/password", { method: "PATCH", body: JSON.stringify(payload) }),
  createAddress: (payload: AddressPayload) => request<ProfileAddress>("/auth/me/addresses", { method: "POST", body: JSON.stringify(payload) }),
  updateAddress: (id: number, payload: Partial<AddressPayload>) => request<ProfileAddress>(`/auth/me/addresses/${id}`, { method: "PATCH", body: JSON.stringify(payload) }),
  deleteAddress: (id: number) => request<void>(`/auth/me/addresses/${id}`, { method: "DELETE" }),
};
