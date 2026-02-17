import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { 
  Search, 
  Plus, 
  Briefcase,
  X
} from "lucide-react";
import { getPublicTeams } from "../../api/teamApi";
import TeamCard from "../../components/Teams/TeamCard";

const TeamList = () => {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showHiringOnly, setShowHiringOnly] = useState(false);

  useEffect(() => {
    getPublicTeams()
      .then(res => setTeams(res.data))
      .finally(() => setLoading(false));
  }, []);

  // Filter teams
  const filteredTeams = teams.filter(team => {
    // Search filter
    const matchesSearch = searchQuery === "" || 
      team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (team.description?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
      (team.hiring_requirements?.toLowerCase() || "").includes(searchQuery.toLowerCase());

    // Hiring filter
    const matchesHiring = !showHiringOnly || team.is_hiring;

    return matchesSearch && matchesHiring;
  });

  const clearSearch = () => {
    setSearchQuery("");
    setShowHiringOnly(false);
  };

  const hasActiveFilters = searchQuery !== "" || showHiringOnly;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Find Teams</h1>
            <p className="text-slate-500 text-sm mt-1">Discover and join public teams</p>
          </div>
          
          <Link
            to="/teams/create"
            className="inline-flex items-center justify-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl hover:bg-indigo-700 transition shadow-lg shadow-indigo-200 whitespace-nowrap"
          >
            <Plus size={18} />
            Create Team
          </Link>
        </div>

        {/* Search & Hiring Filter */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 mb-6 shadow-sm">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search Input */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Search teams by name, description, or skills..."
                className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Hiring Filter Toggle */}
            <button
              onClick={() => setShowHiringOnly(!showHiringOnly)}
              className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border text-sm font-medium whitespace-nowrap transition ${
                showHiringOnly
                  ? 'bg-amber-50 border-amber-300 text-amber-700'
                  : 'border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Briefcase size={16} />
              Hiring Only
              {showHiringOnly && (
                <X 
                  size={14} 
                  className="ml-1 cursor-pointer" 
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowHiringOnly(false);
                  }}
                />
              )}
            </button>

            {/* Clear Filters - Only show when filters active */}
            {hasActiveFilters && (
              <button
                onClick={clearSearch}
                className="text-sm text-slate-500 hover:text-slate-700 px-3"
              >
                Clear
              </button>
            )}
          </div>

          {/* Results Count */}
          <div className="mt-3 text-xs text-slate-500">
            Showing {filteredTeams.length} {filteredTeams.length === 1 ? 'team' : 'teams'}
          </div>
        </div>

        {/* Teams Grid */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        ) : filteredTeams.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-6 h-6 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No teams found</h3>
            <p className="text-slate-500 text-sm mb-6">
              {hasActiveFilters 
                ? "Try adjusting your search or filters"
                : "Be the first to create a team!"}
            </p>
            {hasActiveFilters ? (
              <button
                onClick={clearSearch}
                className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition"
              >
                Clear Filters
              </button>
            ) : (
              <Link
                to="/teams/create"
                className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition"
              >
                <Plus size={16} />
                Create Team
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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