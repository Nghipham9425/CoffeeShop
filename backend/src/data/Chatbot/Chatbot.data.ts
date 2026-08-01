import { prisma } from '../prisma.js';
import { ChatbotSender } from '@prisma/client';

export const chatbotData = {
  async getConversationById(conversationId: number) {
    return prisma.chatbotConversation.findUnique({
      where: { id: conversationId },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });
  },

  async getConversations(userId?: number) {
    return prisma.chatbotConversation.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
    });
  },

  async createConversation(data: { userId?: number; guestName?: string; guestPhone?: string; topic?: string }) {
    return prisma.chatbotConversation.create({
      data: {
        userId: data.userId,
        guestName: data.guestName,
        guestPhone: data.guestPhone,
        topic: data.topic,
        isResolved: false,
      },
    });
  },

  async updateTopic(id: number, topic: string) {
    return prisma.chatbotConversation.update({
      where: { id },
      data: { topic },
    });
  },

  async saveMessage(data: { conversationId: number; sender: ChatbotSender; content: string; intent?: string }) {
    return prisma.chatbotMessage.create({
      data: {
        conversationId: data.conversationId,
        sender: data.sender,
        content: data.content,
        intent: data.intent,
      },
    });
  },

  async markAsResolved(conversationId: number) {
    return prisma.chatbotConversation.update({
      where: { id: conversationId },
      data: { isResolved: true },
    });
  },

  async deleteConversation(id: number) {
    await prisma.chatbotMessage.deleteMany({
      where: { conversationId: id },
    });
    return prisma.chatbotConversation.delete({
      where: { id },
    });
  },

  // THÊM MỚI: Dọn dẹp rác tự động (Xóa các phiên chat có 0 tin nhắn)
  async cleanupEmptyConversations(userId?: number) {
    return prisma.chatbotConversation.deleteMany({
      where: {
        userId,
        messages: { none: {} } // Điều kiện: Không có bất kỳ message nào liên kết
      }
    });
  }
};