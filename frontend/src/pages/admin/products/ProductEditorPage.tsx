import { ArrowLeft, ImageUp, Save } from "lucide-react";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Button } from "../../../components/ui/button";
import { useAdminOutlet } from "../../../layouts/AdminLayout";
import { adminApi, type Category, type ProductPayload } from "../../../lib/adminApi";
import { AdminPageShell } from "../shared/AdminPageShell";
import { ErrorState, LoadingState } from "../shared/ApiState";

const blankProduct: ProductPayload = { categoryId: 0, name: "", description: "", unit: "kg", price: 0, minimumOrderKg: 1, imageUrl: "", isRetail: true, isB2b: true };
const inputClass = "h-11 rounded-lg border border-[#d9c6b7] bg-white px-3 outline-none transition focus:border-[#6a3e2c] focus:ring-2 focus:ring-[#e8d4c2]";
const labelClass = "grid gap-2 text-sm font-bold text-[#4c3025]";

export function ProductEditorPage() {
  const { token } = useAdminOutlet();
  const { id } = useParams();
  const navigate = useNavigate();
  const productId = Number(id);
  const isEditing = Number.isInteger(productId) && productId > 0;
  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState<ProductPayload>(blankProduct);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const title = useMemo(() => isEditing ? "Chỉnh sửa sản phẩm" : "Thêm sản phẩm", [isEditing]);

  useEffect(() => {
    if (!token) return;
    void (async () => {
      try {
        const [categoryData, productData] = await Promise.all([
          adminApi.categories({ includeInactive: true }),
          isEditing ? adminApi.adminProducts(token) : Promise.resolve([]),
        ]);
        const activeCategories = categoryData.filter((item) => item.isActive);
        setCategories(activeCategories);
        if (!isEditing) {
          setForm((current) => ({ ...current, categoryId: activeCategories[0]?.id ?? 0 }));
          return;
        }
        const product = productData.find((item) => item.id === productId);
        if (!product) throw new Error("Không tìm thấy sản phẩm.");
        setForm({ categoryId: product.categoryId, name: product.name, description: product.description ?? "", unit: product.unit, price: product.price ?? 0, minimumOrderKg: product.minimumOrderKg, imageUrl: product.imageUrl ?? "", isRetail: product.isRetail, isB2b: product.isB2b, isActive: product.isActive });
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : "Không thể tải dữ liệu sản phẩm.");
      } finally {
        setLoading(false);
      }
    })();
  }, [isEditing, productId, token]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token) return;
    if (!form.categoryId) { setError("Vui lòng chọn danh mục."); return; }
    if ((form.name ?? "").trim().length < 2) { setError("Tên sản phẩm phải có ít nhất 2 ký tự."); return; }
    setSaving(true);
    setError("");
    try {
      const imageUrl = imageFile ? (await adminApi.uploadProductImage(token, imageFile)).url : form.imageUrl?.trim() || undefined;
      const payload: ProductPayload = { ...form, name: form.name.trim(), description: form.description?.trim() || undefined, unit: form.unit?.trim() || "kg", price: Number(form.price ?? 0), minimumOrderKg: Number(form.minimumOrderKg ?? 1), imageUrl };
      if (isEditing) await adminApi.updateProduct(token, productId, payload);
      else await adminApi.createProduct(token, payload);
      navigate("/admin/san-pham");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Không thể lưu sản phẩm.");
    } finally {
      setSaving(false);
    }
  }

  return <AdminPageShell title={title} description="Nhập thông tin bán lẻ, báo giá doanh nghiệp và ảnh hiển thị của sản phẩm.">
    {error ? <ErrorState message={error} /> : null}
    {loading ? <LoadingState /> : <form onSubmit={submit} className="overflow-hidden rounded-lg border border-[#dfcec0] bg-white shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#eadfd6] px-5 py-4">
        <div><p className="font-black text-[#3b2419]">Thông tin sản phẩm</p><p className="mt-1 text-sm text-[#806556]">Slug được hệ thống tự tạo từ tên sản phẩm.</p></div>
        <Button asChild type="button" variant="outline" className="border-[#d1b8a5] text-[#5b3424] hover:bg-[#f6ebe3]"><Link to="/admin/san-pham"><ArrowLeft size={16} /> Quay lại</Link></Button>
      </div>
      <div className="grid gap-5 p-5 md:grid-cols-2">
        <label className={labelClass}>Tên sản phẩm<input className={inputClass} value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} required /></label>
        <label className={labelClass}>Danh mục<select className={inputClass} value={form.categoryId} onChange={(event) => setForm((current) => ({ ...current, categoryId: Number(event.target.value) }))}><option value={0}>Chọn danh mục</option>{categories.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
        <label className={labelClass}>Đơn vị<input className={inputClass} value={form.unit} onChange={(event) => setForm((current) => ({ ...current, unit: event.target.value }))} /></label>
        <label className={labelClass}>Giá bán lẻ<input type="number" min={0} className={inputClass} value={form.price} onChange={(event) => setForm((current) => ({ ...current, price: Number(event.target.value) }))} /></label>
        <label className={labelClass}>Số lượng tối thiểu (kg)<input type="number" min={1} className={inputClass} value={form.minimumOrderKg} onChange={(event) => setForm((current) => ({ ...current, minimumOrderKg: Number(event.target.value) }))} /></label>
        <label className="grid gap-2 text-sm font-bold text-[#4c3025]"><span>Kênh bán</span><span className="flex h-11 items-center gap-5 rounded-lg border border-[#d9c6b7] px-3"><label className="flex items-center gap-2"><input type="checkbox" checked={form.isRetail} onChange={(event) => setForm((current) => ({ ...current, isRetail: event.target.checked }))} /> B2C</label><label className="flex items-center gap-2"><input type="checkbox" checked={form.isB2b} onChange={(event) => setForm((current) => ({ ...current, isB2b: event.target.checked }))} /> B2B</label></span></label>
        <label className={`${labelClass} md:col-span-2`}>URL hình ảnh<input className={inputClass} value={form.imageUrl} onChange={(event) => setForm((current) => ({ ...current, imageUrl: event.target.value }))} placeholder="https://..." /></label>
        <label className={`${labelClass} md:col-span-2`}>Tải ảnh từ máy tính (Cloudinary, tối đa 5 MB)<span className="flex items-center gap-3 rounded-lg border border-dashed border-[#d9c6b7] p-3"><ImageUp size={18} className="text-[#8b583a]" /><input type="file" accept="image/*" className="text-sm" onChange={(event) => setImageFile(event.target.files?.[0] ?? null)} />{imageFile ? <span className="text-xs text-[#765544]">{imageFile.name}</span> : null}</span></label>
        {form.imageUrl ? <img src={form.imageUrl} alt="Xem trước sản phẩm" className="h-44 w-44 rounded-lg border border-[#decbbb] object-contain p-2" /> : null}
        <label className={`${labelClass} md:col-span-2`}>Mô tả<textarea className="min-h-32 rounded-lg border border-[#d9c6b7] bg-white px-3 py-2 outline-none transition focus:border-[#6a3e2c] focus:ring-2 focus:ring-[#e8d4c2]" value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} /></label>
      </div>
      <div className="flex justify-end border-t border-[#eadfd6] bg-[#fcf8f5] px-5 py-4"><Button disabled={saving} className="bg-[#5b3322] text-white hover:bg-[#3e2116]"><Save size={16} />{saving ? "Đang lưu..." : "Lưu sản phẩm"}</Button></div>
    </form>}
  </AdminPageShell>;
}
