import { Check, ClipboardList, Factory, Mail, MapPin, Phone, Send } from "lucide-react";
import { useState, type FormEvent } from "react";
import { Seo } from "../../../components/Seo";
import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import { Card, CardContent } from "../../../components/ui/card";
import { publicApi } from "../../../lib/publicApi";
import { adminAuth } from "../../../lib/adminApi";

type QuoteForm = { companyName: string; contactName: string; phoneOrEmail: string; productNeed: string; expectedQuantityKg: string; note: string };
const initialForm: QuoteForm = { companyName: "", contactName: "", phoneOrEmail: "", productNeed: "", expectedQuantityKg: "", note: "" };

export function QuotePage() {
  const [form, setForm] = useState<QuoteForm>(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [trackingUrl, setTrackingUrl] = useState("");
  const set = (field: keyof QuoteForm, value: string) => setForm((current) => ({ ...current, [field]: value }));
  const user = adminAuth.getUser();

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(""); setSuccess(""); setTrackingUrl("");
    if (!form.companyName.trim() || !form.contactName.trim() || !form.phoneOrEmail.trim() || !form.productNeed.trim()) { setError("Vui lòng điền các trường có dấu *."); return; }
    if (form.expectedQuantityKg && (!Number.isInteger(Number(form.expectedQuantityKg)) || Number(form.expectedQuantityKg) <= 0)) { setError("Số lượng dự kiến phải là số nguyên lớn hơn 0."); return; }
    setSubmitting(true);
    try {
      const quote = await publicApi.createQuoteRequest({ companyName: form.companyName.trim(), contactName: form.contactName.trim(), phoneOrEmail: form.phoneOrEmail.trim(), productNeed: form.productNeed.trim(), expectedQuantityKg: form.expectedQuantityKg ? Number(form.expectedQuantityKg) : undefined, note: form.note.trim() || undefined }, adminAuth.getToken());
      setForm(initialForm); setSuccess(`Yêu cầu báo giá #${quote.id} đã được gửi. Bộ phận kinh doanh sẽ phản hồi sớm nhất.`); setTrackingUrl(`/bao-gia/${quote.id}?token=${encodeURIComponent(quote.accessToken)}`);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Không thể gửi yêu cầu báo giá."); }
    finally { setSubmitting(false); }
  }

  return <main className="bg-[#fbf7f3]">
    <Seo title="Yêu cầu báo giá cà phê B2B" description="Gửi nhu cầu mua sỉ, gia công OEM hoặc phát triển thương hiệu cà phê riêng với Phú Tài Coffee Works." canonicalPath="/bao-gia" />
    <section className="border-b border-[#eadbce] bg-white"><div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[1.05fr_.95fr] lg:px-8 lg:py-20">
      <div className="self-center"><Badge>Báo giá B2B</Badge><h1 className="mt-5 font-serif text-4xl font-black leading-[1.08] text-[#2d1b13] md:text-6xl">Nguồn cà phê ổn định cho mô hình kinh doanh của bạn.</h1><p className="mt-6 max-w-xl text-lg leading-8 text-stone-600">Từ đơn hàng sỉ đến rang xay gia công và nhãn riêng, đội ngũ Phú Tài tư vấn quy cách, giá và lịch giao phù hợp với nhu cầu thực tế.</p><div className="mt-8 grid gap-3 sm:grid-cols-3">{[["01", "Gửi nhu cầu"], ["02", "Nhận tư vấn"], ["03", "Chốt phương án"]].map(([number, label]) => <div key={number} className="border-l-2 border-[#c89661] pl-3"><p className="text-sm font-black text-[#a96f3e]">{number}</p><p className="mt-1 text-sm font-bold text-[#3e281d]">{label}</p></div>)}</div></div>
      <div className="relative min-h-72 overflow-hidden rounded-2xl bg-[#3f281d]"><img src="/images/products/espresso.jpg" alt="Cà phê rang xay Phú Tài" className="absolute inset-0 h-full w-full object-cover opacity-65" /><div className="relative flex h-full min-h-72 flex-col justify-end bg-gradient-to-t from-[#2a170d]/90 via-transparent to-transparent p-7 text-white"><Factory size={31} /><p className="mt-4 text-2xl font-black">Sản xuất theo yêu cầu</p><p className="mt-2 max-w-sm text-sm leading-6 text-white/80">Tư vấn profile rang, định lượng, bao bì và lộ trình mẫu thử trước khi sản xuất.</p></div></div>
    </div></section>

    <section className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[1.15fr_.85fr] lg:px-8 lg:py-16">
      <Card className="border-[#e7d7ca] bg-white shadow-sm"><CardContent className="p-6 md:p-8"><div className="flex items-start gap-3"><span className="grid h-11 w-11 place-items-center rounded-xl bg-[#f5e8db] text-[#6b3d27]"><ClipboardList size={21} /></span><div><h2 className="text-2xl font-black text-[#2d1b13]">Gửi yêu cầu báo giá</h2><p className="mt-1 text-sm leading-6 text-stone-500">Thông tin càng rõ, báo giá và phương án đề xuất càng sát nhu cầu.</p></div></div>
        <form className="mt-7 grid gap-4 md:grid-cols-2" onSubmit={submit}>
          <Field label="Tên công ty / đơn vị *" value={form.companyName} onChange={(value) => set("companyName", value)} placeholder="Ví dụ: Công ty TNHH Minh Phát" />
          <Field label="Người liên hệ *" value={form.contactName} onChange={(value) => set("contactName", value)} placeholder={user?.fullName ?? "Ví dụ: Trần Phú Tài"} />
          <Field label="Số điện thoại / email *" value={form.phoneOrEmail} onChange={(value) => set("phoneOrEmail", value)} placeholder={user?.phone ?? user?.email ?? "Ví dụ: 089438439 hoặc sales@congty.vn"} />
          <Field label="Sản lượng dự kiến (kg)" value={form.expectedQuantityKg} onChange={(value) => set("expectedQuantityKg", value)} placeholder="Ví dụ: 500" type="number" />
          <div className="md:col-span-2"><Field label="Sản phẩm cần báo giá *" value={form.productNeed} onChange={(value) => set("productNeed", value)} placeholder="Ví dụ: Arabica rang vừa, cà phê blend hoặc gia công OEM" /></div>
          <label className="grid gap-2 text-sm font-bold text-stone-700 md:col-span-2"><span>Yêu cầu thêm</span><textarea className="min-h-32 rounded-xl border border-stone-200 px-4 py-3 outline-none transition focus:border-[#a96f3e] focus:ring-2 focus:ring-[#f1dfcd]" value={form.note} onChange={(event) => set("note", event.target.value)} placeholder="Quy cách bao bì, khu vực giao hàng, thời gian cần hàng, yêu cầu mẫu thử hoặc nhãn riêng..." /></label>
          {error ? <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 md:col-span-2">{error}</p> : null}
          {success ? <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800 md:col-span-2"><p>{success}</p>{trackingUrl ? <Button asChild variant="outline" className="mt-3"><a href={trackingUrl}>Theo dõi yêu cầu báo giá</a></Button> : null}</div> : null}
          <div className="md:col-span-2"><Button size="lg" disabled={submitting} type="submit" className="w-full bg-[#513326] hover:bg-[#3d251b]"><Send size={18} />{submitting ? "Đang gửi yêu cầu..." : "Gửi yêu cầu báo giá"}</Button></div>
        </form></CardContent></Card>
      <aside className="space-y-5"><Card className="border-[#e7d7ca] bg-[#513326] text-white"><CardContent className="p-7"><h2 className="text-2xl font-black">Cần chuẩn bị gì?</h2><div className="mt-6 space-y-4">{["Loại cà phê hoặc dịch vụ gia công cần tìm.", "Sản lượng theo tháng hoặc theo từng đợt.", "Quy cách đóng gói, thương hiệu riêng nếu có.", "Khu vực và thời điểm cần giao hàng."].map((item) => <div key={item} className="flex gap-3 text-sm leading-6 text-white/80"><Check className="mt-0.5 shrink-0 text-[#e4b77c]" size={17} />{item}</div>)}</div></CardContent></Card>
        <Card className="border-[#e7d7ca] bg-white"><CardContent className="p-7"><p className="text-sm font-bold uppercase tracking-wide text-[#a96f3e]">Liên hệ trực tiếp</p><h2 className="mt-2 text-2xl font-black text-[#2d1b13]">Đội ngũ kinh doanh</h2><div className="mt-6 grid gap-4 text-sm font-semibold text-stone-700"><p className="flex items-center gap-3"><Phone className="text-[#a96f3e]" size={19} />0886.33.25.33</p><p className="flex items-center gap-3"><Mail className="text-[#a96f3e]" size={19} />sales@phutaicoffee.vn</p><p className="flex items-start gap-3"><MapPin className="mt-0.5 text-[#a96f3e]" size={19} />KCN Tân Bình, TP. Hồ Chí Minh</p></div></CardContent></Card>
      </aside>
    </section>
  </main>;
}

function Field({ label, value, onChange, placeholder, type = "text" }: { label: string; value: string; onChange: (value: string) => void; placeholder: string; type?: string }) {
  return <label className="grid gap-2 text-sm font-bold text-stone-700"><span>{label}</span><input type={type} min={type === "number" ? 1 : undefined} className="h-12 rounded-xl border border-stone-200 px-4 outline-none transition focus:border-[#a96f3e] focus:ring-2 focus:ring-[#f1dfcd]" value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} /></label>;
}
