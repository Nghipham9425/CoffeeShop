import { useCallback, useEffect, useMemo, useState } from "react";
import { CheckCircle2, CircleX, CreditCard, Eye, PackageCheck, RefreshCw, Truck, X } from "lucide-react";
import { AdminPanel } from "../../../components/admin/AdminPanel";
import { AdminStatusBadge } from "../../../components/admin/AdminStatusBadge";
import { Button } from "../../../components/ui/button";
import { useAdminOutlet } from "../../../layouts/AdminLayout";
import { adminApi, formatCurrency, formatDate, type AdminOrder } from "../../../lib/adminApi";
import { EmptyState, ErrorState, LoadingState } from "../shared/ApiState";
import { AdminPageShell } from "../shared/AdminPageShell";

const orderColumns: Array<{ status: AdminOrder["status"]; title: string; description: string }> = [
  { status: "PENDING", title: "Chờ xác nhận", description: "Đơn mới cần kiểm tra" },
  { status: "CONFIRMED", title: "Đã xác nhận", description: "Chờ chuẩn bị hàng" },
  { status: "PACKING", title: "Đang đóng gói", description: "Kho đang xử lý" },
  { status: "SHIPPING", title: "Đang giao", description: "Đã bàn giao vận chuyển" },
  { status: "COMPLETED", title: "Hoàn tất", description: "Đơn giao thành công" },
  { status: "CANCELLED", title: "Đã hủy", description: "Đơn không tiếp tục xử lý" },
];
const nextOrderStep: Partial<Record<AdminOrder["status"], { status: AdminOrder["status"]; label: string }>> = {
  PENDING: { status: "CONFIRMED", label: "Xác nhận đơn" },
  CONFIRMED: { status: "PACKING", label: "Bắt đầu đóng gói" },
  PACKING: { status: "SHIPPING", label: "Chuyển sang giao hàng" },
  SHIPPING: { status: "COMPLETED", label: "Hoàn tất đơn" },
};

const nextShipmentStep: Partial<Record<NonNullable<AdminOrder["shipment"]>["status"], { status: NonNullable<AdminOrder["shipment"]>["status"]; label: string }>> = {
  WAITING: { status: "PACKED", label: "Đã đóng gói" },
  PACKED: { status: "SHIPPED", label: "Bàn giao vận chuyển" },
  SHIPPED: { status: "DELIVERED", label: "Xác nhận đã giao" },
};

export function OrdersPage() {
  const { token, sessionVersion } = useAdminOutlet();
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [keyword, setKeyword] = useState("");
  const [activeColumn, setActiveColumn] = useState<AdminOrder["status"]>("PENDING");
  const [loading, setLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null);
  const [error, setError] = useState("");

  const totalRevenue = useMemo(() => orders.reduce((sum, order) => sum + order.totalAmount, 0), [orders]);

  const loadOrders = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError("");

    try {
      const result = await adminApi.orders(token, { keyword });
      setOrders(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không tải được đơn hàng");
    } finally {
      setLoading(false);
    }
  }, [keyword, token]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders, sessionVersion]);

  async function updateOrderStatus(order: AdminOrder, nextStatus: AdminOrder["status"]) {
    if (!token) return;
    const cancelReason = nextStatus === "CANCELLED" ? window.prompt("Lý do hủy đơn:", order.cancelReason ?? "") ?? undefined : undefined;

    setUpdatingId(order.id);
    setError("");
    try {
      const updated = await adminApi.updateOrderStatus(token, order.id, { status: nextStatus, cancelReason });
      setOrders((current) => current.map((item) => (item.id === updated.id ? updated : item)));
      setActiveColumn(nextStatus);
      setSelectedOrder(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không cập nhật được đơn hàng");
    } finally {
      setUpdatingId(null);
    }
  }

  async function updatePayment(order: AdminOrder, paymentId: number, nextStatus: AdminOrder["payments"][number]["status"]) {
    if (!token) return;
    const transactionCode = nextStatus === "PAID" ? window.prompt("Mã giao dịch:", "") ?? undefined : undefined;

    setUpdatingId(order.id);
    setError("");
    try {
      await adminApi.updatePaymentStatus(token, paymentId, { status: nextStatus, transactionCode });
      await loadOrders();
      setSelectedOrder(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không cập nhật được thanh toán");
    } finally {
      setUpdatingId(null);
    }
  }

  async function updateShipment(order: AdminOrder, nextStatus: NonNullable<AdminOrder["shipment"]>["status"]) {
    if (!token) return;
    const needsDeliveryInfo = nextStatus === "PACKED" && !order.shipment?.trackingCode;
    const carrier = needsDeliveryInfo ? window.prompt("Đơn vị vận chuyển:", order.shipment?.carrier ?? "GHN") ?? undefined : order.shipment?.carrier ?? undefined;
    const trackingCode = needsDeliveryInfo ? window.prompt("Mã vận đơn:", "") ?? undefined : order.shipment?.trackingCode ?? undefined;

    setUpdatingId(order.id);
    setError("");
    try {
      await adminApi.upsertShipment(token, order.id, { status: nextStatus, carrier, trackingCode });
      await loadOrders();
      setSelectedOrder(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không cập nhật được giao nhận");
    } finally {
      setUpdatingId(null);
    }
  }

  async function cancelOrder(order: AdminOrder) {
    if (!window.confirm(`Hủy đơn ${order.orderCode}?`)) return;
    await updateOrderStatus(order, "CANCELLED");
  }

  const activeColumnInfo = orderColumns.find((column) => column.status === activeColumn)!;
  const visibleOrders = orders.filter((order) => order.status === activeColumn);

  return (
    <AdminPageShell
      title="Quản lý đơn hàng"
      description="Theo dõi đơn B2C, trạng thái thanh toán và giao nhận cho khách mua lẻ."
    >
      {error ? <ErrorState message={error} /> : null}

      <div className="grid gap-4 md:grid-cols-3">
        <AdminPanel title="Tổng đơn đang xem" description="Theo bộ lọc hiện tại.">
          <p className="p-5 text-3xl font-black text-[#553B2F]">{orders.length}</p>
        </AdminPanel>
        <AdminPanel title="Doanh thu đơn đang xem" description="Tổng tiền các đơn trong bảng.">
          <p className="p-5 text-3xl font-black text-[#553B2F]">{formatCurrency(totalRevenue)}</p>
        </AdminPanel>
        <AdminPanel title="Đơn chờ xử lý" description="Cần nhân viên xác nhận.">
          <p className="p-5 text-3xl font-black text-[#553B2F]">{orders.filter((order) => order.status === "PENDING").length}</p>
        </AdminPanel>
      </div>

      <AdminPanel
        title="Tiến độ xử lý đơn hàng"
        description="Mỗi đơn nằm trong đúng cột trạng thái. Khi xử lý bước kế tiếp, đơn sẽ tự chuyển sang cột tương ứng."
        action={
          <Button onClick={loadOrders} disabled={loading} className="rounded-lg bg-[#553B2F] text-white hover:bg-[#3f2a21]">
            <RefreshCw size={16} />
            Tải lại
          </Button>
        }
      >
        <div className="grid gap-3 border-b border-[#E8D3C7] p-5 md:grid-cols-[1fr_auto]">
          <input
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            placeholder="Tìm mã đơn, tên, số điện thoại..."
            className="rounded-lg border border-[#C7A792] px-4 py-2 text-sm font-semibold outline-none focus:border-[#553B2F]"
          />
          <Button onClick={loadOrders} className="rounded-lg bg-[#AA7864] text-white hover:bg-[#8d604f]">
            Tìm
          </Button>
        </div>

        {loading ? (
          <LoadingState />
        ) : orders.length ? (
          <div className="p-5">
            <div className="grid grid-cols-2 gap-2 border-b border-[#E8D3C7] pb-5 md:grid-cols-3 xl:grid-cols-6">
              {orderColumns.map((column) => {
                const count = orders.filter((order) => order.status === column.status).length;
                const isActive = activeColumn === column.status;

                return (
                  <button
                    key={column.status}
                    type="button"
                    onClick={() => setActiveColumn(column.status)}
                    className={`rounded-lg border p-3 text-left transition ${
                      isActive
                        ? "border-[#553B2F] bg-[#553B2F] text-white shadow-sm"
                        : "border-[#E8D3C7] bg-[#f8f2ed] text-[#553B2F] hover:border-[#AA7864] hover:bg-white"
                    }`}
                  >
                    <span className="flex items-center justify-between gap-2 text-sm font-black">
                      {column.title}
                      <span className={`grid h-6 min-w-6 place-items-center rounded-full px-1 text-xs ${isActive ? "bg-white/20" : "bg-white"}`}>{count}</span>
                    </span>
                    <span className={`mt-1 block text-xs font-semibold ${isActive ? "text-white/75" : "text-[#7a5547]"}`}>{column.description}</span>
                  </button>
                );
              })}
            </div>

            <div className="mt-6 flex items-end justify-between gap-4">
              <div>
                <h3 className="text-lg font-black text-[#553B2F]">{activeColumnInfo.title}</h3>
                <p className="mt-1 text-sm font-semibold text-[#7a5547]">{activeColumnInfo.description}</p>
              </div>
              <p className="text-sm font-black text-[#AA7864]">{visibleOrders.length} đơn hàng</p>
            </div>

            {visibleOrders.length ? (
              <div className="mt-4 grid gap-3">
                {visibleOrders.map((order) => (
                  <OrderSummaryCard
                    key={order.id}
                    order={order}
                    onViewDetails={() => setSelectedOrder(order)}
                  />
                ))}
              </div>
            ) : <p className="py-12 text-center text-sm font-bold text-[#AA7864]">Chưa có đơn hàng ở trạng thái này.</p>}
          </div>
        ) : (
          <EmptyState message="Chưa có đơn hàng phù hợp." />
        )}
      </AdminPanel>

      {selectedOrder ? (
        <OrderDetailDialog
          order={selectedOrder}
          isUpdating={updatingId === selectedOrder.id}
          onClose={() => setSelectedOrder(null)}
          onUpdateOrder={updateOrderStatus}
          onUpdatePayment={updatePayment}
          onUpdateShipment={updateShipment}
          onCancel={cancelOrder}
        />
      ) : null}
    </AdminPageShell>
  );
}

function OrderSummaryCard({ order, onViewDetails }: { order: AdminOrder; onViewDetails: () => void }) {
  const primaryItem = order.items[0];
  const payment = order.payments[0];

  return (
    <article className="grid gap-4 rounded-lg border border-[#E8D3C7] bg-white p-4 shadow-sm lg:grid-cols-[170px_1.2fr_1fr_auto_auto] lg:items-center">
      <div>
        <p className="font-black text-[#553B2F]">{order.orderCode}</p>
        <p className="mt-1 text-xs font-bold text-[#AA7864]">{formatDate(order.createdAt)}</p>
      </div>
      <div>
        <p className="font-black text-[#553B2F]">{order.customerName}</p>
        <p className="mt-1 text-sm font-semibold text-[#7a5547]">{order.customerPhone}</p>
      </div>
      <div className="text-sm text-[#7a5547]">
        <p className="font-bold text-[#553B2F]">{primaryItem ? `${primaryItem.productName} x ${primaryItem.quantity} ${primaryItem.unit}` : "Không có sản phẩm"}</p>
        {order.items.length > 1 ? <p className="mt-1 text-xs font-semibold">+ {order.items.length - 1} sản phẩm khác</p> : null}
      </div>
      <div className="lg:text-right">
        <p className="font-black text-[#553B2F]">{formatCurrency(order.totalAmount)}</p>
        {payment ? <p className="mt-1 text-xs font-bold text-[#7a5547]">{payment.method} · {payment.status}</p> : null}
      </div>
      <div className="flex items-center gap-3 lg:justify-end">
        <AdminStatusBadge status={order.status} />
        <Button variant="outline" onClick={onViewDetails} className="h-9 rounded-md border-[#C7A792] px-3 text-xs text-[#553B2F] hover:bg-[#f8f2ed]">
          <Eye size={15} /> Xem chi tiết
        </Button>
      </div>
    </article>
  );
}

function OrderDetailDialog({
  order,
  isUpdating,
  onClose,
  onUpdateOrder,
  onUpdatePayment,
  onUpdateShipment,
  onCancel,
}: {
  order: AdminOrder;
  isUpdating: boolean;
  onClose: () => void;
  onUpdateOrder: (order: AdminOrder, status: AdminOrder["status"]) => Promise<void>;
  onUpdatePayment: (order: AdminOrder, paymentId: number, status: AdminOrder["payments"][number]["status"]) => Promise<void>;
  onUpdateShipment: (order: AdminOrder, status: NonNullable<AdminOrder["shipment"]>["status"]) => Promise<void>;
  onCancel: (order: AdminOrder) => Promise<void>;
}) {
  const shipmentStatus = order.shipment?.status ?? "WAITING";
  const shipmentAction = nextShipmentStep[shipmentStatus];
  const orderAction = nextOrderStep[order.status];

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/45 p-4" role="dialog" aria-modal="true" aria-label={`Chi tiết ${order.orderCode}`}>
      <article className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl border border-[#E8D3C7] bg-white p-5 shadow-xl">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="font-black text-[#553B2F]">Chi tiết đơn {order.orderCode}</p>
            <p className="mt-1 text-xs font-bold text-[#AA7864]">{formatDate(order.createdAt)}</p>
          </div>
          <Button variant="outline" size="icon" onClick={onClose} className="h-9 w-9 rounded-md border-[#E8D3C7] text-[#553B2F] hover:bg-[#f8f2ed]" aria-label="Đóng chi tiết đơn hàng">
            <X size={18} />
          </Button>
        </div>

      <div className="mt-4 border-t border-[#f0e2da] pt-3 text-sm">
        <p className="font-black text-[#553B2F]">{order.customerName}</p>
        <p className="mt-1 font-semibold text-[#7a5547]">{order.customerPhone}</p>
        <p className="mt-3 font-black text-[#553B2F]">{formatCurrency(order.totalAmount)}</p>
      </div>

      <div className="mt-3 border-t border-[#f0e2da] pt-3 text-xs leading-5 text-[#7a5547]">
        {order.items.slice(0, 2).map((item) => <p key={item.id}>{item.productName} x {item.quantity} {item.unit}</p>)}
        {order.items.length > 2 ? <p className="font-bold">+ {order.items.length - 2} sản phẩm khác</p> : null}
      </div>

      {order.payments.map((payment) => (
        <div key={payment.id} className="mt-3 border-t border-[#f0e2da] pt-3">
          <p className="flex items-center gap-1 text-xs font-black text-[#553B2F]"><CreditCard size={14} /> {payment.method}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            <AdminStatusBadge status={payment.status} />
            {payment.status === "PENDING" ? (
              <Button disabled={isUpdating} onClick={() => onUpdatePayment(order, payment.id, "PAID")} className="h-7 rounded-md bg-emerald-700 px-2 text-[11px] text-white hover:bg-emerald-800">
                <CheckCircle2 size={13} /> Đã thu
              </Button>
            ) : null}
            {payment.status === "PAID" ? (
              <Button variant="outline" disabled={isUpdating} onClick={() => onUpdatePayment(order, payment.id, "REFUNDED")} className="h-7 rounded-md border-amber-300 px-2 text-[11px] text-amber-800 hover:bg-amber-50">
                Hoàn tiền
              </Button>
            ) : null}
          </div>
        </div>
      ))}

      <div className="mt-3 border-t border-[#f0e2da] pt-3">
        <p className="flex items-center gap-1 text-xs font-black text-[#553B2F]"><Truck size={14} /> {shipmentStatus}</p>
        <p className="mt-1 text-xs font-semibold text-[#7a5547]">{order.shipment?.trackingCode ?? "Chưa có mã vận đơn"}</p>
        {shipmentAction ? (
          <Button variant="outline" disabled={isUpdating} onClick={() => onUpdateShipment(order, shipmentAction.status)} className="mt-2 h-7 rounded-md border-[#C7A792] px-2 text-[11px] text-[#553B2F] hover:bg-[#f8f2ed]">
            {shipmentAction.label}
          </Button>
        ) : null}
      </div>

      {orderAction ? (
        <Button disabled={isUpdating} onClick={() => onUpdateOrder(order, orderAction.status)} className="mt-4 h-9 w-full rounded-md bg-[#553B2F] px-3 text-xs text-white hover:bg-[#3f2a21]">
          {orderAction.label}
        </Button>
      ) : null}
      {["PENDING", "CONFIRMED"].includes(order.status) ? (
        <Button variant="outline" disabled={isUpdating} onClick={() => onCancel(order)} className="mt-2 h-8 w-full rounded-md border-red-200 px-3 text-xs text-red-700 hover:bg-red-50">
          <CircleX size={14} /> Hủy đơn
        </Button>
      ) : null}
      {order.note ? <p className="mt-3 text-xs font-semibold leading-5 text-[#7a5547]"><PackageCheck className="mr-1 inline" size={13} />{order.note}</p> : null}
      </article>
    </div>
  );
}
