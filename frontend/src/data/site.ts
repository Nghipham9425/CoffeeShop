import {
  ClipboardCheck,
  Factory,
  FileText,
  PackageCheck,
  ShieldCheck,
  Truck,
} from "lucide-react";

export const products = [
  {
    id: "P001",
    name: "Robusta rang mộc pha phin",
    category: "Cà phê rang xay",
    desc: "Vị đậm, hậu vị cacao, phù hợp quán phin truyền thống và đại lý.",
    price: "128.000đ/kg",
    moq: "50kg",
    tone: "from-[#5a2f21] to-[#1f130e]",
  },
  {
    id: "P002",
    name: "Espresso Blend Arabica Robusta",
    category: "Cà phê hạt",
    desc: "Blend ổn định crema, dùng tốt cho máy pha ở quán và nhà hàng.",
    price: "185.000đ/kg",
    moq: "50kg",
    tone: "from-[#2f5b43] to-[#1e2218]",
  },
  {
    id: "P003",
    name: "Arabica Cầu Đất premium",
    category: "Cà phê hạt",
    desc: "Hương thơm sáng, độ chua nhẹ, phù hợp dòng sản phẩm cao cấp.",
    price: "168.000đ/kg",
    moq: "30kg",
    tone: "from-[#8a6a3f] to-[#2b2117]",
  },
  {
    id: "P004",
    name: "OEM / Private label",
    category: "Gia công",
    desc: "Gia công blend, profile rang, bao bì và quy cách theo thương hiệu riêng.",
    price: "Cần báo giá",
    moq: "100kg",
    tone: "from-[#70402d] to-[#222018]",
  },
];

export const services = [
  {
    title: "Cung ứng cà phê sỉ",
    desc: "Cung cấp sản phẩm ổn định cho quán cà phê, đại lý, khách sạn, văn phòng và nhà phân phối.",
    icon: PackageCheck,
  },
  {
    title: "Báo giá B2B",
    desc: "Tiếp nhận yêu cầu mua số lượng lớn, phản hồi giá theo sản lượng, khu vực giao và điều khoản.",
    icon: FileText,
  },
  {
    title: "OEM / Private label",
    desc: "Phát triển sản phẩm thương hiệu riêng từ blend, profile rang đến bao bì đóng gói.",
    icon: Factory,
  },
  {
    title: "Giao hàng định kỳ",
    desc: "Hỗ trợ đơn hàng lặp lại, hợp đồng cung ứng và lịch giao hàng theo tuần hoặc tháng.",
    icon: Truck,
  },
];

export const processSteps = [
  ["Gửi nhu cầu", "Khách chọn sản phẩm hoặc gửi form báo giá."],
  ["Tư vấn & báo giá", "Sales phản hồi giá sỉ, MOQ, mẫu thử và thời gian giao."],
  ["Xác nhận đơn", "Hai bên chốt sản phẩm, số lượng, thanh toán và giao hàng."],
  ["Sản xuất & giao", "Nhà máy chuẩn bị, kiểm tra chất lượng, đóng gói và giao hàng."],
];

export const adminModules = [
  ["Đơn hàng mới", "18", ClipboardCheck],
  ["Báo giá chờ xử lý", "7", FileText],
  ["Công nợ quá hạn", "42,1tr", ShieldCheck],
  ["Tồn kho thấp", "5 SKU", PackageCheck],
];
