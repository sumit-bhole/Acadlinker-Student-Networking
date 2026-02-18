import React, { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { 
  Plus, CheckCircle, Circle, Clock, MoreHorizontal, 
  Calendar, User, Trash2, ChevronDown, ChevronRight, 
  Filter, Search, X, ArrowRight, Lock, AlertCircle
} from "lucide-react";
import { getTeamTasks, createTask, updateTaskStatus, deleteTask } from "../../api/teamApi";

// ==================================================================================
// 1. SUB-COMPONENT: Create Task Modal
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
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col">
        <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h3 className="font-bold text-lg text-slate-800">New Issue</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Title</label>
            <input 
              autoFocus
              className="w-full text-lg font-semibold border-b border-slate-200 py-2 outline-none focus:border-indigo-500 transition placeholder:text-slate-300"
              placeholder="e.g. Design new landing page"
              value={data.title}
              onChange={e => setData({...data, title: e.target.value})}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Priority</label>
              <select 
                className="w-full bg-slate-50 border border-slate-200 text-sm rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500/20"
                value={data.priority}
                onChange={e => setData({...data, priority: e.target.value})}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Assignee</label>
              <select 
                className="w-full bg-slate-50 border border-slate-200 text-sm rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500/20"
                value={data.assigned_to_id}
                onChange={e => setData({...data, assigned_to_id: e.target.value})}
              >
                <option value="">Unassigned</option>
                {members.map(m => (
                  <option key={m.user_id} value={m.user_id}>{m.full_name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-bold text-slate-500 hover:bg-slate-50 rounded-lg">Cancel</button>
            <button type="submit" disabled={loading} className="px-6 py-2 bg-slate-900 text-white text-sm font-bold rounded-lg hover:bg-black transition shadow-lg">
              {loading ? "Creating..." : "Create Task"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ==================================================================================
// 2. SUB-COMPONENT: Task List Item (The Row)
// ==================================================================================
const TaskRow = ({ task, onStatusChange, onDelete, isMe }) => {
  const priorityColor = {
    high: "bg-red-50 text-red-600 border-red-100",
    medium: "bg-orange-50 text-orange-600 border-orange-100",
    low: "bg-slate-100 text-slate-500 border-slate-200"
  };

  const statusIcons = {
    todo: <Circle size={18} className="text-slate-400" />,
    in_progress: <Clock size={18} className="text-indigo-500" />,
    done: <CheckCircle size={18} className="text-emerald-500" />
  };

  return (
    <div className={`group flex flex-col md:flex-row md:items-center gap-3 p-4 bg-white border border-slate-100 hover:border-indigo-100 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 mb-2 ${isMe ? 'bg-indigo-50/30' : ''}`}>
      
      {/* 1. Status & Title Section */}
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <button 
          title="Change Status"
          onClick={() => {
            const next = task.status === 'todo' ? 'in_progress' : task.status === 'in_progress' ? 'done' : 'todo';
            onStatusChange(task.id, next);
          }}
          className="flex-shrink-0 hover:bg-slate-100 p-1 rounded-full transition"
        >
          {statusIcons[task.status]}
        </button>
        
        <div className="flex flex-col min-w-0">
          <span className={`text-sm font-medium text-slate-900 truncate ${task.status === 'done' ? 'line-through text-slate-400' : ''}`}>
            {task.title}
          </span>
          <span className="text-[10px] text-slate-400 md:hidden">
            {task.assigned_to ? `Assigned to ${task.assigned_to.full_name}` : 'Unassigned'}
          </span>
        </div>
      </div>

      {/* 2. Metadata Section (Right Side) */}
      <div className="flex items-center justify-between md:justify-end gap-4 pl-8 md:pl-0">
        
        {/* Priority Badge */}
        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${priorityColor[task.priority]}`}>
          {task.priority}
        </span>

        {/* Assignee (Desktop View mainly) */}
        <div className="hidden md:flex items-center gap-2 min-w-[140px] justify-end">
          {task.assigned_to ? (
            <div className="flex items-center gap-2 px-2 py-1 bg-slate-50 rounded-full border border-slate-100">
              <img 
                src={task.assigned_to.profile_pic || "/default-avatar.png"} 
                className="w-5 h-5 rounded-full object-cover" 
                alt=""
              />
              <span className="text-xs font-semibold text-slate-600 truncate max-w-[80px]">
                {task.assigned_to.full_name.split(' ')[0]}
              </span>
            </div>
          ) : (
            <span className="text-xs text-slate-400 italic">Unassigned</span>
          )}
        </div>

        {/* Date */}
        {task.due_date && (
          <div className="flex items-center gap-1 text-xs font-medium text-slate-400 w-[80px]">
            <Calendar size={14} />
            <span>{new Date(task.due_date).toLocaleDateString(undefined, {month:'short', day:'numeric'})}</span>
          </div>
        )}

        {/* Delete Action */}
        <button 
          onClick={() => onDelete(task.id)}
          className="text-slate-300 hover:text-red-500 transition-colors p-1"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
};

// ==================================================================================
// 3. SUB-COMPONENT: Status Group Section
// ==================================================================================
const TaskGroup = ({ title, tasks, status, count, color, user, onStatusChange, onDelete }) => {
  const [isOpen, setIsOpen] = useState(true);

  if (tasks.length === 0) return null;

  return (
    <div className="mb-6 animate-in slide-in-from-bottom-2 duration-500">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 w-full mb-3 group"
      >
        <div className={`p-1 rounded-md bg-${color}-50 text-${color}-600`}>
          {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </div>
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest group-hover:text-slate-800 transition">
          {title}
        </h3>
        <span className="text-[10px] font-bold bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">
          {count}
        </span>
      </button>

      {isOpen && (
        <div className="space-y-1">
          {tasks.map(task => (
            <TaskRow 
              key={task.id} 
              task={task} 
              isMe={task.assigned_to?.id === user?.id}
              onStatusChange={onStatusChange}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// ==================================================================================
// 4. MAIN COMPONENT: TaskBoard
// ==================================================================================
const TaskBoard = () => {
  const { team, user } = useOutletContext() || {};
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // 'all' or 'mine'
  const [showCreateModal, setShowCreateModal] = useState(false);

  const fetchTasks = async () => {
    if (!team?.id) return;
    try {
      const res = await getTeamTasks(team.id);
      setTasks(res.data);
    } catch (err) {
      console.error("Error loading tasks", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (team?.is_member) fetchTasks();
    else setLoading(false);
  }, [team]);

  // Actions
  const handleStatusChange = async (taskId, newStatus) => {
    // Optimistic Update
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
    try {
      await updateTaskStatus(taskId, { status: newStatus });
    } catch (err) {
      console.error(err);
      fetchTasks(); // Revert on fail
    }
  };

  const handleDelete = async (taskId) => {
    if(!window.confirm("Delete this task?")) return;
    try {
      await deleteTask(taskId);
      setTasks(prev => prev.filter(t => t.id !== taskId));
    } catch(err) {
      alert("Failed to delete");
    }
  };

  // Filter Tasks
  const filtered = tasks.filter(t => filter === 'mine' ? t.assigned_to?.id === user?.id : true);
  
  // Group Tasks
  const todoTasks = filtered.filter(t => t.status === 'todo');
  const progressTasks = filtered.filter(t => t.status === 'in_progress');
  const doneTasks = filtered.filter(t => t.status === 'done');

  // Lock Screen for Non-Members
  if (!team) return <div className="p-10 text-center">Loading...</div>;
  if (!team.is_member) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] p-6 text-center">
        <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 mb-6">
          <Lock size={32} />
        </div>
        <h2 className="text-2xl font-bold text-slate-800">Workspace Locked</h2>
        <p className="text-slate-500 mt-2 max-w-sm">Join <span className="font-bold">{team.name}</span> to view and manage tasks.</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-4 lg:p-8 min-h-full">
      
      {/* --- Header & Controls --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-10">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Project Tasks</h1>
          <p className="text-slate-500 font-medium mt-1">Manage assignments and track progress</p>
          
          {/* Segmented Filter */}
          <div className="flex items-center bg-slate-100 p-1 rounded-lg mt-4 w-fit">
            <button 
              onClick={() => setFilter("all")}
              className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-2 ${filter === 'all' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              All Issues
            </button>
            <button 
              onClick={() => setFilter("mine")}
              className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-2 ${filter === 'mine' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <User size={14} /> My Issues
            </button>
          </div>
        </div>

        <button 
          onClick={() => setShowCreateModal(true)}
          className="w-full md:w-auto px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition shadow-lg shadow-indigo-200 active:scale-95"
        >
          <Plus size={18} /> New Issue
        </button>
      </div>

      {/* --- Task Lists (Grouped) --- */}
      <div className="space-y-2">
        {loading ? (
          <p className="text-center py-10 text-slate-400">Loading tasks...</p>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 border-2 border-dashed border-slate-200 rounded-2xl">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
              <CheckCircle size={32} />
            </div>
            <p className="text-slate-500 font-medium">No tasks found for this view.</p>
            {filter === 'mine' && <p className="text-xs text-slate-400 mt-1">Switch to "All Issues" to see team activity.</p>}
          </div>
        ) : (
          <>
            <TaskGroup 
              title="To Do" 
              tasks={todoTasks} 
              count={todoTasks.length} 
              color="slate" 
              user={user}
              onStatusChange={handleStatusChange} 
              onDelete={handleDelete}
            />
            
            <TaskGroup 
              title="In Progress" 
              tasks={progressTasks} 
              count={progressTasks.length} 
              color="indigo" 
              user={user}
              onStatusChange={handleStatusChange} 
              onDelete={handleDelete}
            />
            
            <TaskGroup 
              title="Completed" 
              tasks={doneTasks} 
              count={doneTasks.length} 
              color="emerald" 
              user={user}
              onStatusChange={handleStatusChange} 
              onDelete={handleDelete}
            />
          </>
        )}
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

export default TaskBoard;