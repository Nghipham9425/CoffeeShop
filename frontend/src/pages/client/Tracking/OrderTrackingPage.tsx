import { CreditCard, LoaderCircle, PackageSearch, Search, Truck } from "lucide-react";
import { useState, type FormEvent } from "react";
import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import { Card, CardContent } from "../../../components/ui/card";
import { formatVnd, publicApi, type TrackedOrder } from "../../../lib/publicApi";

export function OrderTrackingPage() {
  const [trackingCode, setTrackingCode] = useState("");
  const [order, setOrder] = useState<TrackedOrder | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: FormEvent) {
    event.preventDefault();
    setLoading(true); setError(""); setOrder(null);
    try { setOrder(await publicApi.trackOrder(trackingCode.trim())); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Không thể tra cứu vận đơn."); }
    finally { setLoading(false); }
  }

  return <main className="min-h-[65vh] bg-stone-50 px-4 py-14"><section className="mx-auto max-w-3xl">
    <div className="text-center"><Badge>Hỗ trợ khách hàng</Badge><h1 className="mt-4 font-serif text-4xl font-black text-stone-950 md:text-5xl">Tra cứu vận đơn</h1><p className="mx-auto mt-4 max-w-xl text-stone-600">Nhập mã vận đơn do đơn vị giao nhận cung cấp để kiểm tra trạng thái giao hàng.</p></div>
    <Card className="mt-8"><CardContent className="p-6"><form onSubmit={submit} className="grid gap-4 md:grid-cols-[1fr_auto]">
      <input value={trackingCode} onChange={(event) => setTrackingCode(event.target.value.toUpperCase())} className="h-12 rounded-xl border border-stone-200 px-4 font-semibold outline-none focus:border-[var(--coffee)]" placeholder="Ví dụ: GHN123456789" required />
      <Button type="submit" disabled={loading} className="h-12"><Search size={17} />{loading ? "Đang tra cứu" : "Tra cứu"}</Button>
    </form>{error ? <p className="mt-4 rounded-xl bg-rose-50 p-3 text-sm font-semibold text-rose-700">{error}</p> : null}</CardContent></Card>
    {loading ? <div className="grid min-h-40 place-items-center"><LoaderCircle className="animate-spin text-stone-500" size={28} /></div> : null}
    {order ? <Card className="mt-6"><CardContent className="p-6"><div className="flex flex-wrap items-start justify-between gap-3 border-b border-stone-100 pb-4"><div><p className="font-black text-stone-950">{order.shipment?.trackingCode}</p><p className="mt-1 text-sm text-stone-500">Đơn {order.orderCode} · {order.shipment?.carrier ?? "Đơn vị vận chuyển"}</p></div><Badge className="bg-stone-900 text-white">{order.shipment?.status}</Badge></div><div className="mt-5 grid gap-4 md:grid-cols-[1fr_auto]"><p className="font-bold text-stone-950">{order.items.map((item) => `${item.productName} x ${item.quantity} ${item.unit}`).join(", ")}</p><p className="font-black text-[var(--coffee)]">{formatVnd(order.totalAmount)}</p></div><div className="mt-5 grid gap-3 border-t border-stone-100 pt-4 text-sm text-stone-700 md:grid-cols-2"><p className="flex items-center gap-2"><CreditCard size={16} /> {order.payment ? `${order.payment.method} · ${order.payment.status}` : "Chưa có thông tin thanh toán"}</p><p className="flex items-center gap-2"><Truck size={16} /> {order.shipment?.deliveredAt ? "Đã giao hàng" : order.shipment?.shippedAt ? "Đã bàn giao vận chuyển" : "Đang chuẩn bị giao"}</p></div></CardContent></Card> : null}
    {!order && !loading && !error ? <div className="mt-8 flex items-center justify-center gap-2 text-sm font-semibold text-stone-500"><PackageSearch size={18} /> Mã vận đơn được cập nhật khi đơn hàng được bàn giao vận chuyển.</div> : null}
  </section></main>;
}
