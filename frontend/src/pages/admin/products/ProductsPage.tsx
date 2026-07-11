import { useEffect, useMemo, useState, type FormEvent } from "react";
import { BadgeDollarSign, Edit3, PackagePlus, RotateCw, Trash2, X } from "lucide-react";
import { AdminPanel } from "../../../components/admin/AdminPanel";
import { Button } from "../../../components/ui/button";
import { useAdminOutlet } from "../../../layouts/AdminLayout";
import {
  adminApi,
  formatCurrency,
  type Category,
  type Product,
  type ProductPayload,
  type ProductPricePayload,
} from "../../../lib/adminApi";
import { AdminPageShell } from "../shared/AdminPageShell";
import { EmptyState, ErrorState, LoadingState } from "../shared/ApiState";

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

const emptyPriceForm: ProductPricePayload = {
  priceType: "RETAIL",
  minQuantity: 1,
  price: 0,
  isActive: true,
};

const priceTypeLabels: Record<ProductPricePayload["priceType"], string> = {
  RETAIL: "Bán lẻ",
  WHOLESALE: "Bán sỉ",
  VIP: "VIP",
  B2B: "B2B",
};

const inputClass = "h-11 rounded-lg border border-[#C7A792] px-3 outline-none focus:border-[#553B2F]";
const labelClass = "grid gap-2 text-sm font-bold text-[#553B2F]";

export function ProductsPage() {
  const { token } = useAdminOutlet();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState<ProductPayload>(emptyProductForm);
  const [priceForm, setPriceForm] = useState<ProductPricePayload>(emptyPriceForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [pricingProduct, setPricingProduct] = useState<Product | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingPrice, setSavingPrice] = useState(false);
  const [error, setError] = useState("");

  const formTitle = useMemo(() => (editingId ? "Cập nhật sản phẩm" : "Thêm sản phẩm"), [editingId]);

  async function loadData() {
    setLoading(true);
    setError("");

    try {
      const [productResult, categoryResult] = await Promise.all([
        adminApi.products(),
        adminApi.categories({ includeInactive: true }),
      ]);
      setProducts(productResult);
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
    setEditingId(null);
    setShowForm(false);
  }

  function startPricing(product: Product) {
    setPricingProduct(product);
    setPriceForm(emptyPriceForm);
  }

  function closePricing() {
    setPricingProduct(null);
    setPriceForm(emptyPriceForm);
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!token) return;

    setSaving(true);
    setError("");

    const payload: ProductPayload = {
      categoryId: Number(form.categoryId),
      name: form.name.trim(),
      description: form.description?.trim() || undefined,
      unit: form.unit?.trim() || "kg",
      price: Number(form.price ?? 0),
      minimumOrderKg: Number(form.minimumOrderKg ?? 1),
      imageUrl: form.imageUrl?.trim() || undefined,
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

    try {
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

  async function handleDelete(product: Product) {
    if (!token) return;
    const confirmed = window.confirm(`Ẩn sản phẩm "${product.name}"?`);
    if (!confirmed) return;

    setError("");

    try {
      await adminApi.deleteProduct(token, product.id);
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không ẩn được sản phẩm");
    }
  }

  async function handleAddPrice(event: FormEvent) {
    event.preventDefault();
    if (!token || !pricingProduct) return;

    setSavingPrice(true);
    setError("");

    try {
      await adminApi.addProductPrice(token, pricingProduct.id, {
        priceType: priceForm.priceType,
        minQuantity: Number(priceForm.minQuantity),
        price: Number(priceForm.price),
        isActive: priceForm.isActive,
      });
      closePricing();
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không lưu được bảng giá");
    } finally {
      setSavingPrice(false);
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

      {pricingProduct ? (
        <AdminPanel
          title={`Bảng giá: ${pricingProduct.name}`}
          description="Thêm hoặc cập nhật mức giá theo loại khách hàng và số lượng tối thiểu."
          action={
            <Button type="button" variant="outline" onClick={closePricing} className="rounded-lg border-[#C7A792] text-[#553B2F] hover:bg-[#E8D3C7]">
              <X size={16} />
              Đóng
            </Button>
          }
        >
          <form onSubmit={handleAddPrice} className="grid gap-4 p-5 md:grid-cols-4">
            <label className={labelClass}>
              Loại giá
              <select className={inputClass} value={priceForm.priceType} onChange={(event) => setPriceForm((current) => ({ ...current, priceType: event.target.value as ProductPricePayload["priceType"] }))}>
                {Object.entries(priceTypeLabels).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </label>
            <label className={labelClass}>
              Số lượng tối thiểu
              <input type="number" min={1} className={inputClass} value={priceForm.minQuantity} onChange={(event) => setPriceForm((current) => ({ ...current, minQuantity: Number(event.target.value) }))} />
            </label>
            <label className={labelClass}>
              Giá
              <input type="number" min={0} className={inputClass} value={priceForm.price} onChange={(event) => setPriceForm((current) => ({ ...current, price: Number(event.target.value) }))} />
            </label>
            <div className="flex items-end">
              <Button disabled={savingPrice} className="w-full rounded-lg bg-[#553B2F] text-white hover:bg-[#3f2a21]">
                {savingPrice ? "Đang lưu..." : "Lưu giá"}
              </Button>
            </div>
          </form>
        </AdminPanel>
      ) : null}

      <AdminPanel
        title="Sản phẩm"
        description="Danh sách sản phẩm hiện có, có thể thêm mới, cập nhật, ẩn và quản lý bảng giá."
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
                  <th className="px-5 py-4">Bảng giá</th>
                  <th className="px-5 py-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8D3C7]">
                {products.map((product) => (
                  <tr key={product.id} className="text-[#553B2F]">
                    <td className="px-5 py-4 font-black">{product.name}</td>
                    <td className="px-5 py-4 font-semibold text-[#7a5547]">{product.categoryName}</td>
                    <td className="px-5 py-4 font-bold">{formatCurrency(product.price)}</td>
                    <td className="px-5 py-4 font-semibold">{product.minimumOrderKg} kg</td>
                    <td className="px-5 py-4 font-semibold">
                      {[product.isRetail ? "B2C" : "", product.isB2b ? "B2B" : ""].filter(Boolean).join(" / ")}
                    </td>
                    <td className="px-5 py-4 font-semibold">{product.prices.length} mức</td>
                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <Button type="button" variant="outline" onClick={() => startPricing(product)} className="h-9 rounded-lg border-[#C7A792] px-3 text-[#553B2F] hover:bg-[#E8D3C7]">
                          <BadgeDollarSign size={15} />
                          Giá
                        </Button>
                        <Button type="button" variant="outline" onClick={() => startEdit(product)} className="h-9 rounded-lg border-[#C7A792] px-3 text-[#553B2F] hover:bg-[#E8D3C7]">
                          <Edit3 size={15} />
                          Sửa
                        </Button>
                        <Button type="button" variant="outline" onClick={() => handleDelete(product)} className="h-9 rounded-lg border-red-200 px-3 text-red-700 hover:bg-red-50">
                          <Trash2 size={15} />
                          Ẩn
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState message="Chưa có sản phẩm." />
        )}
      </AdminPanel>
    </AdminPageShell>
  );
}
