import { b2bData } from "../../data/B2B/B2B.data.js";
import type { CreateInvoiceInput, RecordDebtPaymentInput } from "../../validators/B2B/B2B.validator.js";

export const b2bService = {
  list: async () => ({ contracts: await b2bData.listContracts(), invoices: await b2bData.listInvoices(), debts: await b2bData.listDebts() }),
  updateContract: (id: number, status: "DRAFT" | "ACTIVE" | "COMPLETED" | "CANCELLED", note?: string) => b2bData.updateContract(id, { status, note }),
  createInvoice: (input: CreateInvoiceInput) => b2bData.createInvoice(input),
  recordDebtPayment: (debtId: number, input: RecordDebtPaymentInput) => b2bData.recordPayment(debtId, input),
};
