import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { CheckCircle, Clock, ChevronDown, Activity, User, Trophy, ArrowRight} from "lucide-react";

// Helper for images
const getImageUrl = (url) => {
  if (!url) return null;
  if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("blob:")) return url;
  const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  return `${baseUrl}/static/uploads/${url}`;
};

const ActiveSprintWidget = ({ tasks = [], members = [] }) => {
  const [viewContext, setViewContext] = useState("all");

  // 🧠 DYNAMIC INSIGHTS
  const insights = useMemo(() => {
    const contextTasks = viewContext === "all" 
      ? tasks 
      : tasks.filter(t => t.assigned_to && String(t.assigned_to.id) === String(viewContext));

    const total = contextTasks.length;
    const doneTasks = contextTasks.filter(t => t.status === 'done');
    const inProgressTasks = contextTasks.filter(t => t.status === 'in_progress');
    
    // Sort tasks: High priority first
    const priorityScore = { high: 3, medium: 2, low: 1 };
    const sortedInProgress = inProgressTasks.sort((a, b) => priorityScore[b.priority] - priorityScore[a.priority]);
    const sortedDone = doneTasks.sort((a, b) => priorityScore[b.priority] - priorityScore[a.priority]);

    // 🏆 Top Contributor
    let topPerformer = null;
    if (viewContext === 'all' && tasks.length > 0) {
      const completions = {};
      tasks.filter(t => t.status === 'done' && t.assigned_to).forEach(t => {
        completions[t.assigned_to.id] = (completions[t.assigned_to.id] || 0) + 1;
      });
      
      const topId = Object.keys(completions).sort((a, b) => completions[b] - completions[a])[0];
      if (topId && completions[topId] > 0) {
        const topMember = members.find(m => String(m.user_id) === String(topId));
        if (topMember) topPerformer = { ...topMember, count: completions[topId] };
      }
    }

    return {
      total,
      doneCount: doneTasks.length,
      inProgressCount: inProgressTasks.length,
      progressPct: total === 0 ? 0 : Math.round((doneTasks.length / total) * 100),
      displayTasks: [...sortedInProgress, ...sortedDone], 
      topPerformer
    };
  }, [tasks, viewContext, members]);

  // 🎨 Priority Row Styling Helper
  const getRowStyle = (priority, isDone) => {
    const base = "flex items-center gap-3 p-2.5 rounded-lg border transition-colors group border-l-4 ";
    if (isDone) {
      return base + (
        priority === 'high' ? 'bg-rose-50/40 border-l-rose-300 border-rose-100/50 opacity-70' :
        priority === 'medium' ? 'bg-amber-50/40 border-l-amber-300 border-amber-100/50 opacity-70' :
        'bg-slate-50 border-l-slate-300 border-slate-100 opacity-70'
      );
    }
    return base + (
      priority === 'high' ? 'bg-rose-50/80 border-l-rose-500 border-rose-100 hover:bg-rose-100/80' :
      priority === 'medium' ? 'bg-amber-50/80 border-l-amber-400 border-amber-100 hover:bg-amber-100/80' :
      'bg-white border-l-slate-300 border-slate-200 hover:bg-slate-50'
    );
  };

  return (
    // 🟢 Reduced height to h-[380px]
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col h-[380px] overflow-hidden text-slate-800 font-sans">
      
      {/* =========================================
          1. COMPACT HEADER
          ========================================= */}
      <div className="px-5 py-4 border-b border-slate-100 bg-white shrink-0 z-20 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <h3 className="font-bold text-slate-900 flex items-center gap-2 text-sm tracking-tight">
            <Activity size={16} className="text-slate-700" /> Team Sprint
          </h3>

          {insights.topPerformer && viewContext === 'all' && (
            <div className="hidden sm:flex items-center gap-1.5 px-2 py-1 bg-amber-50 border border-amber-100 rounded-md text-[10px] font-bold text-amber-700">
              <Trophy size={12} className="text-amber-500" />
              {insights.topPerformer.full_name.split(' ')[0]} ({insights.topPerformer.count} done)
            </div>
          )}
        </div>
        
        <div className="relative">
          <select 
            value={viewContext}
            onChange={(e) => setViewContext(e.target.value)}
            className="appearance-none bg-white border border-slate-200 text-xs font-medium text-slate-700 rounded-lg pl-3 pr-8 py-1.5 outline-none cursor-pointer focus:ring-2 focus:ring-indigo-500/20 hover:bg-slate-50 transition-all"
          >
            <option value="all">Overall Team</option>
            {members.map(m => (
              <option key={m.user_id} value={m.user_id}>
                {m.full_name} {m.role === 'leader' ? '(Leader)' : ''}
              </option>
            ))}
          </select>
          <ChevronDown size={14} className="absolute right-2.5 top-2 pointer-events-none text-slate-400" />
        </div>
      </div>

      {/* =========================================
          2. MINIMAL PROGRESS BAR
          ========================================= */}
      <div className="px-5 py-3 border-b border-slate-100 shrink-0 bg-slate-50/50">
        <div className="flex justify-between items-end mb-2">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
            {viewContext === 'all' ? 'Sprint Completion' : 'Member Progress'}
          </span>
          <span className="text-lg font-black text-slate-900 leading-none">
            {insights.progressPct}%
          </span>
        </div>
        
        <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden flex">
          <div className="h-full bg-emerald-500 transition-all duration-500" style={{ width: `${insights.progressPct}%` }} />
          <div className="h-full bg-indigo-400 opacity-40 transition-all duration-500" style={{ width: `${insights.total === 0 ? 0 : (insights.inProgressCount / insights.total) * 100}%` }} />
        </div>

        <div className="flex justify-between mt-2.5 text-[10px] font-semibold text-slate-500">
          <span className="flex items-center gap-1 text-slate-700"><CheckCircle size={12} className="text-emerald-500"/> {insights.doneCount} Done</span>
          <span className="flex items-center gap-1"><Clock size={12} className="text-indigo-400"/> {insights.inProgressCount} Active</span>
        </div>
      </div>

      {/* =========================================
          3. FULL-ROW COLORED TASK LIST
          ========================================= */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-white [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        
        {insights.displayTasks.length > 0 ? (
          insights.displayTasks.map(task => {
            const isDone = task.status === 'done';
            const isActive = task.status === 'in_progress';

            return (
              <div 
                key={task.id} 
                // 🟢 Uses the new helper function to color the entire row based on priority
                className={getRowStyle(task.priority, isDone)}
              >
                {/* Status Indicator */}
                <div className="shrink-0 flex items-center justify-center w-4 h-4 ml-1">
                  {isActive && <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" title="In Progress" />}
                  {isDone && <CheckCircle size={14} className="text-emerald-500" title="Completed" />}
                </div>

                {/* Task Title */}
                <p className={`text-sm font-medium truncate flex-1 ${isDone ? 'text-slate-500 line-through' : 'text-slate-800'}`}>
                  {task.title}
                </p>

                {/* Right Aligned Assignee Image */}
                <div className="shrink-0 flex items-center justify-end w-8">
                  {task.assigned_to ? (
                    <img 
                      src={getImageUrl(task.assigned_to.profile_pic) || "/default-avatar.png"} 
                      className={`w-6 h-6 rounded-full object-cover border border-slate-200 bg-white`} 
                      title={task.assigned_to.full_name}
                      alt={task.assigned_to.full_name}
                    />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400" title="Unassigned">
                      <User size={10}/>
                    </div>
                  )}
                </div>
                
              </div>
            );
          })
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center p-6 text-slate-400">
            <CheckCircle size={24} className="mb-2 opacity-50" />
            <p className="text-sm font-medium text-slate-600">No active or completed tasks.</p>
          </div>
        )}
      </div>

      {/* =========================================
          4. MINIMAL FOOTER
          ========================================= */}
      <div className="p-3 border-t border-slate-100 bg-slate-50 shrink-0 text-center">
        <Link to="tasks" className="text-xs font-medium text-slate-500 hover:text-indigo-600 transition flex items-center justify-center gap-1 group">
          View full board <ArrowRight size={12} className="group-hover:translate-x-1 transition"/>
        </Link>
      </div>

    </div>
  );
};

export default ActiveSprintWidget;