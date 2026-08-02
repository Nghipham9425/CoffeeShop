import { PaymentMethod, PaymentStatus } from "@prisma/client";
import { SePayPgClient } from "sepay-pg-node";
import { env } from "../../config/env.js";
import { paymentData } from "../../data/Payment/Payment.data.js";
import type { InitializeSepayInput } from "../../validators/Payment/Payment.validator.js";

type WebhookPayload = Record<string, unknown>;

function readValue(source: unknown, ...keys: string[]) {
  if (!source || typeof source !== "object") return undefined;
  const record = source as Record<string, unknown>;
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "string" || typeof value === "number") return String(value);
  }
  return undefined;
}

function readNested(source: WebhookPayload, parentKey: string, ...keys: string[]) {
  return readValue(source[parentKey], ...keys);
}

function extractOrderId(value?: string) {
  const match = value?.match(/(?:PTCW|DH)(\d+)/i);
  return match ? Number(match[1]) : 0;
}

function extractOrderCode(value?: string) {
  return value?.match(/\bPT\d{6,}\b/i)?.[0]?.toUpperCase();
}

export const paymentService = {
  async initializeSepay(input: InitializeSepayInput, userId?: number) {
    if (!env.sepayMerchantId || !env.sepaySecretKey) {
      throw new Error("SEPAY_NOT_CONFIGURED");
    }

    const order = await paymentData.findSepayOrder(input.orderId);
    const payment = order?.payments[0];
    if (
      !order
      || order.orderCode !== input.orderCode
      || (userId !== undefined && order.userId !== null && order.userId !== userId)
      || !payment
      || payment.status !== PaymentStatus.PENDING
      || payment.method !== PaymentMethod.SEPAY
    ) {
      throw new Error("SEPAY_ORDER_NOT_AVAILABLE");
    }

    const client = new SePayPgClient({
      env: env.sepayEnvironment,
      merchant_id: env.sepayMerchantId,
      secret_key: env.sepaySecretKey,
    });
    const amount = Number(payment.amount);
    const returnUrl = `${env.clientAppUrl}/thanh-toan/ket-qua?orderId=${order.id}&orderCode=${encodeURIComponent(order.orderCode)}&payment=sepay`;
    const fields = client.checkout.initOneTimePaymentFields({
      operation: "PURCHASE",
      payment_method: "BANK_TRANSFER",
      // Reuse the visible order code so bank transfer content, SePay, and the
      // admin screen all refer to the same identifier.
      order_invoice_number: order.orderCode,
      order_amount: amount,
      currency: "VND",
      order_description: `Thanh toan don hang ${order.orderCode}`,
      success_url: returnUrl,
      error_url: `${returnUrl}&status=error`,
      cancel_url: `${returnUrl}&status=cancel`,
    });

    return { checkoutUrl: client.checkout.initCheckoutUrl(), fields };
  },

  async processSepayWebhook(payload: WebhookPayload) {
    const invoice = readNested(payload, "order", "order_invoice_number") ?? readValue(payload, "order_invoice_number", "invoice_number");
    const content = readValue(payload, "content", "description", "transfer_content", "transaction_content");
    const orderId = extractOrderId(invoice) || extractOrderId(content);
    const orderCode = extractOrderCode(invoice) || extractOrderCode(content);
    const order = orderId
      ? await paymentData.findSepayOrder(orderId)
      : orderCode
        ? await paymentData.findSepayOrderByCode(orderCode)
        : null;
    if (!order) return false;

    const amountValue = readNested(payload, "transaction", "transaction_amount")
      ?? readNested(payload, "order", "order_amount")
      ?? readValue(payload, "amount", "transfer_amount", "amount_in", "transferAmount");
    const amount = Number(amountValue);
    if (!Number.isFinite(amount) || amount <= 0) return false;

    const transactionCode = readNested(payload, "transaction", "transaction_id", "id")
      ?? readValue(payload, "transaction_id", "reference_id", "id", "tid");
    return paymentData.confirmSepayPayment(order.id, amount, transactionCode);
  },
};
