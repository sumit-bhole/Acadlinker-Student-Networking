import React, { useState, useEffect } from "react";
import api from "../../api/axios"; // 🚀 Use direct API instance for multipart/form-data
import { X, Globe, Lock, Github, Camera, Loader2, Briefcase } from "lucide-react";

const EditTeamModal = ({ team, onClose, onUpdate }) => {
  const [formData, setFormData] = useState({
    name: team.name || "",
    description: team.description || "",
    privacy: team.privacy || "public",
    github_repo: team.github_repo || "",
    is_hiring: team.is_hiring || false,
    hiring_requirements: team.hiring_requirements || ""
  });
  
  // 🟢 Image Upload States
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(team.profile_pic || null);
  const [loading, setLoading] = useState(false);

  // Cleanup preview URL to prevent memory leaks
  useEffect(() => {
    return () => {
      if (imageFile && previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [imageFile, previewUrl]);

  // 🟢 Handle Image Selection
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        alert("Please upload a valid image (JPG, PNG, WEBP)");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        alert("Image size must be less than 5MB");
        return;
      }
      
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      alert("Team name is required");
      return;
    }

    setLoading(true);
    try {
      // 🚀 Construct FormData for Multipart Upload
      const submitData = new FormData();
      submitData.append('name', formData.name);
      submitData.append('description', formData.description);
      submitData.append('privacy', formData.privacy);
      submitData.append('is_hiring', formData.is_hiring);
      submitData.append('hiring_requirements', formData.hiring_requirements);
      if (formData.github_repo) submitData.append('github_repo', formData.github_repo);
      
      // Only append if the user actually selected a NEW image
      if (imageFile) {
        submitData.append('profile_pic', imageFile);
      }

      // Send to backend (adjust the URL if your edit endpoint is different)
      await api.put(`/api/teams/${team.id}`, submitData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      
      onUpdate(); // Refresh parent
      onClose();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || "Failed to update team");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-white w-full max-w-xl rounded-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-white shrink-0">
          <h3 className="font-bold text-xl text-slate-800">Edit Team Settings</h3>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        
        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar">
          
          {/* 🟢 TEAM LOGO UPLOAD */}
          <div className="flex flex-col items-center justify-center">
            <div className="relative group cursor-pointer">
              <div className="w-24 h-24 rounded-full border-4 border-white shadow-lg overflow-hidden bg-slate-100 flex items-center justify-center transition-all group-hover:bg-slate-200">
                {previewUrl ? (
                  <img src={previewUrl} alt="Team Logo" className="w-full h-full object-cover" />
                ) : (
                  <Camera className="w-8 h-8 text-slate-400 group-hover:text-indigo-500 transition-colors" />
                )}
              </div>
              
              <label htmlFor="edit-team-logo" className="absolute inset-0 rounded-full cursor-pointer z-10 flex items-center justify-center bg-black/0 hover:bg-black/20 transition-colors">
                <span className="sr-only">Change team logo</span>
              </label>
              
              <input
                id="edit-team-logo"
                type="file"
                accept="image/png, image/jpeg, image/jpg, image/webp"
                className="hidden"
                onChange={handleImageChange}
                disabled={loading}
              />
            </div>
            <p className="text-xs text-slate-500 mt-3 font-medium">Click to change logo</p>
          </div>

          {/* Name & Desc */}
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Team Name *</label>
              <input 
                required
                className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 outline-none transition-all font-semibold text-slate-800"
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                disabled={loading}
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Description</label>
              <textarea 
                className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 outline-none transition-all text-sm resize-none h-24"
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
                disabled={loading}
              />
            </div>
          </div>

          {/* GitHub Integration */}
          <div className="bg-slate-900 p-5 rounded-2xl text-white shadow-inner">
            <label className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase mb-3">
              <Github size={16} className="text-white"/> GitHub Repository
            </label>
            <input 
              className="w-full bg-slate-800 border border-slate-700 text-white px-4 py-3 rounded-xl text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all"
              placeholder="e.g. facebook/react"
              value={formData.github_repo}
              onChange={e => setFormData({...formData, github_repo: e.target.value})}
              disabled={loading}
            />
            <p className="text-[11px] text-slate-400 mt-2 font-medium">Link a repository to showcase your team's codebase.</p>
          </div>

          {/* Hiring Toggle */}
          <div className="bg-indigo-50/50 p-5 rounded-2xl border border-indigo-100">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <Briefcase size={16} className="text-indigo-600"/>
                  Active Recruiting
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">Let people know you are looking for members</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer"
                  checked={formData.is_hiring}
                  onChange={(e) => setFormData({...formData, is_hiring: e.target.checked})}
                  disabled={loading}
                />
                <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
              </label>
            </div>
            
            {formData.is_hiring && (
              <div className="animate-in slide-in-from-top-2 duration-300">
                <input 
                  className="w-full px-4 py-3 bg-white border border-indigo-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all text-sm"
                  placeholder="What skills are you looking for?"
                  value={formData.hiring_requirements}
                  onChange={e => setFormData({...formData, hiring_requirements: e.target.value})}
                  disabled={loading}
                />
              </div>
            )}
          </div>

          {/* Privacy */}
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Team Privacy</label>
            <div className="grid grid-cols-2 gap-4">
              <button 
                type="button" 
                onClick={() => setFormData({...formData, privacy: 'public'})}
                disabled={loading}
                className={`p-4 rounded-xl border-2 text-left transition-all ${
                  formData.privacy === 'public' 
                    ? 'border-indigo-600 bg-indigo-50/50 shadow-sm text-indigo-900' 
                    : 'border-slate-200 hover:border-indigo-300 bg-white text-slate-700'
                }`}
              >
                <Globe size={20} className={`mb-2 ${formData.privacy === 'public' ? 'text-indigo-600' : 'text-slate-400'}`}/> 
                <div className="font-bold text-sm">Public</div>
                <div className="text-[10px] opacity-70 mt-1">Anyone can request to join</div>
              </button>
              
              <button 
                type="button" 
                onClick={() => setFormData({...formData, privacy: 'private'})}
                disabled={loading}
                className={`p-4 rounded-xl border-2 text-left transition-all ${
                  formData.privacy === 'private' 
                    ? 'border-indigo-600 bg-indigo-50/50 shadow-sm text-indigo-900' 
                    : 'border-slate-200 hover:border-indigo-300 bg-white text-slate-700'
                }`}
              >
                <Lock size={20} className={`mb-2 ${formData.privacy === 'private' ? 'text-indigo-600' : 'text-slate-400'}`}/> 
                <div className="font-bold text-sm">Private</div>
                <div className="text-[10px] opacity-70 mt-1">Invite-only access</div>
              </button>
            </div>
          </div>
        </form>
        
        {/* Footer Actions */}
        <div className="p-5 border-t border-slate-100 bg-slate-50 flex gap-3 shrink-0">
          <button 
            type="button"
            onClick={onClose}
            disabled={loading}
            className="flex-1 py-3 px-4 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl font-bold transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button 
            type="submit"
            onClick={handleSubmit}
            disabled={loading || !formData.name.trim()}
            className="flex-[2] py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-md shadow-indigo-200 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : "Save Changes"}
          </button>
        </div>

      </div>
    </div>
  );
};

export default EditTeamModal;