import React, { useEffect, useState } from "react";
import { 
  Plus, Clock, CheckCircle, Circle, Trash2, 
  User, AlertCircle, Calendar, ChevronRight, ChevronLeft, ArrowRight
} from "lucide-react";
import { getTeamTasks, createTask, updateTaskStatus, deleteTask } from "../../api/teamApi";

const TaskBoard = ({ teamId, isMember }) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newTaskMode, setNewTaskMode] = useState(false);
  const [newTaskData, setNewTaskData] = useState({ title: "", priority: "medium" });

  const fetchTasks = async () => {
    try {
      const res = await getTeamTasks(teamId);
      setTasks(res.data);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isMember) fetchTasks();
  }, [teamId, isMember]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newTaskData.title.trim()) return;
    try {
      await createTask({ team_id: teamId, ...newTaskData });
      setNewTaskData({ title: "", priority: "medium" });
      setNewTaskMode(false);
      fetchTasks();
    } catch (err) {
      alert("Failed to create task");
    }
  };

  const handleMove = async (taskId, newStatus) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
    try {
      await updateTaskStatus(taskId, { status: newStatus });
    } catch (err) {
      console.error("Move error:", err);
      fetchTasks();
    }
  };

  const handleDelete = async (taskId) => {
    if (!window.confirm("Delete this task?")) return;
    try {
      await deleteTask(taskId);
      setTasks(prev => prev.filter(t => t.id !== taskId));
    } catch (err) {
      alert("Failed to delete");
    }
  };

  const getPriorityStyle = (p) => {
    switch (p) {
      case 'high': return 'bg-red-50 text-red-600 border-red-100 ring-1 ring-red-100';
      case 'medium': return 'bg-amber-50 text-amber-600 border-amber-100 ring-1 ring-amber-100';
      default: return 'bg-blue-50 text-blue-600 border-blue-100 ring-1 ring-blue-100';
    }
  };

  const columns = [
    { id: 'todo', label: 'To Do', icon: Circle, color: 'text-slate-500', headerBg: 'bg-slate-50' },
    { id: 'in_progress', label: 'In Progress', icon: Clock, color: 'text-indigo-600', headerBg: 'bg-indigo-50' },
    { id: 'done', label: 'Done', icon: CheckCircle, color: 'text-emerald-600', headerBg: 'bg-emerald-50' }
  ];

  if (!isMember) return <div className="p-12 text-center text-slate-400">Join the workspace to view tasks.</div>;

  return (
    <div className="flex flex-col h-full bg-slate-50/50">
      
      {/* Header Area */}
      <div className="p-4 lg:p-8 flex justify-between items-end bg-white border-b border-slate-200 lg:bg-transparent lg:border-0">
        <div>
          <h2 className="text-xl lg:text-2xl font-black text-slate-900 tracking-tight">Project Board</h2>
          <p className="text-xs lg:text-sm text-slate-500 font-medium">Manage tasks & sprint velocity</p>
        </div>
        <button 
          onClick={() => setNewTaskMode(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white p-2 px-3 lg:px-4 lg:py-2 rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-indigo-200 active:scale-95"
        >
          <Plus size={18} />
          <span className="hidden lg:inline font-bold text-sm">New Task</span>
          <span className="lg:hidden font-bold text-xs">Add</span>
        </button>
      </div>

      {/* New Task Inline Form */}
      {newTaskMode && (
        <div className="mx-4 lg:mx-8 mt-4 p-4 bg-white rounded-2xl border-2 border-indigo-100 shadow-xl animate-in slide-in-from-top-2">
          <form onSubmit={handleCreate} className="space-y-4">
            <input 
              autoFocus
              className="w-full text-lg font-bold outline-none placeholder:text-slate-300"
              placeholder="What needs to be done?"
              value={newTaskData.title}
              onChange={(e) => setNewTaskData({...newTaskData, title: e.target.value})}
            />
            <div className="flex items-center justify-between">
              <select 
                className="text-xs font-bold uppercase tracking-wider bg-slate-100 px-3 py-2 rounded-lg outline-none"
                value={newTaskData.priority}
                onChange={(e) => setNewTaskData({...newTaskData, priority: e.target.value})}
              >
                <option value="low">Low Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="high">High Priority</option>
              </select>
              <div className="flex gap-3">
                <button type="button" onClick={() => setNewTaskMode(false)} className="text-xs font-bold text-slate-400 p-2">Cancel</button>
                <button type="submit" className="bg-slate-900 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-black transition">Create</button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Responsive Kanban Grid */}
      <div className="flex-1 overflow-y-auto p-4 lg:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
          {columns.map(col => (
            <div key={col.id} className="flex flex-col h-fit lg:h-full bg-white lg:bg-slate-100/50 rounded-2xl border border-slate-200 lg:border-transparent">
              
              {/* Column Header */}
              <div className={`flex items-center justify-between p-3 rounded-t-2xl lg:rounded-2xl ${col.headerBg} lg:bg-transparent lg:mb-2`}>
                <div className="flex items-center gap-2">
                  <div className={`p-1.5 rounded-lg bg-white lg:bg-transparent`}>
                    <col.icon size={16} className={col.color} strokeWidth={2.5} />
                  </div>
                  <span className="font-bold text-slate-800 text-sm uppercase tracking-widest">{col.label}</span>
                  <span className="bg-white lg:bg-slate-200 text-slate-600 px-2 py-0.5 rounded-md text-[10px] font-black border border-slate-100 lg:border-slate-300">
                    {tasks.filter(t => t.status === col.id).length}
                  </span>
                </div>
              </div>

              {/* Column Body */}
              <div className="flex-1 space-y-3 p-3 lg:p-2 overflow-y-auto min-h-[100px] lg:min-h-0">
                {tasks.filter(t => t.status === col.id).map(task => (
                  <div 
                    key={task.id} 
                    className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-300 transition-all group relative"
                  >
                    {/* Top Row: Priority & Actions */}
                    <div className="flex justify-between items-start mb-2">
                      <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase ${getPriorityStyle(task.priority)}`}>
                        {task.priority}
                      </span>
                      
                      {/* Desktop Hover Actions / Mobile Always Visible */}
                      <button 
                        onClick={() => handleDelete(task.id)}
                        className="text-slate-300 hover:text-red-500 transition-colors lg:opacity-0 lg:group-hover:opacity-100"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>

                    <h4 className="text-sm font-bold text-slate-800 leading-relaxed mb-3">{task.title}</h4>

                    {/* Bottom Row: Info & Controls */}
                    <div className="flex justify-between items-center pt-3 border-t border-slate-50">
                      
                      {/* Assignee & Date */}
                      <div className="flex items-center -space-x-2">
                         {task.assigned_to ? (
                           <img 
                             src={task.assigned_to.profile_pic || "/default-avatar.png"} 
                             className="w-6 h-6 rounded-full border-2 border-white object-cover ring-1 ring-slate-100" 
                             alt="Avatar"
                           />
                         ) : (
                           <div className="w-6 h-6 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-slate-300">
                             <User size={10} />
                           </div>
                         )}
                         {task.due_date && (
                           <div className="ml-3 flex items-center gap-1 text-[10px] font-bold text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100">
                             <Calendar size={10} /> {new Date(task.due_date).toLocaleDateString()}
                           </div>
                         )}
                      </div>

                      {/* Move Controls */}
                      <div className="flex gap-1 bg-slate-50 rounded-lg p-0.5 border border-slate-100">
                        {col.id !== 'todo' && (
                          <button 
                            onClick={() => handleMove(task.id, col.id === 'done' ? 'in_progress' : 'todo')}
                            className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-white rounded shadow-sm transition"
                            title="Move Back"
                          >
                            <ChevronLeft size={14} />
                          </button>
                        )}
                        {col.id !== 'done' && (
                          <button 
                            onClick={() => handleMove(task.id, col.id === 'todo' ? 'in_progress' : 'done')}
                            className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-white rounded shadow-sm transition"
                            title="Move Forward"
                          >
                            <ChevronRight size={14} />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                
                {tasks.filter(t => t.status === col.id).length === 0 && (
                  <div className="py-8 flex flex-col items-center justify-center text-slate-300 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                     <Circle size={18} className="mb-1 opacity-20" />
                     <span className="text-[10px] font-bold uppercase tracking-widest opacity-50">Empty</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TaskBoard;