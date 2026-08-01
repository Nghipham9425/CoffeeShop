import {
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
  ShipmentStatus,
  ReturnRequestStatus,
  ReturnRequestType,
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
  voucherCode: z.string().trim().max(50).optional(),
  items: z
    .array(
      z.object({
        productId: z.coerce.number().int().positive(),
        quantity: z.coerce.number().int().positive("Số lượng phải lớn hơn 0"),
      }),
    )
    .min(1, "Giỏ hàng đang trống"),
});

export const cancelCustomerOrderSchema = z.object({
  reason: z.string().trim().min(5, "Vui lòng nêu lý do hủy đơn").max(500),
});

export const createReturnRequestSchema = z.object({
  type: z.nativeEnum(ReturnRequestType),
  reason: z.string().trim().min(10, "Vui lòng mô tả lý do ít nhất 10 ký tự").max(1000),
});

export const updateReturnRequestSchema = z.object({
  status: z.nativeEnum(ReturnRequestStatus),
  resolutionNote: z.string().trim().max(1000).optional(),
});

export type OrderQueryInput = z.infer<typeof orderQuerySchema>;
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;
export type UpdatePaymentStatusInput = z.infer<typeof updatePaymentStatusSchema>;
export type UpsertShipmentInput = z.infer<typeof upsertShipmentSchema>;
export type CheckoutInput = z.infer<typeof checkoutSchema>;
export type CancelCustomerOrderInput = z.infer<typeof cancelCustomerOrderSchema>;
export type CreateReturnRequestInput = z.infer<typeof createReturnRequestSchema>;
export type UpdateReturnRequestInput = z.infer<typeof updateReturnRequestSchema>;
