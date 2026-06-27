import { quoteRequestData } from "../../data/QuoteRequest/QuoteRequest.data.js";
import type { QuoteRequestModel } from "../../models/QuoteRequest/QuoteRequest.model.js";
import type { CreateQuoteRequestInput } from "../../validators/QuoteRequest/QuoteRequest.validator.js";

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

  async createQuoteRequest(input: CreateQuoteRequestInput) {
    const quoteRequest = await quoteRequestData.create(input);
    return mapQuoteRequest(quoteRequest);
  },
};
