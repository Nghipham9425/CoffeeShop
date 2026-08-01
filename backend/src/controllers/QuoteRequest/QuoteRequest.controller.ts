import type { Request, Response } from "express";
import { quoteRequestService } from "../../services/QuoteRequest/QuoteRequest.service.js";
import {
  createQuoteRequestSchema,
  updateQuoteRequestStatusSchema,
  createQuotationSchema,
  respondQuotationSchema,
  convertQuotationSchema,
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
    const result = await quoteRequestService.createQuoteRequest(payload);
    res.status(201).json({ ...result.quote, accessToken: result.accessToken });
  },

  async getPublicQuote(req: Request, res: Response) {
    const token = String(req.query.token ?? "");
    const quote = await quoteRequestService.getPublicQuote(Number(req.params.id), token);
    if (!quote) { res.status(404).json({ message: "Không tìm thấy báo giá hoặc đường dẫn không hợp lệ." }); return; }
    res.json(quote);
  },

  async createQuotation(req: Request, res: Response) {
    try { res.json(await quoteRequestService.createQuotation(Number(req.params.id), createQuotationSchema.parse(req.body))); }
    catch (error) { handleQuoteError(error, res); }
  },

  async respondQuotation(req: Request, res: Response) {
    try { res.json(await quoteRequestService.respondQuotation(Number(req.params.id), respondQuotationSchema.parse(req.body))); }
    catch (error) { handleQuoteError(error, res); }
  },

  async convertQuotation(req: Request, res: Response) {
    try { res.status(201).json(await quoteRequestService.convertQuotation(Number(req.params.id), convertQuotationSchema.parse(req.body))); }
    catch (error) { handleQuoteError(error, res); }
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

      if (error instanceof Error && error.message === "INVALID_QUOTE_STATUS_TRANSITION") {
        res.status(409).json({
          message: "Không thể chuyển yêu cầu sang trạng thái này. Vui lòng xử lý theo đúng thứ tự.",
        });
        return;
      }

      throw error;
    }
  },
};

function handleQuoteError(error: unknown, res: Response) {
  if (!(error instanceof Error)) throw error;
  const messages: Record<string, string> = {
    QUOTE_REQUEST_NOT_FOUND: "Không tìm thấy yêu cầu báo giá.",
    QUOTE_NOT_EDITABLE: "Chỉ có thể lập báo giá sau khi đã liên hệ khách.",
    QUOTE_VALID_UNTIL_REQUIRED: "Hạn báo giá phải lớn hơn thời điểm hiện tại.",
    QUOTE_NOT_AWAITING_RESPONSE: "Báo giá không còn chờ phản hồi.",
    QUOTE_EXPIRED: "Báo giá đã hết hiệu lực.",
    QUOTE_MUST_BE_ACCEPTED: "Khách hàng phải chấp nhận báo giá trước khi chuyển đổi.",
    QUOTE_ITEMS_REQUIRE_PRODUCTS: "Mọi dòng hàng phải liên kết sản phẩm trước khi tạo đơn B2B.",
  };
  const message = error.message.startsWith("INSUFFICIENT_STOCK:") ? `Không đủ tồn kho cho ${error.message.split(":")[1]}.` : messages[error.message];
  if (message) { res.status(error.message === "QUOTE_REQUEST_NOT_FOUND" ? 404 : 400).json({ message }); return; }
  throw error;
}
