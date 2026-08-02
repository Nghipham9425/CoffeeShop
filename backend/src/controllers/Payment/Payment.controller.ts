import type { Request, Response } from "express";
import { paymentService } from "../../services/Payment/Payment.service.js";
import { initializeSepaySchema } from "../../validators/Payment/Payment.validator.js";

export const paymentController = {
  async initializeSepay(req: Request, res: Response) {
    const payload = initializeSepaySchema.parse(req.body);
    try {
      res.json(await paymentService.initializeSepay(payload, req.user?.userId));
    } catch (error) {
      if (error instanceof Error && error.message === "SEPAY_NOT_CONFIGURED") {
        res.status(503).json({ message: "Cổng SePay chưa được cấu hình." });
        return;
      }
      if (error instanceof Error && error.message === "SEPAY_ORDER_NOT_AVAILABLE") {
        res.status(400).json({ message: "Đơn hàng không sẵn sàng để thanh toán qua SePay." });
        return;
      }
      throw error;
    }
  },

  async receiveSepayWebhook(req: Request, res: Response) {
    const processed = await paymentService.processSepayWebhook(req.body as Record<string, unknown>);
    res.json({ success: true, processed });
  },
};
