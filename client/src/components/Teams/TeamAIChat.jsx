import React, { useState, useEffect, useRef } from "react";
import { Sparkles, Send, X, Bot, User, Loader2, Minimize2 } from "lucide-react";
import api from "../../api/axios"; 

const TeamAIChat = ({ teamId }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (isOpen && teamId) {
      api.get(`/api/teams/${teamId}/ai-history`)
        .then(res => setMessages(res.data))
        .catch(err => console.error("Failed to load AI history", err));
    }
  }, [isOpen, teamId]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = { content: input, is_bot: false, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await api.post(`/api/teams/${teamId}/ai-chat`, { message: userMsg.content });
      const aiMsg = { content: res.data.reply, is_bot: true, timestamp: new Date() };
      setMessages(prev => [...prev, aiMsg]);
    } catch (err) {
      const errorMsg = { content: "⚠️ Brain freeze! Try again later.", is_bot: true, timestamp: new Date() };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    // 🟢 POSITIONING FIX:
    // Mobile: bottom-[180px] (Moved higher to clear Chat Input & Nav Bar)
    // Desktop: bottom-10 (Standard corner)
    <div className="fixed bottom-[180px] right-4 md:bottom-10 md:right-10 z-[60] flex flex-col items-end font-sans pointer-events-none">
      
      <div className="pointer-events-auto">
        {/* 1. CHAT WINDOW */}
        {isOpen && (
          <div className="w-[340px] md:w-[380px] h-[500px] max-h-[50vh] md:max-h-[500px] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 zoom-in-95 origin-bottom-right mb-4">
            
            {/* Header */}
            <div className="bg-slate-900 p-4 flex justify-between items-center text-white shadow-md">
              <div className="flex items-center gap-3">
                <div className="p-1.5 bg-indigo-500 rounded-lg shadow-inner">
                  <Sparkles size={18} fill="currentColor" className="text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-sm">AI Companion</h3>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
                    <p className="text-[10px] text-slate-300 font-medium">Online</p>
                  </div>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="hover:bg-white/10 p-1.5 rounded-full transition text-slate-300 hover:text-white">
                <Minimize2 size={18} />
              </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#F8FAFC]">
              {messages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-center p-6 opacity-60">
                  <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mb-3">
                    <Bot size={32} className="text-indigo-400" />
                  </div>
                  <p className="text-sm font-bold text-slate-600">I'm up to date!</p>
                  <p className="text-xs text-slate-400 mt-1">Ask about tasks, members, or code.</p>
                </div>
              )}
              
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex gap-3 ${msg.is_bot ? 'flex-row' : 'flex-row-reverse'}`}>
                  {msg.is_bot && (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0 shadow-sm text-white mt-1">
                      <Sparkles size={14} />
                    </div>
                  )}
                  <div className={`max-w-[85%] px-4 py-3 text-sm leading-relaxed shadow-sm ${
                    msg.is_bot 
                      ? 'bg-white text-slate-700 rounded-2xl rounded-tl-none border border-slate-100' 
                      : 'bg-indigo-600 text-white rounded-2xl rounded-tr-none'
                  }`}>
                    {msg.content}
                  </div>
                </div>
              ))}
              
              {loading && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 mt-1">
                    <Sparkles size={14} />
                  </div>
                  <div className="bg-white px-4 py-3 rounded-2xl rounded-tl-none border border-slate-100 shadow-sm">
                    <Loader2 size={16} className="animate-spin text-indigo-500" />
                  </div>
                </div>
              )}
              <div ref={scrollRef} />
            </div>

            {/* Input Area */}
            <form onSubmit={handleSend} className="p-3 bg-white border-t border-slate-100 flex gap-2">
              <input 
                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition placeholder:text-slate-400"
                placeholder="Ask anything..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={loading}
              />
              <button 
                type="submit" 
                disabled={!input.trim() || loading}
                className="p-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition shadow-lg shadow-indigo-200 disabled:opacity-50 disabled:shadow-none active:scale-95"
              >
                <Send size={18} />
              </button>
            </form>
          </div>
        )}

        {/* 2. FLOATING TRIGGER BUTTON (Compact Circle) */}
        {!isOpen && (
          <button 
            onClick={() => setIsOpen(true)}
            className="group flex items-center justify-center w-14 h-14 bg-slate-900 hover:bg-black text-white rounded-full shadow-[0_8px_30px_rgba(0,0,0,0.12)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.2)] hover:scale-110 transition-all duration-300 relative"
          >
            <Sparkles size={24} className="group-hover:animate-pulse" />
            
            {/* Tooltip on Hover (Desktop Only) */}
            <span className="hidden md:block absolute right-full mr-4 bg-white text-slate-800 text-xs font-bold px-3 py-1.5 rounded-lg shadow-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none border border-slate-100">
              Ask AI Teammate
            </span>
          </button>
        )}
      </div>
    </div>
  );
};

export default TeamAIChat;