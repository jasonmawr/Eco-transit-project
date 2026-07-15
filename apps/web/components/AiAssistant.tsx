'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Send, X, Bot, Loader2, Sparkles } from 'lucide-react';
import { apiFetch } from '../lib/api';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const QUICK_SUGGESTIONS = [
  'Đua Top 5 nhận quà thế nào?',
  'Lộ trình VinBus D4 từ Đại học FPT đi Landmark 81?',
  'Kéo vali từ Ga Ba Son đi Phố Nguyễn Huệ?',
];

export default function AiAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load chat history from sessionStorage on mount
  useEffect(() => {
    const saved = sessionStorage.getItem('eco_green_buddy_chat');
    if (saved) {
      try {
        setMessages(JSON.parse(saved));
      } catch (e) {
        initializeGreeting();
      }
    } else {
      initializeGreeting();
    }
  }, []);

  // Save chat history to sessionStorage when updated
  useEffect(() => {
    if (messages.length > 0) {
      sessionStorage.setItem('eco_green_buddy_chat', JSON.stringify(messages));
    }
  }, [messages]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const initializeGreeting = () => {
    setMessages([
      {
        role: 'assistant',
        content:
          'Chào bạn thân mến! Mình là **Green Buddy** (Bạn Đồng Hành Xanh). Mình ở đây để giúp bạn tìm lộ trình di chuyển xanh bằng xe buýt điện VinBus, Metro, xe đạp công cộng hoặc đi bộ năng động, đồng thời hướng dẫn bạn tích điểm đổi quà và giải đáp các thắc mắc khác. Hôm nay bạn muốn dịch chuyển xanh đi đâu nè?',
      },
    ]);
  };

  const handleSend = async (textToSend: string) => {
    if (!textToSend.trim() || loading) return;

    const userMessage: Message = { role: 'user', content: textToSend };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput('');
    setLoading(true);

    try {
      const response = await apiFetch('/api/ai/chat', {
        method: 'POST',
        body: JSON.stringify({ messages: updatedMessages }),
      });

      if (response && response.reply) {
        setMessages((prev) => [...prev, { role: 'assistant', content: response.reply }]);
      } else {
        throw new Error('Không nhận được phản hồi từ trợ lý.');
      }
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content:
            'Ui, có chút trục trặc kết nối với hệ thống rồi nè! Bạn thử tải lại trang hoặc nhắn tin trực tiếp cho Fanpage để kỹ thuật hỗ trợ nha.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSend(input);
  };

  const clearChat = () => {
    sessionStorage.removeItem('eco_green_buddy_chat');
    initializeGreeting();
  };

  // Convert markdown-like syntax (**text** for bold) to HTML safely
  const formatMessageText = (text: string) => {
    // Escape simple HTML characters first to prevent XSS
    const escaped = text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
    
    // Convert **bold** to <strong>bold</strong>
    const boldFormatted = escaped.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // Convert newlines to breaks
    return boldFormatted.split('\n').join('<br />');
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 font-inter">
      <AnimatePresence>
        {/* Chat Widget Panel */}
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', duration: 0.4 }}
            className="w-[90vw] sm:w-[380px] h-[520px] bg-white/95 backdrop-blur-md border border-eco-mint rounded-3xl shadow-2xl overflow-hidden flex flex-col mb-4"
          >
            {/* Header */}
            <div className="p-4 bg-gradient-to-br from-eco-bgBeige via-white to-eco-mint/40 border-b border-eco-primary/10 flex items-center justify-between shrink-0">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 bg-eco-accentGreen/20 rounded-full flex items-center justify-center border border-eco-accentGreen/30 relative">
                  <Bot className="w-5 h-5 text-eco-accentGreenDeep" />
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white animate-pulse" />
                </div>
                <div>
                  <h4 className="text-xs font-black uppercase tracking-wider text-eco-primary flex items-center gap-1 font-display-campaign">
                    Green Buddy <Sparkles className="w-3 h-3 text-eco-reward animate-pulse" />
                  </h4>
                  <span className="text-[9px] text-eco-muted font-bold">Bạn Đồng Hành Xanh 🌿</span>
                </div>
              </div>
              
              <div className="flex items-center space-x-1">
                <button
                  onClick={clearChat}
                  type="button"
                  className="p-1 rounded-full text-eco-muted hover:bg-red-50 hover:text-red-500 transition-colors text-[9px] font-bold"
                >
                  Xoá chat
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  type="button"
                  className="p-1.5 rounded-full text-eco-muted hover:bg-eco-mint/40 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Chat Messages Log */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed font-medium shadow-sm ${
                      msg.role === 'user'
                        ? 'bg-eco-primary text-white rounded-tr-none'
                        : 'bg-eco-soft/90 border border-eco-primary/5 text-eco-ink rounded-tl-none'
                    }`}
                    dangerouslySetInnerHTML={{ __html: formatMessageText(msg.content) }}
                  />
                </div>
              ))}
              
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-eco-soft/90 border border-eco-primary/5 rounded-2xl rounded-tl-none p-3 text-xs flex items-center space-x-2 text-eco-muted shadow-sm">
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-eco-accentGreenDeep" />
                    <span className="font-semibold italic">Green Buddy đang suy nghĩ...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Action Suggestions */}
            {messages.length === 1 && !loading && (
              <div className="px-4 py-2 border-t border-eco-primary/5 bg-eco-bgBeige/10 shrink-0 space-y-1.5">
                <p className="text-[9px] font-bold text-eco-muted uppercase tracking-wider">💡 Gợi ý nhanh cho bạn:</p>
                <div className="flex flex-col gap-1">
                  {QUICK_SUGGESTIONS.map((s, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSend(s)}
                      className="text-left w-full px-2.5 py-1 text-[10px] text-eco-ink hover:text-eco-primary hover:bg-eco-mint bg-white border border-eco-primary/10 rounded-xl transition-all duration-200 truncate font-semibold"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Message Input Form */}
            <form
              onSubmit={handleFormSubmit}
              className="p-3 border-t border-eco-primary/10 bg-white flex items-center gap-2 shrink-0"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Hỏi Green Buddy về lộ trình xanh..."
                disabled={loading}
                className="flex-grow px-3 py-2 text-xs text-eco-ink bg-eco-soft border border-eco-primary/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-eco-primary focus:border-eco-primary transition-all duration-200"
              />
              <button
                type="submit"
                disabled={!input.trim() || loading}
                className="p-2 rounded-xl bg-eco-primary hover:bg-eco-primaryDeep disabled:bg-gray-100 disabled:text-gray-300 text-white transition-all shadow-sm flex items-center justify-center shrink-0"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Chat Bubble Trigger */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-gradient-to-tr from-eco-primary to-eco-accentGreenDeep rounded-full shadow-lg flex items-center justify-center text-white border-2 border-white hover:shadow-xl transition-all duration-300 focus:outline-none animate-pulse-glow"
        title="Green Buddy Chatbot"
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <X className="w-6 h-6" />
            </motion.div>
          ) : (
            <motion.div
              key="chat"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="relative"
            >
              <MessageSquare className="w-6 h-6" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border border-white" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  );
}
