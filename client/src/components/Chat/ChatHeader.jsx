import React, { useState, useRef, useEffect } from "react";
import { MoreVertical, User } from "lucide-react";
import { Link } from "react-router-dom";

// 🟢 SMART HELPERS FOR INITIALS
const hasValidProfilePic = (url) => {
  if (!url || typeof url !== 'string') return false;
  if (url.includes("default")) return false;
  return true;
};

const getInitials = (name) => {
  if (!name || name === "Unknown User") return "?";
  return name.charAt(0).toUpperCase();
};

const ChatHeader = ({ currentFriend, onCloseChat }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // Close the dropdown if clicking outside of it
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!currentFriend) return null;

  const userPic = currentFriend.profile_pic_url || currentFriend.profile_image;
  const userName = currentFriend.name || currentFriend.full_name || "Unknown User";
  const userId = currentFriend.id;

  return (
    <div className="h-[72px] px-4 lg:px-6 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between sticky top-0 z-20">
      
      <div className="flex items-center gap-3">
        {/* Mobile Back Button */}
        <button
          onClick={onCloseChat}
          className="lg:hidden p-2 hover:bg-slate-100 rounded-full text-slate-500 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* 🟢 CLICKABLE PROFILE AREA */}
        <Link to={`/profile/${userId}`} className="flex items-center gap-3 group">
          {hasValidProfilePic(userPic) ? (
            <img 
              src={userPic} 
              className="w-11 h-11 rounded-full object-cover shadow-sm border border-slate-100 group-hover:ring-2 ring-indigo-100 ring-offset-1 transition-all" 
              alt={userName} 
            />
          ) : (
            <div className="w-11 h-11 rounded-full bg-indigo-50 flex items-center justify-center shrink-0 border border-indigo-100 shadow-sm group-hover:ring-2 ring-indigo-200 ring-offset-1 transition-all">
              <span className="text-lg font-black text-indigo-500">{getInitials(userName)}</span>
            </div>
          )}
          
          <div>
            <h3 className="font-bold text-sm sm:text-base text-slate-900 leading-tight group-hover:text-indigo-600 transition-colors">
              {userName}
            </h3>
            {/* Removed the dummy "Active now" text */}
          </div>
        </Link>
      </div>

      {/* 🟢 3-DOTS DROPDOWN MENU */}
      <div className="relative" ref={menuRef}>
        <button 
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className={`p-2 rounded-full transition-colors ${
            isMenuOpen 
              ? 'bg-indigo-50 text-indigo-600' 
              : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
          }`}
        >
          <MoreVertical size={20} />
        </button>

        {isMenuOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-100 py-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
            <Link
              to={`/profile/${userId}`}
              className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-50 hover:text-indigo-600 transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              <User size={16} />
              View Profile
            </Link>
          </div>
        )}
      </div>

    </div>
  );
};

export default ChatHeader;