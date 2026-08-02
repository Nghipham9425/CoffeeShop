import type { Request, Response } from "express";
import { b2bService } from "../../services/B2B/B2B.service.js";
import { createInvoiceSchema, recordDebtPaymentSchema, updateContractStatusSchema } from "../../validators/B2B/B2B.validator.js";

export const b2bController = {
  async list(_req: Request, res: Response) { res.json(await b2bService.list()); },
  async updateContract(req: Request, res: Response) { const input = updateContractStatusSchema.parse(req.body); res.json(await b2bService.updateContract(Number(req.params.id), input.status, input.note)); },
  async createInvoice(req: Request, res: Response) { res.status(201).json(await b2bService.createInvoice(createInvoiceSchema.parse(req.body))); },
  async recordDebtPayment(req: Request, res: Response) {
    try { res.json(await b2bService.recordDebtPayment(Number(req.params.id), recordDebtPaymentSchema.parse(req.body))); }
    catch (error) { if (error instanceof Error && ["DEBT_NOT_FOUND", "DEBT_ALREADY_CLEARED", "PAYMENT_EXCEEDS_DEBT"].includes(error.message)) { res.status(error.message === "DEBT_NOT_FOUND" ? 404 : 400).json({ message: error.message === "DEBT_ALREADY_CLEARED" ? "Công nợ này đã được thanh toán." : error.message === "PAYMENT_EXCEEDS_DEBT" ? "Số tiền thu không được vượt số dư công nợ." : "Không tìm thấy công nợ." }); return; } throw error; }
  },
};
