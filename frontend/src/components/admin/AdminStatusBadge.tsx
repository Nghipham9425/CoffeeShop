import { Badge } from "../ui/badge";
import { cn } from "../../lib/utils";

const toneByStatus: Record<string, string> = {
  NEW: "bg-[#E8D3C7] text-[#553B2F]",
  CONTACTED: "bg-[#C7A792] text-[#2c1a13]",
  QUOTED: "bg-[#553B2F] text-white",
  CLOSED: "bg-emerald-100 text-emerald-800",
  CANCELLED: "bg-red-100 text-red-800",
  READ: "bg-emerald-100 text-emerald-800",
  UNREAD: "bg-[#E8D3C7] text-[#553B2F]",
};

const labelByStatus: Record<string, string> = {
  NEW: "Mới",
  CONTACTED: "Đã liên hệ",
  QUOTED: "Đã báo giá",
  CLOSED: "Hoàn tất",
  CANCELLED: "Đã hủy",
  READ: "Đã đọc",
  UNREAD: "Chưa đọc",
};

export function AdminStatusBadge({ status, className }: { status: string; className?: string }) {
  return (
    <Badge className={cn("border-0 normal-case tracking-normal", toneByStatus[status] ?? "bg-stone-100 text-stone-800", className)}>
      {labelByStatus[status] ?? status}
    </Badge>
  );
}
