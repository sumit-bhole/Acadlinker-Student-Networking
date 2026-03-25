import React from "react";
import { FaCheck, FaEdit, FaCamera } from "react-icons/fa";
import { MapPin, Link as LinkIcon, GraduationCap, Calendar } from "lucide-react";

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
  return (
    <div className="w-full md:w-[450px] lg:w-[500px] flex-shrink-0 h-auto md:h-[calc(100vh-4rem)] md:overflow-y-auto no-scrollbar bg-white border-r border-slate-200 shadow-sm">
      <div className="flex flex-col min-h-full pb-0 pt-10">
        
        {/* Avatar & Action Button Row */}
        <div className="flex justify-between items-start px-5 mb-5 shrink-0">
          <div className="relative">
            <div 
              onClick={openAvatarModal}
              className={`w-28 h-28 rounded-2xl border-[3px] border-slate-100 shadow-sm overflow-hidden bg-indigo-50 flex items-center justify-center ${isCurrentUser ? 'cursor-pointer group' : ''}`}
            >
              {/* 🟢 SMART INITIALS FALLBACK */}
              {hasValidProfilePic(user.profile_pic_url) ? (
                <img src={user.profile_pic_url} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <span className="text-5xl font-black text-indigo-400">{getInitials(user.full_name)}</span>
              )}
              {isCurrentUser && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <FaCamera className="text-white text-2xl" />
                </div>
              )}
            </div>
            {user.is_online && (
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 border-[3px] border-white rounded-full"></div>
            )}
          </div>
          
          <div className="pt-2">
            {renderFriendButton()}
          </div>
        </div>

        {/* Header Info, About & Location */}
        <div className="px-5 shrink-0 relative group">
          {isCurrentUser && (
            <button 
              onClick={openBasicInfoModal}
              className="absolute top-0 right-5 p-2 bg-slate-50 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
            >
              <FaEdit />
            </button>
          )}

          <div className="flex items-center gap-1.5 pr-8">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">{user.full_name}</h1>
            {user.is_verified && <FaCheck className="text-blue-500 text-sm" title="Verified" />}
          </div>
          
          {user.description && (
            <p className="text-slate-700 text-sm mt-3 mb-3 leading-relaxed font-medium pr-2">
              {user.description}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-2 mt-2 text-sm font-medium">
            <p className="text-slate-500 flex items-center gap-1.5">
              <MapPin className="w-4 h-4" />
              {user.location || "Remote"}
            </p>
            <span className="text-slate-300">•</span>
            <button 
              onClick={openContactModal} 
              className="text-indigo-600 hover:underline font-bold"
            >
              Contact info
            </button>
          </div>
        </div>

        {/* Stats Strip */}
        <div className="grid grid-cols-3 border-y border-slate-100 py-5 mx-5 mt-6 mb-6 shrink-0 divide-x divide-slate-100">
          <div className="text-center group">
            <p className="text-2xl font-black text-slate-800 group-hover:text-amber-500 transition-colors">{user.rp || user.rp_points || user.reputation_points || "0"}</p>
            <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mt-1">RP Points</p>
          </div>
          <div className="text-center group">
            <p className="text-2xl font-black text-slate-800 group-hover:text-blue-500 transition-colors">{user.friend_count || "0"}</p>
            <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mt-1">Friends</p>
          </div>
          <div className="text-center group">
            <p className="text-2xl font-black text-slate-800 group-hover:text-purple-500 transition-colors">{user.post_count || "0"}</p>
            <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mt-1">Posts</p>
          </div>
        </div>

        {/* Skills */}
        <div className="px-5 mb-6 shrink-0 relative group">
          {isCurrentUser && (
            <button 
              onClick={openSkillsModal}
              className="absolute -top-2 right-5 p-2 bg-slate-50 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100 z-10"
            >
              <FaEdit />
            </button>
          )}
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Skills</h3>
          <div className="flex flex-wrap gap-1.5 pr-8">
            {user.skills ? user.skills.split(",").slice(0, 6).map((skill, i) => (
              <span key={i} className="px-3 py-1 rounded-md border border-indigo-100 bg-indigo-50 text-indigo-700 text-xs font-bold">{skill.trim()}</span>
            )) : <span className="text-sm text-slate-400 italic">No skills added</span>}
            {user.skills && user.skills.split(",").length > 6 && (
              <span className="px-2 py-1 text-slate-400 text-xs font-bold">+{user.skills.split(",").length - 6}</span>
            )}
          </div>
        </div>

        {/* Details */}
        <div className="px-5 space-y-4 shrink-0 relative group pb-4">
          {isCurrentUser && (
            <button 
              onClick={openDetailsModal}
              className="absolute -top-2 right-5 p-2 bg-slate-50 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100 z-10"
            >
              <FaEdit />
            </button>
          )}
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Details</h3>
          
          <div className="flex items-center gap-3">
            <GraduationCap className="w-4 h-4 text-slate-400 shrink-0" />
            <span className="text-sm font-medium text-slate-700 truncate pr-8">{user.education || "Not specified"}</span>
          </div>

          <div className="flex items-center gap-3">
            <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
            <span className="text-sm font-medium text-slate-700">Joined {new Date(user.created_at).toLocaleDateString('default', { month: 'short', year: 'numeric' })}</span>
          </div>

          {user.website && (
            <div className="flex items-center gap-3">
              <LinkIcon className="w-4 h-4 text-indigo-400 shrink-0" />
              <a href={user.website} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-indigo-600 hover:underline truncate block pr-8">
                {user.website}
              </a>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default ProfileSidebar;