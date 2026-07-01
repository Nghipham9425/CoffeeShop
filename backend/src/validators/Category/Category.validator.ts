import { z } from "zod";

export const categoryQuerySchema = z.object({
  keyword: z.string().optional(),
  includeInactive: z.coerce.boolean().default(false),
});

export const createCategorySchema = z.object({
  name: z.string().min(2).max(120),
  slug: z.string().min(2).max(160).optional(),
  description: z.string().max(1000).optional(),
  isActive: z.coerce.boolean().default(true),
});

export const updateCategorySchema = createCategorySchema.partial();

export type CategoryQueryInput = z.infer<typeof categoryQuerySchema>;
export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
