import { env } from "../../config/env.js";
import { paymentData } from "../../data/Payment/Payment.data.js";

async function expirePendingSepayOrders() {
  const expiryMinutes = Math.max(5, env.sepayPaymentExpiryMinutes);
  const cutoff = new Date(Date.now() - expiryMinutes * 60 * 1000);
  const orders = await paymentData.findExpiredSepayOrderIds(cutoff);

  for (const order of orders) {
    const expired = await paymentData.expireSepayOrder(order.id);
    if (expired) console.log(`Đã hủy đơn SePay quá hạn: #${order.id}`);
  }
}

export function startSepayPaymentExpiryJob() {
  const intervalMs = 5 * 60 * 1000;
  void expirePendingSepayOrders().catch((error) => console.error("Không thể quét đơn SePay quá hạn:", error));
  const timer = setInterval(() => void expirePendingSepayOrders().catch((error) => console.error("Không thể quét đơn SePay quá hạn:", error)), intervalMs);
  timer.unref();
}
