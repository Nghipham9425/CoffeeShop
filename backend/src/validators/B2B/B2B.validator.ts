import { z } from "zod";

export const contractStatusSchema = z.enum(["DRAFT", "ACTIVE", "COMPLETED", "CANCELLED"]);
export const invoiceStatusSchema = z.enum(["UNPAID", "PARTIAL", "PAID", "OVERDUE", "CANCELLED"]);
export const updateContractStatusSchema = z.object({
  status: contractStatusSchema.optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  depositPercent: z.coerce.number().int().min(0).max(100).optional(),
  paymentTermDays: z.coerce.number().int().min(1).max(180).optional(),
  note: z.string().trim().max(2000).optional(),
}).superRefine((input, context) => {
  if (input.startDate && input.endDate && input.endDate <= input.startDate) context.addIssue({ code: z.ZodIssueCode.custom, path: ["endDate"], message: "Ngày kết thúc phải sau ngày bắt đầu." });
  if (!input.status && input.startDate === undefined && input.endDate === undefined && input.depositPercent === undefined && input.paymentTermDays === undefined && input.note === undefined) context.addIssue({ code: z.ZodIssueCode.custom, message: "Cần cung cấp thông tin cần cập nhật." });
});
export const createInvoiceSchema = z.object({ contractId: z.coerce.number().int().positive().optional(), businessCustomerId: z.coerce.number().int().positive(), amount: z.coerce.number().positive(), dueDate: z.coerce.date().optional(), note: z.string().trim().max(1000).optional() });
export const recordDebtPaymentSchema = z.object({ amount: z.coerce.number().positive(), transactionCode: z.string().trim().max(120).optional(), paidAt: z.coerce.date().optional(), note: z.string().trim().max(1000).optional() });
export type CreateInvoiceInput = z.infer<typeof createInvoiceSchema>;
export type RecordDebtPaymentInput = z.infer<typeof recordDebtPaymentSchema>;
export type UpdateContractInput = z.infer<typeof updateContractStatusSchema>;
