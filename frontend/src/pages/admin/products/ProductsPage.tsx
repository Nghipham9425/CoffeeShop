import { Edit3, Eye, EyeOff, PackagePlus } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AdminPanel } from "../../../components/admin/AdminPanel";
import { Button } from "../../../components/ui/button";
import { Pagination } from "../../../components/ui/pagination";
import { useAdminOutlet } from "../../../layouts/AdminLayout";
import { adminApi, formatCurrency, type Product } from "../../../lib/adminApi";
import { AdminPageShell } from "../shared/AdminPageShell";
import { EmptyState, ErrorState, LoadingState } from "../shared/ApiState";

const pageSize = 10;

export function ProductsPage() {
  const { token } = useAdminOutlet();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);

  async function loadData() {
    if (!token) return;
    setLoading(true);
    setError("");
    try {
      setProducts(await adminApi.adminProducts(token));
      setPage(1);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Không thể tải sản phẩm.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void loadData(); }, [token]);

  async function toggleVisibility(product: Product) {
    if (!token || !window.confirm(`${product.isActive ? "Ẩn" : "Hiện lại"} sản phẩm “${product.name}”?`)) return;
    try {
      await adminApi.updateProduct(token, product.id, { isActive: !product.isActive });
      await loadData();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Không thể cập nhật trạng thái sản phẩm.");
    }
  }

  const items = products.slice((page - 1) * pageSize, page * pageSize);

  return <AdminPageShell title="Sản phẩm" description="Danh mục hàng hóa đang kinh doanh cho khách lẻ B2C và khách doanh nghiệp B2B.">
    {error ? <ErrorState message={error} /> : null}
    <AdminPanel title="Danh sách sản phẩm" description="Chọn một dòng để xem chi tiết hoặc chuyển sang trang chỉnh sửa riêng." action={<Button asChild className="bg-[#553B2F] text-white hover:bg-[#3f2a21]"><Link to="/admin/san-pham/them"><PackagePlus size={16} /> Thêm sản phẩm</Link></Button>}>
      {loading ? <LoadingState /> : !products.length ? <EmptyState message="Chưa có sản phẩm." /> : <div className="overflow-x-auto"><table className="w-full min-w-[950px] text-left text-sm"><thead className="bg-[#f8f2ec] text-xs font-black uppercase tracking-wide text-[#806556]"><tr><th className="px-5 py-4">Sản phẩm</th><th className="px-5 py-4">Danh mục</th><th className="px-5 py-4">Giá lẻ</th><th className="px-5 py-4">Kho</th><th className="px-5 py-4">Kênh bán</th><th className="px-5 py-4">Trạng thái</th><th className="px-5 py-4 text-right">Thao tác</th></tr></thead><tbody className="divide-y divide-[#eadfd6]">{items.map((product) => <tr key={product.id} className={`text-[#4c3025] transition hover:bg-[#fcf8f5] ${product.isActive ? "" : "bg-stone-50 opacity-70"}`}><td className="px-5 py-4"><Link to={`/admin/san-pham/${product.id}`} className="font-black hover:text-[#8b583a]">{product.name}</Link><p className="mt-1 text-xs text-[#806556]">MOQ {product.minimumOrderKg} kg</p></td><td className="px-5 py-4 font-semibold text-[#765544]">{product.categoryName}</td><td className="px-5 py-4 font-bold">{formatCurrency(product.price)}</td><td className="px-5 py-4 font-bold">{product.stockQuantity} {product.unit}</td><td className="px-5 py-4 font-semibold">{[product.isRetail && "B2C", product.isB2b && "B2B"].filter(Boolean).join(" / ")}</td><td className="px-5 py-4"><span className={`rounded-full px-2.5 py-1 text-xs font-black ${product.isActive ? "bg-emerald-50 text-emerald-800" : "bg-stone-200 text-stone-600"}`}>{product.isActive ? "Đang hiển thị" : "Đang ẩn"}</span></td><td className="px-5 py-4"><div className="flex justify-end gap-2"><Button asChild type="button" variant="outline" className="h-9 border-[#d1b8a5] px-3 text-[#5b3424] hover:bg-[#f6ebe3]"><Link to={`/admin/san-pham/${product.id}`}><Eye size={15} /> Xem</Link></Button><Button asChild type="button" variant="outline" className="h-9 border-[#d1b8a5] px-3 text-[#5b3424] hover:bg-[#f6ebe3]"><Link to={`/admin/san-pham/${product.id}/chinh-sua`}><Edit3 size={15} /> Sửa</Link></Button><Button type="button" variant="outline" onClick={() => void toggleVisibility(product)} className={`h-9 px-3 ${product.isActive ? "border-red-200 text-red-700 hover:bg-red-50" : "border-emerald-200 text-emerald-700 hover:bg-emerald-50"}`}>{product.isActive ? <EyeOff size={15} /> : <Eye size={15} />}{product.isActive ? "Ẩn" : "Hiện"}</Button></div></td></tr>)}</tbody></table><Pagination page={page} pageSize={pageSize} total={products.length} onChange={setPage} /></div>}
    </AdminPanel>
  </AdminPageShell>;
}
