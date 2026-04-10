import React, { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import api from "../../api/axios";
import { 
  Plus, CheckCircle, Circle, Clock, 
  Calendar, User, Trash2, ChevronDown, 
  Filter, Search, X, Layers, Zap, Briefcase,
  AlertTriangle, UploadCloud, Link as LinkIcon, Edit3
} from "lucide-react";
import { getTeamTasks, createTask, updateTaskStatus, deleteTask } from "../../api/teamApi";

// ==================================================================================
// 1. HELPERS
// ==================================================================================
const getImageUrl = (url) => {
  if (!url) return null;
  if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("blob:")) return url;
  const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  return `${baseUrl}/static/uploads/${url}`;
};

const getPriorityColor = (p) => {
  switch (p) {
    case 'high': return 'border-l-rose-500 bg-rose-50/30 hover:bg-rose-50/60';
    case 'medium': return 'border-l-amber-400 bg-amber-50/30 hover:bg-amber-50/60';
    default: return 'border-l-slate-300 bg-white hover:bg-slate-50';
  }
};

const getStatusStyles = (s) => {
  switch (s) {
    case 'done': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    case 'in_progress': return 'bg-indigo-100 text-indigo-800 border-indigo-200';
    default: return 'bg-slate-100 text-slate-700 border-slate-200';
  }
};

// ==================================================================================
// 2. COMPONENT: Status Dropdown
// ==================================================================================
const StatusBadge = ({ currentStatus, onChange, disabled }) => {
  const [isOpen, setIsOpen] = useState(false);

  const options = [
    { id: 'todo', label: 'To Do', icon: Circle, color: 'text-slate-500' },
    { id: 'in_progress', label: 'In Progress', icon: Clock, color: 'text-indigo-600' },
    { id: 'done', label: 'Done', icon: CheckCircle, color: 'text-emerald-600' }
  ];

  const current = options.find(o => o.id === currentStatus) || options[0];

  if (disabled) {
    return (
      <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border opacity-70 cursor-not-allowed ${getStatusStyles(currentStatus)}`}>
        <current.icon size={14} />
        <span className="uppercase tracking-wider">{current.label}</span>
      </div>
    );
  }

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${getStatusStyles(currentStatus)} hover:brightness-95`}
      >
        <current.icon size={14} />
        <span className="uppercase tracking-wider">{current.label}</span>
        <ChevronDown size={14} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`}/>
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
// 3. COMPONENT: Proof of Work Modal
// ==================================================================================
const ProofOfWorkModal = ({ task, onClose, onSubmit }) => {
  const [proofText, setProofText] = useState("");
  const [proofLink, setProofLink] = useState("");
  const [proofImage, setProofImage] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!proofText.trim()) return;

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("status", "done");
      formData.append("proof_text", proofText);
      if (proofLink) formData.append("proof_link", proofLink);
      if (proofImage) formData.append("proof_image", proofImage);

      await api.patch(`/api/tasks/${task.id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      
      onSubmit(); 
      onClose();
    } catch (err) {
      alert(err.response?.data?.error || "Failed to submit proof");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-lg rounded-[2rem] shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
        <div className="p-6 border-b border-slate-100 bg-emerald-50">
          <h3 className="font-black text-xl text-emerald-900 flex items-center gap-2">
            <CheckCircle className="text-emerald-500" /> Complete Task
          </h3>
          <p className="text-sm text-emerald-700 mt-1 font-medium">Provide proof of work to lock "{task.title}".</p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Summary of Work <span className="text-rose-500">*</span></label>
            <textarea 
              required rows={3}
              className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 outline-none focus:border-emerald-500 focus:bg-white transition resize-none text-sm font-medium text-slate-800"
              placeholder="Briefly describe what you completed..."
              value={proofText}
              onChange={e => setProofText(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Relevant Link</label>
            <div className="relative">
              <LinkIcon size={16} className="absolute left-3 top-3 text-slate-400" />
              <input 
                type="url"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border-2 border-slate-100 rounded-xl outline-none focus:border-emerald-500 focus:bg-white transition text-sm text-slate-800"
                placeholder="e.g. GitHub PR, Figma link (Optional)"
                value={proofLink}
                onChange={e => setProofLink(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Attachment</label>
            <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-slate-200 border-dashed rounded-xl cursor-pointer bg-slate-50 hover:bg-slate-100 transition">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <UploadCloud size={24} className="text-slate-400 mb-1" />
                <p className="text-xs text-slate-500 font-medium">
                  {proofImage ? proofImage.name : "Click to upload an image (Optional)"}
                </p>
              </div>
              <input type="file" accept="image/*" className="hidden" onChange={e => setProofImage(e.target.files[0])} />
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={onClose} className="px-5 py-2.5 text-sm font-bold text-slate-500 hover:bg-slate-100 rounded-xl transition">Cancel</button>
            <button type="submit" disabled={loading || !proofText.trim()} className="px-6 py-2.5 bg-emerald-600 text-white text-sm font-bold rounded-xl hover:bg-emerald-700 transition shadow-lg flex items-center gap-2 disabled:opacity-50">
              {loading ? <Clock size={16} className="animate-spin"/> : <CheckCircle size={16} />} Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ==================================================================================
// 4. COMPONENT: Create & Edit Task Modal
// ==================================================================================
const TaskFormModal = ({ onClose, teamId, members, onTaskSaved, isLeader, myUserId, taskToEdit = null }) => {
  const isEditMode = !!taskToEdit;
  
  const [data, setData] = useState({ 
    title: taskToEdit?.title || "", 
    description: taskToEdit?.description || "", 
    priority: taskToEdit?.priority || "medium", 
    assigned_to_id: taskToEdit?.assigned_to?.id || "" 
  });
  
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!data.title.trim()) return;
    setLoading(true);

    const payload = {
      title: data.title,
      description: data.description,
      priority: data.priority,
      assigned_to_id: data.assigned_to_id === "" ? null : data.assigned_to_id
    };

    try {
      if (isEditMode) {
        await updateTaskStatus(taskToEdit.id, payload);
      } else {
        await createTask({ team_id: teamId, ...payload });
      }
      onTaskSaved();
      onClose();
    } catch (err) {
      alert(`Failed to ${isEditMode ? 'update' : 'create'} task`);
    } finally {
      setLoading(false);
    }
  };

  const assignableMembers = isLeader ? members : members.filter(m => String(m.user_id) === String(myUserId));

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-lg rounded-[2rem] shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-900 text-white">
          <div className="flex items-center gap-3">
            {isEditMode ? <Edit3 size={20} className="text-indigo-400" /> : <Briefcase size={20} className="text-indigo-400" />}
            <h3 className="font-black text-xl">{isEditMode ? "Edit Task" : "Create New Task"}</h3>
          </div>
          <button onClick={onClose} className="text-white/60 hover:text-white transition"><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Task Title <span className="text-rose-500">*</span></label>
            <input 
              autoFocus required
              className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 outline-none focus:border-indigo-500 focus:bg-white transition text-sm font-bold text-slate-800 placeholder:font-medium placeholder:text-slate-400"
              placeholder="What needs to be done?"
              value={data.title}
              onChange={e => setData({...data, title: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Description</label>
            <textarea 
              rows={3}
              className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 outline-none focus:border-indigo-500 focus:bg-white transition resize-none text-sm font-medium text-slate-800"
              placeholder="Add details, requirements, or context..."
              value={data.description}
              onChange={e => setData({...data, description: e.target.value})}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Priority</label>
              <div className="relative">
                <select 
                  className="w-full appearance-none bg-slate-50 border-2 border-slate-100 text-sm font-bold text-slate-700 rounded-xl px-4 py-3 outline-none focus:border-indigo-500 focus:bg-white cursor-pointer transition"
                  value={data.priority}
                  onChange={e => setData({...data, priority: e.target.value})}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
                <ChevronDown size={16} className="absolute right-4 top-3.5 text-slate-400 pointer-events-none" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Assign To</label>
              <div className="relative">
                <select 
                  className="w-full appearance-none bg-slate-50 border-2 border-slate-100 text-sm font-bold text-slate-700 rounded-xl px-4 py-3 outline-none focus:border-indigo-500 focus:bg-white cursor-pointer transition"
                  value={data.assigned_to_id}
                  onChange={e => setData({...data, assigned_to_id: e.target.value})}
                >
                  <option value="">Unassigned</option>
                  {assignableMembers.map(m => (
                    <option key={m.user_id} value={m.user_id}>{m.full_name} {String(m.user_id) === String(myUserId) ? "(Me)" : ""}</option>
                  ))}
                </select>
                <ChevronDown size={16} className="absolute right-4 top-3.5 text-slate-400 pointer-events-none" />
              </div>
              {!isLeader && <p className="text-[9px] text-slate-400 mt-1 font-medium leading-tight">Members can only assign tasks to themselves.</p>}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button type="button" onClick={onClose} className="px-5 py-2.5 text-sm font-bold text-slate-500 hover:bg-slate-100 rounded-xl transition">Cancel</button>
            <button type="submit" disabled={loading || !data.title.trim()} className="px-6 py-2.5 bg-slate-900 text-white text-sm font-bold rounded-xl hover:bg-indigo-600 transition shadow-lg flex items-center gap-2 disabled:opacity-50">
              {loading ? <Clock size={16} className="animate-spin"/> : (isEditMode ? <CheckCircle size={16} /> : <Plus size={16} />)} 
              {isEditMode ? "Save Changes" : "Create Task"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ==================================================================================
// 5. MAIN COMPONENT: TaskBoard
// ==================================================================================
const TaskBoard = () => {
  const { team } = useOutletContext() || {};
  const teamId = team?.id;
  const isLeader = team?.my_role === 'leader';
  const myUserId = team?.my_user_id;

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState(null);
  const [taskToComplete, setTaskToComplete] = useState(null);

  // 🟢 NEW: Filter States
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState("all"); 
  const [showFilters, setShowFilters] = useState(false);
  const [activePriorities, setActivePriorities] = useState([]);
  const [activeAssignees, setActiveAssignees] = useState([]);

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
    fetchTasks();
  }, [team]);

  // 🟢 Enhanced Filtering Logic
  const priorityWeight = { high: 3, medium: 2, low: 1 };
  
  const processedTasks = tasks
    .filter(task => {
      // 1. Text Search
      const matchesSearch = task.title.toLowerCase().includes(search.toLowerCase());
      
      // 2. View Mode Toggle (Quick Filter)
      const matchesViewMode = viewMode === 'all' || (task.assigned_to && String(task.assigned_to.id) === String(myUserId));
      
      // 3. Priority Filters (OR logic within array)
      const matchesPriority = activePriorities.length === 0 || activePriorities.includes(task.priority);
      
      // 4. Assignee Filters (OR logic within array)
      const taskAssigneeId = task.assigned_to ? String(task.assigned_to.id) : "unassigned";
      const matchesAssignee = activeAssignees.length === 0 || activeAssignees.includes(taskAssigneeId);

      return matchesSearch && matchesViewMode && matchesPriority && matchesAssignee;
    })
    .sort((a, b) => priorityWeight[b.priority] - priorityWeight[a.priority]);

  const todoTasks = processedTasks.filter(t => t.status === 'todo');
  const progressTasks = processedTasks.filter(t => t.status === 'in_progress');
  const doneTasks = processedTasks.filter(t => t.status === 'done');

  const activeFiltersCount = activePriorities.length + activeAssignees.length;

  const togglePriority = (p) => {
    setActivePriorities(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]);
  };

  const toggleAssignee = (a) => {
    setActiveAssignees(prev => prev.includes(a) ? prev.filter(x => x !== a) : [...prev, a]);
  };

  const clearFilters = () => {
    setActivePriorities([]);
    setActiveAssignees([]);
    setSearch("");
    setViewMode("all");
    setShowFilters(false);
  };

  const handleStatusChange = async (taskId, newStatus) => {
    if (newStatus === 'done') {
      const t = tasks.find(t => t.id === taskId);
      setTaskToComplete(t);
      return;
    }
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
    try {
      await updateTaskStatus(taskId, { status: newStatus });
    } catch (err) {
      fetchTasks(); 
      alert("Failed to update status.");
    }
  };

  const handleDelete = async (taskId) => {
    if(!window.confirm("Permanently delete this task?")) return;
    setTasks(prev => prev.filter(t => t.id !== taskId));
    try {
      await deleteTask(taskId);
    } catch (err) {
      fetchTasks();
      alert("Failed to delete task.");
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans">
      
      {/* 1. DARK PURPLE HEADER */}
      <div className="bg-gradient-to-r from-[#1e1b4b] via-[#312e81] to-[#4338ca] text-white p-6 md:p-10 pb-20 shadow-2xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6 max-w-6xl mx-auto">
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
            className="bg-white text-indigo-900 hover:bg-indigo-50 px-6 py-3.5 rounded-xl text-sm font-bold flex items-center gap-2 transition shadow-xl active:scale-95 w-full md:w-auto justify-center"
          >
            <Plus size={18} strokeWidth={3} /> Create Task
          </button>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
      </div>

      {/* 2. FLOATING TOOLBAR */}
      <div className="max-w-6xl mx-auto -mt-8 px-4 relative z-20">
        <div className="bg-white p-2 rounded-2xl shadow-lg border border-slate-200/60 flex flex-col md:flex-row items-center justify-between gap-3">
          
          <div className="flex bg-slate-100 p-1 rounded-xl w-full md:w-auto shrink-0">
            <button onClick={() => setViewMode('all')} className={`flex-1 md:flex-none px-6 py-2.5 rounded-lg text-xs font-bold transition flex items-center justify-center gap-2 ${viewMode === 'all' ? 'bg-white shadow-sm text-[#1e1b4b]' : 'text-slate-500 hover:text-slate-700'}`}>
              All Tasks
            </button>
            <button onClick={() => setViewMode('mine')} className={`flex-1 md:flex-none px-6 py-2.5 rounded-lg text-xs font-bold transition flex items-center justify-center gap-2 ${viewMode === 'mine' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}>
              <User size={14} /> My Tasks
            </button>
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            {/* 🟢 NEW FILTER POPOVER BUTTON */}
            <div className="relative shrink-0">
              <button 
                onClick={() => setShowFilters(!showFilters)} 
                className={`px-4 py-3 rounded-xl text-sm font-bold transition flex items-center gap-2 ${activeFiltersCount > 0 ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'} border`}
              >
                <Filter size={16} /> Filters
                {activeFiltersCount > 0 && (
                  <span className="bg-indigo-600 text-white text-[10px] px-1.5 py-0.5 rounded-md ml-1">{activeFiltersCount}</span>
                )}
              </button>

              {/* FILTER POPOVER MENU */}
              {showFilters && (
                <>
                  <div className="fixed inset-0 z-30" onClick={() => setShowFilters(false)} />
                  <div className="absolute top-full right-0 mt-2 w-64 bg-white border border-slate-200 rounded-2xl shadow-xl z-40 p-4 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-bold text-slate-800 text-sm">Filters</h4>
                      {activeFiltersCount > 0 && (
                        <button onClick={clearFilters} className="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition">Clear All</button>
                      )}
                    </div>
                    
                    {/* Priority Options */}
                    <div className="mb-4">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Priority</p>
                      <div className="flex flex-wrap gap-2">
                        {['high', 'medium', 'low'].map(p => (
                          <button 
                            key={p} 
                            onClick={() => togglePriority(p)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition border ${activePriorities.includes(p) ? 'bg-slate-800 text-white border-slate-800' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'}`}
                          >
                            {p}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Assignee Options */}
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Assignee</p>
                      <div className="flex flex-col gap-1 max-h-48 overflow-y-auto">
                        <button 
                          onClick={() => toggleAssignee("unassigned")}
                          className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition ${activeAssignees.includes("unassigned") ? 'bg-indigo-50 text-indigo-700' : 'hover:bg-slate-50 text-slate-600'}`}
                        >
                          <div className={`w-4 h-4 rounded border flex items-center justify-center ${activeAssignees.includes("unassigned") ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white border-slate-300'}`}>
                            {activeAssignees.includes("unassigned") && <CheckCircle size={10} />}
                          </div>
                          Unassigned
                        </button>
                        
                        {team?.members?.map(m => {
                          const idStr = String(m.user_id);
                          const isActive = activeAssignees.includes(idStr);
                          return (
                            <button 
                              key={m.user_id} 
                              onClick={() => toggleAssignee(idStr)}
                              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition ${isActive ? 'bg-indigo-50 text-indigo-700' : 'hover:bg-slate-50 text-slate-600'}`}
                            >
                              <div className={`w-4 h-4 rounded border flex items-center justify-center ${isActive ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white border-slate-300'}`}>
                                {isActive && <CheckCircle size={10} />}
                              </div>
                              <img src={getImageUrl(m.profile_pic) || "/default-avatar.png"} className="w-5 h-5 rounded-full object-cover" alt=""/>
                              <span className="truncate">{m.full_name} {idStr === String(myUserId) ? "(Me)" : ""}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Search */}
            <div className="relative w-full md:w-64">
              <Search size={16} className="absolute left-4 top-3.5 text-slate-400" />
              <input 
                placeholder="Search tasks..." 
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500/20 transition"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 3. TASK SECTIONS (List Layout) */}
      <div className="max-w-6xl mx-auto p-4 lg:p-6 space-y-10 mt-4">
        
        {loading && (
          <div className="space-y-4">
            {[1,2,3].map(i => <div key={i} className="h-20 bg-slate-200/50 rounded-xl animate-pulse"/>)}
          </div>
        )}

        {!loading && processedTasks.length === 0 && (
          <div className="py-20 text-center border-2 border-dashed border-slate-300 rounded-[2rem] bg-white">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100 shadow-sm">
              <Filter size={24} className="text-slate-300" />
            </div>
            <h3 className="text-slate-900 font-bold text-lg">No tasks found</h3>
            <p className="text-slate-500 text-sm mt-1 font-medium">Adjust filters or create a new task to get started.</p>
            {(search || activeFiltersCount > 0) && (
              <button onClick={clearFilters} className="mt-4 text-sm font-bold text-indigo-600 hover:text-indigo-800 transition">Clear all filters</button>
            )}
          </div>
        )}

        <TaskSection title="Backlog / To Do" tasks={todoTasks} color="slate" myUserId={myUserId} isLeader={isLeader} onStatusChange={handleStatusChange} onDelete={handleDelete} onEdit={(task) => setTaskToEdit(task)} />
        <TaskSection title="In Progress" tasks={progressTasks} color="indigo" myUserId={myUserId} isLeader={isLeader} onStatusChange={handleStatusChange} onDelete={handleDelete} onEdit={(task) => setTaskToEdit(task)} />
        <TaskSection title="Completed" tasks={doneTasks} color="emerald" myUserId={myUserId} isLeader={isLeader} onStatusChange={handleStatusChange} onDelete={handleDelete} onEdit={(task) => setTaskToEdit(task)} isDoneSection={true} />
      </div>

      {/* Modals */}
      {showCreateModal && <TaskFormModal teamId={team.id} members={team.members} isLeader={isLeader} myUserId={myUserId} onClose={() => setShowCreateModal(false)} onTaskSaved={fetchTasks} />}
      {taskToEdit && <TaskFormModal teamId={team.id} members={team.members} isLeader={isLeader} myUserId={myUserId} taskToEdit={taskToEdit} onClose={() => setTaskToEdit(null)} onTaskSaved={fetchTasks} />}
      {taskToComplete && <ProofOfWorkModal task={taskToComplete} onClose={() => setTaskToComplete(null)} onSubmit={fetchTasks} />}
    </div>
  );
};

// ==================================================================================
// 6. SUB-COMPONENT: Task Section & Row
// ==================================================================================
const TaskSection = ({ title, tasks, color, myUserId, isLeader, onStatusChange, onDelete, onEdit, isDoneSection = false }) => {
  if (tasks.length === 0) return null;

  return (
    <div className="animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-3 mb-4 ml-1">
        <div className={`h-3 w-3 rounded-full bg-${color}-500 ring-4 ring-${color}-100`}></div>
        <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">{title}</h3>
        <span className="text-[10px] font-bold bg-slate-200 text-slate-600 px-2 py-0.5 rounded-md">{tasks.length}</span>
      </div>

      <div className="space-y-3">
        {tasks.map(task => {
          const isWorkingOn = task.status === 'in_progress' && String(task.assigned_to?.id) === String(myUserId);
          const isMyTask = String(task.assigned_to?.id) === String(myUserId);
          const isUnassigned = !task.assigned_to;
          const canEdit = isLeader || (!isDoneSection && (isMyTask || isUnassigned));

          return (
            <div key={task.id} className={`group flex flex-col md:flex-row items-start md:items-center gap-4 p-4 border rounded-xl transition-all duration-200 border-l-[6px] ${getPriorityColor(task.priority)} ${task.is_overdue && !isDoneSection ? 'border-rose-300' : 'border-slate-200 shadow-sm'}`}>
              <div className="flex-shrink-0 mt-0.5 md:mt-0">
                <StatusBadge currentStatus={task.status} onChange={(newStatus) => onStatusChange(task.id, newStatus)} disabled={!canEdit} />
              </div>

              <div className="flex-1 min-w-0 w-full">
                <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                  <span className={`text-[15px] font-bold text-slate-900 ${isDoneSection ? 'line-through text-slate-400' : ''}`}>{task.title}</span>
                  {isWorkingOn && <span className="flex items-center gap-1 bg-indigo-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-md shadow-sm"><Zap size={10} fill="currentColor" /> Working On</span>}
                  {task.is_overdue && !isDoneSection && <span className="flex items-center gap-1 bg-rose-100 text-rose-700 text-[9px] font-bold px-2 py-0.5 rounded-md"><AlertTriangle size={10} /> Overdue</span>}
                </div>
                
                <div className="flex items-center gap-4 text-xs font-medium text-slate-500">
                  <span className="uppercase text-[10px] font-black tracking-wider">{task.priority} Priority</span>
                  {task.due_date && <span className="flex items-center gap-1.5"><Calendar size={12} className={task.is_overdue && !isDoneSection ? "text-rose-500" : ""} /> {new Date(task.due_date).toLocaleDateString(undefined, {month:'short', day:'numeric'})}</span>}
                </div>

                {isDoneSection && task.proof && (
                  <div className="mt-3 bg-white/50 rounded-lg p-3 border border-emerald-100/50">
                    <p className="text-xs text-emerald-800 font-medium line-clamp-1 italic mb-2">"{task.proof.text}"</p>
                    <div className="flex gap-2">
                      {task.proof.link && <a href={task.proof.link} target="_blank" rel="noreferrer" className="text-[10px] font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-2 py-1 rounded-md flex items-center gap-1 transition"><LinkIcon size={10}/> View Link</a>}
                      {task.proof.image && <a href={getImageUrl(task.proof.image)} target="_blank" rel="noreferrer" className="text-[10px] font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 px-2 py-1 rounded-md flex items-center gap-1 shadow-sm transition"><UploadCloud size={10}/> Attachment</a>}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between w-full md:w-auto gap-4 mt-2 md:mt-0 pt-3 md:pt-0 border-t md:border-none border-slate-100 shrink-0">
                {task.assigned_to ? (
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-lg shadow-sm">
                    <img src={getImageUrl(task.assigned_to.profile_pic) || "/default-avatar.png"} className="w-5 h-5 rounded-full object-cover" alt=""/>
                    <span className="text-xs font-bold text-slate-700 max-w-[100px] truncate">{isMyTask ? 'Me' : task.assigned_to.full_name}</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-dashed border-slate-300 rounded-lg text-slate-500">
                    <User size={14} /><span className="text-xs font-bold">Unassigned</span>
                  </div>
                )}

                <div className="flex items-center gap-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                  {canEdit && <button onClick={() => onEdit(task)} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition" title="Edit Task"><Edit3 size={16} /></button>}
                  {isLeader && <button onClick={() => onDelete(task.id)} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition" title="Delete Task"><Trash2 size={16} /></button>}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TaskBoard;