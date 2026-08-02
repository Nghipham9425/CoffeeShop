import { ArrowLeft, ArrowRight, CheckCircle2, CircleX, CreditCard, Truck } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { useCallback, useEffect, useState } from "react";
import { AdminPanel } from "../../../components/admin/AdminPanel";
import { AdminStatusBadge } from "../../../components/admin/AdminStatusBadge";
import { ShipmentHandoffDialog } from "../../../components/admin/ShipmentHandoffDialog";
import { Button } from "../../../components/ui/button";
import { useAdminOutlet } from "../../../layouts/AdminLayout";
import { adminApi, formatCurrency, formatDate, type AdminOrder } from "../../../lib/adminApi";
import { AdminPageShell } from "../shared/AdminPageShell";
import { ErrorState, LoadingState } from "../shared/ApiState";

export function OrderDetailPage() {
  const { id } = useParams();
  const { token } = useAdminOutlet();
  const [order, setOrder] = useState<AdminOrder | null>(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [isHandoffOpen, setIsHandoffOpen] = useState(false);

  const loadOrder = useCallback(async () => {
    if (!token || !id) return;
    try {
      setError("");
      setOrder(await adminApi.order(token, Number(id)));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Không tải được đơn hàng.");
    }
  }, [id, token]);

  useEffect(() => { void loadOrder(); }, [loadOrder]);

  async function updateOrderStatus(status: AdminOrder["status"]) {
    if (!token || !order) return;
    const cancelReason = status === "CANCELLED" ? window.prompt("Lý do hủy đơn hàng:", order.cancelReason ?? "")?.trim() : undefined;
    if (status === "CANCELLED" && !cancelReason) return;
    try {
      setSaving(true); setError("");
      setOrder(await adminApi.updateOrderStatus(token, order.id, { status, cancelReason }));
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Không thể cập nhật trạng thái đơn hàng."); }
    finally { setSaving(false); }
  }

  async function handoffShipment(payload: { carrier: string; trackingCode: string; note?: string }) {
    if (!token || !order) return;
    try {
      setSaving(true); setError("");
      if ((order.shipment?.status ?? "WAITING") === "WAITING") {
        await adminApi.upsertShipment(token, order.id, { status: "PACKED" });
      }
      await adminApi.upsertShipment(token, order.id, { ...payload, status: "SHIPPED" });
      if (order.status === "PACKING") {
        await adminApi.updateOrderStatus(token, order.id, { status: "SHIPPING" });
      }
      setIsHandoffOpen(false);
      await loadOrder();
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Không thể bàn giao đơn vị vận chuyển."); }
    finally { setSaving(false); }
  }

  async function updatePayment(paymentId: number, status: AdminOrder["payments"][number]["status"]) {
    if (!token) return;
    const transactionCode = status === "PAID" ? window.prompt("Mã giao dịch chuyển khoản:", "")?.trim() : undefined;
    try {
      setSaving(true); setError("");
      await adminApi.updatePaymentStatus(token, paymentId, { status, transactionCode });
      await loadOrder();
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Không thể cập nhật thanh toán."); }
    finally { setSaving(false); }
  }

  if (error) return <AdminPageShell title="Chi tiết đơn hàng" description="Thông tin xử lý đơn B2C/B2B."><ErrorState message={error} /></AdminPageShell>;
  if (!order) return <AdminPageShell title="Chi tiết đơn hàng" description="Thông tin xử lý đơn B2C/B2B."><LoadingState /></AdminPageShell>;

  const payment = order.payments[0];
  const orderAction: Partial<Record<AdminOrder["status"], { status: AdminOrder["status"]; label: string }>> = {
    PENDING: { status: "CONFIRMED", label: "Xác nhận đơn" },
    CONFIRMED: { status: "PACKING", label: "Bắt đầu đóng gói" },
    SHIPPING: { status: "COMPLETED", label: "Hoàn tất đơn hàng" },
  };
  const shipmentStatus = order.shipment?.status ?? "WAITING";
  const primaryAction = order.status === "PACKING" && shipmentStatus !== "SHIPPED"
    ? { label: "Bàn giao đơn vị vận chuyển", onClick: () => setIsHandoffOpen(true), icon: Truck }
    : orderAction[order.status]
      ? { label: orderAction[order.status]!.label, onClick: () => void updateOrderStatus(orderAction[order.status]!.status), icon: ArrowRight }
      : null;
  return <AdminPageShell title={`Đơn hàng ${order.orderCode}`} description="Theo dõi khách hàng, dòng hàng, thanh toán và giao nhận trên một màn hình.">
    <div className="mb-5 flex flex-col gap-3 rounded-xl border border-[#E8D3C7] bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between"><div className="flex flex-wrap items-center gap-3"><Button asChild variant="outline" className="border-[#C7A792] text-[#553B2F] hover:bg-[#f8f2ed]"><Link to="/admin/don-hang"><ArrowLeft size={16} />Quay lại danh sách</Link></Button><span className="hidden h-7 border-l border-[#E8D3C7] sm:block" /><div><p className="text-xs font-black uppercase tracking-wide text-[#AA7864]">Thao tác đơn hàng</p><p className="text-sm font-bold text-[#553B2F]">{order.customerName} · {formatCurrency(order.totalAmount)}</p></div></div><div className="flex flex-wrap gap-2">{primaryAction ? <Button disabled={saving} onClick={primaryAction.onClick} className="bg-[#553B2F] text-white hover:bg-[#3c271f]"><primaryAction.icon size={16} />{primaryAction.label}</Button> : null}{["PENDING", "CONFIRMED"].includes(order.status) ? <Button disabled={saving} variant="outline" onClick={() => void updateOrderStatus("CANCELLED")} className="border-red-200 text-red-700 hover:bg-red-50"><CircleX size={16} />Hủy đơn</Button> : null}</div></div>
    {error ? <ErrorState message={error} /> : null}
    <div className="grid gap-5 xl:grid-cols-[1.55fr_1fr]">
      <div className="space-y-5">
        <AdminPanel title="Sản phẩm đặt mua" description={`${order.items.length} dòng hàng · tạo lúc ${formatDate(order.createdAt)}`}>
          <div className="overflow-x-auto"><table className="w-full min-w-[580px] text-left text-sm"><thead className="bg-[#FAF9F6] text-[#7A665D]"><tr><th className="p-4">Sản phẩm</th><th className="p-4">Số lượng</th><th className="p-4">Đơn giá</th><th className="p-4 text-right">Thành tiền</th></tr></thead><tbody className="divide-y divide-[#E8D3C7]/60">{order.items.map((item) => <tr key={item.id}><td className="p-4 font-bold text-[#553B2F]">{item.productName}</td><td className="p-4">{item.quantity} {item.unit}</td><td className="p-4">{formatCurrency(item.unitPrice)}</td><td className="p-4 text-right font-black text-[#553B2F]">{formatCurrency(item.lineTotal)}</td></tr>)}</tbody></table></div>
          <div className="ml-auto grid max-w-sm gap-2 p-5 text-sm"><p className="flex justify-between"><span>Tạm tính</span><strong>{formatCurrency(order.subtotal)}</strong></p><p className="flex justify-between"><span>Phí giao hàng</span><strong>{formatCurrency(order.shippingFee)}</strong></p><p className="flex justify-between"><span>Giảm giá</span><strong>-{formatCurrency(order.discountAmount)}</strong></p><p className="flex justify-between border-t border-[#E8D3C7] pt-3 text-base"><span className="font-black">Tổng thanh toán</span><strong className="text-[#553B2F]">{formatCurrency(order.totalAmount)}</strong></p></div>
        </AdminPanel>
        {order.note ? <AdminPanel title="Ghi chú khách hàng"><p className="p-5 text-sm leading-6 text-[#553B2F]">{order.note}</p></AdminPanel> : null}
      </div>
      <div className="space-y-5">
        <AdminPanel title="Trạng thái xử lý"><div className="space-y-4 p-5"><div className="flex flex-wrap items-center gap-3"><AdminStatusBadge status={order.status} /><span className="text-sm font-semibold text-[#7A665D]">Cập nhật: {formatDate(order.updatedAt)}</span></div>{order.status === "PACKING" && shipmentStatus !== "SHIPPED" ? <p className="rounded-lg bg-[#f8f2ed] p-3 text-xs font-bold leading-5 text-[#7a5547]">Đơn đang đóng gói. Dùng nút bàn giao ở đầu trang để hoàn tất phần giao nhận.</p> : null}{order.status === "SHIPPING" ? <p className="rounded-lg bg-emerald-50 p-3 text-xs font-bold leading-5 text-emerald-800">Đơn đã được bàn giao vận chuyển. Hoàn tất đơn sau khi xác nhận khách đã nhận hàng.</p> : null}</div></AdminPanel>
        <AdminPanel title="Thông tin khách hàng"><dl className="grid gap-4 p-5 text-sm"><Info label="Họ tên" value={order.customerName} /><Info label="Số điện thoại" value={order.customerPhone} /><Info label="Email" value={order.customerEmail ?? "Chưa cung cấp"} /></dl></AdminPanel>
        <AdminPanel title="Thanh toán"><div className="space-y-3 p-5 text-sm">{payment ? <><p className="flex items-center gap-2 font-black text-[#553B2F]"><CreditCard size={17} />{payment.method}</p><Info label="Trạng thái" value={payment.status} /><Info label="Mã giao dịch" value={payment.transactionCode ?? "Chưa có"} /><Info label="Thời điểm thanh toán" value={payment.paidAt ? formatDate(payment.paidAt) : payment.method === "COD" ? "Thu tiền khi giao thành công" : "Chưa thanh toán"} />{payment.status === "PENDING" && payment.method === "BANK_TRANSFER" ? <Button disabled={saving} onClick={() => void updatePayment(payment.id, "PAID")} className="w-full bg-emerald-700 text-white hover:bg-emerald-800"><CheckCircle2 size={16} />Xác nhận đã thu</Button> : null}</> : <p>Chưa có giao dịch thanh toán.</p>}</div></AdminPanel>
        <AdminPanel title="Bàn giao đơn vị vận chuyển"><div className="space-y-3 p-5 text-sm"><p className="flex items-center gap-2 font-black text-[#553B2F]"><Truck size={17} />{order.shipment?.carrier ?? "Chưa bàn giao vận chuyển"}</p><Info label="Mã vận đơn" value={order.shipment?.trackingCode ?? "Chưa cấp"} /><Info label="Trạng thái" value={shipmentStatus === "SHIPPED" ? "Đã bàn giao" : "Chưa bàn giao"} />{shipmentStatus === "SHIPPED" ? <p className="rounded-md bg-emerald-50 p-3 text-xs font-bold leading-5 text-emerald-800">Đơn đã được bàn giao. Hoàn tất đơn sau khi xác nhận khách đã nhận hàng.</p> : null}{order.status !== "PACKING" && shipmentStatus !== "SHIPPED" ? <p className="rounded-md bg-[#f8f2ed] p-3 text-xs font-bold leading-5 text-[#7a5547]">Chuyển đơn sang trạng thái đang đóng gói để hiển thị thao tác bàn giao ở đầu trang.</p> : null}</div></AdminPanel>
      </div>
    </div>
    {isHandoffOpen ? <ShipmentHandoffDialog order={order} saving={saving} onClose={() => setIsHandoffOpen(false)} onSubmit={handoffShipment} /> : null}
  </AdminPageShell>;
}

function Info({ label, value }: { label: string; value: string }) { return <div><dt className="text-xs font-black uppercase text-[#AA7864]">{label}</dt><dd className="mt-1 font-semibold text-[#553B2F]">{value}</dd></div>; }
