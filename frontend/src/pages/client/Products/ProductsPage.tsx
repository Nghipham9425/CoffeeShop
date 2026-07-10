import { Check, ShoppingCart } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ProductMockup } from "../../../components/ProductMockup";
import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import { Card, CardContent } from "../../../components/ui/card";
import { useCart } from "../../../contexts/CartContext";
import { formatVnd, publicApi, type PublicProduct } from "../../../lib/publicApi";

const packTones = [
  "from-[#5a2f21] to-[#1f130e]",
  "from-[#9a5d38] to-[#4b281c]",
  "from-[#36553a] to-[#172318]",
  "from-[#c47a3d] to-[#5b2f1f]",
];

export function ProductsPage() {
  const { addItem, items } = useCart();
  const [products, setProducts] = useState<PublicProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    publicApi
      .products()
      .then((data) => {
        if (isMounted) setProducts(data);
      })
      .catch((apiError) => {
        if (isMounted) {
          setError(apiError instanceof Error ? apiError.message : "Không thể tải danh sách sản phẩm.");
        }
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <main className="bg-stone-50">
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <Badge>Sản phẩm bán lẻ</Badge>
        <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="font-serif text-4xl font-black text-stone-950 md:text-6xl">
              Cà phê rang xay Phú Tài
            </h1>
            <p className="mt-4 max-w-2xl text-lg leading-8 text-stone-600">
              Danh mục sản phẩm dành cho khách lẻ. Khách doanh nghiệp có thể gửi yêu cầu báo giá để nhận chính sách sỉ, hợp đồng và công nợ riêng.
            </p>
          </div>
          <Button asChild variant="outline">
            <Link to="/bao-gia">Gửi báo giá B2B</Link>
          </Button>
        </div>

        {error ? (
          <Card className="mt-8 border-red-100 bg-red-50">
            <CardContent className="p-5 font-bold text-red-700">{error}</CardContent>
          </Card>
        ) : null}

        {isLoading ? (
          <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <Card key={index} className="bg-white">
                <CardContent className="p-5">
                  <div className="h-64 animate-pulse rounded-3xl bg-stone-200" />
                  <div className="mt-5 h-5 w-24 animate-pulse rounded bg-stone-200" />
                  <div className="mt-4 h-7 w-full animate-pulse rounded bg-stone-200" />
                  <div className="mt-3 h-16 w-full animate-pulse rounded bg-stone-100" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : null}

        {!isLoading && products.length === 0 ? (
          <Card className="mt-8 bg-white">
            <CardContent className="p-8 text-center">
              <h2 className="text-2xl font-black">Chưa có sản phẩm bán lẻ</h2>
              <p className="mt-2 text-stone-600">Bạn có thể thêm sản phẩm retail trong trang quản trị.</p>
            </CardContent>
          </Card>
        ) : null}

        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {products.map((product, index) => {
            const isInCart = items.some((item) => item.productId === product.id);
            const canBuy = product.price != null;

            return (
              <Card key={product.id} className="bg-white">
                <CardContent className="flex h-full flex-col p-5">
                  {product.imageUrl ? (
                    <img
                      alt={product.name}
                      className="h-64 w-full rounded-3xl object-cover"
                      src={product.imageUrl}
                    />
                  ) : (
                    <ProductMockup tone={packTones[index % packTones.length]} />
                  )}
                  <Badge className="mt-5">{product.categoryName}</Badge>
                  <h2 className="mt-3 text-xl font-black text-stone-950">{product.name}</h2>
                  <p className="mt-2 line-clamp-3 text-sm leading-6 text-stone-600">
                    {product.description || "Sản phẩm cà phê rang xay phù hợp cho nhu cầu dùng thử và mua lẻ."}
                  </p>
                  <div className="mt-auto pt-5">
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-black text-[var(--roast)]">{formatVnd(product.price)}</span>
                      <span className="text-sm font-bold text-stone-500">MOQ {product.minimumOrderKg}kg</span>
                    </div>
                    <Button
                      className="mt-4 w-full"
                      disabled={!canBuy}
                      onClick={() => addItem(product)}
                      variant={isInCart ? "outline" : "default"}
                    >
                      {isInCart ? <Check size={18} /> : <ShoppingCart size={18} />}
                      {isInCart ? "Đã có trong giỏ" : "Thêm giỏ hàng"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>
    </main>
  );
}
