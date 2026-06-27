import { z } from "zod";

export const productQuerySchema = z.object({
  keyword: z.string().optional(),
  categorySlug: z.string().optional(),
  isRetail: z.coerce.boolean().optional(),
  isB2b: z.coerce.boolean().optional(),
});

export type ProductQueryInput = z.infer<typeof productQuerySchema>;
