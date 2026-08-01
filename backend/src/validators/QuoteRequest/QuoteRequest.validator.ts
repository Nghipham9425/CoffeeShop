import { z } from "zod";

export const quoteRequestStatusSchema = z.enum([
  "NEW",
  "CONTACTED",
  "QUOTED",
  "ACCEPTED",
  "REJECTED",
  "CONVERTED",
  "CLOSED",
  "CANCELLED",
]);

export const createQuoteRequestSchema = z.object({
  companyName: z.string().trim().min(2, "Tên công ty hoặc khách hàng phải có ít nhất 2 ký tự.").max(180, "Tên công ty hoặc khách hàng không được vượt quá 180 ký tự."),
  contactName: z.string().trim().min(2, "Tên người liên hệ phải có ít nhất 2 ký tự.").max(120, "Tên người liên hệ không được vượt quá 120 ký tự."),
  phoneOrEmail: z.string().trim().min(5, "Vui lòng nhập số điện thoại hoặc email.").max(160, "Thông tin liên hệ không được vượt quá 160 ký tự."),
  productNeed: z.string().trim().min(2, "Vui lòng nhập sản phẩm cần báo giá.").max(240, "Nhu cầu sản phẩm không được vượt quá 240 ký tự."),
  expectedQuantityKg: z.coerce.number().int("Số lượng dự kiến phải là số nguyên.").positive("Số lượng dự kiến phải lớn hơn 0.").optional(),
  note: z.string().trim().max(1000, "Ghi chú không được vượt quá 1000 ký tự.").optional(),
});

export const updateQuoteRequestStatusSchema = z.object({
  status: quoteRequestStatusSchema,
});

export const quoteItemSchema = z.object({
  productId: z.coerce.number().int().positive().optional(),
  description: z.string().trim().min(2).max(240),
  quantity: z.coerce.number().int().positive(),
  unit: z.string().trim().min(1).max(30).default("kg"),
  unitPrice: z.coerce.number().nonnegative(),
});

export const createQuotationSchema = z.object({
  items: z.array(quoteItemSchema).min(1, "Báo giá phải có ít nhất một dòng sản phẩm."),
  discountAmount: z.coerce.number().nonnegative().default(0),
  validUntil: z.coerce.date(),
  salesNote: z.string().trim().max(2000).optional(),
});

export const respondQuotationSchema = z.object({
  token: z.string().min(20),
  action: z.enum(["ACCEPT", "REJECT"]),
});

export const convertQuotationSchema = z.object({ target: z.enum(["CONTRACT", "ORDER"]) });

export type CreateQuoteRequestInput = z.infer<typeof createQuoteRequestSchema>;
export type UpdateQuoteRequestStatusInput = z.infer<typeof updateQuoteRequestStatusSchema>;
export type CreateQuotationInput = z.infer<typeof createQuotationSchema>;
export type RespondQuotationInput = z.infer<typeof respondQuotationSchema>;
export type ConvertQuotationInput = z.infer<typeof convertQuotationSchema>;
