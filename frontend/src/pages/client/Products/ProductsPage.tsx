import { ShoppingCart } from "lucide-react";
import { useEffect, useState } from "react";
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
  "from-[#5a2f21] to-[#1f130e]",
  "from-[#9a5d38] to-[#4b281c]",
  "from-[#36553a] to-[#172318]",
  "from-[#c47a3d] to-[#5b2f1f]",
];

export function ProductsPage() {
  const { addItem } = useCart();
  const [products, setProducts] = useState<PublicProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 8;

  useEffect(() => {
    let isMounted = true;
    publicApi.products()
      .then((data) => { if (isMounted) setProducts(data); })
      .catch((apiError) => { if (isMounted) setError(apiError instanceof Error ? apiError.message : "Không thể tải danh sách sản phẩm."); })
      .finally(() => { if (isMounted) setIsLoading(false); });
    return () => { isMounted = false; };
  }, []);

  const visibleProducts = products.slice((page - 1) * pageSize, page * pageSize);

  return (
    <main className="bg-stone-50">
      <Seo
        title="Sản phẩm cà phê rang xay"
        description="Khám phá cà phê rang xay Phú Tài dành cho khách lẻ, quán cà phê và doanh nghiệp cần nguồn hàng ổn định."
        canonicalPath="/san-pham"
      />
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <Badge>Sản phẩm bán lẻ</Badge>
        <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="font-serif text-4xl font-black text-stone-950 md:text-6xl">Cà phê rang xay Phú Tài</h1>
            <p className="mt-4 max-w-2xl text-lg leading-8 text-stone-600">Danh mục sản phẩm dành cho khách lẻ. Khách doanh nghiệp có thể gửi yêu cầu báo giá để nhận chính sách sỉ.</p>
          </div>
          <Button asChild variant="outline"><Link to="/bao-gia">Gửi báo giá B2B</Link></Button>
        </div>

        {error && <Card className="mt-8 border-red-100 bg-red-50"><CardContent className="p-5 font-bold text-red-700">{error}</CardContent></Card>}

        {isLoading && (
          <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <Card key={index} className="bg-white"><CardContent className="p-5"><div className="h-64 animate-pulse rounded-3xl bg-stone-200" /><div className="mt-5 h-5 w-24 animate-pulse rounded bg-stone-200" /><div className="mt-4 h-7 w-full animate-pulse rounded bg-stone-200" /><div className="mt-3 h-16 w-full animate-pulse rounded bg-stone-100" /></CardContent></Card>
            ))}
          </div>
        )}

        {!isLoading && products.length === 0 && (
          <Card className="mt-8 bg-white"><CardContent className="p-8 text-center"><h2 className="text-2xl font-black">Chưa có sản phẩm bán lẻ</h2></CardContent></Card>
        )}

        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {visibleProducts.map((product, index) => {
            const canBuy = product.price != null && product.stockQuantity > 0;

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
              <Card key={product.id} className="bg-white">
                <CardContent className="flex h-full flex-col p-5">
                  {product.imageUrl ? <img alt={product.name} className="h-64 w-full rounded-3xl object-cover" src={product.imageUrl} /> : <ProductMockup tone={packTones[index % packTones.length]} />}
                  <Badge className="mt-5">{product.categoryName}</Badge>
                  <h2 className="mt-3 text-xl font-black text-stone-950">{product.name}</h2>
                  <p className="mt-2 line-clamp-3 text-sm leading-6 text-stone-600">{product.description || "Sản phẩm cà phê rang xay phù hợp cho nhu cầu dùng thử và mua lẻ."}</p>
                  
                  <div className="mt-auto pt-5">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex flex-col">
                        {isModifiedPrice && product.price != null ? (
                          <>
                            <span className="text-sm font-bold text-stone-400 line-through">{formatVnd(product.price)}</span>
                            <span className={`font-black text-lg ${activePromo.price > (product.price ?? 0) ? 'text-orange-600' : 'text-red-600'}`}>{formatVnd(displayPrice)}</span>
                          </>
                        ) : (
                          <span className="font-black text-[var(--roast)]">{formatVnd(product.price)}</span>
                        )}
                      </div>
                      <span className="text-right text-sm font-bold text-stone-500">{product.unit}</span>
                    </div>
                    <p className={`mt-3 text-xs font-bold ${product.stockQuantity > 0 ? "text-emerald-700" : "text-red-700"}`}>
                      {product.stockQuantity > 0 ? `Còn ${product.stockQuantity} ${product.unit}` : "Tạm hết hàng"}
                    </p>
                    <Button className="mt-4 w-full" disabled={!canBuy} onClick={() => addItem(productToCart)}>
                      <ShoppingCart size={18} />
                      {product.stockQuantity > 0 ? "Thêm giỏ hàng" : "Hết hàng"}
                    </Button>
                    <Button asChild className="mt-3 w-full" variant="outline"><Link to={`/san-pham/${product.slug}`}>Xem chi tiết</Link></Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
        <div className="mt-8"><Pagination page={page} pageSize={pageSize} total={products.length} onChange={setPage} /></div>
      </section>
    </main>
  );
}
