import { CheckCircle2, CircleX, Clock3, RotateCw } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Button } from "../../../components/ui/button";
import { Card, CardContent } from "../../../components/ui/card";
import { publicApi, type SepayCheckoutSession } from "../../../lib/publicApi";

export function PaymentResultPage() {
  const [params] = useSearchParams();
  const [retrying, setRetrying] = useState(false);
  const [retryError, setRetryError] = useState("");
  const [paymentConfirmed, setPaymentConfirmed] = useState(false);
  const [checkingPayment, setCheckingPayment] = useState(false);
  const status = params.get("status");
  const orderCode = params.get("orderCode");
  const orderId = Number(params.get("orderId"));
  const cancelled = status === "cancel";
  const failed = status === "error";
  const canRetry = (cancelled || failed) && Number.isInteger(orderId) && orderId > 0;

  useEffect(() => {
    if (cancelled || failed || !Number.isInteger(orderId) || orderId <= 0 || !orderCode) return;

    let active = true;
    let attempts = 0;
    const checkPayment = async () => {
      try {
        if (active) setCheckingPayment(true);
        const payment = await publicApi.paymentStatus(orderId, orderCode);
        if (active && payment.paymentStatus === "PAID") setPaymentConfirmed(true);
      } catch {
        // The webhook remains the authoritative source of payment status.
      } finally {
        if (active) setCheckingPayment(false);
      }
    };

    void checkPayment();
    const intervalId = window.setInterval(() => {
      attempts += 1;
      if (attempts >= 20 || paymentConfirmed) {
        window.clearInterval(intervalId);
        return;
      }
      void checkPayment();
    }, 3000);

    return () => {
      active = false;
      window.clearInterval(intervalId);
    };
  }, [cancelled, failed, orderCode, orderId, paymentConfirmed]);

  const icon = cancelled || failed
    ? <CircleX className="text-rose-700" size={42} />
    : <CheckCircle2 className="text-emerald-700" size={42} />;
  const title = cancelled
    ? "Bạn đã hủy thanh toán"
    : failed
      ? "Thanh toán chưa thành công"
      : paymentConfirmed
        ? "Thanh toán thành công"
        : "Đã gửi yêu cầu thanh toán";
  const description = cancelled || failed
    ? "Đơn hàng vẫn được lưu ở trạng thái chờ thanh toán và chưa bị đánh dấu đã thanh toán."
    : paymentConfirmed
      ? "Giao dịch đã được SePay xác nhận. Đơn hàng đã chuyển sang trạng thái đã xác nhận để chuẩn bị hàng."
      : "Hệ thống đang đối soát giao dịch SePay. Trạng thái đơn hàng chỉ được cập nhật sau khi backend nhận webhook từ SePay.";

  async function retryPayment() {
    if (!canRetry) return;
    setRetryError("");
    setRetrying(true);
    try {
      if (!orderCode) throw new Error("Thiếu mã đơn hàng để khởi tạo lại thanh toán.");
      submitSepayForm(await publicApi.initializeSepay(orderId, orderCode));
    } catch (cause) {
      setRetryError(cause instanceof Error ? cause.message : "Không thể khởi tạo lại thanh toán SePay.");
      setRetrying(false);
    }
  }

  return (
    <main className="min-h-[65vh] bg-stone-50 px-4 py-16">
      <Card className="mx-auto max-w-xl">
        <CardContent className="p-8 text-center">
          {icon}
          <h1 className="mt-5 text-3xl font-black text-stone-950">{title}</h1>
          {orderCode ? <p className="mt-3 text-sm font-bold text-stone-700">Mã đơn hàng: {orderCode}</p> : null}
          <p className="mx-auto mt-4 max-w-md leading-7 text-stone-600">{description}</p>
          {!cancelled && !failed && !paymentConfirmed ? (
            <p className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-amber-700">
              <Clock3 size={16} />
              {checkingPayment ? "Đang kiểm tra thanh toán..." : "Bạn có thể đóng trang; webhook vẫn sẽ cập nhật khi thanh toán thành công."}
            </p>
          ) : null}
          {retryError ? <p className="mt-4 rounded-xl bg-rose-50 p-3 text-sm font-semibold text-rose-700">{retryError}</p> : null}
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            {canRetry ? (
              <Button type="button" onClick={() => void retryPayment()} disabled={retrying}>
                <RotateCw size={17} />
                {retrying ? "Đang khởi tạo..." : "Thanh toán lại qua SePay"}
              </Button>
            ) : null}
            <Button asChild variant={canRetry ? "outline" : "default"}><Link to="/san-pham">Tiếp tục mua hàng</Link></Button>
            <Button asChild variant="outline"><Link to="/bao-gia">Liên hệ hỗ trợ</Link></Button>
          </div>
        </CardContent>
      </Card>
    </main>
  );
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
