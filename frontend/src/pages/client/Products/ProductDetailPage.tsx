import { ChevronRight, Minus, Plus, ShoppingCart, Star } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ProductMockup } from "../../../components/ProductMockup";
import { Seo } from "../../../components/Seo";
import { Button } from "../../../components/ui/button";
import { Card, CardContent } from "../../../components/ui/card";
import { useCart } from "../../../contexts/CartContext";
import { formatVnd, publicApi, type PublicProduct, type PublicReview } from "../../../lib/publicApi";

const fallbackImages = [
  "/images/products/arabica-honey.jpg",
  "/images/products/robusta.jpg",
  "/images/products/espresso.jpg",
  "/images/products/phin-blend.jpg",
  "/images/products/cold-brew.jpg",
];

function getDisplayPrice(product: PublicProduct) {
  const now = new Date();
  const promotion = product.prices.find((price) => {
    const start = price.startAt ? new Date(price.startAt) : null;
    const end = price.endAt ? new Date(price.endAt) : null;
    return price.isActive && (!start || start <= now) && (!end || end >= now);
  });

  const isPromotion = Boolean(promotion && product.price != null && promotion.price !== product.price);
  return { price: isPromotion ? promotion!.price : product.price, isPromotion };
}

export function ProductDetailPage() {
  const { slug = "" } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const [product, setProduct] = useState<PublicProduct | null>(null);
  const [suggestions, setSuggestions] = useState<PublicProduct[]>([]);
  const [reviews, setReviews] = useState<PublicReview[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [slug]);

  useEffect(() => {
    let alive = true;
    if (!slug) {
      setError("Sản phẩm không hợp lệ.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");
    const isLegacyId = /^\d+$/.test(slug);
    const detailRequest = isLegacyId ? publicApi.product(Number(slug)) : publicApi.productBySlug(slug);

    Promise.all([detailRequest, publicApi.products()])
      .then(async ([detail, list]) => {
        const productReviews = await publicApi.productReviews(detail.id);
        if (!alive) return;
        setProduct(detail);
        setQuantity(1);
        setSuggestions(list.filter((item) => item.id !== detail.id && item.stockQuantity > 0).slice(0, 4));
        setReviews(productReviews);
        if (isLegacyId) navigate(`/san-pham/${detail.slug}`, { replace: true });
      })
      .catch((requestError) => {
        if (alive) setError(requestError instanceof Error ? requestError.message : "Không thể tải chi tiết sản phẩm.");
      })
      .finally(() => { if (alive) setLoading(false); });

    return () => { alive = false; };
  }, [navigate, slug]);

  const averageRating = useMemo(
    () => reviews.length ? reviews.reduce((total, review) => total + review.rating, 0) / reviews.length : 0,
    [reviews],
  );

  if (loading) {
    return <main className="min-h-screen bg-white px-5 py-16 sm:px-8 lg:px-12"><div className="mx-auto h-[560px] max-w-[1240px] animate-pulse bg-stone-100" /></main>;
  }

  if (error || !product) {
    return <main className="min-h-screen bg-white px-5 py-16 sm:px-8 lg:px-12"><Card className="mx-auto max-w-2xl"><CardContent className="p-8 text-center"><p className="font-bold text-red-700">{error || "Không tìm thấy sản phẩm."}</p><Button asChild className="mt-5"><Link to="/san-pham">Quay lại sản phẩm</Link></Button></CardContent></Card></main>;
  }

  const { price, isPromotion } = getDisplayPrice(product);
  const canBuy = price != null && product.stockQuantity > 0;
  const maximumQuantity = Math.max(1, product.stockQuantity);
  const displayImage = product.imageUrl || fallbackImages[product.id % fallbackImages.length];

  function changeQuantity(nextValue: number) {
    setQuantity(Math.max(1, Math.min(maximumQuantity, Number.isFinite(nextValue) ? nextValue : 1)));
  }

  function addToCart() {
    if (canBuy) addItem({ ...(product as PublicProduct), price }, quantity);
  }

  return (
    <main className="min-h-screen bg-white">
      <Seo
        title={product.name}
        description={product.description || `${product.name} từ Phú Tài Coffee Works.`}
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
          offers: price == null ? undefined : {
            "@type": "Offer",
            priceCurrency: "VND",
            price,
            availability: product.stockQuantity > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
            url: new URL(`/san-pham/${product.slug}`, window.location.origin).toString(),
          },
          aggregateRating: reviews.length ? { "@type": "AggregateRating", ratingValue: averageRating, reviewCount: reviews.length } : undefined,
        }}
      />

      <div className="mx-auto max-w-[1240px] px-5 py-7 sm:px-8 lg:py-10">
        <nav className="flex items-center gap-2 overflow-hidden text-xs text-stone-500">
          <Link to="/" className="shrink-0 transition hover:text-[#603c2a]">Trang chủ</Link><ChevronRight size={14} />
          <Link to="/san-pham" className="shrink-0 transition hover:text-[#603c2a]">Sản phẩm</Link><ChevronRight size={14} />
          <span className="truncate text-stone-700">{product.name}</span>
        </nav>

        <section className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,0.94fr)_minmax(400px,1.06fr)] lg:gap-16">
          <div className="bg-[#f5f2ee]">
            {product.imageUrl ? (
              <img
                alt={product.name}
                src={product.imageUrl}
                onError={(event) => { event.currentTarget.onerror = null; event.currentTarget.src = displayImage; }}
                className="aspect-square h-full w-full object-contain"
              />
            ) : <div className="aspect-square"><ProductMockup tone="from-[#5a2f21] to-[#1f130e]" /></div>}
          </div>

          <div className="flex flex-col lg:pt-3">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#9d6b4c]">{product.categoryName}</p>
            <h1 className="mt-3 font-serif text-3xl font-bold leading-tight text-[#4a2d20] sm:text-4xl">{product.name}</h1>

            <div className="mt-5 border-y border-[#eadfd4] py-4">
              <div className="flex items-center gap-2 text-sm text-stone-500">
                {reviews.length ? <><span className="flex text-[#cb912f]">{Array.from({ length: 5 }, (_, index) => <Star key={index} size={15} className={index < Math.round(averageRating) ? "fill-current" : "text-stone-300"} />)}</span><span>{averageRating.toFixed(1)} ({reviews.length} đánh giá)</span></> : <span>Chưa có đánh giá</span>}
              </div>
              <div className="mt-4 flex flex-wrap items-end justify-between gap-3">
                <div>
                  {isPromotion && product.price != null ? <p className="mb-1 text-sm text-stone-400 line-through">{formatVnd(product.price)}</p> : null}
                  <p className={`text-3xl font-semibold ${isPromotion ? "text-[#b42318]" : "text-[#603c2a]"}`}>{price != null ? formatVnd(price) : "Liên hệ báo giá"}</p>
                </div>
                <p className={`text-sm font-semibold ${product.stockQuantity > 0 ? "text-emerald-700" : "text-red-700"}`}>{product.stockQuantity > 0 ? `Còn ${product.stockQuantity} ${product.unit}` : "Tạm hết hàng"}</p>
              </div>
            </div>

            <div className="mt-6 flex items-center gap-3">
              <div className="flex h-12 w-36 shrink-0 items-center justify-between border border-[#d9cdc0]">
                <button type="button" aria-label="Giảm số lượng" onClick={() => changeQuantity(quantity - 1)} className="grid h-full w-11 place-items-center text-[#4b2418] transition hover:bg-[#f5f2ee]"><Minus size={18} /></button>
                <input aria-label="Số lượng" type="number" min={1} max={maximumQuantity} value={quantity} onChange={(event) => changeQuantity(Number(event.target.value))} className="h-full min-w-0 flex-1 bg-transparent text-center text-sm font-semibold outline-none" />
                <button type="button" aria-label="Tăng số lượng" onClick={() => changeQuantity(quantity + 1)} className="grid h-full w-11 place-items-center text-[#4b2418] transition hover:bg-[#f5f2ee]"><Plus size={18} /></button>
              </div>
              <Button disabled={!canBuy} onClick={addToCart} className="h-12 flex-1 rounded-none bg-[#603c2a] text-white hover:bg-[#3e2418]"><ShoppingCart size={18} />{canBuy ? "Thêm vào giỏ" : "Tạm hết hàng"}</Button>
            </div>
            {product.isB2b ? <Link to="/bao-gia" className="mt-4 text-sm font-semibold text-[#8b5a3c] transition hover:text-[#4a2d20]">Mua số lượng lớn hoặc gia công riêng? Nhận báo giá doanh nghiệp →</Link> : null}

            <div className="mt-8 border-t border-[#eadfd4] pt-6">
              <h2 className="text-base font-semibold text-[#4a2d20]">Mô tả sản phẩm</h2>
              <p className="mt-3 whitespace-pre-line text-sm leading-7 text-stone-600">{product.description || "Cà phê được tuyển chọn và rang mới theo từng mẻ. Phù hợp cho nhu cầu sử dụng tại nhà, quán cà phê và đối tác cần nguồn hàng ổn định."}</p>
              <dl className="mt-6 grid grid-cols-2 gap-x-8 gap-y-3 border-t border-[#eadfd4] pt-5 text-sm">
                <div><dt className="text-stone-500">Quy cách</dt><dd className="mt-1 font-semibold text-[#4a2d20]">{product.unit || "kg"}</dd></div>
                <div><dt className="text-stone-500">Mã sản phẩm</dt><dd className="mt-1 font-semibold text-[#4a2d20]">PT-{String(product.id).padStart(4, "0")}</dd></div>
              </dl>
            </div>
          </div>
        </section>

        <section className="mt-16 border-t border-[#eadfd4] pt-10">
          <div className="flex items-end justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[0.16em] text-[#9d6b4c]">Phản hồi khách hàng</p><h2 className="mt-2 font-serif text-2xl font-bold text-[#4a2d20]">Đánh giá sản phẩm</h2></div><p className="text-sm text-stone-500">{reviews.length} đánh giá</p></div>
          {reviews.length ? <div className="mt-7 grid gap-4 md:grid-cols-2">{reviews.map((review) => <article key={review.id} className="border-b border-[#eadfd4] pb-5"><div className="flex items-center justify-between gap-3"><strong className="text-[#4a2d20]">{review.user.fullName}</strong><div className="flex text-[#cb912f]">{Array.from({ length: 5 }, (_, index) => <Star key={index} size={15} className={index < review.rating ? "fill-current" : "text-stone-300"} />)}</div></div><p className="mt-3 text-sm leading-6 text-stone-600">{review.content || "Khách hàng đã đánh giá sản phẩm này."}</p></article>)}</div> : <p className="mt-6 text-sm text-stone-500">Sản phẩm chưa có đánh giá. Đánh giá được mở cho khách hàng sau khi hoàn tất đơn hàng.</p>}
        </section>

        {suggestions.length ? <section className="mt-16 border-t border-[#eadfd4] pt-10"><div className="flex items-end justify-between gap-4"><h2 className="font-serif text-2xl font-bold text-[#4a2d20]">Sản phẩm liên quan</h2><Link to="/san-pham" className="text-sm font-semibold text-[#8b5a3c] hover:text-[#4a2d20]">Xem tất cả →</Link></div><div className="mt-7 grid grid-cols-2 gap-x-5 gap-y-10 md:grid-cols-4">{suggestions.map((item, index) => <Link key={item.id} to={`/san-pham/${item.slug}`} className="group min-w-0"><div className="aspect-square overflow-hidden bg-[#f5f2ee]">{item.imageUrl ? <img alt={item.name} src={item.imageUrl} loading="lazy" onError={(event) => { event.currentTarget.onerror = null; event.currentTarget.src = fallbackImages[index % fallbackImages.length]; }} className="h-full w-full object-contain transition duration-500 group-hover:scale-[1.035]" /> : <ProductMockup />}</div><h3 className="mt-4 truncate text-base font-semibold text-[#573526] group-hover:text-[#a15f3e]">{item.name}</h3><p className="mt-2 text-lg font-semibold text-[#603c2a]">{formatVnd(getDisplayPrice(item).price)}</p></Link>)}</div></section> : null}
      </div>
    </main>
  );
}
