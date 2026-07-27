import { CreditCard, Eye, LoaderCircle, PackageCheck, Truck, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import { formatVnd } from "../../../lib/publicApi";
import { profileApi, type CustomerOrderHistory } from "../../../lib/profileApi";
import { AccountPageShell, Alert } from "./AccountPageShell";

const labels: Record<CustomerOrderHistory["status"], string> = {
  PENDING: "Chờ xác nhận", CONFIRMED: "Đã xác nhận", PACKING: "Đang đóng gói",
  SHIPPING: "Đang giao", COMPLETED: "Hoàn tất", CANCELLED: "Đã hủy",
};

export function OrderHistoryPage() {
  const [orders, setOrders] = useState<CustomerOrderHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<CustomerOrderHistory | null>(null);

  useEffect(() => {
    void (async () => {
      try { setOrders(await profileApi.orderHistory()); }
      catch (cause) { setError(cause instanceof Error ? cause.message : "Không tải được lịch sử đơn hàng."); }
      finally { setLoading(false); }
    })();
  }, []);

  return <AccountPageShell title="Lịch sử đơn hàng" description="Theo dõi trạng thái xử lý, thanh toán và giao nhận cho các đơn đã đặt.">
    {error ? <Alert tone="error">{error}</Alert> : null}
    <section className="space-y-4">
      {loading ? <div className="grid min-h-64 place-items-center"><LoaderCircle className="animate-spin text-stone-500" size={28} /></div> : null}
      {!loading && !orders.length ? <div className="rounded-2xl border border-dashed border-stone-300 bg-white p-10 text-center text-sm font-semibold text-stone-500">Bạn chưa có đơn hàng nào được liên kết với tài khoản.</div> : null}
      {orders.map((order) => <article key={order.id} className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-stone-100 pb-4">
          <div><p className="font-black text-stone-950">{order.orderCode}</p><p className="mt-1 text-xs font-semibold text-stone-500">{new Intl.DateTimeFormat("vi-VN", { dateStyle: "medium", timeStyle: "short" }).format(new Date(order.createdAt))}</p></div>
          <Badge className="bg-stone-900 text-white">{labels[order.status]}</Badge>
        </div>
        <div className="mt-4 grid gap-4 text-sm md:grid-cols-[1fr_auto]">
          <div><p className="font-bold text-stone-950">{order.items.slice(0, 2).map((item) => `${item.productName} x ${item.quantity} ${item.unit}`).join(", ")}</p>{order.items.length > 2 ? <p className="mt-1 text-xs text-stone-500">+ {order.items.length - 2} sản phẩm khác</p> : null}</div>
          <div className="flex items-center gap-3 md:justify-end"><p className="font-black text-[var(--coffee)]">{formatVnd(order.totalAmount)}</p><Button type="button" variant="outline" className="h-9 px-3 text-xs" onClick={() => setSelectedOrder(order)}><Eye size={15} /> Xem chi tiết</Button></div>
        </div>
        <div className="mt-4 grid gap-2 border-t border-stone-100 pt-4 text-xs font-semibold text-stone-600 md:grid-cols-2">
          <p className="flex items-center gap-2"><CreditCard size={15} /> {order.payment ? `${order.payment.method} · ${order.payment.status}` : "Chưa có thông tin thanh toán"}</p>
          <p className="flex items-center gap-2"><Truck size={15} /> {order.shipment ? `${order.shipment.status}${order.shipment.trackingCode ? ` · ${order.shipment.trackingCode}` : ""}` : "Chờ tạo vận đơn"}</p>
        </div>
        {order.status === "COMPLETED" ? <p className="mt-3 flex items-center gap-2 text-xs font-bold text-emerald-700"><PackageCheck size={15} /> Đơn hàng đã hoàn tất.</p> : null}
      </article>)}
    </section>
    {selectedOrder ? <OrderDetail order={selectedOrder} onClose={() => setSelectedOrder(null)} /> : null}
  </AccountPageShell>;
}

function OrderDetail({ order, onClose }: { order: CustomerOrderHistory; onClose: () => void }) {
  return <div className="fixed inset-0 z-50 grid place-items-center bg-black/45 p-4" role="dialog" aria-modal="true" aria-label={`Chi tiết đơn ${order.orderCode}`}>
    <article className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
      <div className="flex items-start justify-between gap-4 border-b border-stone-100 pb-4"><div><p className="text-lg font-black text-stone-950">Chi tiết {order.orderCode}</p><p className="mt-1 text-sm text-stone-500">{new Intl.DateTimeFormat("vi-VN", { dateStyle: "medium", timeStyle: "short" }).format(new Date(order.createdAt))}</p></div><Button type="button" variant="outline" size="icon" onClick={onClose} aria-label="Đóng"><X size={18} /></Button></div>
      <div className="mt-5 space-y-3">{order.items.map((item) => <div key={item.id} className="flex items-center justify-between gap-4 rounded-xl bg-stone-50 p-3 text-sm"><p className="font-bold text-stone-900">{item.productName}</p><p className="shrink-0 text-stone-600">{item.quantity} {item.unit}</p></div>)}</div>
      <div className="mt-5 grid gap-3 border-t border-stone-100 pt-5 text-sm"><p className="flex justify-between gap-4"><span className="text-stone-500">Trạng thái đơn</span><strong>{labels[order.status]}</strong></p><p className="flex justify-between gap-4"><span className="text-stone-500">Thanh toán</span><strong>{order.payment ? `${order.payment.method} · ${order.payment.status}` : "Chưa có"}</strong></p><p className="flex justify-between gap-4"><span className="text-stone-500">Vận chuyển</span><strong>{order.shipment ? `${order.shipment.status}${order.shipment.trackingCode ? ` · ${order.shipment.trackingCode}` : ""}` : "Chờ tạo vận đơn"}</strong></p><p className="flex justify-between gap-4 border-t border-stone-100 pt-4 text-base"><span className="font-bold text-stone-900">Tổng tiền</span><strong className="text-[var(--coffee)]">{formatVnd(order.totalAmount)}</strong></p></div>
    </article>
  </div>;
}
