import { b2bData } from "../../data/B2B/B2B.data.js";
import type { CreateInvoiceInput, RecordDebtPaymentInput, UpdateContractInput } from "../../validators/B2B/B2B.validator.js";

export const b2bService = {
  list: async () => ({ contracts: await b2bData.listContracts(), invoices: await b2bData.listInvoices(), debts: await b2bData.listDebts() }),
  getForUser: (userId: number) => b2bData.getForUser(userId),
  async updateContract(id: number, input: UpdateContractInput) {
    const current = await b2bData.findContract(id);
    if (!current) throw new Error("CONTRACT_NOT_FOUND");

    const transitions: Record<string, string[]> = {
      DRAFT: ["ACTIVE", "CANCELLED"],
      ACTIVE: ["COMPLETED", "CANCELLED"],
      COMPLETED: [],
      CANCELLED: [],
    };
    if (input.status && !transitions[current.status].includes(input.status)) throw new Error("INVALID_CONTRACT_STATUS_TRANSITION");
    const startDate = input.startDate ?? current.startDate;
    const endDate = input.endDate ?? current.endDate;
    if (startDate && endDate && endDate <= startDate) throw new Error("INVALID_CONTRACT_DATE_RANGE");
    if (input.status === "ACTIVE" && (!startDate || !endDate)) throw new Error("CONTRACT_TERMS_REQUIRED");
    const hasUnpaidAmounts = current.invoices.some((invoice) => invoice.status !== "PAID" && invoice.status !== "CANCELLED" || invoice.debts.some((debt) => Number(debt.remainingAmount) > 0));
    if (["COMPLETED", "CANCELLED"].includes(input.status ?? "") && hasUnpaidAmounts) throw new Error("CONTRACT_HAS_UNPAID_INVOICES");
    return b2bData.updateContract(id, input);
  },
  createInvoice: (input: CreateInvoiceInput) => b2bData.createInvoice(input),
  recordDebtPayment: (debtId: number, input: RecordDebtPaymentInput) => b2bData.recordPayment(debtId, input),
};
