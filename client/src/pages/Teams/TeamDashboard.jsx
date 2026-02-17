import React, { useState } from "react";
// 👇 ADDED 'Link' here
import { useOutletContext, Link } from "react-router-dom"; 
import { 
  Github, CheckCircle, ArrowRight, UserPlus, Clock, Settings, 
  GitPullRequest, Star, AlertCircle, Edit2, X 
} from "lucide-react";
import EditTeamModal from "../../components/Teams/EditTeamModal";
import InviteModal from "../../components/Teams/InviteModal";
import { joinRequest, respondToRequest } from "../../api/teamApi"; 

const TeamDashboard = () => {
  const { team, isLeader } = useOutletContext(); 
  const [refreshKey, setRefreshKey] = useState(0); 
  const reload = () => window.location.reload(); 

  const [showEdit, setShowEdit] = useState(false);
  const [showInvite, setShowInvite] = useState(false);
  const [joinMsg, setJoinMsg] = useState("");
  const [requestSent, setRequestSent] = useState(false);

  // --- ACTIONS ---
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

  // --- NON-MEMBER VIEW ---
  if (!team.is_member) {
    return (
      <div className="p-4 lg:p-8 max-w-4xl mx-auto space-y-8">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 text-center space-y-4">
          <div className="w-16 h-16 bg-indigo-50 rounded-2xl mx-auto flex items-center justify-center text-indigo-600 font-bold text-2xl mb-2">
            {team.name[0]}
          </div>
          <h1 className="text-3xl font-bold text-slate-900">{team.name}</h1>
          <p className="text-slate-600 max-w-lg mx-auto leading-relaxed">
            {team.description || "This team has no description yet."}
          </p>
        </div>

        <div className="bg-indigo-50 rounded-2xl p-6 border border-indigo-100 flex flex-col items-center gap-4">
          {requestSent ? (
            <div className="flex flex-col items-center text-emerald-600 gap-2">
              <CheckCircle size={32} />
              <span className="font-semibold">Request Sent Successfully!</span>
            </div>
          ) : (
            <div className="w-full max-w-md flex gap-2">
              <input 
                className="flex-1 px-4 py-2 rounded-xl border border-indigo-200 outline-none"
                placeholder="Why join?"
                value={joinMsg}
                onChange={(e) => setJoinMsg(e.target.value)}
              />
              <button onClick={handleJoin} className="bg-indigo-600 text-white px-6 py-2 rounded-xl font-bold">
                Request
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // --- DASHBOARD VIEW ---
  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto space-y-6">
      
      {/* 1. Header Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-purple-900 to-slate-900 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="relative z-10 flex items-center gap-4">
          <div className="w-16 h-16 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center overflow-hidden shrink-0">
            {team.profile_pic ? <img src={team.profile_pic} alt="" className="w-full h-full object-cover" /> : <span className="text-2xl font-bold">{team.name[0]}</span>}
          </div>
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold">{team.name}</h1>
            <p className="text-indigo-200 text-sm max-w-lg line-clamp-1">{team.description}</p>
          </div>
        </div>
        {isLeader && (
          <div className="relative z-10 flex gap-2">
            <button onClick={() => setShowEdit(true)} className="flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-md px-4 py-2 rounded-lg text-sm font-medium transition border border-white/10"><Edit2 size={16} /> Edit Team</button>
            <button onClick={() => setShowInvite(true)} className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 px-4 py-2 rounded-lg text-sm font-bold transition shadow-lg"><UserPlus size={16} /> Invite</button>
          </div>
        )}
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-600/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* === LEFT COLUMN === */}
        <div className="space-y-6">
          
          {/* GitHub Integration */}
          <div className="bg-[#0d1117] text-[#c9d1d9] rounded-xl border border-[#30363d] overflow-hidden shadow-lg">
             <div className="p-4 border-b border-[#30363d] flex justify-between items-center bg-[#161b22]">
               <h3 className="font-bold flex items-center gap-2 text-sm"><Github size={18} /> Repository</h3>
               {team.github_repo && <span className="text-xs px-2 py-0.5 bg-[#238636] text-white rounded-full">Public</span>}
             </div>
             <div className="p-5">
               {team.github_repo ? (
                 <>
                   <p className="text-lg font-bold text-white mb-4">{team.github_repo}</p>
                   <a href={`https://github.com/${team.github_repo}`} target="_blank" rel="noreferrer" className="block w-full py-2 bg-[#21262d] hover:bg-[#30363d] text-center text-xs font-bold rounded border border-[#30363d]">View on GitHub</a>
                 </>
               ) : (
                 <p className="text-center text-sm py-4">No Repo Linked</p>
               )}
             </div>
          </div>

          {/* Inside TeamDashboard.jsx Left Column */}
<div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
  <div className="flex justify-between items-center mb-4">
    <h3 className="font-bold text-slate-800 flex items-center gap-2 text-sm uppercase tracking-wide">
      <CheckCircle size={16} className="text-emerald-600" /> Current Sprint
    </h3>
    <Link to="tasks" className="text-xs font-bold text-indigo-600 hover:underline">Full Board</Link>
  </div>
  
  <div className="space-y-3">
    {team.pending_tasks?.length > 0 ? team.pending_tasks.map(task => (
      <div key={task.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 transition border border-transparent hover:border-slate-100">
        <div className="flex items-center gap-3">
          <div className={`w-2 h-2 rounded-full ${task.priority === 'high' ? 'bg-red-500' : 'bg-orange-400'}`} />
          <span className="text-sm font-medium text-slate-700 truncate w-40">{task.title}</span>
        </div>
        <span className="text-[10px] font-bold text-slate-400 uppercase">{task.status.replace('_', ' ')}</span>
      </div>
    )) : (
      <p className="text-xs text-slate-400 text-center py-2">No active tasks.</p>
    )}
  </div>
</div>

        </div>

        {/* === RIGHT COLUMN === */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Join Requests Widget */}
          {isLeader && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                <h3 className="font-bold text-slate-800">Join Requests</h3>
                {team.join_requests?.length > 0 && <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded font-bold">{team.join_requests.length} Pending</span>}
              </div>
              
              <div className="p-4">
                {(!team.join_requests || team.join_requests.length === 0) ? (
                  <p className="text-sm text-slate-400 italic text-center py-4">No new requests.</p>
                ) : (
                  team.join_requests.map(req => (
                    <div key={req.id} className="flex items-center justify-between p-3 bg-white border border-slate-100 rounded-lg hover:shadow-md transition mb-2">
                      <div className="flex items-center gap-3">
                        <img src={req.profile_pic || "/default-avatar.png"} className="w-10 h-10 rounded-full bg-slate-200 object-cover" alt="" />
                        <div>
                          <p className="text-sm font-bold text-slate-900">{req.full_name}</p>
                          <p className="text-xs text-slate-500 line-clamp-1">{req.message || "Requested to join"}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => handleRequestResponse(req.id, 'accept')} className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100"><CheckCircle size={18}/></button>
                        <button onClick={() => handleRequestResponse(req.id, 'reject')} className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100"><X size={18}/></button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Placeholders */}
          <div className="grid grid-cols-2 gap-4">
             <div className="border border-dashed border-slate-300 rounded-xl p-6 flex flex-col items-center justify-center text-slate-400 hover:border-indigo-400 hover:text-indigo-600 transition cursor-pointer group">
                <div className="p-3 bg-slate-50 rounded-full mb-2 group-hover:bg-indigo-50"><Edit2 size={24}/></div>
                <span className="text-sm font-bold">Create Exam</span>
             </div>
             <div className="border border-dashed border-slate-300 rounded-xl p-6 flex flex-col items-center justify-center text-slate-400 hover:border-indigo-400 hover:text-indigo-600 transition cursor-pointer group">
                <div className="p-3 bg-slate-50 rounded-full mb-2 group-hover:bg-indigo-50"><Clock size={24}/></div>
                <span className="text-sm font-bold">Project Timeline</span>
             </div>
          </div>

        </div>
      </div>

      {/* Modals */}
      {showEdit && <EditTeamModal team={team} onClose={() => setShowEdit(false)} onUpdate={reload} />}
      {showInvite && <InviteModal teamId={team.id} onClose={() => setShowInvite(false)} />}
    </div>
  );
};

export default TeamDashboard;