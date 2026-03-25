import React, { useRef, useEffect, useLayoutEffect, useState } from "react";
import { Loader2, Copy, Trash2, CheckCheck } from "lucide-react"; // 🟢 ADDED ICONS

const isSameDay = (date1, date2) => {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
};

const formatDateDivider = (dateString) => {
  const date = new Date(dateString);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  if (isSameDay(date, today)) return "Today";
  if (isSameDay(date, yesterday)) return "Yesterday";
  
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: date.getFullYear() !== today.getFullYear() ? "numeric" : undefined
  });
};

// 🟢 CATCHING THE NEW PROP
const MessageList = ({ messages, loadingChat, currentFriend, onLoadMore, hasMore, loadingMore, onDeleteMessage }) => {
  const containerRef = useRef(null);
  const messagesEndRef = useRef(null);
  const [prevScrollHeight, setPrevScrollHeight] = useState(0);

  useEffect(() => {
    if (messagesEndRef.current && !loadingMore) {
      messagesEndRef.current.scrollIntoView({ behavior: "auto" });
    }
  }, [messages.length, loadingMore]);

  useLayoutEffect(() => {
    if (containerRef.current && prevScrollHeight > 0) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight - prevScrollHeight;
      setPrevScrollHeight(0);
    }
  }, [messages, prevScrollHeight]);

  const handleScroll = () => {
    if (containerRef.current.scrollTop === 0 && hasMore && !loadingMore) {
      setPrevScrollHeight(containerRef.current.scrollHeight);
      if (onLoadMore) onLoadMore();
    }
  };

  if (loadingChat) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="animate-spin text-indigo-500 w-8 h-8" />
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center shadow-sm mb-4 mx-auto">
            <svg className="w-8 h-8 text-indigo-200" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
            </svg>
          </div>
          <p className="text-slate-400 text-sm italic">
            Say hello to {currentFriend.name || currentFriend.full_name}!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-4 flex flex-col"
      ref={containerRef}
      onScroll={handleScroll}
    >
      {loadingMore && (
        <div className="flex justify-center py-2 shrink-0">
          <Loader2 className="w-5 h-5 animate-spin text-indigo-400" />
        </div>
      )}

      {messages.map((msg, index) => {
        const msgDate = new Date(msg.timestamp);
        const prevMsg = index > 0 ? messages[index - 1] : null;
        const prevMsgDate = prevMsg ? new Date(prevMsg.timestamp) : null;
        const showDivider = !prevMsgDate || !isSameDay(msgDate, prevMsgDate);

        return (
          <React.Fragment key={msg.id}>
            {showDivider && (
              <div className="flex justify-center my-6 shrink-0">
                <span className="bg-slate-200/60 text-slate-500 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest shadow-sm">
                  {formatDateDivider(msg.timestamp)}
                </span>
              </div>
            )}
            
            {/* 🟢 PASSED DELETE PROP DOWN */}
            <MessageBubble message={msg} onDelete={() => onDeleteMessage(msg.id)} />
          </React.Fragment>
        );
      })}
      
      <div ref={messagesEndRef} className="shrink-0" />
    </div>
  );
};

// 🟢 UPDATED MESSAGE BUBBLE
const MessageBubble = ({ message, onDelete }) => {
  const isSender = message.is_sender;
  const [copied, setCopied] = useState(false);

  // Copy to clipboard logic
  const handleCopy = () => {
    if (message.content) {
      navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    // 🟢 Added 'group' here so hovering the row reveals the actions
    <div className={`group flex ${isSender ? "justify-end" : "justify-start"} shrink-0 items-center gap-2`}>
      
      {/* 🟢 ACTION MENU (Left side for Sender) */}
      {isSender && (
        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1.5 -mr-1">
          <button onClick={handleCopy} className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors" title="Copy Text">
            {copied ? <CheckCheck className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
          </button>
          <button onClick={onDelete} className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-full transition-colors" title="Unsend Message">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* THE ACTUAL BUBBLE */}
      <div className={`max-w-[85%] lg:max-w-[75%] px-4 py-2 rounded-2xl shadow-sm text-sm ${
        isSender 
          ? "bg-indigo-600 text-white rounded-br-none" 
          : "bg-white text-slate-800 border border-slate-100 rounded-bl-none"
      }`}>
        {message.file_url && (
          <div className="mb-2 rounded-lg overflow-hidden">
            {message.file_url.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
              <img 
                src={message.file_url} 
                className="max-h-60 rounded-md w-full object-cover" 
                alt="upload" 
                loading="lazy"
              />
            ) : (
              <a 
                href={message.file_url} 
                target="_blank" 
                rel="noopener noreferrer" 
                className={`inline-flex items-center gap-2 text-xs font-medium px-3 py-2 rounded-lg transition-colors ${
                  isSender 
                    ? 'bg-indigo-700 hover:bg-indigo-800 text-white' 
                    : 'bg-indigo-50 text-indigo-600 hover:text-indigo-700'
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Download Attachment
              </a>
            )}
          </div>
        )}
        <p className="leading-relaxed whitespace-pre-wrap break-words">{message.content}</p>
        <p className={`text-[10px] mt-1 opacity-70 ${isSender ? "text-right" : "text-left"}`}>
          {new Date(message.timestamp).toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
        </p>
      </div>

      {/* 🟢 ACTION MENU (Right side for Receiver) */}
      {!isSender && (
        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1.5 -ml-1">
          <button onClick={handleCopy} className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors" title="Copy Text">
            {copied ? <CheckCheck className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
      )}

    </div>
  );
};

export default MessageList;