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
import { EmptyState, ErrorState, LoadingState } from "../shared/ApiState";
import { AdminPageShell } from "../shared/AdminPageShell";

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
  RETAIL: "BÃ¡n láº»",
  WHOLESALE: "BÃ¡n sá»‰",
  VIP: "VIP",
  B2B: "B2B",
};

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

  const formTitle = useMemo(() => (editingId ? "Cáº­p nháº­t sáº£n pháº©m" : "ThÃªm sáº£n pháº©m"), [editingId]);

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
      setError(err instanceof Error ? err.message : "KhÃ´ng táº£i Ä‘Æ°á»£c sáº£n pháº©m");
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
      setError("Vui lÃ²ng chá»n danh má»¥c sáº£n pháº©m trÆ°á»›c khi lÆ°u.");
      return;
    }

    if (payload.name.length < 2) {
      setSaving(false);
      setError("TÃªn sáº£n pháº©m pháº£i cÃ³ Ã­t nháº¥t 2 kÃ½ tá»±.");
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
      setError(err instanceof Error ? err.message : "KhÃ´ng lÆ°u Ä‘Æ°á»£c sáº£n pháº©m");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(product: Product) {
    if (!token) return;
    const confirmed = window.confirm(`áº¨n sáº£n pháº©m "${product.name}"?`);
    if (!confirmed) return;

    setError("");

    try {
      await adminApi.deleteProduct(token, product.id);
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "KhÃ´ng xÃ³a Ä‘Æ°á»£c sáº£n pháº©m");
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
      setError(err instanceof Error ? err.message : "KhÃ´ng lÆ°u Ä‘Æ°á»£c báº£ng giÃ¡");
    } finally {
      setSavingPrice(false);
    }
  }

  return (
    <AdminPageShell
      title="Quáº£n lÃ½ sáº£n pháº©m"
      description="Danh sÃ¡ch sáº£n pháº©m cÃ  phÃª Ä‘ang má»Ÿ bÃ¡n cho khÃ¡ch láº» B2C vÃ  bÃ¡o giÃ¡ B2B."
    >
      {error ? <ErrorState message={error} /> : null}

      {showForm ? (
        <AdminPanel
          title={formTitle}
          description="Quáº£n lÃ½ thÃ´ng tin sáº£n pháº©m, giÃ¡ láº», kÃªnh bÃ¡n vÃ  hÃ¬nh áº£nh."
          action={
            <Button type="button" variant="outline" onClick={closeForm} className="rounded-lg border-[#C7A792] text-[#553B2F] hover:bg-[#E8D3C7]">
              <X size={16} />
              ÄÃ³ng
            </Button>
          }
        >
          <form onSubmit={handleSubmit} className="grid gap-4 p-5 md:grid-cols-2">
            <label className="grid gap-2 text-sm font-bold text-[#553B2F]">
              TÃªn sáº£n pháº©m
              <input className="h-11 rounded-lg border border-[#C7A792] px-3 outline-none focus:border-[#553B2F]" value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} required />
            </label>
            <label className="grid gap-2 text-sm font-bold text-[#553B2F]">
              Danh má»¥c
              <select className="h-11 rounded-lg border border-[#C7A792] px-3 outline-none focus:border-[#553B2F]" value={form.categoryId} onChange={(event) => setForm((current) => ({ ...current, categoryId: Number(event.target.value) }))} required>
                <option value={0}>Chá»n danh má»¥c</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </select>
            </label>
            <label className="grid gap-2 text-sm font-bold text-[#553B2F]">
              ÄÆ¡n vá»‹
              <input className="h-11 rounded-lg border border-[#C7A792] px-3 outline-none focus:border-[#553B2F]" value={form.unit} onChange={(event) => setForm((current) => ({ ...current, unit: event.target.value }))} />
            </label>
            <label className="grid gap-2 text-sm font-bold text-[#553B2F]">
              GiÃ¡ láº»
              <input type="number" min={0} className="h-11 rounded-lg border border-[#C7A792] px-3 outline-none focus:border-[#553B2F]" value={form.price} onChange={(event) => setForm((current) => ({ ...current, price: Number(event.target.value) }))} />
            </label>
            <label className="grid gap-2 text-sm font-bold text-[#553B2F]">
              MOQ kg
              <input type="number" min={1} className="h-11 rounded-lg border border-[#C7A792] px-3 outline-none focus:border-[#553B2F]" value={form.minimumOrderKg} onChange={(event) => setForm((current) => ({ ...current, minimumOrderKg: Number(event.target.value) }))} />
            </label>
            <label className="grid gap-2 text-sm font-bold text-[#553B2F] md:col-span-2">
              URL hÃ¬nh áº£nh
              <input className="h-11 rounded-lg border border-[#C7A792] px-3 outline-none focus:border-[#553B2F]" value={form.imageUrl} onChange={(event) => setForm((current) => ({ ...current, imageUrl: event.target.value }))} />
            </label>
            <label className="grid gap-2 text-sm font-bold text-[#553B2F] md:col-span-2">
              MÃ´ táº£
              <textarea className="min-h-24 rounded-lg border border-[#C7A792] px-3 py-2 outline-none focus:border-[#553B2F]" value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} />
            </label>
            <div className="flex flex-wrap gap-5 text-sm font-bold text-[#553B2F]">
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={form.isRetail} onChange={(event) => setForm((current) => ({ ...current, isRetail: event.target.checked }))} />
                BÃ¡n láº» B2C
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={form.isB2b} onChange={(event) => setForm((current) => ({ ...current, isB2b: event.target.checked }))} />
                BÃ¡o giÃ¡ B2B
              </label>
            </div>
            <div className="flex justify-end md:col-span-2">
              <Button disabled={saving} className="rounded-lg bg-[#553B2F] text-white hover:bg-[#3f2a21]">
                {saving ? "Äang lÆ°u..." : "LÆ°u sáº£n pháº©m"}
              </Button>
            </div>
          </form>
        </AdminPanel>
      ) : null}

      {pricingProduct ? (
        <AdminPanel
          title={`Báº£ng giÃ¡: ${pricingProduct.name}`}
          description="ThÃªm hoáº·c cáº­p nháº­t má»©c giÃ¡ theo loáº¡i khÃ¡ch hÃ ng vÃ  sá»‘ lÆ°á»£ng tá»‘i thiá»ƒu."
          action={
            <Button type="button" variant="outline" onClick={closePricing} className="rounded-lg border-[#C7A792] text-[#553B2F] hover:bg-[#E8D3C7]">
              <X size={16} />
              ÄÃ³ng
            </Button>
          }
        >
          <form onSubmit={handleAddPrice} className="grid gap-4 p-5 md:grid-cols-4">
            <label className="grid gap-2 text-sm font-bold text-[#553B2F]">
              Loáº¡i giÃ¡
              <select className="h-11 rounded-lg border border-[#C7A792] px-3 outline-none focus:border-[#553B2F]" value={priceForm.priceType} onChange={(event) => setPriceForm((current) => ({ ...current, priceType: event.target.value as ProductPricePayload["priceType"] }))}>
                {Object.entries(priceTypeLabels).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </label>
            <label className="grid gap-2 text-sm font-bold text-[#553B2F]">
              Sá»‘ lÆ°á»£ng tá»‘i thiá»ƒu
              <input type="number" min={1} className="h-11 rounded-lg border border-[#C7A792] px-3 outline-none focus:border-[#553B2F]" value={priceForm.minQuantity} onChange={(event) => setPriceForm((current) => ({ ...current, minQuantity: Number(event.target.value) }))} />
            </label>
            <label className="grid gap-2 text-sm font-bold text-[#553B2F]">
              GiÃ¡
              <input type="number" min={0} className="h-11 rounded-lg border border-[#C7A792] px-3 outline-none focus:border-[#553B2F]" value={priceForm.price} onChange={(event) => setPriceForm((current) => ({ ...current, price: Number(event.target.value) }))} />
            </label>
            <div className="flex items-end">
              <Button disabled={savingPrice} className="w-full rounded-lg bg-[#553B2F] text-white hover:bg-[#3f2a21]">
                {savingPrice ? "Äang lÆ°u..." : "LÆ°u giÃ¡"}
              </Button>
            </div>
          </form>
        </AdminPanel>
      ) : null}

      <AdminPanel
        title="Sáº£n pháº©m"
        description="Danh sÃ¡ch sáº£n pháº©m hiá»‡n cÃ³, cÃ³ thá»ƒ thÃªm má»›i, cáº­p nháº­t, áº©n vÃ  quáº£n lÃ½ báº£ng giÃ¡."
        action={
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" onClick={loadData} className="rounded-lg border-[#C7A792] text-[#553B2F] hover:bg-[#E8D3C7]">
              <RotateCw size={16} />
              Táº£i láº¡i
            </Button>
            <Button type="button" onClick={startCreate} className="rounded-lg bg-[#553B2F] text-white hover:bg-[#3f2a21]">
              <PackagePlus size={16} />
              ThÃªm sáº£n pháº©m
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
                  <th className="px-5 py-4">TÃªn sáº£n pháº©m</th>
                  <th className="px-5 py-4">Danh má»¥c</th>
                  <th className="px-5 py-4">GiÃ¡ láº»</th>
                  <th className="px-5 py-4">MOQ</th>
                  <th className="px-5 py-4">KÃªnh bÃ¡n</th>
                  <th className="px-5 py-4">Báº£ng giÃ¡</th>
                  <th className="px-5 py-4 text-right">Thao tÃ¡c</th>
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
                    <td className="px-5 py-4 font-semibold">{product.prices.length} má»©c</td>
                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <Button type="button" variant="outline" onClick={() => startPricing(product)} className="h-9 rounded-lg border-[#C7A792] px-3 text-[#553B2F] hover:bg-[#E8D3C7]">
                          <BadgeDollarSign size={15} />
                          GiÃ¡
                        </Button>
                        <Button type="button" variant="outline" onClick={() => startEdit(product)} className="h-9 rounded-lg border-[#C7A792] px-3 text-[#553B2F] hover:bg-[#E8D3C7]">
                          <Edit3 size={15} />
                          Sá»­a
                        </Button>
                        <Button type="button" variant="outline" onClick={() => handleDelete(product)} className="h-9 rounded-lg border-red-200 px-3 text-red-700 hover:bg-red-50">
                          <Trash2 size={15} />
                          áº¨n
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState message="ChÆ°a cÃ³ sáº£n pháº©m." />
        )}
      </AdminPanel>
    </AdminPageShell>
  );
}
