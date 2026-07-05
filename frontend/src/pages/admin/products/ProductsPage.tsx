import { useEffect, useState } from "react";
import { PackagePlus } from "lucide-react";
import { AdminPanel } from "../../../components/admin/AdminPanel";
import { Button } from "../../../components/ui/button";
import { adminApi, formatCurrency, type Product } from "../../../lib/adminApi";
import { EmptyState, ErrorState, LoadingState } from "../shared/ApiState";
import { AdminPageShell } from "../shared/AdminPageShell";

export function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;

    async function loadProducts() {
      setLoading(true);
      setError("");

      try {
        const result = await adminApi.products();
        if (alive) setProducts(result);
      } catch (err) {
        if (alive) setError(err instanceof Error ? err.message : "Không tải được sản phẩm");
      } finally {
        if (alive) setLoading(false);
      }
    }

    loadProducts();
    return () => {
      alive = false;
    };
  }, []);

  return (
    <AdminPageShell
      title="Quản lý sản phẩm"
      description="Danh sách sản phẩm cà phê đang mở bán cho khách lẻ B2C và báo giá B2B."
    >
      {error ? <ErrorState message={error} /> : null}
      <AdminPanel
        title="Sản phẩm"
        description="Danh sách sản phẩm hiện có. Chức năng thêm, sửa, xóa sẽ nối tiếp sau khi hoàn thiện luồng quản trị."
        action={
          <Button className="rounded-lg bg-[#553B2F] text-white hover:bg-[#3f2a21]">
            <PackagePlus size={16} />
            Thêm sản phẩm
          </Button>
        }
      >
        {loading ? (
          <LoadingState />
        ) : products.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[840px] text-left text-sm">
              <thead className="bg-[#f8f2ed] text-xs font-black uppercase tracking-wide text-[#7a5547]">
                <tr>
                  <th className="px-5 py-4">Tên sản phẩm</th>
                  <th className="px-5 py-4">Danh mục</th>
                  <th className="px-5 py-4">Giá lẻ</th>
                  <th className="px-5 py-4">MOQ</th>
                  <th className="px-5 py-4">Kênh bán</th>
                  <th className="px-5 py-4">Bảng giá</th>
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
