import { useCallback, useEffect, useState } from "react";
import { BarChart3, Boxes, ClipboardList, RefreshCw, UsersRound } from "lucide-react";
import { AdminMetricCard } from "../../../components/admin/AdminMetricCard";
import { AdminPanel } from "../../../components/admin/AdminPanel";
import { AdminStatusBadge } from "../../../components/admin/AdminStatusBadge";
import { Button } from "../../../components/ui/button";
import { useAdminOutlet } from "../../../layouts/AdminLayout";
import { adminApi, formatCurrency, formatDate, type ReportOverview } from "../../../lib/adminApi";
import { EmptyState, ErrorState, LoadingState } from "../shared/ApiState";
import { AdminPageShell } from "../shared/AdminPageShell";

export function ReportsPage() {
  const { token, sessionVersion } = useAdminOutlet();
  const [overview, setOverview] = useState<ReportOverview | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadReport = useCallback(async () => {
    if (!token) return;

    setLoading(true);
    setError("");

    try {
      setOverview(await adminApi.reportOverview(token));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không tải được báo cáo");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadReport();
  }, [loadReport, sessionVersion]);

  return (
    <AdminPageShell
      title="Báo cáo & thống kê"
      description="Tổng hợp nhanh doanh thu, đơn hàng, khách hàng, tồn kho và sản phẩm bán chạy."
    >
      {error ? <ErrorState message={error} /> : null}

      <div className="flex justify-end">
        <Button onClick={loadReport} disabled={loading} className="rounded-lg bg-[#553B2F] text-white hover:bg-[#3f2a21]">
          <RefreshCw size={16} />
          Tải lại báo cáo
        </Button>
      </div>

      {loading ? <LoadingState /> : null}

      {overview ? (
        <>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <AdminMetricCard label="Doanh thu 30 ngày" value={formatCurrency(overview.revenueLast30Days)} helper="B2C" icon={BarChart3} />
            <AdminMetricCard label="Tổng đơn hàng" value={String(overview.orderCount)} helper={`${overview.pendingOrderCount} chờ`} icon={ClipboardList} />
            <AdminMetricCard label="Khách hàng" value={String(overview.retailCustomerCount + overview.businessCustomerCount)} helper="B2C+B2B" icon={UsersRound} />
            <AdminMetricCard label="Sản phẩm" value={String(overview.productCount)} helper={`${overview.categoryCount} danh mục`} icon={Boxes} />
          </div>

          <div className="grid gap-4 xl:grid-cols-2">
            <AdminPanel title="Đơn hàng gần đây" description="Các đơn mới nhất trong hệ thống.">
              {overview.recentOrders.length ? (
                <div className="divide-y divide-[#E8D3C7]">
                  {overview.recentOrders.map((order) => (
                    <article key={order.id} className="flex flex-wrap items-start justify-between gap-4 p-5">
                      <div>
                        <p className="font-black text-[#553B2F]">{order.orderCode}</p>
                        <p className="text-sm font-semibold text-[#7a5547]">{order.customerName}</p>
                        <p className="text-xs font-bold text-[#AA7864]">{formatDate(order.createdAt)}</p>
                      </div>
                      <div className="text-right">
                        <AdminStatusBadge status={order.status} />
                        <p className="mt-2 font-black text-[#553B2F]">{formatCurrency(order.totalAmount)}</p>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <EmptyState message="Chưa có đơn hàng." />
              )}
            </AdminPanel>

            <AdminPanel title="Sản phẩm bán chạy" description="Xếp theo doanh thu dòng hàng.">
              {overview.topProducts.length ? (
                <div className="divide-y divide-[#E8D3C7]">
                  {overview.topProducts.map((product, index) => (
                    <article key={product.productId} className="flex items-start justify-between gap-4 p-5">
                      <div>
                        <p className="text-xs font-black text-[#AA7864]">#{index + 1}</p>
                        <p className="font-black text-[#553B2F]">{product.productName}</p>
                        <p className="text-sm font-semibold text-[#7a5547]">Đã bán {product.quantity}</p>
                      </div>
                      <p className="font-black text-[#553B2F]">{formatCurrency(product.revenue)}</p>
                    </article>
                  ))}
                </div>
              ) : (
                <EmptyState message="Chưa có dữ liệu sản phẩm bán chạy." />
              )}
            </AdminPanel>
          </div>

          <AdminPanel title="Cảnh báo vận hành" description="Các điểm cần xử lý sớm trong ngày.">
            <div className="grid gap-4 p-5 md:grid-cols-3">
              <div className="rounded-xl border border-[#E8D3C7] bg-white p-4">
                <p className="text-sm font-bold text-[#AA7864]">Báo giá cần chăm sóc</p>
                <p className="mt-2 text-3xl font-black text-[#553B2F]">{overview.quoteCount}</p>
              </div>
              <div className="rounded-xl border border-[#E8D3C7] bg-white p-4">
                <p className="text-sm font-bold text-[#AA7864]">Đơn hàng chờ xử lý</p>
                <p className="mt-2 text-3xl font-black text-[#553B2F]">{overview.pendingOrderCount}</p>
              </div>
              <div className="rounded-xl border border-[#E8D3C7] bg-white p-4">
                <p className="text-sm font-bold text-[#AA7864]">Tồn kho thấp</p>
                <p className="mt-2 text-3xl font-black text-red-700">{overview.lowStockItems.length}</p>
              </div>
            </div>
            {overview.lowStockItems.length ? (
              <div className="divide-y divide-[#E8D3C7] border-t border-[#E8D3C7]">
                {overview.lowStockItems.map((item) => (
                  <div key={item.id} className="flex flex-wrap items-center justify-between gap-3 p-5">
                    <div>
                      <p className="font-black text-[#553B2F]">{item.productName}</p>
                      <p className="text-sm font-semibold text-[#7a5547]">{item.warehouse}</p>
                    </div>
                    <p className="font-black text-red-700">
                      {item.quantity}/{item.minQuantity}
                    </p>
                  </div>
                ))}
              </div>
            ) : null}
          </AdminPanel>
        </>
      ) : !loading ? (
        <EmptyState message="Chưa có dữ liệu báo cáo." />
      ) : null}
    </AdminPageShell>
  );
}
