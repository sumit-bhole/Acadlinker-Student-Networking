import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Loader2, Zap, Inbox, ArrowRight, Clock } from "lucide-react";
import { helpService } from "../services/helpService";

// 🟢 Exact Date and Time Formatter
const formatDateTime = (dateString) => {
  if (!dateString) return "Recently";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", { 
    month: "short", 
    day: "numeric", 
    year: "numeric",
    hour: "numeric", 
    minute: "2-digit" 
  });
};

// Smart Initials Helper
const getInitials = (name) => {
  if (!name) return "?";
  return name.charAt(0).toUpperCase();
};

const HelpFeedWidget = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

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

  // --- LOADING STATE ---
  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden min-h-[300px] flex flex-col">
        <WidgetHeader />
        <div className="flex-1 flex flex-col items-center justify-center bg-slate-50/50">
          <Loader2 className="w-8 h-8 text-indigo-400 animate-spin mb-3" />
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Fetching Feed</p>
        </div>
      </div>
    );
  }

  // --- EMPTY STATE ---
  if (requests.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden min-h-[300px] flex flex-col">
        <WidgetHeader />
        <div className="flex-1 p-8 flex flex-col items-center justify-center text-center bg-slate-50/50">
          <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 border border-slate-100 shadow-sm">
            <Inbox className="w-6 h-6 text-slate-300" />
          </div>
          <h4 className="font-bold text-slate-800 mb-1">No problems to solve</h4>
          <p className="text-xs font-medium text-slate-500 mb-6">Be the first to ask the community for help!</p>
          <Link 
            to={`/profile/me`} 
            className="inline-flex items-center gap-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 px-5 py-2.5 rounded-xl transition-all shadow-md hover:shadow-lg active:scale-95"
          >
            Go to Profile <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    );
  }

  // --- POPULATED STATE ---
  return (
    <div className="bg-white rounded-2xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-slate-200 overflow-hidden flex flex-col h-full group/widget transition-all hover:shadow-[0_8px_30px_-4px_rgba(6,81,237,0.15)]">
      
      <WidgetHeader />

      <div className="flex-1 flex flex-col">
        {/* We only map the first item for the widget */}
        {requests.slice(0, 1).map((req) => {
          const authorPic = req.author?.profile_pic_url || req.author?.profile_image;
          const authorName = req.author?.full_name || req.author?.name || "Unknown User";

          return (
            <Link 
              key={req.id} 
              to={`/help/${req.id}`} 
              className="flex-1 flex flex-col p-5 hover:bg-[#fafafa] transition-colors relative group/card"
            >
              {/* Top Row: Title & Premium RP Badge */}
              <div className="flex justify-between items-start gap-4 mb-3">
                <h4 className="font-extrabold text-slate-900 text-sm leading-snug line-clamp-2 group-hover/card:text-indigo-600 transition-colors decoration-indigo-200 underline-offset-4 group-hover/card:underline">
                  {req.title}
                </h4>
                
                {/* Sleek, Glowing RP Badge */}
                <div className="shrink-0 flex items-center gap-1 bg-gradient-to-r from-amber-400 to-orange-500 text-white text-[10px] font-black px-2.5 py-1 rounded-full shadow-[0_0_10px_rgba(245,158,11,0.3)]">
                  <Zap size={10} className="fill-white" />
                  +10 RP
                </div>
              </div>

              {/* Tags */}
              {req.tags && req.tags.length > 0 && (
                <div className="flex gap-1.5 flex-wrap mb-4">
                  {req.tags.slice(0, 2).map((tag, i) => (
                    <span key={i} className="text-[10px] px-2.5 py-1 bg-slate-100 text-slate-600 rounded-md font-bold uppercase tracking-wider border border-slate-200/60">
                      {tag}
                    </span>
                  ))}
                  {req.tags.length > 2 && (
                    <span className="text-[10px] px-2 py-1 bg-slate-50 text-slate-400 rounded-md font-bold border border-slate-100">
                      +{req.tags.length - 2}
                    </span>
                  )}
                </div>
              )}

              {/* Minimalist Image Preview (No overlay label) */}
              {req.image_url && (
                <div className="mb-4 rounded-xl overflow-hidden border border-slate-200/80 h-36 bg-slate-100 relative shadow-inner ring-1 ring-black/5">
                   <img 
                      src={req.image_url} 
                      alt="Problem Context" 
                      className="w-full h-full object-cover group-hover/card:scale-105 transition-transform duration-700 ease-out"
                   />
                </div>
              )}
              
              {/* Spacer to push author to bottom if container stretches */}
              <div className="mt-auto pt-3">
                {/* 🟢 THE FIX: Flex container to hold Author AND the Solve Button side-by-side */}
                <div className="flex items-center justify-between border-t border-slate-100 pt-4 mt-1">
                  
                  {/* Left Side: Author Avatar & Exact Time */}
                  <div className="flex items-center gap-3">
                    {authorPic && !authorPic.includes("default") ? (
                      <img 
                        src={authorPic} 
                        alt={authorName}
                        className="w-9 h-9 rounded-full object-cover shadow-sm ring-2 ring-white border border-slate-100 shrink-0" 
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-xs shrink-0 shadow-sm ring-2 ring-white">
                        {getInitials(authorName)}
                      </div>
                    )}

                    <div className="flex flex-col">
                        <span className="text-[13px] font-bold text-slate-800 leading-tight truncate max-w-[120px] sm:max-w-[160px]">
                          {authorName}
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1 mt-0.5">
                          <Clock size={10} />
                          {formatDateTime(req.created_at || req.timestamp)}
                        </span>
                    </div>
                  </div>

                  {/* 🟢 NEW: "Solve" Call To Action Button */}
                  <div className="shrink-0 bg-indigo-600 text-white text-[11px] font-extrabold px-3.5 py-2 rounded-xl shadow-md shadow-indigo-200 group-hover/card:bg-indigo-700 group-hover/card:shadow-lg transition-all duration-300 flex items-center gap-1.5 group-hover/card:-translate-y-0.5">
                    Solve <ArrowRight size={12} className="group-hover/card:translate-x-0.5 transition-transform" />
                  </div>

                </div>
              </div>
            </Link>
          );
        })}
      </div>
      
      {/* Bottom Action Button */}
      <Link 
        to="/help/feed" 
        className="block p-3.5 text-center text-xs font-bold text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50/50 transition-colors border-t border-slate-100 bg-white"
      >
        View All Problems &rarr;
      </Link>
    </div>
  );
};

// Premium Header Component
const WidgetHeader = () => (
  <div className="relative overflow-hidden border-b border-slate-200">
    <div className="absolute inset-0 bg-gradient-to-r from-indigo-50/50 via-white to-amber-50/30"></div>
    
    <div className="relative p-4 flex justify-between items-center">
      <h3 className="font-extrabold text-slate-900 flex items-center gap-2 text-sm tracking-wide">
        <div className="p-1 bg-gradient-to-br from-amber-100 to-amber-200 rounded-md shadow-sm border border-amber-200/50">
          <Zap className="w-4 h-4 text-amber-600 fill-amber-500" />
        </div>
        Solve & Earn
      </h3>
      
      <div className="flex items-center gap-1.5 px-2 py-1 bg-white rounded-full shadow-sm border border-slate-100">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </span>
        <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Live</span>
      </div>
    </div>
  </div>
);

export default HelpFeedWidget;