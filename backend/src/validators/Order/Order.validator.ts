import {
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
  ShipmentStatus,
} from "@prisma/client";
import { z } from "zod";

export const orderQuerySchema = z.object({
  keyword: z.string().trim().optional(),
  status: z.nativeEnum(OrderStatus).optional(),
});

export const updateOrderStatusSchema = z.object({
  status: z.nativeEnum(OrderStatus),
  cancelReason: z.string().trim().optional(),
  refundAmount: z.coerce.number().min(0).optional(),
});

export const updatePaymentStatusSchema = z.object({
  status: z.nativeEnum(PaymentStatus),
  transactionCode: z.string().trim().optional(),
});

export const upsertShipmentSchema = z.object({
  carrier: z.string().trim().optional(),
  trackingCode: z.string().trim().optional(),
  status: z.nativeEnum(ShipmentStatus).optional(),
  note: z.string().trim().optional(),
});

export const checkoutSchema = z.object({
  customerName: z.string().trim().min(2, "Vui lòng nhập họ tên"),
  customerPhone: z.string().trim().min(8, "Vui lòng nhập số điện thoại"),
  customerEmail: z
    .string()
    .trim()
    .email("Email không hợp lệ")
    .optional()
    .or(z.literal("")),
  address: z.string().trim().min(8, "Vui lòng nhập địa chỉ giao hàng"),
  note: z.string().trim().optional(),
  paymentMethod: z.nativeEnum(PaymentMethod).default(PaymentMethod.COD),
  shippingFee: z.coerce.number().min(0).default(25000),
  items: z
    .array(
      z.object({
        productId: z.coerce.number().int().positive(),
        quantity: z.coerce.number().int().positive("Số lượng phải lớn hơn 0"),
      }),
    )
    .min(1, "Giỏ hàng đang trống"),
});

export type OrderQueryInput = z.infer<typeof orderQuerySchema>;
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;
export type UpdatePaymentStatusInput = z.infer<typeof updatePaymentStatusSchema>;
export type UpsertShipmentInput = z.infer<typeof upsertShipmentSchema>;
export type CheckoutInput = z.infer<typeof checkoutSchema>;
