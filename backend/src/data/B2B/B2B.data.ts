import { prisma } from "../prisma.js";
import type { CreateInvoiceInput, RecordDebtPaymentInput } from "../../validators/B2B/B2B.validator.js";

const contractInclude = { businessCustomer: { select: { id: true, companyName: true, contactName: true } }, quoteRequest: { select: { id: true, productNeed: true } } };
const invoiceInclude = { businessCustomer: { select: { id: true, companyName: true } }, contract: { select: { id: true, contractCode: true } }, debts: { include: { payments: { orderBy: { paidAt: "desc" as const } } } } };

export const b2bData = {
  listContracts: () => prisma.contract.findMany({ include: contractInclude, orderBy: { createdAt: "desc" } }),
  updateContract: (id: number, data: { status: "DRAFT" | "ACTIVE" | "COMPLETED" | "CANCELLED"; note?: string }) => prisma.contract.update({ where: { id }, data, include: contractInclude }),
  listInvoices: () => prisma.invoice.findMany({ include: invoiceInclude, orderBy: { createdAt: "desc" } }),
  listDebts: () => prisma.debt.findMany({ include: { businessCustomer: { select: { id: true, companyName: true } }, invoice: { select: { id: true, invoiceCode: true, amount: true, paidAmount: true } }, payments: { orderBy: { paidAt: "desc" } } }, orderBy: { createdAt: "desc" } }),
  async createInvoice(input: CreateInvoiceInput) {
    return prisma.$transaction(async (tx) => {
      const invoiceCode = `HD${Date.now().toString().slice(-10)}`;
      const debtCode = `CN${Date.now().toString().slice(-10)}`;
      const invoice = await tx.invoice.create({ data: { ...input, invoiceCode }, include: invoiceInclude });
      await tx.debt.create({ data: { businessCustomerId: input.businessCustomerId, invoiceId: invoice.id, debtCode, originalAmount: input.amount, remainingAmount: input.amount, dueDate: input.dueDate, note: input.note } });
      return tx.invoice.findUniqueOrThrow({ where: { id: invoice.id }, include: invoiceInclude });
    });
  },
  async recordPayment(debtId: number, input: RecordDebtPaymentInput) {
    return prisma.$transaction(async (tx) => {
      const debt = await tx.debt.findUnique({ where: { id: debtId }, include: { invoice: true } });
      if (!debt) throw new Error("DEBT_NOT_FOUND");
      if (Number(debt.remainingAmount) <= 0) throw new Error("DEBT_ALREADY_CLEARED");
      if (input.amount > Number(debt.remainingAmount)) throw new Error("PAYMENT_EXCEEDS_DEBT");
      const remaining = Number(debt.remainingAmount) - input.amount;
      const status = remaining === 0 ? "CLEARED" : "PARTIAL";
      await tx.debtPayment.create({ data: { debtId, ...input } });
      const updatedDebt = await tx.debt.update({ where: { id: debtId }, data: { remainingAmount: remaining, status }, include: { businessCustomer: { select: { id: true, companyName: true } }, invoice: true, payments: { orderBy: { paidAt: "desc" } } } });
      if (debt.invoice) {
        const paidAmount = Number(debt.invoice.paidAmount) + input.amount;
        await tx.invoice.update({ where: { id: debt.invoice.id }, data: { paidAmount, status: paidAmount >= Number(debt.invoice.amount) ? "PAID" : "PARTIAL" } });
      }
      return updatedDebt;
    });
  },
};
