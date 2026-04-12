import React, { useState } from "react";
import { useOutletContext, Link } from "react-router-dom";
import { 
  CheckCircle, UserPlus, Edit2, MessageSquare, Users, Globe, Lock
} from "lucide-react";
import EditTeamModal from "../../components/Teams/EditTeamModal";
import InviteModal from "../../components/Teams/InviteModal";
import { joinRequest, respondToRequest } from "../../api/teamApi"; 

// 🟢 Import our newly extracted Widgets
import ActiveSprintWidget from "../../components/Teams/ActiveSprintWidget";
import GitHubWidget from "../../components/Teams/GitHubWidget";

const getImageUrl = (url) => {
  if (!url) return null;
  if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("blob:")) {
    return url;
  }
  const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  return `${baseUrl}/static/uploads/${url}`;
};

const TeamDashboard = () => {
  const { team, isLeader } = useOutletContext(); 
  const reload = () => window.location.reload(); 

  const [showEdit, setShowEdit] = useState(false);
  const [showInvite, setShowInvite] = useState(false);
  const [joinMsg, setJoinMsg] = useState("");
  const [requestSent, setRequestSent] = useState(false);
  
  const [imageErrorNonMember, setImageErrorNonMember] = useState(false);
  const [imageErrorMember, setImageErrorMember] = useState(false);

  const handleJoin = async () => {
    try {
      await joinRequest({ team_id: team.id, message: joinMsg });
      setRequestSent(true);
    } catch (err) {
      alert(err.response?.data?.error || "Failed");
    }
  };

  const handleRequestResponse = async (requestId, action) => {
    try {
      await respondToRequest({ request_id: requestId, action });
      reload(); 
    } catch (err) {
      alert("Action failed");
    }
  };

  if (!team) return <div className="p-10 text-center">Loading Team Data...</div>;

  const teamPicUrl = getImageUrl(team.profile_pic);

  // =========================================================
  // 1. NON-MEMBER VIEW
  // =========================================================
  if (!team.is_member) {
    return (
      <div className="p-4 lg:p-8 max-w-3xl mx-auto space-y-8 animate-in fade-in duration-500">
        
        {/* Hero Card */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 h-32"></div>
          <div className="px-8 pb-8 text-center relative">
            <div className="w-24 h-24 bg-white rounded-3xl mx-auto -mt-12 flex items-center justify-center shadow-lg border-4 border-white overflow-hidden">
              {!imageErrorNonMember && teamPicUrl ? (
                <img 
                  src={teamPicUrl} 
                  onError={() => setImageErrorNonMember(true)}
                  className="w-full h-full object-cover" 
                  alt={team.name} 
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-indigo-600 font-black text-4xl bg-indigo-50">
                  {team.name?.[0]?.toUpperCase()}
                </div>
              )}
            </div>
            
            <h1 className="text-3xl font-black text-slate-900 mt-4">{team.name}</h1>
            <p className="text-slate-500 mt-2 max-w-lg mx-auto leading-relaxed">
              {team.description || "This team is on a mission to build something great."}
            </p>

            <div className="flex justify-center gap-6 mt-6 text-sm font-bold text-slate-400 uppercase tracking-widest">
              <span>{team.member_count} Members</span>
              <span>•</span>
              <span>{team.privacy} Workspace</span>
            </div>
          </div>
        </div>

        {/* Join Request Form */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-lg p-8">
          {!requestSent ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                  <MessageSquare size={20} />
                </div>
                <h3 className="font-bold text-slate-800">Request to Join</h3>
              </div>
              
              <label className="block text-sm text-slate-500 mb-1">
                Tell the leader about your skills and why you want to join (5-6 lines recommended).
              </label>
              
              <textarea 
                className="w-full p-4 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all resize-none text-slate-700 text-sm leading-relaxed"
                placeholder="Hi! I am a Full Stack Developer with experience in React and Flask. I noticed you are building an LMS and I would love to contribute to the frontend architecture..."
                rows="6"
                value={joinMsg}
                onChange={(e) => setJoinMsg(e.target.value)}
              />
              
              <button 
                onClick={handleJoin}
                disabled={!joinMsg.trim()}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-indigo-200 disabled:opacity-50 disabled:shadow-none"
              >
                Send Request
              </button>
            </div>
          ) : (
            <div className="py-12 flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-4">
                <CheckCircle size={32} />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Request Sent!</h3>
              <p className="text-slate-500 mt-2 max-w-xs">
                Your request has been sent to the team leader. You will be notified once they accept.
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // =========================================================
  // 2. MEMBER VIEW (Dashboard)
  // =========================================================
  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto space-y-6">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-900 to-slate-900 rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="relative z-10 flex items-center gap-6 w-full md:w-auto">
          <div className="w-20 h-20 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center overflow-hidden shrink-0 shadow-inner">
            {!imageErrorMember && teamPicUrl ? (
              <img 
                src={teamPicUrl} 
                onError={() => setImageErrorMember(true)}
                alt={team.name} 
                className="w-full h-full object-cover" 
              />
            ) : (
              <span className="text-3xl font-black">{team.name?.[0]?.toUpperCase()}</span>
            )}
          </div>
          <div>
            <h1 className="text-3xl lg:text-4xl font-black tracking-tight">{team.name}</h1>
            <p className="text-indigo-200 text-sm mt-1 max-w-lg line-clamp-1">{team.description}</p>
          </div>
        </div>
        
        {isLeader && (
          <div className="relative z-10 flex gap-3 w-full md:w-auto">
            <button onClick={() => setShowEdit(true)} className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-md px-5 py-2.5 rounded-xl text-sm font-bold transition border border-white/10">
              <Edit2 size={16} /> Edit Team
            </button>
            <button onClick={() => setShowInvite(true)} className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-indigo-500 hover:bg-indigo-600 px-5 py-2.5 rounded-xl text-sm font-bold transition shadow-lg shadow-indigo-500/30">
              <UserPlus size={16} /> Invite
            </button>
          </div>
        )}
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4"></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* === LEFT COLUMN (2 Spans) === */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* 🟢 Use the extracted Sprint Widget */}
          <ActiveSprintWidget tasks={team.pending_tasks} members={team.members}/>

          {/* 🟢 Use the extracted GitHub Widget */}
          <GitHubWidget 
            githubRepo={team.github_repo} 
            isLeader={isLeader} 
            onLinkRepo={() => setShowEdit(true)} 
          />

        </div>

        {/* === RIGHT COLUMN: REQUESTS & MEMBERS === */}
        <div className="space-y-6">
          
          {/* JOIN REQUESTS WIDGET (Leader Only) */}
          {isLeader && (
            <div className="bg-white rounded-2xl border border-orange-200 shadow-sm overflow-hidden animate-in fade-in">
              <div className="p-4 bg-orange-50 border-b border-orange-100 flex justify-between items-center">
                <h3 className="font-bold text-orange-900 flex items-center gap-2">
                  <UserPlus size={18} /> Join Requests
                </h3>
                {team.join_requests?.length > 0 && (
                  <span className="bg-orange-200 text-orange-800 text-xs font-bold px-2 py-0.5 rounded-full">
                    {team.join_requests.length}
                  </span>
                )}
              </div>
              
              <div className="p-2 space-y-2">
                {!team.join_requests || team.join_requests.length === 0 ? (
                  <div className="text-center py-6 text-slate-400">
                    <p className="text-xs">No pending requests.</p>
                  </div>
                ) : (
                  team.join_requests.map(req => (
                    <div key={req.id} className="p-3 bg-white border border-orange-100 rounded-xl shadow-sm">
                      <div className="flex items-center gap-3 mb-2">
                        <img 
                          src={getImageUrl(req.profile_pic) || "/default-avatar.png"} 
                          className="w-8 h-8 rounded-full bg-slate-200 object-cover" 
                          alt="" 
                        />
                        <div>
                          <p className="text-sm font-bold text-slate-900">{req.full_name}</p>
                          <p className="text-[10px] text-slate-400">{new Date(req.created_at).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="bg-slate-50 p-2 rounded-lg text-xs text-slate-600 mb-3 italic">
                        "{req.message || "I'd like to join!"}"
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => handleRequestResponse(req.id, 'accept')} className="flex-1 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-xs font-bold transition">Accept</button>
                        <button onClick={() => handleRequestResponse(req.id, 'reject')} className="flex-1 py-1.5 bg-slate-100 hover:bg-red-50 text-slate-600 hover:text-red-600 rounded-lg text-xs font-bold transition">Reject</button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Members Summary Card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Users size={18} className="text-indigo-500" /> Team Members
            </h3>
            <div className="flex -space-x-2 overflow-hidden mb-4">
              {team.members.slice(0, 5).map(m => (
                <img 
                  key={m.user_id} 
                  src={getImageUrl(m.profile_pic) || "/default-avatar.png"} 
                  className="inline-block h-8 w-8 rounded-full ring-2 ring-white object-cover" 
                  alt={m.full_name} 
                  title={m.full_name}
                />
              ))}
              {team.members.length > 5 && (
                <div className="h-8 w-8 rounded-full bg-slate-100 ring-2 ring-white flex items-center justify-center text-xs font-bold text-slate-500">
                  +{team.members.length - 5}
                </div>
              )}
            </div>
            <Link to="members" className="block w-full py-2 border border-slate-200 rounded-xl text-center text-xs font-bold text-slate-600 hover:bg-slate-50 transition">
              Manage Members
            </Link>
          </div>

        </div>
      </div>

      {showEdit && <EditTeamModal team={team} onClose={() => setShowEdit(false)} onUpdate={reload} />}
      {showInvite && <InviteModal teamId={team.id} onClose={() => setShowInvite(false)} />}
    </div>
  );
};

export default TeamDashboard;