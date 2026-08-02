import { NotificationType, Prisma, UserRole } from "@prisma/client";
import { prisma } from "../prisma.js";

export const notificationData = {
  listByUser(userId: number) {
    return prisma.notification.findMany({ where: { userId }, orderBy: { createdAt: "desc" }, take: 30 });
  },
  unreadCount(userId: number) {
    return prisma.notification.count({ where: { userId, isRead: false } });
  },
  markRead(id: number, userId: number) {
    return prisma.notification.updateMany({ where: { id, userId }, data: { isRead: true } });
  },
  markAllRead(userId: number) {
    return prisma.notification.updateMany({ where: { userId, isRead: false }, data: { isRead: true } });
  },
  create(data: Prisma.NotificationUncheckedCreateInput) {
    return prisma.notification.create({ data });
  },
  async createForRoles(roles: UserRole[], data: Omit<Prisma.NotificationUncheckedCreateInput, "userId" | "type"> & { type: NotificationType }) {
    const recipients = await prisma.user.findMany({ where: { role: { in: roles }, isActive: true }, select: { id: true } });
    if (!recipients.length) return { count: 0 };
    return prisma.notification.createMany({ data: recipients.map((user) => ({ ...data, userId: user.id })) });
  },
};
