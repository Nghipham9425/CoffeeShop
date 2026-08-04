import type { AdminUser } from "../lib/adminApi";

export type StaffRole = Exclude<AdminUser["role"], "CUSTOMER">;

export const staffRoleLabels: Record<StaffRole, string> = {
  ADMIN: "Quản trị viên",
  SALES: "Nhân viên kinh doanh",
  WAREHOUSE: "Nhân viên kho",
  ACCOUNTANT: "Kế toán",
};

const routePermissions: Array<{ prefix: string; roles: StaffRole[] }> = [
  { prefix: "/admin/nguoi-dung", roles: ["ADMIN"] },
  { prefix: "/admin/kho", roles: ["ADMIN", "WAREHOUSE"] },
  { prefix: "/admin/bao-gia", roles: ["ADMIN", "SALES"] },
  { prefix: "/admin/b2b", roles: ["ADMIN", "SALES", "ACCOUNTANT"] },
  { prefix: "/admin/don-hang", roles: ["ADMIN", "SALES", "ACCOUNTANT"] },
  { prefix: "/admin/doi-tra", roles: ["ADMIN", "SALES"] },
  { prefix: "/admin/danh-gia", roles: ["ADMIN", "SALES"] },
  { prefix: "/admin/san-pham", roles: ["ADMIN", "SALES"] },
  { prefix: "/admin/danh-muc", roles: ["ADMIN", "SALES"] },
  { prefix: "/admin/chinh-sach-gia", roles: ["ADMIN", "SALES"] },
  { prefix: "/admin/promotions", roles: ["ADMIN", "SALES"] },
  { prefix: "/admin/khach-hang", roles: ["ADMIN", "SALES"] },
  { prefix: "/admin/bao-cao", roles: ["ADMIN", "ACCOUNTANT"] },
  { prefix: "/admin/chatbot", roles: ["ADMIN", "SALES"] },
  { prefix: "/admin", roles: ["ADMIN"] },
];

export function canAccessAdminPath(role: StaffRole, pathname: string) {
  const permission = routePermissions.find(({ prefix }) => pathname === prefix || pathname.startsWith(`${prefix}/`));
  return permission ? permission.roles.includes(role) : false;
}

export function getDefaultAdminPath(role: StaffRole) {
  if (role === "WAREHOUSE") return "/admin/kho";
  if (role === "SALES") return "/admin/don-hang";
  if (role === "ACCOUNTANT") return "/admin/b2b/tai-chinh";
  return "/admin";
}
