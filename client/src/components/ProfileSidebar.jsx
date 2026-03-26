import React, { useState } from "react";
import { FaCheck, FaEdit, FaCamera } from "react-icons/fa";
import { MapPin, Link as LinkIcon, GraduationCap, Calendar, Layers } from "lucide-react";

const ProfileSidebar = ({
  user,
  isCurrentUser,
  getInitials,
  hasValidProfilePic,
  renderFriendButton,
  openAvatarModal,
  openBasicInfoModal,
  openContactModal,
  openSkillsModal,
  openDetailsModal
}) => {
  // 🟢 NEW: State to toggle expanding the skills list
  const [showAllSkills, setShowAllSkills] = useState(false);

  // Parse skills safely
  const allSkills = user.skills ? user.skills.split(",").map(s => s.trim()).filter(Boolean) : [];
  const displayedSkills = showAllSkills ? allSkills : allSkills.slice(0, 6);
  const hiddenCount = allSkills.length - 6;

  return (
    // 🟢 WIDER & COLOR ENHANCED: Increased width to 380px/420px so content doesn't leak. Added a richer, softer background gradient wash.
    <div className="w-full md:w-[380px] lg:w-[420px] flex-shrink-0 h-auto md:h-[calc(100vh-4rem)] flex flex-col bg-gradient-to-b from-[#f8fafc] via-white to-indigo-50/40 border-r border-slate-200/80 shadow-[4px_0_24px_-4px_rgba(99,102,241,0.05)] z-10 overflow-hidden relative">
      
      <div className="flex flex-col h-full pb-4">
        
        {/* 🟢 PREMIUM MESH BANNER: Upgraded to a richer Stripe-like gradient */}
        <div className="h-28 w-full bg-gradient-to-r from-indigo-400 via-purple-400 to-rose-300 relative shrink-0">
            <div className="absolute inset-0 opacity-[0.2] bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:12px_12px]"></div>
            <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-black/10 to-transparent"></div>
        </div>
        
        {/* Avatar & Action Button Row */}
        <div className="flex justify-between items-end px-5 sm:px-6 mb-3 shrink-0 relative z-10 -mt-12">
          <div className="relative group">
            {/* 🟢 COMPACT AVATAR */}
            <div 
              onClick={openAvatarModal}
              className={`w-24 h-24 rounded-[1.25rem] border-4 border-white shadow-md overflow-hidden bg-white flex items-center justify-center transition-all ${isCurrentUser ? 'cursor-pointer hover:shadow-lg' : ''}`}
            >
              {hasValidProfilePic(user.profile_pic_url) ? (
                <img src={user.profile_pic_url} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <span className="text-3xl font-black bg-gradient-to-br from-indigo-500 to-purple-500 bg-clip-text text-transparent">
                  {getInitials(user.full_name)}
                </span>
              )}
              
              {isCurrentUser && (
                <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                  <FaCamera className="text-white text-xl drop-shadow-md" />
                </div>
              )}
            </div>
            
            {/* Online Status */}
            {user.is_online && (
              <div className="absolute bottom-0 right-0 w-4.5 h-4.5 bg-emerald-500 border-[3px] border-white rounded-full shadow-sm"></div>
            )}
          </div>
          
          <div className="pb-1 scale-95 origin-bottom-right">
            {renderFriendButton()}
          </div>
        </div>

        {/* 🟢 Header Info, About & Location */}
        <div className="px-5 sm:px-6 shrink-0 relative group">
          {isCurrentUser && (
            <button 
              onClick={openBasicInfoModal}
              className="absolute top-0 right-5 p-1.5 bg-white/80 border border-slate-200/50 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 hover:border-indigo-200 rounded-lg transition-all md:opacity-0 md:group-hover:opacity-100 shadow-sm"
              title="Edit Basic Info"
            >
              <FaEdit size={12} />
            </button>
          )}

          <div className="flex items-center gap-1.5 pr-8">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight leading-none truncate">{user.full_name}</h1>
            {user.is_verified && <FaCheck className="text-blue-500 text-sm mt-0.5 shrink-0" title="Verified" />}
          </div>
          
          {/* COMPACT DESC */}
          {user.description && (
            <p className="text-slate-600 text-[13px] mt-2.5 mb-3 leading-relaxed font-medium pr-4 line-clamp-2">
              {user.description}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-2 mt-1 text-[11px] font-bold">
            <p className="text-slate-600 flex items-center gap-1.5 bg-white/80 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)] px-2.5 py-1 rounded-md border border-slate-200/60">
              <MapPin className="w-3.5 h-3.5 text-indigo-500" />
              <span className="truncate max-w-[150px]">{user.location || "Remote"}</span>
            </p>
            <button 
              onClick={openContactModal} 
              className="text-indigo-600 hover:text-indigo-700 bg-indigo-50/80 hover:bg-indigo-100 border border-indigo-100/80 px-2.5 py-1 rounded-md transition-colors shadow-sm"
            >
              Contact info
            </button>
          </div>
        </div>

        {/* 🟢 UPGRADED FROSTED GLASS STATS STRIP */}
        <div className="mx-5 sm:mx-6 my-6 bg-white/70 backdrop-blur-xl border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[16px] py-3.5 px-4 flex justify-between items-center shrink-0 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-indigo-400 to-purple-400"></div>
          
          <div className="text-center flex-1 group/stat cursor-default">
            <p className="text-xl font-black text-slate-800 group-hover/stat:text-amber-500 transition-colors leading-none">{user.rp || user.rp_points || user.reputation_points || "0"}</p>
            <p className="text-[9px] uppercase tracking-widest text-indigo-500/80 font-extrabold mt-1.5">RP Points</p>
          </div>
          
          <div className="w-[1px] h-8 bg-slate-200/80 mx-1"></div>
          
          <div className="text-center flex-1 group/stat cursor-default">
            <p className="text-xl font-black text-slate-800 group-hover/stat:text-indigo-500 transition-colors leading-none">{user.friend_count || "0"}</p>
            <p className="text-[9px] uppercase tracking-widest text-indigo-500/80 font-extrabold mt-1.5">Friends</p>
          </div>

          <div className="w-[1px] h-8 bg-slate-200/80 mx-1"></div>
          
          <div className="text-center flex-1 group/stat cursor-default">
            <p className="text-xl font-black text-slate-800 group-hover/stat:text-purple-500 transition-colors leading-none">{user.post_count || "0"}</p>
            <p className="text-[9px] uppercase tracking-widest text-indigo-500/80 font-extrabold mt-1.5">Posts</p>
          </div>
        </div>

        {/* 🟢 EXPANDABLE SKILLS SECTION */}
        <div className="px-5 sm:px-6 mb-6 shrink-0 relative group">
          {isCurrentUser && (
            <button 
              onClick={openSkillsModal}
              className="absolute -top-1 right-6 p-1.5 bg-white/80 border border-slate-200/50 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 hover:border-indigo-200 rounded-lg transition-all md:opacity-0 md:group-hover:opacity-100 z-10 shadow-sm"
              title="Edit Skills"
            >
              <FaEdit size={12} />
            </button>
          )}
          <h3 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-indigo-400" /> Core Skills
          </h3>
          
          <div className="flex flex-wrap gap-1.5 pr-8">
            {allSkills.length > 0 ? displayedSkills.map((skill, i) => (
              <span key={i} className="px-2.5 py-1 rounded-md border border-white bg-white/80 shadow-sm text-slate-700 text-[10px] font-extrabold uppercase tracking-wider">
                {skill}
              </span>
            )) : <span className="text-xs text-slate-400 font-medium">No skills added</span>}
            
            {/* Show '+X more' button if there are hidden skills */}
            {!showAllSkills && hiddenCount > 0 && (
              <button 
                onClick={() => setShowAllSkills(true)}
                className="px-2 py-1 rounded-md border border-indigo-200/60 bg-indigo-50/80 text-indigo-600 text-[10px] font-extrabold shadow-sm hover:bg-indigo-100 transition-colors"
              >
                +{hiddenCount} more
              </button>
            )}

            {/* Show 'Show less' button if expanded */}
            {showAllSkills && hiddenCount > 0 && (
              <button 
                onClick={() => setShowAllSkills(false)}
                className="px-2 py-1 rounded-md border border-slate-200/80 bg-slate-50 text-slate-500 text-[10px] font-extrabold shadow-sm hover:bg-slate-100 transition-colors"
              >
                Show less
              </button>
            )}
          </div>
        </div>

        {/* 🟢 COMPACT DETAILS (Takes remaining space) */}
        <div className="px-5 sm:px-6 flex-1 relative group flex flex-col min-h-0 overflow-hidden">
          {isCurrentUser && (
            <button 
              onClick={openDetailsModal}
              className="absolute -top-1 right-6 p-1.5 bg-white/80 border border-slate-200/50 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 hover:border-indigo-200 rounded-lg transition-all md:opacity-0 md:group-hover:opacity-100 z-10 shadow-sm"
              title="Edit Details"
            >
              <FaEdit size={12} />
            </button>
          )}
          <h3 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-1.5 shrink-0">
             About
          </h3>
          
          <div className="space-y-3.5 overflow-y-auto custom-scrollbar pr-2 pb-2">
            <div className="flex items-center gap-3">
              <div className="p-1.5 bg-white shadow-sm border border-slate-100/80 rounded-lg text-amber-500 shrink-0">
                <GraduationCap className="w-4 h-4" />
              </div>
              <span className="text-[13px] font-bold text-slate-700 truncate pr-4 leading-tight">
                {user.education || <span className="text-slate-400 font-medium">Not specified</span>}
              </span>
            </div>

            {user.website && (
              <div className="flex items-center gap-3">
                <div className="p-1.5 bg-white shadow-sm border border-slate-100/80 rounded-lg text-blue-500 shrink-0">
                  <LinkIcon className="w-4 h-4" />
                </div>
                <a href={user.website} target="_blank" rel="noopener noreferrer" className="text-[13px] font-bold text-indigo-600 hover:text-indigo-700 hover:underline truncate block pr-4 leading-tight">
                  {user.website}
                </a>
              </div>
            )}

            <div className="flex items-center gap-3">
              <div className="p-1.5 bg-white shadow-sm border border-slate-100/80 rounded-lg text-emerald-500 shrink-0">
                <Calendar className="w-4 h-4" />
              </div>
              <span className="text-[13px] font-bold text-slate-600 leading-tight">
                Joined {new Date(user.created_at).toLocaleDateString('default', { month: 'short', year: 'numeric' })}
              </span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ProfileSidebar;