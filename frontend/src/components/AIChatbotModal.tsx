import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { MessageSquare, Send, X, Bot, Sparkles } from 'lucide-react';

interface ChatMessage {
  sender: 'user' | 'bot';
  text: string;
  timestamp: Date;
}

export const AIChatbotModal: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      sender: 'bot',
      text: 'Hi! I am your VetConnect AI Assistant. Ask me anything about pet care, symptoms (fever, vomiting), vaccines, or diet!',
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  const suggestions = [
    'Pet has fever',
    'Dog is vomiting',
    'Vaccination details',
    'Dangerous foods to avoid',
  ];

  const handleSend = async (text: string) => {
    if (!text.trim()) return;

    // Append User Message
    const userMsg: ChatMessage = { sender: 'user', text, timestamp: new Date() };
    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setLoading(true);

    try {
      const res = await axios.post('/chat/bot', { message: text });
      
      // Typewriter simulation delay
      setTimeout(() => {
        const botMsg: ChatMessage = {
          sender: 'bot',
          text: res.data.reply,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, botMsg]);
        setLoading(false);
      }, 500);
    } catch (err) {
      console.error(err);
      const errorMsg: ChatMessage = {
        sender: 'bot',
        text: 'Sorry, I am having trouble connecting to my brain. Please try again.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMsg]);
      setLoading(false);
    }
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  return (
    <>
      {/* Floating Chat Icon */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 bg-primary hover:bg-primary-dark text-white rounded-full p-4 flex items-center justify-center shadow-lg hover:shadow-primary-dark/50 hover:shadow-xl transition-all duration-300 hover:scale-105 active:scale-95 group font-bold"
      >
        <Sparkles className="h-6 w-6 text-white group-hover:rotate-12 transition-transform duration-200" />
        <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-500 ease-out whitespace-nowrap ml-0 group-hover:ml-2 text-sm uppercase font-sans">
          AI Vet Bot
        </span>
      </button>

      {/* Floating Chat Drawer */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-40 w-full max-w-sm glass-panel rounded-2xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 flex flex-col h-[500px] animate-fade-in text-slate-800 dark:text-slate-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary to-secondary p-4 flex justify-between items-center text-white">
            <div className="flex items-center space-x-2">
              <Bot className="h-6 w-6 animate-float" />
              <div>
                <h3 className="font-extrabold text-sm tracking-tight font-sans">VetConnect AI Assistant</h3>
                <span className="text-[9px] opacity-80 leading-none">Instant Pet Care Guide</span>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-white/10 rounded-full transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Messages Feed */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50/50 dark:bg-slate-900/50">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[80%] rounded-2xl p-3 text-xs leading-relaxed shadow-sm ${
                    msg.sender === 'user'
                      ? 'bg-primary text-white rounded-tr-none'
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-tl-none border border-slate-100 dark:border-slate-800'
                  }`}
                >
                  <p>{msg.text}</p>
                  <span className={`text-[8px] mt-1 block text-right opacity-60 ${msg.sender === 'user' ? 'text-white/80' : 'text-slate-400'}`}>
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white dark:bg-slate-800 text-slate-400 rounded-2xl rounded-tl-none p-3 text-xs border border-slate-100 dark:border-slate-800 shadow-sm flex items-center space-x-1.5">
                  <span className="h-1.5 w-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="h-1.5 w-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="h-1.5 w-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Quick Suggestions */}
          {messages.length === 1 && (
            <div className="p-3 border-t border-slate-100 dark:border-slate-850 flex flex-wrap gap-1.5 bg-white dark:bg-slate-850">
              {suggestions.map((s, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(s)}
                  className="bg-slate-100 dark:bg-slate-800 hover:bg-primary hover:text-white dark:hover:bg-primary border-none rounded-full py-1 px-2.5 text-[10px] font-medium text-slate-600 dark:text-slate-300 transition-all cursor-pointer"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Input Panel */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend(inputText);
            }}
            className="p-3 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 flex items-center space-x-2"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Ask a question..."
              className="flex-1 bg-slate-100 dark:bg-slate-800 border-none rounded-xl py-2 px-3 text-xs focus:outline-none focus:ring-2 focus:ring-primary text-slate-800 dark:text-slate-100"
            />
            <button
              type="submit"
              disabled={!inputText.trim()}
              className="bg-primary hover:bg-primary-dark text-white rounded-xl p-2 shadow-sm hover:shadow-md transition-all disabled:opacity-40"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
};
