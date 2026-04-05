import React from "react";
import { useSearchParams, Link } from "react-router-dom";
import { SearchX, MapPin, UserCheck, ChevronRight } from "lucide-react";
import { useSearchQuery } from "../hooks/useSearch";
import { useDebounce } from "../hooks/useDebounce"; // 🟢 IMPORT HOOK

// --- HELPERS ---
const getInitials = (name) => {
  if (!name) return "?";
  return name.charAt(0).toUpperCase();
};

const hasValidProfilePic = (url) => {
  return url && typeof url === 'string' && !url.includes("default");
};

// --- SKELETON LOADER ---
const SearchSkeleton = () => (
  <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center space-x-4 animate-pulse">
    <div className="w-14 h-14 rounded-full bg-slate-200 shrink-0"></div>
    <div className="flex-1 space-y-3">
      <div className="w-40 h-4 bg-slate-200 rounded-full"></div>
      <div className="w-24 h-3 bg-slate-100 rounded-full"></div>
    </div>
  </div>
);

const SearchPage = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") || "";

  // 🟢 DEBOUNCE: Only updates 300ms after the user stops typing
  const debouncedQuery = useDebounce(query, 300);

  // 🚀 Pass the debounced query to React Query, not the raw one
  const { data: results = [], isLoading } = useSearchQuery(debouncedQuery);

  // Don't show anything if the search bar is completely empty
  if (!query.trim()) {
    return null; 
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 lg:py-12 min-h-[calc(100vh-4rem)]">
      
      <div className="mb-8 border-b border-slate-200 pb-6">
        <h1 className="text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight">
          Search Results for <span className="text-indigo-600 bg-indigo-50 px-2 rounded-md">"{query}"</span>
        </h1>
        <p className="text-slate-500 font-medium mt-2">
          {isLoading ? "Searching network..." : `Found ${results.length} student${results.length === 1 ? '' : 's'}`}
        </p>
      </div>

      {/* LOADING STATE */}
      {isLoading ? (
        <div className="space-y-4">
          <SearchSkeleton />
          <SearchSkeleton />
          <SearchSkeleton />
        </div>
      ) : results.length > 0 ? (
        
        /* 🟢 RESULTS STATE: Converted back to List View (space-y-4) */
        <div className="space-y-4">
          {results.map((user) => (
            <Link
              key={user.id}
              to={`/profile/${user.id}`}
              className="group flex items-center p-5 bg-white rounded-2xl shadow-sm hover:shadow-md border border-slate-100 hover:border-indigo-100 transition-all duration-200"
            >
              {/* Avatar */}
              <div className="relative shrink-0 mr-4">
                {hasValidProfilePic(user.profile_pic_url) ? (
                  <img
                    src={user.profile_pic_url}
                    alt={user.full_name}
                    loading="lazy"      // 🟢 ADDED: Defers loading off-screen images
                    decoding="async"    // 🟢 ADDED: Prevents UI freezing while decoding
                    className="w-14 h-14 rounded-full object-cover shadow-sm ring-2 ring-transparent group-hover:ring-indigo-100 transition-all"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-full bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center text-xl font-black shadow-sm ring-2 ring-transparent group-hover:ring-indigo-100 transition-all">
                    {getInitials(user.full_name)}
                  </div>
                )}
                
                {/* Friendship Badge overlay */}
                {user.is_friend && (
                  <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-white p-1 rounded-full border-2 border-white shadow-sm" title="Connected">
                    <UserCheck size={12} strokeWidth={3} />
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-bold text-slate-900 truncate group-hover:text-indigo-600 transition-colors">
                  {user.full_name}
                </h3>
                <div className="flex items-center gap-2 mt-1 text-sm font-medium text-slate-500 truncate">
                   <span className="truncate">{user.email}</span>
                </div>
                {user.location && (
                  <div className="flex items-center gap-1 mt-1.5 text-xs font-bold uppercase tracking-wider text-slate-400">
                    <MapPin size={14} />
                    <span className="truncate">{user.location}</span>
                  </div>
                )}
              </div>

              {/* Arrow Indicator */}
              <div className="pl-4 text-slate-300 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all">
                <ChevronRight size={24} />
              </div>
            </Link>
          ))}
        </div>

      ) : (
        /* EMPTY STATE */
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-slate-200 border-dashed text-center">
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4 border border-slate-100 shadow-inner">
            <SearchX className="w-10 h-10 text-slate-300" />
          </div>
          <h3 className="text-xl font-extrabold text-slate-800 mb-2">No peers found</h3>
          <p className="text-slate-500 font-medium max-w-sm px-4">
            We couldn't find anyone matching <span className="font-bold">"{query}"</span>. Try checking for typos or using a different name.
          </p>
        </div>
      )}
    </div>
  );
};

export default SearchPage;