import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Search, Plus } from "lucide-react";
import { getPublicTeams } from "../../api/teamApi";
import TeamCard from "../../components/Teams/TeamCard";

const TeamList = () => {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");

  useEffect(() => {
    getPublicTeams()
      .then(res => setTeams(res.data))
      .finally(() => setLoading(false));
  }, []);

  const filteredTeams = teams.filter(t => 
    t.name.toLowerCase().includes(filter.toLowerCase()) || 
    (t.hiring_requirements && t.hiring_requirements.toLowerCase().includes(filter.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-slate-50 p-4 lg:p-8">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Find Teams</h1>
            <p className="text-slate-500 text-sm mt-1">Discover projects and collaborate with peers.</p>
          </div>
          <Link 
            to="/teams/create" 
            className="flex items-center justify-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl hover:bg-indigo-700 transition shadow-lg shadow-indigo-200"
          >
            <Plus size={18} /> Create Team
          </Link>
        </div>

        {/* Search */}
        <div className="relative mb-8 max-w-lg">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm"
            placeholder="Search by name or skill (e.g., 'React')..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
        </div>

        {/* Grid */}
        {loading ? (
          <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div></div>
        ) : filteredTeams.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-slate-200 border-dashed">
            <p className="text-slate-500">No teams found matching your search.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTeams.map(team => <TeamCard key={team.id} team={team} />)}
          </div>
        )}
      </div>
    </div>
  );
};

export default TeamList;