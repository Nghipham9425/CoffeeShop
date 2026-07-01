import { z } from "zod";

export const productPriceTypeSchema = z.enum(["RETAIL", "WHOLESALE", "VIP", "B2B"]);

export const productQuerySchema = z.object({
  keyword: z.string().optional(),
  categorySlug: z.string().optional(),
  isRetail: z.coerce.boolean().optional(),
  isB2b: z.coerce.boolean().optional(),
});

export const createProductSchema = z.object({
  categoryId: z.coerce.number().int().positive(),
  name: z.string().min(2).max(180),
  slug: z.string().min(2).max(220).optional(),
  description: z.string().max(2000).optional(),
  unit: z.string().min(1).max(30).default("kg"),
  price: z.coerce.number().nonnegative().optional(),
  minimumOrderKg: z.coerce.number().int().positive().default(5),
  imageUrl: z.string().url().optional(),
  isRetail: z.coerce.boolean().default(true),
  isB2b: z.coerce.boolean().default(true),
});

export const updateProductSchema = createProductSchema.partial();

export const createProductPriceSchema = z.object({
  priceType: productPriceTypeSchema,
  minQuantity: z.coerce.number().int().positive().default(1),
  price: z.coerce.number().nonnegative(),
  startAt: z.coerce.date().optional(),
  endAt: z.coerce.date().optional(),
  isActive: z.coerce.boolean().default(true),
});

export type ProductQueryInput = z.infer<typeof productQuerySchema>;
export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type CreateProductPriceInput = z.infer<typeof createProductPriceSchema>;
