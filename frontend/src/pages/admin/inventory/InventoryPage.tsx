import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { AlertTriangle, ArrowDownToLine, ArrowUpFromLine, ClipboardList, History, RefreshCw, Settings2, X } from "lucide-react";
import { AdminPanel } from "../../../components/admin/AdminPanel";
import { Button } from "../../../components/ui/button";
import { useAdminOutlet } from "../../../layouts/AdminLayout";
import { adminApi, formatDate, type AdminInventory, type StockMovement } from "../../../lib/adminApi";
import { ErrorState, LoadingState } from "../shared/ApiState";
import { AdminPageShell } from "../shared/AdminPageShell";

type OperationType = "IMPORT" | "EXPORT" | "ADJUSTMENT";
type OperationForm = { type: OperationType; quantity: number; reason: string; reference: string };

const operationLabels: Record<OperationType, string> = {
  IMPORT: "Nhập kho",
  EXPORT: "Xuất kho",
  ADJUSTMENT: "Kiểm kê",
};

const movementLabels: Record<StockMovement["type"], string> = {
  IMPORT: "Nhập kho",
  EXPORT: "Xuất kho",
  ADJUSTMENT: "Kiểm kê",
  RETURN: "Hoàn kho",
};

function StockStatus({ item }: { item: AdminInventory }) {
  return item.isLowStock ? (
    <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-3 py-1 text-xs font-bold text-red-700">
      <AlertTriangle size={14} /> Sắp hết
    </span>
  ) : (
    <span className="inline-flex rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">Đủ hàng</span>
  );
}

export function InventoryPage() {
  const { token, sessionVersion } = useAdminOutlet();
  const [inventories, setInventories] = useState<AdminInventory[]>([]);
  const [keyword, setKeyword] = useState("");
  const [onlyLowStock, setOnlyLowStock] = useState(false);
  const [operationItem, setOperationItem] = useState<AdminInventory | null>(null);
  const [thresholdItem, setThresholdItem] = useState<AdminInventory | null>(null);
  const [historyItem, setHistoryItem] = useState<AdminInventory | null>(null);
  const [operation, setOperation] = useState<OperationForm>({ type: "IMPORT", quantity: 1, reason: "", reference: "" });
  const [minQuantity, setMinQuantity] = useState(0);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const statistics = useMemo(() => ({
    productCount: inventories.length,
    lowStockCount: inventories.filter((item) => item.isLowStock).length,
    totalQuantity: inventories.reduce((sum, item) => sum + item.quantity, 0),
  }), [inventories]);

  const loadInventories = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError("");
    try {
      const data = await adminApi.inventories(token, { keyword: keyword || undefined, lowStock: onlyLowStock || undefined });
      setInventories(data);
      setOperationItem((current) => current ? data.find((item) => item.productId === current.productId) ?? null : null);
      setThresholdItem((current) => current ? data.find((item) => item.productId === current.productId) ?? null : null);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Không thể tải dữ liệu kho.");
    } finally {
      setLoading(false);
    }
  }, [keyword, onlyLowStock, token]);

  useEffect(() => { void loadInventories(); }, [loadInventories, sessionVersion]);

  function openOperation(item: AdminInventory, type: OperationType) {
    setOperationItem(item);
    setThresholdItem(null);
    setOperation({
      type,
      quantity: type === "ADJUSTMENT" ? item.quantity : 1,
      reason: type === "ADJUSTMENT" ? "Kiểm kê tồn thực tế" : "",
      reference: "",
    });
    setMessage("");
    setError("");
  }

  function openThreshold(item: AdminInventory) {
    setThresholdItem(item);
    setOperationItem(null);
    setMinQuantity(item.minQuantity);
  }

  async function openHistory(item: AdminInventory) {
    if (!token) return;
    setHistoryItem(item);
    setError("");
    try {
      setMovements(await adminApi.stockMovements(token, { productId: item.productId }));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Không thể tải lịch sử kho.");
    }
  }

  async function submitOperation(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token || !operationItem) return;
    if (operation.type === "EXPORT" && operation.quantity > operationItem.quantity) {
      setError(`Không thể xuất ${operation.quantity} kg vì tồn hiện tại là ${operationItem.quantity} kg.`);
      return;
    }
    setSaving(true);
    setError("");
    try {
      await adminApi.createStockMovement(token, {
        productId: operationItem.productId,
        type: operation.type,
        quantity: Number(operation.quantity),
        reason: operation.reason,
        reference: operation.reference || undefined,
      });
      const currentProduct = operationItem;
      setOperationItem(null);
      setMessage("Đã lập phiếu kho và cập nhật tồn kho.");
      await loadInventories();
      if (historyItem?.productId === currentProduct.productId) await openHistory(currentProduct);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Không thể cập nhật tồn kho.");
    } finally {
      setSaving(false);
    }
  }

  async function submitThreshold(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token || !thresholdItem) return;
    setSaving(true);
    setError("");
    try {
      await adminApi.updateInventory(token, thresholdItem.productId, { minQuantity: Number(minQuantity) });
      setThresholdItem(null);
      setMessage("Đã cập nhật ngưỡng cảnh báo tồn kho.");
      await loadInventories();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Không thể lưu ngưỡng cảnh báo.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <AdminPageShell title="Quản lý kho" description="Một kho thành phẩm, theo dõi tồn kho theo kg cho toàn bộ sản phẩm đang bán lẻ.">
      {message && <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-800">{message}</div>}
      {error && <ErrorState message={error} />}

      <div className="grid gap-4 md:grid-cols-3">
        <AdminPanel title="Sản phẩm theo dõi" description="Sản phẩm đang hiển thị ở kênh bán lẻ."><p className="p-5 text-3xl font-black text-[#553B2F]">{statistics.productCount}</p></AdminPanel>
        <AdminPanel title="Cảnh báo tồn thấp" description="Tồn không vượt ngưỡng tối thiểu."><p className="p-5 text-3xl font-black text-red-700">{statistics.lowStockCount}</p></AdminPanel>
        <AdminPanel title="Tổng tồn kho" description="Tổng số kg của các sản phẩm đang hiển thị."><p className="p-5 text-3xl font-black text-[#553B2F]">{statistics.totalQuantity} kg</p></AdminPanel>
      </div>

      {operationItem && <AdminPanel
        title={`${operationLabels[operation.type]}: ${operationItem.productName}`}
        description={`Tồn hiện tại: ${operationItem.quantity} kg.`}
        action={<button onClick={() => setOperationItem(null)} className="grid size-9 place-items-center rounded-md hover:bg-[#E8D3C7]" aria-label="Đóng"><X size={18} /></button>}
      >
        <form onSubmit={submitOperation} className="grid gap-4 p-5 md:grid-cols-2 xl:grid-cols-4">
          <label className="grid gap-1 text-sm font-bold text-[#553B2F]">Nghiệp vụ
            <select value={operation.type} onChange={(event) => { const type = event.target.value as OperationType; setOperation((current) => ({ ...current, type, quantity: type === "ADJUSTMENT" ? operationItem.quantity : 1 })); }} className="rounded-lg border border-[#C7A792] bg-white px-3 py-2.5">
              <option value="IMPORT">Nhập kho</option><option value="EXPORT">Xuất kho</option><option value="ADJUSTMENT">Kiểm kê tồn thực tế</option>
            </select>
          </label>
          <label className="grid gap-1 text-sm font-bold text-[#553B2F]">{operation.type === "ADJUSTMENT" ? "Tồn thực tế sau kiểm kê (kg)" : "Số lượng (kg)"}
            <input type="number" min={operation.type === "ADJUSTMENT" ? 0 : 1} max={operation.type === "EXPORT" ? operationItem.quantity : undefined} value={operation.quantity} onChange={(event) => setOperation((current) => ({ ...current, quantity: Number(event.target.value) }))} className="rounded-lg border border-[#C7A792] px-3 py-2.5" required />
          </label>
          <label className="grid gap-1 text-sm font-bold text-[#553B2F]">Lý do
            <input value={operation.reason} onChange={(event) => setOperation((current) => ({ ...current, reason: event.target.value }))} placeholder="Ví dụ: nhập hàng từ xưởng" className="rounded-lg border border-[#C7A792] px-3 py-2.5" required />
          </label>
          <label className="grid gap-1 text-sm font-bold text-[#553B2F]">Mã tham chiếu
            <input value={operation.reference} onChange={(event) => setOperation((current) => ({ ...current, reference: event.target.value }))} placeholder="Ví dụ: PN-001" className="rounded-lg border border-[#C7A792] px-3 py-2.5" />
          </label>
          <div className="flex items-center justify-between gap-3 border-t border-[#E8D3C7] pt-4 md:col-span-2 xl:col-span-4">
            <p className="text-sm text-[#7a5547]">{operation.type === "ADJUSTMENT" ? "Kiểm kê sẽ đặt lại số tồn đúng bằng giá trị vừa nhập." : "Phiếu kho sẽ được lưu trong lịch sử biến động."}</p>
            <Button disabled={saving} className="bg-[#553B2F] text-white hover:bg-[#3f2a21]">{saving ? "Đang lưu..." : "Xác nhận"}</Button>
          </div>
        </form>
      </AdminPanel>}

      {thresholdItem && <AdminPanel title={`Ngưỡng cảnh báo: ${thresholdItem.productName}`} description="Ngưỡng chỉ phục vụ cảnh báo, không thay đổi tồn thực tế." action={<button onClick={() => setThresholdItem(null)} className="grid size-9 place-items-center rounded-md hover:bg-[#E8D3C7]" aria-label="Đóng"><X size={18} /></button>}>
        <form onSubmit={submitThreshold} className="flex gap-4 p-5 sm:items-end">
          <label className="grid flex-1 gap-1 text-sm font-bold text-[#553B2F]">Ngưỡng tối thiểu (kg)<input type="number" min={0} value={minQuantity} onChange={(event) => setMinQuantity(Number(event.target.value))} className="rounded-lg border border-[#C7A792] px-3 py-2.5" required /></label>
          <Button disabled={saving} className="bg-[#553B2F] text-white hover:bg-[#3f2a21]">{saving ? "Đang lưu..." : "Lưu ngưỡng"}</Button>
        </form>
      </AdminPanel>}

      <AdminPanel title="Tồn kho sản phẩm" description="Nhập, xuất hoặc kiểm kê từ từng sản phẩm. Đơn hàng hoàn tất sẽ tự tạo phiếu xuất kho." action={<Button onClick={loadInventories} disabled={loading} className="bg-[#553B2F] text-white hover:bg-[#3f2a21]"><RefreshCw size={16} />Tải lại</Button>}>
        <div className="grid gap-3 border-b border-[#E8D3C7] p-5 md:grid-cols-[1fr_auto_auto]">
          <input value={keyword} onChange={(event) => setKeyword(event.target.value)} onKeyDown={(event) => event.key === "Enter" && void loadInventories()} placeholder="Tìm theo tên hoặc mã sản phẩm" className="rounded-lg border border-[#C7A792] px-3 py-2.5" />
          <label className="flex items-center gap-2 rounded-lg border border-[#C7A792] px-3 py-2 text-sm font-bold"><input type="checkbox" checked={onlyLowStock} onChange={(event) => setOnlyLowStock(event.target.checked)} /> Chỉ tồn thấp</label>
          <Button onClick={loadInventories} className="bg-[#AA7864] text-white hover:bg-[#8d604f]">Tìm kiếm</Button>
        </div>
        {loading ? <LoadingState /> : inventories.length ? <div className="overflow-x-auto"><table className="w-full min-w-[980px] text-left text-sm"><thead className="bg-[#E8D3C7]/70 text-xs uppercase text-[#553B2F]"><tr><th className="px-5 py-3">Sản phẩm</th><th className="px-5 py-3">Tồn hiện tại</th><th className="px-5 py-3">Ngưỡng</th><th className="px-5 py-3">Trạng thái</th><th className="px-5 py-3">Cập nhật</th><th className="px-5 py-3 text-right">Thao tác</th></tr></thead><tbody className="divide-y divide-[#E8D3C7]">
          {inventories.map((item) => <tr key={item.productId} className="hover:bg-[#E8D3C7]/25"><td className="px-5 py-4"><p className="font-black text-[#553B2F]">{item.productName}</p><p className="text-xs text-[#7a5547]">{item.categoryName} · {item.warehouse}</p></td><td className="px-5 py-4"><strong className="text-xl text-[#553B2F]">{item.quantity}</strong> kg</td><td className="px-5 py-4">{item.minQuantity} kg</td><td className="px-5 py-4"><StockStatus item={item} /></td><td className="px-5 py-4 text-xs text-[#7a5547]">{formatDate(item.updatedAt)}</td><td className="px-5 py-4"><div className="flex justify-end gap-2"><Button onClick={() => openOperation(item, "IMPORT")} className="bg-emerald-700 text-white hover:bg-emerald-800"><ArrowDownToLine size={15} />Nhập</Button><Button onClick={() => openOperation(item, "EXPORT")} className="bg-[#AA7864] text-white hover:bg-[#8d604f]"><ArrowUpFromLine size={15} />Xuất</Button><Button variant="outline" onClick={() => openOperation(item, "ADJUSTMENT")}><ClipboardList size={15} />Kiểm kê</Button><Button size="icon" variant="outline" onClick={() => openThreshold(item)} title="Thiết lập ngưỡng"><Settings2 size={15} /></Button><Button size="icon" variant="outline" onClick={() => void openHistory(item)} title="Xem lịch sử"><History size={15} /></Button></div></td></tr>)}
        </tbody></table></div> : <p className="p-8 text-center text-sm text-[#7a5547]">Không tìm thấy sản phẩm phù hợp.</p>}
      </AdminPanel>

      {historyItem && <AdminPanel title={`Lịch sử kho: ${historyItem.productName}`} description="Các phiếu nhập, xuất, kiểm kê và hoàn kho đã ghi nhận." action={<button onClick={() => setHistoryItem(null)} className="grid size-9 place-items-center rounded-md hover:bg-[#E8D3C7]" aria-label="Đóng"><X size={18} /></button>}>
        <div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left text-sm"><thead className="bg-[#E8D3C7]/70 text-xs uppercase text-[#553B2F]"><tr><th className="px-5 py-3">Thời gian</th><th className="px-5 py-3">Nghiệp vụ</th><th className="px-5 py-3">Số lượng</th><th className="px-5 py-3">Tồn sau</th><th className="px-5 py-3">Lý do</th><th className="px-5 py-3">Tham chiếu</th></tr></thead><tbody className="divide-y divide-[#E8D3C7]">{movements.map((movement) => <tr key={movement.id}><td className="px-5 py-3">{formatDate(movement.createdAt)}</td><td className="px-5 py-3 font-bold">{movementLabels[movement.type]}</td><td className="px-5 py-3">{movement.quantity} kg</td><td className="px-5 py-3">{movement.balanceAfter ?? "-"} kg</td><td className="px-5 py-3">{movement.reason || "-"}</td><td className="px-5 py-3">{movement.reference || "-"}</td></tr>)}</tbody></table>{!movements.length && <p className="p-6 text-center text-sm text-[#7a5547]">Chưa có lịch sử biến động.</p>}</div>
      </AdminPanel>}
    </AdminPageShell>
  );
}
