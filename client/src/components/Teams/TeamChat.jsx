import React, { useState, useEffect, useRef } from "react";
import { Send, Loader2, MessageSquare, Smile, Lock } from "lucide-react";
import { getTeamChat, sendTeamMessage, getTeamDetails } from "../../api/teamApi";

const TeamChat = ({ teamId }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [isMember, setIsMember] = useState(false); // Track membership status
  const messagesEndRef = useRef(null);

  // Fetch Team Details to check membership
  useEffect(() => {
    const checkMembership = async () => {
      try {
        const res = await getTeamDetails(teamId);
        setIsMember(res.data.is_member);
      } catch (err) {
        console.error("Failed to check membership", err);
        setIsMember(false); // Default to false on error
      }
    };
    checkMembership();
  }, [teamId]);

  const fetchMessages = async () => {
    if (!isMember) return; // Don't fetch if not a member

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
    if (isMember) {
      fetchMessages();
      const interval = setInterval(fetchMessages, 3000);
      return () => clearInterval(interval);
    } else {
        setLoading(false); // Stop loading if not a member
    }
  }, [teamId, isMember]);

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
        profile_pic: null, 
      },
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, tempMsg]);
    setNewMessage("");
    setSending(true);

    try {
      await sendTeamMessage(teamId, newMessage);
      fetchMessages();
    } catch (err) {
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
      alert("Failed to send message");
    } finally {
      setSending(false);
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-full bg-slate-50">
        <Loader2 className="animate-spin text-indigo-600" size={32} />
      </div>
    );

  // Render Lock Screen for Non-Members
  if (!isMember) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-slate-50 p-6 text-center rounded-2xl border border-slate-200">
        <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center text-slate-500 mb-4">
          <Lock size={32} />
        </div>
        <h3 className="text-lg font-bold text-slate-800">Team Chat Locked</h3>
        <p className="text-slate-500 mt-2 max-w-sm">
          You must be a member of this team to view and send messages. Please join the team first.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[#f0f2f5] md:rounded-tl-2xl overflow-hidden relative">
      {/* Header */}
      <div className="px-4 py-3 md:px-6 md:py-4 bg-white border-b border-slate-200 flex items-center justify-between shadow-sm z-10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 md:w-10 md:h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600">
            <MessageSquare size={18} md:size={20} />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 leading-tight text-sm md:text-base">Team Chat</h3>
            {/* Removed Online Indicator */}
             <p className="text-[10px] md:text-xs text-slate-500 font-medium">
              Members only
            </p>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 md:space-y-6 scroll-smooth bg-[#eef0f5]">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-400 space-y-3 opacity-60">
            <MessageSquare size={48} md:size={64} />
            <p className="text-xs md:text-sm font-medium">No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.is_me;
            const time = new Date(msg.timestamp).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            });

            return (
              <div
                key={msg.id}
                className={`flex gap-2 md:gap-3 w-full ${isMe ? "flex-row-reverse" : "flex-row"}`}
              >
                {/* 1. Avatar (Always Visible) */}
                <div className="flex-shrink-0">
                  {msg.sender.profile_pic ? (
                    <img
                      src={msg.sender.profile_pic}
                      className="w-8 h-8 md:w-8 md:h-8 rounded-full object-cover border border-white shadow-sm"
                      alt={msg.sender.full_name}
                    />
                  ) : (
                    <div className="w-8 h-8 md:w-8 md:h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-[10px] md:text-xs font-bold border border-indigo-200">
                      {msg.sender.full_name[0]}
                    </div>
                  )}
                </div>

                {/* 2. Message Content */}
                <div className={`flex flex-col max-w-[85%] md:max-w-[75%] ${isMe ? "items-end" : "items-start"}`}>
                  {/* Name & Time Label */}
                  <div className={`flex items-center gap-2 mb-1 ${isMe ? "flex-row-reverse" : "flex-row"}`}>
                    <span className="text-[10px] md:text-[11px] font-bold text-slate-700">
                      {isMe ? "You" : msg.sender.full_name}
                    </span>
                    <span className="text-[8px] md:text-[9px] text-slate-400">{time}</span>
                  </div>

                  {/* Bubble */}
                  <div
                    className={`px-3 py-2 md:px-4 md:py-2.5 shadow-sm text-xs md:text-sm leading-relaxed break-words rounded-2xl ${
                      isMe
                        ? "bg-indigo-600 text-white rounded-tr-none"
                        : "bg-white text-slate-800 rounded-tl-none border border-slate-100"
                    }`}
                  >
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
      <form
        onSubmit={handleSend}
        className="p-3 md:p-4 bg-white border-t border-slate-200 flex items-end gap-2 md:gap-3 sticky bottom-0 z-20"
      >
        <div className="flex-1 bg-slate-100 rounded-2xl flex items-center px-3 py-2 md:px-4 md:py-3 border border-transparent focus-within:border-indigo-300 focus-within:bg-white transition-all focus-within:ring-2 md:focus-within:ring-4 focus-within:ring-indigo-50/50">
          <input
            className="flex-1 bg-transparent text-xs md:text-sm outline-none text-slate-800 placeholder:text-slate-400"
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            disabled={sending}
          />
          <button type="button" className="text-slate-400 hover:text-indigo-600 transition ml-2 hidden md:block">
            <Smile size={20} />
          </button>
        </div>

        <button
          type="submit"
          disabled={!newMessage.trim() || sending}
          className="p-2 md:p-3 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 disabled:opacity-50 disabled:hover:bg-indigo-600 transition shadow-lg shadow-indigo-200 active:scale-95 flex-shrink-0"
        >
          {sending ? <Loader2 size={16} md:size={20} className="animate-spin" /> : <Send size={16} md:size={20} className="ml-0.5" />}
        </button>
      </form>
    </div>
  );
};

export default TeamChat;