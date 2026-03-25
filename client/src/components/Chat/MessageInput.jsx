import React, { useRef, useEffect } from "react";
import { Send, Paperclip, X, Image as ImageIcon } from "lucide-react";

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

  // Auto-resize logic (Fixed to shrink when deleting text)
  useEffect(() => {
    if (textareaRef.current) {
      // Reset height to auto first to calculate shrinkage
      textareaRef.current.style.height = "auto";
      const scrollHeight = textareaRef.current.scrollHeight;
      // Cap the maximum height at 150px
      textareaRef.current.style.height = Math.min(scrollHeight, 150) + "px";
    }
  }, [newMessageContent]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!disabled && (newMessageContent.trim() || selectedFile)) {
        onSendMessage();
      }
    }
  };

  const isSendActive = (newMessageContent.trim() || selectedFile) && !disabled;

  return (
    <div className="bg-white border-t border-slate-200 px-2 py-3 lg:px-6 lg:py-4 z-20">
      
      <div className="max-w-5xl mx-auto relative flex items-end gap-2 sm:gap-3">
        
        {/* 🟢 SLEEK FLOATING FILE PREVIEW */}
        {selectedFile && (
          <div className="absolute bottom-full left-12 mb-4 bg-white border border-slate-200 rounded-2xl shadow-xl p-2 pr-3 flex items-center gap-3 animate-in slide-in-from-bottom-2 fade-in duration-200 z-30">
            <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 shrink-0">
              {selectedFile.type.startsWith('image/') ? <ImageIcon size={20} /> : <Paperclip size={20} />}
            </div>
            <div className="flex flex-col min-w-[100px] max-w-[150px] sm:max-w-[200px]">
              <span className="text-xs font-bold text-slate-700 truncate">{selectedFile.name}</span>
              <span className="text-[10px] text-slate-400 font-medium">Ready to send</span>
            </div>
            <button 
              onClick={onRemoveFile} 
              className="w-7 h-7 flex items-center justify-center bg-slate-100 hover:bg-rose-100 hover:text-rose-600 rounded-full text-slate-500 transition-colors ml-1 shrink-0"
              aria-label="Remove file"
            >
              <X size={14}/>
            </button>
          </div>
        )}

        {/* 🟢 ATTACHMENT BUTTON (Outside Left) */}
        <input 
          type="file" 
          id="file-upload" 
          className="hidden" 
          accept="image/png, image/jpeg, image/jpg, image/webp, application/pdf, .doc, .docx"
          onChange={(e) => e.target.files[0] && onFileSelect(e.target.files[0])} 
        />
        <label 
          htmlFor="file-upload" 
          className="p-3 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full cursor-pointer transition-colors shrink-0 mb-0.5"
          aria-label="Attach file"
        >
          <Paperclip size={22} className="transform -rotate-45" />
        </label>

        {/* 🟢 THE TEXT INPUT PILL */}
        <div className="flex-1 bg-slate-100 hover:bg-slate-200/50 focus-within:bg-white focus-within:ring-2 focus-within:ring-indigo-100 focus-within:border-indigo-300 border border-transparent transition-all rounded-[24px] overflow-hidden relative shadow-sm inset-ring">
          <textarea
            ref={textareaRef}
            rows="1"
            value={newMessageContent}
            onChange={(e) => onContentChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Message..."
            disabled={disabled}
            className="w-full bg-transparent py-3.5 px-5 resize-none outline-none text-[15px] text-slate-800 placeholder-slate-500 block custom-scrollbar m-0"
            style={{
              scrollbarWidth: 'none', /* Firefox */
              msOverflowStyle: 'none'  /* IE/Edge */
            }}
          />
          {/* Hide Webkit scrollbar for ultra-clean look */}
          <style>{`
            textarea::-webkit-scrollbar { display: none; }
          `}</style>
        </div>

        {/* 🟢 CIRCULAR SEND BUTTON (Outside Right) */}
        <button
          onClick={onSendMessage}
          disabled={!isSendActive}
          className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 mb-0.5 transition-all duration-200 ${
            isSendActive
              ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:scale-105 active:scale-95" 
              : "bg-slate-100 text-slate-400 cursor-not-allowed"
          }`}
          aria-label="Send message"
        >
          {/* Placed slightly off-center to make the paper plane look optically balanced */}
          <Send size={20} className={`transform transition-transform ${isSendActive ? 'translate-x-0.5 -translate-y-0.5' : ''}`} />
        </button>
        
      </div>
    </div>
  );
};

export default MessageInput;