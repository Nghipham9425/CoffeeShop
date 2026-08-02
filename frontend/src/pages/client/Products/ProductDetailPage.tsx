import { ArrowLeft, Check, ChevronRight, Coffee, Minus, Plus, ShoppingCart, Star } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ProductMockup } from "../../../components/ProductMockup";
import { Seo } from "../../../components/Seo";
import { Badge } from "../../../components/ui/badge";
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

type DetailTab = "description" | "quality" | "shipping";

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
  const [activeTab, setActiveTab] = useState<DetailTab>("description");
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
        setQuantity(Math.max(1, Math.min(detail.stockQuantity, 1)));
        setSuggestions(list.filter((item) => item.id !== detail.id && item.stockQuantity > 0).slice(0, 3));
        setReviews(productReviews);
        if (isLegacyId) navigate(`/san-pham/${detail.slug}`, { replace: true });
      })
      .catch((requestError) => {
        if (alive) setError(requestError instanceof Error ? requestError.message : "Không thể tải chi tiết sản phẩm.");
      })
      .finally(() => {
        if (alive) setLoading(false);
      });

    return () => {
      alive = false;
    };
  }, [navigate, slug]);

  const averageRating = useMemo(
    () => reviews.length ? reviews.reduce((total, review) => total + review.rating, 0) / reviews.length : 0,
    [reviews],
  );

  if (loading) {
    return <main className="min-h-screen bg-white px-4 py-14 sm:px-6 lg:px-8"><div className="mx-auto h-[680px] max-w-7xl animate-pulse bg-stone-200" /></main>;
  }

  if (error || !product) {
    return <main className="min-h-screen bg-white px-4 py-14 sm:px-6 lg:px-8"><Card className="mx-auto max-w-2xl"><CardContent className="p-8 text-center"><p className="font-bold text-red-700">{error || "Không tìm thấy sản phẩm."}</p><Button asChild className="mt-5"><Link to="/san-pham">Quay lại sản phẩm</Link></Button></CardContent></Card></main>;
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

  function buyNow() {
    if (!canBuy) return;
    addItem({ ...(product as PublicProduct), price }, quantity);
    navigate("/gio-hang");
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

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <nav className="flex items-center gap-2 overflow-hidden text-sm font-semibold text-stone-500">
          <Link to="/" className="shrink-0 hover:text-[#603722]">Trang chủ</Link><ChevronRight size={15} />
          <Link to="/san-pham" className="shrink-0 hover:text-[#603722]">Sản phẩm</Link><ChevronRight size={15} />
          <span className="truncate text-stone-700">{product.name}</span>
        </nav>

        <Button asChild variant="ghost" className="mt-3 h-auto rounded-none px-0 py-1 text-stone-600 hover:bg-transparent hover:text-[#603722]"><Link to="/san-pham"><ArrowLeft size={17} />Quay lại catalogue</Link></Button>

        <section className="mt-5 grid gap-9 lg:grid-cols-[minmax(0,1.05fr)_minmax(390px,0.95fr)] lg:gap-14">
          <div>
            <div className="relative overflow-hidden bg-[#f1ece5]">
              {product.imageUrl ? <img alt={product.name} src={product.imageUrl} onError={(event) => { event.currentTarget.onerror = null; event.currentTarget.src = displayImage; }} className="aspect-[4/5] w-full object-cover" /> : <div className="aspect-[4/5]"><ProductMockup tone="from-[#5a2f21] to-[#1f130e]" /></div>}
              <Badge className="absolute left-5 top-5 rounded-full bg-white px-3 py-1.5 text-[#603722] shadow-sm">{product.categoryName}</Badge>
            </div>
          </div>

          <div className="lg:pt-2">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#9b674a]">Phú Tài Coffee Works</p>
            <h1 className="mt-3 font-serif text-4xl font-black leading-[1.12] text-[#2a1710] sm:text-5xl">{product.name}</h1>
            <p className="mt-3 text-sm font-semibold text-stone-500">Mã sản phẩm: PT-{String(product.id).padStart(4, "0")}</p>

            <div className="mt-4 flex flex-wrap items-center gap-3 border-b border-[#eadfd4] pb-5">
              <div className="flex items-center gap-1 text-amber-500">{Array.from({ length: 5 }, (_, index) => <Star key={index} size={17} className={index < Math.round(averageRating) ? "fill-current" : "text-stone-300"} />)}</div>
              <span className="text-sm font-bold text-stone-600">{reviews.length ? `${averageRating.toFixed(1)} · ${reviews.length} đánh giá` : "Chưa có đánh giá"}</span>
            </div>

            <div className="mt-5 flex flex-wrap items-end justify-between gap-4">
              <div>{isPromotion && product.price != null ? <p className="text-sm font-bold text-stone-400 line-through">{formatVnd(product.price)}</p> : null}<p className={`text-4xl font-black ${isPromotion ? "text-red-700" : "text-[#603722]"}`}>{formatVnd(price)}</p></div>
              <p className={`text-sm font-black ${product.stockQuantity > 0 ? "text-emerald-700" : "text-red-700"}`}>{product.stockQuantity > 0 ? `Còn hàng: ${product.stockQuantity} ${product.unit}` : "Tạm hết hàng"}</p>
            </div>

            <div className="mt-7 space-y-5 border-y border-[#eadfd4] py-6">
              <div><p className="text-sm font-black text-[#2a1710]">Quy cách đóng gói</p><button type="button" className="mt-3 min-h-11 border-2 border-[#6d3c29] bg-[#f8eee2] px-4 text-sm font-black text-[#4b2418]">Gói {product.unit || "1 kg"}</button></div>
              <div><p className="text-sm font-black text-[#2a1710]">Loại thành phẩm</p><div className="mt-3 inline-flex min-h-11 items-center border border-stone-300 bg-white px-4 text-sm font-bold text-stone-700">Cà phê hạt rang</div></div>
            </div>

            <div className="mt-6 flex gap-3">
              <div className="flex h-12 w-36 shrink-0 items-center justify-between border border-stone-300"><button type="button" aria-label="Giảm số lượng" onClick={() => changeQuantity(quantity - 1)} className="grid h-full w-11 place-items-center text-[#4b2418] hover:bg-stone-100"><Minus size={18} /></button><input aria-label="Số lượng" type="number" min={1} max={maximumQuantity} value={quantity} onChange={(event) => changeQuantity(Number(event.target.value))} className="h-full min-w-0 flex-1 bg-transparent text-center text-sm font-black outline-none" /><button type="button" aria-label="Tăng số lượng" onClick={() => changeQuantity(quantity + 1)} className="grid h-full w-11 place-items-center text-[#4b2418] hover:bg-stone-100"><Plus size={18} /></button></div>
              <Button disabled={!canBuy} onClick={addToCart} className="h-12 flex-1 rounded-none bg-[#4b2418] text-white hover:bg-[#2c150d]"><ShoppingCart size={18} />{canBuy ? "Thêm vào giỏ" : "Tạm hết hàng"}</Button>
            </div>
            <Button disabled={!canBuy} onClick={buyNow} variant="outline" className="mt-3 h-12 w-full rounded-none border-[#6d3c29] text-[#4b2418] hover:bg-[#f8eee2]">Mua ngay</Button>
            {product.isB2b ? <Button asChild variant="ghost" className="mt-2 h-auto px-0 text-sm font-black text-[#8c5739] hover:bg-transparent hover:text-[#4b2418]"><Link to="/bao-gia">Bạn mua số lượng lớn? Nhận báo giá doanh nghiệp <ChevronRight size={16} /></Link></Button> : null}
            <p className="mt-5 flex items-center gap-2 text-xs leading-5 text-stone-500"><Check size={16} className="shrink-0 text-emerald-700" />Giá hiển thị áp dụng cho quy cách đang chọn. Đơn B2B có thể được tư vấn blend và chính sách giá riêng.</p>
          </div>
        </section>

        <section className="mt-16 border-t border-[#eadfd4] pt-10">
          <div className="flex overflow-x-auto border-b border-[#eadfd4]">
            <DetailTabButton active={activeTab === "description"} onClick={() => setActiveTab("description")}>Mô tả sản phẩm</DetailTabButton>
            <DetailTabButton active={activeTab === "quality"} onClick={() => setActiveTab("quality")}>Tiêu chuẩn chất lượng</DetailTabButton>
            <DetailTabButton active={activeTab === "shipping"} onClick={() => setActiveTab("shipping")}>Giao hàng & thanh toán</DetailTabButton>
          </div>
          <div className="grid gap-8 py-9 lg:grid-cols-[1.12fr_0.88fr]">
            <div>
              {activeTab === "description" ? <><h2 className="font-serif text-3xl font-black text-[#2a1710]">Thông tin sản phẩm</h2><p className="mt-5 max-w-3xl whitespace-pre-line text-base leading-8 text-stone-700">{product.description || "Cà phê hạt được tuyển chọn và rang mới theo quy trình kiểm soát của Phú Tài Coffee Works. Hương vị phù hợp cho nhu cầu pha phin, pha máy và sử dụng hằng ngày."}</p><p className="mt-5 text-base leading-8 text-stone-700">Sản phẩm được đóng gói theo quy cách {product.unit || "1 kg"}, hỗ trợ khách hàng bán lẻ và đối tác cần nguồn cà phê ổn định cho mô hình kinh doanh.</p></> : null}
              {activeTab === "quality" ? <><h2 className="font-serif text-3xl font-black text-[#2a1710]">Tiêu chuẩn rang xay</h2><div className="mt-6 grid gap-4 sm:grid-cols-3"><QualityPoint title="Rang mộc" description="Ưu tiên hương vị tự nhiên của hạt cà phê." /><QualityPoint title="Rang mới" description="Rang theo mẻ để chất lượng đồng đều." /><QualityPoint title="Kiểm soát" description="Theo dõi tồn kho và chất lượng trước khi giao." /></div></> : null}
              {activeTab === "shipping" ? <><h2 className="font-serif text-3xl font-black text-[#2a1710]">Giao hàng & thanh toán</h2><div className="mt-5 space-y-4 text-base leading-8 text-stone-700"><p>Đơn hàng được xác nhận sau khi kiểm tra tồn kho và thông tin nhận hàng. Phí vận chuyển được hiển thị tại bước thanh toán theo địa chỉ giao nhận.</p><p>Khách hàng có thể chọn COD, chuyển khoản hoặc SePay. Đối tác doanh nghiệp nhận báo giá và xác nhận điều khoản thanh toán riêng trước khi sản xuất hoặc giao hàng.</p></div></> : null}
            </div>
            <aside className="border-l-2 border-[#cda36d] bg-[#fbf8f4] p-6"><p className="text-sm font-black uppercase tracking-[0.14em] text-[#8c5739]">Cần tư vấn trước khi mua?</p><h3 className="mt-2 font-serif text-2xl font-black text-[#2a1710]">Chọn hạt, mức rang và quy cách phù hợp</h3><p className="mt-3 text-sm leading-6 text-stone-600">Đội ngũ Phú Tài hỗ trợ khách hàng quán cà phê, đại lý và doanh nghiệp lựa chọn sản phẩm phù hợp với mô hình vận hành.</p><Button asChild className="mt-5 rounded-none bg-[#a8633c] text-white hover:bg-[#814526]"><Link to="/bao-gia">Gửi yêu cầu báo giá</Link></Button></aside>
          </div>
        </section>

        <section className="border-t border-[#eadfd4] py-12"><div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-sm font-black uppercase tracking-[0.15em] text-[#9b674a]">Phản hồi khách hàng</p><h2 className="mt-2 font-serif text-3xl font-black text-[#2a1710]">Đánh giá sản phẩm</h2></div><p className="text-sm font-bold text-stone-500">{reviews.length} đánh giá từ đơn hàng hoàn tất</p></div>{reviews.length ? <div className="mt-7 grid gap-4 md:grid-cols-2">{reviews.map((review) => <article key={review.id} className="border border-[#e7d9ca] bg-white p-5"><div className="flex items-center justify-between gap-3"><strong className="text-[#291710]">{review.user.fullName}</strong><div className="flex">{Array.from({ length: 5 }, (_, index) => <Star key={index} size={16} className={index < review.rating ? "fill-amber-400 text-amber-400" : "text-stone-300"} />)}</div></div><p className="mt-3 text-sm leading-6 text-stone-600">{review.content || "Khách hàng đã đánh giá sản phẩm này."}</p><p className="mt-3 text-xs font-semibold text-stone-400">{new Intl.DateTimeFormat("vi-VN", { dateStyle: "medium" }).format(new Date(review.createdAt))}</p></article>)}</div> : <div className="mt-7 border border-dashed border-stone-300 bg-[#fbf8f4] p-8 text-center text-sm font-semibold text-stone-500">Sản phẩm chưa có đánh giá. Đánh giá sẽ được mở cho khách hàng sau khi hoàn tất đơn hàng.</div>}</section>

        <section className="border-t border-[#eadfd4] py-12"><div className="flex items-end justify-between gap-4"><div><p className="text-sm font-black uppercase tracking-[0.15em] text-[#9b674a]">Gợi ý thêm</p><h2 className="mt-2 font-serif text-3xl font-black text-[#2a1710]">Sản phẩm liên quan</h2></div><Button asChild variant="outline" className="rounded-none"><Link to="/san-pham">Xem catalogue</Link></Button></div><div className="mt-7 grid gap-5 md:grid-cols-3">{suggestions.map((item) => <Link key={item.id} to={`/san-pham/${item.slug}`} className="group overflow-hidden border border-[#e7d9ca] bg-white transition hover:-translate-y-1 hover:shadow-lg"><div className="overflow-hidden bg-[#f3ebe1]">{item.imageUrl ? <img alt={item.name} src={item.imageUrl} loading="lazy" onError={(event) => { event.currentTarget.onerror = null; event.currentTarget.src = fallbackImages[item.id % fallbackImages.length]; }} className="h-52 w-full object-cover transition duration-500 group-hover:scale-105" /> : <ProductMockup />}</div><div className="p-5"><p className="text-xs font-black uppercase text-[#9b674a]">{item.categoryName}</p><h3 className="mt-2 text-lg font-black text-[#291710]">{item.name}</h3><p className="mt-2 font-black text-[#4b2418]">{formatVnd(getDisplayPrice(item).price)}</p></div></Link>)}</div></section>
      </div>
    </main>
  );
}

function DetailTabButton({ active, children, onClick }: { active: boolean; children: string; onClick: () => void }) {
  return <button type="button" onClick={onClick} className={`shrink-0 border-b-2 px-5 py-4 text-sm font-black transition ${active ? "border-[#6d3c29] text-[#4b2418]" : "border-transparent text-stone-500 hover:text-[#4b2418]"}`}>{children}</button>;
}

function QualityPoint({ title, description }: { title: string; description: string }) {
  return <div className="border border-[#e7d9ca] bg-white p-5"><Coffee size={20} className="text-[#8c5739]" /><h3 className="mt-4 font-black text-[#291710]">{title}</h3><p className="mt-2 text-sm leading-6 text-stone-600">{description}</p></div>;
}
