import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getTeamDetails, joinRequest } from "../../api/teamApi";
import TaskBoard from "../../components/Teams/TaskBoard";
import InviteModal from "../../components/Teams/InviteModal";
import { Users, Lock, Globe, Plus, CheckCircle, Clock } from "lucide-react";

const TeamDetails = () => {
  const { teamId } = useParams();
  const [team, setTeam] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [showInvite, setShowInvite] = useState(false);
  const [requestMsg, setRequestMsg] = useState("");

  const fetchDetails = () => {
    getTeamDetails(teamId)
      .then(res => setTeam(res.data))
      .catch(err => console.error(err));
  };

  useEffect(() => { fetchDetails(); }, [teamId]);

  const handleJoin = async () => {
    try {
      await joinRequest({ team_id: teamId, message: requestMsg });
      alert("Request sent!");
      setRequestMsg("");
    } catch (err) {
      alert(err.response?.data?.error || "Failed");
    }
  };

  if (!team) return <div className="p-10 text-center">Loading...</div>;

  const isLeader = team.my_role === 'leader';

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header Banner */}
      <div className="bg-white border-b border-slate-200 px-4 py-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-slate-900">{team.name}</h1>
                {team.privacy === 'private' ? <Lock size={16} className="text-slate-400" /> : <Globe size={16} className="text-slate-400" />}
              </div>
              <p className="text-slate-500">{team.description}</p>
            </div>

            <div className="flex gap-3">
              {team.is_member ? (
                isLeader && (
                  <button 
                    onClick={() => setShowInvite(true)}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 hover:bg-indigo-700 transition"
                  >
                    <Plus size={18} /> Invite
                  </button>
                )
              ) : (
                <div className="flex gap-2">
                  <input 
                    className="border border-slate-300 rounded-lg px-3 py-2 text-sm"
                    placeholder="Why join?"
                    value={requestMsg}
                    onChange={e => setRequestMsg(e.target.value)}
                  />
                  <button 
                    onClick={handleJoin}
                    className="bg-emerald-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-emerald-700 transition"
                  >
                    Request to Join
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-6 mt-8 border-b border-slate-100">
            {['overview', 'tasks', 'members'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-3 capitalize font-medium text-sm transition ${
                  activeTab === tab 
                    ? 'text-indigo-600 border-b-2 border-indigo-600' 
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 max-w-6xl mx-auto w-full p-4 lg:p-8">
        {activeTab === 'overview' && (
          <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-6">
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <h3 className="font-bold text-lg mb-4">About the Project</h3>
                <p className="text-slate-600 leading-relaxed">{team.description || "No description."}</p>
              </div>
            </div>
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <h3 className="font-bold text-sm text-slate-900 mb-4 uppercase tracking-wide">Status</h3>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Members</span>
                    <span className="font-medium">{team.members.length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Hiring</span>
                    <span className={`font-medium ${team.is_hiring ? 'text-emerald-600' : 'text-slate-400'}`}>
                      {team.is_hiring ? 'Yes' : 'No'}
                    </span>
                  </div>
                  {team.hiring_requirements && (
                    <div className="pt-3 border-t border-slate-100">
                      <p className="text-xs text-slate-400 mb-1">Requirements</p>
                      <p className="text-sm font-medium text-slate-800">{team.hiring_requirements}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'tasks' && (
          <TaskBoard teamId={team.id} isMember={team.is_member} />
        )}

        {activeTab === 'members' && (
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            {team.members.map((member) => (
              <div key={member.user_id} className="flex items-center justify-between p-4 border-b border-slate-100 last:border-0 hover:bg-slate-50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-bold">
                    {member.full_name[0]}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">{member.full_name}</p>
                    <p className="text-xs text-slate-500 capitalize">{member.role}</p>
                  </div>
                </div>
                {member.role === 'leader' && <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded">Leader</span>}
              </div>
            ))}
          </div>
        )}
      </div>

      {showInvite && <InviteModal teamId={team.id} onClose={() => setShowInvite(false)} />}
    </div>
  );
};

export default TeamDetails;