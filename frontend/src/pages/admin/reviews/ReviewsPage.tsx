import { useCallback, useEffect, useState } from "react";
import { Eye, EyeOff, Star } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Card, CardContent } from "../../../components/ui/card";
import { useAdminOutlet } from "../../../layouts/AdminLayout";
import { adminApi, formatDate, type AdminReview } from "../../../lib/adminApi";
import { AdminPageShell } from "../shared/AdminPageShell";
import { ErrorState, LoadingState } from "../shared/ApiState";

export function ReviewsPage() {
  const { token } = useAdminOutlet();
  const [rows, setRows] = useState<AdminReview[]>([]);
  const [filter, setFilter] = useState<"VISIBLE" | "HIDDEN">("VISIBLE");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const load = useCallback(async () => { if (!token) return; try { setRows(await adminApi.reviews(token)); } catch (cause) { setError(cause instanceof Error ? cause.message : "Không tải được đánh giá."); } finally { setLoading(false); } }, [token]);
  useEffect(() => { void load(); }, [load]);
  async function update(row: AdminReview, status: "APPROVED" | "REJECTED") { if (!token) return; try { const next = await adminApi.updateReviewStatus(token, row.id, status); setRows((current) => current.map((item) => item.id === row.id ? next : item)); } catch (cause) { setError(cause instanceof Error ? cause.message : "Không cập nhật được đánh giá."); } }
  const visible = rows.filter((row) => filter === "VISIBLE" ? row.status !== "REJECTED" : row.status === "REJECTED");
  return <AdminPageShell title="Đánh giá sản phẩm" description="Đánh giá từ đơn đã hoàn tất được hiển thị ngay; quản trị chỉ ẩn nội dung vi phạm khi cần.">
    {error ? <ErrorState message={error} /> : null}
    <div className="mb-5 grid grid-cols-2 gap-2">{(["VISIBLE", "HIDDEN"] as const).map((status) => <button key={status} onClick={() => setFilter(status)} className={`rounded-lg border p-3 text-sm font-black ${filter === status ? "border-[#553B2F] bg-[#553B2F] text-white" : "border-[#E8D3C7] bg-white text-[#553B2F]"}`}>{status === "VISIBLE" ? "Đang hiển thị" : "Đã ẩn"} ({rows.filter((row) => status === "VISIBLE" ? row.status !== "REJECTED" : row.status === "REJECTED").length})</button>)}</div>
    {loading ? <LoadingState /> : <div className="grid gap-4">{visible.map((row) => <Card key={row.id} className="border-[#E8D3C7]"><CardContent className="grid gap-4 p-5 lg:grid-cols-[1fr_1.4fr_auto] lg:items-center"><div><p className="font-black text-[#553B2F]">{row.product.name}</p><p className="mt-1 text-sm text-[#7a5547]">{row.user.fullName} · {row.order?.orderCode}</p><div className="mt-2 flex">{Array.from({ length: 5 }, (_, index) => <Star key={index} size={16} className={index < row.rating ? "fill-amber-400 text-amber-400" : "text-stone-300"} />)}</div></div><div><p className="text-sm leading-6 text-[#553B2F]">{row.content || "Không có nội dung."}</p><p className="mt-1 text-xs text-[#AA7864]">{formatDate(row.createdAt)}</p></div><Button variant="outline" className={row.status === "REJECTED" ? "border-emerald-200 text-emerald-700 hover:bg-emerald-50" : "border-red-200 text-red-700 hover:bg-red-50"} onClick={() => update(row, row.status === "REJECTED" ? "APPROVED" : "REJECTED")}>{row.status === "REJECTED" ? <><Eye size={17} /> Hiện lại</> : <><EyeOff size={17} /> Ẩn</>}</Button></CardContent></Card>)}</div>}
    {!loading && !visible.length ? <p className="rounded-lg border border-dashed border-[#C7A792] p-10 text-center font-bold text-[#AA7864]">Không có đánh giá ở trạng thái này.</p> : null}
  </AdminPageShell>;
}
