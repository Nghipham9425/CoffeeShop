import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { AlertTriangle, Boxes, RefreshCw } from "lucide-react";
import { AdminPanel } from "../../../components/admin/AdminPanel";
import { AdminStatusBadge } from "../../../components/admin/AdminStatusBadge";
import { Button } from "../../../components/ui/button";
import { useAdminOutlet } from "../../../layouts/AdminLayout";
import { adminApi, formatDate, type AdminInventory, type Product } from "../../../lib/adminApi";
import { EmptyState, ErrorState, LoadingState } from "../shared/ApiState";
import { AdminPageShell } from "../shared/AdminPageShell";

type MovementForm = {
  productId: number;
  type: "IMPORT" | "EXPORT" | "ADJUSTMENT" | "RETURN";
  quantity: number;
  warehouse: string;
  reason: string;
  reference: string;
};

const emptyMovementForm: MovementForm = {
  productId: 0,
  type: "IMPORT",
  quantity: 1,
  warehouse: "Kho chinh",
  reason: "",
  reference: "",
};

export function InventoryPage() {
  const { token, sessionVersion } = useAdminOutlet();
  const [inventories, setInventories] = useState<AdminInventory[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [movementForm, setMovementForm] = useState<MovementForm>(emptyMovementForm);
  const [keyword, setKeyword] = useState("");
  const [lowStock, setLowStock] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const lowStockCount = useMemo(() => inventories.filter((item) => item.isLowStock).length, [inventories]);

  const loadData = useCallback(async () => {
    if (!token) return;

    setLoading(true);
    setError("");

    try {
      const [inventoryResult, productResult] = await Promise.all([
        adminApi.inventories(token, { keyword, lowStock }),
        adminApi.products(),
      ]);
      setInventories(inventoryResult);
      setProducts(productResult);
      if (!movementForm.productId && productResult[0]) {
        setMovementForm((current) => ({ ...current, productId: productResult[0].id }));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không tải được dữ liệu kho");
    } finally {
      setLoading(false);
    }
  }, [keyword, lowStock, movementForm.productId, token]);

  useEffect(() => {
    loadData();
  }, [loadData, sessionVersion]);

  async function submitMovement(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token || !movementForm.productId) return;

    setSaving(true);
    setError("");

    try {
      await adminApi.createStockMovement(token, {
        productId: movementForm.productId,
        type: movementForm.type,
        quantity: Number(movementForm.quantity),
        warehouse: movementForm.warehouse,
        reason: movementForm.reason || undefined,
        reference: movementForm.reference || undefined,
      });
      setMovementForm((current) => ({ ...emptyMovementForm, productId: current.productId }));
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không tạo được biến động kho");
    } finally {
      setSaving(false);
    }
  }

  async function updateInventory(item: AdminInventory) {
    if (!token) return;
    const quantity = Number(window.prompt("Số lượng tồn:", String(item.quantity)));
    if (Number.isNaN(quantity)) return;
    const minQuantity = Number(window.prompt("Tồn tối thiểu:", String(item.minQuantity)));
    if (Number.isNaN(minQuantity)) return;

    setEditingId(item.id);
    setError("");

    try {
      const updated = await adminApi.updateInventory(token, item.id, { quantity, minQuantity });
      setInventories((current) => current.map((inventory) => (inventory.id === updated.id ? updated : inventory)));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không cập nhật được tồn kho");
    } finally {
      setEditingId(null);
    }
  }

  return (
    <AdminPageShell
      title="Quản lý tồn kho"
      description="Theo dõi tồn kho, cảnh báo hết hàng và ghi nhận nhập/xuất/điều chỉnh kho."
    >
      {error ? <ErrorState message={error} /> : null}

      <div className="grid gap-4 md:grid-cols-3">
        <AdminPanel title="Mã kho đang xem" description="Theo bộ lọc hiện tại.">
          <p className="p-5 text-3xl font-black text-[#553B2F]">{inventories.length}</p>
        </AdminPanel>
        <AdminPanel title="Cảnh báo tồn thấp" description="Số lượng nhỏ hơn hoặc bằng tồn tối thiểu.">
          <p className="p-5 text-3xl font-black text-red-700">{lowStockCount}</p>
        </AdminPanel>
        <AdminPanel title="Sản phẩm đang quản lý" description="Dữ liệu lấy từ danh mục sản phẩm.">
          <p className="p-5 text-3xl font-black text-[#553B2F]">{products.length}</p>
        </AdminPanel>
      </div>

      <AdminPanel title="Tạo phiếu kho nhanh" description="Dùng cho nhập kho, xuất kho, trả hàng hoặc điều chỉnh số lượng.">
        <form onSubmit={submitMovement} className="grid gap-3 p-5 md:grid-cols-3 xl:grid-cols-6">
          <select
            value={movementForm.productId}
            onChange={(event) => setMovementForm((current) => ({ ...current, productId: Number(event.target.value) }))}
            className="rounded-lg border border-[#C7A792] px-4 py-2 text-sm font-semibold"
          >
            {products.map((product) => (
              <option key={product.id} value={product.id}>
                {product.name}
              </option>
            ))}
          </select>
          <select
            value={movementForm.type}
            onChange={(event) => setMovementForm((current) => ({ ...current, type: event.target.value as MovementForm["type"] }))}
            className="rounded-lg border border-[#C7A792] px-4 py-2 text-sm font-semibold"
          >
            <option value="IMPORT">Nhập kho</option>
            <option value="EXPORT">Xuất kho</option>
            <option value="ADJUSTMENT">Điều chỉnh</option>
            <option value="RETURN">Trả hàng</option>
          </select>
          <input
            type="number"
            min={1}
            value={movementForm.quantity}
            onChange={(event) => setMovementForm((current) => ({ ...current, quantity: Number(event.target.value) }))}
            className="rounded-lg border border-[#C7A792] px-4 py-2 text-sm font-semibold"
          />
          <input
            value={movementForm.reason}
            onChange={(event) => setMovementForm((current) => ({ ...current, reason: event.target.value }))}
            placeholder="Lý do"
            className="rounded-lg border border-[#C7A792] px-4 py-2 text-sm font-semibold"
          />
          <input
            value={movementForm.reference}
            onChange={(event) => setMovementForm((current) => ({ ...current, reference: event.target.value }))}
            placeholder="Mã tham chiếu"
            className="rounded-lg border border-[#C7A792] px-4 py-2 text-sm font-semibold"
          />
          <Button disabled={saving} className="rounded-lg bg-[#553B2F] text-white hover:bg-[#3f2a21]">
            <Boxes size={16} />
            Lưu phiếu
          </Button>
        </form>
      </AdminPanel>

      <AdminPanel
        title="Danh sách tồn kho"
        description="Kiểm tra tồn thực tế và ngưỡng cảnh báo."
        action={
          <Button onClick={loadData} disabled={loading} className="rounded-lg bg-[#553B2F] text-white hover:bg-[#3f2a21]">
            <RefreshCw size={16} />
            Tải lại
          </Button>
        }
      >
        <div className="grid gap-3 border-b border-[#E8D3C7] p-5 md:grid-cols-[1fr_auto_auto]">
          <input
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            placeholder="Tìm sản phẩm trong kho..."
            className="rounded-lg border border-[#C7A792] px-4 py-2 text-sm font-semibold outline-none focus:border-[#553B2F]"
          />
          <label className="flex items-center gap-2 rounded-lg border border-[#C7A792] px-4 py-2 text-sm font-bold text-[#553B2F]">
            <input type="checkbox" checked={lowStock} onChange={(event) => setLowStock(event.target.checked)} />
            Chỉ tồn thấp
          </label>
          <Button onClick={loadData} className="rounded-lg bg-[#AA7864] text-white hover:bg-[#8d604f]">
            Tìm
          </Button>
        </div>

        {loading ? (
          <LoadingState />
        ) : inventories.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="bg-[#E8D3C7]/70 text-xs uppercase text-[#553B2F]">
                <tr>
                  <th className="px-5 py-3">Sản phẩm</th>
                  <th className="px-5 py-3">Kho</th>
                  <th className="px-5 py-3">Số lượng</th>
                  <th className="px-5 py-3">Cảnh báo</th>
                  <th className="px-5 py-3">Cập nhật</th>
                  <th className="px-5 py-3">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8D3C7]">
                {inventories.map((item) => (
                  <tr key={item.id}>
                    <td className="px-5 py-4">
                      <p className="font-black text-[#553B2F]">{item.productName}</p>
                      <p className="text-xs font-bold text-[#AA7864]">{item.categoryName}</p>
                    </td>
                    <td className="px-5 py-4 font-semibold text-[#7a5547]">{item.warehouse}</td>
                    <td className="px-5 py-4 text-2xl font-black text-[#553B2F]">{item.quantity}</td>
                    <td className="px-5 py-4">
                      {item.isLowStock ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-3 py-1 text-xs font-black text-red-700">
                          <AlertTriangle size={14} />
                          Tồn thấp
                        </span>
                      ) : (
                        <AdminStatusBadge status="Ổn định" />
                      )}
                      <p className="mt-1 text-xs font-semibold text-[#7a5547]">Tối thiểu: {item.minQuantity}</p>
                    </td>
                    <td className="px-5 py-4 text-xs font-semibold text-[#7a5547]">{formatDate(item.updatedAt)}</td>
                    <td className="px-5 py-4">
                      <Button
                        type="button"
                        variant="outline"
                        disabled={editingId === item.id}
                        onClick={() => updateInventory(item)}
                        className="rounded-lg border-[#C7A792] text-[#553B2F] hover:bg-[#E8D3C7]"
                      >
                        Sửa tồn
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState message="Chưa có dữ liệu tồn kho phù hợp." />
        )}
      </AdminPanel>
    </AdminPageShell>
  );
}
