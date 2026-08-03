import { ShoppingCart } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ProductMockup } from "../../../components/ProductMockup";
import { Seo } from "../../../components/Seo";
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
  const [category, setCategory] = useState("Tất cả danh mục");
  const [sort, setSort] = useState("latest");
  const pageSize = 12;

  useEffect(() => {
    let isMounted = true;
    publicApi.products()
      .then((data) => { if (isMounted) setProducts(data); })
      .catch((apiError) => {
        if (isMounted) setError(apiError instanceof Error ? apiError.message : "Không thể tải danh sách sản phẩm.");
      })
      .finally(() => { if (isMounted) setIsLoading(false); });
    return () => { isMounted = false; };
  }, []);

  const categories = useMemo(
    () => ["Tất cả danh mục", ...Array.from(new Set(products.map((product) => product.categoryName)))],
    [products],
  );

  const filteredProducts = useMemo(() => {
    const result = products.filter((product) => category === "Tất cả danh mục" || product.categoryName === category);

    return result.sort((left, right) => {
      if (sort === "price-asc") return (getDisplayPrice(left).price ?? Number.MAX_VALUE) - (getDisplayPrice(right).price ?? Number.MAX_VALUE);
      if (sort === "price-desc") return (getDisplayPrice(right).price ?? 0) - (getDisplayPrice(left).price ?? 0);
      return right.id - left.id;
    });
  }, [category, products, sort]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const visibleProducts = filteredProducts.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  function updateCategory(value: string) {
    setCategory(value);
    setPage(1);
  }

  function updateSort(value: string) {
    setSort(value);
    setPage(1);
  }

  return (
    <main className="min-h-screen bg-white">
      <Seo
        title="Sản phẩm cà phê rang xay"
        description="Danh mục cà phê hạt rang xay Phú Tài Coffee Works dành cho nhu cầu dùng tại nhà, quán cà phê và đối tác doanh nghiệp."
        canonicalPath="/san-pham"
      />

      <section className="mx-auto max-w-[1440px] px-5 py-16 sm:px-8 lg:px-12 lg:py-24">
        <div className="flex flex-col gap-8 border-b border-[#eadfd4] pb-8 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#a46f4d]">Phú Tài Coffee Works</p>
            <h1 className="mt-3 font-serif text-4xl font-bold text-[#4a2d20] sm:text-5xl">Tất cả sản phẩm</h1>
          </div>

          <div className="flex w-full flex-col gap-4 sm:w-auto sm:flex-row sm:gap-8">
            <label className="flex min-w-[190px] items-center border-b border-[#4a2d20] pb-3 text-sm font-semibold text-[#603c2a]">
              <span className="sr-only">Lọc theo danh mục</span>
              <select value={category} onChange={(event) => updateCategory(event.target.value)} className="w-full cursor-pointer appearance-none bg-transparent pr-7 outline-none">
                {categories.map((item) => <option key={item}>{item}</option>)}
              </select>
            </label>
            <label className="flex min-w-[170px] items-center border-b border-[#4a2d20] pb-3 text-sm font-semibold text-[#603c2a]">
              <span className="sr-only">Sắp xếp sản phẩm</span>
              <select value={sort} onChange={(event) => updateSort(event.target.value)} className="w-full cursor-pointer appearance-none bg-transparent pr-7 outline-none">
                <option value="latest">Mới nhất</option>
                <option value="price-asc">Giá thấp đến cao</option>
                <option value="price-desc">Giá cao đến thấp</option>
              </select>
            </label>
          </div>
        </div>

        {error ? <Card className="mt-10 border-red-100 bg-red-50"><CardContent className="p-5 font-bold text-red-700">{error}</CardContent></Card> : null}

        {isLoading ? (
          <div className="mt-12 grid grid-cols-2 gap-x-6 gap-y-12 md:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, index) => <div key={index} className="aspect-square animate-pulse bg-stone-100" />)}
          </div>
        ) : null}

        {!isLoading && !error && !filteredProducts.length ? (
          <Card className="mt-12 border-dashed border-stone-300"><CardContent className="p-10 text-center">
            <h2 className="text-xl font-black text-stone-900">Chưa tìm thấy sản phẩm phù hợp</h2>
            <p className="mt-2 text-sm text-stone-500">Hãy chọn lại danh mục để xem các sản phẩm khác.</p>
            <Button className="mt-5" variant="outline" onClick={() => { setCategory("Tất cả danh mục"); setSort("latest"); setPage(1); }}>Xóa bộ lọc</Button>
          </CardContent></Card>
        ) : null}

        {!isLoading && !error && visibleProducts.length ? (
          <div className="mt-12 grid grid-cols-2 gap-x-5 gap-y-11 sm:gap-x-7 md:grid-cols-3 xl:grid-cols-4">
            {visibleProducts.map((product, index) => {
              const { price, isPromotion } = getDisplayPrice(product);
              const canBuy = price != null && product.stockQuantity > 0;
              const image = product.imageUrl;

              return (
                <article key={product.id} className="group min-w-0">
                  <div className="relative overflow-hidden bg-[#f4f1ed]">
                    <Link to={`/san-pham/${product.slug}`} className="block aspect-square">
                      {image ? (
                        <img
                          alt={product.name}
                          src={image}
                          loading="lazy"
                          onError={(event) => { event.currentTarget.onerror = null; event.currentTarget.src = fallbackImages[index % fallbackImages.length]; }}
                          className="h-full w-full object-contain transition duration-500 group-hover:scale-[1.035]"
                        />
                      ) : <ProductMockup tone={packTones[index % packTones.length]} />}
                    </Link>
                    {canBuy ? (
                      <button
                        type="button"
                        aria-label={`Thêm ${product.name} vào giỏ hàng`}
                        onClick={() => addItem({ ...product, price })}
                        className="absolute bottom-3 right-3 grid h-11 w-11 translate-y-2 place-items-center rounded-full bg-[#4a2d20] text-white opacity-0 shadow-lg transition duration-200 hover:bg-[#2c180f] group-hover:translate-y-0 group-hover:opacity-100 focus:translate-y-0 focus:opacity-100"
                      >
                        <ShoppingCart size={20} />
                      </button>
                    ) : null}
                  </div>
                  <div className="pt-5">
                    <Link to={`/san-pham/${product.slug}`} className="block truncate text-lg font-semibold text-[#573526] transition hover:text-[#a15f3e] sm:text-xl">
                      {product.name}
                    </Link>
                    <div className="mt-3 flex items-baseline gap-3">
                      {price != null ? <p className={`text-xl font-semibold ${isPromotion ? "text-[#b42318]" : "text-[#603c2a]"}`}>{formatVnd(price)}</p> : <p className="text-xl font-semibold text-[#603c2a]">Liên hệ báo giá</p>}
                      {isPromotion && product.price != null ? <p className="text-sm text-stone-400 line-through">{formatVnd(product.price)}</p> : null}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        ) : null}

        <div className="mt-14"><Pagination page={currentPage} pageSize={pageSize} total={filteredProducts.length} onChange={setPage} /></div>
      </section>
    </main>
  );
}
