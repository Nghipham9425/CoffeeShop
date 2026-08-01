import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { AlertTriangle, ArrowDownToLine, ArrowUpFromLine, Boxes, History, RefreshCw, SlidersHorizontal, X } from "lucide-react";
import { AdminPanel } from "../../../components/admin/AdminPanel";
import { AdminStatusBadge } from "../../../components/admin/AdminStatusBadge";
import { Button } from "../../../components/ui/button";
import { useAdminOutlet } from "../../../layouts/AdminLayout";
import { adminApi, formatDate, type AdminInventory, type StockMovement } from "../../../lib/adminApi";
import { EmptyState, ErrorState, LoadingState } from "../shared/ApiState";
import { AdminPageShell } from "../shared/AdminPageShell";

type OperationType = "IMPORT" | "EXPORT" | "ADJUSTMENT";
type OperationForm = { type: OperationType; quantity: number; reason: string; reference: string };

const operationLabels: Record<OperationType, string> = {
  IMPORT: "Nhập kho",
  EXPORT: "Xuất kho",
  ADJUSTMENT: "Kiểm kê tồn",
};

const movementLabels: Record<StockMovement["type"], string> = {
  IMPORT: "Nhập kho",
  EXPORT: "Xuất kho",
  ADJUSTMENT: "Kiểm kê",
  RETURN: "Hoàn kho",
};

const emptyOperation: OperationForm = { type: "IMPORT", quantity: 1, reason: "", reference: "" };

export function InventoryPage() {
  const { token, sessionVersion } = useAdminOutlet();
  const [inventories, setInventories] = useState<AdminInventory[]>([]);
  const [keyword, setKeyword] = useState("");
  const [lowStock, setLowStock] = useState(false);
  const [selectedInventory, setSelectedInventory] = useState<AdminInventory | null>(null);
  const [operation, setOperation] = useState<OperationForm>(emptyOperation);
  const [historyProductId, setHistoryProductId] = useState<number | null>(null);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const lowStockCount = useMemo(() => inventories.filter((item) => item.isLowStock).length, [inventories]);

  const loadData = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError("");
    try {
      const result = await adminApi.inventories(token, { keyword, lowStock });
      setInventories(result);
      setSelectedInventory((current) => current ? result.find((item) => item.id === current.id) ?? null : null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không tải được dữ liệu kho.");
    } finally {
      setLoading(false);
    }
  }, [keyword, lowStock, token]);

  useEffect(() => { loadData(); }, [loadData, sessionVersion]);

  function openOperation(item: AdminInventory, type: OperationType) {
    setSelectedInventory(item);
    setOperation({
      ...emptyOperation,
      type,
      quantity: type === "ADJUSTMENT" ? item.quantity : 1,
      reason: type === "ADJUSTMENT" ? "Kiểm kê tồn thực tế" : "",
    });
    setError("");
  }

  async function submitOperation(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token || !selectedInventory) return;
    if (operation.type === "EXPORT" && operation.quantity > selectedInventory.quantity) {
      setError(`Không thể xuất ${operation.quantity}. Tồn hiện tại chỉ còn ${selectedInventory.quantity}.`);
      return;
    }

    setSaving(true);
    setError("");
    try {
      await adminApi.createStockMovement(token, {
        productId: selectedInventory.productId,
        type: operation.type,
        quantity: Number(operation.quantity),
        warehouse: selectedInventory.warehouse,
        reason: operation.reason || undefined,
        reference: operation.reference || undefined,
      });
      await loadData();
      if (historyProductId === selectedInventory.productId) await loadMovementHistory(selectedInventory.productId);
      setSelectedInventory(null);
      setOperation(emptyOperation);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể cập nhật tồn kho.");
    } finally {
      setSaving(false);
    }
  }

  async function loadMovementHistory(productId: number) {
    if (!token) return;
    setHistoryProductId(productId);
    setLoadingHistory(true);
    setError("");
    try {
      setMovements(await adminApi.stockMovements(token, { productId }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không tải được lịch sử xuất nhập kho.");
    } finally {
      setLoadingHistory(false);
    }
  }

  return (
    <AdminPageShell title="Quản lý tồn kho" description="Theo dõi số lượng hiện tại và thực hiện nhập, xuất hoặc kiểm kê theo từng sản phẩm.">
      {error ? <ErrorState message={error} /> : null}

      <div className="grid gap-4 md:grid-cols-3">
        <AdminPanel title="Sản phẩm trong kho" description="Theo bộ lọc hiện tại."><p className="p-5 text-3xl font-black text-[#553B2F]">{inventories.length}</p></AdminPanel>
        <AdminPanel title="Cảnh báo tồn thấp" description="Tồn hiện tại không vượt ngưỡng tối thiểu."><p className="p-5 text-3xl font-black text-red-700">{lowStockCount}</p></AdminPanel>
        <AdminPanel title="Tổng lượng đang có" description="Tổng tồn của các dòng đang hiển thị."><p className="p-5 text-3xl font-black text-[#553B2F]">{inventories.reduce((sum, item) => sum + item.quantity, 0)}</p></AdminPanel>
      </div>

      {selectedInventory ? (
        <AdminPanel
          title={`${operationLabels[operation.type]}: ${selectedInventory.productName}`}
          description={`Tồn hiện tại: ${selectedInventory.quantity} tại ${selectedInventory.warehouse}`}
          action={<button type="button" onClick={() => setSelectedInventory(null)} className="grid size-9 place-items-center rounded-md text-[#553B2F] hover:bg-[#E8D3C7]" aria-label="Đóng biểu mẫu"><X size={18} /></button>}
        >
          <form onSubmit={submitOperation} className="grid gap-4 p-5 md:grid-cols-2 xl:grid-cols-4">
            <label className="grid gap-1.5 text-sm font-bold text-[#553B2F]">Thao tác
              <select value={operation.type} onChange={(event) => { const type = event.target.value as OperationType; setOperation((current) => ({ ...current, type, quantity: type === "ADJUSTMENT" ? selectedInventory.quantity : 1 })); }} className="rounded-lg border border-[#C7A792] bg-white px-4 py-2.5">
                <option value="IMPORT">Nhập kho</option><option value="EXPORT">Xuất kho</option><option value="ADJUSTMENT">Kiểm kê tồn thực tế</option>
              </select>
            </label>
            <label className="grid gap-1.5 text-sm font-bold text-[#553B2F]">{operation.type === "ADJUSTMENT" ? "Tồn thực tế sau kiểm kê" : "Số lượng"}
              <input type="number" min={operation.type === "ADJUSTMENT" ? 0 : 1} max={operation.type === "EXPORT" ? selectedInventory.quantity : undefined} value={operation.quantity} onChange={(event) => setOperation((current) => ({ ...current, quantity: Number(event.target.value) }))} className="rounded-lg border border-[#C7A792] px-4 py-2.5" required />
            </label>
            <label className="grid gap-1.5 text-sm font-bold text-[#553B2F]">Lý do
              <input value={operation.reason} onChange={(event) => setOperation((current) => ({ ...current, reason: event.target.value }))} placeholder="Ví dụ: Nhập từ nhà cung cấp" className="rounded-lg border border-[#C7A792] px-4 py-2.5" />
            </label>
            <label className="grid gap-1.5 text-sm font-bold text-[#553B2F]">Mã tham chiếu
              <input value={operation.reference} onChange={(event) => setOperation((current) => ({ ...current, reference: event.target.value }))} placeholder="Ví dụ: PN-2026-001" className="rounded-lg border border-[#C7A792] px-4 py-2.5" />
            </label>
            <div className="flex items-center justify-between gap-4 border-t border-[#E8D3C7] pt-4 md:col-span-2 xl:col-span-4">
              <p className="text-sm font-semibold text-[#7a5547]">
                {operation.type === "IMPORT" && `Tồn sau nhập dự kiến: ${selectedInventory.quantity + operation.quantity}`}
                {operation.type === "EXPORT" && `Tồn sau xuất dự kiến: ${Math.max(0, selectedInventory.quantity - operation.quantity)}`}
                {operation.type === "ADJUSTMENT" && "Giá trị nhập là số tồn thực tế, không phải số lượng cộng thêm."}
              </p>
              <Button disabled={saving} className="rounded-lg bg-[#553B2F] text-white hover:bg-[#3f2a21]"><Boxes size={16} />{saving ? "Đang lưu..." : "Xác nhận"}</Button>
            </div>
          </form>
        </AdminPanel>
      ) : null}

      <AdminPanel title="Tồn kho theo sản phẩm" description="Mỗi dòng hiển thị số lượng hiện tại và các thao tác kho tương ứng." action={<Button onClick={loadData} disabled={loading} className="rounded-lg bg-[#553B2F] text-white hover:bg-[#3f2a21]"><RefreshCw size={16} />Tải lại</Button>}>
        <div className="grid gap-3 border-b border-[#E8D3C7] p-5 md:grid-cols-[1fr_auto_auto]">
          <input value={keyword} onChange={(event) => setKeyword(event.target.value)} onKeyDown={(event) => event.key === "Enter" && loadData()} placeholder="Tìm theo tên hoặc mã sản phẩm..." className="rounded-lg border border-[#C7A792] px-4 py-2 text-sm font-semibold outline-none focus:border-[#553B2F]" />
          <label className="flex items-center gap-2 rounded-lg border border-[#C7A792] px-4 py-2 text-sm font-bold text-[#553B2F]"><input type="checkbox" checked={lowStock} onChange={(event) => setLowStock(event.target.checked)} />Chỉ tồn thấp</label>
          <Button onClick={loadData} className="rounded-lg bg-[#AA7864] text-white hover:bg-[#8d604f]">Tìm</Button>
        </div>

        {loading ? <LoadingState /> : inventories.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] text-left text-sm">
              <thead className="bg-[#E8D3C7]/70 text-xs uppercase text-[#553B2F]"><tr><th className="px-5 py-3">Sản phẩm</th><th className="px-5 py-3">Kho</th><th className="px-5 py-3">Tồn hiện tại</th><th className="px-5 py-3">Cảnh báo</th><th className="px-5 py-3">Cập nhật</th><th className="px-5 py-3 text-right">Thao tác</th></tr></thead>
              <tbody className="divide-y divide-[#E8D3C7]">
                {inventories.map((item) => (
                  <tr key={item.id} className="hover:bg-[#E8D3C7]/25">
                    <td className="px-5 py-4"><p className="font-black text-[#553B2F]">{item.productName}</p><p className="text-xs font-bold text-[#AA7864]">{item.categoryName}</p></td>
                    <td className="px-5 py-4 font-semibold text-[#7a5547]">{item.warehouse}</td>
                    <td className="px-5 py-4"><strong className="text-2xl text-[#553B2F]">{item.quantity}</strong><span className="ml-2 text-xs font-bold text-[#7a5547]">đơn vị</span></td>
                    <td className="px-5 py-4">{item.isLowStock ? <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-3 py-1 text-xs font-black text-red-700"><AlertTriangle size={14} />Tồn thấp</span> : <AdminStatusBadge status="Ổn định" />}<p className="mt-1 text-xs font-semibold text-[#7a5547]">Tối thiểu: {item.minQuantity}</p></td>
                    <td className="px-5 py-4 text-xs font-semibold text-[#7a5547]">{formatDate(item.updatedAt)}</td>
                    <td className="px-5 py-4"><div className="flex justify-end gap-2">
                      <Button type="button" onClick={() => openOperation(item, "IMPORT")} className="rounded-lg bg-emerald-700 text-white hover:bg-emerald-800"><ArrowDownToLine size={15} />Nhập</Button>
                      <Button type="button" onClick={() => openOperation(item, "EXPORT")} disabled={item.quantity === 0} className="rounded-lg bg-[#AA7864] text-white hover:bg-[#8d604f]"><ArrowUpFromLine size={15} />Xuất</Button>
                      <Button type="button" variant="outline" onClick={() => openOperation(item, "ADJUSTMENT")} title="Kiểm kê tồn" className="rounded-lg border-[#C7A792] text-[#553B2F] hover:bg-[#E8D3C7]"><SlidersHorizontal size={15} /></Button>
                      <Button type="button" variant="outline" onClick={() => loadMovementHistory(item.productId)} title="Lịch sử kho" className="rounded-lg border-[#C7A792] text-[#553B2F] hover:bg-[#E8D3C7]"><History size={15} /></Button>
                    </div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : <EmptyState message="Chưa có dữ liệu tồn kho phù hợp." />}
      </AdminPanel>

      {historyProductId ? (
        <AdminPanel title={`Lịch sử kho: ${inventories.find((item) => item.productId === historyProductId)?.productName ?? "Sản phẩm"}`} description="Nhật ký nhập, xuất, hoàn hàng và kiểm kê theo thời gian." action={<button type="button" onClick={() => setHistoryProductId(null)} className="grid size-9 place-items-center rounded-md text-[#553B2F] hover:bg-[#E8D3C7]" aria-label="Đóng lịch sử"><X size={18} /></button>}>
          {loadingHistory ? <LoadingState /> : movements.length ? (
            <div className="overflow-x-auto"><table className="w-full min-w-[860px] text-left text-sm">
              <thead className="bg-[#E8D3C7]/70 text-xs uppercase text-[#553B2F]"><tr><th className="px-5 py-3">Thời gian</th><th className="px-5 py-3">Loại phiếu</th><th className="px-5 py-3">Số lượng</th><th className="px-5 py-3">Tồn sau phiếu</th><th className="px-5 py-3">Kho</th><th className="px-5 py-3">Lý do / Tham chiếu</th></tr></thead>
              <tbody className="divide-y divide-[#E8D3C7]">{movements.map((movement) => {
                const prefix = movement.type === "EXPORT" ? "-" : movement.type === "ADJUSTMENT" ? "±" : "+";
                return <tr key={movement.id}><td className="px-5 py-4 text-[#7a5547]">{formatDate(movement.createdAt)}</td><td className="px-5 py-4 font-black text-[#553B2F]">{movementLabels[movement.type]}</td><td className={`px-5 py-4 font-black ${movement.type === "EXPORT" ? "text-red-700" : "text-emerald-700"}`}>{prefix}{movement.quantity}</td><td className="px-5 py-4 font-black text-[#553B2F]">{movement.balanceAfter ?? "-"}</td><td className="px-5 py-4">{movement.warehouse}</td><td className="px-5 py-4"><p>{movement.reason || "Không có ghi chú"}</p><p className="text-xs font-bold text-[#AA7864]">{movement.reference || "Không có mã tham chiếu"}</p></td></tr>;
              })}</tbody>
            </table></div>
          ) : <EmptyState message="Sản phẩm chưa có lịch sử xuất nhập kho." />}
        </AdminPanel>
      ) : null}
    </AdminPageShell>
  );
}
