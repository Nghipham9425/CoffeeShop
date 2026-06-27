import type { UserRole } from "@prisma/client";

export type AuthUser = {
  id: number;
  fullName: string;
  email: string;
  role: UserRole;
  isActive: boolean;
};

export type JwtUserPayload = {
  userId: number;
  role: UserRole;
};
