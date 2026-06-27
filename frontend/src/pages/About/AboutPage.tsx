import { Badge } from "../../components/ui/badge";
import { Card, CardContent } from "../../components/ui/card";

export function AboutPage() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <Badge>Về nhà máy</Badge>
      <h1 className="mt-4 max-w-4xl text-5xl font-black">Nhà máy sản xuất cà phê phục vụ khách hàng B2B.</h1>
      <p className="mt-5 max-w-3xl text-lg leading-8 text-stone-600">
        Phú Tài mô phỏng một nhà máy cà phê có năng lực rang xay, đóng gói, kiểm soát chất lượng và cung ứng định kỳ
        cho khách hàng doanh nghiệp.
      </p>
      <div className="mt-10 grid gap-5 md:grid-cols-3">
        {[
          ["Nguồn nguyên liệu", "Robusta Đắk Lắk, Arabica Cầu Đất và blend theo yêu cầu."],
          ["Sản xuất", "Rang, xay, đóng gói và kiểm tra chất lượng theo từng đơn hàng."],
          ["Cung ứng", "Giao hàng định kỳ cho quán, đại lý, khách sạn và văn phòng."],
        ].map(([title, desc]) => (
          <Card key={title}>
            <CardContent>
              <h2 className="text-xl font-black">{title}</h2>
              <p className="mt-3 text-sm leading-6 text-stone-600">{desc}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </main>
  );
}
