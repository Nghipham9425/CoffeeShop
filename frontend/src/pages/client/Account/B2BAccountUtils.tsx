import { Building2, LoaderCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "../../../components/ui/button";
import { profileApi, type CustomerB2BOverview } from "../../../lib/profileApi";

export function useB2BOverview() {
  const [data, setData] = useState<CustomerB2BOverview>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    void (async () => {
      try { setData(await profileApi.b2bOverview()); }
      catch (cause) { setError(cause instanceof Error ? cause.message : "Không tải được dữ liệu doanh nghiệp."); }
      finally { setLoading(false); }
    })();
  }, []);

  return { data, loading, error };
}

export function B2BLoading() {
  return <div className="grid min-h-64 place-items-center"><LoaderCircle className="animate-spin text-[#7a4b32]" size={30} /></div>;
}

export function B2BEmpty({ title = "Chưa có hồ sơ doanh nghiệp", description = "Gửi yêu cầu báo giá đầu tiên để tạo hồ sơ doanh nghiệp và bắt đầu theo dõi quy trình B2B." }: { title?: string; description?: string }) {
  return <section className="rounded-2xl border border-dashed border-[#d9c3b2] bg-[#fffaf5] p-8 text-center"><span className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-[#f1dfcf] text-[#71432d]"><Building2 size={24} /></span><h2 className="mt-4 text-xl font-black text-[#3b2419]">{title}</h2><p className="mx-auto mt-2 max-w-md text-sm leading-6 text-stone-600">{description}</p><Button asChild className="mt-5 bg-[#5a3322] text-white hover:bg-[#3f2418]"><Link to="/bao-gia">Gửi yêu cầu báo giá</Link></Button></section>;
}

export function formatMoney(value: number | string | null | undefined) {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(Number(value ?? 0));
}

export function formatDate(value: string | null | undefined) {
  return value ? new Date(value).toLocaleDateString("vi-VN") : "Chưa cập nhật";
}

export const quoteStatus: Record<string, string> = { NEW: "Mới tiếp nhận", CONTACTED: "Đã liên hệ", QUOTED: "Chờ phản hồi", ACCEPTED: "Đã chấp nhận", REJECTED: "Đã từ chối", CONVERTED: "Đã chuyển xử lý", CLOSED: "Đã kết thúc", CANCELLED: "Đã hủy" };
export const contractStatus: Record<string, string> = { DRAFT: "Bản nháp", ACTIVE: "Đang hiệu lực", COMPLETED: "Hoàn thành", CANCELLED: "Đã hủy" };
export const invoiceStatus: Record<string, string> = { UNPAID: "Chưa thanh toán", PARTIAL: "Thanh toán một phần", PAID: "Đã thanh toán", OVERDUE: "Quá hạn", CANCELLED: "Đã hủy" };
export const debtStatus: Record<string, string> = { OPEN: "Chờ thanh toán", PARTIAL: "Còn dư nợ", CLEARED: "Đã tất toán", OVERDUE: "Quá hạn" };
