import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createTeam } from "../../api/teamApi";
import { Users, Lock, Globe } from "lucide-react";

const CreateTeam = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    privacy: "public",
    is_hiring: false,
    hiring_requirements: ""
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createTeam(formData);
      navigate("/teams/my");
    } catch (err) {
      alert("Failed to create team");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 flex items-center justify-center">
      <div className="bg-white w-full max-w-lg p-6 lg:p-8 rounded-2xl shadow-sm border border-slate-200">
        <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
          <Users className="text-indigo-600" /> Create New Team
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Team Name</label>
            <input 
              required
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition"
              placeholder="e.g. Alpha Hackers"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
            <textarea 
              rows="3"
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition"
              placeholder="What is this team building?"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setFormData({...formData, privacy: 'public'})}
              className={`p-4 rounded-xl border text-left transition ${formData.privacy === 'public' ? 'border-indigo-500 bg-indigo-50' : 'border-slate-200 hover:bg-slate-50'}`}
            >
              <Globe size={20} className={`mb-2 ${formData.privacy === 'public' ? 'text-indigo-600' : 'text-slate-400'}`} />
              <p className="font-semibold text-sm">Public</p>
              <p className="text-xs text-slate-500">Anyone can see and request to join.</p>
            </button>
            
            <button
              type="button"
              onClick={() => setFormData({...formData, privacy: 'private'})}
              className={`p-4 rounded-xl border text-left transition ${formData.privacy === 'private' ? 'border-indigo-500 bg-indigo-50' : 'border-slate-200 hover:bg-slate-50'}`}
            >
              <Lock size={20} className={`mb-2 ${formData.privacy === 'private' ? 'text-indigo-600' : 'text-slate-400'}`} />
              <p className="font-semibold text-sm">Private</p>
              <p className="text-xs text-slate-500">Only visible to invited members.</p>
            </button>
          </div>

          <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100">
            <input 
              type="checkbox" 
              id="hiring"
              checked={formData.is_hiring}
              onChange={(e) => setFormData({...formData, is_hiring: e.target.checked})}
              className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500"
            />
            <label htmlFor="hiring" className="text-sm font-medium text-slate-700">Are you recruiting?</label>
          </div>

          {formData.is_hiring && (
            <div className="animate-slideDown">
              <label className="block text-sm font-medium text-slate-700 mb-1">Requirements</label>
              <input 
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                placeholder="e.g. Need React & Figma skills"
                value={formData.hiring_requirements}
                onChange={(e) => setFormData({...formData, hiring_requirements: e.target.value})}
              />
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 text-white py-3 rounded-xl font-bold hover:shadow-lg transition transform active:scale-95 disabled:opacity-70"
          >
            {loading ? "Creating..." : "Create Team"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateTeam;