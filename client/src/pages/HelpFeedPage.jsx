import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { helpService } from "../services/helpService";
import { 
  Loader2, Zap, Search, Filter, 
  Clock, ArrowRight, X, Image as ImageIcon
} from "lucide-react";

// 🟢 SMART HELPERS (Keeps UI consistent with the Widget)
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

const HelpFeedPage = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");

  useEffect(() => {
    const fetchFeed = async () => {
      try {
        const data = await helpService.getFeed();
        setRequests(data);
      } catch (err) {
        console.error("Failed to load help feed", err);
      } finally {
        setLoading(false);
      }
    };
    fetchFeed();
  }, []);

  // 🟢 SMART SEARCH: Safely checks title and tags
  const filteredRequests = requests.filter(req => {
    const searchLower = filter.toLowerCase();
    const titleMatch = (req.title || "").toLowerCase().includes(searchLower);
    const tagMatch = (req.tags || []).some(tag => (tag || "").toLowerCase().includes(searchLower));
    return titleMatch || tagMatch;
  });

  return (
    // 🟢 UI FIX: Changed bg from #f8fafc to slate-100 to reduce glare
    <div className="min-h-[calc(100vh-4rem)] bg-slate-100 py-8 lg:py-12 px-4">
      <div className="max-w-5xl mx-auto">
        
        {/* ================= HEADER & SEARCH ================= */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 flex items-center gap-3 tracking-tight">
              <div className="p-2 bg-gradient-to-br from-amber-100 to-amber-200 rounded-xl shadow-sm border border-amber-200/50">
                <Zap className="w-6 h-6 text-amber-600 fill-amber-500" />
              </div>
              Community Help Desk
            </h1>
            <p className="text-slate-500 mt-2 text-sm md:text-base font-medium">Browse open problems, help your peers, and earn reputation.</p>
          </div>
          
          {/* Premium Search Bar */}
          <div className="relative w-full md:w-80 shrink-0 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
            <input 
              type="text" 
              placeholder="Search by title or tag..." 
              // 🟢 UI FIX: Changed pure white bg to soft slate-50
              className="w-full pl-12 pr-10 py-3.5 rounded-2xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 outline-none shadow-sm transition-all text-sm font-medium text-slate-800 placeholder:text-slate-400"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            />
            {filter && (
              <button 
                onClick={() => setFilter("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-1 bg-slate-200 hover:bg-slate-300 text-slate-500 rounded-full transition-colors"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        {/* ================= LOADING STATE ================= */}
        {loading && (
          // 🟢 UI FIX: Changed pure white bg to soft slate-50
          <div className="py-32 flex flex-col items-center justify-center bg-slate-50 rounded-3xl border border-slate-200 shadow-sm">
            <Loader2 className="w-10 h-10 text-indigo-500 animate-spin mx-auto mb-4" />
            <p className="text-slate-500 font-medium text-sm">Finding bugs to squash...</p>
          </div>
        )}

        {/* ================= EMPTY STATE ================= */}
        {!loading && filteredRequests.length === 0 && (
          // 🟢 UI FIX: Changed pure white bg to soft slate-50
          <div className="bg-slate-50 rounded-3xl p-12 text-center border border-slate-200 shadow-sm flex flex-col items-center justify-center">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-5 border border-slate-200 shadow-inner">
              <Filter className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-xl font-extrabold text-slate-900 mb-2">No problems found</h3>
            <p className="text-slate-500 font-medium text-sm mb-6 max-w-md mx-auto">
              {filter ? "We couldn't find any requests matching your search. Try a different keyword or clear your filter." : "There are currently no open requests. Check back later!"}
            </p>
            {filter && (
              <button 
                onClick={() => setFilter("")}
                className="px-6 py-2.5 bg-indigo-100 text-indigo-700 hover:bg-indigo-200 font-bold rounded-xl transition-colors text-sm"
              >
                Clear Search
              </button>
            )}
          </div>
        )}

        {/* ================= REQUEST LIST ================= */}
        <div className="grid gap-5">
          {filteredRequests.map((req) => {
            const authorPic = req.author?.profile_pic_url || req.author?.profile_image;
            const authorName = req.author?.full_name || req.author?.name || "Unknown User";

            return (
              <Link 
                key={req.id} 
                to={`/help/${req.id}`}
                // 🟢 UI FIX: Changed pure white bg to soft slate-50
                className="bg-slate-50 rounded-[24px] p-4 sm:p-6 border border-slate-200 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)] hover:shadow-[0_8px_30px_-4px_rgba(6,81,237,0.12)] hover:border-indigo-200 transition-all duration-300 group flex flex-col sm:flex-row gap-5 sm:gap-6 lg:gap-8"
              >
                
                {/* 🟢 IMAGE THUMBNAIL */}
                {req.image_url ? (
                   <div className="w-full sm:w-48 lg:w-64 h-48 sm:h-auto min-h-[12rem] shrink-0 bg-slate-100 rounded-2xl overflow-hidden border border-slate-200/60 relative shadow-inner ring-1 ring-slate-900/5">
                     <img 
                       src={req.image_url} 
                       alt="Problem Context" 
                       className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                     />
                   </div>
                ) : (
                  <div className="w-full sm:w-48 lg:w-64 h-32 sm:h-auto min-h-[12rem] shrink-0 bg-slate-100 rounded-2xl overflow-hidden border border-slate-200 flex flex-col items-center justify-center text-slate-400">
                    <ImageIcon className="w-10 h-10 mb-2 opacity-50" />
                    <span className="text-[10px] font-bold uppercase tracking-widest opacity-50">No Image</span>
                  </div>
                )}

                {/* 🟢 CONTENT AREA */}
                <div className="flex-1 flex flex-col min-w-0">
                  
                  {/* Title & Badge Row */}
                  <div className="flex justify-between items-start gap-4 mb-3">
                    <h2 className="text-lg lg:text-xl font-extrabold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-2 leading-tight decoration-indigo-200 underline-offset-4 group-hover:underline">
                      {req.title}
                    </h2>
                    <div className="shrink-0 flex items-center gap-1.5 bg-gradient-to-r from-amber-400 to-orange-500 text-white text-[11px] font-black px-3 py-1.5 rounded-full shadow-[0_0_10px_rgba(245,158,11,0.3)]">
                      <Zap size={12} className="fill-white" />
                      +10 RP
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-slate-500 text-sm font-medium line-clamp-2 mb-4 leading-relaxed">
                    {req.description}
                  </p>

                  {/* Tags */}
                  {req.tags && req.tags.length > 0 && (
                    <div className="flex flex-wrap items-center gap-2 mb-6">
                      {req.tags.map((tag, i) => (
                        <span key={i} className="px-3 py-1.5 bg-slate-100 text-slate-600 text-[11px] font-bold uppercase tracking-wider rounded-lg border border-slate-200/60">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Footer (Author & Solve CTA) */}
                  <div className="mt-auto pt-4 border-t border-slate-200 flex items-center justify-between">
                    
                    {/* Author Info */}
                    <div className="flex items-center gap-3">
                      {hasValidProfilePic(authorPic) ? (
                        <img 
                          src={authorPic} 
                          alt={authorName} 
                          className="w-10 h-10 rounded-full object-cover shadow-sm ring-2 ring-slate-100 border border-slate-200"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-sm shrink-0 shadow-sm ring-2 ring-slate-100">
                          {getInitials(authorName)}
                        </div>
                      )}
                      
                      <div className="flex flex-col">
                        <span className="text-sm text-slate-800 font-bold truncate max-w-[150px] sm:max-w-[200px]">
                          {authorName}
                        </span>
                        <span className="text-[11px] text-slate-500 font-medium flex items-center gap-1.5 mt-0.5">
                          <Clock className="w-3 h-3" />
                          {formatDateTime(req.created_at || req.timestamp)}
                        </span>
                      </div>
                    </div>

                    {/* Prominent Solve Button */}
                    <div className="shrink-0 bg-indigo-600 text-white text-xs font-extrabold px-4 sm:px-5 py-2.5 rounded-xl shadow-md shadow-indigo-200 group-hover:bg-indigo-700 group-hover:shadow-lg transition-all duration-300 flex items-center gap-2 group-hover:-translate-y-0.5">
                      Solve <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                    </div>

                  </div>
                </div>
              </Link>
            );
          })}
        </div>

      </div>
    </div>
  );
};

export default HelpFeedPage;