import { Award, BadgeCheck, Building2, Factory, Gavel, Heart, PackageCheck, Recycle, Scale, Settings, ShieldCheck, Sprout } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type IconText = {
  icon: LucideIcon;
  title: string;
  text: string;
};

export type StatItem = {
  icon: LucideIcon;
  value: string;
  label: string;
};

export type ImageItem = {
  title: string;
  text?: string;
  meta?: string;
  imageClass: string;
};

export const strengths: IconText[] = [
  {
    icon: Gavel,
    title: "Pháp lý nguồn gốc",
    text: "Nguyên liệu cà phê nhân có hồ sơ rõ ràng, kiểm tra chất lượng trước khi đưa vào rang.",
  },
  {
    icon: Sprout,
    title: "Môi trường và con người",
    text: "Ưu tiên quy trình sạch, hạn chế lãng phí và tạo sản phẩm an toàn cho người tiêu dùng.",
  },
  {
    icon: Building2,
    title: "Quy trình sản xuất",
    text: "Nhà máy vận hành theo quy trình kiểm soát từng mẻ rang, đóng gói và lưu kho.",
  },
  {
    icon: Heart,
    title: "Thấu hiểu",
    text: "Lắng nghe mục tiêu kinh doanh để phát triển profile rang, blend và bao bì phù hợp.",
  },
];

export const stats: StatItem[] = [
  { value: "1980", label: "Truyền thống lâu đời", icon: Factory },
  { value: "100%", label: "Sử dụng nguyên liệu sạch", icon: BadgeCheck },
  { value: "100", label: "Sản lượng tấn / tháng", icon: PackageCheck },
  { value: "500+", label: "Khách hàng trong nước & quốc tế", icon: Recycle },
];

export const categories: ImageItem[] = [
  { title: "Gia công cà phê hạt rang", imageClass: "hm-service-beans" },
  { title: "Gia công cà phê hòa tan", imageClass: "hm-service-powder" },
  { title: "Gia công cà phê túi lọc", imageClass: "hm-service-drip" },
  { title: "Gia công cà phê viên nén Capsule", imageClass: "hm-service-capsule" },
];

export const cleanFeatures: IconText[] = [
  {
    icon: Scale,
    title: "Giá tốt cho đơn sỉ",
    text: "Quy trình trực tiếp từ chọn hạt, rang, phối trộn đến đóng gói giúp tối ưu chi phí cho khách hàng B2B.",
  },
  {
    icon: Award,
    title: "Chất lượng ổn định",
    text: "Mỗi mẻ rang được kiểm tra màu rang, độ ẩm, hương vị và lưu mẫu để bảo đảm đồng nhất khi đặt lại.",
  },
  {
    icon: Settings,
    title: "Rang theo yêu cầu",
    text: "Tùy chỉnh profile rang đậm, vừa hoặc nhạt cho pha phin, pha máy, cold brew và xuất khẩu.",
  },
  {
    icon: PackageCheck,
    title: "Nhận đơn từ 5kg",
    text: "Hỗ trợ đơn thử nhỏ để test thị trường, sau đó mở rộng lên sản lượng lớn theo hợp đồng.",
  },
  {
    icon: ShieldCheck,
    title: "Công nghệ kiểm soát",
    text: "Máy rang, máy nghiền và đóng gói hỗ trợ theo dõi từng công đoạn, giảm lỗi trong quá trình sản xuất.",
  },
  {
    icon: Factory,
    title: "Nhà máy chuyên nghiệp",
    text: "Khu vực sản xuất, kho, đóng gói và QC được tổ chức rõ ràng, phù hợp mô hình nhà máy cà phê.",
  },
];

export const team: ImageItem[] = [
  {
    title: "Tâm huyết với cà phê",
    text: "Đội ngũ theo sát chất lượng nguyên liệu và từng mẻ rang để giữ đúng hương vị đã cam kết.",
    imageClass: "hm-team-harvest",
  },
  {
    title: "Trình độ chuyên môn cao",
    text: "Nhân sự rang xay, QC và R&D phối hợp để phát triển sản phẩm phù hợp từng mô hình kinh doanh.",
    imageClass: "hm-team-roaster",
  },
  {
    title: "Sáng tạo",
    text: "Không ngừng thử nghiệm blend, bao bì và quy cách mới để hỗ trợ thương hiệu riêng của khách hàng.",
    imageClass: "hm-team-machine",
  },
];

export const posts: ImageItem[] = [
  {
    title: "Gia công cà phê muối cho quán và chuỗi F&B",
    meta: "Tháng Bảy 27, 2026",
    imageClass: "hm-post-1",
  },
  {
    title: "Bảo quản cà phê rang xay luôn giữ hương",
    meta: "Tháng Bảy 25, 2026",
    imageClass: "hm-post-2",
  },
  {
    title: "Cà phê rang xay và cà phê hòa tan khác nhau thế nào?",
    meta: "Tháng Bảy 20, 2026",
    imageClass: "hm-post-3",
  },
  {
    title: "Cách lựa chọn hạt cà phê để cho ra blend ổn định",
    meta: "Tháng Bảy 18, 2026",
    imageClass: "hm-post-4",
  },
  {
    title: "Những vấn đề cơ bản về quy trình rang",
    meta: "Tháng Sáu 27, 2026",
    imageClass: "hm-post-5",
  },
];
