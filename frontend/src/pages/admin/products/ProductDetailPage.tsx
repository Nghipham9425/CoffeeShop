import { ArrowLeft, Edit3, Package } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Button } from "../../../components/ui/button";
import { useAdminOutlet } from "../../../layouts/AdminLayout";
import { adminApi, formatCurrency, type Product } from "../../../lib/adminApi";
import { AdminPageShell } from "../shared/AdminPageShell";
import { ErrorState, LoadingState } from "../shared/ApiState";

export function ProductDetailPage() {
  const { token } = useAdminOutlet();
  const { id } = useParams();
  const productId = Number(id);
  const [product, setProduct] = useState<Product | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token || !productId) return;
    void adminApi.adminProducts(token).then((items) => {
      const found = items.find((item) => item.id === productId);
      if (!found) throw new Error("Không tìm thấy sản phẩm.");
      setProduct(found);
    }).catch((cause) => setError(cause instanceof Error ? cause.message : "Không thể tải sản phẩm."));
  }, [productId, token]);

  return <AdminPageShell title="Chi tiết sản phẩm" description="Thông tin hiển thị và trạng thái kinh doanh của sản phẩm.">
    {error ? <ErrorState message={error} /> : !product ? <LoadingState /> : <section className="overflow-hidden rounded-lg border border-[#dfcec0] bg-white shadow-sm">
      <div className="flex flex-wrap justify-between gap-3 border-b border-[#eadfd6] p-5"><Button asChild variant="outline" className="border-[#d1b8a5] text-[#5b3424] hover:bg-[#f6ebe3]"><Link to="/admin/san-pham"><ArrowLeft size={16} /> Danh sách sản phẩm</Link></Button><Button asChild className="bg-[#5b3322] text-white hover:bg-[#3e2116]"><Link to={`/admin/san-pham/${product.id}/chinh-sua`}><Edit3 size={16} /> Chỉnh sửa</Link></Button></div>
      <div className="grid gap-7 p-6 md:grid-cols-[280px_1fr]"><div className="grid aspect-square place-items-center bg-[#f8f2ec]">{product.imageUrl ? <img src={product.imageUrl} alt={product.name} className="h-full w-full object-contain p-4" /> : <Package size={54} className="text-[#ad876e]" />}</div><div><p className="text-sm font-bold uppercase tracking-wide text-[#8b583a]">{product.categoryName}</p><h2 className="mt-2 text-3xl font-black text-[#3b2419]">{product.name}</h2><p className="mt-5 max-w-3xl whitespace-pre-line leading-7 text-[#674938]">{product.description || "Chưa có mô tả."}</p><dl className="mt-7 grid gap-4 border-t border-[#eadfd6] pt-5 sm:grid-cols-2 lg:grid-cols-3"><Info label="Giá bán lẻ" value={formatCurrency(product.price)} /><Info label="Tồn kho" value={`${product.stockQuantity} ${product.unit}`} /><Info label="Đặt tối thiểu" value={`${product.minimumOrderKg} kg`} /><Info label="Kênh bán" value={[product.isRetail && "B2C", product.isB2b && "B2B"].filter(Boolean).join(" / ") || "Chưa thiết lập"} /><Info label="Trạng thái" value={product.isActive ? "Đang hiển thị" : "Đang ẩn"} /><Info label="Slug" value={product.slug} /></dl></div></div>
    </section>}
  </AdminPageShell>;
}

function Info({ label, value }: { label: string; value: string }) { return <div><dt className="text-xs font-black uppercase tracking-wide text-[#9a7c68]">{label}</dt><dd className="mt-1 font-bold text-[#3b2419]">{value}</dd></div>; }
