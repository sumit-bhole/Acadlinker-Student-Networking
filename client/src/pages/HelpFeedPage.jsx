import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { helpService } from "../services/helpService";
import { 
  Loader2, Zap, Search, Filter, 
  MessageSquare, Clock, ArrowRight, User 
} from "lucide-react";

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

  // Simple client-side search
  const filteredRequests = requests.filter(req => 
    req.title.toLowerCase().includes(filter.toLowerCase()) ||
    req.tags.some(tag => tag.toLowerCase().includes(filter.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-gray-50/50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Zap className="w-6 h-6 text-amber-500 fill-amber-500" />
              Community Help Desk
            </h1>
            <p className="text-gray-500 mt-1">Browse open problems and earn reputation.</p>
          </div>
          
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search by title or tag..." 
              className="pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:ring-2 focus:ring-indigo-500 outline-none w-full md:w-64 shadow-sm"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            />
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="py-20 text-center">
            <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mx-auto mb-4" />
            <p className="text-gray-500">Finding bugs to squash...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredRequests.length === 0 && (
          <div className="bg-white rounded-2xl p-10 text-center border border-gray-200 shadow-sm">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Filter className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">No problems found</h3>
            <p className="text-gray-500">Try adjusting your search or check back later.</p>
          </div>
        )}

        {/* Request List */}
        <div className="grid gap-4">
          {filteredRequests.map((req) => (
            <Link 
              key={req.id} 
              to={`/help/${req.id}`}
              className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all group"
            >
              <div className="flex flex-col md:flex-row gap-6">
                
                {/* Image Thumbnail (Left side on desktop) */}
                {req.image_url && (
                   <div className="w-full md:w-48 h-32 shrink-0 bg-gray-100 rounded-xl overflow-hidden border border-gray-100">
                     <img 
                       src={req.image_url} 
                       alt={req.title} 
                       className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                     />
                   </div>
                )}

                {/* Content */}
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-2">
                    <h2 className="text-lg font-bold text-gray-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
                      {req.title}
                    </h2>
                    <span className="shrink-0 bg-green-100 text-green-700 text-xs font-bold px-2.5 py-1 rounded-full border border-green-200">
                      +10 RP
                    </span>
                  </div>

                  <p className="text-gray-600 text-sm line-clamp-2 mb-4">
                    {req.description}
                  </p>

                  <div className="flex flex-wrap items-center gap-2 mb-4">
                    {req.tags.map((tag, i) => (
                      <span key={i} className="px-2.5 py-1 bg-gray-50 text-gray-600 text-xs font-medium rounded-lg border border-gray-100">
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                    <div className="flex items-center gap-3">
                      <img 
                        src={req.author?.profile_pic_url || "/default-profile.png"} 
                        alt="User" 
                        className="w-6 h-6 rounded-full object-cover"
                      />
                      <span className="text-sm text-gray-600 font-medium">
                        {req.author?.full_name}
                      </span>
                      <span className="text-gray-300">•</span>
                      <span className="text-xs text-gray-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(req.created_at).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 text-indigo-600 text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                      Solve <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

      </div>
    </div>
  );
};

export default HelpFeedPage;