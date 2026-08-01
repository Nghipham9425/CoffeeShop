import React, { useState, useEffect, useRef } from 'react';
import { AdminPageShell } from '../shared/AdminPageShell';
import { Card } from '../../../components/ui/card';
import { Send, Bot, User, MessageSquare, Plus, Trash2 } from 'lucide-react';

type Message = { id: string; sender: 'USER' | 'BOT'; content: string };
type Conversation = { id: number; topic: string; updatedAt: string };

const AdminChatbotPage = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<number | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const getAuthToken = () => {
    const commonKeys = ['token', 'admin_token', 'accessToken', 'access_token', 'jwt', 'auth_token'];
    for (const k of commonKeys) {
      const val = localStorage.getItem(k);
      if (val && val !== 'undefined' && val !== 'null') return val;
    }
    const userKeys = ['user', 'admin', 'auth'];
    for (const k of userKeys) {
      const val = localStorage.getItem(k);
      if (val) {
        try {
          const parsed = JSON.parse(val);
          if (parsed.token) return parsed.token;
          if (parsed.accessToken) return parsed.accessToken;
        } catch (e) {}
      }
    }
    return '';
  };

  const fetchConversationsList = async () => {
    try {
      const token = getAuthToken();
      const res = await fetch('http://localhost:4000/api/chatbot/conversations', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const json = await res.json();
      if (json.success) setConversations(json.data);
    } catch (error) {
      console.error('Không thể tải danh sách chat:', error);
    }
  };

  const loadHistory = async (convId: number) => {
    try {
      const token = getAuthToken();
      const res = await fetch(`http://localhost:4000/api/chatbot/${convId}/history`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const json = await res.json();
      
      if (json.success && json.data?.messages) {
        const historyMessages = json.data.messages.map((msg: any) => ({
          id: msg.id.toString(),
          sender: msg.sender === 'BOT' ? 'BOT' : 'USER',
          content: msg.content
        }));
        setMessages(historyMessages);
      } else {
        startNewConversation();
      }
    } catch (error) {
      console.error('Không thể tải lịch sử:', error);
      startNewConversation();
    }
  };

  const startNewConversation = () => {
    setConversationId(null);
    localStorage.removeItem('admin_chatbot_conv_id');
    setMessages([{ 
      id: 'welcome', 
      sender: 'BOT', 
      content: 'Xin chào quản lý! Tôi là trợ lý AI của Phú Tài Coffee Works. Bạn cần tôi phân tích doanh thu, sản phẩm hay tư vấn chiến lược gì hôm nay?' 
    }]);
  };

  const switchConversation = (id: number) => {
    setConversationId(id);
    localStorage.setItem('admin_chatbot_conv_id', id.toString());
    loadHistory(id);
  };

  const handleDeleteConversation = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation(); 
    if (!window.confirm("Bạn có chắc chắn muốn xóa cuộc trò chuyện này?")) return;

    try {
      const token = getAuthToken();
      const res = await fetch(`http://localhost:4000/api/chatbot/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const json = await res.json();

      if (json.success) {
        setConversations(prev => prev.filter(c => c.id !== id)); 
        if (conversationId === id) {
          startNewConversation();
        }
      } else {
        alert(json.message);
      }
    } catch (error) {
      console.error('Lỗi khi xóa:', error);
    }
  };

  useEffect(() => {
    fetchConversationsList();
    const savedConvId = localStorage.getItem('admin_chatbot_conv_id');
    if (savedConvId) {
      setConversationId(Number(savedConvId));
      loadHistory(Number(savedConvId));
    } else {
      startNewConversation();
    }
  }, []);

  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return;

    const newUserMsg: Message = { id: Date.now().toString(), sender: 'USER', content: text };
    setMessages(prev => [...prev, newUserMsg]);
    setInputValue('');
    setIsLoading(true);

    try {
      const token = getAuthToken();
      
      // KHAI BÁO KIỂU DỮ LIỆU RÕ RÀNG NGAY TỪ ĐẦU ĐỂ CHIỀU LÒNG TYPESCRIPT
      let activeConvId: number;

      // NẾU ĐÃ CÓ ID (Đang ở cuộc chat hiện tại)
      if (conversationId) {
        activeConvId = conversationId;
      } 
      // NẾU CHƯA CÓ ID (Tin nhắn đầu tiên)
      else {
        const startRes = await fetch('http://localhost:4000/api/chatbot/start', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({ topic: 'Đoạn chat mới' })
        });
        const startJson = await startRes.json();
        
        if (startJson.success && startJson.data?.id) {
          activeConvId = Number(startJson.data.id); // Ép cứng thành Number
          setConversationId(activeConvId);
          localStorage.setItem('admin_chatbot_conv_id', activeConvId.toString());
        } else {
          throw new Error("Không thể tạo phiên chat mới");
        }
      }

      // LÚC NÀY TYPESCRIPT ĐÃ CHẮC CHẮN activeConvId LÀ NUMBER 100%
      const res = await fetch('http://localhost:4000/api/chatbot/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ conversationId: activeConvId, message: text })
      });
      
      const json = await res.json();
      if (json.success) {
        const newBotMsg: Message = { 
          id: json.data.id.toString(), 
          sender: 'BOT', 
          content: json.data.content 
        };
        setMessages(prev => [...prev, newBotMsg]);
        fetchConversationsList();
      } else {
        throw new Error(json.message);
      }
    } catch (error: any) {
      setMessages(prev => [...prev, { 
        id: Date.now().toString(), 
        sender: 'BOT', 
        content: `Lỗi kết nối: ${error.message || 'Không thể liên lạc với máy chủ AI.'}` 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(inputValue);
    }
  };

  return (
    <AdminPageShell 
      title="Trợ Lý AI Phân Tích"
      description="Trung tâm phân tích dữ liệu và chiến lược cùng AI"
    >
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[75vh]">
        
        <div className="hidden lg:flex flex-col gap-4 col-span-1 h-full">
          <button 
            onClick={startNewConversation}
            className="flex items-center gap-2 justify-center w-full py-3 bg-[#553B2F] text-white rounded-xl font-bold shadow-md hover:bg-[#3d2a21] transition-all"
          >
            <Plus size={20} /> Mở Chat Mới
          </button>

          <Card className="border-[#E8D3C7] shadow-sm rounded-xl overflow-hidden bg-[#FAF9F6] flex-1 flex flex-col">
            <div className="p-4 border-b border-[#E8D3C7]">
              <h3 className="font-bold text-[#553B2F] text-sm uppercase tracking-wider">Lịch sử trò chuyện</h3>
            </div>
            <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2">
              {conversations.length === 0 ? (
                <p className="text-center text-sm text-gray-400 mt-4">Chưa có dữ liệu chat</p>
              ) : (
                conversations.map((conv) => (
                  <div key={conv.id} className="relative group">
                    <button
                      onClick={() => switchConversation(conv.id)}
                      className={`flex items-center gap-3 w-full text-left p-3 pr-10 rounded-lg text-sm transition-all border ${
                        conversationId === conv.id 
                          ? 'bg-[#E8D3C7]/40 border-[#AA7864] text-[#553B2F] font-semibold' 
                          : 'border-transparent text-gray-600 hover:bg-[#E8D3C7]/20 hover:text-[#553B2F]'
                      }`}
                    >
                      <MessageSquare size={16} className="shrink-0" />
                      <span className="truncate">{conv.topic || 'Đoạn chat mới'}</span>
                    </button>
                    
                    <button
                      onClick={(e) => handleDeleteConversation(conv.id, e)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md opacity-0 group-hover:opacity-100 transition-all"
                      title="Xóa cuộc trò chuyện này"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>

        <Card className="col-span-1 lg:col-span-3 border-[#E8D3C7] shadow-sm rounded-xl overflow-hidden flex flex-col h-full">
          <div className="flex-1 overflow-y-auto p-6 bg-white space-y-6">
            {messages.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center opacity-50">
                <Bot size={64} className="text-[#AA7864] mb-4" />
                <h2 className="text-xl font-black text-[#553B2F]">Tôi có thể giúp gì cho bạn?</h2>
              </div>
            )}

            {messages.map((msg) => (
              <div key={msg.id} className={`flex gap-4 ${msg.sender === 'USER' ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${msg.sender === 'USER' ? 'bg-[#553B2F] text-white' : 'bg-orange-100 text-orange-600'}`}>
                  {msg.sender === 'USER' ? <User size={20} /> : <Bot size={20} />}
                </div>
                <div className={`max-w-[75%] p-4 rounded-2xl ${msg.sender === 'USER' ? 'bg-[#553B2F] text-white rounded-tr-sm' : 'bg-gray-100 text-gray-800 rounded-tl-sm'}`}>
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex gap-4 flex-row">
                <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
                  <Bot size={20} />
                </div>
                <div className="bg-gray-100 p-4 rounded-2xl rounded-tl-sm flex gap-2 items-center">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-4 border-t border-[#E8D3C7] bg-[#FAF9F6]">
            <div className="relative flex items-center">
              <input
                type="text"
                placeholder="Nhập yêu cầu để AI xử lý..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isLoading}
                className="w-full pl-4 pr-12 py-3 rounded-xl border border-[#E8D3C7] focus:border-[#AA7864] focus:ring-1 focus:ring-[#AA7864] outline-none disabled:bg-gray-100"
              />
              <button
                onClick={() => handleSendMessage(inputValue)}
                disabled={!inputValue.trim() || isLoading}
                className="absolute right-2 p-2 text-[#553B2F] hover:bg-[#E8D3C7] rounded-lg disabled:opacity-30 transition-colors"
              >
                <Send size={20} />
              </button>
            </div>
          </div>
        </Card>
      </div>
    </AdminPageShell>
  );
};

export default AdminChatbotPage;