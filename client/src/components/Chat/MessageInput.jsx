import React, { useRef, useEffect } from "react";
import { Send, Paperclip, X } from "lucide-react";

const MessageInput = ({ 
  newMessageContent, 
  selectedFile, 
  onContentChange, 
  onFileSelect, 
  onRemoveFile, 
  onSendMessage, 
  disabled 
}) => {
  const textareaRef = useRef(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "inherit";
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = Math.min(scrollHeight, 200) + "px";
    }
  }, [newMessageContent]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSendMessage();
    }
  };

  return (
    <div className="p-3 lg:p-4 bg-[#f1f5f9]">
      <div className="max-w-4xl mx-auto relative">
        {selectedFile && (
          <div className="absolute bottom-full left-0 mb-2 p-2 bg-white border rounded-xl shadow-lg flex items-center animate-in fade-in slide-in-from-bottom-2">
            <span className="text-xs font-medium px-2 text-indigo-600 truncate max-w-[150px] lg:max-w-[200px]">
              {selectedFile.name}
            </span>
            <button 
              onClick={onRemoveFile} 
              className="p-1 hover:bg-slate-100 rounded-full text-slate-400"
              aria-label="Remove file"
            >
              <X size={14}/>
            </button>
          </div>
        )}

        <div className="relative bg-white border border-slate-200 rounded-2xl shadow-sm lg:shadow-xl focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-500 transition-all overflow-hidden">
          <textarea
            ref={textareaRef}
            rows="1"
            value={newMessageContent}
            onChange={(e) => onContentChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message..."
            className="w-full pl-4 pr-20 lg:pr-24 py-3 lg:py-4 bg-transparent border-none focus:ring-0 resize-none text-sm leading-relaxed max-h-[200px]"
            disabled={disabled}
          />
          
          <div className="absolute right-2 lg:right-3 bottom-2 lg:bottom-3 flex items-center gap-1 lg:gap-2">
            <input 
              type="file" 
              id="file-upload" 
              className="hidden" 
              onChange={(e) => e.target.files[0] && onFileSelect(e.target.files[0])} 
            />
            <label 
              htmlFor="file-upload" 
              className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl cursor-pointer transition"
              aria-label="Attach file"
            >
              <Paperclip size={18} />
            </label>
            <button
              onClick={onSendMessage}
              disabled={disabled || (!newMessageContent.trim() && !selectedFile)}
              className={`p-2 lg:p-2.5 rounded-xl transition-all ${
                (newMessageContent.trim() || selectedFile) && !disabled
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-200 hover:bg-indigo-700 active:scale-95" 
                  : "bg-slate-100 text-slate-300"
              }`}
              aria-label="Send message"
            >
              <Send size={16} />
            </button>
          </div>
        </div>
        <p className="text-[10px] text-center text-slate-400 mt-2 px-2">
          Press Enter to send, Shift + Enter for new line
        </p>
      </div>
    </div>
  );
};

export default MessageInput;