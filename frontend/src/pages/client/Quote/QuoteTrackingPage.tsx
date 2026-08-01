import { useEffect, useState } from "react";
import { CheckCircle2, Clock3, FileText, XCircle } from "lucide-react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import { Card, CardContent } from "../../../components/ui/card";
import { formatVnd, publicApi, type PublicQuotation } from "../../../lib/publicApi";

const statusLabels: Record<PublicQuotation["status"], string> = { NEW: "Đã tiếp nhận", CONTACTED: "Đã liên hệ", QUOTED: "Chờ phản hồi", ACCEPTED: "Đã chấp nhận", REJECTED: "Đã từ chối", CONVERTED: "Đã chuyển hợp đồng/đơn", CLOSED: "Đã kết thúc", CANCELLED: "Đã hủy" };

export function QuoteTrackingPage() {
  const { id } = useParams();
  const [params] = useSearchParams();
  const token = params.get("token") ?? "";
  const [quote, setQuote] = useState<PublicQuotation | null>(null);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { void publicApi.publicQuotation(Number(id), token).then(setQuote).catch((cause) => setError(cause instanceof Error ? cause.message : "Không tải được báo giá.")); }, [id, token]);

  async function respond(action: "ACCEPT" | "REJECT") {
    setSubmitting(true); setError("");
    try { setQuote(await publicApi.respondQuotation(Number(id), token, action)); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Không gửi được phản hồi."); }
    finally { setSubmitting(false); }
  }

  if (error && !quote) return <main className="mx-auto max-w-3xl px-4 py-16"><Card><CardContent className="p-8 text-center"><XCircle className="mx-auto text-red-700" size={42} /><h1 className="mt-4 text-2xl font-black">Không mở được báo giá</h1><p className="mt-2 text-stone-600">{error}</p><Button asChild className="mt-6"><Link to="/bao-gia">Gửi yêu cầu mới</Link></Button></CardContent></Card></main>;
  if (!quote) return <main className="mx-auto max-w-3xl px-4 py-16"><div className="h-80 animate-pulse rounded-2xl bg-stone-100" /></main>;

  return <main className="bg-stone-50"><section className="mx-auto max-w-4xl px-4 py-14"><Badge>Báo giá B2B #{quote.id}</Badge><div className="mt-4 flex flex-wrap items-end justify-between gap-4"><div><h1 className="font-serif text-4xl font-black text-stone-950">{quote.companyName}</h1><p className="mt-2 text-stone-600">{quote.productNeed}</p></div><span className="rounded-full bg-stone-900 px-4 py-2 text-sm font-bold text-white">{statusLabels[quote.status]}</span></div>
    <Card className="mt-8 bg-white"><CardContent className="p-6"><div className="flex items-center gap-3 border-b border-stone-100 pb-5"><FileText className="text-[var(--tan)]" /><div><h2 className="text-xl font-black">Chi tiết chào giá</h2><p className="text-sm text-stone-500">{quote.validUntil ? `Hiệu lực đến ${new Date(quote.validUntil).toLocaleDateString("vi-VN")}` : "Sales đang chuẩn bị báo giá"}</p></div></div>
      {quote.items.length ? <div className="mt-5 overflow-x-auto"><table className="w-full min-w-[600px] text-left text-sm"><thead className="bg-stone-50"><tr><th className="p-3">Sản phẩm</th><th className="p-3">Số lượng</th><th className="p-3">Đơn giá</th><th className="p-3 text-right">Thành tiền</th></tr></thead><tbody>{quote.items.map((item) => <tr key={item.id} className="border-b border-stone-100"><td className="p-3 font-bold">{item.description}</td><td className="p-3">{item.quantity} {item.unit}</td><td className="p-3">{formatVnd(item.unitPrice)}</td><td className="p-3 text-right font-bold">{formatVnd(item.lineTotal)}</td></tr>)}</tbody></table></div> : <p className="mt-6 flex items-center gap-2 rounded-xl bg-amber-50 p-4 text-sm font-bold text-amber-800"><Clock3 size={18} /> Bộ phận sales đang lập báo giá chi tiết.</p>}
      {quote.items.length ? <div className="ml-auto mt-5 max-w-sm space-y-2 text-sm"><p className="flex justify-between"><span>Tạm tính</span><strong>{formatVnd(quote.subtotal)}</strong></p><p className="flex justify-between text-emerald-700"><span>Chiết khấu</span><strong>-{formatVnd(quote.discountAmount)}</strong></p><p className="flex justify-between border-t border-stone-200 pt-3 text-lg"><span className="font-black">Tổng báo giá</span><strong className="text-[var(--coffee)]">{formatVnd(quote.totalAmount)}</strong></p></div> : null}
      {quote.salesNote ? <p className="mt-5 rounded-xl bg-stone-50 p-4 text-sm leading-6 text-stone-600">{quote.salesNote}</p> : null}
      {error ? <p className="mt-4 text-sm font-bold text-red-700">{error}</p> : null}
      {quote.status === "QUOTED" ? <div className="mt-6 grid gap-3 sm:grid-cols-2"><Button disabled={submitting} onClick={() => respond("ACCEPT")}><CheckCircle2 size={18} /> Chấp nhận báo giá</Button><Button disabled={submitting} variant="outline" onClick={() => respond("REJECT")}><XCircle size={18} /> Từ chối</Button></div> : null}
      {quote.contract ? <p className="mt-6 rounded-xl bg-emerald-50 p-4 font-bold text-emerald-800">Hợp đồng đã tạo: {quote.contract.contractCode}</p> : null}{quote.order ? <p className="mt-6 rounded-xl bg-emerald-50 p-4 font-bold text-emerald-800">Đơn B2B đã tạo: {quote.order.orderCode}</p> : null}
    </CardContent></Card>
  </section></main>;
}
