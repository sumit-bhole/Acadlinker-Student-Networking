import React, { useState } from "react";
import { X, Save, Github, Image, Lock, Globe } from "lucide-react";
import { updateTeam } from "../../api/teamApi";

const EditTeamModal = ({ team, onClose, onUpdate }) => {
  const [formData, setFormData] = useState({
    name: team.name,
    description: team.description,
    privacy: team.privacy,
    github_repo: team.github_repo || "",
    profile_pic: team.profile_pic || "",
    is_hiring: team.is_hiring,
    hiring_requirements: team.hiring_requirements || ""
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateTeam(team.id, formData);
      onUpdate(); // Refresh parent
      onClose();
    } catch (err) {
      alert("Failed to update");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h3 className="font-bold text-lg text-slate-800">Edit Team Settings</h3>
          <button onClick={onClose}><X size={20} /></button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
          
          {/* Logo URL */}
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase">Logo URL</label>
            <div className="flex gap-2 mt-1">
              <input 
                className="flex-1 px-3 py-2 border rounded-lg text-sm"
                placeholder="https://imgur.com/..."
                value={formData.profile_pic}
                onChange={e => setFormData({...formData, profile_pic: e.target.value})}
              />
              <div className="w-10 h-10 rounded-lg bg-slate-100 border flex items-center justify-center overflow-hidden">
                {formData.profile_pic ? <img src={formData.profile_pic} alt="Preview" className="w-full h-full object-cover"/> : <Image size={16} className="text-slate-400"/>}
              </div>
            </div>
          </div>

          {/* Name & Desc */}
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase">Team Name</label>
            <input 
              required
              className="w-full mt-1 px-3 py-2 border rounded-lg text-sm font-bold"
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
            />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase">Description</label>
            <textarea 
              className="w-full mt-1 px-3 py-2 border rounded-lg text-sm h-24"
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
            />
          </div>

          {/* GitHub Integration */}
          <div className="bg-gray-900 p-4 rounded-xl text-white">
            <label className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase mb-2">
              <Github size={14} /> GitHub Repository
            </label>
            <input 
              className="w-full bg-gray-800 border border-gray-700 text-white px-3 py-2 rounded-lg text-sm"
              placeholder="username/repo-name"
              value={formData.github_repo}
              onChange={e => setFormData({...formData, github_repo: e.target.value})}
            />
            <p className="text-[10px] text-gray-500 mt-1">We will fetch stars, issues, and recent commits.</p>
          </div>

          {/* Privacy */}
          <div className="grid grid-cols-2 gap-3">
            <button type="button" onClick={() => setFormData({...formData, privacy: 'public'})}
              className={`p-3 rounded-xl border text-center text-sm font-medium transition ${formData.privacy === 'public' ? 'bg-indigo-50 border-indigo-500 text-indigo-700' : 'hover:bg-slate-50'}`}>
              <Globe size={16} className="mx-auto mb-1"/> Public
            </button>
            <button type="button" onClick={() => setFormData({...formData, privacy: 'private'})}
              className={`p-3 rounded-xl border text-center text-sm font-medium transition ${formData.privacy === 'private' ? 'bg-slate-100 border-slate-400 text-slate-800' : 'hover:bg-slate-50'}`}>
              <Lock size={16} className="mx-auto mb-1"/> Private
            </button>
          </div>

          <button disabled={loading} type="submit" className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg transition">
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditTeamModal;