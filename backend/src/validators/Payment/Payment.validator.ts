import { z } from "zod";

export const initializeSepaySchema = z.object({
  orderId: z.coerce.number().int().positive("Mã đơn hàng không hợp lệ."),
  orderCode: z.string().trim().min(6, "Mã đơn hàng không hợp lệ."),
});

export type InitializeSepayInput = z.infer<typeof initializeSepaySchema>;
