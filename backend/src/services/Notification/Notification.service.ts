import { NotificationType, UserRole } from "@prisma/client";
import { notificationData } from "../../data/Notification/Notification.data.js";

export const notificationService = {
  async listForUser(userId: number) {
    const [items, unreadCount] = await Promise.all([notificationData.listByUser(userId), notificationData.unreadCount(userId)]);
    return { unreadCount, items };
  },
  async markRead(id: number, userId: number) {
    const result = await notificationData.markRead(id, userId);
    if (!result.count) throw new Error("NOTIFICATION_NOT_FOUND");
  },
  markAllRead(userId: number) { return notificationData.markAllRead(userId); },
  createOrderCreated(userId: number | null | undefined, orderCode: string, orderId: number) {
    if (!userId) return Promise.resolve(null);
    return notificationData.create({ userId, type: NotificationType.ORDER_CREATED, title: "Đặt hàng thành công", content: `Đơn hàng ${orderCode} đã được tạo và đang chờ xác nhận.`, link: "/tai-khoan/don-hang", referenceType: "ORDER", referenceId: orderId });
  },
  createOrderStatusChanged(userId: number | null | undefined, orderCode: string, orderId: number, statusLabel: string) {
    if (!userId) return Promise.resolve(null);
    return notificationData.create({ userId, type: NotificationType.ORDER_STATUS_CHANGED, title: "Đơn hàng được cập nhật", content: `Đơn hàng ${orderCode} đã chuyển sang trạng thái: ${statusLabel}.`, link: "/tai-khoan/don-hang", referenceType: "ORDER", referenceId: orderId });
  },
  createNewOrderForStaff(orderCode: string, orderId: number) {
    return notificationData.createForRoles([UserRole.ADMIN, UserRole.SALES], { type: NotificationType.ORDER_CREATED, title: "Có đơn hàng mới", content: `Đơn hàng ${orderCode} đang chờ xử lý.`, link: `/admin/don-hang/${orderId}`, referenceType: "ORDER", referenceId: orderId });
  },
};
