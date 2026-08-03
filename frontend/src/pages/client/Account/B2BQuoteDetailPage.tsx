import { ArrowLeft, CheckCircle2, Clock3, FileCheck2, PackageCheck, XCircle } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { useState } from "react";
import { Button } from "../../../components/ui/button";
import { profileApi } from "../../../lib/profileApi";
import { AccountPageShell, Alert } from "./AccountPageShell";
import { B2BEmpty, B2BLoading, formatDate, formatMoney, quoteStatus, useB2BOverview } from "./B2BAccountUtils";

export function B2BQuoteDetailPage() {
  const { id } = useParams();
  const { data, loading, error } = useB2BOverview();
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const quote = data?.quoteRequests.find((item) => item.id === Number(id));

  async function respond(action: "ACCEPT" | "REJECT") {
    if (!quote) return;
    setSubmitting(true);
    setMessage("");
    try {
      await profileApi.respondB2BQuote(quote.id, action);
      window.location.reload();
    } catch (cause) {
      setMessage(cause instanceof Error ? cause.message : "Không thể gửi phản hồi báo giá.");
    } finally {
      setSubmitting(false);
    }
  }

  return <AccountPageShell title={`Chi tiết báo giá${quote ? ` #${quote.id}` : ""}`} description="Xem các dòng sản phẩm, điều kiện báo giá và phản hồi của doanh nghiệp.">
    <Button asChild variant="outline" className="mb-5 border-stone-300 text-[#563728] hover:bg-stone-50"><Link to="/tai-khoan/b2b/bao-gia"><ArrowLeft size={16} /> Quay lại báo giá</Link></Button>
    {loading ? <B2BLoading /> : error ? <Alert tone="error">{error}</Alert> : !quote ? <B2BEmpty title="Không tìm thấy báo giá" description="Báo giá không tồn tại hoặc không thuộc hồ sơ doanh nghiệp này." /> : <div className="grid gap-5 xl:grid-cols-[1.5fr_.8fr]">
      <section className="space-y-5">
        <article className="rounded-2xl border border-stone-200 bg-white"><div className="border-b border-stone-100 p-5"><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-xl font-black text-[#3b2419]">Nhu cầu: {quote.productNeed}</p><p className="mt-2 text-sm text-stone-600">Gửi ngày {formatDate(quote.createdAt)} · Số lượng dự kiến {quote.expectedQuantityKg ? `${quote.expectedQuantityKg} kg` : "chưa cung cấp"}</p></div><span className="rounded-full bg-[#f5e8db] px-3 py-1 text-xs font-black text-[#70422d]">{quoteStatus[quote.status]}</span></div></div>
          <div className="overflow-x-auto"><table className="w-full min-w-[580px] text-left text-sm"><thead className="bg-stone-50 text-xs font-black uppercase tracking-wide text-stone-500"><tr><th className="px-5 py-4">Sản phẩm</th><th className="px-5 py-4">Số lượng</th><th className="px-5 py-4">Đơn giá</th><th className="px-5 py-4 text-right">Thành tiền</th></tr></thead><tbody className="divide-y divide-stone-100">{quote.items.length ? quote.items.map((item) => <tr key={item.id}><td className="px-5 py-4 font-bold text-[#3b2419]">{item.description}</td><td className="px-5 py-4">{item.quantity} {item.unit}</td><td className="px-5 py-4">{formatMoney(item.unitPrice)}</td><td className="px-5 py-4 text-right font-black text-[#563728]">{formatMoney(item.lineTotal)}</td></tr>) : <tr><td colSpan={4} className="px-5 py-10 text-center text-sm font-semibold text-stone-500">Bộ phận kinh doanh đang lập báo giá chi tiết.</td></tr>}</tbody></table></div>
          {quote.items.length ? <div className="ml-auto grid max-w-sm gap-2 p-5 text-sm"><p className="flex justify-between"><span>Tạm tính</span><strong>{formatMoney(quote.subtotal)}</strong></p><p className="flex justify-between text-emerald-700"><span>Chiết khấu</span><strong>-{formatMoney(quote.discountAmount)}</strong></p><p className="flex justify-between border-t border-stone-200 pt-3 text-base"><span className="font-black">Tổng báo giá</span><strong className="text-[#563728]">{formatMoney(quote.totalAmount)}</strong></p></div> : null}
        </article>
        {quote.salesNote ? <article className="rounded-2xl border border-stone-200 bg-white p-5"><h2 className="font-black text-[#3b2419]">Điều kiện & ghi chú từ kinh doanh</h2><p className="mt-3 whitespace-pre-line text-sm leading-7 text-stone-600">{quote.salesNote}</p></article> : null}
      </section>
      <aside className="space-y-5"><article className="rounded-2xl border border-stone-200 bg-white p-5"><h2 className="font-black text-[#3b2419]">Trạng thái xử lý</h2><div className="mt-4 space-y-3 text-sm"><p className="flex justify-between gap-3"><span className="text-stone-500">Hiệu lực báo giá</span><strong className="text-right text-[#3b2419]">{formatDate(quote.validUntil)}</strong></p><p className="flex justify-between gap-3"><span className="text-stone-500">Trạng thái</span><strong className="text-right text-[#3b2419]">{quoteStatus[quote.status]}</strong></p></div>{message ? <Alert tone="error">{message}</Alert> : null}{quote.status === "QUOTED" ? <div className="mt-5 grid gap-2"><Button disabled={submitting} onClick={() => void respond("ACCEPT")} className="bg-[#5a3322] text-white hover:bg-[#3f2418]"><CheckCircle2 size={17} /> Chấp nhận báo giá</Button><Button disabled={submitting} variant="outline" onClick={() => void respond("REJECT")} className="border-stone-300"><XCircle size={17} /> Từ chối</Button></div> : null}{["NEW", "CONTACTED"].includes(quote.status) ? <p className="mt-5 flex gap-2 rounded-xl bg-amber-50 p-3 text-sm leading-6 text-amber-800"><Clock3 className="mt-0.5 shrink-0" size={18} /> Bộ phận kinh doanh đang trao đổi và chuẩn bị phương án báo giá.</p> : null}</article>
        {quote.contract ? <article className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5"><FileCheck2 className="text-emerald-700" size={21} /><p className="mt-3 text-sm font-bold text-emerald-900">Đã tạo hợp đồng</p><p className="mt-1 text-lg font-black text-emerald-900">{quote.contract.contractCode}</p><p className="mt-2 text-sm text-emerald-800">Trạng thái: {quote.contract.status}</p></article> : null}
        {quote.order ? <article className="rounded-2xl border border-sky-200 bg-sky-50 p-5"><PackageCheck className="text-sky-700" size={21} /><p className="mt-3 text-sm font-bold text-sky-900">Đã tạo đơn B2B</p><p className="mt-1 text-lg font-black text-sky-900">{quote.order.orderCode}</p><p className="mt-2 text-sm text-sky-800">Trạng thái: {quote.order.status}</p></article> : null}
      </aside>
    </div>}
  </AccountPageShell>;
}
