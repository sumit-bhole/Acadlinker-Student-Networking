import React, { useState } from "react";
import { MessageSquare, Search } from "lucide-react";

// 🟢 SMART HELPERS
const hasValidProfilePic = (url) => {
  if (!url || typeof url !== 'string') return false;
  if (url.includes("default")) return false;
  return true;
};

const getInitials = (name) => {
  if (!name) return "?";
  return name.charAt(0).toUpperCase();
};

// Time formatter for the sidebar preview
const formatPreviewTime = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  if (date.toDateString() === today.toDateString()) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } else if (date.toDateString() === yesterday.toDateString()) {
    return "Yesterday";
  } else {
    return date.toLocaleDateString("en-US", { month: 'short', day: 'numeric' });
  }
};

const Sidebar = ({ friends, loadingFriends, currentFriend, onFriendSelect, onRefreshChat }) => {
  const [searchQuery, setSearchQuery] = useState("");

  // 🟢 REMOVED FRONTEND SORTING: The backend and ChatApp handle it perfectly now!
  const filteredFriends = friends.filter(friend => {
    const name = friend.name || friend.full_name || friend.username || "";
    return name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="w-full lg:w-80 xl:w-96 flex flex-col bg-white border-r border-slate-200 h-full">
      <div className="p-4 lg:p-6 border-b border-slate-100 shrink-0">
        <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent flex items-center">
          <MessageSquare className="w-6 h-6 mr-2 text-indigo-600" />
          Chats
        </h1>
      </div>

      <div className="p-3 lg:p-4 border-b border-slate-100 shrink-0">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search friends..." 
            className="w-full pl-10 pr-4 py-2.5 bg-slate-100 border-none rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {loadingFriends ? (
          <div className="flex justify-center p-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
          </div>
        ) : filteredFriends.length === 0 ? (
          <p className="text-slate-500 text-center mt-10 text-sm px-4">
            {searchQuery ? "No friends found." : "No chats yet."}
          </p>
        ) : (
          filteredFriends.map((friend) => (
            <FriendListItem
              key={friend.id}
              friend={friend}
              isActive={currentFriend?.id === friend.id}
              onClick={() => {
                if (currentFriend?.id === friend.id) {
                  onRefreshChat(friend.id);
                } else {
                  onFriendSelect(friend);
                }
              }}
            />
          ))
        )}
      </div>
    </div>
  );
};

const FriendListItem = ({ friend, isActive, onClick }) => {
  const userPic = friend.profile_pic_url || friend.profile_image;
  const userName = friend.name || friend.full_name || friend.username || "Unknown User";
  
  // 🟢 Cleaned up fallback logic
  const lastMessage = friend.last_message || "Start a conversation...";
  const unreadCount = friend.unread_count || 0; 

  return (
    <div
      onClick={onClick}
      className={`flex items-center px-4 lg:px-5 py-3.5 lg:py-4 cursor-pointer transition-all border-l-4 ${
        isActive 
          ? "bg-indigo-50/80 border-indigo-600 shadow-sm" 
          : "border-transparent hover:bg-slate-50"
      }`}
    >
      <div className="relative shrink-0">
        {hasValidProfilePic(userPic) ? (
          <img 
            src={userPic} 
            className="w-12 h-12 rounded-full object-cover shadow-sm border border-slate-100" 
            alt={userName} 
          />
        ) : (
          <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center border border-indigo-50 shadow-sm">
            <span className="text-xl font-black text-indigo-500">{getInitials(userName)}</span>
          </div>
        )}
      </div>
      
      <div className="ml-3.5 overflow-hidden flex-1 min-w-0">
        <div className="flex justify-between items-baseline mb-0.5">
          <h3 className="font-bold text-slate-900 truncate text-[15px]">
            {userName}
          </h3>
          
          {friend.last_message_time && (
            <span className={`text-[11px] shrink-0 ml-2 font-medium ${unreadCount > 0 ? 'text-indigo-600 font-bold' : 'text-slate-400'}`}>
              {formatPreviewTime(friend.last_message_time)}
            </span>
          )}
        </div>
        
        <div className="flex justify-between items-center gap-2">
          <p className={`text-xs truncate ${unreadCount > 0 ? 'text-slate-800 font-bold' : 'text-slate-500 font-medium'}`}>
            {lastMessage}
          </p>
          
          {unreadCount > 0 && (
            <span className="shrink-0 w-5 h-5 bg-indigo-600 text-white text-[10px] font-bold flex items-center justify-center rounded-full shadow-sm">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;