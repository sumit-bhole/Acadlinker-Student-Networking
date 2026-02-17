import React, { useState, useEffect, useRef } from "react";
import { Send, Loader2, MessageSquare, User, Smile } from "lucide-react";
import { getTeamChat, sendTeamMessage } from "../../api/teamApi";

const TeamChat = ({ teamId }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  const fetchMessages = async () => {
    try {
      const res = await getTeamChat(teamId);
      setMessages(res.data);
    } catch (err) {
      console.error("Failed to load chat", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 3000); 
    return () => clearInterval(interval);
  }, [teamId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const tempId = Date.now();
    const tempMsg = {
      id: tempId,
      content: newMessage,
      is_me: true,
      sender: { 
        full_name: "Me", 
        // Ideally, we get the real profile pic from context/auth, 
        // but for now, the backend sync will fix it quickly.
        profile_pic: null 
      },
      timestamp: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, tempMsg]);
    setNewMessage("");
    setSending(true);

    try {
      await sendTeamMessage(teamId, newMessage);
      fetchMessages(); 
    } catch (err) {
      setMessages(prev => prev.filter(m => m.id !== tempId));
      alert("Failed to send message");
    } finally {
      setSending(false);
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center h-full bg-slate-50">
      <Loader2 className="animate-spin text-indigo-600" size={32} />
    </div>
  );

  return (
    <div className="flex flex-col h-full bg-[#f0f2f5] md:rounded-tl-2xl overflow-hidden relative">
      
      {/* Header */}
      <div className="px-6 py-4 bg-white border-b border-slate-200 flex items-center justify-between shadow-sm z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600">
            <MessageSquare size={20} />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 leading-tight">Team Chat</h3>
            <p className="text-xs text-green-600 font-medium flex items-center gap-1">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span> Online
            </p>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 scroll-smooth bg-[#eef0f5]">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-400 space-y-3 opacity-60">
            <MessageSquare size={64} />
            <p className="text-sm font-medium">No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.is_me;
            const time = new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

            return (
              // Use flex-row-reverse for 'Me' to put Avatar on the RIGHT
              <div key={msg.id} className={`flex gap-3 w-full ${isMe ? "flex-row-reverse" : "flex-row"}`}>
                
                {/* 1. Avatar (Always Visible) */}
                <div className="flex-shrink-0">
                  {msg.sender.profile_pic ? (
                    <img 
                      src={msg.sender.profile_pic} 
                      className="w-8 h-8 rounded-full object-cover border border-white shadow-sm" 
                      alt={msg.sender.full_name} 
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-xs font-bold border border-indigo-200">
                      {msg.sender.full_name[0]}
                    </div>
                  )}
                </div>

                {/* 2. Message Content */}
                <div className={`flex flex-col max-w-[75%] ${isMe ? "items-end" : "items-start"}`}>
                  
                  {/* Name & Time Label */}
                  <div className={`flex items-center gap-2 mb-1 ${isMe ? "flex-row-reverse" : "flex-row"}`}>
                    <span className="text-[11px] font-bold text-slate-700">
                      {isMe ? "You" : msg.sender.full_name}
                    </span>
                    <span className="text-[9px] text-slate-400">
                      {time}
                    </span>
                  </div>

                  {/* Bubble */}
                  <div className={`px-4 py-2.5 shadow-sm text-sm leading-relaxed break-words rounded-2xl ${
                    isMe 
                      ? "bg-indigo-600 text-white rounded-tr-none" 
                      : "bg-white text-slate-800 rounded-tl-none border border-slate-100"
                  }`}>
                    {msg.content}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <form onSubmit={handleSend} className="p-4 bg-white border-t border-slate-200 flex items-end gap-3 sticky bottom-0 z-20">
        <div className="flex-1 bg-slate-100 rounded-2xl flex items-center px-4 py-3 border border-transparent focus-within:border-indigo-300 focus-within:bg-white transition-all focus-within:ring-4 focus-within:ring-indigo-50/50">
          <input
            className="flex-1 bg-transparent text-sm outline-none text-slate-800 placeholder:text-slate-400"
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            disabled={sending}
          />
          <button type="button" className="text-slate-400 hover:text-indigo-600 transition ml-2">
            <Smile size={20} />
          </button>
        </div>
        
        <button 
          type="submit" 
          disabled={!newMessage.trim() || sending}
          className="p-3 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 disabled:opacity-50 disabled:hover:bg-indigo-600 transition shadow-lg shadow-indigo-200 active:scale-95"
        >
          {sending ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} className="ml-0.5" />}
        </button>
      </form>
    </div>
  );
};

export default TeamChat;