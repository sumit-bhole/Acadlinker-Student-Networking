import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { 
  Bookmark, 
  Users, 
  FileText, 
  Trophy, 
  MapPin
} from "lucide-react";
import AuthService from "../api/auth";
import api from "../api/axios";

const LeftSidebar = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSidebarData = async () => {
      setLoading(true);
      try {
        const user = await AuthService.getCurrentUser();
        setCurrentUser(user);

        if (user?.id) {
          const res = await api.get(`/api/profile/${user.id}`);
          setProfile(res.data);
        }
      } catch (err) {
        console.error("Error fetching profile summary:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSidebarData();
  }, []);

  const userName = profile?.full_name || currentUser?.user_metadata?.full_name || "Welcome!";
  const userPic = profile?.profile_pic_url || currentUser?.user_metadata?.avatar_url || "/default-profile.png";
  const rpPoints = profile?.rp || profile?.rp_points || profile?.reputation_points || 0;
  const friendCount = profile?.friend_count || 0;
  const postCount = profile?.post_count || 0;
  const location = profile?.location || "Pune, India";

  if (loading) {
    return (
      <div className="hidden lg:block lg:col-span-3 h-full">
        <div className="sticky top-16 bg-slate-50 h-[calc(100vh-4rem)] animate-pulse border-r border-slate-200"></div>
      </div>
    );
  }

  return (
    <div className="hidden lg:block lg:col-span-3 h-full">
      
      <div className="sticky top-16 h-[calc(100vh-4rem)] overflow-hidden relative bg-slate-50 border-r border-slate-200">
        
        {/* Decorative Background Glows */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-100/50 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-100/50 rounded-full blur-3xl pointer-events-none"></div>

        <div className="p-6 relative z-10">
          
          {/* =======================
              1. LEFT-ALIGNED BIG PROFILE 
              ======================= */}
          <div className="flex flex-col items-start mt-4">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-tr from-indigo-200 to-purple-200 rounded-3xl blur opacity-60 group-hover:opacity-80 transition-opacity"></div>
              <img 
                src={userPic} 
                alt={userName} 
                className="relative w-32 h-32 rounded-3xl object-cover border-4 border-white shadow-md"
              />
            </div>

            <div className="mt-6">
              <Link to={currentUser ? `/profile/${currentUser.id}` : "#"}>
                <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 hover:text-indigo-600 transition-colors">
                  {userName}
                </h2>
              </Link>
              <div className="flex items-center gap-2 mt-1.5 text-slate-500 text-sm font-medium">
                <MapPin size={14} />
                <span>{location}</span>
              </div>
            </div>
          </div>

          {/* =======================
              2. SLEEK STATS ROWS 
              ======================= */}
          <div className="mt-10 space-y-3">
            <div className="flex items-center justify-between p-3.5 bg-white rounded-xl border border-slate-200 hover:border-indigo-200 hover:shadow-sm transition-all group cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-50 text-amber-600 rounded-lg group-hover:scale-110 transition-transform">
                  <Trophy size={18} strokeWidth={2.5} />
                </div>
                <span className="font-bold text-slate-700">Reputation</span>
              </div>
              <span className="font-bold text-lg text-slate-900">{rpPoints}</span>
            </div>

            <Link to={currentUser ? `/profile/${currentUser.id}` : "#"} className="flex items-center justify-between p-3.5 bg-white rounded-xl border border-slate-200 hover:border-indigo-200 hover:shadow-sm transition-all group cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg group-hover:scale-110 transition-transform">
                  <Users size={18} strokeWidth={2.5} />
                </div>
                <span className="font-bold text-slate-700">Network</span>
              </div>
              <span className="font-bold text-lg text-slate-900">{friendCount}</span>
            </Link>

            <Link to={currentUser ? `/profile/${currentUser.id}` : "#"} className="flex items-center justify-between p-3.5 bg-white rounded-xl border border-slate-200 hover:border-indigo-200 hover:shadow-sm transition-all group cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-50 text-purple-600 rounded-lg group-hover:scale-110 transition-transform">
                  <FileText size={18} strokeWidth={2.5} />
                </div>
                <span className="font-bold text-slate-700">Posts</span>
              </div>
              <span className="font-bold text-lg text-slate-900">{postCount}</span>
            </Link>
          </div>

          <div className="mt-6">
            <Link to="/saved" className="flex items-center justify-center gap-2 w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all shadow-md shadow-indigo-200 active:scale-95">
              <Bookmark size={16} fill="currentColor" />
              Saved Items
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
};

export default LeftSidebar;