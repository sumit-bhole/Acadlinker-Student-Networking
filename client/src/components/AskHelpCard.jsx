import React, { useState } from "react";
import { Link } from "react-router-dom";
import { HelpCircle, Upload, Github, X, FileText, ArrowRight, CheckCircle2, AlertCircle } from "lucide-react";
import { helpService } from "../services/helpService";

const AskHelpCard = ({ user, onRefresh }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const activeRequest = user?.active_help_request;

  const [form, setForm] = useState({
    title: "",
    description: "",
    github_link: "",
    tags: "",
    image: null
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 🛑 VALIDATION: Image is now REQUIRED
    if (!form.image) {
      alert("Please upload a screenshot of the error.");
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append("title", form.title);
    formData.append("description", form.description);
    // Send empty string if no link provided
    formData.append("github_link", form.github_link || ""); 
    formData.append("tags", form.tags);
    formData.append("image", form.image);

    try {
      await helpService.createRequest(formData);
      setIsOpen(false);
      setForm({ title: "", description: "", github_link: "", tags: "", image: null });
      if (onRefresh) onRefresh();
    } catch (error) {
      alert(error.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  // ---------------------------------------------------------
  // 🟢 STATE 1: ACTIVE PROBLEM CARD (With Image)
  // ---------------------------------------------------------
  if (activeRequest) {
    return (
      <div className="bg-white border-2 border-indigo-100 rounded-2xl p-5 shadow-sm relative overflow-hidden group">
        
        {/* Header Badge */}
        <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
                <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
                    <FileText className="w-5 h-5" />
                </div>
                <span className="text-sm font-bold text-gray-700">Active Request</span>
            </div>
            <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                OPEN
            </span>
        </div>

        {/* 🆕 SHOW IMAGE HERE */}
        {activeRequest.image_url ? (
           <div className="mb-4 rounded-xl overflow-hidden h-32 bg-gray-100 border border-gray-100 relative group-hover:border-indigo-200 transition-colors">
             <img 
               src={activeRequest.image_url} 
               alt={activeRequest.title} 
               className="w-full h-full object-cover"
             />
           </div>
        ) : (
           // Fallback if somehow no image exists (legacy data)
           <div className="mb-4 h-24 bg-gray-50 rounded-xl flex items-center justify-center border border-dashed border-gray-200">
             <span className="text-xs text-gray-400">No Image Preview</span>
           </div>
        )}

        <h3 className="text-gray-900 font-bold text-base mb-1 line-clamp-1" title={activeRequest.title}>
            {activeRequest.title}
        </h3>
        <p className="text-gray-500 text-xs mb-5">
            Posted on {new Date(activeRequest.created_at).toLocaleDateString()}
        </p>

        <Link 
            to={`/help/${activeRequest.id}`}
            className="flex items-center justify-center gap-2 w-full py-2.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-100"
        >
            View Details <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  // ---------------------------------------------------------
  // 🔵 STATE 2: FORM (Updated Requirements)
  // ---------------------------------------------------------
  return (
    <>
      {/* Trigger Card */}
      <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl p-6 text-center shadow-lg text-white relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10">
             <div className="absolute top-[-20%] left-[-20%] w-40 h-40 bg-white rounded-full mix-blend-overlay"></div>
             <div className="absolute bottom-[-20%] right-[-20%] w-40 h-40 bg-white rounded-full mix-blend-overlay"></div>
        </div>

        <div className="relative z-10">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center mx-auto mb-3">
            <HelpCircle className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-bold mb-1">Stuck on a bug?</h3>
            <p className="text-indigo-100 text-sm mb-5">
            Post your error screenshot and get help. 1 active request allowed.
            </p>
            <button
            onClick={() => setIsOpen(true)}
            className="w-full py-3 bg-white text-indigo-600 font-bold rounded-xl hover:bg-indigo-50 transition-colors shadow-md"
            >
            Ask for Help
            </button>
        </div>
      </div>

      {/* Modal Form */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-5 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10">
              <div>
                  <h2 className="text-xl font-bold text-gray-900">Post a Request</h2>
                  <p className="text-xs text-gray-500">Screenshots help us solve it faster</p>
              </div>
              <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              
              {/* 1. SCREENSHOT (Now Required & First) */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">
                    Screenshot <span className="text-red-500">*</span>
                </label>
                <div className={`border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer relative group ${form.image ? 'border-green-300 bg-green-50' : 'border-gray-200 hover:bg-gray-50 hover:border-indigo-300'}`}>
                  <input
                    type="file"
                    accept="image/*"
                    required // HTML Validation
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    onChange={(e) => setForm({ ...form, image: e.target.files[0] })}
                  />
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-3 transition-colors ${form.image ? 'bg-green-100' : 'bg-gray-100 group-hover:bg-indigo-100'}`}>
                    {form.image ? <CheckCircle2 className="w-5 h-5 text-green-600" /> : <Upload className="w-5 h-5 text-gray-400 group-hover:text-indigo-600" />}
                  </div>
                  <span className={`text-sm font-medium ${form.image ? 'text-green-700' : 'text-gray-600 group-hover:text-indigo-700'}`}>
                    {form.image ? form.image.name : "Click to upload error screenshot"}
                  </span>
                </div>
              </div>

              {/* 2. TITLE */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Problem Title <span className="text-red-500">*</span></label>
                <input
                  required
                  placeholder="e.g. Infinite loop in React useEffect"
                  className="w-full p-3.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                />
              </div>

              {/* 3. TECH STACK */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Tech Stack <span className="text-red-500">*</span></label>
                <input
                  required
                  placeholder="e.g. React, JavaScript, API"
                  className="w-full p-3.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  value={form.tags}
                  onChange={(e) => setForm({ ...form, tags: e.target.value })}
                />
              </div>

              {/* 4. GITHUB (Optional) */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                    <label className="block text-sm font-bold text-gray-700">GitHub Link</label>
                    <span className="text-[10px] uppercase tracking-wider font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded">Optional</span>
                </div>
                <div className="relative">
                  <Github className="absolute left-3.5 top-4 w-5 h-5 text-gray-400" />
                  <input
                    type="url"
                    placeholder="https://github.com/username/repo..."
                    className="w-full pl-11 p-3.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    value={form.github_link}
                    onChange={(e) => setForm({ ...form, github_link: e.target.value })}
                  />
                </div>
              </div>

              {/* 5. DESCRIPTION */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Description <span className="text-red-500">*</span></label>
                <textarea
                  required
                  rows="3"
                  placeholder="Describe what you tried..."
                  className="w-full p-3.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none resize-none transition-all"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 transition-all disabled:opacity-70 disabled:cursor-not-allowed mt-2"
              >
                {loading ? "Posting..." : "Submit Request"}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default AskHelpCard;