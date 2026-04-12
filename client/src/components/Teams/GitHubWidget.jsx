import React, { useState, useEffect } from "react";
import { Github, Users, GitCommit, ArrowRight } from "lucide-react";

const GitHubWidget = ({ githubRepo, isLeader, onLinkRepo }) => {
  const [repoData, setRepoData] = useState(null);
  const [commits, setCommits] = useState([]);
  const [branches, setBranches] = useState([]);
  const [contributors, setContributors] = useState([]);

  useEffect(() => {
    if (githubRepo) {
      const cleanRepo = githubRepo.replace("https://github.com/", "").replace(".git", "");
      
      const endpoints = [
        `https://api.github.com/repos/${cleanRepo}`,
        `https://api.github.com/repos/${cleanRepo}/commits?per_page=5`,
        `https://api.github.com/repos/${cleanRepo}/branches`,
        `https://api.github.com/repos/${cleanRepo}/contributors?per_page=6`
      ];

      Promise.all(endpoints.map(url => fetch(url).then(res => res.json())))
        .then(([repo, commitList, branchList, contributorList]) => {
          if (!repo.message) setRepoData(repo);
          if (Array.isArray(commitList)) setCommits(commitList);
          if (Array.isArray(branchList)) setBranches(branchList);
          if (Array.isArray(contributorList)) setContributors(contributorList);
        })
        .catch(err => console.error("GitHub Data Sync Error:", err));
    }
  }, [githubRepo]);

  return (
    <div className="bg-[#0d1117] text-[#c9d1d9] rounded-2xl border border-[#30363d] overflow-hidden shadow-lg">
      <div className="p-4 border-b border-[#30363d] flex justify-between items-center bg-[#161b22]">
        <h3 className="font-bold flex items-center gap-2 text-sm"><Github size={18} /> Repository Engine</h3>
        <div className="flex gap-2">
          <span className="text-[10px] font-bold px-2 py-0.5 bg-[#238636] text-white rounded-full border border-white/10">
            {branches.length} Branches
          </span>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {githubRepo ? (
          <>
            {/* Repo Header */}
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xl font-bold text-white tracking-tight hover:text-blue-400 transition cursor-pointer">
                  {githubRepo.split('/').pop()}
                </p>
                <p className="text-xs text-[#8b949e] mt-1 max-w-md">{repoData?.description || "No description provided."}</p>
              </div>
              <a href={`https://github.com/${githubRepo}`} target="_blank" rel="noreferrer" 
                 className="px-3 py-1 bg-[#21262d] border border-[#30363d] rounded-md text-xs font-bold hover:bg-[#30363d] transition">
                View on GitHub
              </a>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-3 gap-4 py-4 border-y border-[#30363d]">
              <div className="text-center">
                <p className="text-white font-bold">{repoData?.stargazers_count || 0}</p>
                <p className="text-[10px] text-[#8b949e] uppercase">Stars</p>
              </div>
              <div className="text-center border-x border-[#30363d]">
                <p className="text-white font-bold">{repoData?.forks_count || 0}</p>
                <p className="text-[10px] text-[#8b949e] uppercase">Forks</p>
              </div>
              <div className="text-center">
                <p className="text-white font-bold">{repoData?.open_issues_count || 0}</p>
                <p className="text-[10px] text-[#8b949e] uppercase">Issues</p>
              </div>
            </div>

            {/* Contributors Section */}
            <div>
              <h4 className="text-[10px] font-black text-[#8b949e] uppercase tracking-widest mb-3 flex items-center gap-2">
                <Users size={12} /> Top Contributors
              </h4>
              <div className="flex flex-wrap gap-3">
                {contributors.map(user => (
                  <a key={user.id} href={user.html_url} target="_blank" rel="noreferrer" className="group relative">
                    <img src={user.avatar_url} className="w-8 h-8 rounded-full border border-[#30363d] group-hover:border-blue-500 transition" alt={user.login} />
                    <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-black text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap z-20">
                      {user.login}
                    </span>
                  </a>
                ))}
              </div>
            </div>

            {/* Recent Commits */}
            <div>
              <h4 className="text-[10px] font-black text-[#8b949e] uppercase tracking-widest mb-3 flex items-center gap-2">
                <GitCommit size={12} /> Recent Activity
              </h4>
              <div className="space-y-2">
                {commits.map((c, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-2 rounded-lg hover:bg-[#161b22] border border-transparent hover:border-[#30363d] transition group">
                    <img src={c.author?.avatar_url} className="w-6 h-6 rounded-full" alt="" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-[#c9d1d9] truncate font-medium group-hover:text-blue-400">{c.commit.message}</p>
                      <p className="text-[10px] text-[#8b949e]">{c.commit.author.name} • {new Date(c.commit.author.date).toLocaleDateString()}</p>
                    </div>
                    <ArrowRight size={12} className="text-[#30363d] group-hover:text-white" />
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <Github size={48} className="mx-auto text-[#30363d] mb-4" />
            <p className="text-sm font-medium text-[#8b949e]">Connect your GitHub repository to see live stats.</p>
            {isLeader && (
              <button onClick={onLinkRepo} className="mt-4 px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition">
                Link Repository
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default GitHubWidget;