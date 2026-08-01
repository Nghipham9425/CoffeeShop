import { ArrowLeft, CheckCircle2, Package, ShoppingCart, Star, Truck } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ProductMockup } from "../../../components/ProductMockup";
import { Seo } from "../../../components/Seo";
import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import { Card, CardContent } from "../../../components/ui/card";
import { useCart } from "../../../contexts/CartContext";
import { formatVnd, publicApi, type PublicProduct, type PublicReview } from "../../../lib/publicApi";

const suggestionTitles = [ "Cà phê rang mộc cho quán", "Blend espresso ổn định", "Gói OEM nhãn riêng" ];

export function ProductDetailPage() {
  const { slug = "" } = useParams();
  const navigate = useNavigate();
  const { addItem, items } = useCart();
  const [product, setProduct] = useState<PublicProduct | null>(null);
  const [suggestions, setSuggestions] = useState<PublicProduct[]>([]);
  const [reviews, setReviews] = useState<PublicReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;
    if (!slug) {
      setError("Sản phẩm không hợp lệ.");
      setLoading(false);
      return;
    }

    const isLegacyId = /^\d+$/.test(slug);
    const detailRequest = isLegacyId ? publicApi.product(Number(slug)) : publicApi.productBySlug(slug);

    Promise.all([detailRequest, publicApi.products()])
      .then(async ([detail, list]) => {
        const productReviews = await publicApi.productReviews(detail.id);
        if (!alive) return;
        setProduct(detail);
        setSuggestions(list.filter((item) => item.id !== detail.id).slice(0, 3));
        setReviews(productReviews);
        if (isLegacyId) navigate(`/san-pham/${detail.slug}`, { replace: true });
      })
      .catch((err) => { if (alive) setError(err instanceof Error ? err.message : "Không tải được chi tiết sản phẩm."); })
      .finally(() => { if (alive) setLoading(false); });

    return () => { alive = false; };
  }, [navigate, slug]);

  if (loading) return <main className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8"><div className="h-96 animate-pulse rounded-3xl bg-stone-100" /></main>;
  if (error || !product) return <main className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8"><Card><CardContent className="p-8"><p className="font-bold text-red-700">{error || "Không tìm thấy sản phẩm."}</p><Button asChild className="mt-5"><Link to="/san-pham">Quay lại sản phẩm</Link></Button></CardContent></Card></main>;

  const isInCart = items.some((item) => item.productId === product.id);
  
  const now = new Date();
  const activePromo = product.prices.find((price) => {
    const start = price.startAt ? new Date(price.startAt) : null;
    const end = price.endAt ? new Date(price.endAt) : null;
    return price.isActive && (!start || start <= now) && (!end || end >= now);
  });

  const isModifiedPrice = !!activePromo && product.price != null && activePromo.price !== product.price;
  const displayPrice = isModifiedPrice ? activePromo.price : product.price;
  const productToCart = isModifiedPrice ? { ...product, price: displayPrice } : product;

  return (
    <main className="bg-stone-50">
      <Seo
        title={product.name}
        description={product.description || `${product.name} từ Phú Tài Coffee Works, phù hợp cho khách mua lẻ và doanh nghiệp.`}
        canonicalPath={`/san-pham/${product.slug}`}
        image={product.imageUrl}
        type="product"
        structuredData={{
          "@context": "https://schema.org",
          "@type": "Product",
          name: product.name,
          description: product.description,
          image: product.imageUrl ? [product.imageUrl] : undefined,
          sku: `PT-${product.id}`,
          category: product.categoryName,
          brand: { "@type": "Brand", name: "Phú Tài Coffee Works" },
          offers: product.price == null ? undefined : {
            "@type": "Offer",
            priceCurrency: "VND",
            price: displayPrice,
            availability: "https://schema.org/InStock",
            url: new URL(`/san-pham/${product.slug}`, window.location.origin).toString(),
          },
          aggregateRating: reviews.length ? {
            "@type": "AggregateRating",
            ratingValue: reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length,
            reviewCount: reviews.length,
          } : undefined,
        }}
      />
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
              <p className={`w-full text-sm font-bold ${product.stockQuantity > 0 ? "text-emerald-700" : "text-red-700"}`}>
                {product.stockQuantity > 0 ? `Còn ${product.stockQuantity} ${product.unit} trong kho` : "Sản phẩm đang tạm hết hàng"}
              </p>
              <Button disabled={!product.price || product.stockQuantity <= 0} onClick={() => addItem(productToCart)}><ShoppingCart size={18} />{product.stockQuantity <= 0 ? "Hết hàng" : isInCart ? "Thêm tiếp vào giỏ" : "Thêm giỏ hàng"}</Button>
              <Button asChild variant="outline"><Link to="/bao-gia">Yêu cầu giá sỉ</Link></Button>
            </div>
          </div>
        </div>

        <section className="mt-16 border-t border-stone-200 pt-12">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div><Badge>Khách hàng đã mua</Badge><h2 className="mt-3 font-serif text-4xl font-black text-stone-950">Đánh giá sản phẩm</h2></div>
            <p className="text-sm font-bold text-stone-500">{reviews.length} đánh giá đã duyệt</p>
          </div>
          {reviews.length ? <div className="mt-8 grid gap-4 md:grid-cols-2">
            {reviews.map((review) => <article key={review.id} className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between gap-3"><strong className="text-stone-950">{review.user.fullName}</strong><div className="flex" aria-label={`${review.rating} trên 5 sao`}>{Array.from({ length: 5 }, (_, index) => <Star key={index} size={17} className={index < review.rating ? "fill-amber-400 text-amber-400" : "text-stone-300"} />)}</div></div>
              <p className="mt-3 text-sm leading-6 text-stone-600">{review.content || "Khách hàng đã đánh giá sản phẩm này."}</p>
              <p className="mt-3 text-xs font-semibold text-stone-400">{new Intl.DateTimeFormat("vi-VN", { dateStyle: "medium" }).format(new Date(review.createdAt))}</p>
            </article>)}
          </div> : <div className="mt-8 rounded-2xl border border-dashed border-stone-300 bg-white p-8 text-center text-sm font-semibold text-stone-500">Chưa có đánh giá được duyệt cho sản phẩm này.</div>}
        </section>

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
                    {suggested && <Button asChild className="mt-5 w-full" variant="outline"><Link to={`/san-pham/${suggested.slug}`}>Xem chi tiết</Link></Button>}
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
