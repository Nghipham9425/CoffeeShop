import {
  BarChart3,
  Boxes,
  ClipboardList,
  FileText,
  Inbox,
  LayoutDashboard,
  Package,
  Tags,
  Users,
  type LucideIcon,
} from "lucide-react";

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
  end?: boolean;
};

export const adminNavItems: AdminNavItem[] = [
  { label: "Tổng quan", to: "/admin", icon: LayoutDashboard, end: true },
  { label: "Sản phẩm", to: "/admin/san-pham", icon: Package },
  { label: "Danh mục", to: "/admin/danh-muc", icon: Tags },
  { label: "Đơn hàng", to: "/admin/don-hang", icon: ClipboardList },
  { label: "Báo giá B2B", to: "/admin/bao-gia", icon: FileText },
  { label: "Khách hàng", to: "/admin/khach-hang", icon: Users },
  { label: "Tồn kho", to: "/admin/kho", icon: Boxes },
  { label: "Liên hệ", to: "/admin/lien-he", icon: Inbox },
  { label: "Báo cáo", to: "/admin/bao-cao", icon: BarChart3 },
];

export const adminFallbackPages = {
  orders: {
    title: "Quản lý đơn hàng",
    desc: "Phần xử lý đơn hàng B2C sẽ được làm tiếp: tạo đơn, xem đơn và cập nhật trạng thái.",
    tasks: ["Tạo luồng đơn hàng", "Tạo thanh toán thử nghiệm", "Cập nhật trạng thái đơn"],
  },
  customers: {
    title: "Khách hàng",
    desc: "Phần khách hàng sẽ quản lý khách lẻ, khách doanh nghiệp và phân nhóm thân thiết/VIP.",
    tasks: ["Danh sách khách lẻ", "Khách doanh nghiệp", "Phân nhóm VIP"],
  },
  inventory: {
    title: "Tồn kho",
    desc: "Phần kho sẽ phục vụ xem tồn, nhập xuất kho và cảnh báo khi sản phẩm gần hết.",
    tasks: ["Xem tồn kho", "Nhập kho", "Cảnh báo hết hàng"],
  },
  reports: {
    title: "Báo cáo",
    desc: "Báo cáo sẽ làm sau khi có đủ dữ liệu đơn hàng và dữ liệu bán hàng thật.",
    tasks: ["Doanh thu", "Sản phẩm bán chạy", "Tỉ lệ chuyển đổi báo giá"],
  },
};
