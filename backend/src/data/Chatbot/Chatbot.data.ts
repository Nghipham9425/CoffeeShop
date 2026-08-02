import { createHash } from "node:crypto";
import { prisma } from "../prisma.js";
import { ChatbotSender } from "@prisma/client";

export function hashGuestToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export const chatbotData = {
  getConversationById(conversationId: number) {
    return prisma.chatbotConversation.findUnique({
      where: { id: conversationId },
      include: { messages: { orderBy: { createdAt: "asc" } } },
    });
  },

  getConversationsForUser(userId: number) {
    return prisma.chatbotConversation.findMany({ where: { userId }, orderBy: { updatedAt: "desc" } });
  },

  getConversationsForGuest(guestToken: string) {
    return prisma.chatbotConversation.findMany({
      where: { guestTokenHash: hashGuestToken(guestToken) },
      orderBy: { updatedAt: "desc" },
    });
  },

  getAllConversations() {
    return prisma.chatbotConversation.findMany({ orderBy: { updatedAt: "desc" }, take: 300 });
  },

  createConversation(data: { userId?: number; guestName?: string; guestPhone?: string; topic?: string; guestTokenHash?: string }) {
    return prisma.chatbotConversation.create({
      data: {
        userId: data.userId,
        guestName: data.guestName,
        guestPhone: data.guestPhone,
        guestTokenHash: data.guestTokenHash,
        topic: data.topic,
        isResolved: false,
      },
    });
  },

  updateTopic(id: number, topic: string) {
    return prisma.chatbotConversation.update({ where: { id }, data: { topic } });
  },

  saveMessage(data: { conversationId: number; sender: ChatbotSender; content: string; intent?: string }) {
    return prisma.chatbotMessage.create({ data });
  },

  deleteConversation(id: number) {
    return prisma.$transaction(async (tx) => {
      await tx.chatbotMessage.deleteMany({ where: { conversationId: id } });
      return tx.chatbotConversation.delete({ where: { id } });
    });
  },

  cleanupEmptyConversationsForUser(userId: number) {
    return prisma.chatbotConversation.deleteMany({ where: { userId, messages: { none: {} } } });
  },
};
