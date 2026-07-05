import { useEffect, useState } from "react";
import { FolderPlus } from "lucide-react";
import { AdminPanel } from "../../../components/admin/AdminPanel";
import { Button } from "../../../components/ui/button";
import { adminApi, type Category } from "../../../lib/adminApi";
import { EmptyState, ErrorState, LoadingState } from "../shared/ApiState";
import { AdminPageShell } from "../shared/AdminPageShell";

export function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;

    async function loadCategories() {
      setLoading(true);
      setError("");

      try {
        const result = await adminApi.categories();
        if (alive) setCategories(result);
      } catch (err) {
        if (alive) setError(err instanceof Error ? err.message : "Không tải được danh mục");
      } finally {
        if (alive) setLoading(false);
      }
    }

    loadCategories();
    return () => {
      alive = false;
    };
  }, []);

  return (
    <AdminPageShell title="Quản lý danh mục" description="Nhóm sản phẩm theo hạt rang, cà phê bột, drip bag, capsule và hòa tan.">
      {error ? <ErrorState message={error} /> : null}
      <AdminPanel
        title="Danh mục sản phẩm"
        description="Danh sách nhóm sản phẩm đang dùng để phân loại hàng hóa trên website."
        action={
          <Button className="rounded-lg bg-[#553B2F] text-white hover:bg-[#3f2a21]">
            <FolderPlus size={16} />
            Thêm danh mục
          </Button>
        }
      >
        {loading ? (
          <LoadingState />
        ) : categories.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="bg-[#f8f2ed] text-xs font-black uppercase tracking-wide text-[#7a5547]">
                <tr>
                  <th className="px-5 py-4">Tên danh mục</th>
                  <th className="px-5 py-4">Slug</th>
                  <th className="px-5 py-4">Mô tả</th>
                  <th className="px-5 py-4">Sản phẩm</th>
                  <th className="px-5 py-4">Trạng thái</th>
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
