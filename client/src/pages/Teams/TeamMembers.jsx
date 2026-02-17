import React from "react";
import { useOutletContext } from "react-router-dom";
import { User, Shield } from "lucide-react";

const TeamMembers = () => {
  const { team } = useOutletContext();

  return (
    <div className="p-4 lg:p-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-slate-900">Team Members</h2>
        <span className="text-sm text-slate-500 bg-white px-3 py-1 rounded-full border border-slate-200">
          Total: {team.members.length}
        </span>
      </div>
      
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {team.members.map((member) => (
          <div key={member.user_id} className="flex items-center justify-between p-4 border-b border-slate-100 last:border-0 hover:bg-slate-50 transition">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full flex items-center justify-center text-slate-600 font-bold border border-slate-200">
                {member.full_name[0]}
              </div>
              <div>
                <p className="font-semibold text-slate-900 text-sm">{member.full_name}</p>
                <p className="text-xs text-slate-500 capitalize">{member.role}</p>
              </div>
            </div>
            {member.role === 'leader' ? (
              <span className="inline-flex items-center gap-1 text-[10px] bg-indigo-50 text-indigo-700 px-2 py-1 rounded-full font-bold uppercase">
                <Shield size={10} /> Leader
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[10px] bg-slate-100 text-slate-600 px-2 py-1 rounded-full font-medium uppercase">
                <User size={10} /> Member
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TeamMembers;