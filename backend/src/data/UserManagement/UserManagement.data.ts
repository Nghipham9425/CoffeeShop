import type { Prisma, UserRole } from "@prisma/client";
import { prisma } from "../prisma.js";

function whereFor(query: { keyword?: string; role?: UserRole }): Prisma.UserWhereInput {
  return {
    role: query.role,
    OR: query.keyword
      ? [
          { fullName: { contains: query.keyword, mode: "insensitive" } },
          { email: { contains: query.keyword, mode: "insensitive" } },
          { phone: { contains: query.keyword, mode: "insensitive" } },
        ]
      : undefined,
  };
}

const userSelect = {
  id: true,
  fullName: true,
  email: true,
  phone: true,
  role: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
  _count: { select: { orders: true, addresses: true } },
} satisfies Prisma.UserSelect;

export const userManagementData = {
  list(query: { keyword?: string; role?: UserRole }) {
    return prisma.user.findMany({ where: whereFor(query), select: userSelect, orderBy: [{ role: "asc" }, { createdAt: "desc" }] });
  },
  find(id: number) {
    return prisma.user.findUnique({ where: { id }, select: userSelect });
  },
  countActiveAdmins() {
    return prisma.user.count({ where: { role: "ADMIN", isActive: true } });
  },
  updateRole(id: number, role: UserRole) {
    return prisma.user.update({ where: { id }, data: { role }, select: userSelect });
  },
  updateActive(id: number, isActive: boolean) {
    return prisma.user.update({ where: { id }, data: { isActive }, select: userSelect });
  },
};
