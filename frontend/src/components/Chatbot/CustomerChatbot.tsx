import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, MessageCircle, X, Plus, History, ArrowLeft, Trash2 } from 'lucide-react';
import { adminAuth } from '../../lib/adminApi';

type Message = { id: string; sender: 'USER' | 'BOT'; content: string };
type Conversation = { id: number; topic: string; updatedAt: string };

const CustomerChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [view, setView] = useState<'chat' | 'history'>('chat');
  const [messages, setMessages] = useState<Message[]>([
    { id: 'welcome', sender: 'BOT', content: 'Xin chào! Mình là trợ lý AI của Phú Tài Coffee Works. Bạn cần tư vấn về cà phê hay có thắc mắc gì về cửa hàng không ạ?' }
  ]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<number | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen, view]);

  const getAuthToken = () => {
    const sessionToken = adminAuth.getToken();
    if (sessionToken) return sessionToken;

    const commonKeys = ['token', 'accessToken', 'access_token', 'jwt', 'auth_token'];
    for (const k of commonKeys) {
      const val = localStorage.getItem(k);
      if (val && val !== 'undefined' && val !== 'null') return val;
    }
    const userKeys = ['user', 'auth'];
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

  const getChatHeaders = () => {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    const token = getAuthToken();
    const guestToken = localStorage.getItem('customer_chatbot_guest_token');
    if (token) headers.Authorization = `Bearer ${token}`;
    else if (guestToken) headers['X-Chat-Session'] = guestToken;
    return headers;
  };

  // Kiểm tra trạng thái đăng nhập khi mở khung chat
  useEffect(() => {
    const token = getAuthToken();
    setIsLoggedIn(!!token);
    if (token) {
      fetchConversationsList(token);
    }
  }, [isOpen]);

  const fetchConversationsList = async (token: string) => {
    try {
      const res = await fetch('http://localhost:4000/api/chatbot/conversations', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const json = await res.json();
      if (json.success) {
        setConversations(json.data);
      }
    } catch (error) {
      console.error('Không thể tải lịch sử chat của khách hàng:', error);
    }
  };

  const loadHistory = async (convId: number) => {
    try {
      const headers = getChatHeaders();

      const res = await fetch(`http://localhost:4000/api/chatbot/${convId}/history`, { headers });
      const json = await res.json();
      
      if (json.success && json.data?.messages) {
        const historyMessages = json.data.messages.map((msg: any) => ({
          id: msg.id.toString(),
          sender: msg.sender === 'BOT' ? 'BOT' : 'USER',
          content: msg.content
        }));
        setMessages(historyMessages);
      }
    } catch (error) {
      console.error('Không thể tải lịch sử đoạn chat:', error);
    }
  };

  const startNewConversation = () => {
    setConversationId(null);
    localStorage.removeItem('customer_chatbot_conv_id');
    setMessages([{ 
      id: 'welcome', 
      sender: 'BOT', 
      content: 'Xin chào! Mình là trợ lý AI của Phú Tài Coffee Works. Bạn cần tư vấn về dòng cà phê nào hôm nay?' 
    }]);
    setView('chat');
  };

  const switchConversation = (id: number) => {
    setConversationId(id);
    localStorage.setItem('customer_chatbot_conv_id', id.toString());
    loadHistory(id);
    setView('chat');
  };

  const handleDeleteConversation = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm("Bạn có muốn xóa cuộc trò chuyện này không?")) return;

    try {
      const res = await fetch(`http://localhost:4000/api/chatbot/${id}`, {
        method: 'DELETE',
        headers: getChatHeaders()
      });
      const json = await res.json();

      if (json.success) {
        setConversations(prev => prev.filter(c => c.id !== id));
        if (conversationId === id) {
          startNewConversation();
        }
      }
    } catch (error) {
      console.error('Lỗi khi xóa:', error);
    }
  };

  useEffect(() => {
    const savedConvId = localStorage.getItem('customer_chatbot_conv_id');
    if (savedConvId) {
      setConversationId(Number(savedConvId));
      loadHistory(Number(savedConvId));
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
      let headers = getChatHeaders();

      let activeConvId = conversationId;

      // Lazy Creation: Chỉ tạo đoạn chat mới khi gửi tin nhắn đầu tiên
      if (!activeConvId) {
        const startRes = await fetch('http://localhost:4000/api/chatbot/start', {
          method: 'POST',
          headers,
          body: JSON.stringify({ topic: 'Tư vấn Khách hàng' })
        });
        const startJson = await startRes.json();
        
        if (startJson.success && startJson.data?.id) {
          if (startJson.guestToken) localStorage.setItem('customer_chatbot_guest_token', startJson.guestToken);
          activeConvId = Number(startJson.data.id);
          setConversationId(activeConvId);
          localStorage.setItem('customer_chatbot_conv_id', activeConvId.toString());
          headers = getChatHeaders();
        } else {
          throw new Error("Không thể khởi tạo kết nối AI");
        }
      }

      const res = await fetch('http://localhost:4000/api/chatbot/send', {
        method: 'POST',
        headers,
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
        if (token) {
          fetchConversationsList(token); // Cập nhật lại tiêu đề tự động trên lịch sử
        }
      } else {
        throw new Error(json.message);
      }
    } catch (error: any) {
      setMessages(prev => [...prev, { 
        id: Date.now().toString(), 
        sender: 'BOT', 
        content: `Lỗi: ${error.message || 'Không thể liên lạc với máy chủ AI.'}` 
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
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {isOpen && (
        <div className="mb-4 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-[#E8D3C7] overflow-hidden flex flex-col h-[520px] max-h-[75vh]">
          {/* Header */}
          <div className="bg-[#553B2F] p-4 text-white flex justify-between items-center shadow-md z-10">
            <div className="flex items-center gap-3">
              {view === 'history' ? (
                <button onClick={() => setView('chat')} className="text-white/80 hover:text-white transition-colors">
                  <ArrowLeft size={20} />
                </button>
              ) : (
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <Bot size={24} className="text-white" />
                </div>
              )}
              <div>
                <h3 className="font-bold text-sm leading-tight">
                  {view === 'history' ? 'Lịch sử tư vấn' : 'Phú Tài Coffee AI'}
                </h3>
                <span className="text-xs text-white/70">
                  {view === 'history' ? 'Các cuộc trò chuyện trước' : 'Luôn sẵn sàng hỗ trợ'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Nút xem lịch sử (Chỉ hiện khi đã đăng nhập và đang ở màn hình chat) */}
              {isLoggedIn && view === 'chat' && (
                <button 
                  onClick={() => { fetchConversationsList(getAuthToken()); setView('history'); }} 
                  className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                  title="Xem lịch sử trò chuyện"
                >
                  <History size={18} />
                </button>
              )}
              {/* Nút tạo chat mới */}
              {view === 'chat' && (
                <button 
                  onClick={startNewConversation} 
                  className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                  title="Tư vấn đoạn chat mới"
                >
                  <Plus size={18} />
                </button>
              )}
              <button onClick={() => setIsOpen(false)} className="p-1.5 text-white/80 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Body: Hiển thị giữa màn hình Chat hoặc màn hình Lịch sử */}
          {view === 'history' ? (
            <div className="flex-1 overflow-y-auto p-3 bg-[#FAF9F6] flex flex-col gap-2">
              <div className="p-2 text-xs font-bold uppercase text-stone-500 tracking-wider">Danh sách cuộc hội thoại cũ</div>
              {conversations.length === 0 ? (
                <div className="text-center text-sm text-gray-400 mt-10">Bạn chưa có lịch sử trò chuyện nào.</div>
              ) : (
                conversations.map((conv) => (
                  <div key={conv.id} className="relative group">
                    <button
                      onClick={() => switchConversation(conv.id)}
                      className={`flex items-center gap-3 w-full text-left p-3 pr-10 rounded-xl text-sm transition-all border ${
                        conversationId === conv.id 
                          ? 'bg-[#E8D3C7]/40 border-[#AA7864] text-[#553B2F] font-semibold' 
                          : 'bg-white border-stone-200 text-stone-700 hover:border-[#AA7864]'
                      }`}
                    >
                      <MessageCircle size={16} className="shrink-0 text-[#AA7864]" />
                      <span className="truncate">{conv.topic || 'Đoạn chat mới'}</span>
                    </button>
                    <button
                      onClick={(e) => handleDeleteConversation(conv.id, e)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md opacity-0 group-hover:opacity-100 transition-all"
                      title="Xóa đoạn chat"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                ))
              )}
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto p-4 bg-[#FAF9F6] space-y-4">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex gap-3 ${msg.sender === 'USER' ? 'flex-row-reverse' : 'flex-row'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.sender === 'USER' ? 'bg-[#AA7864] text-white' : 'bg-orange-200 text-orange-700'}`}>
                    {msg.sender === 'USER' ? <User size={16} /> : <Bot size={16} />}
                  </div>
                  <div className={`max-w-[75%] p-3 rounded-2xl text-sm ${msg.sender === 'USER' ? 'bg-[#AA7864] text-white rounded-tr-sm' : 'bg-white border border-[#E8D3C7] text-gray-800 rounded-tl-sm shadow-sm'}`}>
                    <p className="leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="flex gap-3 flex-row">
                  <div className="w-8 h-8 rounded-full bg-orange-200 text-orange-700 flex items-center justify-center shrink-0">
                    <Bot size={16} />
                  </div>
                  <div className="bg-white border border-[#E8D3C7] p-3 rounded-2xl rounded-tl-sm flex gap-1.5 items-center shadow-sm">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}

          {/* Footer - Input (Chỉ hiện khi ở khung chat) */}
          {view === 'chat' && (
            <div className="p-3 bg-white border-t border-[#E8D3C7]">
              <div className="relative flex items-center">
                <input
                  type="text"
                  placeholder="Nhập câu hỏi hoặc yêu cầu tư vấn..."
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={isLoading}
                  className="w-full pl-4 pr-12 py-2.5 rounded-full border border-[#E8D3C7] focus:border-[#AA7864] focus:ring-1 focus:ring-[#AA7864] outline-none text-sm disabled:bg-gray-100"
                />
                <button
                  onClick={() => handleSendMessage(inputValue)}
                  disabled={!inputValue.trim() || isLoading}
                  className="absolute right-1 p-2 text-[#553B2F] hover:bg-[#FAF9F6] rounded-full disabled:opacity-30 transition-colors"
                >
                  <Send size={18} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Nút Bong bóng Chat nổi */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`${isOpen ? 'scale-0 opacity-0' : 'scale-100 opacity-100'} transition-all duration-300 w-14 h-14 bg-[#553B2F] hover:bg-[#3d2a21] text-white rounded-full flex items-center justify-center shadow-xl shadow-[#553B2F]/30 hover:scale-110 active:scale-95`}
      >
        <MessageCircle size={28} />
      </button>
    </div>
  );
};

export default CustomerChatbot;
