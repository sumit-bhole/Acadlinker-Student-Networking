import React, { useEffect, useState, useMemo } from "react";
import { useOutletContext } from "react-router-dom";
import { 
  Plus, CheckCircle, Circle, Clock, MoreHorizontal, 
  Calendar, User, Trash2, ChevronDown, 
  Filter, Search, X, Lock, AlertCircle, 
  Layers, ArrowUp, ArrowRight, Zap, Briefcase
} from "lucide-react";
import { getTeamTasks, createTask, updateTaskStatus, deleteTask } from "../../api/teamApi";

// ==================================================================================
// 1. HELPER: Priority & Status Styles
// ==================================================================================
const getPriorityColor = (p) => {
  switch (p) {
    case 'high': return 'border-l-rose-500 bg-rose-50/30';
    case 'medium': return 'border-l-amber-500 bg-amber-50/30';
    default: return 'border-l-slate-300 bg-white';
  }
};

const getStatusBadgeStyles = (s) => {
  switch (s) {
    case 'done': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    case 'in_progress': return 'bg-blue-100 text-blue-700 border-blue-200';
    default: return 'bg-slate-100 text-slate-600 border-slate-200';
  }
};

// ==================================================================================
// 2. COMPONENT: Status Dropdown (New Feature)
// ==================================================================================
const StatusDropdown = ({ currentStatus, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);

  const options = [
    { id: 'todo', label: 'To Do', icon: Circle, color: 'text-slate-500' },
    { id: 'in_progress', label: 'In Progress', icon: Clock, color: 'text-blue-600' },
    { id: 'done', label: 'Done', icon: CheckCircle, color: 'text-emerald-600' }
  ];

  const current = options.find(o => o.id === currentStatus) || options[0];

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${getStatusBadgeStyles(currentStatus)} hover:brightness-95`}
      >
        <current.icon size={14} />
        <span className="uppercase tracking-wider">{current.label}</span>
        <ChevronDown size={12} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`}/>
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute top-full left-0 mt-1 w-40 bg-white border border-slate-200 rounded-xl shadow-xl z-20 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
            {options.map(opt => (
              <button
                key={opt.id}
                onClick={() => { onChange(opt.id); setIsOpen(false); }}
                className="flex items-center gap-2 w-full px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition text-left"
              >
                <opt.icon size={14} className={opt.color} />
                {opt.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

// ==================================================================================
// 3. COMPONENT: Create Task Modal
// ==================================================================================
const CreateTaskModal = ({ onClose, teamId, members, onTaskCreated }) => {
  const [data, setData] = useState({ title: "", description: "", priority: "medium", assigned_to_id: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!data.title.trim()) return;
    setLoading(true);
    try {
      await createTask({ team_id: teamId, ...data });
      onTaskCreated();
      onClose();
    } catch (err) {
      alert("Failed to create task");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
        <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-[#1e1b4b] text-white">
          <div className="flex items-center gap-2">
            <Briefcase size={18} className="text-indigo-300" />
            <h3 className="font-bold text-lg">Create New Task</h3>
          </div>
          <button onClick={onClose} className="text-white/60 hover:text-white transition"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Task Description</label>
            <input 
              autoFocus
              className="w-full text-lg font-bold border-b-2 border-slate-100 py-2 outline-none focus:border-indigo-600 transition placeholder:text-slate-300 text-slate-800"
              placeholder="What needs to be done?"
              value={data.title}
              onChange={e => setData({...data, title: e.target.value})}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-5">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Priority</label>
              <div className="relative">
                <select 
                  className="w-full appearance-none bg-slate-50 border border-slate-200 text-sm font-semibold rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer"
                  value={data.priority}
                  onChange={e => setData({...data, priority: e.target.value})}
                >
                  <option value="low">Low Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="high">High Priority</option>
                </select>
                <ChevronDown size={14} className="absolute right-3 top-3.5 text-slate-400 pointer-events-none" />
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Assign To</label>
              <div className="relative">
                <select 
                  className="w-full appearance-none bg-slate-50 border border-slate-200 text-sm font-semibold rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer"
                  value={data.assigned_to_id}
                  onChange={e => setData({...data, assigned_to_id: e.target.value})}
                >
                  <option value="">Unassigned</option>
                  {members.map(m => (
                    <option key={m.user_id} value={m.user_id}>{m.full_name}</option>
                  ))}
                </select>
                <ChevronDown size={14} className="absolute right-3 top-3.5 text-slate-400 pointer-events-none" />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-50">
            <button type="button" onClick={onClose} className="px-5 py-2.5 text-xs font-bold text-slate-500 hover:bg-slate-50 rounded-xl transition">Cancel</button>
            <button type="submit" disabled={loading} className="px-6 py-2.5 bg-indigo-600 text-white text-xs font-bold rounded-xl hover:bg-indigo-700 transition shadow-lg shadow-indigo-200 flex items-center gap-2">
              {loading ? <Clock size={14} className="animate-spin"/> : <Plus size={16} />}
              Add Task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ==================================================================================
// 4. MAIN COMPONENT: TaskBoard
// ==================================================================================
const TaskBoard = () => {
  const { team, user } = useOutletContext() || {};
  const teamId = team?.id;
  const isMember = team?.is_member;

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // 🎛️ VIEW STATES
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState("all"); // 'all' or 'mine'

  const fetchTasks = async () => {
    if (!teamId) return;
    try {
      const res = await getTeamTasks(teamId);
      setTasks(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isMember) fetchTasks();
    else setLoading(false);
  }, [team, isMember]);

  // --- 🧠 SORTING & FILTERING LOGIC ---
  const priorityWeight = { high: 3, medium: 2, low: 1 };

  const processedTasks = tasks
    .filter(task => {
      const matchesSearch = task.title.toLowerCase().includes(search.toLowerCase());
      // 🟢 FIX: Ensure IDs are compared as strings to avoid type mismatch bugs
      const matchesUser = viewMode === 'all' || String(task.assigned_to?.id) === String(user?.id);
      return matchesSearch && matchesUser;
    })
    .sort((a, b) => {
      // 🟢 FIX: Sort High -> Medium -> Low
      return priorityWeight[b.priority] - priorityWeight[a.priority];
    });

  const todoTasks = processedTasks.filter(t => t.status === 'todo');
  const progressTasks = processedTasks.filter(t => t.status === 'in_progress');
  const doneTasks = processedTasks.filter(t => t.status === 'done');

  // Actions
  const handleStatusChange = async (taskId, newStatus) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
    await updateTaskStatus(taskId, { status: newStatus });
  };

  const handleDelete = async (taskId) => {
    if(!window.confirm("Delete this task?")) return;
    await deleteTask(taskId);
    setTasks(prev => prev.filter(t => t.id !== taskId));
  };

  // Lock Screen
  if (!team) return <div className="p-12 text-center animate-pulse">Loading Workspace...</div>;
  if (!isMember) return (
    <div className="flex flex-col items-center justify-center h-[70vh] bg-slate-50/50 rounded-3xl m-4 border border-dashed border-slate-300">
      <div className="bg-white p-4 rounded-full shadow-lg mb-4"><Lock size={32} className="text-slate-400"/></div>
      <h2 className="text-2xl font-black text-slate-800">Workspace Locked</h2>
      <p className="text-slate-500 font-medium">Join {team.name} to access tasks.</p>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto min-h-screen bg-[#F8FAFC]">
      
      {/* 1. 🟣 DARK PURPLE HEADER */}
      <div className="bg-gradient-to-r from-[#1e1b4b] via-[#312e81] to-[#4338ca] text-white p-6 md:p-10 pb-20 shadow-2xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div>
            <h1 className="text-3xl font-black tracking-tight flex items-center gap-3">
              <Layers className="text-indigo-300" /> Project Tasks
            </h1>
            <p className="text-indigo-200 mt-2 font-medium max-w-lg text-sm leading-relaxed">
              Track progress, assign responsibilities, and ship faster. Manage your sprint workflow here.
            </p>
          </div>
          
          <button 
            onClick={() => setShowCreateModal(true)}
            className="bg-white text-indigo-900 hover:bg-indigo-50 px-6 py-3 rounded-xl text-sm font-bold flex items-center gap-2 transition shadow-xl active:scale-95 w-full md:w-auto justify-center"
          >
            <Plus size={18} strokeWidth={3} /> Create Task
          </button>
        </div>
        
        {/* Background Patterns */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
      </div>

      {/* 2. 🎛️ FLOATING TOOLBAR */}
      <div className="max-w-6xl mx-auto -mt-8 px-4 relative z-20">
        <div className="bg-white p-2 rounded-2xl shadow-lg border border-slate-200/60 flex flex-col md:flex-row items-center justify-between gap-3">
          
          {/* Toggle: All vs Mine */}
          <div className="flex bg-slate-100 p-1 rounded-xl w-full md:w-auto">
            <button 
              onClick={() => setViewMode('all')} 
              className={`flex-1 md:flex-none px-6 py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-2 ${viewMode === 'all' ? 'bg-white shadow-sm text-[#1e1b4b]' : 'text-slate-500 hover:text-slate-700'}`}
            >
              All Tasks
            </button>
            <button 
              onClick={() => setViewMode('mine')} 
              className={`flex-1 md:flex-none px-6 py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-2 ${viewMode === 'mine' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <User size={14} /> My Tasks
            </button>
          </div>

          {/* Search */}
          <div className="relative w-full md:w-72">
            <Search size={16} className="absolute left-3 top-3 text-slate-400" />
            <input 
              placeholder="Search tasks..." 
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500/20 transition"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* 3. 📋 TASK SECTIONS */}
      <div className="max-w-6xl mx-auto p-4 lg:p-6 space-y-10">
        
        {/* Loading */}
        {loading && (
          <div className="space-y-4 pt-8">
            {[1,2,3].map(i => <div key={i} className="h-20 bg-slate-200/50 rounded-xl animate-pulse"/>)}
          </div>
        )}

        {/* Empty State */}
        {!loading && processedTasks.length === 0 && (
          <div className="py-20 text-center border-2 border-dashed border-slate-200 rounded-3xl bg-white mt-8">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Filter size={24} className="text-slate-300" />
            </div>
            <h3 className="text-slate-900 font-bold">No tasks found</h3>
            <p className="text-slate-500 text-xs mt-1">Adjust filters or create a new task.</p>
          </div>
        )}

        <TaskSection title="Backlog / To Do" tasks={todoTasks} color="slate" user={user} onStatusChange={handleStatusChange} onDelete={handleDelete} />
        <TaskSection title="In Progress" tasks={progressTasks} color="blue" user={user} onStatusChange={handleStatusChange} onDelete={handleDelete} />
        <TaskSection title="Completed" tasks={doneTasks} color="emerald" user={user} onStatusChange={handleStatusChange} onDelete={handleDelete} />

      </div>

      {showCreateModal && (
        <CreateTaskModal 
          teamId={team.id} 
          members={team.members} 
          onClose={() => setShowCreateModal(false)} 
          onTaskCreated={fetchTasks} 
        />
      )}
    </div>
  );
};

// ==================================================================================
// 5. SUB-COMPONENT: Task Section & Row
// ==================================================================================
const TaskSection = ({ title, tasks, color, user, onStatusChange, onDelete }) => {
  if (tasks.length === 0) return null;

  return (
    <div className="animate-in slide-in-from-bottom-4 duration-500">
      {/* Section Header */}
      <div className="flex items-center gap-3 mb-4 ml-1">
        <div className={`h-3 w-3 rounded-full bg-${color}-500 ring-4 ring-${color}-100`}></div>
        <h3 className="text-sm font-black text-slate-700 uppercase tracking-widest">{title}</h3>
        <span className="text-[10px] font-bold bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">{tasks.length}</span>
      </div>

      <div className="space-y-3">
        {tasks.map(task => {
          // Check if "Working On" (Assigned to me AND In Progress)
          const isWorkingOn = task.status === 'in_progress' && String(task.assigned_to?.id) === String(user?.id);

          return (
            <div 
              key={task.id} 
              className={`group flex flex-col md:flex-row items-start md:items-center gap-4 p-4 bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-lg transition-all duration-200 border-l-[6px] ${getPriorityColor(task.priority)}`}
            >
              {/* Status Badge Dropdown */}
              <div className="flex-shrink-0">
                <StatusDropdown currentStatus={task.status} onChange={(newStatus) => onStatusChange(task.id, newStatus)} />
              </div>

              {/* Title & "Working On" Tag */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className={`text-sm font-bold text-slate-800 ${task.status === 'done' ? 'line-through text-slate-400' : ''}`}>
                    {task.title}
                  </span>
                  {isWorkingOn && (
                    <span className="flex items-center gap-1 bg-indigo-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-full shadow-sm animate-pulse">
                      <Zap size={10} fill="currentColor" /> Working On
                    </span>
                  )}
                </div>
                
                {/* Meta Info: Priority Text & Date */}
                <div className="flex items-center gap-3 text-xs text-slate-500">
                  <span className={`font-bold uppercase text-[10px] ${task.priority === 'high' ? 'text-rose-600' : task.priority === 'medium' ? 'text-amber-600' : 'text-slate-500'}`}>
                    {task.priority} Priority
                  </span>
                  {task.due_date && (
                    <span className="flex items-center gap-1">
                      <Calendar size={12} /> {new Date(task.due_date).toLocaleDateString(undefined, {month:'short', day:'numeric'})}
                    </span>
                  )}
                </div>
              </div>

              {/* Right: Assignee & Delete */}
              <div className="flex items-center justify-between w-full md:w-auto gap-4 mt-2 md:mt-0 pl-1 md:pl-0 border-t md:border-t-0 border-slate-50 pt-3 md:pt-0">
                
                {/* Assignee Pill */}
                {task.assigned_to ? (
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-lg">
                    <img src={task.assigned_to.profile_pic || "/default-avatar.png"} className="w-5 h-5 rounded-full object-cover" alt=""/>
                    <span className="text-xs font-bold text-slate-700 max-w-[100px] truncate">
                      {task.assigned_to.full_name}
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-dashed border-slate-300 rounded-lg opacity-60">
                    <User size={14} />
                    <span className="text-xs font-bold">Unassigned</span>
                  </div>
                )}

                {/* Delete (Visible on Hover/Mobile) */}
                <button 
                  onClick={() => onDelete(task.id)}
                  className="opacity-100 md:opacity-0 group-hover:opacity-100 p-2 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                  title="Delete Task"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TaskBoard;