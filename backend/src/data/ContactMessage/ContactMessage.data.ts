import type { Prisma } from "@prisma/client";
import { prisma } from "../prisma.js";
import type {
  ContactMessageQueryInput,
  CreateContactMessageInput,
} from "../../validators/ContactMessage/ContactMessage.validator.js";

function buildWhere(query: ContactMessageQueryInput): Prisma.ContactMessageWhereInput {
  return {
    isRead: query.isRead,
    OR: query.keyword
      ? [
          { fullName: { contains: query.keyword, mode: "insensitive" } },
          { email: { contains: query.keyword, mode: "insensitive" } },
          { phone: { contains: query.keyword, mode: "insensitive" } },
          { subject: { contains: query.keyword, mode: "insensitive" } },
          { message: { contains: query.keyword, mode: "insensitive" } },
        ]
      : undefined,
  };
}

export const contactMessageData = {
  findMany(query: ContactMessageQueryInput) {
    return prisma.contactMessage.findMany({
      where: buildWhere(query),
      orderBy: { createdAt: "desc" },
    });
  },

  findById(id: number) {
    return prisma.contactMessage.findUnique({
      where: { id },
    });
  },

  create(data: CreateContactMessageInput) {
    return prisma.contactMessage.create({
      data,
    });
  },

  updateReadStatus(id: number, isRead: boolean) {
    return prisma.contactMessage.update({
      where: { id },
      data: { isRead },
    });
  },

  delete(id: number) {
    return prisma.contactMessage.delete({
      where: { id },
    });
  },
};
