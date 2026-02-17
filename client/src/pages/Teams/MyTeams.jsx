import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Briefcase, Plus, Inbox, ChevronRight, Bell, ArrowUpRight, ArrowDownLeft } from "lucide-react";
import { getMyTeams, getMyInvites } from "../../api/teamApi";
import TeamCard from "../../components/Teams/TeamCard";
import RequestsModal from "../../components/Teams/RequestsModal";

const MyTeams = () => {
  const [teams, setTeams] = useState([]);
  const [invites, setInvites] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const fetchData = async () => {
    try {
      const [teamsRes, invitesRes] = await Promise.all([
        getMyTeams(),
        getMyInvites()
      ]);
      setTeams(teamsRes.data);
      setInvites(invitesRes.data.received_invites);
      setRequests(invitesRes.data.sent_requests);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const pendingCount = invites.length;

  return (
    <div className="min-h-screen bg-slate-50 p-4 lg:p-8 pb-24">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* =======================
            LEFT SIDE: TEAM GRID
           ======================= */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* Header Row */}
          <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <h1 className="text-xl md:text-2xl font-bold text-slate-900 flex items-center gap-2">
              <Briefcase className="text-indigo-600" /> My Teams
            </h1>
            
            <div className="flex items-center gap-2">
              {/* Create Button (Desktop & Mobile) */}
              <Link 
                to="/teams/create" 
                className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition shadow-sm text-sm font-bold"
              >
                <Plus size={18} />
                <span className="hidden md:inline">Create Team</span>
                <span className="md:hidden">New</span>
              </Link>

              {/* Mobile Activity Toggle */}
              <button 
                onClick={() => setShowModal(true)}
                className="lg:hidden relative p-2 bg-slate-100 rounded-lg hover:bg-slate-200 transition"
              >
                <Inbox size={20} className="text-slate-600" />
                {pendingCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center font-bold animate-pulse">
                    {pendingCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Grid Content */}
          {loading ? (
            <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div></div>
          ) : teams.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 shadow-sm">
              <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Briefcase className="text-indigo-500" size={32} />
              </div>
              <h3 className="text-lg font-bold text-slate-900">No teams yet</h3>
              <p className="text-slate-500 mb-6 max-w-sm mx-auto text-sm">Join a project to start collaborating.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {teams.map(team => (
                <div key={team.id} className="relative">
                  {team.my_role === 'leader' && (
                    <span className="absolute -top-2 -right-2 bg-indigo-600 text-white text-[9px] font-bold px-2 py-1 rounded-full z-10 shadow-sm border-2 border-white tracking-wide">
                      LEADER
                    </span>
                  )}
                  <TeamCard team={team} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ===============================
            RIGHT SIDE: ACTIVITY PANEL
           =============================== */}
        <div className="hidden lg:block space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm sticky top-24 overflow-hidden">
            
            {/* Header */}
            <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
              <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wide flex items-center gap-2">
                <Bell size={16} className="text-indigo-600" /> Recent Activity
              </h3>
              {pendingCount > 0 && <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">{pendingCount}</span>}
            </div>
            
            <div className="divide-y divide-slate-50">
              
              {/* --- Pending Invites Section --- */}
              <div className="p-4">
                <p className="text-xs font-bold text-slate-400 mb-3 uppercase flex items-center gap-1">
                  <ArrowDownLeft size={12} /> Incoming Invites
                </p>
                {invites.length === 0 ? (
                  <p className="text-xs text-slate-400 italic py-2">No pending invites.</p>
                ) : (
                  <div className="space-y-3">
                    {invites.slice(0, 3).map(inv => (
                      <div key={inv.id} className="bg-indigo-50 p-3 rounded-lg border border-indigo-100 transition hover:shadow-sm">
                        <div className="flex items-start gap-2">
                          <div className="mt-0.5 w-2 h-2 rounded-full bg-indigo-500 flex-shrink-0"></div>
                          <div>
                            <p className="text-xs text-indigo-900 leading-tight">
                              <span className="font-bold">{inv.sender_name}</span> invited you to <span className="font-bold">{inv.team_name}</span>
                            </p>
                            <span className="text-[10px] text-indigo-400 block mt-1">Pending Action</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* --- Sent Requests Section --- */}
              <div className="p-4">
                <p className="text-xs font-bold text-slate-400 mb-3 uppercase flex items-center gap-1">
                  <ArrowUpRight size={12} /> Outgoing Requests
                </p>
                {requests.length === 0 ? (
                  <p className="text-xs text-slate-400 italic py-2">No sent requests.</p>
                ) : (
                  <div className="space-y-2">
                    {requests.slice(0, 4).map(req => (
                      <div key={req.id} className="flex justify-between items-center py-2 px-1 hover:bg-slate-50 rounded transition">
                        <div className="flex items-center gap-2 overflow-hidden">
                          <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 
                            ${req.status === 'pending' ? 'bg-orange-400' : req.status === 'accepted' ? 'bg-emerald-500' : 'bg-red-500'}`} 
                          />
                          <span className="text-xs text-slate-700 font-medium truncate">{req.team_name}</span>
                        </div>
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded capitalize 
                          ${req.status === 'pending' ? 'bg-orange-50 text-orange-600' : 
                            req.status === 'accepted' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                          {req.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer Action */}
              <div className="p-3 bg-slate-50">
                <button 
                  onClick={() => setShowModal(true)}
                  className="w-full py-2 text-xs font-bold text-slate-600 hover:text-indigo-600 bg-white border border-slate-200 hover:border-indigo-200 rounded-lg transition shadow-sm flex items-center justify-center gap-1"
                >
                  View Full History <ChevronRight size={12} />
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Modal for detailed view */}
      <RequestsModal 
        isOpen={showModal} 
        onClose={() => setShowModal(false)} 
        invites={invites}
        requests={requests}
        onRefresh={fetchData}
      />
    </div>
  );
};

export default MyTeams;