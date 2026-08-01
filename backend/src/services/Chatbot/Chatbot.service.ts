import { GoogleGenerativeAI } from '@google/generative-ai';
import { ChatbotSender } from '@prisma/client';
import { env } from '../../config/env.js';
import { chatbotData } from '../../data/Chatbot/Chatbot.data.js';
import { prisma } from '../../data/prisma.js';

const genAI = new GoogleGenerativeAI(env.geminiApiKey);

export class ChatbotService {
  static async processMessage(
    conversationId: number,
    message: string,
    role: 'ADMIN' | 'CUSTOMER',
    userName: string = 'bạn'
  ) {
    const senderType = role === 'ADMIN' ? ChatbotSender.STAFF : ChatbotSender.CUSTOMER;

    await chatbotData.saveMessage({
      conversationId,
      sender: senderType,
      content: message,
    });

    const conversation = await chatbotData.getConversationById(conversationId);
    if (!conversation) throw new Error('Không tìm thấy phiên chat');

    if (conversation.messages.length === 1) {
      try {
        const titleModel = genAI.getGenerativeModel({ model: 'gemini-flash-latest' });
        const titleResult = await titleModel.generateContent(
          `Tạo 1 tiêu đề thật ngắn gọn (khoảng 3-6 chữ) tóm tắt nội dung sau. KHÔNG dùng dấu ngoặc kép, KHÔNG dùng markdown. Nội dung: "${message}"`
        );
        const newTopic = titleResult.response.text().trim();
        await chatbotData.updateTopic(conversationId, newTopic);
      } catch (error) {
        console.error("Lỗi khi AI tự động đặt tên:", error);
      }
    }

    const history = conversation.messages.map((msg) => ({
      role: msg.sender === ChatbotSender.BOT ? 'model' : 'user',
      parts: [{ text: msg.content }],
    }));

    const previousMessages = history.slice(0, -1);

    const noMarkdownRule = "Tuyệt đối KHÔNG sử dụng Markdown (không dùng dấu **, *, #, -). Trình bày bằng văn bản thuần túy, xuống dòng rõ ràng để dễ đọc.";

    // LẤY DANH SÁCH SẢN PHẨM TRUYỀN VÀO CHO CẢ ADMIN LẪN KHÁCH HÀNG
    const products = await prisma.product.findMany({
      where: { isRetail: true }, 
      select: { id: true, name: true, price: true, description: true },
      take: 20,
    });
    
    const productContext = products
      .map(p => `[ID:${p.id}] ${p.name}: ${Number(p.price).toLocaleString('vi-VN')}đ. Mô tả: ${p.description}`)
      .join('\n');

    let systemInstruction = '';

    if (role === 'ADMIN') {
      const ordersInfo = await prisma.order.aggregate({
        _count: { id: true },
        _sum: { totalAmount: true },
      });

      systemInstruction = `
        XÁC NHẬN VAI TRÒ: Người đang trò chuyện với bạn CHẮC CHẮN là ADMIN (Quản lý) của Phú Tài Coffee Works.
        Vai trò của bạn: Trợ lý AI Phân tích Dữ liệu và Tư vấn Chiến lược kinh doanh.
        
        DỮ LIỆU CỦA HỆ THỐNG:
        - Tổng số đơn hàng: ${ordersInfo._count.id}
        - Tổng doanh thu toàn bộ: ${Number(ordersInfo._sum.totalAmount || 0).toLocaleString('vi-VN')} VNĐ.
        
        DANH MỤC SẢN PHẨM ĐANG KINH DOANH:
        ${productContext}
        
        NGUYÊN TẮC LÀM VIỆC VỚI ADMIN (BẮT BUỘC TUÂN THỦ):
        1. KHÔNG xưng hô là "nhân viên chăm sóc khách hàng".
        2. BỎ QUA mọi câu từ khách sáo. Tuyệt đối KHÔNG dùng "Chào bạn", "dạ", "vâng", "ạ", "cảm ơn bạn".
        3. Cách xưng hô duy nhất: Tự xưng là "Trợ lý AI", gọi người dùng là "Quản lý".
        4. Trả lời khô khan, dứt khoát, đi thẳng vào số liệu, tập trung 100% vào phân tích nghiệp vụ.
        5. NẾU QUẢN LÝ YÊU CẦU TÌM SẢN PHẨM MỚI: Dựa vào Danh mục Sản phẩm đang kinh doanh bên trên, hãy tìm ra những dòng sản phẩm/xu hướng cà phê trên thị trường mà cửa hàng CHƯA BÁN (Ví dụ: Cold Brew, Specialty Coffee, Cà phê túi lọc...) để đề xuất nhập hàng.
        6. Nếu không có số liệu doanh thu chi tiết từng sản phẩm, hãy mạnh dạn báo cáo "Hệ thống chỉ cung cấp tổng doanh thu, chưa có chi tiết từng mã", sau đó tiếp tục tư vấn chiến lược.
        ${noMarkdownRule}
      `;
    } else {
      systemInstruction = `
        Bạn là Nhân viên Tư vấn chăm sóc khách hàng nhiệt tình của Phú Tài Coffee Works.
        Người đang trò chuyện với bạn là khách hàng thân thiết tên: "${userName}".
        
        Dưới đây là thông tin các sản phẩm hiện có:
        ${productContext}
        
        Quy tắc hoạt động bắt buộc:
        1. Xưng hô thân thiện, gọi khách hàng bằng tên ("${userName}").
        2. CHỈ tư vấn các thông tin liên quan đến cà phê, sản phẩm và dịch vụ của cửa hàng.
        3. TUYỆT ĐỐI KHÔNG cung cấp hay tiết lộ thông tin của người khác.
        4. Thái độ phục vụ luôn lịch sự, nhiệt tình, dễ hiểu.
        ${noMarkdownRule}
      `;
    }

    const model = genAI.getGenerativeModel({
      model: 'gemini-flash-latest',
      systemInstruction: systemInstruction 
    });

    const chat = model.startChat({
      history: previousMessages,
    });

    const result = await chat.sendMessage(message);
    const botResponseText = result.response.text();

    const savedBotMessage = await chatbotData.saveMessage({
      conversationId,
      sender: ChatbotSender.BOT,
      content: botResponseText,
    });

    return savedBotMessage;
  }
}