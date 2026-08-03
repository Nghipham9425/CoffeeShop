import { useCallback, useEffect, useState } from "react";
import { RotateCcw } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Card, CardContent } from "../../../components/ui/card";
import { useAdminOutlet } from "../../../layouts/AdminLayout";
import { adminApi, formatCurrency, formatDate, type AdminReturnRequest } from "../../../lib/adminApi";
import { AdminPageShell } from "../shared/AdminPageShell";
import { ErrorState, LoadingState } from "../shared/ApiState";

const typeLabel = { RETURN: "Trả hàng", EXCHANGE: "Đổi hàng", REFUND: "Hoàn tiền" } as const;
const statusLabel = { REQUESTED: "Mới tiếp nhận", REVIEWING: "Đang xem xét", APPROVED: "Đã duyệt", REJECTED: "Từ chối", COMPLETED: "Hoàn tất", CANCELLED: "Đã hủy" } as const;
const nextStatus: Partial<Record<AdminReturnRequest["status"], AdminReturnRequest["status"]>> = { REQUESTED: "REVIEWING", REVIEWING: "APPROVED", APPROVED: "COMPLETED" };

export function ReturnsPage() {
  const { token } = useAdminOutlet();
  const [rows, setRows] = useState<AdminReturnRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const load = useCallback(async () => { if (!token) return; setLoading(true); try { setRows(await adminApi.returnRequests(token)); } catch (cause) { setError(cause instanceof Error ? cause.message : "Không tải được yêu cầu."); } finally { setLoading(false); } }, [token]);
  useEffect(() => { void load(); }, [load]);

  async function update(row: AdminReturnRequest, status: AdminReturnRequest["status"]) {
    if (!token) return;
    const note = window.prompt(status === "REJECTED" ? "Lý do từ chối:" : "Ghi chú xử lý (có thể bỏ trống):", row.resolutionNote ?? "");
    if (note === null) return;
    try { const updated = await adminApi.updateReturnRequest(token, row.id, { status, resolutionNote: note || undefined }); setRows((current) => current.map((item) => item.id === row.id ? updated : item)); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Không cập nhật được yêu cầu."); }
  }

  return <AdminPageShell title="Đổi trả và hoàn tiền" description="Tiếp nhận, xét duyệt và hoàn tất yêu cầu hậu mãi từ đơn hàng đã giao.">
    {error ? <ErrorState message={error} /> : null}
    {loading ? <LoadingState /> : <div className="grid gap-4">{rows.map((row) => <Card key={row.id} className="border-[#E8D3C7]"><CardContent className="grid gap-4 p-5 lg:grid-cols-[1fr_1fr_auto] lg:items-center"><div><div className="flex flex-wrap items-center gap-2"><span className="rounded-full bg-[#f8f2ed] px-3 py-1 text-xs font-black text-[#553B2F]">{typeLabel[row.type]}</span><span className="text-xs font-bold text-[#AA7864]">#{row.id} · {formatDate(row.createdAt)}</span></div><p className="mt-3 font-black text-[#553B2F]">{row.user.fullName} · {row.order.orderCode}</p><p className="mt-1 text-sm text-[#7a5547]">{row.user.phone || row.user.email} · {formatCurrency(Number(row.order.totalAmount))}</p></div><div><p className="text-sm font-bold text-[#553B2F]">{row.reason}</p>{row.resolutionNote ? <p className="mt-2 text-xs text-[#7a5547]">Phản hồi: {row.resolutionNote}</p> : null}</div><div className="min-w-44"><p className="mb-2 flex items-center gap-2 text-sm font-black text-[#553B2F]"><RotateCcw size={16} /> {statusLabel[row.status]}</p>{nextStatus[row.status] ? <Button className="w-full bg-[#553B2F] text-white hover:bg-[#3f2a21]" onClick={() => update(row, nextStatus[row.status]!)}>Chuyển: {statusLabel[nextStatus[row.status]!]}</Button> : null}{["REQUESTED", "REVIEWING"].includes(row.status) ? <Button variant="outline" className="mt-2 w-full border-red-200 text-red-700 hover:bg-red-50" onClick={() => update(row, "REJECTED")}>Từ chối</Button> : null}</div></CardContent></Card>)}</div>}
    {!loading && !rows.length ? <p className="rounded-lg border border-dashed border-[#C7A792] p-10 text-center font-bold text-[#AA7864]">Chưa có yêu cầu đổi/trả.</p> : null}
  </AdminPageShell>;
}
