import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { CheckCircle2, Gift, Pause, Play, Plus, Trash2 } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Card, CardContent } from "../../../components/ui/card";
import { useAdminOutlet } from "../../../layouts/AdminLayout";
import { adminAuth } from "../../../lib/adminApi";
import { formatVnd } from "../../../lib/publicApi";
import { AdminPageShell } from "../shared/AdminPageShell";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:4000/api";
const inputClass = "mt-1.5 h-11 w-full rounded-lg border border-[#E8D3C7] bg-white px-3 font-normal outline-none focus:border-[#AA7864]";

type Voucher = {
  id: number;
  name: string;
  code: string | null;
  discountType: "PERCENT" | "FIXED_AMOUNT";
  discountValue: number;
  minOrderAmount: number | null;
  startAt: string;
  endAt: string;
  status: "ACTIVE" | "DISABLED" | "EXPIRED" | "DRAFT";
  createdBy?: { fullName: string } | null;
  approvedBy?: { fullName: string } | null;
  _count?: { orders: number };
};

async function request<T>(path: string, options: RequestInit = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${adminAuth.getToken()}`, ...options.headers },
  });
  const body = await response.json().catch(() => null);
  if (!response.ok) throw new Error(body?.message || body?.errors?.[0]?.message || "Không thể xử lý yêu cầu.");
  return body as T;
}

export default function PromotionsPage() {
  const { user } = useAdminOutlet();
  const isAdmin = user?.role === "ADMIN";
  const [rows, setRows] = useState<Voucher[]>([]);
  const [form, setForm] = useState({ name: "", code: "", discountType: "PERCENT", discountValue: "", minOrderAmount: "", startAt: "", endAt: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [saving, setSaving] = useState(false);
  const [changingId, setChangingId] = useState<number | null>(null);

  async function load() {
    try { setRows(await request<Voucher[]>("/promotions/order-vouchers")); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Không tải được voucher."); }
  }

  useEffect(() => { void load(); }, []);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setSaving(true); setError(""); setSuccess("");
    try {
      await request("/promotions/order-voucher", { method: "POST", body: JSON.stringify({
        name: form.name.trim(), code: form.code.trim().toUpperCase(), discountType: form.discountType,
        discountValue: Number(form.discountValue), minOrderAmount: form.minOrderAmount ? Number(form.minOrderAmount) : 0,
        startAt: new Date(form.startAt).toISOString(), endAt: new Date(form.endAt).toISOString(),
      }) });
      setForm({ name: "", code: "", discountType: "PERCENT", discountValue: "", minOrderAmount: "", startAt: "", endAt: "" });
      setSuccess(isAdmin ? "Voucher đã được phát hành." : "Voucher đã được gửi cho quản trị viên phê duyệt.");
      await load();
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Không thể tạo voucher."); }
    finally { setSaving(false); }
  }

  async function updateVoucher(voucher: Voucher, action: "approve" | "toggle" | "delete") {
    const messages = { approve: `Phê duyệt voucher ${voucher.code}?`, toggle: `Thay đổi trạng thái voucher ${voucher.code}?`, delete: `Xóa voucher ${voucher.code}? Thao tác này không thể hoàn tác.` };
    if (!window.confirm(messages[action])) return;
    setChangingId(voucher.id); setError("");
    try {
      if (action === "approve") await request(`/promotions/order-vouchers/${voucher.id}/approve`, { method: "PATCH" });
      if (action === "toggle") await request(`/promotions/order-vouchers/${voucher.id}/status`, { method: "PATCH", body: JSON.stringify({ status: voucher.status === "ACTIVE" ? "DISABLED" : "ACTIVE" }) });
      if (action === "delete") await request(`/promotions/order-vouchers/${voucher.id}`, { method: "DELETE" });
      await load();
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Không thể cập nhật voucher."); }
    finally { setChangingId(null); }
  }

  function statusOf(voucher: Voucher) { return new Date(voucher.endAt) < new Date() ? "EXPIRED" : voucher.status; }
  const statusLabel: Record<Voucher["status"], string> = { ACTIVE: "Đang hoạt động", DISABLED: "Tạm ngưng", EXPIRED: "Hết hạn", DRAFT: "Chờ duyệt" };

  return (
    <AdminPageShell title="Khuyến mãi và voucher" description="Mã do nhân viên kinh doanh tạo phải được quản trị viên phê duyệt trước khi khách hàng có thể sử dụng.">
      {error ? <p className="mb-5 rounded-lg bg-red-50 p-3 text-sm font-bold text-red-700">{error}</p> : null}
      {success ? <p className="mb-5 rounded-lg bg-emerald-50 p-3 text-sm font-bold text-emerald-700">{success}</p> : null}
      <Card className="border-[#E8D3C7]"><div className="flex items-center gap-3 border-b border-[#E8D3C7] bg-[#FAF9F6] p-5"><span className="grid h-10 w-10 place-items-center rounded-lg bg-[#E8D3C7] text-[#553B2F]"><Gift size={20} /></span><div><h2 className="font-black text-[#553B2F]">Tạo mã giảm giá</h2><p className="text-sm text-[#7A665D]">{isAdmin ? "Voucher do bạn tạo được phát hành ngay." : "Voucher do bạn tạo sẽ chờ quản trị viên phê duyệt."}</p></div></div>
        <CardContent className="p-5"><form onSubmit={submit} className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Field label="Tên chương trình"><input required minLength={3} className={inputClass} placeholder="Chào mừng khách mới" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
          <Field label="Mã voucher"><input required className={inputClass} placeholder="WELCOME10" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} /></Field>
          <Field label="Kiểu giảm"><select className={inputClass} value={form.discountType} onChange={(e) => setForm({ ...form, discountType: e.target.value })}><option value="PERCENT">Theo phần trăm</option><option value="FIXED_AMOUNT">Số tiền cố định</option></select></Field>
          <Field label="Mức giảm"><input required type="number" min="1" max={form.discountType === "PERCENT" ? 100 : undefined} className={inputClass} value={form.discountValue} onChange={(e) => setForm({ ...form, discountValue: e.target.value })} /></Field>
          <Field label="Đơn tối thiểu"><input type="number" min="0" className={inputClass} placeholder="300000" value={form.minOrderAmount} onChange={(e) => setForm({ ...form, minOrderAmount: e.target.value })} /></Field>
          <Field label="Bắt đầu"><input required type="datetime-local" className={inputClass} value={form.startAt} onChange={(e) => setForm({ ...form, startAt: e.target.value })} /></Field>
          <Field label="Kết thúc"><input required type="datetime-local" className={inputClass} value={form.endAt} onChange={(e) => setForm({ ...form, endAt: e.target.value })} /></Field>
          <div className="flex items-end"><Button disabled={saving} className="h-11 w-full bg-[#553B2F] text-white hover:bg-[#3c271f]"><Plus size={17} />{saving ? "Đang tạo..." : "Tạo voucher"}</Button></div>
        </form></CardContent>
      </Card>
      <Card className="mt-6 border-[#E8D3C7]"><CardContent className="p-0"><div className="border-b border-[#E8D3C7] p-5"><h2 className="font-black text-[#553B2F]">Danh sách voucher</h2></div><div className="overflow-x-auto"><table className="w-full min-w-[1100px] text-left text-sm"><thead className="bg-[#FAF9F6] text-[#7A665D]"><tr><th className="p-4">Mã</th><th className="p-4">Chương trình</th><th className="p-4">Mức giảm</th><th className="p-4">Thời hạn</th><th className="p-4">Người tạo / duyệt</th><th className="p-4">Trạng thái</th><th className="p-4 text-right">Thao tác</th></tr></thead><tbody className="divide-y divide-[#E8D3C7]/60">
        {rows.map((row) => { const status = statusOf(row); const isChanging = changingId === row.id; return <tr key={row.id}><td className="p-4 font-black text-[#553B2F]">{row.code}</td><td className="p-4">{row.name}<p className="mt-1 text-xs text-[#806556]">Đơn tối thiểu: {formatVnd(row.minOrderAmount)}</p></td><td className="p-4 font-bold text-emerald-700">{row.discountType === "PERCENT" ? `${row.discountValue}%` : formatVnd(row.discountValue)}</td><td className="p-4 text-[#7A665D]">{new Date(row.startAt).toLocaleDateString("vi-VN")} - {new Date(row.endAt).toLocaleDateString("vi-VN")}</td><td className="p-4 text-xs text-[#7A665D]"><p>Tạo: {row.createdBy?.fullName ?? "Không xác định"}</p><p className="mt-1">Duyệt: {row.approvedBy?.fullName ?? "Chờ duyệt"}</p></td><td className="p-4"><span className={`rounded-full px-2.5 py-1 text-xs font-bold ${status === "ACTIVE" ? "bg-emerald-50 text-emerald-700" : status === "DRAFT" ? "bg-amber-50 text-amber-700" : "bg-slate-100 text-slate-600"}`}>{statusLabel[status]}</span></td><td className="p-4 text-right"><div className="flex justify-end gap-2">{isAdmin && status === "DRAFT" ? <Button disabled={isChanging} onClick={() => void updateVoucher(row, "approve")} className="h-8 bg-emerald-700 px-2 text-xs text-white hover:bg-emerald-800"><CheckCircle2 size={15} />Duyệt</Button> : null}{isAdmin && status !== "DRAFT" && status !== "EXPIRED" ? <Button type="button" variant="outline" disabled={isChanging} onClick={() => void updateVoucher(row, "toggle")} className="h-8 border-[#D7BBA8] px-2 text-xs text-[#553B2F] hover:bg-[#F7EEE8]">{status === "ACTIVE" ? <><Pause size={15} />Tạm ngưng</> : <><Play size={15} />Kích hoạt</>}</Button> : null}{isAdmin && (row._count?.orders ?? 0) === 0 ? <Button type="button" variant="outline" disabled={isChanging} onClick={() => void updateVoucher(row, "delete")} className="h-8 border-red-200 px-2 text-xs text-red-700 hover:bg-red-50"><Trash2 size={15} />Xóa</Button> : null}</div></td></tr>; })}
        </tbody></table></div></CardContent></Card>
    </AdminPageShell>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) { return <label className="text-sm font-bold text-[#553B2F]">{label}{children}</label>; }
