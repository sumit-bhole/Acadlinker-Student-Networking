import React from "react";
import { useOutletContext } from "react-router-dom";
import { User, Shield, Crown, Users, LogOut, Trash2 } from "lucide-react";
import { removeMember } from "../../api/teamApi"; // Import the new API function

const TeamMembers = () => {
  const { team } = useOutletContext();
  
  // Check if current user is leader (to show remove buttons)
  // Assuming 'team.my_role' is sent from backend as added in previous steps
  const isLeader = team.my_role === 'leader';

  const handleRemove = async (userId, userName) => {
    if (!window.confirm(`Are you sure you want to remove ${userName} from the team?`)) return;

    try {
      await removeMember(team.id, userId);
      window.location.reload(); // Refresh to see changes
    } catch (err) {
      alert(err.response?.data?.error || "Failed to remove member");
    }
  };

  const getInitials = (name) => {
    return name?.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  };

  return (
    <div className="p-4 lg:p-8 max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3">
            <Users className="text-indigo-600" size={28} />
            Team Members
          </h2>
          <p className="text-slate-500 mt-1 font-medium">
            Manage your team, roles, and permissions.
          </p>
        </div>
        <div className="bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm flex items-center gap-2">
          <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">
            Total Members
          </span>
          <span className="bg-indigo-50 text-indigo-700 px-2.5 py-0.5 rounded-lg font-bold text-sm">
            {team.members.length}
          </span>
        </div>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {team.members.map((member, index) => (
          <div
            // Use index fallback to prevent crash if duplicates exist
            key={`${member.user_id}-${index}`} 
            className="group bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all duration-300 relative overflow-hidden"
          >
            {/* Role Badge (Top Right) */}
            <div className="absolute top-4 right-4">
              {member.role === "leader" ? (
                <span className="inline-flex items-center gap-1.5 text-[10px] bg-amber-50 text-amber-700 border border-amber-100 px-2.5 py-1 rounded-full font-bold uppercase tracking-wide shadow-sm">
                  <Crown size={12} fill="currentColor" /> Leader
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-[10px] bg-slate-50 text-slate-500 border border-slate-100 px-2.5 py-1 rounded-full font-bold uppercase tracking-wide">
                  <User size={12} /> Member
                </span>
              )}
            </div>

            <div className="flex items-center gap-4 mt-2">
              {/* Avatar */}
              <div className="relative">
                <div className="w-16 h-16 rounded-full p-1 bg-white border-2 border-slate-100 group-hover:border-indigo-100 transition-colors shadow-sm">
                  {member.profile_pic ? (
                    <img
                      src={member.profile_pic}
                      alt={member.full_name}
                      className="w-full h-full rounded-full object-cover"
                      onError={(e) => {
                        e.target.style.display = "none";
                        e.target.nextSibling.style.display = "flex";
                      }}
                    />
                  ) : null}
                  <div
                    className="w-full h-full rounded-full bg-gradient-to-br from-indigo-50 to-slate-100 flex items-center justify-center text-indigo-600 font-bold text-lg"
                    style={{ display: member.profile_pic ? "none" : "flex" }}
                  >
                    {getInitials(member.full_name)}
                  </div>
                </div>
                {member.role === 'leader' && (
                    <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-1 border border-slate-100 shadow-sm">
                        <Shield size={14} className="text-indigo-600" fill="currentColor"/>
                    </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-slate-900 text-lg leading-tight truncate group-hover:text-indigo-700 transition-colors">
                  {member.full_name}
                </h3>
                <p className="text-xs text-slate-500 font-medium mt-1">
                  Joined {new Date(member.joined_at).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
                </p>
              </div>
            </div>

            {/* Remove Member Button (Only for Leader & Not for Self) */}
            {isLeader && member.role !== 'leader' && (
              <div className="mt-5 pt-4 border-t border-slate-50 flex justify-end">
                <button 
                  onClick={() => handleRemove(member.user_id, member.full_name)}
                  className="flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-red-600 bg-slate-50 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors"
                >
                  <Trash2 size={14} /> Remove
                </button>
              </div>
            )}

            {/* Decorative Gradient Line */}
            <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500/0 to-transparent group-hover:via-indigo-500/50 transition-all duration-500"></div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TeamMembers;