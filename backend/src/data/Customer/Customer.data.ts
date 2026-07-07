import { UserRole, type Prisma } from "@prisma/client";
import { prisma } from "../prisma.js";
import type {
  CreateBusinessCustomerInput,
  CustomerQueryInput,
  UpdateBusinessCustomerInput,
  UpdateRetailCustomerInput,
} from "../../validators/Customer/Customer.validator.js";

function retailWhere(query: CustomerQueryInput): Prisma.UserWhereInput {
  return {
    role: UserRole.CUSTOMER,
    OR: query.keyword
      ? [
          { fullName: { contains: query.keyword, mode: "insensitive" } },
          { email: { contains: query.keyword, mode: "insensitive" } },
          { phone: { contains: query.keyword, mode: "insensitive" } },
        ]
      : undefined,
  };
}

function businessWhere(query: CustomerQueryInput): Prisma.BusinessCustomerWhereInput {
  return {
    OR: query.keyword
      ? [
          { companyName: { contains: query.keyword, mode: "insensitive" } },
          { contactName: { contains: query.keyword, mode: "insensitive" } },
          { phone: { contains: query.keyword, mode: "insensitive" } },
          { email: { contains: query.keyword, mode: "insensitive" } },
          { taxCode: { contains: query.keyword, mode: "insensitive" } },
        ]
      : undefined,
  };
}

export const customerData = {
  findRetailMany(query: CustomerQueryInput) {
    return prisma.user.findMany({
      where: retailWhere(query),
      include: {
        loyaltyProfile: true,
        _count: { select: { orders: true, reviews: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  },

  updateRetail(id: number, input: UpdateRetailCustomerInput) {
    return prisma.user.update({
      where: { id },
      data: input,
      include: {
        loyaltyProfile: true,
        _count: { select: { orders: true, reviews: true } },
      },
    });
  },

  findBusinessMany(query: CustomerQueryInput) {
    return prisma.businessCustomer.findMany({
      where: businessWhere(query),
      include: {
        _count: { select: { quoteRequests: true, contracts: true, invoices: true, debts: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  },

  createBusiness(input: CreateBusinessCustomerInput) {
    return prisma.businessCustomer.create({
      data: input,
      include: {
        _count: { select: { quoteRequests: true, contracts: true, invoices: true, debts: true } },
      },
    });
  },

  updateBusiness(id: number, input: UpdateBusinessCustomerInput) {
    return prisma.businessCustomer.update({
      where: { id },
      data: input,
      include: {
        _count: { select: { quoteRequests: true, contracts: true, invoices: true, debts: true } },
      },
    });
  },
};
