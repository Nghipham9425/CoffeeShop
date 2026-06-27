import { z } from "zod";

export const createQuoteRequestSchema = z.object({
  companyName: z.string().min(2).max(180),
  contactName: z.string().min(2).max(120),
  phoneOrEmail: z.string().min(5).max(160),
  productNeed: z.string().min(2).max(240),
  expectedQuantityKg: z.number().int().positive().optional(),
  note: z.string().max(1000).optional(),
});

export type CreateQuoteRequestInput = z.infer<typeof createQuoteRequestSchema>;
