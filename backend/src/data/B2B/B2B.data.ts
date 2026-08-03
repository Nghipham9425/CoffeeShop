import { prisma } from "../prisma.js";
import type { CreateInvoiceInput, RecordDebtPaymentInput, UpdateContractInput } from "../../validators/B2B/B2B.validator.js";

const contractInclude = { businessCustomer: { select: { id: true, companyName: true, contactName: true } }, quoteRequest: { select: { id: true, productNeed: true } } };
const invoiceInclude = { businessCustomer: { select: { id: true, companyName: true } }, contract: { select: { id: true, contractCode: true } }, debts: { include: { payments: { orderBy: { paidAt: "desc" as const } } } } };
const quoteIncludeForCustomer = {
  items: { include: { product: { select: { id: true, name: true, unit: true } } }, orderBy: { id: "asc" as const } },
  contract: { select: { id: true, contractCode: true, status: true } },
  order: { select: { id: true, orderCode: true, status: true } },
};

export const b2bData = {
  listContracts: () => prisma.contract.findMany({ include: contractInclude, orderBy: { createdAt: "desc" } }),
  findContract: (id: number) => prisma.contract.findUnique({ where: { id }, include: { invoices: { select: { status: true, debts: { select: { remainingAmount: true } } } } } }),
  updateContract: (id: number, data: UpdateContractInput) => prisma.contract.update({ where: { id }, data, include: contractInclude }),
  listInvoices: () => prisma.invoice.findMany({ include: invoiceInclude, orderBy: { createdAt: "desc" } }),
  listDebts: () => prisma.debt.findMany({ include: { businessCustomer: { select: { id: true, companyName: true } }, invoice: { select: { id: true, invoiceCode: true, amount: true, paidAmount: true } }, payments: { orderBy: { paidAt: "desc" } } }, orderBy: { createdAt: "desc" } }),
  async getForUser(userId: number) {
    const businessCustomer = await prisma.businessCustomer.findUnique({
      where: { userId },
      include: {
        quoteRequests: { include: quoteIncludeForCustomer, orderBy: { createdAt: "desc" } },
        contracts: { include: contractInclude, orderBy: { createdAt: "desc" } },
        invoices: { include: invoiceInclude, orderBy: { createdAt: "desc" } },
        debts: { include: { invoice: { select: { id: true, invoiceCode: true, amount: true, paidAmount: true } }, payments: { orderBy: { paidAt: "desc" } } }, orderBy: { createdAt: "desc" } },
      },
    });
    return businessCustomer;
  },
  async createInvoice(input: CreateInvoiceInput) {
    return prisma.$transaction(async (tx) => {
      if (input.contractId) {
        const contract = await tx.contract.findUnique({ where: { id: input.contractId }, select: { businessCustomerId: true, status: true, totalValue: true, paymentTermDays: true, endDate: true } });
        if (!contract || contract.businessCustomerId !== input.businessCustomerId) throw new Error("CONTRACT_NOT_FOUND");
        if (contract.status !== "ACTIVE") throw new Error("CONTRACT_NOT_ACTIVE");
        if (!input.dueDate || input.dueDate < new Date(new Date().setHours(0, 0, 0, 0))) throw new Error("INVOICE_DUE_DATE_INVALID");
        const maxDueDate = new Date(); maxDueDate.setDate(maxDueDate.getDate() + contract.paymentTermDays);
        if (input.dueDate > maxDueDate || (contract.endDate && input.dueDate > contract.endDate)) throw new Error("PAYMENT_TERM_EXCEEDED");
        const invoiced = await tx.invoice.aggregate({ where: { contractId: input.contractId, status: { not: "CANCELLED" } }, _sum: { amount: true } });
        if (!contract.totalValue || Number(invoiced._sum.amount ?? 0) + input.amount > Number(contract.totalValue)) throw new Error("INVOICE_EXCEEDS_CONTRACT_VALUE");
      }
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
