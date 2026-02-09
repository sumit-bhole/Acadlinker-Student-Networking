import React, { useRef, useEffect } from "react";
import { Loader2 } from "lucide-react";

const MessageList = ({ messages, loadingChat, currentFriend }) => {
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (loadingChat) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="animate-spin text-indigo-500" />
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
    <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-4">
      {messages.map((msg) => (
        <MessageBubble key={msg.id} message={msg} />
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
};

const MessageBubble = ({ message }) => {
  const isSender = message.is_sender;

  return (
    <div className={`flex ${isSender ? "justify-end" : "justify-start"}`}>
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
                className="inline-flex items-center gap-2 text-xs text-indigo-600 hover:text-indigo-700 font-medium px-3 py-2 bg-indigo-50 rounded-lg"
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
    </div>
  );
};

export default MessageList;