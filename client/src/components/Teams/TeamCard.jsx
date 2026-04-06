import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Users, Lock, Globe, ChevronRight, Sparkles } from "lucide-react";

// 🚀 HELPER: Safely format image URLs
const getImageUrl = (url) => {
  if (!url) return null;
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  return `${baseUrl}/static/uploads/${url}`;
};

const TeamCard = ({ team }) => {
  const [imageError, setImageError] = useState(false);
  const teamPicUrl = getImageUrl(team.profile_pic);

  return (
    <Link 
      to={`/teams/${team.id}`}
      className="group flex flex-col bg-white rounded-2xl border border-slate-200/80 p-5 hover:shadow-xl hover:shadow-slate-200/50 hover:border-slate-300 hover:-translate-y-1 transition-all duration-300 h-[260px] relative"
    >
      {/* Header: Logo & Info */}
      <div className="flex items-center gap-4">
        {/* Clean Circular Logo */}
        <div className="w-12 h-12 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 overflow-hidden shadow-sm group-hover:shadow transition-shadow">
          {!imageError && teamPicUrl ? (
            <img 
              src={teamPicUrl} 
              alt={team.name} 
              onError={() => setImageError(true)}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-lg font-black text-slate-400">{team.name?.[0]?.toUpperCase()}</span>
          )}
        </div>

        {/* Title & Privacy */}
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-base text-slate-900 truncate group-hover:text-indigo-600 transition-colors">
            {team.name}
          </h3>
          <div className="flex items-center gap-1.5 mt-0.5">
            {team.privacy === "private" ? (
              <Lock size={12} className="text-slate-400" />
            ) : (
              <Globe size={12} className="text-slate-400" />
            )}
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              {team.privacy}
            </span>
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="mt-4 flex-1">
        <p className="text-sm text-slate-600 leading-relaxed line-clamp-3">
          {team.description || "No description provided for this workspace."}
        </p>
      </div>

      {/* Footer Area */}
      <div className="mt-auto flex flex-col gap-4">
        
        {/* Subtle Hiring Badge */}
        <div className="h-6">
          {team.is_hiring && (
            <div className="inline-flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-200 max-w-full">
              <Sparkles size={12} className="text-indigo-500 shrink-0" />
              <span className="text-[10px] font-bold text-slate-700 uppercase shrink-0">Looking for:</span>
              <span className="text-xs text-slate-600 truncate font-medium">{team.hiring_requirements}</span>
            </div>
          )}
        </div>

        {/* Bottom Bar */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          <div className="flex items-center gap-1.5 text-slate-500">
            <Users size={16} className="text-slate-400" />
            <span className="text-sm font-bold text-slate-700">{team.member_count}</span>
            <span className="text-xs font-medium">Member{team.member_count !== 1 && 's'}</span>
          </div>
          
          <div className="flex items-center text-sm font-bold text-indigo-600 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
            View <ChevronRight size={16} />
          </div>
        </div>

      </div>
    </Link>
  );
};

export default TeamCard;