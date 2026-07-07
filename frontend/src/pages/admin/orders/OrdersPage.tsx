import { useCallback, useEffect, useMemo, useState } from "react";
import { CreditCard, PackageCheck, RefreshCw, Truck } from "lucide-react";
import { AdminPanel } from "../../../components/admin/AdminPanel";
import { AdminStatusBadge } from "../../../components/admin/AdminStatusBadge";
import { Button } from "../../../components/ui/button";
import { useAdminOutlet } from "../../../layouts/AdminLayout";
import { adminApi, formatCurrency, formatDate, type AdminOrder } from "../../../lib/adminApi";
import { EmptyState, ErrorState, LoadingState } from "../shared/ApiState";
import { AdminPageShell } from "../shared/AdminPageShell";

const orderStatuses: AdminOrder["status"][] = ["PENDING", "CONFIRMED", "PACKING", "SHIPPING", "COMPLETED", "CANCELLED"];
const paymentStatuses: AdminOrder["payments"][number]["status"][] = ["PENDING", "PAID", "FAILED", "REFUNDED"];
const shipmentStatuses: NonNullable<AdminOrder["shipment"]>["status"][] = ["WAITING", "PACKED", "SHIPPED", "DELIVERED", "RETURNED"];

export function OrdersPage() {
  const { token, sessionVersion } = useAdminOutlet();
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [keyword, setKeyword] = useState("");
  const [status, setStatus] = useState<"" | AdminOrder["status"]>("");
  const [loading, setLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [error, setError] = useState("");

  const totalRevenue = useMemo(() => orders.reduce((sum, order) => sum + order.totalAmount, 0), [orders]);

  const loadOrders = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError("");

    try {
      const result = await adminApi.orders(token, { keyword, status: status || undefined });
      setOrders(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không tải được đơn hàng");
    } finally {
      setLoading(false);
    }
  }, [keyword, status, token]);

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
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không cập nhật được thanh toán");
    } finally {
      setUpdatingId(null);
    }
  }

  async function updateShipment(order: AdminOrder, nextStatus: NonNullable<AdminOrder["shipment"]>["status"]) {
    if (!token) return;
    const carrier = window.prompt("Đơn vị vận chuyển:", order.shipment?.carrier ?? "GHN") ?? undefined;
    const trackingCode = window.prompt("Mã vận đơn:", order.shipment?.trackingCode ?? "") ?? undefined;

    setUpdatingId(order.id);
    setError("");
    try {
      await adminApi.upsertShipment(token, order.id, { status: nextStatus, carrier, trackingCode });
      await loadOrders();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không cập nhật được giao nhận");
    } finally {
      setUpdatingId(null);
    }
  }

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
        title="Danh sách đơn hàng"
        description="Lọc nhanh theo mã đơn, khách hàng hoặc trạng thái."
        action={
          <Button onClick={loadOrders} disabled={loading} className="rounded-lg bg-[#553B2F] text-white hover:bg-[#3f2a21]">
            <RefreshCw size={16} />
            Tải lại
          </Button>
        }
      >
        <div className="grid gap-3 border-b border-[#E8D3C7] p-5 md:grid-cols-[1fr_220px_auto]">
          <input
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            placeholder="Tìm mã đơn, tên, số điện thoại..."
            className="rounded-lg border border-[#C7A792] px-4 py-2 text-sm font-semibold outline-none focus:border-[#553B2F]"
          />
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value as "" | AdminOrder["status"])}
            className="rounded-lg border border-[#C7A792] px-4 py-2 text-sm font-semibold outline-none focus:border-[#553B2F]"
          >
            <option value="">Tất cả trạng thái</option>
            {orderStatuses.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
          <Button onClick={loadOrders} className="rounded-lg bg-[#AA7864] text-white hover:bg-[#8d604f]">
            Tìm
          </Button>
        </div>

        {loading ? (
          <LoadingState />
        ) : orders.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] text-left text-sm">
              <thead className="bg-[#E8D3C7]/70 text-xs uppercase text-[#553B2F]">
                <tr>
                  <th className="px-5 py-3">Đơn hàng</th>
                  <th className="px-5 py-3">Khách hàng</th>
                  <th className="px-5 py-3">Sản phẩm</th>
                  <th className="px-5 py-3">Thanh toán</th>
                  <th className="px-5 py-3">Giao nhận</th>
                  <th className="px-5 py-3">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8D3C7]">
                {orders.map((order) => (
                  <tr key={order.id} className="align-top">
                    <td className="px-5 py-4">
                      <p className="font-black text-[#553B2F]">{order.orderCode}</p>
                      <p className="mt-1 text-xs font-bold text-[#AA7864]">{formatDate(order.createdAt)}</p>
                      <p className="mt-2 font-black text-[#553B2F]">{formatCurrency(order.totalAmount)}</p>
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-bold text-[#553B2F]">{order.customerName}</p>
                      <p className="text-[#7a5547]">{order.customerPhone}</p>
                      <p className="text-[#7a5547]">{order.customerEmail ?? "Không có email"}</p>
                    </td>
                    <td className="px-5 py-4">
                      {order.items.map((item) => (
                        <p key={item.id} className="mb-1 text-[#7a5547]">
                          {item.productName} x {item.quantity} {item.unit}
                        </p>
                      ))}
                    </td>
                    <td className="px-5 py-4">
                      {order.payments.map((payment) => (
                        <div key={payment.id} className="mb-3 space-y-2">
                          <p className="font-bold text-[#553B2F]">
                            <CreditCard className="mr-1 inline" size={14} />
                            {payment.method} - {payment.status}
                          </p>
                          <select
                            value={payment.status}
                            disabled={updatingId === order.id}
                            onChange={(event) => updatePayment(order, payment.id, event.target.value as AdminOrder["payments"][number]["status"])}
                            className="rounded-md border border-[#C7A792] px-2 py-1 text-xs font-bold"
                          >
                            {paymentStatuses.map((item) => (
                              <option key={item} value={item}>
                                {item}
                              </option>
                            ))}
                          </select>
                        </div>
                      ))}
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-bold text-[#553B2F]">
                        <Truck className="mr-1 inline" size={14} />
                        {order.shipment?.status ?? "WAITING"}
                      </p>
                      <p className="text-xs font-semibold text-[#7a5547]">{order.shipment?.trackingCode ?? "Chưa có mã vận đơn"}</p>
                      <select
                        value={order.shipment?.status ?? "WAITING"}
                        disabled={updatingId === order.id}
                        onChange={(event) => updateShipment(order, event.target.value as NonNullable<AdminOrder["shipment"]>["status"])}
                        className="mt-2 rounded-md border border-[#C7A792] px-2 py-1 text-xs font-bold"
                      >
                        {shipmentStatuses.map((item) => (
                          <option key={item} value={item}>
                            {item}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-5 py-4">
                      <AdminStatusBadge status={order.status} />
                      <select
                        value={order.status}
                        disabled={updatingId === order.id}
                        onChange={(event) => updateOrderStatus(order, event.target.value as AdminOrder["status"])}
                        className="mt-3 block rounded-md border border-[#C7A792] px-2 py-1 text-xs font-bold"
                      >
                        {orderStatuses.map((item) => (
                          <option key={item} value={item}>
                            {item}
                          </option>
                        ))}
                      </select>
                      <p className="mt-2 text-xs font-semibold text-[#7a5547]">
                        <PackageCheck className="mr-1 inline" size={14} />
                        {order.note ?? "Không có ghi chú"}
                      </p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState message="Chưa có đơn hàng phù hợp." />
        )}
      </AdminPanel>
    </AdminPageShell>
  );
}
