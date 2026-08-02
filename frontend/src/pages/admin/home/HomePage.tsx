import { useEffect, useMemo, useState } from "react";
import { BarChart3, CircleCheckBig, FileText, Package } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { AdminMetricCard } from "../../../components/admin/AdminMetricCard";
import { AdminPanel } from "../../../components/admin/AdminPanel";
import { AdminStatusBadge } from "../../../components/admin/AdminStatusBadge";
import { useAdminOutlet } from "../../../layouts/AdminLayout";
import { adminApi, formatCurrency, formatDate, type Product, type QuoteRequest, type ReportOverview } from "../../../lib/adminApi";
import { EmptyState, ErrorState, LoadingState } from "../shared/ApiState";
import { AdminPageShell } from "../shared/AdminPageShell";

const statusLabels: Record<string, string> = {
  PENDING: "Chờ xác nhận", CONFIRMED: "Đã xác nhận", PACKING: "Đang đóng gói",
  SHIPPING: "Đang giao", COMPLETED: "Hoàn thành", CANCELLED: "Đã hủy",
};

export function HomePage() {
  const { token, sessionVersion } = useAdminOutlet();
  const [products, setProducts] = useState<Product[]>([]);
  const [quotes, setQuotes] = useState<QuoteRequest[]>([]);
  const [report, setReport] = useState<ReportOverview | null>(null);
  const [orderStatuses, setOrderStatuses] = useState<Array<{ status: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;
    async function loadDashboard() {
      setLoading(true);
      setError("");
      try {
        const productRequest = adminApi.products();
        const protectedRequests = token
          ? Promise.all([adminApi.quoteRequests(token), adminApi.reportOverview(token), adminApi.orders(token)])
          : Promise.resolve([[], null, []] as [QuoteRequest[], ReportOverview | null, Array<{ status: string }>]);
        const [productResult, [quoteResult, reportResult, orderResult]] = await Promise.all([productRequest, protectedRequests]);
        if (!alive) return;
        setProducts(productResult);
        setQuotes(quoteResult);
        setReport(reportResult);
        setOrderStatuses(orderResult);
      } catch (cause) {
        if (alive) setError(cause instanceof Error ? cause.message : "Không tải được dữ liệu tổng quan.");
      } finally {
        if (alive) setLoading(false);
      }
    }
    void loadDashboard();
    return () => { alive = false; };
  }, [token, sessionVersion]);

  const activeQuotes = useMemo(() => quotes.filter((item) => item.status === "NEW" || item.status === "CONTACTED").length, [quotes]);
  const convertedQuotes = useMemo(() => quotes.filter((item) => item.status === "ACCEPTED" || item.status === "CONVERTED").length, [quotes]);
  const statusChart = useMemo(() => Object.entries(statusLabels).map(([status, label]) => ({ status, label, count: orderStatuses.filter((item) => item.status === status).length })), [orderStatuses]);

  return <AdminPageShell title="Tổng quan quản trị" description="Theo dõi doanh thu, đơn hàng, yêu cầu báo giá và hiệu quả sản phẩm.">
    {error ? <ErrorState message={error} /> : null}
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <AdminMetricCard label="Doanh thu 30 ngày" value={formatCurrency(report?.revenueLast30Days)} helper="Đơn hoàn thành" icon={BarChart3} />
      <AdminMetricCard label="Đơn chờ xử lý" value={String(report?.pendingOrderCount ?? 0)} helper={`Tổng ${report?.orderCount ?? 0} đơn`} icon={Package} />
      <AdminMetricCard label="Báo giá cần xử lý" value={String(activeQuotes)} helper="Khách doanh nghiệp" icon={FileText} />
      <AdminMetricCard label="Báo giá đã chốt" value={String(convertedQuotes)} helper="B2B" icon={CircleCheckBig} />
    </div>

    <div className="grid gap-5 xl:grid-cols-2">
      <AdminPanel title="Tình trạng đơn hàng" description="Phân bố đơn hàng theo tiến độ xử lý hiện tại.">
        <div className="h-72 p-5">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={statusChart} margin={{ top: 6, right: 4, left: -22, bottom: 20 }}>
              <CartesianGrid stroke="#eadbce" vertical={false} />
              <XAxis dataKey="label" tick={{ fill: "#7a5547", fontSize: 11 }} interval={0} angle={-24} textAnchor="end" />
              <YAxis allowDecimals={false} tick={{ fill: "#7a5547", fontSize: 11 }} />
              <Tooltip cursor={{ fill: "#fff8f1" }} contentStyle={{ borderColor: "#e7d7ca", borderRadius: 8 }} formatter={(value) => [`${value ?? 0} đơn`, "Số lượng"]} />
              <Bar dataKey="count" radius={[6, 6, 0, 0]}>{statusChart.map((item) => <Cell key={item.status} fill={item.status === "COMPLETED" ? "#597a50" : item.status === "CANCELLED" ? "#9b5b4b" : "#aa7864"} />)}</Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </AdminPanel>
      <AdminPanel title="Sản phẩm bán chạy" description="Xếp theo doanh thu từ đơn hàng đã ghi nhận.">
        {report?.topProducts.length ? <div className="h-72 p-5"><ResponsiveContainer width="100%" height="100%"><BarChart data={report.topProducts} layout="vertical" margin={{ top: 6, right: 6, left: 0, bottom: 4 }}><CartesianGrid stroke="#eadbce" horizontal={false} /><XAxis type="number" tick={{ fill: "#7a5547", fontSize: 11 }} tickFormatter={(value) => `${Math.round(value / 1000)}k`} /><YAxis dataKey="productName" type="category" width={120} tick={{ fill: "#553b2f", fontSize: 11 }} /><Tooltip cursor={{ fill: "#fff8f1" }} contentStyle={{ borderColor: "#e7d7ca", borderRadius: 8 }} formatter={(value) => [formatCurrency(Number(value)), "Doanh thu"]} /><Bar dataKey="revenue" fill="#553b2f" radius={[0, 6, 6, 0]} /></BarChart></ResponsiveContainer></div> : <EmptyState message="Chưa có dữ liệu doanh số sản phẩm." />}
      </AdminPanel>
    </div>

    <div className="grid gap-5 xl:grid-cols-2">
      <AdminPanel title="Sản phẩm mới" description="Danh sách sản phẩm mới nhất đang hiển thị trong hệ thống.">
        {loading ? <LoadingState /> : products.length ? <div className="divide-y divide-[#E8D3C7]">{products.slice(0, 5).map((product) => <div key={product.id} className="flex items-center justify-between gap-4 p-5"><div><p className="font-black text-[#553B2F]">{product.name}</p><p className="mt-1 text-sm font-semibold text-[#AA7864]">{product.categoryName}</p></div><p className="text-sm font-black text-[#553B2F]">{formatCurrency(product.price)}</p></div>)}</div> : <EmptyState message="Chưa có sản phẩm." />}
      </AdminPanel>
      <AdminPanel title="Yêu cầu báo giá gần đây" description="Các yêu cầu B2B cần đội bán hàng theo dõi và phản hồi.">
        {quotes.length ? <div className="divide-y divide-[#E8D3C7]">{quotes.slice(0, 5).map((quote) => <div key={quote.id} className="flex items-start justify-between gap-4 p-5"><div><p className="font-black text-[#553B2F]">{quote.companyName}</p><p className="mt-1 text-sm font-semibold text-[#AA7864]">{quote.productNeed}</p><p className="mt-1 text-xs font-bold text-[#7a5547]">{formatDate(quote.createdAt)}</p></div><AdminStatusBadge status={quote.status} /></div>)}</div> : <EmptyState message="Chưa có yêu cầu báo giá." />}
      </AdminPanel>
    </div>
  </AdminPageShell>;
}
