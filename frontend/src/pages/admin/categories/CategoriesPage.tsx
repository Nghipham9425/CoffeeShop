import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Edit3, FolderPlus, RotateCw, Trash2, X } from "lucide-react";
import { AdminPanel } from "../../../components/admin/AdminPanel";
import { Button } from "../../../components/ui/button";
import { useAdminOutlet } from "../../../layouts/AdminLayout";
import { adminApi, type Category, type CategoryPayload } from "../../../lib/adminApi";
import { EmptyState, ErrorState, LoadingState } from "../shared/ApiState";
import { AdminPageShell } from "../shared/AdminPageShell";

const emptyForm: CategoryPayload = {
  name: "",
  slug: "",
  description: "",
  isActive: true,
};

export function CategoriesPage() {
  const { token } = useAdminOutlet();
  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState<CategoryPayload>(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const formTitle = useMemo(() => (editingId ? "Cập nhật danh mục" : "Thêm danh mục"), [editingId]);

  async function loadCategories() {
    setLoading(true);
    setError("");

    try {
      const result = await adminApi.categories({ includeInactive: true });
      setCategories(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không tải được danh mục");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCategories();
  }, []);

  function startCreate() {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(true);
  }

  function startEdit(category: Category) {
    setForm({
      name: category.name,
      slug: category.slug,
      description: category.description ?? "",
      isActive: category.isActive,
    });
    setEditingId(category.id);
    setShowForm(true);
  }

  function closeForm() {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(false);
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!token) return;

    setSaving(true);
    setError("");

    const payload: CategoryPayload = {
      name: form.name.trim(),
      slug: form.slug?.trim() || undefined,
      description: form.description?.trim() || undefined,
      isActive: form.isActive,
    };

    try {
      if (editingId) {
        await adminApi.updateCategory(token, editingId, payload);
      } else {
        await adminApi.createCategory(token, payload);
      }

      closeForm();
      await loadCategories();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không lưu được danh mục");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(category: Category) {
    if (!token) return;
    const confirmed = window.confirm(`Ẩn danh mục "${category.name}"?`);
    if (!confirmed) return;

    setError("");

    try {
      await adminApi.deleteCategory(token, category.id);
      await loadCategories();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không xóa được danh mục");
    }
  }

  return (
    <AdminPageShell title="Quản lý danh mục" description="Nhóm sản phẩm theo hạt rang, cà phê bột, drip bag, capsule và hòa tan.">
      {error ? <ErrorState message={error} /> : null}

      {showForm ? (
        <AdminPanel
          title={formTitle}
          description="Nhập thông tin danh mục để phân loại sản phẩm trên website."
          action={
            <Button type="button" variant="outline" onClick={closeForm} className="rounded-lg border-[#C7A792] text-[#553B2F] hover:bg-[#E8D3C7]">
              <X size={16} />
              Đóng
            </Button>
          }
        >
          <form onSubmit={handleSubmit} className="grid gap-4 p-5 md:grid-cols-2">
            <label className="grid gap-2 text-sm font-bold text-[#553B2F]">
              Tên danh mục
              <input
                className="h-11 rounded-lg border border-[#C7A792] px-3 outline-none focus:border-[#553B2F]"
                value={form.name}
                onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                required
              />
            </label>
            <label className="grid gap-2 text-sm font-bold text-[#553B2F]">
              Slug
              <input
                className="h-11 rounded-lg border border-[#C7A792] px-3 outline-none focus:border-[#553B2F]"
                value={form.slug}
                onChange={(event) => setForm((current) => ({ ...current, slug: event.target.value }))}
                placeholder="Bỏ trống để tự tạo"
              />
            </label>
            <label className="grid gap-2 text-sm font-bold text-[#553B2F] md:col-span-2">
              Mô tả
              <textarea
                className="min-h-24 rounded-lg border border-[#C7A792] px-3 py-2 outline-none focus:border-[#553B2F]"
                value={form.description}
                onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
              />
            </label>
            <label className="flex items-center gap-3 text-sm font-bold text-[#553B2F]">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(event) => setForm((current) => ({ ...current, isActive: event.target.checked }))}
              />
              Đang hiển thị
            </label>
            <div className="flex justify-end md:col-span-2">
              <Button disabled={saving} className="rounded-lg bg-[#553B2F] text-white hover:bg-[#3f2a21]">
                {saving ? "Đang lưu..." : "Lưu danh mục"}
              </Button>
            </div>
          </form>
        </AdminPanel>
      ) : null}

      <AdminPanel
        title="Danh mục sản phẩm"
        description="Danh sách nhóm sản phẩm đang dùng để phân loại hàng hóa trên website."
        action={
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" onClick={loadCategories} className="rounded-lg border-[#C7A792] text-[#553B2F] hover:bg-[#E8D3C7]">
              <RotateCw size={16} />
              Tải lại
            </Button>
            <Button type="button" onClick={startCreate} className="rounded-lg bg-[#553B2F] text-white hover:bg-[#3f2a21]">
              <FolderPlus size={16} />
              Thêm danh mục
            </Button>
          </div>
        }
      >
        {loading ? (
          <LoadingState />
        ) : categories.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] text-left text-sm">
              <thead className="bg-[#f8f2ed] text-xs font-black uppercase tracking-wide text-[#7a5547]">
                <tr>
                  <th className="px-5 py-4">Tên danh mục</th>
                  <th className="px-5 py-4">Slug</th>
                  <th className="px-5 py-4">Mô tả</th>
                  <th className="px-5 py-4">Sản phẩm</th>
                  <th className="px-5 py-4">Trạng thái</th>
                  <th className="px-5 py-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8D3C7]">
                {categories.map((category) => (
                  <tr key={category.id} className="text-[#553B2F]">
                    <td className="px-5 py-4 font-black">{category.name}</td>
                    <td className="px-5 py-4 font-semibold text-[#7a5547]">{category.slug}</td>
                    <td className="px-5 py-4 font-semibold text-[#7a5547]">{category.description ?? "Chưa có mô tả"}</td>
                    <td className="px-5 py-4 font-bold">{category.productCount}</td>
                    <td className="px-5 py-4 font-semibold">{category.isActive ? "Đang dùng" : "Đã ẩn"}</td>
                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <Button type="button" variant="outline" onClick={() => startEdit(category)} className="h-9 rounded-lg border-[#C7A792] px-3 text-[#553B2F] hover:bg-[#E8D3C7]">
                          <Edit3 size={15} />
                          Sửa
                        </Button>
                        <Button type="button" variant="outline" onClick={() => handleDelete(category)} className="h-9 rounded-lg border-red-200 px-3 text-red-700 hover:bg-red-50">
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
          <EmptyState message="Chưa có danh mục." />
        )}
      </AdminPanel>
    </AdminPageShell>
  );
}
