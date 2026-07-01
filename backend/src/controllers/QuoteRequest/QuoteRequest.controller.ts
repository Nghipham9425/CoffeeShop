import type { Request, Response } from "express";
import { quoteRequestService } from "../../services/QuoteRequest/QuoteRequest.service.js";
import {
  createQuoteRequestSchema,
  updateQuoteRequestStatusSchema,
} from "../../validators/QuoteRequest/QuoteRequest.validator.js";

export const quoteRequestController = {
  async getQuoteRequests(_req: Request, res: Response) {
    const quoteRequests = await quoteRequestService.getQuoteRequests();
    res.json(quoteRequests);
  },

  async getQuoteRequestById(req: Request, res: Response) {
    const quoteRequest = await quoteRequestService.getQuoteRequestById(Number(req.params.id));

    if (!quoteRequest) {
      res.status(404).json({ message: "Không tìm thấy yêu cầu báo giá" });
      return;
    }

    res.json(quoteRequest);
  },

  async createQuoteRequest(req: Request, res: Response) {
    const payload = createQuoteRequestSchema.parse(req.body);
    const quoteRequest = await quoteRequestService.createQuoteRequest(payload);
    res.status(201).json(quoteRequest);
  },

  async updateQuoteRequestStatus(req: Request, res: Response) {
    const quoteRequestId = Number(req.params.id);
    const payload = updateQuoteRequestStatusSchema.parse(req.body);

    try {
      const quoteRequest = await quoteRequestService.updateQuoteRequestStatus(
        quoteRequestId,
        payload,
      );
      res.json(quoteRequest);
    } catch (error) {
      if (error instanceof Error && error.message === "QUOTE_REQUEST_NOT_FOUND") {
        res.status(404).json({ message: "Không tìm thấy yêu cầu báo giá" });
        return;
      }

      throw error;
    }
  },
};
