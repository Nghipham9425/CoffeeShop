import { UserRole } from "@prisma/client";
import { z } from "zod";

export const userManagementQuerySchema = z.object({
  keyword: z.string().trim().max(100).optional(),
  role: z.nativeEnum(UserRole).optional(),
});

export const updateUserRoleSchema = z.object({
  role: z.nativeEnum(UserRole),
});

export const updateUserActiveSchema = z.object({
  isActive: z.boolean(),
});
