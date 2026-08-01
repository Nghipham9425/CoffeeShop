import { CalendarCheck, CheckCircle2, CreditCard, Landmark, MapPin, Minus, PackageCheck, Plus, ShoppingBag, Tag, Truck, Trash2, X } from "lucide-react";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import { Card, CardContent } from "../../../components/ui/card";
import { useCart } from "../../../contexts/CartContext";
import { adminAuth } from "../../../lib/adminApi";
import { profileApi, type ProfileAddress } from "../../../lib/profileApi";
import { formatVnd, publicApi, type CheckoutOrder, type SepayCheckoutSession, type VoucherPreview } from "../../../lib/publicApi";

const SHIPPING_FEE = 25000;

const paymentOptions = [
  { value: "COD", label: "Thanh toán khi nhận hàng", description: "Thanh toán tiền mặt cho đơn vị giao hàng.", icon: Truck },
  { value: "BANK_TRANSFER", label: "Chuyển khoản ngân hàng", description: "Nhận thông tin chuyển khoản sau khi đặt đơn.", icon: Landmark },
  { value: "SEPAY", label: "Thanh toán qua SePay", description: "Thanh toán online qua cổng SePay an toàn.", icon: CreditCard },
] as const;

type CheckoutForm = {
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  address: string;
  paymentMethod: (typeof paymentOptions)[number]["value"];
  note: string;
};

type AddressMode = "DEFAULT" | "MANUAL";

const initialForm: CheckoutForm = {
  customerName: "",
  customerPhone: "",
  customerEmail: "",
  address: "",
  paymentMethod: "COD",
  note: "",
};

export function CartPage() {
  const { items, subtotal, updateQuantity, removeItem, clearCart, syncStock } = useCart();
  const [form, setForm] = useState<CheckoutForm>(initialForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [createdOrder, setCreatedOrder] = useState<CheckoutOrder | null>(null);
  const [defaultAddress, setDefaultAddress] = useState<ProfileAddress | null>(null);
  const [addressMode, setAddressMode] = useState<AddressMode>("MANUAL");
  const [loadingAddress, setLoadingAddress] = useState(Boolean(adminAuth.getToken()));
  const [voucherCode, setVoucherCode] = useState("");
  const [voucher, setVoucher] = useState<VoucherPreview | null>(null);
  const [voucherError, setVoucherError] = useState("");
  const [checkingVoucher, setCheckingVoucher] = useState(false);

  const total = useMemo(() => Math.max(0, subtotal - (voucher?.discountAmount ?? 0)) + (items.length ? SHIPPING_FEE : 0), [items.length, subtotal, voucher]);
  const hasUnavailableItem = items.some((item) => item.stockQuantity <= 0 || item.quantity > item.stockQuantity);

  useEffect(() => {
    void publicApi.products().then(syncStock).catch(() => {
      // Backend vẫn kiểm tra lại tồn kho khi tạo đơn.
    });
  }, []);

  useEffect(() => {
    setVoucher(null);
    setVoucherError("");
  }, [subtotal]);

  useEffect(() => {
    if (!adminAuth.getToken()) return;

    void (async () => {
      try {
        const profile = await profileApi.me();
        setForm((current) => ({
          ...current,
          customerName: current.customerName || profile.fullName,
          customerPhone: current.customerPhone || profile.phone || "",
          customerEmail: current.customerEmail || profile.email,
        }));
        const savedDefault = profile.addresses.find((address) => address.isDefault) ?? profile.addresses[0] ?? null;
        setDefaultAddress(savedDefault);
        if (savedDefault) {
          setAddressMode("DEFAULT");
          setForm((current) => ({ ...current, ...addressToForm(savedDefault) }));
        }
      } catch {
        // Khách chưa đăng nhập vẫn có thể đặt hàng với thông tin nhập tay.
      } finally {
        setLoadingAddress(false);
      }
    })();
  }, []);

  function useDefaultAddress() {
    if (!defaultAddress) return;
    setAddressMode("DEFAULT");
    setForm((current) => ({ ...current, ...addressToForm(defaultAddress) }));
  }

  function useManualAddress() {
    setAddressMode("MANUAL");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setCreatedOrder(null);
    setIsSubmitting(true);

    try {
      const order = await publicApi.checkout({
        ...form,
        shippingFee: SHIPPING_FEE,
        voucherCode: voucher?.code,
        items: items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
      }, adminAuth.getToken());

      clearCart();
      setForm(initialForm);
      setCreatedOrder(order);
      if (form.paymentMethod === "SEPAY") {
        submitSepayForm(await publicApi.initializeSepay(order.id));
      }
    } catch (checkoutError) {
      setError(checkoutError instanceof Error ? checkoutError.message : "Không thể đặt hàng lúc này.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function applyVoucher() {
    setCheckingVoucher(true);
    setVoucherError("");
    try {
      setVoucher(await publicApi.validateVoucher(voucherCode, subtotal));
    } catch (cause) {
      setVoucher(null);
      setVoucherError(cause instanceof Error ? cause.message : "Không thể kiểm tra mã giảm giá.");
    } finally {
      setCheckingVoucher(false);
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
                      {item.stockQuantity <= 0 ? <p className="mt-2 text-sm font-bold text-red-700">Sản phẩm hiện đã hết hàng. Vui lòng xóa khỏi giỏ.</p> : null}
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
                          disabled={item.quantity >= item.stockQuantity}
                        >
                          <Plus size={16} />
                        </Button>
                      </div>
                      <span className="text-xs font-bold text-stone-500">Tối đa {item.stockQuantity} {item.unit}</span>
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
                {defaultAddress ? <div className="rounded-xl border border-stone-200 bg-stone-50 p-3">
                  <p className="text-sm font-black text-stone-950">Địa chỉ nhận hàng</p>
                  <div className="mt-3 grid gap-2 sm:grid-cols-2">
                    <button type="button" onClick={useDefaultAddress} className={`rounded-lg border p-3 text-left text-sm transition ${addressMode === "DEFAULT" ? "border-[var(--coffee)] bg-white text-[var(--coffee)]" : "border-stone-200 bg-white text-stone-600 hover:border-stone-400"}`}>
                      <span className="flex items-center gap-2 font-black"><CheckCircle2 size={16} /> Dùng địa chỉ mặc định</span>
                      <span className="mt-1 block text-xs leading-5">{formatAddress(defaultAddress)}</span>
                    </button>
                    <button type="button" onClick={useManualAddress} className={`rounded-lg border p-3 text-left text-sm transition ${addressMode === "MANUAL" ? "border-[var(--coffee)] bg-white text-[var(--coffee)]" : "border-stone-200 bg-white text-stone-600 hover:border-stone-400"}`}>
                      <span className="flex items-center gap-2 font-black"><MapPin size={16} /> Nhập địa chỉ khác</span>
                      <span className="mt-1 block text-xs leading-5">Sử dụng khi cần giao đến địa chỉ khác.</span>
                    </button>
                  </div>
                </div> : loadingAddress ? <p className="text-sm text-stone-500">Đang tải địa chỉ mặc định...</p> : <button type="button" onClick={useManualAddress} className="w-full rounded-xl border border-dashed border-stone-300 p-3 text-left text-sm font-semibold text-stone-600 hover:border-stone-400"><MapPin className="mr-2 inline" size={16} /> Nhập địa chỉ nhận hàng</button>}
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
                {addressMode === "MANUAL" ? <textarea
                  className="min-h-24 w-full rounded-xl border border-stone-200 p-4 outline-none focus:border-emerald-800"
                  placeholder="Địa chỉ nhận hàng: số nhà, đường, phường/xã, quận/huyện, tỉnh/thành phố"
                  value={form.address}
                  onChange={(event) => setForm((current) => ({ ...current, address: event.target.value }))}
                  required
                /> : <div className="rounded-xl border border-stone-200 bg-stone-50 p-4 text-sm text-stone-700"><strong>{defaultAddress?.receiverName}</strong> · {defaultAddress?.phone}<br /><span className="mt-1 block">{defaultAddress ? formatAddress(defaultAddress) : ""}</span></div>}
                <div className="space-y-2"><p className="text-sm font-black text-stone-950">Phương thức thanh toán</p>{paymentOptions.map((option) => { const Icon = option.icon; const selected = form.paymentMethod === option.value; return <button key={option.value} type="button" onClick={() => setForm((current) => ({ ...current, paymentMethod: option.value }))} className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left transition ${selected ? "border-[var(--coffee)] bg-stone-50" : "border-stone-200 hover:border-stone-400"}`}><span className={`grid h-9 w-9 place-items-center rounded-lg ${selected ? "bg-[var(--coffee)] text-white" : "bg-stone-100 text-stone-600"}`}><Icon size={18} /></span><span><span className="block text-sm font-black text-stone-950">{option.label}</span><span className="block text-xs text-stone-500">{option.description}</span></span></button>; })}</div>
                <textarea
                  className="min-h-20 w-full rounded-xl border border-stone-200 p-4 outline-none focus:border-emerald-800"
                  placeholder="Ghi chú cho đơn hàng"
                  value={form.note}
                  onChange={(event) => setForm((current) => ({ ...current, note: event.target.value }))}
                />

                <div className="rounded-xl border border-stone-200 bg-stone-50 p-4">
                  <label className="flex items-center gap-2 text-sm font-black text-stone-950"><Tag size={17} /> Mã giảm giá</label>
                  {voucher ? <div className="mt-3 flex items-center justify-between gap-3 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm"><div><strong className="text-emerald-900">{voucher.code}</strong><p className="mt-1 text-xs text-emerald-700">{voucher.name} · giảm {formatVnd(voucher.discountAmount)}</p></div><Button type="button" size="icon" variant="ghost" aria-label="Bỏ mã giảm giá" onClick={() => { setVoucher(null); setVoucherCode(""); }}><X size={17} /></Button></div> : <div className="mt-3 flex gap-2"><input className="h-11 min-w-0 flex-1 rounded-lg border border-stone-200 bg-white px-3 font-bold uppercase outline-none focus:border-[var(--coffee)]" placeholder="VD: WELCOME10" value={voucherCode} onChange={(event) => setVoucherCode(event.target.value.toUpperCase())} /><Button type="button" variant="outline" onClick={applyVoucher} disabled={!voucherCode.trim() || !items.length || checkingVoucher}>{checkingVoucher ? "Đang kiểm tra" : "Áp dụng"}</Button></div>}
                  {voucherError ? <p className="mt-2 text-xs font-bold text-red-700">{voucherError}</p> : null}
                </div>

                <div className="space-y-3 border-t border-stone-200 pt-5 text-sm">
                  <div className="flex justify-between">
                    <span>Tạm tính</span>
                    <strong>{formatVnd(subtotal)}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Phí vận chuyển</span>
                    <strong>{items.length ? formatVnd(SHIPPING_FEE) : formatVnd(0)}</strong>
                  </div>
                  {voucher ? <div className="flex justify-between text-emerald-700"><span>Giảm giá ({voucher.code})</span><strong>-{formatVnd(voucher.discountAmount)}</strong></div> : null}
                  <div className="flex justify-between text-lg text-[var(--roast)]">
                    <span className="font-black">Tổng cộng</span>
                    <strong>{formatVnd(total)}</strong>
                  </div>
                </div>

                <Button className="w-full" disabled={!items.length || isSubmitting || hasUnavailableItem} type="submit">
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

function addressToForm(address: ProfileAddress) {
  return {
    customerName: address.receiverName,
    customerPhone: address.phone,
    address: formatAddress(address),
  };
}

function formatAddress(address: ProfileAddress) {
  return [address.detail, address.ward, address.district, address.province].filter(Boolean).join(", ");
}

function submitSepayForm(session: SepayCheckoutSession) {
  const form = document.createElement("form");
  form.method = "POST";
  form.action = session.checkoutUrl;
  Object.entries(session.fields).forEach(([name, value]) => {
    const input = document.createElement("input");
    input.type = "hidden";
    input.name = name;
    input.value = String(value);
    form.appendChild(input);
  });
  document.body.appendChild(form);
  form.submit();
}
