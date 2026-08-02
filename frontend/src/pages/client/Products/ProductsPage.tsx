import { ArrowRight, PackageCheck, Search, ShoppingCart, SlidersHorizontal } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ProductMockup } from "../../../components/ProductMockup";
import { Seo } from "../../../components/Seo";
import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import { Card, CardContent } from "../../../components/ui/card";
import { Pagination } from "../../../components/ui/pagination";
import { useCart } from "../../../contexts/CartContext";
import { formatVnd, publicApi, type PublicProduct } from "../../../lib/publicApi";

const packTones = [
  "from-[#4a281c] to-[#1d120f]",
  "from-[#9d5d38] to-[#4d291d]",
  "from-[#36533e] to-[#15251b]",
  "from-[#c58245] to-[#623520]",
];

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

export function ProductsPage() {
  const { addItem } = useCart();
  const [products, setProducts] = useState<PublicProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Tất cả");
  const [sort, setSort] = useState("featured");
  const pageSize = 8;

  useEffect(() => {
    let isMounted = true;
    publicApi.products()
      .then((data) => { if (isMounted) setProducts(data); })
      .catch((apiError) => { if (isMounted) setError(apiError instanceof Error ? apiError.message : "Không thể tải danh sách sản phẩm."); })
      .finally(() => { if (isMounted) setIsLoading(false); });
    return () => { isMounted = false; };
  }, []);

  const categories = useMemo(() => ["Tất cả", ...Array.from(new Set(products.map((product) => product.categoryName)))], [products]);
  const filteredProducts = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("vi-VN");
    const result = products.filter((product) => {
      const matchesCategory = category === "Tất cả" || product.categoryName === category;
      const haystack = `${product.name} ${product.description ?? ""} ${product.categoryName}`.toLocaleLowerCase("vi-VN");
      return matchesCategory && (!normalizedQuery || haystack.includes(normalizedQuery));
    });

    return result.sort((left, right) => {
      if (sort === "price-asc") return (getDisplayPrice(left).price ?? Number.MAX_VALUE) - (getDisplayPrice(right).price ?? Number.MAX_VALUE);
      if (sort === "price-desc") return (getDisplayPrice(right).price ?? 0) - (getDisplayPrice(left).price ?? 0);
      if (sort === "stock") return right.stockQuantity - left.stockQuantity;
      return right.id - left.id;
    });
  }, [category, products, query, sort]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const visibleProducts = filteredProducts.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  function updateFilters(callback: () => void) {
    callback();
    setPage(1);
  }

  return (
    <main className="min-h-screen bg-[#faf8f4]">
      <Seo
        title="Sản phẩm cà phê rang xay"
        description="Danh mục cà phê hạt rang xay Phú Tài Coffee Works dành cho nhu cầu dùng tại nhà, quán cà phê và đối tác doanh nghiệp."
        canonicalPath="/san-pham"
      />

      <section className="hidden border-b border-[#e6d8c8] bg-[#2a1710] text-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[1.35fr_0.65fr] lg:px-8 lg:py-20">
          <div>
            <Badge className="bg-[#d9b77a] text-[#342016]">Danh mục cà phê hạt</Badge>
            <h1 className="mt-5 max-w-3xl font-serif text-4xl font-black leading-tight sm:text-5xl lg:text-6xl">Cà phê được rang theo gu uống của bạn.</h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-white/75 sm:text-lg">Chọn hạt Arabica, Robusta hoặc blend rang xay mới. Mỗi sản phẩm có thông tin nguồn gốc, mức tồn kho và đơn vị đặt hàng rõ ràng.</p>
            <div className="mt-8 flex flex-wrap gap-3 text-sm font-bold text-[#f0dec1]">
              <span className="rounded-full border border-white/20 px-4 py-2">Rang mới theo mẻ</span>
              <span className="rounded-full border border-white/20 px-4 py-2">Đặt từ 1 kg</span>
              <span className="rounded-full border border-white/20 px-4 py-2">Có chính sách giá sỉ</span>
            </div>
          </div>
          <div className="grid content-end gap-3 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
            <PackageCheck className="text-[#d9b77a]" size={36} />
            <p className="text-3xl font-black">{products.length || "--"}</p>
            <p className="text-sm leading-6 text-white/70">Dòng cà phê hiện có trong catalogue bán lẻ. Đơn B2B có thể yêu cầu mức rang, blend và bao bì riêng.</p>
            <Link to="/bao-gia" className="mt-2 inline-flex items-center gap-2 text-sm font-black text-[#f1d69b] hover:text-white">Nhận báo giá doanh nghiệp <ArrowRight size={16} /></Link>
          </div>
        </div>
      </section>

      <section className="border-b border-[#e6d8c8] bg-[#2a1710] text-white">
        <div className="mx-auto grid max-w-7xl overflow-hidden px-4 sm:px-6 lg:grid-cols-[1.02fr_0.98fr] lg:px-8">
          <div className="flex flex-col justify-center py-14 lg:py-20">
            <Badge className="w-fit bg-[#d9b77a] text-[#342016]">Cà phê hạt rang mới</Badge>
            <h1 className="mt-5 max-w-2xl font-serif text-4xl font-black leading-[1.08] sm:text-5xl lg:text-[3.7rem]">
              Chọn hạt cà phê phù hợp với cách bạn pha.
            </h1>
            <p className="mt-5 max-w-xl text-base leading-8 text-white/75 sm:text-lg">
              Arabica, Robusta và các dòng blend được rang theo mẻ. Thông tin giá, tồn kho và đơn vị đặt hàng được hiển thị rõ ràng cho từng sản phẩm.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href="#catalogue" className="inline-flex h-11 items-center gap-2 rounded-lg bg-[#d9b77a] px-5 text-sm font-black text-[#342016] transition hover:bg-[#f0d49d]">
                Xem catalogue <ArrowRight size={17} />
              </a>
              <Link to="/bao-gia" className="inline-flex h-11 items-center justify-center rounded-lg border border-white/25 px-5 text-sm font-black text-white transition hover:border-[#e3c68d] hover:bg-white/10">
                Nhận báo giá doanh nghiệp
              </Link>
            </div>
            <p className="mt-8 text-sm font-semibold text-[#e7cfaa]">Rang mới theo mẻ · Đặt từ 1 kg · Có chính sách giá sỉ</p>
          </div>

          <div className="relative min-h-[360px] overflow-hidden lg:min-h-[520px]">
            <img
              src="/images/products/coffee-kg-catalogue-hero.png"
              alt="Bộ sưu tập cà phê hạt rang mới của Phú Tài Coffee Works"
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#1e100a]/85 via-[#1e100a]/10 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-7">
              <div className="max-w-sm border-l-2 border-[#d9b77a] pl-4">
                <p className="text-xs font-black uppercase tracking-[0.16em] text-[#e8cf9d]">Dành cho B2C và B2B</p>
                <p className="mt-2 text-xl font-black leading-7 text-white">Có thể đặt mua trực tiếp hoặc gửi yêu cầu rang, blend và báo giá riêng.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="catalogue" className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-4 border-b border-[#e8dfd4] pb-6 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-black uppercase tracking-wide text-[#8c624c]">Catalogue bán lẻ</p>
            <h2 className="mt-1 font-serif text-3xl font-black text-[#291710]">Chọn loại cà phê phù hợp</h2>
          </div>
          <p className="text-sm font-semibold text-stone-500">Hiển thị {filteredProducts.length} sản phẩm đang kinh doanh</p>
        </div>

        <div className="mt-6 grid gap-3 rounded-2xl border border-[#e8dfd4] bg-white p-4 shadow-sm lg:grid-cols-[1.4fr_0.8fr_0.7fr]">
          <label className="flex h-11 items-center gap-3 rounded-xl bg-stone-100 px-4 text-stone-500 focus-within:ring-2 focus-within:ring-[#9a6245]">
            <Search size={19} />
            <input value={query} onChange={(event) => updateFilters(() => setQuery(event.target.value))} className="min-w-0 flex-1 bg-transparent text-sm font-semibold text-stone-800 outline-none placeholder:text-stone-400" placeholder="Tìm theo tên, dòng cà phê hoặc hương vị" />
          </label>
          <label className="flex h-11 items-center gap-3 rounded-xl border border-stone-200 px-4 text-sm font-bold text-stone-600">
            <SlidersHorizontal size={18} className="text-[#8c624c]" />
            <select value={category} onChange={(event) => updateFilters(() => setCategory(event.target.value))} className="min-w-0 flex-1 bg-transparent outline-none">
              {categories.map((item) => <option key={item}>{item}</option>)}
            </select>
          </label>
          <select aria-label="Sắp xếp sản phẩm" value={sort} onChange={(event) => updateFilters(() => setSort(event.target.value))} className="h-11 rounded-xl border border-stone-200 bg-white px-4 text-sm font-bold text-stone-700 outline-none focus:ring-2 focus:ring-[#9a6245]">
            <option value="featured">Sản phẩm mới nhất</option>
            <option value="price-asc">Giá thấp đến cao</option>
            <option value="price-desc">Giá cao đến thấp</option>
            <option value="stock">Tồn kho nhiều nhất</option>
          </select>
        </div>

        {error && <Card className="mt-8 border-red-100 bg-red-50"><CardContent className="p-5 font-bold text-red-700">{error}</CardContent></Card>}

        {isLoading && <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">{Array.from({ length: 8 }).map((_, index) => <div key={index} className="h-[430px] animate-pulse rounded-2xl bg-stone-200" />)}</div>}

        {!isLoading && !error && !filteredProducts.length && <Card className="mt-8 border-dashed border-stone-300"><CardContent className="p-10 text-center"><h3 className="text-xl font-black text-stone-900">Chưa tìm thấy sản phẩm phù hợp</h3><p className="mt-2 text-sm text-stone-500">Thử đổi từ khóa hoặc chọn lại danh mục.</p><Button className="mt-5" variant="outline" onClick={() => { setQuery(""); setCategory("Tất cả"); setSort("featured"); setPage(1); }}>Xóa bộ lọc</Button></CardContent></Card>}

        <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {visibleProducts.map((product, index) => {
            const { price, isPromotion } = getDisplayPrice(product);
            const canBuy = price != null && product.stockQuantity > 0;
            const image = product.imageUrl;

            return <article key={product.id} className="group overflow-hidden rounded-2xl border border-[#e8dfd4] bg-white shadow-[0_8px_26px_rgba(66,38,24,0.06)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_34px_rgba(66,38,24,0.14)]">
              <Link to={`/san-pham/${product.slug}`} className="block overflow-hidden bg-[#f3ebe1]">
                {image ? <img alt={product.name} src={image} loading="lazy" onError={(event) => { event.currentTarget.onerror = null; event.currentTarget.src = fallbackImages[index % fallbackImages.length]; }} className="h-64 w-full object-cover transition duration-500 group-hover:scale-105" /> : <ProductMockup tone={packTones[index % packTones.length]} />}
              </Link>
              <div className="flex min-h-[230px] flex-col p-5">
                <div className="flex items-center justify-between gap-3"><Badge className="bg-[#f6ede2] text-[#87583f]">{product.categoryName}</Badge><span className={`text-xs font-black ${product.stockQuantity > 0 ? "text-emerald-700" : "text-red-700"}`}>{product.stockQuantity > 0 ? `Còn ${product.stockQuantity} ${product.unit}` : "Tạm hết hàng"}</span></div>
                <Link to={`/san-pham/${product.slug}`} className="mt-4 line-clamp-2 text-xl font-black leading-7 text-[#291710] transition-colors hover:text-[#8b4f30]">{product.name}</Link>
                <p className="mt-2 line-clamp-2 text-sm leading-6 text-stone-600">{product.description || "Cà phê hạt được rang mới, phù hợp cho nhu cầu pha chế mỗi ngày."}</p>
                <div className="mt-auto pt-5">
                  <div className="flex items-end justify-between gap-3"><div>{isPromotion && product.price != null ? <p className="text-xs font-bold text-stone-400 line-through">{formatVnd(product.price)}</p> : null}<p className={`text-xl font-black ${isPromotion ? "text-red-700" : "text-[#4b2418]"}`}>{formatVnd(price)}</p></div><p className="text-xs font-bold text-stone-500">Đơn vị: {product.unit}</p></div>
                  <div className="mt-4 grid grid-cols-2 gap-2"><Button asChild variant="outline" className="rounded-xl px-3"><Link to={`/san-pham/${product.slug}`}>Chi tiết</Link></Button><Button disabled={!canBuy} onClick={() => addItem({ ...product, price })} className="rounded-xl bg-[#4b2418] px-3 text-white hover:bg-[#2d160d]"><ShoppingCart size={17} />{canBuy ? "Thêm giỏ" : "Hết hàng"}</Button></div>
                </div>
              </div>
            </article>;
          })}
        </div>
        <div className="mt-9"><Pagination page={currentPage} pageSize={pageSize} total={filteredProducts.length} onChange={setPage} /></div>
      </section>
    </main>
  );
}
