import { CalendarCheck, Minus, PackageCheck, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { useMemo, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import { Card, CardContent } from "../../../components/ui/card";
import { useCart } from "../../../contexts/CartContext";
import { formatVnd, publicApi, type CheckoutOrder } from "../../../lib/publicApi";

const SHIPPING_FEE = 25000;

const paymentOptions = [
  { value: "COD", label: "Thanh toán khi nhận hàng" },
  { value: "BANK_TRANSFER", label: "Chuyển khoản ngân hàng" },
  { value: "MOMO", label: "Ví MoMo" },
  { value: "VNPAY", label: "VNPay" },
] as const;

type CheckoutForm = {
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  address: string;
  paymentMethod: (typeof paymentOptions)[number]["value"];
  note: string;
};

const initialForm: CheckoutForm = {
  customerName: "",
  customerPhone: "",
  customerEmail: "",
  address: "",
  paymentMethod: "COD",
  note: "",
};

export function CartPage() {
  const { items, subtotal, updateQuantity, removeItem, clearCart } = useCart();
  const [form, setForm] = useState<CheckoutForm>(initialForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [createdOrder, setCreatedOrder] = useState<CheckoutOrder | null>(null);

  const total = useMemo(() => subtotal + (items.length ? SHIPPING_FEE : 0), [items.length, subtotal]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setCreatedOrder(null);
    setIsSubmitting(true);

    try {
      const order = await publicApi.checkout({
        ...form,
        shippingFee: SHIPPING_FEE,
        items: items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
      });

      clearCart();
      setForm(initialForm);
      setCreatedOrder(order);
    } catch (checkoutError) {
      setError(checkoutError instanceof Error ? checkoutError.message : "Không thể đặt hàng lúc này.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="bg-stone-50">
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <Badge>Giỏ hàng B2C</Badge>
        <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="font-serif text-4xl font-black text-stone-950 md:text-6xl">
              Đặt cà phê bán lẻ
            </h1>
            <p className="mt-4 max-w-2xl text-lg leading-8 text-stone-600">
              Khách lẻ có thể đặt hàng nhanh, chọn COD hoặc thanh toán online. Khách doanh nghiệp nên gửi báo giá để xử lý hợp đồng và công nợ.
            </p>
          </div>
          <Button asChild variant="outline">
            <Link to="/san-pham">Tiếp tục mua hàng</Link>
          </Button>
        </div>

        {createdOrder ? (
          <Card className="mt-8 border-emerald-200 bg-emerald-50">
            <CardContent className="flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between">
              <div className="flex gap-4">
                <PackageCheck className="mt-1 text-emerald-800" size={32} />
                <div>
                  <h2 className="text-2xl font-black text-emerald-950">Đặt hàng thành công</h2>
                  <p className="mt-2 text-emerald-900">
                    Mã đơn: <strong>{createdOrder.orderCode}</strong>. Tổng tiền:{" "}
                    <strong>{formatVnd(createdOrder.totalAmount)}</strong>
                  </p>
                </div>
              </div>
              <Button asChild>
                <Link to="/san-pham">Mua thêm</Link>
              </Button>
            </CardContent>
          </Card>
        ) : null}

        <div className="mt-10 grid gap-8 lg:grid-cols-[1.4fr_0.9fr]">
          <div className="space-y-4">
            {items.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center p-10 text-center">
                  <ShoppingBag className="text-[var(--copper)]" size={48} />
                  <h2 className="mt-4 text-2xl font-black">Giỏ hàng đang trống</h2>
                  <p className="mt-2 max-w-md text-stone-600">
                    Chọn sản phẩm bán lẻ để tạo đơn nhanh. Đơn B2B vẫn nên đi qua form báo giá.
                  </p>
                  <Button asChild className="mt-6">
                    <Link to="/san-pham">Xem sản phẩm</Link>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              items.map((item) => (
                <Card key={item.productId} className="bg-white">
                  <CardContent className="grid gap-5 p-5 md:grid-cols-[1fr_auto] md:items-center">
                    <div>
                      <Badge>MOQ {item.minimumOrderKg}kg</Badge>
                      <h2 className="mt-3 text-2xl font-black text-stone-950">{item.name}</h2>
                      <p className="mt-2 text-stone-600">
                        {formatVnd(item.price)} / {item.unit}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                      <div className="flex items-center rounded-full border border-stone-200 bg-stone-50">
                        <Button
                          aria-label="Giảm số lượng"
                          size="icon"
                          variant="ghost"
                          onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                        >
                          <Minus size={16} />
                        </Button>
                        <span className="w-12 text-center font-black">{item.quantity}</span>
                        <Button
                          aria-label="Tăng số lượng"
                          size="icon"
                          variant="ghost"
                          onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                        >
                          <Plus size={16} />
                        </Button>
                      </div>
                      <strong className="min-w-32 text-right text-lg text-[var(--roast)]">
                        {formatVnd(item.price * item.quantity)}
                      </strong>
                      <Button aria-label="Xóa sản phẩm" size="icon" variant="outline" onClick={() => removeItem(item.productId)}>
                        <Trash2 size={18} />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          <Card className="h-fit bg-white">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <CalendarCheck className="text-[var(--copper)]" />
                <h2 className="text-2xl font-black">Thông tin nhận hàng</h2>
              </div>

              {error ? <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm font-bold text-red-700">{error}</p> : null}

              <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
                <input
                  className="h-12 w-full rounded-xl border border-stone-200 px-4 outline-none focus:border-emerald-800"
                  placeholder="Họ tên"
                  value={form.customerName}
                  onChange={(event) => setForm((current) => ({ ...current, customerName: event.target.value }))}
                  required
                />
                <input
                  className="h-12 w-full rounded-xl border border-stone-200 px-4 outline-none focus:border-emerald-800"
                  placeholder="Số điện thoại"
                  value={form.customerPhone}
                  onChange={(event) => setForm((current) => ({ ...current, customerPhone: event.target.value }))}
                  required
                />
                <input
                  className="h-12 w-full rounded-xl border border-stone-200 px-4 outline-none focus:border-emerald-800"
                  placeholder="Email (không bắt buộc)"
                  type="email"
                  value={form.customerEmail}
                  onChange={(event) => setForm((current) => ({ ...current, customerEmail: event.target.value }))}
                />
                <textarea
                  className="min-h-24 w-full rounded-xl border border-stone-200 p-4 outline-none focus:border-emerald-800"
                  placeholder="Địa chỉ nhận hàng"
                  value={form.address}
                  onChange={(event) => setForm((current) => ({ ...current, address: event.target.value }))}
                  required
                />
                <select
                  className="h-12 w-full rounded-xl border border-stone-200 px-4 outline-none focus:border-emerald-800"
                  value={form.paymentMethod}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, paymentMethod: event.target.value as CheckoutForm["paymentMethod"] }))
                  }
                >
                  {paymentOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <textarea
                  className="min-h-20 w-full rounded-xl border border-stone-200 p-4 outline-none focus:border-emerald-800"
                  placeholder="Ghi chú cho đơn hàng"
                  value={form.note}
                  onChange={(event) => setForm((current) => ({ ...current, note: event.target.value }))}
                />

                <div className="space-y-3 border-t border-stone-200 pt-5 text-sm">
                  <div className="flex justify-between">
                    <span>Tạm tính</span>
                    <strong>{formatVnd(subtotal)}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Phí vận chuyển</span>
                    <strong>{items.length ? formatVnd(SHIPPING_FEE) : formatVnd(0)}</strong>
                  </div>
                  <div className="flex justify-between text-lg text-[var(--roast)]">
                    <span className="font-black">Tổng cộng</span>
                    <strong>{formatVnd(total)}</strong>
                  </div>
                </div>

                <Button className="w-full" disabled={!items.length || isSubmitting} type="submit">
                  {isSubmitting ? "Đang tạo đơn..." : "Đặt hàng"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  );
}
