import { useEffect, useMemo, useState, type FormEvent } from "react";
import { History, Save, Search } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Card, CardContent } from "../../../components/ui/card";
import { adminAuth } from "../../../lib/adminApi";
import { formatVnd } from "../../../lib/publicApi";
import { AdminPageShell } from "../shared/AdminPageShell";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:4000/api";
const fieldClass = "h-11 w-full rounded-lg border border-[#C7A792] bg-white px-3 outline-none focus:border-[#553B2F]";

type Product = { id: number; name: string; price: number | null; categoryName: string; isActive: boolean };
type PriceHistory = {
  id: number;
  oldPrice: number | null;
  newPrice: number;
  createdAt: string;
  createdBy: { id: number; fullName: string } | null;
};

async function adminRequest<T>(path: string, options: RequestInit = {}) {
  const token = adminAuth.getToken();
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}`, ...options.headers },
  });
  const body = await response.json().catch(() => null);
  if (!response.ok) throw new Error(body?.message || body?.errors?.[0]?.message || "Không thể xử lý yêu cầu.");
  return body as T;
}

export function PricingPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [history, setHistory] = useState<PriceHistory[]>([]);
  const [keyword, setKeyword] = useState("");
  const [price, setPrice] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const selectedProduct = products.find((product) => product.id === selectedId) ?? null;
  const filteredProducts = useMemo(
    () => products.filter((product) => product.name.toLowerCase().includes(keyword.trim().toLowerCase())),
    [keyword, products],
  );

  async function loadProducts() {
    const rows = await adminRequest<Product[]>("/products/admin/list");
    setProducts(rows);
    setSelectedId((current) => current ?? rows[0]?.id ?? null);
  }

  async function loadHistory(productId: number) {
    setHistory(await adminRequest<PriceHistory[]>(`/products/${productId}/price-history`));
  }

  useEffect(() => {
    loadProducts().catch((cause) => setError(cause instanceof Error ? cause.message : "Không tải được sản phẩm."));
  }, []);

  useEffect(() => {
    if (!selectedId) return;
    const current = products.find((product) => product.id === selectedId);
    setPrice(current?.price == null ? "" : String(current.price));
    loadHistory(selectedId).catch((cause) => setError(cause instanceof Error ? cause.message : "Không tải được lịch sử giá."));
  }, [products, selectedId]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!selectedId) return;
    setSaving(true);
    setError("");
    try {
      await adminRequest(`/products/${selectedId}/prices`, {
        method: "POST",
        body: JSON.stringify({ priceType: "RETAIL", minQuantity: 1, price: Number(price), isActive: true }),
      });
      await loadProducts();
      await loadHistory(selectedId);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Không cập nhật được giá sản phẩm.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <AdminPageShell title="Giá sản phẩm" description="Giá bán lẻ được lưu trong bảng giá; lịch sử thay đổi được ghi nhận theo từng sản phẩm.">
      {error ? <p className="mb-5 rounded-lg bg-red-50 p-3 text-sm font-bold text-red-700">{error}</p> : null}
      <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
        <Card className="border-[#E8D3C7]"><CardContent className="p-0">
          <div className="border-b border-[#E8D3C7] p-5"><label className="relative block"><Search className="absolute left-3 top-3 text-[#AA7864]" size={18} /><input value={keyword} onChange={(event) => setKeyword(event.target.value)} className={`${fieldClass} pl-10`} placeholder="Tìm sản phẩm..." /></label></div>
          <div className="max-h-[580px] overflow-auto"><table className="w-full text-left text-sm"><thead className="sticky top-0 bg-[#FAF9F6] text-[#7A665D]"><tr><th className="p-4">Sản phẩm</th><th className="p-4">Giá hiện tại</th><th className="p-4">Trạng thái</th></tr></thead><tbody className="divide-y divide-[#E8D3C7]/60">{filteredProducts.map((product) => <tr key={product.id} onClick={() => setSelectedId(product.id)} className={`cursor-pointer ${selectedId === product.id ? "bg-[#E8D3C7]/55" : "hover:bg-[#FAF9F6]"}`}><td className="p-4"><p className="font-black text-[#553B2F]">{product.name}</p><p className="text-xs font-semibold text-[#AA7864]">{product.categoryName}</p></td><td className="p-4 font-black text-[#553B2F]">{formatVnd(product.price)}</td><td className="p-4 text-xs font-bold">{product.isActive ? "Đang hiển thị" : "Đã ẩn"}</td></tr>)}</tbody></table></div>
        </CardContent></Card>
        <Card className="h-fit border-[#E8D3C7]"><CardContent className="p-5"><p className="text-sm font-bold text-[#AA7864]">Sản phẩm đang chọn</p><h2 className="mt-1 text-xl font-black text-[#553B2F]">{selectedProduct?.name ?? "Chưa chọn sản phẩm"}</h2><form onSubmit={submit} className="mt-5 space-y-4"><label className="block text-sm font-bold text-[#553B2F]">Giá bán lẻ mới<input required min="0" type="number" value={price} onChange={(event) => setPrice(event.target.value)} className={`mt-1.5 ${fieldClass}`} placeholder="185000" /></label><Button disabled={saving || !selectedProduct} className="w-full bg-[#553B2F] text-white hover:bg-[#3c271f]"><Save size={17} />{saving ? "Đang lưu..." : "Cập nhật giá"}</Button></form></CardContent></Card>
      </div>
      <Card className="mt-6 border-[#E8D3C7]"><CardContent className="p-0"><div className="flex items-center gap-2 border-b border-[#E8D3C7] p-5"><History size={20} className="text-[#AA7864]" /><div><h2 className="font-black text-[#553B2F]">Lịch sử giá của {selectedProduct?.name ?? "sản phẩm"}</h2><p className="text-sm text-[#7A665D]">Ghi nhận giá cũ, giá mới, người chỉnh và thời điểm.</p></div></div><div className="overflow-x-auto"><table className="w-full min-w-[720px] text-left text-sm"><thead className="bg-[#FAF9F6] text-[#7A665D]"><tr><th className="p-4">Thời gian</th><th className="p-4">Giá cũ</th><th className="p-4">Giá mới</th><th className="p-4">Người thực hiện</th></tr></thead><tbody className="divide-y divide-[#E8D3C7]/60">{history.map((row) => <tr key={row.id}><td className="p-4 text-[#7A665D]">{new Date(row.createdAt).toLocaleString("vi-VN")}</td><td className="p-4">{formatVnd(row.oldPrice)}</td><td className="p-4 font-black text-emerald-700">{formatVnd(row.newPrice)}</td><td className="p-4">{row.createdBy?.fullName ?? "Hệ thống"}</td></tr>)}</tbody></table>{!history.length ? <p className="p-8 text-center text-sm font-bold text-[#AA7864]">Sản phẩm chưa có lịch sử thay đổi giá.</p> : null}</div></CardContent></Card>
    </AdminPageShell>
  );
}
