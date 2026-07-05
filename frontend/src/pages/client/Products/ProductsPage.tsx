import { ProductMockup } from "../../../components/ProductMockup";
import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import { Card, CardContent } from "../../../components/ui/card";
import { products } from "../../../data/site";

export function ProductsPage() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <Badge>Catalog B2B</Badge>
      <h1 className="mt-4 text-5xl font-black">Sản phẩm cà phê</h1>
      <p className="mt-4 max-w-2xl text-lg leading-8 text-stone-600">
        Danh mục sản phẩm dùng cho bán sỉ, yêu cầu báo giá và hợp đồng cung ứng định kỳ.
      </p>
      <div className="mt-8 flex flex-wrap gap-2">
        {["Tất cả", "Cà phê rang xay", "Cà phê hạt", "Espresso", "OEM"].map((item) => (
          <Button key={item} variant="outline">{item}</Button>
        ))}
      </div>
      <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {products.map((product) => (
          <Card key={product.id} className="bg-stone-50">
            <CardContent className="p-5">
              <ProductMockup tone={product.tone} />
              <Badge className="mt-5">{product.category}</Badge>
              <h2 className="mt-3 text-xl font-black">{product.name}</h2>
              <p className="mt-2 text-sm leading-6 text-stone-600">{product.desc}</p>
              <div className="mt-5 flex items-center justify-between">
                <span className="font-black text-[var(--roast)]">{product.price}</span>
                <span className="text-sm font-bold text-stone-500">MOQ {product.moq}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </main>
  );
}
