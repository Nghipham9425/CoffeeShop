import { CheckCircle2, Eye, FileText, XCircle } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "../../../components/ui/button";
import { profileApi } from "../../../lib/profileApi";
import { AccountPageShell, Alert } from "./AccountPageShell";
import { B2BEmpty, B2BLoading, formatDate, formatMoney, quoteStatus, useB2BOverview } from "./B2BAccountUtils";

export function B2BQuotesPage() {
  const { data, loading, error } = useB2BOverview();
  const [message, setMessage] = useState("");
  const [submittingId, setSubmittingId] = useState<number | null>(null);
  async function respond(id: number, action: "ACCEPT" | "REJECT") {
    setSubmittingId(id); setMessage("");
    try { await profileApi.respondB2BQuote(id, action); window.location.reload(); }
    catch (cause) { setMessage(cause instanceof Error ? cause.message : "Không thể gửi phản hồi báo giá."); }
    finally { setSubmittingId(null); }
  }
  return <AccountPageShell title="Báo giá của tôi" description="Theo dõi tiến độ xử lý và giá trị từng yêu cầu báo giá B2B.">{loading ? <B2BLoading /> : error ? <Alert tone="error">{error}</Alert> : !data ? <B2BEmpty /> : !data.quoteRequests.length ? <B2BEmpty title="Chưa có yêu cầu báo giá" description="Hãy gửi nhu cầu về loại hạt, sản lượng và quy cách để nhận phương án phù hợp." /> : <div className="grid gap-4">{message ? <Alert tone="error">{message}</Alert> : null}{data.quoteRequests.map((quote) => <article key={quote.id} className="rounded-2xl border border-stone-200 bg-white p-5"><div className="flex flex-wrap items-start justify-between gap-3"><div className="flex gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-[#f5e8db] text-[#70422d]"><FileText size={20} /></span><div><p className="font-black text-[#3b2419]">Báo giá #{quote.id}</p><p className="mt-1 text-sm text-stone-600">{quote.productNeed}</p></div></div><span className="rounded-full bg-[#f5e8db] px-3 py-1 text-xs font-black text-[#70422d]">{quoteStatus[quote.status]}</span></div><div className="mt-5 grid gap-3 border-t border-stone-100 pt-4 text-sm sm:grid-cols-3"><p><span className="block text-xs font-bold text-stone-500">Ngày gửi</span><strong>{formatDate(quote.createdAt)}</strong></p><p><span className="block text-xs font-bold text-stone-500">Hiệu lực đến</span><strong>{formatDate(quote.validUntil)}</strong></p><p><span className="block text-xs font-bold text-stone-500">Tổng báo giá</span><strong className="text-[#70422d]">{quote.items.length ? formatMoney(quote.totalAmount) : "Đang lập báo giá"}</strong></p></div>{quote.salesNote ? <p className="mt-4 rounded-xl bg-stone-50 p-3 text-sm leading-6 text-stone-600">{quote.salesNote}</p> : null}<div className="mt-4 flex flex-wrap gap-3"><Button asChild variant="outline" className="border-stone-300 text-[#563728] hover:bg-stone-50"><Link to={`/tai-khoan/b2b/bao-gia/${quote.id}`}><Eye size={17} /> Xem chi tiết</Link></Button>{quote.status === "QUOTED" ? <><Button disabled={submittingId === quote.id} onClick={() => void respond(quote.id, "ACCEPT")} className="bg-[#5a3322] text-white hover:bg-[#3f2418]"><CheckCircle2 size={17} /> Chấp nhận báo giá</Button><Button disabled={submittingId === quote.id} variant="outline" onClick={() => void respond(quote.id, "REJECT")}><XCircle size={17} /> Từ chối</Button></> : null}</div></article>)}</div>}</AccountPageShell>;
}
