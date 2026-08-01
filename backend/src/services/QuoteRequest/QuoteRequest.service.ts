import { createHash, randomBytes } from "node:crypto";
import { quoteRequestData } from "../../data/QuoteRequest/QuoteRequest.data.js";
import type { QuoteRequestModel } from "../../models/QuoteRequest/QuoteRequest.model.js";
import type { CreateQuoteRequestInput, CreateQuotationInput, ConvertQuotationInput, RespondQuotationInput, UpdateQuoteRequestStatusInput } from "../../validators/QuoteRequest/QuoteRequest.validator.js";

const allowedStatusTransitions: Record<string, string[]> = {
  NEW: ["CONTACTED", "CANCELLED"], CONTACTED: ["QUOTED", "CANCELLED"], QUOTED: ["CLOSED", "CANCELLED"],
  ACCEPTED: [], REJECTED: [], CONVERTED: [], CLOSED: [], CANCELLED: [],
};

function hashToken(token: string) { return createHash("sha256").update(token).digest("hex"); }

function mapQuoteRequest(quote: Awaited<ReturnType<typeof quoteRequestData.findMany>>[number]): QuoteRequestModel {
  return {
    id: quote.id, companyName: quote.companyName, contactName: quote.contactName, phoneOrEmail: quote.phoneOrEmail,
    productNeed: quote.productNeed, expectedQuantityKg: quote.expectedQuantityKg, note: quote.note, status: quote.status,
    subtotal: Number(quote.subtotal), discountAmount: Number(quote.discountAmount), totalAmount: Number(quote.totalAmount),
    validUntil: quote.validUntil, salesNote: quote.salesNote, customerRespondedAt: quote.customerRespondedAt, convertedAt: quote.convertedAt,
    items: quote.items.map((item) => ({ id: item.id, productId: item.productId, description: item.description, quantity: item.quantity, unit: item.unit, unitPrice: Number(item.unitPrice), lineTotal: Number(item.lineTotal), product: item.product })),
    contract: quote.contract, order: quote.order, createdAt: quote.createdAt,
  };
}

export const quoteRequestService = {
  async getQuoteRequests() { return (await quoteRequestData.findMany()).map(mapQuoteRequest); },
  async getQuoteRequestById(id: number) { const quote = await quoteRequestData.findById(id); return quote ? mapQuoteRequest(quote) : null; },
  async createQuoteRequest(input: CreateQuoteRequestInput) {
    const accessToken = randomBytes(24).toString("hex");
    const quote = await quoteRequestData.create(input, hashToken(accessToken));
    return { quote: mapQuoteRequest(quote), accessToken };
  },
  async getPublicQuote(id: number, token: string) { const quote = await quoteRequestData.findPublic(id, hashToken(token)); return quote ? mapQuoteRequest(quote) : null; },
  async updateQuoteRequestStatus(id: number, input: UpdateQuoteRequestStatusInput) {
    const current = await quoteRequestData.findById(id);
    if (!current) throw new Error("QUOTE_REQUEST_NOT_FOUND");
    if (!allowedStatusTransitions[current.status]?.includes(input.status)) throw new Error("INVALID_QUOTE_STATUS_TRANSITION");
    return mapQuoteRequest(await quoteRequestData.updateStatus(id, input));
  },
  async createQuotation(id: number, input: CreateQuotationInput) {
    const current = await quoteRequestData.findById(id);
    if (!current) throw new Error("QUOTE_REQUEST_NOT_FOUND");
    if (!["CONTACTED", "QUOTED"].includes(current.status)) throw new Error("QUOTE_NOT_EDITABLE");
    if (input.validUntil <= new Date()) throw new Error("QUOTE_VALID_UNTIL_REQUIRED");
    return mapQuoteRequest(await quoteRequestData.setQuotation(id, input));
  },
  async respondQuotation(id: number, input: RespondQuotationInput) {
    const current = await quoteRequestData.findPublic(id, hashToken(input.token));
    if (!current) throw new Error("QUOTE_REQUEST_NOT_FOUND");
    if (current.status !== "QUOTED") throw new Error("QUOTE_NOT_AWAITING_RESPONSE");
    if (current.validUntil && current.validUntil < new Date()) throw new Error("QUOTE_EXPIRED");
    return mapQuoteRequest(await quoteRequestData.respond(id, input.action === "ACCEPT" ? "ACCEPTED" : "REJECTED"));
  },
  async convertQuotation(id: number, input: ConvertQuotationInput) {
    const current = await quoteRequestData.findById(id);
    if (!current) throw new Error("QUOTE_REQUEST_NOT_FOUND");
    if (current.status !== "ACCEPTED") throw new Error("QUOTE_MUST_BE_ACCEPTED");
    return quoteRequestData.convert(id, input.target);
  },
};
