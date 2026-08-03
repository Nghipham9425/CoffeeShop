import type { Request, Response } from "express";
import { b2bService } from "../../services/B2B/B2B.service.js";
import { createInvoiceSchema, recordDebtPaymentSchema, updateContractStatusSchema } from "../../validators/B2B/B2B.validator.js";

function messageForContractError(code: string) {
  const messages: Record<string, string> = {
    CONTRACT_NOT_FOUND: "Không tìm thấy hợp đồng.",
    INVALID_CONTRACT_STATUS_TRANSITION: "Không thể chuyển trạng thái hợp đồng theo luồng hiện tại.",
    INVALID_CONTRACT_DATE_RANGE: "Ngày kết thúc phải sau ngày bắt đầu hợp đồng.",
    CONTRACT_TERMS_REQUIRED: "Cần thiết lập ngày bắt đầu và kết thúc trước khi kích hoạt hợp đồng.",
    CONTRACT_HAS_UNPAID_INVOICES: "Không thể kết thúc hoặc hủy hợp đồng khi còn hóa đơn hoặc công nợ chưa tất toán.",
  };
  return messages[code];
}

export const b2bController = {
  async list(_req: Request, res: Response) {
    res.json(await b2bService.list());
  },

  async getMine(req: Request, res: Response) {
    res.json(await b2bService.getForUser(req.user!.userId));
  },

  async updateContract(req: Request, res: Response) {
    try {
      const input = updateContractStatusSchema.parse(req.body);
      res.json(await b2bService.updateContract(Number(req.params.id), input));
    } catch (error) {
      if (error instanceof Error) {
        const message = messageForContractError(error.message);
        if (message) {
          res.status(error.message === "CONTRACT_NOT_FOUND" ? 404 : 400).json({ message });
          return;
        }
      }
      throw error;
    }
  },

  async createInvoice(req: Request, res: Response) {
    try {
      res.status(201).json(await b2bService.createInvoice(createInvoiceSchema.parse(req.body)));
    } catch (error) {
      const messages: Record<string, string> = {
        CONTRACT_NOT_FOUND: "Không tìm thấy hợp đồng phù hợp.",
        CONTRACT_NOT_ACTIVE: "Chỉ có thể lập hóa đơn từ hợp đồng đang hiệu lực.",
        INVOICE_DUE_DATE_INVALID: "Hạn thanh toán phải từ hôm nay trở đi.",
        PAYMENT_TERM_EXCEEDED: "Hạn thanh toán vượt quá điều khoản công nợ hoặc thời hạn hợp đồng.",
        INVOICE_EXCEEDS_CONTRACT_VALUE: "Tổng hóa đơn không được vượt giá trị hợp đồng.",
      };
      if (error instanceof Error && messages[error.message]) {
        res.status(400).json({ message: messages[error.message] });
        return;
      }
      throw error;
    }
  },

  async recordDebtPayment(req: Request, res: Response) {
    try {
      res.json(await b2bService.recordDebtPayment(Number(req.params.id), recordDebtPaymentSchema.parse(req.body)));
    } catch (error) {
      const messages: Record<string, string> = {
        DEBT_NOT_FOUND: "Không tìm thấy công nợ.",
        DEBT_ALREADY_CLEARED: "Công nợ này đã được thanh toán.",
        PAYMENT_EXCEEDS_DEBT: "Số tiền thu không được vượt số dư công nợ.",
      };
      if (error instanceof Error && messages[error.message]) {
        res.status(error.message === "DEBT_NOT_FOUND" ? 404 : 400).json({ message: messages[error.message] });
        return;
      }
      throw error;
    }
  },
};
