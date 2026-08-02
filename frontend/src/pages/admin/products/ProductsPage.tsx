import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Edit3, Eye, EyeOff, ImageUp, PackagePlus, RotateCw, X } from "lucide-react";
import { AdminPanel } from "../../../components/admin/AdminPanel";
import { Button } from "../../../components/ui/button";
import { useAdminOutlet } from "../../../layouts/AdminLayout";
import {
  adminApi,
  formatCurrency,
  type Category,
  type Product,
  type ProductPayload,
} from "../../../lib/adminApi";
import { AdminPageShell } from "../shared/AdminPageShell";
import { EmptyState, ErrorState, LoadingState } from "../shared/ApiState";
import { Pagination } from "../../../components/ui/pagination";

const emptyProductForm: ProductPayload = {
  categoryId: 0,
  name: "",
  slug: "",
  description: "",
  unit: "kg",
  price: 0,
  minimumOrderKg: 5,
  imageUrl: "",
  isRetail: true,
  isB2b: true,
};

const inputClass = "h-11 rounded-lg border border-[#C7A792] px-3 outline-none focus:border-[#553B2F]";
const labelClass = "grid gap-2 text-sm font-bold text-[#553B2F]";

export function ProductsPage() {
  const { token } = useAdminOutlet();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState<ProductPayload>(emptyProductForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const formTitle = useMemo(() => (editingId ? "Cập nhật sản phẩm" : "Thêm sản phẩm"), [editingId]);

  async function loadData() {
    if (!token) return;
    setLoading(true);
    setError("");

    try {
      const [productResult, categoryResult] = await Promise.all([
        adminApi.adminProducts(token),
        adminApi.categories({ includeInactive: true }),
      ]);
      setProducts(productResult);
      setPage(1);
      setCategories(categoryResult.filter((category) => category.isActive));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không tải được sản phẩm");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  function startCreate() {
    setForm({
      ...emptyProductForm,
      categoryId: categories[0]?.id ?? 0,
    });
    setEditingId(null);
    setShowForm(true);
  }

  const visibleProducts = products.slice((page - 1) * pageSize, page * pageSize);

  function startEdit(product: Product) {
    setForm({
      categoryId: product.categoryId,
      name: product.name,
      slug: "",
      description: product.description ?? "",
      unit: product.unit,
      price: product.price ?? 0,
      minimumOrderKg: product.minimumOrderKg,
      imageUrl: product.imageUrl ?? "",
      isRetail: product.isRetail,
      isB2b: product.isB2b,
    });
    setEditingId(product.id);
    setShowForm(true);
  }

  function closeForm() {
    setForm(emptyProductForm);
    setImageFile(null);
    setEditingId(null);
    setShowForm(false);
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!token) return;

    setSaving(true);
    setError("");

    let imageUrl = form.imageUrl?.trim() || undefined;

    try {
      if (imageFile) {
        imageUrl = (await adminApi.uploadProductImage(token, imageFile)).url;
      }

    const payload: ProductPayload = {
      categoryId: Number(form.categoryId),
      name: form.name.trim(),
      description: form.description?.trim() || undefined,
      unit: form.unit?.trim() || "kg",
      price: Number(form.price ?? 0),
      minimumOrderKg: Number(form.minimumOrderKg ?? 1),
      imageUrl,
      isRetail: form.isRetail,
      isB2b: form.isB2b,
    };

    if (!payload.categoryId) {
      setSaving(false);
      setError("Vui lòng chọn danh mục sản phẩm trước khi lưu.");
      return;
    }

    if (payload.name.length < 2) {
      setSaving(false);
      setError("Tên sản phẩm phải có ít nhất 2 ký tự.");
      return;
    }

      if (editingId) {
        await adminApi.updateProduct(token, editingId, payload);
      } else {
        await adminApi.createProduct(token, payload);
      }

      closeForm();
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không lưu được sản phẩm");
    } finally {
      setSaving(false);
    }
  }

  async function handleVisibility(product: Product) {
    if (!token) return;
    const action = product.isActive ? "Ẩn" : "Hiện lại";
    const confirmed = window.confirm(`${action} sản phẩm "${product.name}"?`);
    if (!confirmed) return;

    setError("");

    try {
      await adminApi.updateProduct(token, product.id, { isActive: !product.isActive });
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : `Không thể ${action.toLowerCase()} sản phẩm`);
    }
  }

  return (
    <AdminPageShell
      title="Quản lý sản phẩm"
      description="Danh sách sản phẩm cà phê đang mở bán cho khách lẻ B2C và báo giá B2B."
    >
      {error ? <ErrorState message={error} /> : null}

      {showForm ? (
        <AdminPanel
          title={formTitle}
          description="Quản lý thông tin sản phẩm, giá lẻ, kênh bán và hình ảnh."
          action={
            <Button type="button" variant="outline" onClick={closeForm} className="rounded-lg border-[#C7A792] text-[#553B2F] hover:bg-[#E8D3C7]">
              <X size={16} />
              Đóng
            </Button>
          }
        >
          <form onSubmit={handleSubmit} className="grid gap-4 p-5 md:grid-cols-2">
            <label className={labelClass}>
              Tên sản phẩm
              <input className={inputClass} value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} required />
            </label>
            <label className={labelClass}>
              Danh mục
              <select className={inputClass} value={form.categoryId} onChange={(event) => setForm((current) => ({ ...current, categoryId: Number(event.target.value) }))} required>
                <option value={0}>Chọn danh mục</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </select>
            </label>
            <label className={labelClass}>
              Đơn vị
              <input className={inputClass} value={form.unit} onChange={(event) => setForm((current) => ({ ...current, unit: event.target.value }))} />
            </label>
            <label className={labelClass}>
              Giá lẻ
              <input type="number" min={0} className={inputClass} value={form.price} onChange={(event) => setForm((current) => ({ ...current, price: Number(event.target.value) }))} />
            </label>
            <label className={labelClass}>
              MOQ kg
              <input type="number" min={1} className={inputClass} value={form.minimumOrderKg} onChange={(event) => setForm((current) => ({ ...current, minimumOrderKg: Number(event.target.value) }))} />
            </label>
            <label className={`${labelClass} md:col-span-2`}>
              URL hình ảnh
              <input className={inputClass} value={form.imageUrl} onChange={(event) => setForm((current) => ({ ...current, imageUrl: event.target.value }))} />
            </label>
            <label className={`${labelClass} md:col-span-2`}>
              Tải ảnh từ máy tính (Cloudinary, tối đa 5 MB)
              <span className="flex flex-wrap items-center gap-3">
                <input type="file" accept="image/*" className="block w-full text-sm file:mr-3 file:rounded-md file:border-0 file:bg-[#E8D3C7] file:px-3 file:py-2 file:font-bold file:text-[#553B2F]" onChange={(event) => setImageFile(event.target.files?.[0] ?? null)} />
                {imageFile ? <span className="flex items-center gap-1 text-xs text-[#553B2F]"><ImageUp size={14} /> {imageFile.name}</span> : null}
              </span>
            </label>
            {form.imageUrl ? <div className="md:col-span-2"><img src={form.imageUrl} alt="Xem trước ảnh sản phẩm" className="h-32 w-32 rounded-lg border border-[#C7A792] object-cover" /></div> : null}
            <label className={`${labelClass} md:col-span-2`}>
              Mô tả
              <textarea className="min-h-24 rounded-lg border border-[#C7A792] px-3 py-2 outline-none focus:border-[#553B2F]" value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} />
            </label>
            <div className="flex flex-wrap gap-5 text-sm font-bold text-[#553B2F]">
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={form.isRetail} onChange={(event) => setForm((current) => ({ ...current, isRetail: event.target.checked }))} />
                Bán lẻ B2C
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={form.isB2b} onChange={(event) => setForm((current) => ({ ...current, isB2b: event.target.checked }))} />
                Báo giá B2B
              </label>
            </div>
            <div className="flex justify-end md:col-span-2">
              <Button disabled={saving} className="rounded-lg bg-[#553B2F] text-white hover:bg-[#3f2a21]">
                {saving ? "Đang lưu..." : "Lưu sản phẩm"}
              </Button>
            </div>
          </form>
        </AdminPanel>
      ) : null}

      <AdminPanel
        title="Sản phẩm"
        description="Hiển thị cả sản phẩm đang bán và sản phẩm đã ẩn để có thể khôi phục khi cần."
        action={
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" onClick={loadData} className="rounded-lg border-[#C7A792] text-[#553B2F] hover:bg-[#E8D3C7]">
              <RotateCw size={16} />
              Tải lại
            </Button>
            <Button type="button" onClick={startCreate} className="rounded-lg bg-[#553B2F] text-white hover:bg-[#3f2a21]">
              <PackagePlus size={16} />
              Thêm sản phẩm
            </Button>
          </div>
        }
      >
        {loading ? (
          <LoadingState />
        ) : products.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] text-left text-sm">
              <thead className="bg-[#f8f2ed] text-xs font-black uppercase tracking-wide text-[#7a5547]">
                <tr>
                  <th className="px-5 py-4">Tên sản phẩm</th>
                  <th className="px-5 py-4">Danh mục</th>
                  <th className="px-5 py-4">Giá lẻ</th>
                  <th className="px-5 py-4">MOQ</th>
                  <th className="px-5 py-4">Kênh bán</th>
                  <th className="px-5 py-4">Trạng thái</th>
                  <th className="px-5 py-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8D3C7]">
                {visibleProducts.map((product) => (
                  <tr key={product.id} className={`text-[#553B2F] ${product.isActive ? "" : "bg-stone-50 opacity-70"}`}>
                    <td className="px-5 py-4 font-black">{product.name}</td>
                    <td className="px-5 py-4 font-semibold text-[#7a5547]">{product.categoryName}</td>
                    <td className="px-5 py-4 font-bold">{formatCurrency(product.price)}</td>
                    <td className="px-5 py-4 font-semibold">{product.minimumOrderKg} kg</td>
                    <td className="px-5 py-4 font-semibold">
                      {[product.isRetail ? "B2C" : "", product.isB2b ? "B2B" : ""].filter(Boolean).join(" / ")}
                    </td>
                    <td className="px-5 py-4 font-semibold">{product.isActive ? "Đang hiển thị" : "Đã ẩn"}</td>
                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <Button type="button" variant="outline" onClick={() => startEdit(product)} className="h-9 rounded-lg border-[#C7A792] px-3 text-[#553B2F] hover:bg-[#E8D3C7]">
                          <Edit3 size={15} />
                          Sửa
                        </Button>
                        <Button type="button" variant="outline" onClick={() => handleVisibility(product)} className={`h-9 rounded-lg px-3 ${product.isActive ? "border-red-200 text-red-700 hover:bg-red-50" : "border-emerald-200 text-emerald-700 hover:bg-emerald-50"}`}>
                          {product.isActive ? <EyeOff size={15} /> : <Eye size={15} />}
                          {product.isActive ? "Ẩn" : "Hiện lại"}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <Pagination page={page} pageSize={pageSize} total={products.length} onChange={setPage} />
          </div>
        ) : (
          <EmptyState message="Chưa có sản phẩm." />
        )}
      </AdminPanel>
    </AdminPageShell>
  );
}
