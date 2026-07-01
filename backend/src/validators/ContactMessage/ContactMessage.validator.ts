import { z } from "zod";

export const contactMessageQuerySchema = z.object({
  keyword: z.string().optional(),
  isRead: z.coerce.boolean().optional(),
});

export const createContactMessageSchema = z.object({
  fullName: z.string().min(2).max(120),
  email: z.string().email().optional(),
  phone: z.string().min(8).max(20).optional(),
  subject: z.string().max(180).optional(),
  message: z.string().min(5).max(2000),
});

export const updateContactMessageReadStatusSchema = z.object({
  isRead: z.coerce.boolean(),
});

export type ContactMessageQueryInput = z.infer<typeof contactMessageQuerySchema>;
export type CreateContactMessageInput = z.infer<typeof createContactMessageSchema>;
export type UpdateContactMessageReadStatusInput = z.infer<
  typeof updateContactMessageReadStatusSchema
>;
