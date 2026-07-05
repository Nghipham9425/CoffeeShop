import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import { Card, CardContent } from "../../../components/ui/card";

export function ContactPage() {
  return (
    <main className="mx-auto grid max-w-7xl gap-6 px-4 py-12 sm:px-6 lg:grid-cols-[0.85fr_1.15fr] lg:px-8">
      <div>
        <Badge>Liên hệ</Badge>
        <h1 className="mt-4 text-5xl font-black">Trao đổi với bộ phận sales</h1>
        <p className="mt-5 text-lg leading-8 text-stone-600">
          Gửi thông tin để được tư vấn sản phẩm, báo giá sỉ, hợp đồng định kỳ hoặc gia công thương hiệu riêng.
        </p>
      </div>
      <Card>
        <CardContent className="grid gap-4 p-8">
          <input className="h-12 rounded-2xl border border-stone-200 px-4 outline-none focus:ring-2 focus:ring-[var(--leaf)]" placeholder="Họ tên" />
          <input className="h-12 rounded-2xl border border-stone-200 px-4 outline-none focus:ring-2 focus:ring-[var(--leaf)]" placeholder="Email / Số điện thoại" />
          <textarea className="min-h-32 rounded-2xl border border-stone-200 px-4 py-3 outline-none focus:ring-2 focus:ring-[var(--leaf)]" placeholder="Nội dung cần tư vấn" />
          <Button>Gửi liên hệ</Button>
        </CardContent>
      </Card>
    </main>
  );
}
