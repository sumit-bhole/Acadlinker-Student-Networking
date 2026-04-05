import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Heart, Bookmark } from "lucide-react";
import GithubCard from "./GithubCard";
import { useToggleLike, useToggleSave } from "../hooks/useFeeds";

// --- HELPERS ---
const getGithubUrl = (text) => {
  if (!text) return null;
  const match = text.match(/https:\/\/github\.com\/[^\s]+/);
  return match ? match[0] : null;
};

const formatDate = (dateString) => {
  if (!dateString) return "Just now";
  try {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
    });
  } catch (e) {
    return "Recently";
  }
};

const getInitials = (name) => {
  if (!name || name === "Unknown User") return "?";
  return name.charAt(0).toUpperCase();
};

const PostCard = ({ post, onExpandImage }) => {
  // 🚀 Local state for the Instagram-style heart popup
  const [showHeartPopup, setShowHeartPopup] = useState(false);
  
  // 🚀 Hook up our optimistic mutations
  const toggleLike = useToggleLike();
  const toggleSave = useToggleSave();

  const userObj = post.user || post.author || {};
  const userName = userObj.full_name || userObj.name || post.author_name || "Unknown User";
  const userPic = userObj.profile_pic_url || userObj.profile_pic || "/default-profile.png";
  const userId = userObj.id || post.user_id;
  const githubUrl = getGithubUrl(post.description || post.content);

  // 🟢 HANDLE LIKE (With Animation Logic)
  const handleLikeAction = (isDoubleClick = false) => {
    if (isDoubleClick) {
      // Instagram behavior: Double click ALWAYS shows animation.
      // If not already liked, it likes it. If already liked, it stays liked.
      triggerHeartAnimation();
      if (!post.is_liked) {
        toggleLike.mutate(post.id);
      }
    } else {
      // Button click behavior: Toggles normally. Only animate if turning ON.
      if (!post.is_liked) triggerHeartAnimation();
      toggleLike.mutate(post.id);
    }
  };

  const triggerHeartAnimation = () => {
    setShowHeartPopup(true);
    setTimeout(() => setShowHeartPopup(false), 1000); // Hide after 1 second
  };

  // 🟢 RENDER MEDIA (With double-click detection)
  const renderMedia = () => {
    if (!post.file_url) return null;
    const ext = post.file_url.split(".").pop()?.toLowerCase() || "";
    const isImage = ["png", "jpg", "jpeg", "gif", "webp"].includes(ext) || post.file_url.includes("cloudinary");

    if (isImage) {
      return (
        <div 
          className="relative w-full bg-slate-900 border-y border-slate-100 overflow-hidden cursor-pointer select-none"
          onDoubleClick={() => handleLikeAction(true)}
        >
          <img 
            src={post.file_url} 
            alt="Post attachment" 
            loading="lazy" 
            decoding="async" 
            className="w-full h-64 sm:h-96 object-cover" 
          />
          
          {/* 🟢 INSTAGRAM-STYLE HEART POPUP */}
          {showHeartPopup && (
            <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none animate-in zoom-in duration-200 fade-in">
              <Heart className="w-24 h-24 text-white fill-white drop-shadow-2xl opacity-90 scale-up-fade" />
            </div>
          )}

          {/* Expand Image Hint (Top Right) */}
          <button 
            onClick={(e) => { e.stopPropagation(); onExpandImage(post.file_url); }}
            className="absolute top-3 right-3 bg-black/50 text-white p-1.5 rounded-lg backdrop-blur-sm hover:bg-black/70 transition-colors opacity-0 hover:opacity-100 md:opacity-100"
          >
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg>
          </button>
        </div>
      );
    }

    return (
      <div className="px-4 pb-2">
        <a href={post.file_url} target="_blank" rel="noopener noreferrer" className="mt-2 flex items-center gap-3 p-3 bg-indigo-50/50 border border-indigo-100/50 rounded-xl text-indigo-700 hover:bg-indigo-50 transition-colors group">
          <div className="p-2 bg-white rounded-lg shadow-sm group-hover:scale-110 transition-transform">📎</div>
          <span className="font-medium">Download Attachment</span>
        </a>
      </div>
    );
  };

  return (
    <div className="bg-white sm:rounded-2xl border-y sm:border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
      
      {/* 1. HEADER */}
      <div className="p-3 sm:p-4 flex items-center justify-between border-b border-slate-50">
        <div className="flex items-center gap-3">
          <Link to={`/profile/${userId}`} className="shrink-0">
            {userPic && !userPic.includes("default") ? (
              <img src={userPic} loading="lazy" alt={userName} className="w-9 h-9 sm:w-11 sm:h-11 rounded-full object-cover border border-slate-100 p-[2px] ring-2 ring-transparent hover:ring-indigo-400 transition-all" />
            ) : (
              <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-full border border-slate-100 p-[2px] ring-2 ring-transparent hover:ring-indigo-400 transition-all bg-indigo-50 flex items-center justify-center">
                <span className="text-sm sm:text-base font-black text-indigo-400">{getInitials(userName)}</span>
              </div>
            )}
          </Link>
          <div className="flex flex-col">
            <Link to={`/profile/${userId}`} className="font-bold text-slate-900 hover:text-indigo-600 transition-colors text-sm sm:text-base">
              {userName}
            </Link>
            <p className="text-[11px] sm:text-xs text-slate-500 font-medium mt-0.5">
              {formatDate(post.created_at || post.timestamp)}
            </p>
          </div>
        </div>
      </div>

      {/* 2. TEXT CONTENT */}
      <div className="px-4 pt-3 pb-3 text-sm leading-relaxed">
        {post.title && <h3 className="font-bold text-slate-900 mb-1">{post.title}</h3>}
        <span className="text-slate-700 whitespace-pre-wrap">{post.description || post.content}</span>
      </div>

      {/* 3. MEDIA & GITHUB */}
      {(githubUrl || post.file_url) && (
        <div className="w-full">
          {githubUrl && <div className="px-4 pb-3"><GithubCard repoUrl={githubUrl} /></div>}
          {renderMedia()}
        </div>
      )}

      {/* 4. ACTION BAR */}
      <div className="px-3 sm:px-4 py-3 flex items-center justify-between border-t border-slate-50 mt-1">
        <div className="flex items-center gap-5">
          {/* LIKE BUTTON */}
          {/* LIKE BUTTON */}
<button 
  onClick={() => handleLikeAction(false)}
  className="flex items-center gap-1.5 group active:scale-95 transition-transform"
>
  <Heart 
    className={`w-6 h-6 sm:w-7 sm:h-7 transition-colors ${
      post.is_liked ? "fill-pink-500 text-pink-500" : "text-slate-600 group-hover:text-pink-500"
    }`} 
  />
  {/* Added a fallback and ensured 0 is rendered */}
  <span className={`font-semibold text-sm transition-colors ${
    post.is_liked ? "text-pink-500" : "text-slate-600 group-hover:text-pink-500"
  }`}>
    {post.likes_count || 0}
  </span>
</button>
        </div>
        
        {/* SAVE BUTTON (Instant Unsave included via React Query Rollback) */}
        <button 
          onClick={() => toggleSave.mutate(post.id)}
          className="group active:scale-95 transition-transform"
        >
          <Bookmark 
            className={`w-6 h-6 sm:w-7 sm:h-7 transition-colors ${post.is_saved ? "fill-amber-500 text-amber-500" : "text-slate-600 group-hover:text-amber-500"}`} 
          />
        </button>
      </div>
    </div>
  );
};

export default PostCard;