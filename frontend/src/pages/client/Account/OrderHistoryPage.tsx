import { Ban, CreditCard, Eye, LoaderCircle, PackageCheck, RotateCcw, Star, Truck, X } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
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
  const [reviewTarget, setReviewTarget] = useState<{ orderId: number; item: CustomerOrderHistory["items"][number] } | null>(null);
  const [requestTarget, setRequestTarget] = useState<{ order: CustomerOrderHistory; mode: "CANCEL" | "RETURN" } | null>(null);

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
          <div className="flex flex-wrap items-center gap-2 md:justify-end"><p className="mr-1 font-black text-[var(--coffee)]">{formatVnd(order.totalAmount)}</p>{order.status === "PENDING" ? <Button type="button" variant="outline" className="h-9 px-3 text-xs text-red-700 hover:bg-red-50" onClick={() => setRequestTarget({ order, mode: "CANCEL" })}><Ban size={15} /> Hủy đơn</Button> : null}{order.status === "COMPLETED" && !order.returnRequest ? <Button type="button" variant="outline" className="h-9 px-3 text-xs" onClick={() => setRequestTarget({ order, mode: "RETURN" })}><RotateCcw size={15} /> Đổi / trả</Button> : null}<Button type="button" variant="outline" className="h-9 px-3 text-xs" onClick={() => setSelectedOrder(order)}><Eye size={15} /> Xem chi tiết</Button></div>
        </div>
        <div className="mt-4 grid gap-2 border-t border-stone-100 pt-4 text-xs font-semibold text-stone-600 md:grid-cols-2">
          <p className="flex items-center gap-2"><CreditCard size={15} /> {order.payment ? `${order.payment.method} · ${order.payment.status}` : "Chưa có thông tin thanh toán"}</p>
          <p className="flex items-center gap-2"><Truck size={15} /> {order.shipment ? `${order.shipment.status}${order.shipment.trackingCode ? ` · ${order.shipment.trackingCode}` : ""}` : "Chờ tạo vận đơn"}</p>
        </div>
        {order.status === "COMPLETED" ? <p className="mt-3 flex items-center gap-2 text-xs font-bold text-emerald-700"><PackageCheck size={15} /> Đơn hàng đã hoàn tất.</p> : null}
        {order.returnRequest ? <p className="mt-3 flex items-center gap-2 rounded-lg bg-amber-50 p-3 text-xs font-bold text-amber-800"><RotateCcw size={15} /> Yêu cầu {order.returnRequest.type === "EXCHANGE" ? "đổi hàng" : order.returnRequest.type === "REFUND" ? "hoàn tiền" : "trả hàng"}: {returnStatusLabel(order.returnRequest.status)}</p> : null}
      </article>)}
    </section>
    {selectedOrder ? <OrderDetail order={selectedOrder} onClose={() => setSelectedOrder(null)} onReview={(item) => setReviewTarget({ orderId: selectedOrder.id, item })} /> : null}
    {reviewTarget ? <ReviewDialog target={reviewTarget} onClose={() => setReviewTarget(null)} onCreated={(review) => {
      setOrders((current) => current.map((order) => order.id !== reviewTarget.orderId ? order : ({ ...order, items: order.items.map((item) => item.id !== reviewTarget.item.id ? item : { ...item, review }) })));
      setSelectedOrder((current) => current && current.id === reviewTarget.orderId ? ({ ...current, items: current.items.map((item) => item.id !== reviewTarget.item.id ? item : { ...item, review }) }) : current);
      setReviewTarget(null);
    }} /> : null}
    {requestTarget ? <OrderRequestDialog target={requestTarget} onClose={() => setRequestTarget(null)} onUpdated={(value) => {
      setOrders((current) => current.map((order) => order.id !== requestTarget.order.id ? order : requestTarget.mode === "CANCEL" ? { ...order, status: "CANCELLED" } : { ...order, returnRequest: value }));
      setRequestTarget(null);
    }} /> : null}
  </AccountPageShell>;
}

function returnStatusLabel(status: NonNullable<CustomerOrderHistory["returnRequest"]>["status"]) {
  return ({ REQUESTED: "Đã tiếp nhận", REVIEWING: "Đang xem xét", APPROVED: "Đã duyệt", REJECTED: "Bị từ chối", COMPLETED: "Đã xử lý", CANCELLED: "Đã hủy" } as const)[status];
}

function OrderDetail({ order, onClose, onReview }: { order: CustomerOrderHistory; onClose: () => void; onReview: (item: CustomerOrderHistory["items"][number]) => void }) {
  return <div className="fixed inset-0 z-50 grid place-items-center bg-black/45 p-4" role="dialog" aria-modal="true" aria-label={`Chi tiết đơn ${order.orderCode}`}>
    <article className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
      <div className="flex items-start justify-between gap-4 border-b border-stone-100 pb-4"><div><p className="text-lg font-black text-stone-950">Chi tiết {order.orderCode}</p><p className="mt-1 text-sm text-stone-500">{new Intl.DateTimeFormat("vi-VN", { dateStyle: "medium", timeStyle: "short" }).format(new Date(order.createdAt))}</p></div><Button type="button" variant="outline" size="icon" onClick={onClose} aria-label="Đóng"><X size={18} /></Button></div>
      <div className="mt-5 space-y-3">{order.items.map((item) => <div key={item.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-stone-50 p-3 text-sm"><div><p className="font-bold text-stone-900">{item.productName}</p><p className="mt-1 text-stone-600">{item.quantity} {item.unit}</p></div>{order.status === "COMPLETED" ? item.review ? <span className="flex items-center gap-1 text-xs font-bold text-amber-700"><Star size={14} className="fill-amber-400 text-amber-400" /> {item.review.rating}/5 · {item.review.status === "APPROVED" ? "Đã duyệt" : item.review.status === "REJECTED" ? "Bị từ chối" : "Chờ duyệt"}</span> : <Button type="button" variant="outline" className="h-9 text-xs" onClick={() => onReview(item)}><Star size={15} /> Đánh giá</Button> : null}</div>)}</div>
      <div className="mt-5 grid gap-3 border-t border-stone-100 pt-5 text-sm"><p className="flex justify-between gap-4"><span className="text-stone-500">Trạng thái đơn</span><strong>{labels[order.status]}</strong></p><p className="flex justify-between gap-4"><span className="text-stone-500">Thanh toán</span><strong>{order.payment ? `${order.payment.method} · ${order.payment.status}` : "Chưa có"}</strong></p><p className="flex justify-between gap-4"><span className="text-stone-500">Vận chuyển</span><strong>{order.shipment ? `${order.shipment.status}${order.shipment.trackingCode ? ` · ${order.shipment.trackingCode}` : ""}` : "Chờ tạo vận đơn"}</strong></p><p className="flex justify-between gap-4 border-t border-stone-100 pt-4 text-base"><span className="font-bold text-stone-900">Tổng tiền</span><strong className="text-[var(--coffee)]">{formatVnd(order.totalAmount)}</strong></p></div>
    </article>
  </div>;
}

function ReviewDialog({ target, onClose, onCreated }: { target: { orderId: number; item: CustomerOrderHistory["items"][number] }; onClose: () => void; onCreated: (review: NonNullable<CustomerOrderHistory["items"][number]["review"]>) => void }) {
  const [rating, setRating] = useState(5);
  const [content, setContent] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    try { onCreated(await profileApi.createReview({ orderId: target.orderId, productId: target.item.productId, rating, content: content.trim() || undefined })); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Không thể gửi đánh giá."); }
    finally { setSubmitting(false); }
  }

  return <div className="fixed inset-0 z-[60] grid place-items-center bg-black/45 p-4" role="dialog" aria-modal="true" aria-label="Đánh giá sản phẩm"><form onSubmit={submit} className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
    <div className="flex items-start justify-between gap-4"><div><h2 className="text-xl font-black text-stone-950">Đánh giá sản phẩm</h2><p className="mt-1 text-sm text-stone-500">{target.item.productName}</p></div><Button type="button" variant="outline" size="icon" onClick={onClose} aria-label="Đóng"><X size={18} /></Button></div>
    <div className="mt-6 flex gap-2" aria-label="Chọn số sao">{Array.from({ length: 5 }, (_, index) => <button key={index} type="button" onClick={() => setRating(index + 1)} className="p-1" aria-label={`${index + 1} sao`}><Star size={28} className={index < rating ? "fill-amber-400 text-amber-400" : "text-stone-300"} /></button>)}</div>
    <textarea value={content} onChange={(event) => setContent(event.target.value)} maxLength={1000} className="mt-5 min-h-28 w-full rounded-xl border border-stone-200 p-3 text-sm outline-none focus:border-[var(--coffee)]" placeholder="Chia sẻ cảm nhận về chất lượng, hương vị và đóng gói..." />
    {error ? <p className="mt-3 text-sm font-bold text-red-700">{error}</p> : null}<Button type="submit" className="mt-5 w-full" disabled={submitting}>{submitting ? "Đang gửi..." : "Gửi đánh giá"}</Button>
  </form></div>;
}

function OrderRequestDialog({ target, onClose, onUpdated }: { target: { order: CustomerOrderHistory; mode: "CANCEL" | "RETURN" }; onClose: () => void; onUpdated: (request: CustomerOrderHistory["returnRequest"]) => void }) {
  const [type, setType] = useState<"RETURN" | "EXCHANGE" | "REFUND">("RETURN");
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      if (target.mode === "CANCEL") {
        await profileApi.cancelOrder(target.order.id, reason);
        onUpdated(null);
      } else {
        onUpdated(await profileApi.createReturnRequest(target.order.id, { type, reason }));
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Không thể gửi yêu cầu.");
    } finally {
      setSubmitting(false);
    }
  }

  return <div className="fixed inset-0 z-[60] grid place-items-center bg-black/45 p-4" role="dialog" aria-modal="true"><form onSubmit={submit} className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
    <div className="flex items-start justify-between gap-4"><div><h2 className="text-xl font-black text-stone-950">{target.mode === "CANCEL" ? "Hủy đơn hàng" : "Yêu cầu đổi / trả"}</h2><p className="mt-1 text-sm text-stone-500">Đơn {target.order.orderCode}</p></div><Button type="button" variant="outline" size="icon" onClick={onClose} aria-label="Đóng"><X size={18} /></Button></div>
    {target.mode === "RETURN" ? <div className="mt-5 grid grid-cols-3 gap-2">{([ ["RETURN", "Trả hàng"], ["EXCHANGE", "Đổi hàng"], ["REFUND", "Hoàn tiền"] ] as const).map(([value, label]) => <button key={value} type="button" onClick={() => setType(value)} className={`rounded-lg border p-2 text-xs font-bold ${type === value ? "border-[var(--coffee)] bg-stone-100 text-[var(--coffee)]" : "border-stone-200 text-stone-600"}`}>{label}</button>)}</div> : <p className="mt-5 rounded-xl bg-red-50 p-3 text-sm text-red-800">Đơn đang chờ xác nhận. Sản phẩm sẽ được hoàn lại tồn kho sau khi hủy.</p>}
    <textarea required minLength={target.mode === "CANCEL" ? 5 : 10} maxLength={1000} value={reason} onChange={(event) => setReason(event.target.value)} className="mt-5 min-h-28 w-full rounded-xl border border-stone-200 p-3 text-sm outline-none focus:border-[var(--coffee)]" placeholder={target.mode === "CANCEL" ? "Lý do hủy đơn..." : "Mô tả sản phẩm và lý do cần đổi/trả..."} />
    {error ? <p className="mt-3 text-sm font-bold text-red-700">{error}</p> : null}<Button type="submit" className="mt-5 w-full" disabled={submitting}>{submitting ? "Đang gửi..." : target.mode === "CANCEL" ? "Xác nhận hủy đơn" : "Gửi yêu cầu"}</Button>
  </form></div>;
}
