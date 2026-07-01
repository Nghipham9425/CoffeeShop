import { prisma } from "../prisma.js";
import type {
  CreateQuoteRequestInput,
  UpdateQuoteRequestStatusInput,
} from "../../validators/QuoteRequest/QuoteRequest.validator.js";

export const quoteRequestData = {
  findMany() {
    return prisma.quoteRequest.findMany({
      orderBy: { createdAt: "desc" },
    });
  },

  findById(id: number) {
    return prisma.quoteRequest.findUnique({
      where: { id },
    });
  },

  create(data: CreateQuoteRequestInput) {
    return prisma.quoteRequest.create({ data });
  },

  updateStatus(id: number, data: UpdateQuoteRequestStatusInput) {
    return prisma.quoteRequest.update({
      where: { id },
      data,
    });
  },
};
