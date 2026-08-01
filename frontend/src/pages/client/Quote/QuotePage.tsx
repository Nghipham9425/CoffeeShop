import { Mail, MapPin, Phone, Send } from "lucide-react";
import { useState, type FormEvent } from "react";
import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import { Card, CardContent } from "../../../components/ui/card";
import { publicApi } from "../../../lib/publicApi";

type QuoteForm = {
  companyName: string;
  contactName: string;
  phoneOrEmail: string;
  productNeed: string;
  expectedQuantityKg: string;
  note: string;
};

const initialForm: QuoteForm = {
  companyName: "",
  contactName: "",
  phoneOrEmail: "",
  productNeed: "",
  expectedQuantityKg: "",
  note: "",
};

export function QuotePage() {
  const [form, setForm] = useState<QuoteForm>(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [trackingUrl, setTrackingUrl] = useState("");

  function updateField(field: keyof QuoteForm, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");
    setTrackingUrl("");
    if (!form.companyName.trim() || !form.contactName.trim() || !form.phoneOrEmail.trim() || !form.productNeed.trim()) {
      setError("Vui lòng điền đầy đủ các thông tin bắt buộc.");
      return;
    }
    if (form.expectedQuantityKg && (!Number.isInteger(Number(form.expectedQuantityKg)) || Number(form.expectedQuantityKg) <= 0)) {
      setError("Số lượng dự kiến phải là số nguyên lớn hơn 0.");
      return;
    }

    setSubmitting(true);
    try {
      const quote = await publicApi.createQuoteRequest({
        companyName: form.companyName.trim(),
        contactName: form.contactName.trim(),
        phoneOrEmail: form.phoneOrEmail.trim(),
        productNeed: form.productNeed.trim(),
        expectedQuantityKg: form.expectedQuantityKg ? Number(form.expectedQuantityKg) : undefined,
        note: form.note.trim() || undefined,
      });
      setForm(initialForm);
      setSuccess(`Đã gửi yêu cầu báo giá #${quote.id}. Bộ phận sales sẽ liên hệ sớm nhất.`);
      setTrackingUrl(`/bao-gia/${quote.id}?token=${encodeURIComponent(quote.accessToken)}`);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Không thể gửi yêu cầu báo giá.");
    } finally {
      setSubmitting(false);
    }
  }

  return <main className="bg-stone-50">
    <section className="mx-auto grid max-w-7xl gap-8 px-4 py-14 sm:px-6 lg:grid-cols-[1fr_0.75fr] lg:px-8">
      <Card className="bg-white"><CardContent className="p-8">
        <Badge>Báo giá & liên hệ</Badge>
        <h1 className="mt-4 font-serif text-4xl font-black leading-tight text-stone-950 md:text-6xl">Nhận tư vấn cho đơn hàng lẻ, đơn sỉ và gia công cà phê.</h1>
        <p className="mt-5 text-lg leading-8 text-stone-600">Gửi thông tin nhu cầu để bộ phận sales tư vấn sản phẩm, chính sách giá, giao nhận, hợp đồng B2B hoặc mẫu thử trước khi sản xuất.</p>
        <form className="mt-8 grid gap-4" onSubmit={submit}>
          <Input label="Tên công ty / tên khách hàng *" value={form.companyName} onChange={(value) => updateField("companyName", value)} placeholder="Ví dụ: Công ty TNHH Cà phê Phú Tài" />
          <Input label="Người liên hệ *" value={form.contactName} onChange={(value) => updateField("contactName", value)} placeholder="Ví dụ: Trần Phú Tài" />
          <Input label="Số điện thoại / email *" value={form.phoneOrEmail} onChange={(value) => updateField("phoneOrEmail", value)} placeholder="Ví dụ: 089438439 hoặc sales@congty.vn" />
          <Input label="Sản phẩm cần báo giá *" value={form.productNeed} onChange={(value) => updateField("productNeed", value)} placeholder="Ví dụ: Cà phê hạt rang Arabica, OEM túi 250g" />
          <Input label="Số lượng dự kiến (kg)" value={form.expectedQuantityKg} onChange={(value) => updateField("expectedQuantityKg", value)} placeholder="Ví dụ: 500" type="number" />
          <label className="grid gap-2 text-sm font-bold text-stone-700"><span>Ghi chú</span><textarea className="min-h-36 rounded-xl border border-stone-200 px-4 py-3 outline-none focus:border-[var(--leaf)] focus:ring-2 focus:ring-[var(--leaf)]" value={form.note} onChange={(event) => updateField("note", event.target.value)} placeholder="Nhu cầu OEM, lịch giao, khu vực giao hàng, quy cách bao bì hoặc câu hỏi cần tư vấn..." /></label>
          {error ? <p className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">{error}</p> : null}
          {success ? <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700"><p>{success}</p>{trackingUrl ? <Button asChild variant="outline" className="mt-3"><a href={trackingUrl}>Theo dõi và phản hồi báo giá</a></Button> : null}</div> : null}
          <Button size="lg" disabled={submitting} type="submit"><Send size={18} />{submitting ? "Đang gửi..." : "Gửi yêu cầu báo giá"}</Button>
        </form>
      </CardContent></Card>
      <div className="grid gap-5"><Card className="bg-[var(--coffee)] text-white"><CardContent className="p-8"><h2 className="text-3xl font-black">Thông tin cần chuẩn bị</h2><ul className="mt-6 space-y-4 text-sm leading-6 text-white/80"><li>Loại sản phẩm cần mua hoặc cần gia công.</li><li>Sản lượng dự kiến theo tháng hoặc theo từng đợt.</li><li>Khu vực giao hàng và thời gian mong muốn.</li><li>Yêu cầu bao bì, nhãn riêng, chứng nhận hoặc mẫu thử.</li></ul></CardContent></Card>
        <Card className="bg-white"><CardContent className="p-8"><h2 className="text-3xl font-black text-stone-950">Liên hệ sales</h2><div className="mt-6 grid gap-4 text-sm font-semibold text-stone-700"><p className="flex items-center gap-3"><Phone className="text-[var(--tan)]" size={20} />0886.33.25.33</p><p className="flex items-center gap-3"><Mail className="text-[var(--tan)]" size={20} />sales@phutaicoffee.vn</p><p className="flex items-center gap-3"><MapPin className="text-[var(--tan)]" size={20} />KCN Tân Bình, TP. Hồ Chí Minh</p></div></CardContent></Card>
      </div>
    </section>
  </main>;
}

function Input({ label, value, onChange, placeholder, type = "text" }: { label: string; value: string; onChange: (value: string) => void; placeholder: string; type?: string }) {
  return <label className="grid gap-2 text-sm font-bold text-stone-700"><span>{label}</span><input type={type} min={type === "number" ? 1 : undefined} className="h-12 rounded-xl border border-stone-200 px-4 outline-none focus:border-[var(--leaf)] focus:ring-2 focus:ring-[var(--leaf)]" value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} /></label>;
}
