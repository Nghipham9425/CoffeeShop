import { randomBytes } from "node:crypto";
import type { Request, Response } from "express";
import { ChatbotService } from "../../services/Chatbot/Chatbot.service.js";
import { chatbotData, hashGuestToken } from "../../data/Chatbot/Chatbot.data.js";
import { authService } from "../../services/Auth/Auth.service.js";
import { UserRole, type ChatbotConversation } from "@prisma/client";

const staffRoles = new Set<UserRole>([UserRole.ADMIN, UserRole.SALES, UserRole.WAREHOUSE, UserRole.ACCOUNTANT]);

function userIdFromRequest(req: Request) {
  return req.user?.userId ?? undefined;
}

function guestTokenFromRequest(req: Request) {
  const value = req.header("X-Chat-Session");
  return value?.trim() || undefined;
}

async function canAccessConversation(req: Request, conversation: ChatbotConversation) {
  const userId = userIdFromRequest(req);
  if (userId) {
    const profile = await authService.profile(userId);
    if (conversation.userId === userId || staffRoles.has(profile.role)) {
      return true;
    }
  }

  const guestToken = guestTokenFromRequest(req);
  return Boolean(guestToken && conversation.guestTokenHash === hashGuestToken(guestToken));
}

export const startConversation = async (req: Request, res: Response) => {
  const userId = userIdFromRequest(req);
  const guestToken = userId ? undefined : randomBytes(32).toString("hex");
  const conversation = await chatbotData.createConversation({
    userId,
    guestName: typeof req.body.guestName === "string" ? req.body.guestName.trim() : undefined,
    guestPhone: typeof req.body.guestPhone === "string" ? req.body.guestPhone.trim() : undefined,
    topic: typeof req.body.topic === "string" ? req.body.topic.trim() : "Đoạn chat mới",
    guestTokenHash: guestToken ? hashGuestToken(guestToken) : undefined,
  });
  res.status(201).json({ success: true, data: conversation, ...(guestToken ? { guestToken } : {}) });
};

export const sendMessage = async (req: Request, res: Response) => {
  const conversationId = Number(req.body.conversationId);
  const message = typeof req.body.message === "string" ? req.body.message.trim() : "";
  if (!Number.isInteger(conversationId) || !message) {
    res.status(400).json({ message: "Thiếu mã cuộc trò chuyện hoặc nội dung tin nhắn." });
    return;
  }
  const conversation = await chatbotData.getConversationById(conversationId);
  if (!conversation) {
    res.status(404).json({ message: "Không tìm thấy cuộc trò chuyện." });
    return;
  }
  if (!(await canAccessConversation(req, conversation))) {
    res.status(403).json({ message: "Bạn không có quyền sử dụng cuộc trò chuyện này." });
    return;
  }

  let role: UserRole = UserRole.CUSTOMER;
  let userName = conversation.guestName || "bạn";
  const userId = userIdFromRequest(req);
  if (userId) {
    const profile = await authService.profile(userId);
    role = profile.role;
    userName = profile.fullName;
  }

  try {
    const botReply = await ChatbotService.processMessage(conversationId, message, role, userName);
    res.status(200).json({ success: true, data: botReply });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Không thể kết nối trợ lý AI.";
    res.status(500).json({ success: false, message });
  }
};

export const getHistory = async (req: Request, res: Response) => {
  const conversation = await chatbotData.getConversationById(Number(req.params.conversationId));
  if (!conversation) {
    res.status(404).json({ message: "Không tìm thấy cuộc trò chuyện." });
    return;
  }
  if (!(await canAccessConversation(req, conversation))) {
    res.status(403).json({ message: "Bạn không có quyền xem cuộc trò chuyện này." });
    return;
  }
  res.json({ success: true, data: conversation });
};

export const getConversations = async (req: Request, res: Response) => {
  const userId = userIdFromRequest(req);
  if (userId) {
    const profile = await authService.profile(userId);
    if (staffRoles.has(profile.role)) {
      res.json({ success: true, data: await chatbotData.getAllConversations() });
      return;
    }
    await chatbotData.cleanupEmptyConversationsForUser(userId);
    res.json({ success: true, data: await chatbotData.getConversationsForUser(userId) });
    return;
  }
  const guestToken = guestTokenFromRequest(req);
  res.json({ success: true, data: guestToken ? await chatbotData.getConversationsForGuest(guestToken) : [] });
};

export const deleteConversation = async (req: Request, res: Response) => {
  const conversation = await chatbotData.getConversationById(Number(req.params.conversationId));
  if (!conversation) {
    res.status(404).json({ message: "Không tìm thấy cuộc trò chuyện." });
    return;
  }
  if (!(await canAccessConversation(req, conversation))) {
    res.status(403).json({ message: "Bạn không có quyền xóa cuộc trò chuyện này." });
    return;
  }
  await chatbotData.deleteConversation(conversation.id);
  res.json({ success: true, message: "Đã xóa cuộc trò chuyện." });
};
