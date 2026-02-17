import React from "react";
import { Link } from "react-router-dom";
import { Users, Lock, Globe, Briefcase, ChevronRight } from "lucide-react";

const TeamCard = ({ team }) => {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 hover:shadow-lg hover:border-indigo-200 transition-all duration-300 flex flex-col h-64 group relative overflow-hidden">
      
      {/* 🎨 Hover Gradient Strip */}
      <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-indigo-500 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
      
      {/* Header */}
      <div className="flex justify-between items-start mb-3 pl-2">
        <div className="flex items-center gap-3 w-full">
          <div className="w-10 h-10 bg-indigo-50 rounded-lg flex-shrink-0 flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
            <Briefcase size={20} />
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-slate-900 truncate group-hover:text-indigo-600 transition">{team.name}</h3>
            <div className="flex items-center gap-1 text-[10px] text-slate-500 uppercase font-bold tracking-wider">
              {team.privacy === "private" ? <Lock size={10} /> : <Globe size={10} />}
              {team.privacy}
            </div>
          </div>
        </div>
      </div>

      {/* Description (Fixed Height area) */}
      <div className="flex-grow pl-2 overflow-hidden mb-2">
        <p className="text-slate-600 text-sm line-clamp-2">
          {team.description || "No description provided."}
        </p>
      </div>

      {/* Hiring Badge (Fixed Position in flow) */}
      <div className="h-8 pl-2 mb-3">
        {team.is_hiring ? (
          <div className="inline-flex items-center gap-2 bg-emerald-50 px-2 py-1 rounded border border-emerald-100 max-w-full">
            <span className="text-[10px] font-bold text-emerald-700 uppercase flex-shrink-0">Hiring:</span>
            <span className="text-xs text-slate-600 truncate">{team.hiring_requirements}</span>
          </div>
        ) : (
          <span className="text-[10px] text-slate-300 font-medium">Team is full</span>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-100 pl-2 mt-auto">
        <div className="flex items-center text-slate-400 text-xs font-medium">
          <Users size={14} className="mr-1" />
          <span>{team.member_count} Member{team.member_count !== 1 && 's'}</span>
        </div>
        
        <Link 
          to={`/teams/${team.id}`}
          className="bg-slate-50 text-slate-700 hover:bg-indigo-600 hover:text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1"
        >
          Open <ChevronRight size={12} />
        </Link>
      </div>
    </div>
  );
};

export default TeamCard;