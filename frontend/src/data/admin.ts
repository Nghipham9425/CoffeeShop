import {
  BadgeDollarSign,
  BarChart3,
  Bot,
  Boxes,
  ClipboardList,
  FileText,
  Gift,
  Landmark,
  LayoutDashboard,
  MessageSquareMore,
  Package,
  RotateCcw,
  ShieldCheck,
  Tags,
  Users,
  type LucideIcon,
} from "lucide-react";
import type { StaffRole } from "./adminPermissions";

export const adminPalette = {
  cream: "#E8D3C7",
  tan: "#C7A792",
  clay: "#AA7864",
  brown: "#553B2F",
};

export type AdminNavItem = {
  label: string;
  to: string;
  icon: LucideIcon;
  roles: StaffRole[];
  end?: boolean;
};

export const adminNavItems: AdminNavItem[] = [
  { label: "Tổng quan", to: "/admin", icon: LayoutDashboard, roles: ["ADMIN"], end: true },
  { label: "Sản phẩm", to: "/admin/san-pham", icon: Package, roles: ["ADMIN", "SALES"] },
  { label: "Danh mục", to: "/admin/danh-muc", icon: Tags, roles: ["ADMIN", "SALES"] },
  { label: "Đơn hàng", to: "/admin/don-hang", icon: ClipboardList, roles: ["ADMIN", "SALES", "ACCOUNTANT"] },
  { label: "Đổi trả", to: "/admin/doi-tra", icon: RotateCcw, roles: ["ADMIN", "SALES"] },
  { label: "Đánh giá", to: "/admin/danh-gia", icon: MessageSquareMore, roles: ["ADMIN", "SALES"] },
  { label: "Báo giá B2B", to: "/admin/bao-gia", icon: FileText, roles: ["ADMIN", "SALES"] },
  { label: "Hợp đồng và công nợ", to: "/admin/b2b/tai-chinh", icon: Landmark, roles: ["ADMIN", "SALES", "ACCOUNTANT"] },
  { label: "Khách hàng", to: "/admin/khach-hang", icon: Users, roles: ["ADMIN", "SALES"] },
  { label: "Tồn kho", to: "/admin/kho", icon: Boxes, roles: ["ADMIN", "WAREHOUSE"] },
  { label: "Báo cáo", to: "/admin/bao-cao", icon: BarChart3, roles: ["ADMIN", "ACCOUNTANT"] },
  { label: "Giá sản phẩm", to: "/admin/chinh-sach-gia", icon: BadgeDollarSign, roles: ["ADMIN", "SALES"] },
  { label: "Khuyến mãi", to: "/admin/promotions", icon: Gift, roles: ["ADMIN", "SALES"] },
  { label: "Trợ lý AI", to: "/admin/chatbot", icon: Bot, roles: ["ADMIN", "SALES"] },
  { label: "Người dùng", to: "/admin/nguoi-dung", icon: ShieldCheck, roles: ["ADMIN"] },
];

export const adminFallbackPages = {
  orders: { title: "Quản lý đơn hàng", desc: "Theo dõi và xử lý đơn hàng.", tasks: ["Xem đơn hàng", "Cập nhật trạng thái"] },
  customers: { title: "Khách hàng", desc: "Quản lý khách lẻ và doanh nghiệp.", tasks: ["Khách lẻ", "Khách doanh nghiệp"] },
  inventory: { title: "Tồn kho", desc: "Theo dõi tồn kho và lịch sử nhập xuất.", tasks: ["Tồn kho", "Nhập xuất kho"] },
  reports: { title: "Báo cáo", desc: "Tổng hợp số liệu vận hành.", tasks: ["Doanh thu", "Sản phẩm bán chạy"] },
};
