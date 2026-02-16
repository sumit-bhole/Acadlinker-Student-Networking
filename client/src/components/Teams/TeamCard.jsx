import React from "react";
import { Link } from "react-router-dom";
import { Users, Lock, Globe, Briefcase, ChevronRight } from "lucide-react";

const TeamCard = ({ team }) => {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 hover:shadow-md transition-all duration-200 flex flex-col h-full group">
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg text-white">
            <Briefcase size={18} />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 line-clamp-1">{team.name}</h3>
            <p className="text-xs text-slate-500 flex items-center gap-1">
              {team.privacy === "private" ? <Lock size={10} /> : <Globe size={10} />}
              {team.privacy === "private" ? "Private" : "Public"} Team
            </p>
          </div>
        </div>
        {team.is_hiring && (
          <span className="bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wide">
            Hiring
          </span>
        )}
      </div>

      <p className="text-slate-600 text-sm mb-4 line-clamp-2 flex-grow">
        {team.description || "No description provided."}
      </p>

      {team.is_hiring && team.hiring_requirements && (
        <div className="mb-4 bg-slate-50 p-2 rounded-lg border border-slate-100">
          <p className="text-xs font-semibold text-slate-700 mb-1">Looking for:</p>
          <p className="text-xs text-slate-500 line-clamp-1">{team.hiring_requirements}</p>
        </div>
      )}

      <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-100">
        <div className="flex items-center text-slate-500 text-xs">
          <Users size={14} className="mr-1" />
          <span>{team.member_count || 1} Member{team.member_count !== 1 && 's'}</span>
        </div>
        
        <Link 
          to={`/teams/${team.id}`}
          className="text-indigo-600 font-medium text-sm flex items-center hover:text-indigo-700 transition-colors"
        >
          View Team <ChevronRight size={16} />
        </Link>
      </div>
    </div>
  );
};

export default TeamCard;