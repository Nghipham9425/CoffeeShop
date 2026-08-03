import { Building2, FileCheck2, FileText, Landmark, ReceiptText } from "lucide-react";
import { Link } from "react-router-dom";
import { AccountPageShell, Alert } from "./AccountPageShell";
import { B2BEmpty, B2BLoading, formatMoney, useB2BOverview } from "./B2BAccountUtils";

export function B2BDashboardPage() {
  const { data, loading, error } = useB2BOverview();
  return <AccountPageShell title="Khu vực doanh nghiệp" description="Theo dõi báo giá, hợp đồng, hóa đơn và công nợ của doanh nghiệp.">
    {loading ? <B2BLoading /> : error ? <Alert tone="error">{error}</Alert> : !data ? <B2BEmpty /> : <>
      <section className="rounded-2xl border border-[#e4d0bf] bg-[#fffaf5] p-6"><div className="flex flex-wrap items-start justify-between gap-4"><div className="flex gap-3"><span className="grid h-11 w-11 place-items-center rounded-xl bg-[#5a3322] text-white"><Building2 size={21} /></span><div><h2 className="text-xl font-black text-[#3b2419]">{data.companyName}</h2><p className="mt-1 text-sm text-stone-600">Người liên hệ: {data.contactName} · {data.email ?? data.phone}</p></div></div><Link to="/bao-gia" className="text-sm font-black text-[#7a4b32] hover:underline">Gửi yêu cầu mới</Link></div></section>
      <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><Metric icon={FileText} label="Báo giá" value={data.quoteRequests.length} link="/tai-khoan/b2b/bao-gia" /><Metric icon={FileCheck2} label="Hợp đồng" value={data.contracts.length} link="/tai-khoan/b2b/hop-dong" /><Metric icon={ReceiptText} label="Hóa đơn" value={data.invoices.length} link="/tai-khoan/b2b/cong-no" /><Metric icon={Landmark} label="Công nợ còn lại" value={formatMoney(data.debts.reduce((sum, item) => sum + Number(item.remainingAmount), 0))} link="/tai-khoan/b2b/cong-no" /></div>
      <section className="mt-6 rounded-2xl border border-stone-200 bg-white"><div className="flex items-center justify-between border-b border-stone-100 px-6 py-4"><h2 className="font-black text-stone-950">Báo giá gần đây</h2><Link to="/tai-khoan/b2b/bao-gia" className="text-sm font-bold text-[#7a4b32]">Xem tất cả</Link></div>{data.quoteRequests.length ? <div className="divide-y divide-stone-100">{data.quoteRequests.slice(0, 4).map((quote) => <article key={quote.id} className="flex flex-wrap items-center justify-between gap-3 px-6 py-4"><div><p className="font-black text-[#3b2419]">Báo giá #{quote.id}</p><p className="mt-1 text-sm text-stone-600">{quote.productNeed}</p></div><p className="font-black text-[#6c402b]">{formatMoney(quote.totalAmount)}</p></article>)}</div> : <p className="px-6 py-8 text-sm text-stone-500">Chưa có báo giá nào.</p>}</section>
    </>}
  </AccountPageShell>;
}

function Metric({ icon: Icon, label, value, link }: { icon: typeof FileText; label: string; value: number | string; link: string }) {
  return <Link to={link} className="rounded-2xl border border-[#eadbce] bg-white p-5 transition hover:-translate-y-0.5 hover:border-[#c9a589] hover:shadow-sm"><Icon className="text-[#9b6845]" size={21} /><p className="mt-4 text-xs font-black uppercase tracking-wide text-stone-500">{label}</p><p className="mt-1 text-xl font-black text-[#3b2419]">{value}</p></Link>;
}
