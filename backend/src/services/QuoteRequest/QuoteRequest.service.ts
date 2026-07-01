import { quoteRequestData } from "../../data/QuoteRequest/QuoteRequest.data.js";
import type { QuoteRequestModel } from "../../models/QuoteRequest/QuoteRequest.model.js";
import type {
  CreateQuoteRequestInput,
  UpdateQuoteRequestStatusInput,
} from "../../validators/QuoteRequest/QuoteRequest.validator.js";

function mapQuoteRequest(
  quoteRequest: Awaited<ReturnType<typeof quoteRequestData.findMany>>[number],
): QuoteRequestModel {
  return {
    id: quoteRequest.id,
    companyName: quoteRequest.companyName,
    contactName: quoteRequest.contactName,
    phoneOrEmail: quoteRequest.phoneOrEmail,
    productNeed: quoteRequest.productNeed,
    expectedQuantityKg: quoteRequest.expectedQuantityKg,
    note: quoteRequest.note,
    status: quoteRequest.status,
    createdAt: quoteRequest.createdAt,
  };
}

export const quoteRequestService = {
  async getQuoteRequests() {
    const quoteRequests = await quoteRequestData.findMany();
    return quoteRequests.map(mapQuoteRequest);
  },

  async getQuoteRequestById(id: number) {
    const quoteRequest = await quoteRequestData.findById(id);
    return quoteRequest ? mapQuoteRequest(quoteRequest) : null;
  },

  async createQuoteRequest(input: CreateQuoteRequestInput) {
    const quoteRequest = await quoteRequestData.create(input);
    return mapQuoteRequest(quoteRequest);
  },

  async updateQuoteRequestStatus(id: number, input: UpdateQuoteRequestStatusInput) {
    const existingQuoteRequest = await quoteRequestData.findById(id);

    if (!existingQuoteRequest) {
      throw new Error("QUOTE_REQUEST_NOT_FOUND");
    }

    const quoteRequest = await quoteRequestData.updateStatus(id, input);
    return mapQuoteRequest(quoteRequest);
  },
};
