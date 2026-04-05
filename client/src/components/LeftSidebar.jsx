import React from "react";
import { Link } from "react-router-dom";
import { Bookmark, Users, FileText, Trophy, MapPin } from "lucide-react";
import { useAuth } from "../contexts/AuthContext"; // 🚀 Grabs user syncronously
import { useSidebarProfile } from "../hooks/useFeeds"; // 🚀 Hits the cache instantly

const LeftSidebar = () => {
  const { currentUser } = useAuth();
  
  // 🚀 REACT QUERY: Uses cached profile data automatically!
  const { data: profile, isLoading: loading } = useSidebarProfile(currentUser?.id);

  const userName = profile?.full_name || currentUser?.user_metadata?.full_name || "Welcome!";
  const userPic = profile?.profile_pic_url || currentUser?.user_metadata?.avatar_url;
  
  const rpPoints = profile?.rp || profile?.rp_points || profile?.reputation_points || 0;
  const friendCount = profile?.friend_count || 0;
  const postCount = profile?.post_count || 0;
  const location = profile?.location || "Pune, India";

  const getInitials = (name) => {
    if (!name || name === "Welcome!") return "?";
    return name.charAt(0).toUpperCase();
  };

  if (loading) {
    return (
      <div className="hidden lg:block lg:col-span-3 h-full">
        <div className="sticky top-16 bg-slate-50/50 h-[calc(100vh-4rem)] animate-pulse border-r border-slate-200 p-6">
           <div className="w-32 h-32 bg-slate-200 rounded-3xl mb-6"></div>
           <div className="w-40 h-6 bg-slate-200 rounded-full mb-3"></div>
           <div className="w-24 h-4 bg-slate-200 rounded-full"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="hidden lg:block lg:col-span-3 h-full">
      <div className="sticky top-16 h-[calc(100vh-4rem)] overflow-hidden relative bg-[#f8fafc] border-r border-slate-200/80">
        <div className="p-6 relative z-10">
          
          <div className="flex flex-col items-start mt-4">
            <div className="relative group">
              <div className="relative w-32 h-32 rounded-3xl border-[4px] border-white shadow-sm overflow-hidden bg-slate-100 flex items-center justify-center transition-transform duration-300">
                {userPic && !userPic.includes("default") ? (
                  <img src={userPic} alt={userName} loading="lazy" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-6xl font-black text-slate-300">{getInitials(userName)}</span>
                )}
              </div>
            </div>

            <div className="mt-6">
              <Link to={currentUser ? `/profile/${currentUser.id}` : "#"}>
                <h2 className="text-2xl font-extrabold tracking-tight text-slate-800 hover:text-slate-600 transition-colors leading-none">
                  {userName}
                </h2>
              </Link>
              <div className="flex items-center gap-1.5 mt-3 text-slate-500 text-[11px] font-bold uppercase tracking-wider bg-white shadow-sm px-2.5 py-1.5 rounded-lg border border-slate-200/60 w-fit">
                <MapPin size={14} className="text-slate-400" />
                <span>{location}</span>
              </div>
            </div>
          </div>

          <div className="mt-10 space-y-3">
            <div className="flex items-center justify-between p-3.5 bg-white rounded-xl border border-slate-200 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-slate-50 border border-slate-100 text-slate-400 rounded-lg"><Trophy size={18} strokeWidth={2.5} /></div>
                <span className="font-bold text-sm text-slate-600">Reputation</span>
              </div>
              <span className="font-black text-lg text-slate-700">{rpPoints}</span>
            </div>

            <Link to={currentUser ? `/profile/${currentUser.id}` : "#"} className="flex items-center justify-between p-3.5 bg-white rounded-xl border border-slate-200 hover:bg-slate-50 transition-all duration-200 group shadow-sm">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-slate-50 border border-slate-100 text-slate-400 rounded-lg group-hover:text-slate-600"><Users size={18} strokeWidth={2.5} /></div>
                <span className="font-bold text-sm text-slate-600">Network</span>
              </div>
              <span className="font-black text-lg text-slate-700">{friendCount}</span>
            </Link>

            <Link to={currentUser ? `/profile/${currentUser.id}` : "#"} className="flex items-center justify-between p-3.5 bg-white rounded-xl border border-slate-200 hover:bg-slate-50 transition-all duration-200 group shadow-sm">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-slate-50 border border-slate-100 text-slate-400 rounded-lg group-hover:text-slate-600"><FileText size={18} strokeWidth={2.5} /></div>
                <span className="font-bold text-sm text-slate-600">Posts</span>
              </div>
              <span className="font-black text-lg text-slate-700">{postCount}</span>
            </Link>
          </div>

          <div className="mt-6">
            <Link to="/saved" className="flex items-center justify-center gap-2 w-full py-3.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-sm font-bold transition-all shadow-sm active:scale-95">
              <Bookmark size={16} fill="currentColor" /> Saved Items
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
};

export default LeftSidebar;