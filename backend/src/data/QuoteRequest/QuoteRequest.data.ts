import { prisma } from "../prisma.js";
import type { CreateQuoteRequestInput } from "../../validators/QuoteRequest/QuoteRequest.validator.js";

export const quoteRequestData = {
  findMany() {
    return prisma.quoteRequest.findMany({
      orderBy: { createdAt: "desc" },
    });
  },

  create(data: CreateQuoteRequestInput) {
    return prisma.quoteRequest.create({ data });
  },
};
