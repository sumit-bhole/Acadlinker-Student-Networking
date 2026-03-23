import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Loader2, Zap, Inbox, ImageIcon, ArrowRight } from "lucide-react";
import { helpService } from "../services/helpService";

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

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h3 className="font-bold text-slate-900 flex items-center gap-2 text-sm tracking-wide">
            <div className="p-1 bg-amber-100 rounded-md">
              <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
            </div>
            Solve & Earn
          </h3>
        </div>
        <div className="p-10 flex flex-col items-center justify-center">
          <Loader2 className="w-8 h-8 text-indigo-400 animate-spin mb-3" />
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Loading</p>
        </div>
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h3 className="font-bold text-slate-900 flex items-center gap-2 text-sm tracking-wide">
            <div className="p-1 bg-amber-100 rounded-md">
              <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
            </div>
            Solve & Earn
          </h3>
        </div>
        <div className="p-8 text-center">
          <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-slate-100 shadow-inner">
            <Inbox className="w-6 h-6 text-slate-400" />
          </div>
          <h4 className="font-bold text-slate-800 mb-1">No problems to solve</h4>
          <p className="text-xs text-slate-500 mb-5">Be the first to ask for help!</p>
          <Link 
            to={`/profile/me`} 
            className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 px-4 py-2.5 rounded-xl transition-all shadow-md shadow-indigo-200 active:scale-95"
          >
            Go to Profile <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-full">
      
      {/* Premium Header */}
      <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
        <h3 className="font-bold text-slate-900 flex items-center gap-2 text-sm tracking-wide">
          <div className="p-1 bg-amber-100 rounded-md shadow-sm">
            <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
          </div>
          Solve & Earn
        </h3>
        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Reputation</span>
      </div>

      <div className="divide-y divide-slate-100 flex-1">
        {/* 🟢 THE FIX: requests.slice(0, 1) guarantees ONLY ONE request is shown! */}
        {requests.slice(0, 1).map((req) => (
          <Link 
            key={req.id} 
            to={`/help/${req.id}`} 
            className="block p-4 hover:bg-slate-50 transition-colors group"
          >
            {/* Header: Title + Premium RP Badge */}
            <div className="flex justify-between items-start mb-2.5 gap-3">
              <h4 className="font-bold text-slate-800 text-sm line-clamp-2 leading-snug group-hover:text-indigo-600 transition-colors">
                {req.title}
              </h4>
              <div className="shrink-0 flex items-center gap-1 bg-gradient-to-br from-amber-50 to-orange-50 text-amber-700 text-[10px] font-black px-2 py-1 rounded-lg border border-amber-200/60 shadow-sm">
                <Zap size={10} className="fill-amber-500 text-amber-500" />
                +10 RP
              </div>
            </div>

            {/* PROBLEM IMAGE PREVIEW */}
            {req.image_url && (
              <div className="mb-3 rounded-xl overflow-hidden border border-slate-200 h-32 bg-slate-100 relative shadow-inner">
                 <img 
                    src={req.image_url} 
                    alt="Problem" 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                 />
                 <div className="absolute bottom-2 right-2 bg-slate-900/70 backdrop-blur-md text-white text-[10px] font-medium px-2 py-1 rounded-lg flex items-center gap-1.5 border border-white/10">
                    <ImageIcon className="w-3 h-3" />
                    <span>Image attached</span>
                 </div>
              </div>
            )}
            
            {/* 1 Primary Tag + Counter */}
            <div className="flex gap-1.5 flex-wrap mb-3">
              {req.tags.slice(0, 1).map((tag, i) => (
                <span key={i} className="text-[10px] px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-md border border-indigo-100/50 font-bold uppercase tracking-wider">
                  {tag}
                </span>
              ))}
              {req.tags.length > 1 && (
                <span className="text-[10px] px-2 py-1 bg-slate-100 text-slate-500 rounded-md border border-slate-200 font-bold">
                  +{req.tags.length - 1}
                </span>
              )}
            </div>

            {/* Footer: Author Info */}
            <div className="flex items-center gap-2.5 mt-1">
              <img 
                src={req.author?.profile_pic_url || "/default-profile.png"} 
                alt={req.author?.full_name}
                className="w-7 h-7 rounded-full object-cover border border-slate-200 shadow-sm" 
              />
              <div className="flex flex-col">
                  <span className="text-xs font-bold text-slate-700 group-hover:text-indigo-600 transition-colors">
                    {req.author?.full_name || "Unknown User"}
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium">
                    Posted just now
                  </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
      
      {/* Bottom Action Button */}
      <Link to="/help/feed" className="block p-3.5 text-center text-xs font-bold text-slate-500 hover:text-indigo-600 hover:bg-slate-50 transition-colors border-t border-slate-100">
        View All Problems →
      </Link>
    </div>
  );
};

export default HelpFeedWidget;