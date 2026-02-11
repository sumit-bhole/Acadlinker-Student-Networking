import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Loader2, Zap, Inbox, ImageIcon } from "lucide-react";
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
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6">
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <h3 className="font-bold text-gray-900 flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
            Solve & Earn
          </h3>
          <span className="text-xs font-medium text-gray-500">Reputation</span>
        </div>
        <div className="p-8 text-center">
          <Loader2 className="w-6 h-6 text-indigo-600 animate-spin mx-auto" />
          <p className="mt-2 text-sm text-gray-500">Loading problems...</p>
        </div>
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6">
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <h3 className="font-bold text-gray-900 flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
            Solve & Earn
          </h3>
          <span className="text-xs font-medium text-gray-500">Reputation</span>
        </div>
        <div className="p-8 text-center">
          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <Inbox className="w-6 h-6 text-gray-400" />
          </div>
          <h4 className="font-medium text-gray-900 mb-1">No problems to solve</h4>
          <p className="text-sm text-gray-500 mb-4">Be the first to ask for help!</p>
          {/* Note: This link might need to point to the user's profile where the Ask button is */}
          <Link 
            to={`/profile/me`} // Or handle this navigation however you prefer
            className="inline-block text-sm font-medium text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 px-4 py-2 rounded-lg transition-colors"
          >
            Go to Profile →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6 sticky top-24">
      <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
        <h3 className="font-bold text-gray-900 flex items-center gap-2">
          <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
          Solve & Earn
        </h3>
        <span className="text-xs font-medium text-gray-500">Reputation</span>
      </div>

      <div className="divide-y divide-gray-50">
        {requests.map((req) => (
          <Link 
            key={req.id} 
            to={`/help/${req.id}`} 
            className="block p-4 hover:bg-indigo-50/30 transition-colors group"
          >
            {/* Header: Title + Reward */}
            <div className="flex justify-between items-start mb-2">
              <h4 className="font-bold text-gray-900 text-sm line-clamp-2 leading-snug group-hover:text-indigo-600 transition-colors">
                {req.title}
              </h4>
              <span className="shrink-0 ml-2 bg-green-100 text-green-700 text-[10px] font-bold px-1.5 py-0.5 rounded border border-green-200">
                +10 RP
              </span>
            </div>

            {/* 🆕 PROBLEM IMAGE PREVIEW */}
            {req.image_url && (
              <div className="mb-3 rounded-lg overflow-hidden border border-gray-200 h-32 bg-gray-50 relative">
                 <img 
                    src={req.image_url} 
                    alt="Problem" 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                 />
                 <div className="absolute bottom-1 right-1 bg-black/50 backdrop-blur-sm text-white text-[10px] px-1.5 py-0.5 rounded flex items-center gap-1">
                    <ImageIcon className="w-3 h-3" />
                    <span>Image</span>
                 </div>
              </div>
            )}
            
            {/* Tags */}
            <div className="flex gap-1.5 flex-wrap mb-3">
              {req.tags.slice(0, 3).map((tag, i) => (
                <span key={i} className="text-[10px] px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full border border-gray-200 font-medium">
                  {tag}
                </span>
              ))}
              {req.tags.length > 3 && (
                  <span className="text-[10px] px-1 text-gray-400">+{req.tags.length - 3}</span>
              )}
            </div>

            {/* Footer: Author */}
            <div className="flex items-center gap-2">
              <img 
                src={req.author?.profile_pic_url || "/default-profile.png"} 
                alt={req.author?.full_name}
                className="w-6 h-6 rounded-full object-cover border border-gray-100" 
              />
              <div className="flex flex-col">
                  <span className="text-xs font-bold text-gray-700 group-hover:text-indigo-700">
                    {req.author?.full_name || "Unknown User"}
                  </span>
                  <span className="text-[10px] text-gray-400">
                    Posted just now
                  </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
      
      <Link to="/help/feed" className="block p-3 text-center text-xs font-bold text-indigo-600 hover:bg-indigo-50 transition-colors border-t border-gray-100">
        View All Problems
      </Link>
    </div>
  );
};

export default HelpFeedWidget;