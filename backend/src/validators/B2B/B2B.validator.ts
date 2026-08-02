import { z } from "zod";

export const contractStatusSchema = z.enum(["DRAFT", "ACTIVE", "COMPLETED", "CANCELLED"]);
export const invoiceStatusSchema = z.enum(["UNPAID", "PARTIAL", "PAID", "OVERDUE", "CANCELLED"]);
export const updateContractStatusSchema = z.object({ status: contractStatusSchema, note: z.string().trim().max(2000).optional() });
export const createInvoiceSchema = z.object({ contractId: z.coerce.number().int().positive().optional(), businessCustomerId: z.coerce.number().int().positive(), amount: z.coerce.number().positive(), dueDate: z.coerce.date().optional(), note: z.string().trim().max(1000).optional() });
export const recordDebtPaymentSchema = z.object({ amount: z.coerce.number().positive(), transactionCode: z.string().trim().max(120).optional(), paidAt: z.coerce.date().optional(), note: z.string().trim().max(1000).optional() });
export type CreateInvoiceInput = z.infer<typeof createInvoiceSchema>;
export type RecordDebtPaymentInput = z.infer<typeof recordDebtPaymentSchema>;
