import React, { useState } from "react";
import { Link } from "react-router-dom";
import { HelpCircle, Upload, Github, X, FileText, ArrowRight, CheckCircle2, Clock } from "lucide-react";
import { helpService } from "../services/helpService";
import CreatableSelect from 'react-select/creatable';

import { SKILL_OPTIONS } from "../utils/constants";

// 🟢 Consistent Timestamp Formatter
const formatDateTime = (dateString) => {
  if (!dateString) return "Recently";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", { 
    month: "short", day: "numeric", year: "numeric",
    hour: "numeric", minute: "2-digit" 
  });
};

// 🟢 Select Dropdown Styles (Tinted for depth)
const customSelectStyles = {
  control: (provided, state) => ({
    ...provided,
    borderRadius: '0.75rem',
    padding: '0.1rem 0.2rem',
    backgroundColor: '#ffffff', // White input on slate background
    borderColor: state.isFocused ? '#6366f1' : '#cbd5e1',
    boxShadow: state.isFocused ? '0 0 0 1px #6366f1' : 'none',
    fontSize: '0.875rem',
    '&:hover': { borderColor: state.isFocused ? '#6366f1' : '#94a3b8' }
  }),
  multiValue: (provided) => ({ ...provided, backgroundColor: '#e0e7ff', borderRadius: '0.375rem' }),
  multiValueLabel: (provided) => ({ ...provided, color: '#4338ca', fontWeight: 'bold', fontSize: '0.7rem' }),
  multiValueRemove: (provided) => ({ ...provided, color: '#6366f1', ':hover': { backgroundColor: '#c7d2fe', color: '#312e81' } }),
  menuPortal: base => ({ ...base, zIndex: 9999 })
};

const AskHelpCard = ({ user, isOwner, onRefresh }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const activeRequest = user?.active_help_request;

  const [form, setForm] = useState({
    title: "",
    description: "",
    github_link: "",
    tags: [], 
    image: null
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.image) return alert("Please upload a screenshot of the error.");
    if (form.title.length < 20) return alert("Title must be at least 20 characters.");
    if (form.title.length > 80) return alert("Title cannot exceed 80 characters.");

    setLoading(true);

    const formData = new FormData();
    formData.append("title", form.title);
    formData.append("description", form.description);
    formData.append("github_link", form.github_link || ""); 
    
    // 🟢 CRASH FIX: Bulletproof tag parsing so React never throws a white screen
    let processedTags = "";
    if (Array.isArray(form.tags)) {
        processedTags = form.tags.map(t => t.value).join(", ");
    } else if (typeof form.tags === 'string') {
        processedTags = form.tags;
    }
    formData.append("tags", processedTags);
    
    formData.append("image", form.image);

    try {
      await helpService.createRequest(formData);
      setIsOpen(false);
      setForm({ title: "", description: "", github_link: "", tags: [], image: null });
      if (onRefresh) onRefresh();
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || "Something went wrong saving your request.");
    } finally {
      setLoading(false);
    }
  };

  // ---------------------------------------------------------
  // 🟢 STATE 1: ACTIVE PROBLEM CARD (Tinted Indigo/Slate)
  // ---------------------------------------------------------
  if (activeRequest) {
    return (
      <div className="bg-indigo-50/30 border border-indigo-100 rounded-[24px] p-5 shadow-sm relative overflow-hidden group hover:shadow-md hover:bg-indigo-50/50 transition-all">
        
        <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
                <div className="p-2 bg-indigo-100 text-indigo-600 rounded-xl border border-indigo-200/50">
                    <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-extrabold text-slate-900 leading-none mb-1">Active Request</h4>
                  <span className="text-[10px] font-medium text-slate-500 flex items-center gap-1">
                    <Clock size={10} /> {formatDateTime(activeRequest.created_at)}
                  </span>
                </div>
            </div>
            <span className="bg-emerald-100 text-emerald-700 border border-emerald-200 text-[10px] font-black px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow-sm">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                OPEN
            </span>
        </div>

        {activeRequest.image_url && (
           <div className="mb-4 rounded-xl overflow-hidden h-36 bg-slate-100 border border-slate-200 relative group-hover:border-indigo-300 transition-colors shadow-inner">
             <img src={activeRequest.image_url} alt="Problem" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
           </div>
        )}

        <h3 className="text-slate-900 font-bold text-base mb-1.5 line-clamp-2 leading-snug">
            {activeRequest.title}
        </h3>
        
        <Link 
            to={`/help/${activeRequest.id}`}
            className="mt-4 flex items-center justify-center gap-2 w-full py-2.5 bg-white text-indigo-600 font-bold rounded-xl border border-indigo-100 hover:border-indigo-300 hover:bg-indigo-50 transition-all text-sm shadow-sm"
        >
            View Details <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  // 🛑 SECURITY CHECK
  if (!isOwner) return null;

  // ---------------------------------------------------------
  // 🔵 STATE 2: FORM TRIGGER (Redesigned Light Indigo Tint)
  // ---------------------------------------------------------
  return (
    <>
      {/* 🟢 NEW: Soft Light-Indigo background to make it pop beautifully */}
      <div className="bg-indigo-50/60 border border-indigo-100 rounded-[20px] p-5 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4 relative overflow-hidden">
        {/* Subtle decorative glow in the corner */}
        <div className="absolute -right-10 -top-10 w-32 h-32 bg-indigo-200/40 rounded-full blur-2xl"></div>
        
        <div className="flex items-center gap-4 text-left w-full sm:w-auto relative z-10">
            <div className="w-12 h-12 bg-white border border-indigo-100 shadow-sm rounded-2xl flex items-center justify-center shrink-0">
              <HelpCircle className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-indigo-950 mb-0.5">Stuck on a bug?</h3>
              <p className="text-indigo-800/80 text-xs font-medium">
                Post an error screenshot and get community help.
              </p>
            </div>
        </div>
        
        <button
          onClick={() => setIsOpen(true)}
          className="w-full sm:w-auto whitespace-nowrap px-6 py-2.5 bg-indigo-600 text-white text-sm font-bold rounded-xl hover:bg-indigo-700 transition-all shadow-md shadow-indigo-200 active:scale-95 shrink-0 relative z-10"
        >
          Ask for Help
        </button>
      </div>

      {/* 🟢 MODAL FORM (Layered depth) - Unchanged */}
      {isOpen && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center z-[110] p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-50 rounded-[24px] w-full max-w-lg max-h-[85vh] flex flex-col shadow-2xl overflow-hidden border border-slate-200">
            
            {/* Header */}
            <div className="p-4 sm:p-5 border-b border-slate-200 flex justify-between items-center bg-slate-100 shrink-0">
              <div>
                  <h2 className="text-lg font-extrabold text-slate-900 leading-none mb-1">Post a Request</h2>
                  <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">1 Active Request Limit</p>
              </div>
              <button onClick={() => setIsOpen(false)} className="p-2 bg-white border border-slate-200 shadow-sm hover:bg-slate-100 rounded-full transition-colors text-slate-500 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable Form Body */}
            <div className="overflow-y-auto custom-scrollbar p-4 sm:p-6">
              <form id="help-form" onSubmit={handleSubmit} className="space-y-5">
                
                {/* 1. SCREENSHOT */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                      Screenshot <span className="text-rose-500">*</span>
                  </label>
                  <div className={`border-2 border-dashed rounded-xl p-4 text-center transition-all cursor-pointer relative group bg-white shadow-sm ${form.image ? 'border-emerald-300 bg-emerald-50/50' : 'border-slate-300 hover:border-indigo-400'}`}>
                    <input
                      type="file" accept="image/*" required 
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      onChange={(e) => setForm({ ...form, image: e.target.files[0] })}
                    />
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-2 transition-colors ${form.image ? 'bg-emerald-100' : 'bg-slate-100 group-hover:bg-indigo-50'}`}>
                      {form.image ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <Upload className="w-4 h-4 text-slate-500 group-hover:text-indigo-600" />}
                    </div>
                    <span className={`text-xs font-bold ${form.image ? 'text-emerald-700' : 'text-slate-600 group-hover:text-indigo-600'}`}>
                      {form.image ? form.image.name : "Click to attach error image"}
                    </span>
                  </div>
                </div>

                {/* 2. TITLE */}
                <div>
                  <div className="flex justify-between items-end mb-1.5">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                      Problem Title <span className="text-rose-500">*</span>
                    </label>
                    <span className={`text-[10px] font-bold ${form.title.length < 20 || form.title.length > 80 ? 'text-rose-500' : 'text-slate-400'}`}>
                      {form.title.length} / 80
                    </span>
                  </div>
                  <input
                    required minLength={20} maxLength={80}
                    placeholder="e.g. Infinite loop in React useEffect when fetching..."
                    className="w-full p-3 rounded-xl border border-slate-300 bg-white shadow-sm focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all text-sm font-medium text-slate-800 placeholder:text-slate-400"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                  />
                  <p className="text-[9px] text-slate-400 font-medium mt-1 ml-1">Must be between 20 and 80 characters.</p>
                </div>

                {/* 3. TECH STACK */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                    Tech Stack <span className="text-rose-500">*</span>
                  </label>
                  <CreatableSelect
                    isMulti required
                    options={SKILL_OPTIONS}
                    styles={customSelectStyles}
                    placeholder="Select or type tags..."
                    value={form.tags}
                    onChange={(selected) => setForm({ ...form, tags: selected || [] })}
                    menuPortalTarget={document.body}
                    menuPosition="fixed"
                  />
                </div>

                {/* 4. GITHUB */}
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest">GitHub Link</label>
                      <span className="text-[9px] uppercase tracking-widest font-bold text-slate-400 bg-slate-200 px-1.5 py-0.5 rounded-md">Optional</span>
                  </div>
                  <div className="relative group/git shadow-sm rounded-xl">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 bg-slate-100 border border-slate-200 p-1.5 rounded-lg group-focus-within/git:bg-indigo-50 group-focus-within/git:border-indigo-100 transition-colors">
                      <Github className="w-4 h-4 text-slate-500 group-focus-within/git:text-indigo-600" />
                    </div>
                    <input
                      type="url"
                      placeholder="https://github.com/..."
                      className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all text-sm font-medium text-slate-800 placeholder:text-slate-400"
                      value={form.github_link}
                      onChange={(e) => setForm({ ...form, github_link: e.target.value })}
                    />
                  </div>
                </div>

                {/* 5. DESCRIPTION */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                    Brief Description <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    required rows="3" maxLength={400}
                    placeholder="What did you try? What is the expected behavior?"
                    className="w-full p-3 rounded-xl border border-slate-300 bg-white shadow-sm focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 outline-none resize-none transition-all text-sm font-medium text-slate-800 placeholder:text-slate-400"
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                  />
                </div>
              </form>
            </div>

            {/* Sticky Footer Button */}
            <div className="p-4 border-t border-slate-200 bg-slate-100 shrink-0">
              <button
                type="submit" form="help-form" disabled={loading}
                className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-extrabold rounded-xl shadow-md shadow-indigo-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Submit Request"}
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
};

export default AskHelpCard;