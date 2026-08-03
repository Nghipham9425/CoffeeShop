import { ArrowLeft, ArrowRight, Building2, CalendarDays, CircleX, FileSignature, FileText, PhoneCall, UserRound } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { AdminPanel } from "../../../components/admin/AdminPanel";
import { AdminStatusBadge } from "../../../components/admin/AdminStatusBadge";
import { Button } from "../../../components/ui/button";
import { useAdminOutlet } from "../../../layouts/AdminLayout";
import { adminApi, formatCurrency, formatDate, type QuoteRequest } from "../../../lib/adminApi";
import { AdminPageShell } from "../shared/AdminPageShell";
import { ErrorState, LoadingState } from "../shared/ApiState";
import { QuotationEditor } from "./QuotationEditor";

export function QuoteDetailPage() {
  const { id } = useParams();
  const { token } = useAdminOutlet();
  const [quote, setQuote] = useState<QuoteRequest | null>(null);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [actionMessage, setActionMessage] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  useEffect(() => { if (token && id) adminApi.quoteRequest(token, Number(id)).then(setQuote).catch((cause) => setError(cause instanceof Error ? cause.message : "Không tải được yêu cầu báo giá.")); }, [id, token]);

  async function updateStatus(status: QuoteRequest["status"]) {
    if (!token || !quote) return;

    setIsUpdating(true);
    setActionError("");
    setActionMessage("");
    try {
      const updated = await adminApi.updateQuoteStatus(token, quote.id, status);
      setQuote(updated);
    } catch (cause) {
      setActionError(cause instanceof Error ? cause.message : "Không thể cập nhật trạng thái yêu cầu báo giá.");
    } finally {
      setIsUpdating(false);
    }
  }

  async function cancelQuote() {
    if (!quote || !window.confirm(`Hủy yêu cầu báo giá của ${quote.companyName}?`)) return;
    await updateStatus("CANCELLED");
  }

  async function saveQuotation(payload: Parameters<typeof adminApi.createQuotation>[2]) {
    if (!token || !quote) return;
    setIsUpdating(true);
    setActionError("");
    setActionMessage("");
    try {
      const updated = await adminApi.createQuotation(token, quote.id, payload);
      setQuote(updated);
      setActionMessage("Đã lưu báo giá và chuyển sang trạng thái chờ khách hàng phản hồi.");
    } catch (cause) {
      setActionError(cause instanceof Error ? cause.message : "Không thể lưu báo giá.");
    } finally {
      setIsUpdating(false);
    }
  }

  async function convertQuotation(target: "CONTRACT" | "ORDER") {
    if (!token || !quote) return;
    setIsUpdating(true);
    setActionError("");
    setActionMessage("");
    try {
      const result = await adminApi.convertQuotation(token, quote.id, target);
      const updated = await adminApi.quoteRequest(token, quote.id);
      setQuote(updated);
      setActionMessage(target === "CONTRACT" ? `Đã tạo hợp đồng ${result.code}.` : `Đã tạo đơn B2B ${result.code}.`);
    } catch (cause) {
      setActionError(cause instanceof Error ? cause.message : "Không thể chuyển đổi báo giá.");
    } finally {
      setIsUpdating(false);
    }
  }
  if (error) return <AdminPageShell title="Chi tiết báo giá" description="Thông tin yêu cầu báo giá B2B."><ErrorState message={error} /></AdminPageShell>;
  if (!quote) return <AdminPageShell title="Chi tiết báo giá" description="Thông tin yêu cầu báo giá B2B."><LoadingState /></AdminPageShell>;
  return <AdminPageShell title={`Yêu cầu báo giá #${quote.id}`} description="Tổng hợp doanh nghiệp, nhu cầu, báo giá và kết quả chuyển đổi.">
    <div className="mb-5"><Button asChild variant="outline" className="border-[#C7A792] text-[#553B2F] hover:bg-[#f8f2ed]"><Link to="/admin/bao-gia"><ArrowLeft size={16} />Quay lại danh sách</Link></Button></div>
    <div className="grid gap-5 xl:grid-cols-[1.5fr_1fr]">
      <div className="space-y-5"><AdminPanel title="Nhu cầu cần báo giá" description={`Tạo lúc ${formatDate(quote.createdAt)}`}><div className="space-y-4 p-5"><p className="text-lg font-black text-[#553B2F]">{quote.productNeed}</p><p className="text-sm font-semibold text-[#7A665D]">Số lượng dự kiến: {quote.expectedQuantityKg ? `${quote.expectedQuantityKg} kg` : "Chưa cung cấp"}</p>{quote.note ? <p className="rounded-lg bg-[#FAF9F6] p-4 text-sm leading-6 text-[#553B2F]">{quote.note}</p> : null}</div></AdminPanel>
      <AdminPanel title="Dòng báo giá"><div className="overflow-x-auto"><table className="w-full min-w-[560px] text-left text-sm"><thead className="bg-[#FAF9F6]"><tr><th className="p-4">Sản phẩm</th><th className="p-4">SL</th><th className="p-4">Đơn giá</th><th className="p-4 text-right">Thành tiền</th></tr></thead><tbody className="divide-y divide-[#E8D3C7]/60">{quote.items.length ? quote.items.map((item) => <tr key={item.id}><td className="p-4 font-bold text-[#553B2F]">{item.description}</td><td className="p-4">{item.quantity} {item.unit}</td><td className="p-4">{formatCurrency(item.unitPrice)}</td><td className="p-4 text-right font-black text-[#553B2F]">{formatCurrency(item.lineTotal)}</td></tr>) : <tr><td colSpan={4} className="p-8 text-center text-sm font-semibold text-[#AA7864]">Chưa lập báo giá chi tiết.</td></tr>}</tbody></table></div>{quote.items.length ? <div className="ml-auto grid max-w-sm gap-2 p-5 text-sm"><p className="flex justify-between"><span>Tạm tính</span><strong>{formatCurrency(quote.subtotal)}</strong></p><p className="flex justify-between"><span>Chiết khấu</span><strong>-{formatCurrency(quote.discountAmount)}</strong></p><p className="flex justify-between border-t border-[#E8D3C7] pt-3"><span className="font-black">Tổng báo giá</span><strong className="text-[#553B2F]">{formatCurrency(quote.totalAmount)}</strong></p></div> : null}</AdminPanel>{["CONTACTED", "QUOTED"].includes(quote.status) ? <AdminPanel title={quote.status === "CONTACTED" ? "Lập báo giá" : "Cập nhật báo giá"} description="Báo giá đã lưu có thể cập nhật trước khi khách hàng phản hồi."><div className="p-5"><QuotationEditor quote={quote} disabled={isUpdating} onSave={saveQuotation} /></div></AdminPanel> : null}</div>
      <div className="space-y-5"><AdminPanel title="Trạng thái"><div className="space-y-4 p-5"><AdminStatusBadge status={quote.status} />{quote.validUntil ? <p className="flex items-center gap-2 text-sm font-semibold text-[#7A665D]"><CalendarDays size={16} />Hiệu lực đến {formatDate(quote.validUntil)}</p> : null}{actionError ? <p className="rounded-md bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">{actionError}</p> : null}{actionMessage ? <p className="rounded-md bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-800">{actionMessage}</p> : null}{quote.status === "NEW" ? <Button disabled={isUpdating} onClick={() => updateStatus("CONTACTED")} className="w-full bg-[#553B2F] text-white hover:bg-[#3f2a21]"><PhoneCall size={16} />{isUpdating ? "Đang cập nhật..." : "Xác nhận đã liên hệ"}</Button> : null}{quote.status === "ACCEPTED" ? <div className="grid gap-2"><Button disabled={isUpdating} onClick={() => convertQuotation("CONTRACT")} className="bg-[#553B2F] text-white hover:bg-[#3f2a21]"><FileSignature size={16} />Tạo hợp đồng</Button><Button disabled={isUpdating} variant="outline" onClick={() => convertQuotation("ORDER")} className="border-[#C7A792] text-[#553B2F] hover:bg-[#f8f2ed]"><ArrowRight size={16} />Tạo đơn B2B</Button></div> : null}{["NEW", "CONTACTED", "QUOTED"].includes(quote.status) ? <Button variant="outline" disabled={isUpdating} onClick={cancelQuote} className="w-full border-red-200 text-red-700 hover:bg-red-50"><CircleX size={16} />Hủy yêu cầu</Button> : null}{quote.status === "CONTACTED" ? <p className="rounded-md bg-[#f8f2ed] px-3 py-2 text-xs font-semibold leading-5 text-[#7a5547]">Lập dòng báo giá ở cột bên trái, sau đó hệ thống sẽ gửi trạng thái chờ phản hồi cho khách hàng.</p> : null}{quote.status === "QUOTED" ? <p className="rounded-md bg-[#f8f2ed] px-3 py-2 text-xs font-semibold leading-5 text-[#7a5547]">Đang chờ khách hàng chấp nhận hoặc từ chối báo giá trong khu vực doanh nghiệp.</p> : null}</div></AdminPanel><AdminPanel title="Doanh nghiệp"><dl className="grid gap-4 p-5 text-sm"><Detail icon={Building2} label="Tên doanh nghiệp" value={quote.companyName} /><Detail icon={UserRound} label="Người liên hệ" value={quote.contactName} /><Detail icon={FileText} label="Điện thoại / email" value={quote.phoneOrEmail} /></dl></AdminPanel>{quote.salesNote ? <AdminPanel title="Ghi chú từ nhân viên"><p className="p-5 text-sm leading-6 text-[#553B2F]">{quote.salesNote}</p></AdminPanel> : null}</div>
    </div>
  </AdminPageShell>;
}
function Detail({ icon: Icon, label, value }: { icon: typeof Building2; label: string; value: string }) { return <div><dt className="flex items-center gap-2 text-xs font-black uppercase text-[#AA7864]"><Icon size={15} />{label}</dt><dd className="mt-1 font-semibold text-[#553B2F]">{value}</dd></div>; }
