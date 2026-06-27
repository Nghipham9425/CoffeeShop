import type { Request, Response } from "express";
import { quoteRequestService } from "../../services/QuoteRequest/QuoteRequest.service.js";
import { createQuoteRequestSchema } from "../../validators/QuoteRequest/QuoteRequest.validator.js";

export const quoteRequestController = {
  async getQuoteRequests(_req: Request, res: Response) {
    const quoteRequests = await quoteRequestService.getQuoteRequests();
    res.json(quoteRequests);
  },

  async createQuoteRequest(req: Request, res: Response) {
    const payload = createQuoteRequestSchema.parse(req.body);
    const quoteRequest = await quoteRequestService.createQuoteRequest(payload);
    res.status(201).json(quoteRequest);
  },
};
