import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Briefcase, Plus } from "lucide-react";
import { getMyTeams } from "../../api/teamApi";
import TeamCard from "../../components/Teams/TeamCard";

const MyTeams = () => {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyTeams()
      .then(res => setTeams(res.data))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 p-4 lg:p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
          <Briefcase className="text-indigo-600" /> My Dashboard
        </h1>

        {loading ? (
          <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div></div>
        ) : teams.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-slate-200">
            <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Briefcase className="text-indigo-500" size={32} />
            </div>
            <h3 className="text-lg font-semibold text-slate-900">No teams yet</h3>
            <p className="text-slate-500 mb-6 max-w-sm mx-auto">You aren't part of any teams. Create one or join a public project!</p>
            <Link to="/teams/create" className="text-indigo-600 font-medium hover:underline">Create a Team</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {teams.map(team => (
              <div key={team.id} className="relative">
                {team.my_role === 'leader' && (
                  <span className="absolute -top-2 -right-2 bg-indigo-600 text-white text-[10px] font-bold px-2 py-1 rounded-full z-10 shadow-sm border-2 border-white">
                    LEADER
                  </span>
                )}
                <TeamCard team={team} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyTeams;