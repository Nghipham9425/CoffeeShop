import { Mail, MapPin, Phone, Send } from "lucide-react";
import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import { Card, CardContent } from "../../../components/ui/card";

const quoteFields = [
  "Tên công ty / tên khách hàng",
  "Người liên hệ",
  "Số điện thoại / email",
  "Sản phẩm cần báo giá",
  "Số lượng dự kiến",
];

export function QuotePage() {
  return (
    <main className="bg-stone-50">
      <section className="mx-auto grid max-w-7xl gap-8 px-4 py-14 sm:px-6 lg:grid-cols-[1fr_0.75fr] lg:px-8">
        <Card className="bg-white">
          <CardContent className="p-8">
            <Badge>Báo giá & liên hệ</Badge>
            <h1 className="mt-4 font-serif text-4xl font-black leading-tight text-stone-950 md:text-6xl">
              Nhận tư vấn cho đơn hàng lẻ, đơn sỉ và gia công cà phê.
            </h1>
            <p className="mt-5 text-lg leading-8 text-stone-600">
              Gửi thông tin nhu cầu để bộ phận sales tư vấn sản phẩm, chính sách giá, giao nhận, hợp đồng B2B hoặc mẫu thử trước khi sản xuất.
            </p>

            <div className="mt-8 grid gap-4">
              {quoteFields.map((placeholder) => (
                <input
                  key={placeholder}
                  className="h-12 rounded-2xl border border-stone-200 px-4 outline-none focus:ring-2 focus:ring-[var(--leaf)]"
                  placeholder={placeholder}
                />
              ))}
              <textarea
                className="min-h-36 rounded-2xl border border-stone-200 px-4 py-3 outline-none focus:ring-2 focus:ring-[var(--leaf)]"
                placeholder="Ghi chú nhu cầu OEM, lịch giao, khu vực giao hàng, quy cách bao bì hoặc câu hỏi cần tư vấn..."
              />
              <Button size="lg">
                <Send size={18} />
                Gửi yêu cầu
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-5">
          <Card className="bg-[var(--coffee)] text-white">
            <CardContent className="p-8">
              <h2 className="text-3xl font-black">Thông tin cần chuẩn bị</h2>
              <ul className="mt-6 space-y-4 text-sm leading-6 text-white/80">
                <li>Loại sản phẩm cần mua hoặc cần gia công.</li>
                <li>Sản lượng dự kiến theo tháng hoặc theo từng đợt.</li>
                <li>Khu vực giao hàng và thời gian mong muốn.</li>
                <li>Yêu cầu bao bì, nhãn riêng, chứng nhận hoặc mẫu thử.</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-white">
            <CardContent className="p-8">
              <h2 className="text-3xl font-black text-stone-950">Liên hệ sales</h2>
              <div className="mt-6 grid gap-4 text-sm font-semibold text-stone-700">
                <p className="flex items-center gap-3">
                  <Phone className="text-[var(--tan)]" size={20} />
                  0886.33.25.33
                </p>
                <p className="flex items-center gap-3">
                  <Mail className="text-[var(--tan)]" size={20} />
                  sales@phutaicoffee.vn
                </p>
                <p className="flex items-center gap-3">
                  <MapPin className="text-[var(--tan)]" size={20} />
                  KCN Tân Bình, TP. Hồ Chí Minh
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  );
}
