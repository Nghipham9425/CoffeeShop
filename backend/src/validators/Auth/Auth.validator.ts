import { z } from "zod";

export const registerSchema = z.object({
  fullName: z.string().min(2).max(120),
  email: z.string().email().max(160),
  phone: z.string().min(8).max(20).optional(),
  password: z.string().min(6).max(80),
});

export const loginSchema = z.object({
  email: z.string().email().max(160),
  password: z.string().min(6).max(80),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
