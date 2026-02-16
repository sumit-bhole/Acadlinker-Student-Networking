import React, { useState, useEffect, useRef } from "react";
import { Send, Loader2 } from "lucide-react";
import { getTeamChat, sendTeamMessage } from "../../api/teamApi";

const TeamChat = ({ teamId }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
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
    // Poll for new messages every 3 seconds (Simple real-time)
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, [teamId]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      await sendTeamMessage(teamId, newMessage);
      setNewMessage("");
      fetchMessages(); // Refresh immediately
    } catch (err) {
      alert("Failed to send");
    }
  };

  if (loading) return <div className="flex justify-center p-10"><Loader2 className="animate-spin text-indigo-600" /></div>;

  return (
    <div className="flex flex-col h-[600px] bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
        {messages.length === 0 && (
          <p className="text-center text-slate-400 text-sm mt-10">No messages yet. Start the conversation!</p>
        )}
        {messages.map((msg) => (
          <div key={msg.id} className={`flex gap-3 ${msg.is_me ? "flex-row-reverse" : ""}`}>
            <img 
              src={msg.sender.profile_pic || "/default-profile.png"} 
              className="w-8 h-8 rounded-full bg-slate-200 object-cover" 
              alt={msg.sender.full_name}
            />
            <div className={`max-w-[70%] ${msg.is_me ? "items-end" : "items-start"} flex flex-col`}>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold text-slate-700">{msg.sender.full_name}</span>
                <span className="text-[10px] text-slate-400">
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <div 
                className={`px-4 py-2 rounded-2xl text-sm ${
                  msg.is_me 
                    ? "bg-indigo-600 text-white rounded-tr-none" 
                    : "bg-white border border-slate-200 text-slate-800 rounded-tl-none"
                }`}
              >
                {msg.content}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <form onSubmit={handleSend} className="p-3 bg-white border-t border-slate-200 flex gap-2">
        <input
          className="flex-1 px-4 py-2 bg-slate-100 rounded-full text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition"
          placeholder="Type a message to the team..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
        />
        <button 
          type="submit" 
          disabled={!newMessage.trim()}
          className="p-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 disabled:opacity-50 transition"
        >
          <Send size={18} />
        </button>
      </form>
    </div>
  );
};

export default TeamChat;