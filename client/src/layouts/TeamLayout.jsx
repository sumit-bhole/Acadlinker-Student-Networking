import React, { useEffect, useState } from "react";
import { Outlet, NavLink, useParams, Link } from "react-router-dom";
import { 
  LayoutDashboard, 
  MessageSquare, 
  CheckSquare, 
  Users, 
  Settings, 
  ArrowLeft, 
  LogOut, 
  Globe, 
  Lock, 
  Shield,
  Briefcase,
  Clock,
  Send
} from "lucide-react";
import { getTeamDetails, joinRequest, respondToRequest } from "../api/teamApi";
import TeamAIChat from "../components/Teams/TeamAIChat";

// 🚀 HELPER: Safely format image URLs
const getImageUrl = (url) => {
  if (!url) return null;
  if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("blob:")) {
    return url;
  }
  const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  return `${baseUrl}/static/uploads/${url}`;
};

const TeamLayout = () => {
  const { teamId } = useParams();
  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(true);

  const [joinMsg, setJoinMsg] = useState("");
  const [requestSent, setRequestSent] = useState(false);

  // Image loading error states
  const [imageErrorDesktop, setImageErrorDesktop] = useState(false);
  const [imageErrorMobile, setImageErrorMobile] = useState(false);
  const [imageErrorPublic, setImageErrorPublic] = useState(false);

  useEffect(() => {
    getTeamDetails(teamId)
      .then(res => setTeam(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [teamId]);

  if (loading) return <div className="h-screen flex items-center justify-center bg-slate-50 text-slate-500 font-bold">Loading Workspace...</div>;
  if (!team) return <div className="h-screen flex items-center justify-center text-slate-500 font-bold">Team not found</div>;

  const handleJoin = async () => {
    try {
      await joinRequest({ team_id: team.id, message: joinMsg });
      setRequestSent(true);
    } catch (err) {
      alert(err.response?.data?.error || "Failed to send request");
    }
  };

  const teamPicUrl = getImageUrl(team.profile_pic);

  // 🟢 Extract Leader Info for the Non-Member View
  const teamLeader = team.members?.find(m => m.role === 'leader');

  // =========================================================
  // 🔒 1. NON-MEMBER GATEKEEPER (2-Column Public Page)
  // =========================================================
  if (!team.is_member) {
    const existingReq = team.my_join_request; 
    const isPending = (existingReq?.status === 'pending') || requestSent;
    const isRejected = existingReq?.status === 'rejected' && !requestSent;
    
    const displayMsg = requestSent ? joinMsg : (existingReq?.message || joinMsg);

    return (
      <div className="min-h-screen bg-[#F8FAFC] font-sans pb-20">
        
        {/* Clean Header */}
        <div className="bg-white border-b border-slate-200 px-6 py-4 sticky top-0 z-10">
          <div className="max-w-6xl mx-auto flex items-center">
            <Link to="/teams" className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-indigo-600 transition bg-slate-50 hover:bg-indigo-50 px-3 py-1.5 rounded-lg">
              <ArrowLeft size={16} /> Back to Teams
            </Link>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 mt-8 lg:mt-12">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
            
            {/* ⬅️ COLUMN 1: TEAM INFO */}
            <div className="lg:col-span-3 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              
              <div className="bg-white rounded-[2rem] p-8 sm:p-10 border border-slate-200/60 shadow-sm">
                
                {/* Darker Circular Logo */}
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-slate-900 border-4 border-slate-800 shadow-lg flex items-center justify-center mb-6 overflow-hidden shrink-0">
                  {!imageErrorPublic && teamPicUrl ? (
                    <img src={teamPicUrl} onError={() => setImageErrorPublic(true)} className="w-full h-full object-cover" alt={team.name} />
                  ) : (
                    <span className="text-4xl font-black text-slate-300">{team.name?.[0]?.toUpperCase()}</span>
                  )}
                </div>

                <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight mb-4">
                  {team.name}
                </h1>
                
                <div className="flex flex-wrap items-center gap-3 mb-8">
                  <div className="flex items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-lg text-xs font-bold text-slate-600">
                    <Users size={16} className="text-slate-400"/> 
                    {team.member_count} Member{team.member_count !== 1 && 's'}
                  </div>
                  <div className="flex items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-lg text-xs font-bold text-slate-600 uppercase tracking-wider">
                    {team.privacy === "private" ? <Lock size={14} className="text-slate-400"/> : <Globe size={14} className="text-emerald-500"/>} 
                    {team.privacy}
                  </div>
                </div>

                <div className="prose prose-slate max-w-none">
                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-3">About this Workspace</h3>
                  <p className="text-slate-700 text-base leading-relaxed whitespace-pre-wrap">
                    {team.description || "This team hasn't provided a description yet."}
                  </p>
                </div>
              </div>

              {team.is_hiring && (
                <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-[2rem] p-8 border border-indigo-100 shadow-sm">
                  <div className="flex items-center gap-2 text-indigo-600 font-bold text-sm uppercase tracking-wider mb-3">
                    <Briefcase size={18} /> We are recruiting
                  </div>
                  <h4 className="text-lg font-bold text-indigo-950 mb-2">Ideal Candidate Profile</h4>
                  <p className="text-indigo-800/80 leading-relaxed font-medium">
                    {team.hiring_requirements}
                  </p>
                </div>
              )}
            </div>

            {/* ➡️ COLUMN 2: REQUEST FORM */}
            <div className="lg:col-span-2 lg:sticky lg:top-24 animate-in fade-in slide-in-from-bottom-8 duration-700">
              
              <div className="bg-white rounded-[2rem] p-6 sm:p-8 border border-slate-200 shadow-xl shadow-slate-200/40">
                
                {isPending ? (
                  <div className="text-center space-y-5">
                    <div className="w-16 h-16 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center mx-auto border border-amber-100">
                      <Clock size={28} strokeWidth={2.5} />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-slate-900">Request Pending</h3>
                      <p className="text-sm text-slate-500 mt-2 leading-relaxed">
                        You have already sent a request to join this team. The leader is currently reviewing it.
                      </p>
                    </div>
                    
                    <div className="text-left mt-6">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 pl-1">Your Message</p>
                      <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl text-sm text-slate-700 italic leading-relaxed break-words">
                        "{displayMsg}"
                      </div>
                    </div>
                  </div>

                ) : (
                  <div className="space-y-5">
                    <div>
                      <h3 className="text-xl font-bold text-slate-900">Join Workspace</h3>
                      <p className="text-sm text-slate-500 mt-1">
                        Introduce yourself to the team.
                      </p>

                      {/* 🟢 SUBTLE LEADER INFO WIDGET */}
                      {teamLeader && (
                        <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-100">
                          <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden shrink-0 border border-slate-200">
                            {teamLeader.profile_pic ? (
                              <img 
                                src={getImageUrl(teamLeader.profile_pic)} 
                                className="w-full h-full object-cover opacity-90" 
                                alt={teamLeader.full_name} 
                              />
                            ) : (
                              <span className="text-[10px] font-bold text-slate-400">{teamLeader.full_name?.[0]?.toUpperCase()}</span>
                            )}
                          </div>
                          <p className="text-xs text-slate-400 font-medium">
                            Request will be reviewed by <span className="font-bold text-slate-500">{teamLeader.full_name}</span>
                          </p>
                        </div>
                      )}
                    </div>

                    {isRejected && (
                      <div className="bg-rose-50 text-rose-700 text-xs font-bold p-3 rounded-xl border border-rose-100 flex items-start gap-2">
                        <Lock size={14} className="mt-0.5 shrink-0" />
                        <p>Your previous request was declined. You can try sending a new one.</p>
                      </div>
                    )}

                    <div className="relative">
                      {/* 250 Character Limit Textarea */}
                      <textarea
                        maxLength={250}
                        value={joinMsg}
                        onChange={(e) => setJoinMsg(e.target.value)}
                        placeholder="E.g., I'm a React developer with 2 years of experience. I'd love to help out!"
                        className="w-full p-4 pb-8 rounded-2xl border-2 border-slate-100 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 outline-none text-sm resize-none transition-all bg-slate-50 focus:bg-white text-slate-700 font-medium"
                        rows="5"
                      />
                      <div className={`absolute bottom-3 right-4 text-xs font-bold ${
                        joinMsg.length >= 250 ? 'text-red-500' : 'text-slate-400'
                      }`}>
                        {joinMsg.length}/250
                      </div>
                    </div>

                    <button
                      onClick={handleJoin}
                      disabled={!joinMsg.trim()}
                      className="w-full py-4 bg-slate-900 hover:bg-indigo-600 text-white rounded-2xl font-bold transition-all shadow-lg shadow-slate-900/20 disabled:opacity-50 disabled:shadow-none flex items-center justify-center gap-2 group"
                    >
                      <span>Send Request</span>
                      <Send size={16} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                    </button>
                  </div>
                )}
              </div>
              
            </div>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================
  // 🔓 2. AUTHORIZED MEMBER VIEW (Dashboard & AI Chat)
  // =========================================================
  const navItems = [
    { icon: LayoutDashboard, label: "Overview", path: "" },
    { icon: MessageSquare, label: "Chat HQ", path: "chat" },
    { icon: CheckSquare, label: "Tasks & Sprint", path: "tasks" },
    { icon: Users, label: "Members", path: "members" },
  ];

  return (
    <div className="flex h-[calc(100vh-64px)] bg-slate-50 overflow-hidden font-sans">
      
      {/* 🖥️ DESKTOP SIDEBAR */}
      <aside className="hidden md:flex flex-col w-80 bg-white border-r border-slate-200 h-full shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-20 relative">
        <div className="pt-6 px-6">
          <Link to="/teams" className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-indigo-600 transition uppercase tracking-wider">
            <ArrowLeft size={12} strokeWidth={3} /> Back to Hub
          </Link>
        </div>

        <div className="flex flex-col items-center text-center p-6 pb-2">
          <div className="relative group cursor-default">
            <div className="relative w-24 h-24 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400 text-3xl font-black shadow-sm overflow-hidden">
              {!imageErrorDesktop && teamPicUrl ? (
                <img 
                  src={teamPicUrl} 
                  onError={() => setImageErrorDesktop(true)}
                  className="w-full h-full object-cover"
                  alt={team.name}
                />
              ) : (
                team.name?.[0]?.toUpperCase()
              )}
            </div>
          </div>

          <h1 className="mt-4 text-xl font-extrabold text-slate-900 leading-tight px-2">{team.name}</h1>
          
          <div className="mt-2 flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Workspace</span>
            {team.my_role === 'leader' && (
              <span className="bg-indigo-50 text-indigo-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-indigo-100 flex items-center gap-1">
                <Shield size={10} /> LEADER
              </span>
            )}
          </div>
        </div>

        <div className="py-4 flex items-center justify-center">
          <div className="h-px w-3/4 bg-slate-100"></div>
        </div>

        <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === ""}
              className={({ isActive }) => `
                flex items-center gap-4 px-4 py-3.5 rounded-xl text-sm font-medium transition-all duration-300 group
                ${isActive 
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-200" 
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }
              `}
            >
              {({ isActive }) => (
                <>
                  <item.icon size={20} className={`transition-colors ${isActive ? "text-indigo-100" : "text-slate-400 group-hover:text-indigo-600"}`} />
                  <span>{item.label}</span>
                  {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white animate-pulse"></div>}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 mt-auto">
          <div className="bg-slate-50 rounded-xl p-1 border border-slate-100">
            <button className="flex items-center justify-center gap-2 w-full py-2 text-xs font-bold text-slate-600 hover:text-indigo-600 hover:bg-white rounded-lg transition-all shadow-sm hover:shadow">
              <Settings size={14} /> Settings
            </button>
          </div>
        </div>
      </aside>

      {/* 📱 MOBILE HEADER */}
      <div className="md:hidden fixed top-16 left-0 right-0 h-16 bg-white border-b border-slate-200 z-30 px-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400 font-black shadow-sm overflow-hidden shrink-0">
            {!imageErrorMobile && teamPicUrl ? (
              <img src={teamPicUrl} onError={() => setImageErrorMobile(true)} className="w-full h-full object-cover" alt="" />
            ) : (
              team.name?.[0]?.toUpperCase()
            )}
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-slate-900 truncate max-w-[180px] leading-tight">{team.name}</span>
            <span className="text-[10px] text-slate-500 font-medium uppercase tracking-wide">Workspace</span>
          </div>
        </div>
        <Link to="/teams" className="p-2 bg-slate-50 text-slate-400 hover:text-red-500 rounded-full transition">
          <LogOut size={18} />
        </Link>
      </div>

      {/* 🟢 MAIN CONTENT AREA */}
      <main className="flex-1 overflow-y-auto overflow-x-hidden md:p-0 pt-16 pb-20 md:pb-0 relative scroll-smooth bg-white md:bg-slate-50/50">
        <div className="h-full md:rounded-tl-[2rem] md:border-t md:border-l md:border-slate-200/60 md:bg-white md:shadow-[inset_0_2px_20px_rgba(0,0,0,0.01)] overflow-y-auto">
           <Outlet context={{ team, isLeader: team.my_role === 'leader' }} />
        </div>
      </main>

      <TeamAIChat teamId={team.id} />

      {/* 📱 MOBILE BOTTOM NAV */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-20 bg-white border-t border-slate-200 z-40 flex items-center justify-around pb-4 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === ""}
            className={({ isActive }) => `flex flex-col items-center justify-center w-full h-full space-y-1 transition-all duration-300 ${isActive ? "text-indigo-600 translate-y-[-2px]" : "text-slate-400 hover:text-slate-600"}`}
          >
            {({ isActive }) => (
              <>
                <div className={`p-1.5 rounded-full transition-all ${isActive ? "bg-indigo-50" : "bg-transparent"}`}>
                  <item.icon size={22} className={isActive ? "fill-current" : ""} />
                </div>
                <span className={`text-[10px] font-bold ${isActive ? "opacity-100" : "opacity-0 scale-0"} transition-all duration-200`}>
                  {item.label.split(' ')[0]}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </div>
  );
};

export default TeamLayout;