import React, { useEffect, useState } from "react";
import { Plus, MoreHorizontal, Clock, CheckCircle, Circle, ArrowRight, Trash2 } from "lucide-react";
import { getTeamTasks, createTask, updateTaskStatus, deleteTask } from "../../api/teamApi";

const TaskBoard = ({ teamId, isMember }) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newTaskMode, setNewTaskMode] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");

  const fetchTasks = async () => {
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
  }, [teamId, isMember]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    try {
      await createTask({ team_id: teamId, title: newTaskTitle, description: "" });
      setNewTaskTitle("");
      setNewTaskMode(false);
      fetchTasks();
    } catch (err) {
      alert("Failed to create task");
    }
  };

  const handleMove = async (taskId, newStatus) => {
    // Optimistic Update
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
    try {
      await updateTaskStatus(taskId, newStatus);
    } catch (err) {
      fetchTasks(); // Revert on fail
    }
  };

  const handleDelete = async (taskId) => {
    if(!window.confirm("Delete this task?")) return;
    try {
      await deleteTask(taskId);
      setTasks(prev => prev.filter(t => t.id !== taskId));
    } catch (err) {
      alert("Failed to delete");
    }
  }

  const columns = [
    { id: 'todo', label: 'To Do', icon: Circle, color: 'text-slate-500', bg: 'bg-slate-100' },
    { id: 'in_progress', label: 'In Progress', icon: Clock, color: 'text-blue-500', bg: 'bg-blue-50' },
    { id: 'done', label: 'Done', icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-50' }
  ];

  if (!isMember) return <div className="p-8 text-center text-slate-500">Join the team to view tasks.</div>;

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-4 px-1">
        <h3 className="font-bold text-lg">Project Tasks</h3>
        <button 
          onClick={() => setNewTaskMode(true)}
          className="flex items-center gap-1 text-sm bg-indigo-600 text-white px-3 py-1.5 rounded-lg hover:bg-indigo-700 transition"
        >
          <Plus size={16} /> New Task
        </button>
      </div>

      {newTaskMode && (
        <form onSubmit={handleCreate} className="mb-4 bg-white p-3 border rounded-xl shadow-sm flex gap-2">
          <input 
            autoFocus
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            placeholder="What needs to be done?"
            className="flex-1 outline-none text-sm"
          />
          <button type="submit" className="text-indigo-600 font-medium text-sm">Add</button>
          <button type="button" onClick={() => setNewTaskMode(false)} className="text-slate-400">Cancel</button>
        </form>
      )}

      {/* Kanban Columns - Horizontal Scroll on Mobile */}
      <div className="flex-1 overflow-x-auto pb-4">
        <div className="flex gap-4 min-w-[800px] lg:min-w-full h-full">
          {columns.map(col => (
            <div key={col.id} className="flex-1 bg-slate-50 rounded-xl p-3 flex flex-col h-full min-h-[400px]">
              <div className="flex items-center justify-between mb-3 px-1">
                <div className="flex items-center gap-2">
                  <col.icon size={16} className={col.color} />
                  <span className="font-semibold text-slate-700 text-sm">{col.label}</span>
                  <span className="bg-white px-2 py-0.5 rounded-full text-xs text-slate-500 border border-slate-200">
                    {tasks.filter(t => t.status === col.id).length}
                  </span>
                </div>
              </div>

              <div className="flex-1 space-y-2 overflow-y-auto pr-1">
                {tasks.filter(t => t.status === col.id).map(task => (
                  <div key={task.id} className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-all group relative">
                    <p className="text-sm font-medium text-slate-800 mb-2">{task.title}</p>
                    
                    <div className="flex justify-between items-center mt-2 pt-2 border-t border-slate-50">
                      {/* Simple Move Controls */}
                      <div className="flex gap-1">
                        {col.id !== 'todo' && (
                          <button 
                            onClick={() => handleMove(task.id, col.id === 'done' ? 'in_progress' : 'todo')}
                            className="p-1 hover:bg-slate-100 rounded text-xs text-slate-500" title="Move Back"
                          >
                            ←
                          </button>
                        )}
                        {col.id !== 'done' && (
                          <button 
                            onClick={() => handleMove(task.id, col.id === 'todo' ? 'in_progress' : 'done')}
                            className="p-1 hover:bg-slate-100 rounded text-xs text-slate-500" title="Move Forward"
                          >
                            →
                          </button>
                        )}
                      </div>
                      <button onClick={() => handleDelete(task.id)} className="text-slate-300 hover:text-red-500">
                        <Trash2 size={14}/>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TaskBoard;