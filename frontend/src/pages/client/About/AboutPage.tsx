import { Factory, PackageCheck, Scale, ShieldCheck, Truck, UsersRound } from "lucide-react";
import { Badge } from "../../../components/ui/badge";
import { Card, CardContent } from "../../../components/ui/card";
import { processSteps } from "../../../data/site";

const capabilities = [
  {
    icon: Scale,
    title: "Nguồn nguyên liệu rõ ràng",
    desc: "Lựa chọn Robusta, Arabica và blend theo hồ sơ rang phù hợp từng mô hình kinh doanh.",
  },
  {
    icon: Factory,
    title: "Sản xuất theo quy trình",
    desc: "Rang, xay, phối trộn, đóng gói và lưu kho theo từng đơn hàng để giữ chất lượng ổn định.",
  },
  {
    icon: ShieldCheck,
    title: "Kiểm soát chất lượng",
    desc: "Theo dõi màu rang, độ ẩm, hương vị và lưu mẫu để hỗ trợ các lần đặt hàng tiếp theo.",
  },
];

const services = [
  {
    icon: PackageCheck,
    title: "Cung ứng cà phê B2C/B2B",
    desc: "Bán lẻ cho khách cá nhân và cung ứng sỉ cho quán, đại lý, văn phòng, chuỗi F&B.",
  },
  {
    icon: UsersRound,
    title: "OEM / Private Label",
    desc: "Tư vấn profile rang, blend, quy cách đóng gói và bao bì riêng cho thương hiệu cà phê.",
  },
  {
    icon: Truck,
    title: "Giao nhận định kỳ",
    desc: "Theo dõi đơn hàng, tồn kho và lịch giao để khách doanh nghiệp có nguồn hàng ổn định.",
  },
];

export function AboutPage() {
  return (
    <main className="bg-stone-50">
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <Badge>Giới thiệu & dịch vụ</Badge>
        <div className="mt-5 grid gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
          <div>
            <h1 className="font-serif text-4xl font-black leading-tight text-stone-950 md:text-6xl">
              Nhà máy cà phê cho bán lẻ, bán sỉ và gia công thương hiệu riêng.
            </h1>
            <p className="mt-6 text-lg leading-8 text-stone-600">
              Phú Tài Coffee Works mô phỏng một hệ thống thương mại điện tử cho nhà máy cà phê: khách lẻ có thể mua hàng trực tiếp, còn khách doanh nghiệp có thể gửi báo giá, đặt đơn sỉ, theo dõi giao nhận và làm việc theo hợp đồng.
            </p>
          </div>
          <div className="hm-why-photo rounded-lg" />
        </div>

        <section className="mt-16">
          <h2 className="font-serif text-4xl font-black text-stone-950">Thế mạnh của chúng tôi</h2>
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {capabilities.map((item) => (
              <Card key={item.title} className="bg-white">
                <CardContent className="p-6">
                  <item.icon className="text-[var(--tan)]" size={38} strokeWidth={1.8} />
                  <h3 className="mt-5 text-2xl font-black text-stone-950">{item.title}</h3>
                  <p className="mt-3 leading-7 text-stone-600">{item.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="mt-16">
          <h2 className="font-serif text-4xl font-black text-stone-950">Dịch vụ chính</h2>
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {services.map((item) => (
              <Card key={item.title} className="bg-white">
                <CardContent className="p-6">
                  <item.icon className="text-[var(--leaf)]" size={38} strokeWidth={1.8} />
                  <h3 className="mt-5 text-2xl font-black text-stone-950">{item.title}</h3>
                  <p className="mt-3 leading-7 text-stone-600">{item.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="mt-16">
          <h2 className="font-serif text-4xl font-black text-stone-950">Quy trình làm việc</h2>
          <div className="mt-8 grid gap-4 md:grid-cols-4">
            {processSteps.map(([title, desc], index) => (
              <Card key={title} className="bg-white">
                <CardContent className="p-6">
                  <p className="text-4xl font-black text-[var(--gold)]">0{index + 1}</p>
                  <h3 className="mt-4 text-lg font-black text-stone-950">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-stone-600">{desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}
