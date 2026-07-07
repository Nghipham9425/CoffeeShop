import { OrderStatus, PaymentStatus, ShipmentStatus } from "@prisma/client";
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

export type OrderQueryInput = z.infer<typeof orderQuerySchema>;
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;
export type UpdatePaymentStatusInput = z.infer<typeof updatePaymentStatusSchema>;
export type UpsertShipmentInput = z.infer<typeof upsertShipmentSchema>;
