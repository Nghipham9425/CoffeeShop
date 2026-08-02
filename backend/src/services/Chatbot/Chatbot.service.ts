import { GoogleGenerativeAI } from "@google/generative-ai";
import { ChatbotSender, type UserRole } from "@prisma/client";
import { env } from "../../config/env.js";
import { chatbotData } from "../../data/Chatbot/Chatbot.data.js";
import { prisma } from "../../data/prisma.js";

const genAI = new GoogleGenerativeAI(env.geminiApiKey);

export class ChatbotService {
  static async processMessage(conversationId: number, message: string, role: UserRole, userName = "bạn") {
    const sender = role === "CUSTOMER" ? ChatbotSender.CUSTOMER : ChatbotSender.STAFF;
    await chatbotData.saveMessage({ conversationId, sender, content: message });

    const conversation = await chatbotData.getConversationById(conversationId);
    if (!conversation) throw new Error("Không tìm thấy phiên trò chuyện.");

    if (conversation.messages.length === 1) {
      try {
        const titleModel = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
        const title = await titleModel.generateContent(`Tạo tiêu đề tiếng Việt 3-6 từ, không markdown, cho nội dung: ${message}`);
        await chatbotData.updateTopic(conversationId, title.response.text().trim().slice(0, 100));
      } catch {
        // Tạo tiêu đề không được làm gián đoạn cuộc trò chuyện.
      }
    }

    const now = new Date();
    const products = await prisma.product.findMany({
      where: { isRetail: true, isActive: true },
      select: {
        id: true,
        name: true,
        description: true,
        prices: {
          where: {
            priceType: "RETAIL",
            isActive: true,
            AND: [
              { OR: [{ startAt: null }, { startAt: { lte: now } }] },
              { OR: [{ endAt: null }, { endAt: { gte: now } }] },
            ],
          },
          orderBy: { minQuantity: "asc" },
          take: 1,
        },
      },
      take: 20,
    });
    const productContext = products.map((product) => {
      const price = product.prices[0] ? `${Number(product.prices[0].price).toLocaleString("vi-VN")}đ` : "chưa có giá";
      return `[ID:${product.id}] ${product.name}; giá ${price}; ${product.description ?? "Chưa có mô tả."}`;
    }).join("\n");

    const isStaff = role !== "CUSTOMER";
    const orderSummary = isStaff ? await prisma.order.aggregate({ _count: { id: true }, _sum: { totalAmount: true } }) : null;
    const systemInstruction = isStaff
      ? `Bạn là trợ lý AI nội bộ của Phú Tài Coffee Works. Người đang hỏi là ${role} tên ${userName}.
Chỉ dùng dữ liệu hệ thống được cung cấp, không bịa số liệu và không tiết lộ dữ liệu khách hàng riêng tư.
Tổng số đơn: ${orderSummary?._count.id ?? 0}; tổng giá trị đơn: ${Number(orderSummary?._sum.totalAmount ?? 0).toLocaleString("vi-VN")}đ.
Sản phẩm: ${productContext}
Trả lời ngắn gọn, trực tiếp bằng tiếng Việt, văn bản thuần, không markdown.`
      : `Bạn là trợ lý tư vấn của Phú Tài Coffee Works. Khách hàng tên ${userName}.
Chỉ tư vấn cà phê, sản phẩm, cách mua, báo giá và giao hàng của cửa hàng. Không bịa giá hoặc tồn kho, không tiết lộ dữ liệu người khác.
Sản phẩm hiện có: ${productContext}
Trả lời thân thiện, rõ ràng bằng tiếng Việt, văn bản thuần, không markdown.`;

    const history = conversation.messages.slice(0, -1).map((item) => ({
      role: item.sender === ChatbotSender.BOT ? "model" : "user",
      parts: [{ text: item.content }],
    }));
    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest", systemInstruction });
    const response = await model.startChat({ history }).sendMessage(message);
    return chatbotData.saveMessage({
      conversationId,
      sender: ChatbotSender.BOT,
      content: response.response.text(),
    });
  }
}
