import { z } from "zod";

export const customerQuerySchema = z.object({
  keyword: z.string().trim().optional(),
});

export const updateRetailCustomerSchema = z.object({
  fullName: z.string().trim().min(2).optional(),
  phone: z.string().trim().optional(),
  isActive: z.boolean().optional(),
});

export const createBusinessCustomerSchema = z.object({
  companyName: z.string().trim().min(2),
  taxCode: z.string().trim().optional(),
  contactName: z.string().trim().min(2),
  phone: z.string().trim().min(8),
  email: z.string().email().optional(),
  address: z.string().trim().optional(),
  note: z.string().trim().optional(),
});

export const updateBusinessCustomerSchema = createBusinessCustomerSchema.partial();

export type CustomerQueryInput = z.infer<typeof customerQuerySchema>;
export type UpdateRetailCustomerInput = z.infer<typeof updateRetailCustomerSchema>;
export type CreateBusinessCustomerInput = z.infer<typeof createBusinessCustomerSchema>;
export type UpdateBusinessCustomerInput = z.infer<typeof updateBusinessCustomerSchema>;
