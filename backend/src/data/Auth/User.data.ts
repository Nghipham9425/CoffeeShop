import { prisma } from "../prisma.js";
import type { Prisma } from "@prisma/client";

type AddressPayload = {
  receiverName: string;
  phone: string;
  province: string;
  district: string;
  ward: string;
  detail: string;
  isDefault?: boolean;
};

export const userData = {
  findByEmail(email: string) {
    return prisma.user.findUnique({ where: { email } });
  },

  findActiveByEmailInsensitive(email: string) {
    return prisma.user.findFirst({
      where: { email: { equals: email, mode: "insensitive" }, isActive: true },
      select: { id: true, fullName: true, email: true },
    });
  },

  async findOrCreateGoogleUser(input: {
    providerUserId: string;
    email: string;
    fullName: string;
    passwordHash: string;
  }) {
    return prisma.$transaction(async (transaction) => {
      const linkedAccount = await transaction.oAuthAccount.findUnique({
        where: {
          provider_providerUserId: {
            provider: "GOOGLE",
            providerUserId: input.providerUserId,
          },
        },
        select: {
          user: {
            select: { id: true, fullName: true, email: true, phone: true, role: true, isActive: true },
          },
        },
      });

      if (linkedAccount) return linkedAccount.user;

      let user = await transaction.user.findFirst({
        where: { email: { equals: input.email, mode: "insensitive" } },
        select: { id: true, fullName: true, email: true, phone: true, role: true, isActive: true },
      });

      if (!user) {
        user = await transaction.user.create({
          data: {
            fullName: input.fullName,
            email: input.email.toLowerCase(),
            passwordHash: input.passwordHash,
          },
          select: { id: true, fullName: true, email: true, phone: true, role: true, isActive: true },
        });
      }

      await transaction.oAuthAccount.create({
        data: {
          userId: user.id,
          provider: "GOOGLE",
          providerUserId: input.providerUserId,
          providerEmail: input.email.toLowerCase(),
        },
      });

      return user;
    });
  },

  findById(id: number) {
    return prisma.user.findUnique({
      where: { id },
      select: { id: true, fullName: true, email: true, phone: true, role: true, isActive: true },
    });
  },

  findProfileById(id: number) {
    return prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        role: true,
        isActive: true,
        createdAt: true,
        addresses: { orderBy: [{ isDefault: "desc" }, { updatedAt: "desc" }] },
        _count: { select: { orders: true } },
      },
    });
  },

  findPasswordById(id: number) {
    return prisma.user.findUnique({ where: { id }, select: { id: true, passwordHash: true } });
  },

  listOrderHistory(userId: number) {
    return prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        orderCode: true,
        status: true,
        totalAmount: true,
        createdAt: true,
        items: {
          select: {
            id: true,
            productId: true,
            quantity: true,
            product: { select: { name: true, unit: true } },
          },
        },
        reviews: { select: { id: true, productId: true, rating: true, status: true } },
        returnRequests: {
          select: { id: true, type: true, reason: true, status: true, resolutionNote: true, createdAt: true },
          orderBy: { createdAt: "desc" },
          take: 1,
        },
        payments: { select: { method: true, status: true, paidAt: true }, orderBy: { id: "asc" }, take: 1 },
        shipment: { select: { status: true, carrier: true, trackingCode: true } },
      },
    });
  },

  async claimGuestOrders(userId: number) {
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { email: true, phone: true } });
    if (!user) return;

    const conditions: Prisma.OrderWhereInput[] = [{ customerEmail: user.email }];
    if (user.phone) conditions.push({ customerPhone: user.phone });

    await prisma.order.updateMany({
      where: { userId: null, OR: conditions },
      data: { userId },
    });
  },

  updateProfile(id: number, data: { fullName?: string; phone?: string | null }) {
    return prisma.user.update({
      where: { id },
      data,
      select: { id: true, fullName: true, email: true, phone: true, role: true, isActive: true },
    });
  },

  updatePassword(id: number, passwordHash: string) {
    return prisma.user.update({ where: { id }, data: { passwordHash } });
  },

  async createPasswordResetToken(userId: number, tokenHash: string, expiresAt: Date) {
    return prisma.$transaction(async (transaction) => {
      await transaction.passwordResetToken.deleteMany({ where: { userId } });
      return transaction.passwordResetToken.create({
        data: { userId, tokenHash, expiresAt },
      });
    });
  },

  findPasswordResetToken(tokenHash: string) {
    return prisma.passwordResetToken.findUnique({
      where: { tokenHash },
      select: { id: true, userId: true, expiresAt: true, usedAt: true },
    });
  },

  async consumePasswordResetToken(tokenId: number, userId: number, passwordHash: string) {
    return prisma.$transaction(async (transaction) => {
      const consumed = await transaction.passwordResetToken.updateMany({
        where: { id: tokenId, usedAt: null, expiresAt: { gt: new Date() } },
        data: { usedAt: new Date() },
      });

      if (consumed.count !== 1) return false;

      await transaction.user.update({
        where: { id: userId },
        data: { passwordHash },
      });
      await transaction.passwordResetToken.deleteMany({
        where: { userId, id: { not: tokenId } },
      });
      return true;
    });
  },

  listAddresses(userId: number) {
    return prisma.address.findMany({ where: { userId }, orderBy: [{ isDefault: "desc" }, { updatedAt: "desc" }] });
  },

  async createAddress(userId: number, data: AddressPayload) {
    if (data.isDefault) await prisma.address.updateMany({ where: { userId }, data: { isDefault: false } });
    const count = await prisma.address.count({ where: { userId } });
    return prisma.address.create({ data: { ...data, userId, isDefault: data.isDefault ?? count === 0 } });
  },

  async updateAddress(userId: number, addressId: number, data: Partial<AddressPayload>) {
    const address = await prisma.address.findFirst({ where: { id: addressId, userId } });
    if (!address) return null;
    if (data.isDefault) await prisma.address.updateMany({ where: { userId }, data: { isDefault: false } });
    return prisma.address.update({ where: { id: addressId }, data });
  },

  async deleteAddress(userId: number, addressId: number) {
    const address = await prisma.address.findFirst({ where: { id: addressId, userId } });
    if (!address) return false;
    await prisma.address.delete({ where: { id: addressId } });
    return true;
  },

  create(data: { fullName: string; email: string; phone?: string; passwordHash: string }) {
    return prisma.user.create({
      data,
      select: { id: true, fullName: true, email: true, phone: true, role: true, isActive: true },
    });
  },
};
