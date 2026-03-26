import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { helpService } from "../services/helpService";
import { 
  ArrowLeft, Github, CheckCircle, Clock, 
  MessageSquare, Trophy, Code2, AlertTriangle, Zap, CheckCircle2, Info, Layers
} from "lucide-react";

// 🟢 SMART HELPERS
const formatDateTime = (dateString) => {
  if (!dateString) return "Recently";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", { 
    month: "short", day: "numeric", year: "numeric",
    hour: "numeric", minute: "2-digit" 
  });
};

const hasValidProfilePic = (url) => {
  if (!url || typeof url !== 'string') return false;
  if (url.includes("default")) return false;
  return true;
};

const getInitials = (name) => {
  if (!name) return "?";
  return name.charAt(0).toUpperCase();
};

const HelpDetails = () => {
  const { requestId } = useParams();
  const navigate = useNavigate();
  
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [solutionText, setSolutionText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchDetails = async () => {
    try {
      const data = await helpService.getDetails(requestId);
      setRequest(data);
    } catch (error) {
      console.error("Error fetching details:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [requestId]);

  const handlePostSolution = async (e) => {
    e.preventDefault();
    if (!solutionText.trim()) return;

    setSubmitting(true);
    try {
      await helpService.postSolution(requestId, solutionText);
      setSolutionText(""); 
      fetchDetails(); 
    } catch (error) {
      alert(error.response?.data?.message || "Failed to post solution");
    } finally {
      setSubmitting(false);
    }
  };

  const handleAccept = async (solutionId) => {
    if (!window.confirm("Are you sure? This will mark the problem as Solved and award +10 RP to this user.")) return;

    try {
      await helpService.acceptSolution(solutionId);
      fetchDetails(); 
    } catch (error) {
      alert("Failed to accept solution");
    }
  };

  // --- LOADING STATE ---
  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-slate-100 flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
        <p className="text-slate-500 font-bold tracking-widest text-xs uppercase">Loading Ticket...</p>
      </div>
    );
  }

  // --- ERROR STATE ---
  if (!request) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-slate-100 flex flex-col items-center justify-center px-4">
        <AlertTriangle className="w-12 h-12 text-slate-300 mb-4" />
        <h2 className="text-xl font-bold text-slate-800 mb-2">Ticket Not Found</h2>
        <p className="text-slate-500 mb-6 text-sm">This request may have been deleted or doesn't exist.</p>
        <button onClick={() => navigate(-1)} className="px-6 py-2.5 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl shadow-sm hover:bg-slate-50 transition-colors text-sm">Go Back</button>
      </div>
    );
  }

  // 🟢 CRASH PREVENTERS
  const safeTags = request.tags || [];
  const safeSolutions = request.solutions || [];
  const isSolved = request.status === "solved";
  const authorPic = request.author?.profile_pic_url;
  const authorName = request.author?.full_name || "Unknown User";

  return (
    // 🟢 UI UPGRADE: Dull grey background (`bg-slate-100`) to rest the eyes and make white cards pop
    <div className="min-h-[calc(100vh-4rem)] bg-slate-100 py-8 lg:py-10 px-4 sm:px-6 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      <div className="max-w-6xl mx-auto">
        
        {/* Back Button */}
        <button 
          onClick={() => navigate(-1)} 
          className="group flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors mb-6 w-fit"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Feed
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          
          {/* =======================
              LEFT COLUMN: PROBLEM & THREAD (col-span-8)
             ======================= */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* 1. ORIGINAL REQUEST TICKET */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              
              {/* GitHub-style Header */}
              <div className="bg-slate-50/80 px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {hasValidProfilePic(authorPic) ? (
                    <img src={authorPic} alt={authorName} className="w-10 h-10 rounded-full object-cover border border-slate-200 shadow-sm" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-sm shadow-sm shrink-0 border border-indigo-100">
                      {getInitials(authorName)}
                    </div>
                  )}
                  <div>
                    <div className="flex items-center gap-2">
                        <p className="text-sm font-extrabold text-slate-900">{authorName}</p>
                        {request.is_owner && (
                            <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-600 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-md">Author</span>
                        )}
                    </div>
                    <p className="text-xs font-medium text-slate-500 flex items-center gap-1 mt-0.5">
                      <Clock className="w-3 h-3" /> {formatDateTime(request.created_at)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Ticket Body */}
              <div className="p-6 sm:p-8">
                <h1 className="text-2xl font-extrabold text-slate-900 leading-snug mb-6">
                  {request.title}
                </h1>

                <div className="text-slate-700 text-[15px] leading-relaxed font-medium mb-8 whitespace-pre-wrap">
                  {request.description}
                </div>

                {request.image_url && (
                  <div className="rounded-xl overflow-hidden border border-slate-200 bg-slate-50 p-2 shadow-inner">
                    <img 
                      src={request.image_url} 
                      alt="Error Context" 
                      className="w-full h-auto max-h-[450px] object-contain rounded-lg border border-slate-200/60 bg-white"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* 🟢 2. RESTRUCTURED: POST SOLUTION INPUT */}
            {/* Moved directly below the problem to make it highly noticeable! */}
            {!request.is_owner && !isSolved && (
                <div className="bg-white rounded-2xl shadow-[0_4px_20px_-4px_rgba(99,102,241,0.1)] border border-indigo-100 p-6 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500"></div>
                    <h3 className="text-sm font-extrabold text-slate-900 mb-2 flex items-center gap-2">
                        <Code2 className="w-5 h-5 text-indigo-600" /> Have a solution?
                    </h3>
                    <p className="text-xs font-medium text-slate-500 mb-5">
                        Write your fix below. If the author accepts it, you earn <span className="font-bold text-amber-600">+10 RP</span>.
                    </p>
                    
                    <form onSubmit={handlePostSolution}>
                        <textarea
                            required minLength={10} rows="4"
                            placeholder="Explain the fix or share a code snippet..."
                            className="w-full p-4 rounded-xl border border-slate-200 bg-slate-50 hover:border-indigo-300 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none text-sm font-medium text-slate-800 placeholder:text-slate-400 resize-none mb-3 transition-all shadow-inner"
                            value={solutionText}
                            onChange={(e) => setSolutionText(e.target.value)}
                        />
                        <div className="flex justify-end">
                            <button
                                type="submit" disabled={submitting || solutionText.length < 10}
                                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-sm rounded-xl transition-all shadow-md shadow-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {submitting ? "Posting..." : "Submit Solution"}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* 3. SOLUTIONS THREAD */}
            <div className="space-y-4 pt-4">
              <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2 px-1">
                <MessageSquare className="w-5 h-5 text-slate-400" />
                Discussion <span className="text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md text-sm">{safeSolutions.length}</span>
              </h3>
              
              {safeSolutions.length === 0 ? (
                <div className="p-8 text-center bg-transparent border-2 border-dashed border-slate-300 rounded-2xl">
                  <p className="text-slate-500 text-sm font-medium">No solutions have been posted yet.</p>
                </div>
              ) : (
                safeSolutions.map((sol) => {
                  const solverPic = sol.solver?.profile_pic_url;
                  const solverName = sol.solver?.full_name || "Unknown User";

                  return (
                    <div 
                      key={sol.id} 
                      className={`bg-white rounded-2xl p-5 sm:p-6 transition-all border ${
                          sol.is_accepted 
                          ? "border-emerald-400 shadow-[0_4px_15px_-3px_rgba(16,185,129,0.15)] bg-emerald-50/10" 
                          : "border-slate-200 shadow-sm"
                      }`}
                    >
                      {/* Solver Header */}
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
                          <div className="flex items-center gap-3">
                              {hasValidProfilePic(solverPic) ? (
                                <img src={solverPic} alt={solverName} className="w-9 h-9 rounded-full object-cover border border-slate-200 shadow-sm" />
                              ) : (
                                <div className="w-9 h-9 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-sm border border-slate-200 shadow-sm shrink-0">
                                  {getInitials(solverName)}
                                </div>
                              )}
                              <div>
                                  <span className="text-sm font-extrabold text-slate-900 block leading-tight">{solverName}</span>
                                  <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1 mt-0.5">
                                      <Trophy className="w-3 h-3 text-amber-500 fill-amber-500" /> {sol.solver?.reputation || 0} RP
                                  </span>
                              </div>
                          </div>
                          {sol.is_accepted && (
                              <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md flex items-center gap-1.5 shrink-0 w-fit">
                                  <CheckCircle2 className="w-3.5 h-3.5" /> Accepted
                              </span>
                          )}
                      </div>

                      {/* Solution Content */}
                      <div className="text-[15px] font-medium text-slate-700 whitespace-pre-wrap leading-relaxed pl-3.5 border-l-2 border-slate-200">
                          {sol.content}
                      </div>

                      {/* ACTIONS (For Author to accept) */}
                      {request.is_owner && !isSolved && (
                          <div className="mt-5 pt-4 border-t border-slate-100 flex justify-end">
                              <button
                                  onClick={() => handleAccept(sol.id)}
                                  className="flex items-center gap-2 px-4 py-2 bg-white border border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:border-emerald-300 font-bold text-xs rounded-lg transition-colors shadow-sm"
                              >
                                  <CheckCircle2 className="w-4 h-4" /> Accept Solution
                              </button>
                          </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* =======================
              RIGHT COLUMN: SIDEBAR METADATA (col-span-4)
             ======================= */}
          <div className="lg:col-span-4 space-y-6">
             <div className="sticky top-24 space-y-5">
                
                {/* 1. METADATA CARD */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    
                    <div className="bg-slate-50/80 px-5 py-3 border-b border-slate-100 flex items-center gap-2">
                        <Info className="w-4 h-4 text-slate-400" />
                        <h3 className="text-[11px] font-extrabold text-slate-600 uppercase tracking-widest">Ticket Details</h3>
                    </div>

                    <div className="p-5 space-y-6">
                        {/* Status Indicator */}
                        <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Status</p>
                            {isSolved ? (
                                <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-100 p-3 rounded-xl">
                                    <div className="w-8 h-8 bg-white border border-emerald-100 shadow-sm rounded-full flex items-center justify-center text-emerald-600 shrink-0">
                                        <CheckCircle2 className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-extrabold text-emerald-900 leading-tight">Solved</p>
                                        <p className="text-[10px] font-medium text-emerald-700">Solution accepted</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-center gap-3 bg-amber-50/50 border border-amber-100/50 p-3 rounded-xl">
                                    <div className="w-8 h-8 bg-white border border-amber-100 shadow-sm rounded-full flex items-center justify-center text-amber-500 shrink-0">
                                        <span className="w-2.5 h-2.5 bg-amber-500 rounded-full animate-pulse"></span>
                                    </div>
                                    <div>
                                        <p className="text-sm font-extrabold text-slate-900 leading-tight">Open Ticket</p>
                                        <p className="text-[10px] font-medium text-slate-500">Waiting for answers</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Reward */}
                        <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Bounty</p>
                            <div className="flex items-center gap-2 text-sm font-extrabold text-slate-800 bg-slate-50 border border-slate-100 w-fit px-3 py-1.5 rounded-lg">
                                <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
                                +10 Reputation Points
                            </div>
                        </div>

                        {/* Tags */}
                        {safeTags.length > 0 && (
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5"><Layers className="w-3 h-3"/> Tech Stack</p>
                                <div className="flex flex-wrap gap-1.5">
                                    {safeTags.map((tag, i) => (
                                        <span key={i} className="px-2.5 py-1 bg-indigo-50 text-indigo-700 border border-indigo-100/50 text-[11px] font-bold rounded-md uppercase tracking-wider">
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* 🟢 RESTRUCTURED: GitHub Link Moved to Sidebar */}
                        {request.github_link && (
                            <div className="pt-4 border-t border-slate-100">
                                <a 
                                    href={request.github_link} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-center gap-2 w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm rounded-xl transition-colors shadow-sm"
                                >
                                    <Github className="w-4 h-4" /> Open Repository
                                </a>
                            </div>
                        )}
                    </div>
                </div>

                 {/* 2. OWNER TIP */}
                 {request.is_owner && !isSolved && (
                     <div className="bg-indigo-50 rounded-2xl p-5 border border-indigo-100 shadow-sm relative overflow-hidden">
                         <div className="absolute -right-4 -top-4 w-16 h-16 bg-indigo-200 rounded-full opacity-30 blur-xl"></div>
                         <div className="flex gap-3 relative z-10">
                           <AlertTriangle className="w-5 h-5 text-indigo-600 shrink-0" />
                           <p className="text-xs font-medium text-indigo-900 leading-relaxed">
                               <b className="font-extrabold text-indigo-700 block mb-1">Author Tools</b> 
                               When a user provides a working fix, click <b className="font-extrabold bg-white px-1 py-0.5 rounded">Accept Solution</b> below their comment to close this ticket.
                           </p>
                         </div>
                     </div>
                 )}

             </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default HelpDetails;