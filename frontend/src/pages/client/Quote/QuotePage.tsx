import { ArrowRight, Check, ClipboardList, Factory, PackageCheck, Send, ShieldCheck } from "lucide-react";
import { useState, type FormEvent } from "react";
import { Seo } from "../../../components/Seo";
import { Button } from "../../../components/ui/button";
import { publicApi } from "../../../lib/publicApi";
import { adminAuth } from "../../../lib/adminApi";

type QuoteForm = { companyName: string; contactName: string; phoneOrEmail: string; productNeed: string; expectedQuantityKg: string; note: string };
const initialForm: QuoteForm = { companyName: "", contactName: "", phoneOrEmail: "", productNeed: "", expectedQuantityKg: "", note: "" };
const requestTypes = ["Cung ứng cà phê hạt", "Cà phê cho quán / chuỗi F&B", "Gia công OEM / Private Label", "Phát triển blend riêng"];

export function QuotePage() {
  const [form, setForm] = useState<QuoteForm>(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [trackingUrl, setTrackingUrl] = useState("");
  const user = adminAuth.getUser();
  const set = (field: keyof QuoteForm, value: string) => setForm((current) => ({ ...current, [field]: value }));

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(""); setSuccess(""); setTrackingUrl("");
    if (!form.companyName.trim() || !form.contactName.trim() || !form.phoneOrEmail.trim() || !form.productNeed.trim()) {
      setError("Vui lòng điền các trường có dấu *."); return;
    }
    if (form.expectedQuantityKg && (!Number.isInteger(Number(form.expectedQuantityKg)) || Number(form.expectedQuantityKg) <= 0)) {
      setError("Sản lượng dự kiến phải là số nguyên lớn hơn 0."); return;
    }
    setSubmitting(true);
    try {
      const quote = await publicApi.createQuoteRequest({
        companyName: form.companyName.trim(), contactName: form.contactName.trim(), phoneOrEmail: form.phoneOrEmail.trim(),
        productNeed: form.productNeed.trim(), expectedQuantityKg: form.expectedQuantityKg ? Number(form.expectedQuantityKg) : undefined,
        note: form.note.trim() || undefined,
      }, adminAuth.getToken());
      setForm(initialForm);
      setSuccess(`Đã gửi yêu cầu báo giá #${quote.id}. Bộ phận kinh doanh sẽ liên hệ để làm rõ nhu cầu.`);
      setTrackingUrl(`/bao-gia/${quote.id}?token=${encodeURIComponent(quote.accessToken)}`);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Không thể gửi yêu cầu báo giá."); }
    finally { setSubmitting(false); }
  }

  return <main className="bg-[#fcfaf8] pb-16">
    <Seo title="Báo giá doanh nghiệp" description="Gửi nhu cầu mua sỉ, gia công OEM hoặc phát triển thương hiệu cà phê riêng với Phú Tài Coffee Works." canonicalPath="/bao-gia" />
    <section className="border-b border-[#eaded4] bg-[#f4ece5]"><div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
      <p className="text-xs font-black uppercase tracking-[0.18em] text-[#9b6544]">Báo giá doanh nghiệp</p>
      <div className="mt-4 grid gap-8 lg:grid-cols-[1.15fr_.85fr] lg:items-end"><div><h1 className="max-w-3xl font-serif text-4xl font-black leading-tight text-[#301d15] md:text-6xl">Báo giá rõ ràng cho nhu cầu cà phê dài hạn.</h1><p className="mt-5 max-w-2xl text-base leading-7 text-[#705d51] md:text-lg">Dành cho quán, đại lý, chuỗi F&B và doanh nghiệp cần nguồn hàng ổn định hoặc gia công thương hiệu riêng.</p></div><div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">{[[Factory, "Tư vấn quy cách"], [ShieldCheck, "Báo giá theo sản lượng"], [PackageCheck, "Theo dõi từng yêu cầu"]].map(([Icon, label]) => { const FeatureIcon = Icon as typeof Factory; return <div key={label as string} className="flex items-center gap-3 rounded-xl border border-[#dfcabe] bg-white/70 px-4 py-3 text-sm font-bold text-[#4b3022]"><FeatureIcon size={19} className="text-[#a66d48]" />{label as string}</div>; })}</div></div>
    </div></section>

    <section className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[.78fr_1.22fr] lg:px-8 lg:py-14">
      <aside className="space-y-5"><article className="rounded-2xl border border-[#eaded4] bg-white p-6"><span className="grid h-11 w-11 place-items-center rounded-xl bg-[#f5e7da] text-[#74452e]"><ClipboardList size={21} /></span><h2 className="mt-5 text-2xl font-black text-[#301d15]">Quy trình tiếp nhận</h2><ol className="mt-5 space-y-4">{[["01", "Gửi nhu cầu", "Loại hạt, sản lượng và yêu cầu quy cách."], ["02", "Tư vấn & lập báo giá", "Kinh doanh phản hồi phương án phù hợp."], ["03", "Chấp nhận & triển khai", "Theo dõi báo giá, hợp đồng hoặc đơn B2B."]].map(([number, title, detail]) => <li key={number} className="flex gap-3"><span className="pt-0.5 text-xs font-black text-[#a66d48]">{number}</span><p className="text-sm leading-6 text-[#705d51]"><strong className="block text-[#3e281d]">{title}</strong>{detail}</p></li>)}</ol></article><article className="rounded-2xl bg-[#4c2d20] p-6 text-white"><p className="text-xs font-black uppercase tracking-[0.16em] text-[#e8be8c]">Chuẩn bị trước</p><div className="mt-4 space-y-3 text-sm leading-6 text-white/80">{["Sản phẩm hoặc loại hạt cần tìm.", "Sản lượng theo đợt hoặc theo tháng.", "Mức rang, blend, bao bì nếu có.", "Khu vực và thời điểm cần giao hàng."].map((item) => <p key={item} className="flex gap-2"><Check className="mt-1 shrink-0 text-[#e8be8c]" size={15} />{item}</p>)}</div></article></aside>

      <section className="rounded-2xl border border-[#eaded4] bg-white p-6 shadow-[0_12px_35px_rgba(73,42,27,.06)] md:p-8"><div className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-xs font-black uppercase tracking-[0.16em] text-[#a66d48]">Biểu mẫu B2B</p><h2 className="mt-2 text-3xl font-black text-[#301d15]">Gửi yêu cầu báo giá</h2><p className="mt-2 text-sm leading-6 text-[#705d51]">Thông tin càng đầy đủ, phương án tư vấn càng sát nhu cầu thực tế.</p></div>{user ? <span className="rounded-full bg-[#edf5eb] px-3 py-1.5 text-xs font-black text-[#42633b]">Đã nhận diện tài khoản</span> : null}</div>
        <form className="mt-8 grid gap-5 md:grid-cols-2" onSubmit={submit}>
          <Field label="Tên công ty / đơn vị *" value={form.companyName} onChange={(value) => set("companyName", value)} placeholder="Ví dụ: Công ty TNHH Minh Phát" />
          <Field label="Người liên hệ *" value={form.contactName} onChange={(value) => set("contactName", value)} placeholder={user?.fullName ?? "Ví dụ: Trần Phú Tài"} />
          <Field label="Số điện thoại / email *" value={form.phoneOrEmail} onChange={(value) => set("phoneOrEmail", value)} placeholder={user?.phone ?? user?.email ?? "Ví dụ: 089438439 hoặc sales@congty.vn"} />
          <Field label="Sản lượng dự kiến (kg)" value={form.expectedQuantityKg} onChange={(value) => set("expectedQuantityKg", value)} placeholder="Ví dụ: 500" type="number" />
          <div className="md:col-span-2"><p className="mb-2 text-sm font-bold text-[#4b3022]">Nhu cầu chính</p><div className="flex flex-wrap gap-2">{requestTypes.map((type) => <button key={type} type="button" onClick={() => set("productNeed", type)} className={`rounded-full border px-3 py-2 text-sm font-bold transition ${form.productNeed === type ? "border-[#5a3322] bg-[#5a3322] text-white" : "border-[#e4d4c8] bg-white text-[#704a35] hover:border-[#b57a55]"}`}>{type}</button>)}</div></div>
          <div className="md:col-span-2"><Field label="Sản phẩm cần báo giá *" value={form.productNeed} onChange={(value) => set("productNeed", value)} placeholder="Ví dụ: Arabica rang vừa, cà phê blend hoặc gia công OEM" /></div>
          <label className="grid gap-2 text-sm font-bold text-[#4b3022] md:col-span-2"><span>Yêu cầu thêm</span><textarea className="min-h-32 rounded-xl border border-[#dfcabe] px-4 py-3 font-medium outline-none transition focus:border-[#a96f3e] focus:ring-2 focus:ring-[#f1dfcd]" value={form.note} onChange={(event) => set("note", event.target.value)} placeholder="Quy cách bao bì, khu vực giao hàng, thời gian cần hàng hoặc yêu cầu mẫu thử..." /></label>
          {error ? <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 md:col-span-2">{error}</p> : null}
          {success ? <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-4 text-sm font-semibold text-emerald-800 md:col-span-2"><p>{success}</p>{trackingUrl ? <a href={trackingUrl} className="mt-3 inline-flex items-center gap-2 font-black text-emerald-900 hover:underline">Theo dõi yêu cầu báo giá <ArrowRight size={16} /></a> : null}</div> : null}
          <div className="md:col-span-2"><Button size="lg" disabled={submitting} type="submit" className="w-full bg-[#5a3322] text-white hover:bg-[#3f2418]"><Send size={18} />{submitting ? "Đang gửi yêu cầu..." : "Gửi yêu cầu báo giá"}</Button></div>
        </form>
      </section>
    </section>
  </main>;
}

function Field({ label, value, onChange, placeholder, type = "text" }: { label: string; value: string; onChange: (value: string) => void; placeholder: string; type?: string }) {
  return <label className="grid gap-2 text-sm font-bold text-[#4b3022]"><span>{label}</span><input type={type} min={type === "number" ? 1 : undefined} className="h-12 rounded-xl border border-[#dfcabe] px-4 font-medium outline-none transition focus:border-[#a96f3e] focus:ring-2 focus:ring-[#f1dfcd]" value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} /></label>;
}
