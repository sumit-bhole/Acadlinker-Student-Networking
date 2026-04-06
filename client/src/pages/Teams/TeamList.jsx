import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { 
  Search, 
  Plus, 
  Briefcase,
  X,
  Filter
} from "lucide-react";
import { getPublicTeams } from "../../api/teamApi";
import TeamCard from "../../components/Teams/TeamCard";

// 🟢 SKELETON LOADER
const TeamCardSkeleton = () => (
  <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden flex flex-col animate-pulse shadow-sm h-[260px]">
    <div className="h-16 w-full bg-slate-200"></div>
    <div className="px-5 pb-5 flex flex-col flex-1">
      <div className="flex justify-between items-start">
        <div className="w-16 h-16 rounded-xl bg-slate-300 border-4 border-white -mt-6"></div>
        <div className="w-16 h-6 bg-slate-100 rounded-md mt-2"></div>
      </div>
      <div className="mt-4 space-y-2">
        <div className="h-5 bg-slate-200 rounded-md w-3/4"></div>
        <div className="h-3 bg-slate-100 rounded-md w-full"></div>
        <div className="h-3 bg-slate-100 rounded-md w-5/6"></div>
      </div>
      <div className="mt-auto pt-3 border-t border-slate-100 flex justify-between">
        <div className="h-4 bg-slate-200 rounded-md w-24"></div>
      </div>
    </div>
  </div>
);

const TeamList = () => {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showHiringOnly, setShowHiringOnly] = useState(false);

  // Fetch data
  useEffect(() => {
    setLoading(true);
    getPublicTeams()
      .then(res => {
        setTeams(res.data || []);
      })
      .catch(err => {
        console.error("Failed to load teams", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // Memoized filter
  const filteredTeams = useMemo(() => {
    return teams.filter(team => {
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch = searchQuery === "" || 
        (team.name && team.name.toLowerCase().includes(searchLower)) ||
        (team.description && team.description.toLowerCase().includes(searchLower)) ||
        (team.hiring_requirements && team.hiring_requirements.toLowerCase().includes(searchLower));

      const matchesHiring = !showHiringOnly || team.is_hiring;

      return matchesSearch && matchesHiring;
    });
  }, [teams, searchQuery, showHiringOnly]);

  const clearSearch = () => {
    setSearchQuery("");
    setShowHiringOnly(false);
  };

  const hasActiveFilters = searchQuery !== "" || showHiringOnly;

  return (
    <div className="min-h-screen bg-slate-50 pb-24 font-sans">
      
      {/* 🟢 COMPACT & COLORFUL HEADER */}
      <div className="bg-gradient-to-b from-indigo-50 to-white border-b border-slate-200/60 pt-8 pb-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          
          {/* Title & Action Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Explore Workspaces
              </h1>
              <p className="text-slate-500 text-sm mt-1">
                Find your next project or recruit talent for your own.
              </p>
            </div>
            
            <Link
              to="/teams/create"
              className="inline-flex items-center justify-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-indigo-700 transition shadow-lg shadow-indigo-200 whitespace-nowrap"
            >
              <Plus size={18} strokeWidth={2.5} />
              Create Team
            </Link>
          </div>

          {/* Compact Search & Filter Bar */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row p-1.5">
            <div className="flex-1 relative flex items-center">
              <Search className="absolute left-3 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Search teams, skills, or missions..."
                className="w-full pl-10 pr-4 py-2 bg-transparent border-none focus:ring-0 outline-none text-slate-700 text-sm font-medium placeholder-slate-400"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 p-1 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 transition"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            <div className="h-px sm:h-8 w-full sm:w-px bg-slate-200 my-auto hidden sm:block mx-2"></div>

            <div className="flex items-center gap-2 px-2 pb-2 sm:pb-0 sm:px-0">
              <button
                onClick={() => setShowHiringOnly(!showHiringOnly)}
                className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                  showHiringOnly
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-transparent text-slate-600 hover:bg-slate-50 border border-transparent'
                }`}
              >
                <Briefcase size={16} className={showHiringOnly ? "text-emerald-600" : "text-slate-400"} />
                Hiring Only
              </button>

              {hasActiveFilters && (
                <button
                  onClick={clearSearch}
                  className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition"
                  title="Clear all filters"
                >
                  <Filter size={16} />
                </button>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* 🟢 MAIN CONTENT GRID */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-slate-800">
            {hasActiveFilters ? "Search Results" : "All Public Teams"}
          </h2>
          <span className="text-xs font-bold text-slate-500">
            {filteredTeams.length} {filteredTeams.length === 1 ? 'Result' : 'Results'}
          </span>
        </div>

        {/* Loaders & Results */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {[...Array(8)].map((_, i) => <TeamCardSkeleton key={i} />)}
          </div>
        ) : filteredTeams.length === 0 ? (
          
          /* Empty State */
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center animate-in fade-in duration-300 shadow-sm max-w-2xl mx-auto mt-8">
            <div className="w-16 h-16 bg-slate-50 border border-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-6 h-6 text-slate-300" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">No teams found</h3>
            <p className="text-slate-500 text-sm mb-6 max-w-sm mx-auto">
              {hasActiveFilters 
                ? "Try adjusting your search terms or filters."
                : "There are currently no public teams available."}
            </p>
            {hasActiveFilters && (
              <button
                onClick={clearSearch}
                className="inline-flex items-center px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-bold hover:bg-slate-200 transition"
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          
          /* Results Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 animate-in fade-in duration-500">
            {filteredTeams.map(team => (
              <TeamCard key={team.id} team={team} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TeamList;