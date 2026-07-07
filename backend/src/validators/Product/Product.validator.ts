import { z } from "zod";

export const productPriceTypeSchema = z.enum(["RETAIL", "WHOLESALE", "VIP", "B2B"]);

export const productQuerySchema = z.object({
  keyword: z.string().optional(),
  categorySlug: z.string().optional(),
  isRetail: z.coerce.boolean().optional(),
  isB2b: z.coerce.boolean().optional(),
});

const optionalTextSchema = (max: number) =>
  z.preprocess(
    (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
    z.string().trim().max(max).optional(),
  );

export const createProductSchema = z.object({
  categoryId: z.coerce.number().int("Danh mục không hợp lệ").positive("Vui lòng chọn danh mục sản phẩm"),
  name: z.string().trim().min(2, "Tên sản phẩm phải có ít nhất 2 ký tự").max(180, "Tên sản phẩm quá dài"),
  slug: optionalTextSchema(220),
  description: optionalTextSchema(2000),
  unit: z.string().trim().min(1, "Đơn vị không được bỏ trống").max(30, "Đơn vị quá dài").default("kg"),
  price: z.coerce.number().nonnegative("Giá bán không được âm").optional(),
  minimumOrderKg: z.coerce.number().int("MOQ phải là số nguyên").positive("MOQ phải lớn hơn 0").default(5),
  imageUrl: optionalTextSchema(500),
  isRetail: z.coerce.boolean().default(true),
  isB2b: z.coerce.boolean().default(true),
});

export const updateProductSchema = createProductSchema.partial();

export const createProductPriceSchema = z.object({
  priceType: productPriceTypeSchema,
  minQuantity: z.coerce.number().int("Số lượng tối thiểu phải là số nguyên").positive("Số lượng tối thiểu phải lớn hơn 0").default(1),
  price: z.coerce.number().nonnegative("Giá không được âm"),
  startAt: z.coerce.date().optional(),
  endAt: z.coerce.date().optional(),
  isActive: z.coerce.boolean().default(true),
});

export type ProductQueryInput = z.infer<typeof productQuerySchema>;
export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type CreateProductPriceInput = z.infer<typeof createProductPriceSchema>;
