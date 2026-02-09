import React from "react";
import { MoreVertical } from "lucide-react";

const ChatHeader = ({ currentFriend, onCloseChat }) => {
  return (
    <div className="h-16 px-4 lg:px-6 bg-white border-b border-slate-200 flex items-center justify-between">
      <div className="flex items-center">
        <button
          onClick={onCloseChat}
          className="lg:hidden mr-3 p-1 hover:bg-slate-100 rounded-full transition"
        >
          <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <img 
          src={currentFriend.profile_pic_url || currentFriend.profile_image || "/default-profile.png"} 
          className="w-10 h-10 rounded-full object-cover" 
          alt="avatar" 
        />
        <div className="ml-3">
          <h3 className="font-bold text-sm text-slate-900 leading-tight">
            {currentFriend.name || currentFriend.full_name}
          </h3>
          <span className="text-[11px] text-green-500 font-medium italic">Active now</span>
        </div>
      </div>
      <button className="text-slate-400 hover:text-slate-600 p-2 hover:bg-slate-100 rounded-full transition">
        <MoreVertical size={20}/>
      </button>
    </div>
  );
};

export default ChatHeader;