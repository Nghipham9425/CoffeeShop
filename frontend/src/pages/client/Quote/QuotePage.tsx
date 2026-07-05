import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import { Card, CardContent } from "../../../components/ui/card";

export function QuotePage() {
  return (
    <main className="mx-auto grid max-w-7xl gap-6 px-4 py-12 sm:px-6 lg:grid-cols-[1fr_0.75fr] lg:px-8">
      <Card>
        <CardContent className="p-8">
          <Badge>Yêu cầu báo giá</Badge>
          <h1 className="mt-4 text-5xl font-black">Nhận báo giá cho đơn hàng sỉ</h1>
          <div className="mt-8 grid gap-4">
            {["Tên công ty", "Người liên hệ", "Số điện thoại / email", "Sản phẩm cần báo giá", "Số lượng dự kiến"].map((placeholder) => (
              <input key={placeholder} className="h-12 rounded-2xl border border-stone-200 px-4 outline-none focus:ring-2 focus:ring-[var(--leaf)]" placeholder={placeholder} />
            ))}
            <textarea className="min-h-32 rounded-2xl border border-stone-200 px-4 py-3 outline-none focus:ring-2 focus:ring-[var(--leaf)]" placeholder="Ghi chú nhu cầu OEM, lịch giao, khu vực giao hàng..." />
            <Button size="lg">Gửi yêu cầu</Button>
          </div>
        </CardContent>
      </Card>
      <Card className="bg-[var(--coffee)] text-white">
        <CardContent className="p-8">
          <h2 className="text-3xl font-black">Thông tin cần chuẩn bị</h2>
          <ul className="mt-6 space-y-4 text-sm leading-6 text-white/80">
            <li>Loại sản phẩm cần mua hoặc cần gia công.</li>
            <li>Sản lượng dự kiến theo tháng.</li>
            <li>Khu vực giao hàng và thời gian mong muốn.</li>
            <li>Yêu cầu bao bì, nhãn riêng hoặc chứng nhận.</li>
          </ul>
        </CardContent>
      </Card>
    </main>
  );
}
