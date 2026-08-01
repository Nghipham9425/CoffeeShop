import { ArrowLeft, CheckCircle2, Package, ShoppingCart, Truck } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ProductMockup } from "../../../components/ProductMockup";
import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import { Card, CardContent } from "../../../components/ui/card";
import { useCart } from "../../../contexts/CartContext";
import { formatVnd, publicApi, type PublicProduct } from "../../../lib/publicApi";

const suggestionTitles = [ "Cà phê rang mộc cho quán", "Blend espresso ổn định", "Gói OEM nhãn riêng" ];

export function ProductDetailPage() {
  const { id } = useParams();
  const { addItem, items } = useCart();
  const [product, setProduct] = useState<PublicProduct | null>(null);
  const [suggestions, setSuggestions] = useState<PublicProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;
    const productId = Number(id);

    if (!Number.isFinite(productId)) {
      setError("Sản phẩm không hợp lệ.");
      setLoading(false);
      return;
    }

    Promise.all([publicApi.product(productId), publicApi.products()])
      .then(([detail, list]) => {
        if (!alive) return;
        setProduct(detail);
        setSuggestions(list.filter((item) => item.id !== detail.id).slice(0, 3));
      })
      .catch((err) => { if (alive) setError(err instanceof Error ? err.message : "Không tải được chi tiết sản phẩm."); })
      .finally(() => { if (alive) setLoading(false); });

    return () => { alive = false; };
  }, [id]);

  if (loading) return <main className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8"><div className="h-96 animate-pulse rounded-3xl bg-stone-100" /></main>;
  if (error || !product) return <main className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8"><Card><CardContent className="p-8"><p className="font-bold text-red-700">{error || "Không tìm thấy sản phẩm."}</p><Button asChild className="mt-5"><Link to="/san-pham">Quay lại sản phẩm</Link></Button></CardContent></Card></main>;

  const isInCart = items.some((item) => item.productId === product.id);
  
  const now = new Date();
  const activePromo = (product as any).prices?.find((p: any) => {
    const start = p.startAt ? new Date(p.startAt) : null;
    const end = p.endAt ? new Date(p.endAt) : null;
    return p.isActive && (!start || start <= now) && (!end || end >= now);
  });

  const isModifiedPrice = !!activePromo && product.price != null && activePromo.price !== product.price;
  const displayPrice = isModifiedPrice ? activePromo.price : product.price;
  const productToCart = isModifiedPrice ? { ...product, price: displayPrice } : product;

  return (
    <main className="bg-stone-50">
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <Button asChild variant="ghost" className="mb-6 rounded-lg"><Link to="/san-pham"><ArrowLeft size={18} />Quay lại danh sách</Link></Button>

        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <Card className="bg-white">
            <CardContent className="grid min-h-[520px] place-items-center p-8">
              {product.imageUrl ? <img alt={product.name} className="max-h-[520px] w-full rounded-3xl object-cover" src={product.imageUrl} /> : <ProductMockup />}
            </CardContent>
          </Card>

          <div>
            <Badge>{product.categoryName}</Badge>
            <h1 className="mt-4 font-serif text-4xl font-black leading-tight text-stone-950 md:text-6xl">{product.name}</h1>
            <p className="mt-5 text-lg leading-8 text-stone-600">{product.description || "Sản phẩm cà phê phù hợp cho khách mua lẻ, quán cà phê và đơn hàng dùng thử."}</p>

            <div className="mt-7 grid gap-4 rounded-3xl bg-white p-6 shadow-sm md:grid-cols-3">
              <Info icon={Package} label="Đơn vị" value={product.unit} />
              <Info icon={Truck} label="MOQ" value={`${product.minimumOrderKg}kg`} />
              <Info icon={CheckCircle2} label="Kênh bán" value={[product.isRetail ? "B2C" : "", product.isB2b ? "B2B" : ""].filter(Boolean).join(" / ")} />
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <div className="flex flex-col">
                {isModifiedPrice && product.price != null ? (
                  <>
                    <span className="text-xl font-bold text-stone-400 line-through">{formatVnd(product.price)}</span>
                    <span className={`text-4xl font-black ${activePromo.price > (product.price ?? 0) ? 'text-orange-600' : 'text-red-600'}`}>{formatVnd(displayPrice)}</span>
                  </>
                ) : (
                  <span className="text-4xl font-black text-[var(--roast)]">{formatVnd(product.price)}</span>
                )}
              </div>
              <Button disabled={!product.price} onClick={() => addItem(productToCart)}><ShoppingCart size={18} />{isInCart ? "Thêm tiếp vào giỏ" : "Thêm giỏ hàng"}</Button>
              <Button asChild variant="outline"><Link to="/bao-gia">Yêu cầu giá sỉ</Link></Button>
            </div>
          </div>
        </div>

        <section className="mt-16">
          <div className="flex items-end justify-between gap-4">
            <div><Badge>Gợi ý mẫu</Badge><h2 className="mt-3 font-serif text-4xl font-black text-stone-950">Có thể phù hợp với bạn</h2></div>
            <Button asChild variant="outline"><Link to="/san-pham">Xem tất cả</Link></Button>
          </div>

          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {(suggestions.length ? suggestions : suggestionTitles).map((item, index) => {
              const suggested = typeof item === "string" ? null : item;
              const title = suggested?.name ?? suggestionTitles[index] ?? "Sản phẩm gợi ý";
              return (
                <Card key={suggested?.id ?? title} className="bg-white">
                  <CardContent className="p-5">
                    {suggested?.imageUrl ? <img alt={title} className="h-44 w-full rounded-2xl object-cover" src={suggested.imageUrl} /> : <ProductMockup tone={["from-[#5a2f21] to-[#1f130e]", "from-[#36553a] to-[#172318]", "from-[#c47a3d] to-[#5b2f1f]"][index % 3]} />}
                    <h3 className="mt-5 text-xl font-black text-stone-950">{title}</h3>
                    <p className="mt-2 text-sm leading-6 text-stone-600">Gợi ý mẫu, sau này có thể thay bằng thuật toán đề xuất.</p>
                    {suggested && <Button asChild className="mt-5 w-full" variant="outline"><Link to={`/san-pham/${suggested.id}`}>Xem chi tiết</Link></Button>}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>
      </section>
    </main>
  );
}

function Info({ icon: Icon, label, value }: { icon: typeof Package; label: string; value: string }) {
  return (
    <div>
      <Icon className="text-[var(--tan)]" size={24} />
      <p className="mt-2 text-xs font-black uppercase text-stone-500">{label}</p>
      <p className="mt-1 font-black text-stone-950">{value || "Đang cập nhật"}</p>
    </div>
  );
}