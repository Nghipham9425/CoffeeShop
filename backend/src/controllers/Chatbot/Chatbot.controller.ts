import { Request, Response } from 'express';
import { ChatbotService } from '../../services/Chatbot/Chatbot.service.js';
import { chatbotData } from '../../data/Chatbot/Chatbot.data.js';
import { prisma } from '../../data/prisma.js';

export const startConversation = async (req: Request, res: Response) => {
  const { guestName, guestPhone, topic } = req.body;
  
  const userPayload = req.user as any;
  const userId = userPayload?.userId || userPayload?.id; 

  const conversation = await chatbotData.createConversation({
    userId: userId ? Number(userId) : undefined,
    guestName,
    guestPhone,
    topic: topic || 'Đoạn chat mới',
  });

  res.status(201).json({ success: true, data: conversation });
};

export const sendMessage = async (req: Request, res: Response) => {
  const { conversationId, message } = req.body;
  
  if (!conversationId || !message) {
    res.status(400).json({ message: "Thiếu conversationId hoặc message" });
    return;
  }

  let role: 'ADMIN' | 'CUSTOMER' = 'CUSTOMER';
  let userName = 'Khách hàng';

  // 1. LẤY CHÍNH XÁC QUYỀN TỪ CHỦ NHÂN ĐOẠN CHAT TRONG DATABASE
  const conversation = await chatbotData.getConversationById(Number(conversationId));
  
  if (!conversation) {
    res.status(404).json({ message: "Không tìm thấy đoạn chat" });
    return;
  }

  if (conversation.userId) {
    // Nếu đoạn chat này có chủ nhân, quét Database để kiểm tra role
    const user = await prisma.user.findUnique({ 
      where: { id: conversation.userId } 
    });
    
    if (user) {
      const u = user as any;
      const userRole = String(u.role || '').toUpperCase();
      
      if (userRole === 'ADMIN' || userRole === 'STAFF' || userRole === 'MANAGER' || u.isAdmin === true) {
        role = 'ADMIN';
      }
      userName = u.name || u.fullName || u.email || 'bạn';
    }
  } else {
    // Fallback: Nếu không có chủ (guest), kiểm tra qua Token
    const userPayload = req.user as any;
    const payloadRole = userPayload?.role || userPayload?.roleId;
    if (payloadRole && String(payloadRole).toUpperCase() === 'ADMIN') {
      role = 'ADMIN';
    }
  }

  try {
    const botReply = await ChatbotService.processMessage(
      Number(conversationId),
      message,
      role,
      userName
    );
    res.status(200).json({ success: true, data: botReply });
  } catch (error: any) {
    console.error("Lỗi AI Chatbot:", error);
    res.status(500).json({ 
      success: false, 
      message: error.message || "Lỗi máy chủ nội bộ khi kết nối AI" 
    });
  }
};

export const getHistory = async (req: Request, res: Response) => {
  const { conversationId } = req.params;
  const history = await chatbotData.getConversationById(Number(conversationId));
  res.status(200).json({ success: true, data: history });
};

export const getConversations = async (req: Request, res: Response) => {
  const userPayload = req.user as any;
  const userId = userPayload?.userId || userPayload?.id; 
  
  const numericUserId = userId ? Number(userId) : undefined;
  await chatbotData.cleanupEmptyConversations(numericUserId);
  const conversations = await chatbotData.getConversations(numericUserId);
  
  res.status(200).json({ success: true, data: conversations });
};

export const deleteConversation = async (req: Request, res: Response) => {
  try {
    const { conversationId } = req.params;
    await chatbotData.deleteConversation(Number(conversationId));
    res.status(200).json({ success: true, message: "Đã xóa cuộc trò chuyện" });
  } catch (error: any) {
    res.status(500).json({ success: false, message: "Không thể xóa" });
  }
};