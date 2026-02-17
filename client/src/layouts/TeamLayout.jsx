import React, { useEffect, useState } from "react";
import { Outlet, NavLink, useParams, Link } from "react-router-dom";
import { 
  LayoutDashboard, 
  MessageSquare, 
  CheckSquare, 
  Users, 
  Settings, 
  ArrowLeft, 
  Menu, 
  LogOut, 
  Globe, 
  Lock, 
  Shield,
  Briefcase
} from "lucide-react";
import { getTeamDetails } from "../api/teamApi";

const TeamLayout = () => {
  const { teamId } = useParams();
  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getTeamDetails(teamId)
      .then(res => setTeam(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [teamId]);

  if (loading) return <div className="h-screen flex items-center justify-center bg-slate-50 text-slate-500">Loading Workspace...</div>;
  if (!team) return <div className="h-screen flex items-center justify-center text-slate-500">Team not found</div>;

  const navItems = [
    { icon: LayoutDashboard, label: "Overview", path: "" },
    { icon: MessageSquare, label: "Chat HQ", path: "chat" },
    { icon: CheckSquare, label: "Tasks & Sprint", path: "tasks" },
    { icon: Users, label: "Members", path: "members" },
  ];

  return (
    <div className="flex h-[calc(100vh-64px)] bg-slate-50 overflow-hidden font-sans">
      
      {/* 🖥️ DESKTOP SIDEBAR - Professional & Centered */}
      <aside className="hidden md:flex flex-col w-80 bg-white border-r border-slate-200 h-full shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-20 relative">
        
        {/* 1. BACK LINK */}
        <div className="pt-6 px-6">
          <Link to="/teams" className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-indigo-600 transition uppercase tracking-wider">
            <ArrowLeft size={12} strokeWidth={3} /> Back to Hub
          </Link>
        </div>

        {/* 2. CENTERED HERO PROFILE */}
        <div className="flex flex-col items-center text-center p-6 pb-2">
          {/* Avatar Ring (Clean, No Glow) */}
          <div className="relative group cursor-default">
            <div className="relative w-24 h-24 rounded-full bg-slate-900 flex items-center justify-center text-white text-3xl font-bold border-4 border-white shadow-xl ring-1 ring-slate-100">
              {team.name[0].toUpperCase()}
            </div>
            {/* Status Indicator */}
            <div className="absolute bottom-1 right-1 w-7 h-7 bg-white rounded-full flex items-center justify-center shadow-md border border-slate-100">
              {team.privacy === 'private' ? (
                <Lock size={12} className="text-slate-500" />
              ) : (
                <Globe size={12} className="text-emerald-500" />
              )}
            </div>
          </div>

          {/* Name & Role */}
          <h1 className="mt-4 text-xl font-extrabold text-slate-900 leading-tight px-2">{team.name}</h1>
          
          <div className="mt-2 flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Workspace</span>
            {team.my_role === 'leader' && (
              <span className="bg-indigo-50 text-indigo-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-indigo-100 flex items-center gap-1">
                <Shield size={10} /> LEADER
              </span>
            )}
          </div>

          <p className="mt-3 text-xs text-slate-500 leading-relaxed line-clamp-2 max-w-[200px]">
            {team.description || "No description provided."}
          </p>
        </div>

        {/* Divider with Gradient */}
        <div className="py-6 flex items-center justify-center">
          <div className="h-px w-3/4 bg-gradient-to-r from-transparent via-slate-200 to-transparent"></div>
        </div>

        {/* 3. NAVIGATION MENU */}
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
                  <item.icon 
                    size={20} 
                    className={`transition-colors ${isActive ? "text-indigo-100" : "text-slate-400 group-hover:text-indigo-600"}`} 
                  />
                  <span>{item.label}</span>
                  {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white animate-pulse"></div>}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* 4. FOOTER ACTIONS */}
        <div className="p-4 mt-auto">
          <div className="bg-slate-50 rounded-xl p-1 border border-slate-100">
            <button className="flex items-center justify-center gap-2 w-full py-2 text-xs font-bold text-slate-600 hover:text-indigo-600 hover:bg-white rounded-lg transition-all shadow-sm hover:shadow">
              <Settings size={14} /> Settings
            </button>
          </div>
        </div>
      </aside>

      {/* 📱 MOBILE HEADER (Sticky) */}
      <div className="md:hidden fixed top-16 left-0 right-0 h-16 bg-white border-b border-slate-200 z-30 px-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white font-bold shadow-md">
            {team.name[0]}
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

      {/* 📱 MOBILE BOTTOM NAV */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-20 bg-white border-t border-slate-200 z-40 flex items-center justify-around pb-4 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === ""}
            className={({ isActive }) => `
              flex flex-col items-center justify-center w-full h-full space-y-1 transition-all duration-300
              ${isActive ? "text-indigo-600 translate-y-[-2px]" : "text-slate-400 hover:text-slate-600"}
            `}
          >
            {({ isActive }) => (
              <>
                <div className={`p-1.5 rounded-full transition-all ${isActive ? "bg-indigo-50" : "bg-transparent"}`}>
                  <item.icon size={22} className={isActive ? "fill-current" : ""} />
                </div>
                <span className={`text-[10px] font-bold ${isActive ? "opacity-100" : "opacity-0 scale-0"} transition-all duration-200`}>
                  {item.label.split(' ')[0]} {/* Show short label */}
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