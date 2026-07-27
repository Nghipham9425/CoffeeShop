import { prisma } from "../prisma.js";

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
