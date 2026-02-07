import React, { useEffect, useState } from "react";
import axios from "axios";
import { Star, GitFork, Book, ExternalLink } from "lucide-react";

const GithubCard = ({ repoUrl }) => {
  const [repoData, setRepoData] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!repoUrl) return;

    const fetchRepo = async () => {
      try {
        // 1. Clean the URL to get "owner/repo"
        // Regex looks for github.com/owner/repo
        const match = repoUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/);
        if (!match) return;

        const [_, owner, repo] = match;
        
        // 2. Fetch from GitHub Public API
        const res = await axios.get(`https://api.github.com/repos/${owner}/${repo}`);
        setRepoData(res.data);
      } catch (err) {
        // If 404 or rate limit, just don't show the card
        setError(true);
      }
    };

    fetchRepo();
  }, [repoUrl]);

  if (error || !repoData) return null;

  return (
    <a 
      href={repoData.html_url} 
      target="_blank" 
      rel="noopener noreferrer"
      className="block mt-4 mb-2 border border-gray-200 rounded-xl p-4 bg-gray-50 hover:bg-white hover:border-indigo-400 hover:shadow-sm transition-all group"
    >
      {/* Header: Icon + Name */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
            <Book size={18} className="text-gray-500 group-hover:text-indigo-600" />
            <span className="font-bold text-gray-800 group-hover:text-indigo-700 text-sm">
            {repoData.full_name}
            </span>
        </div>
        <ExternalLink size={14} className="text-gray-400 group-hover:text-indigo-400" />
      </div>
      
      {/* Description */}
      <p className="text-xs text-gray-600 mb-4 line-clamp-2 leading-relaxed">
        {repoData.description || "No description provided."}
      </p>

      {/* Footer: Stats */}
      <div className="flex items-center gap-5 text-xs text-gray-500 font-medium">
        {repoData.language && (
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span>
            {repoData.language}
          </div>
        )}
        <div className="flex items-center gap-1">
          <Star size={14} className="text-amber-400 fill-amber-400" /> 
          {repoData.stargazers_count}
        </div>
        <div className="flex items-center gap-1">
          <GitFork size={14} /> 
          {repoData.forks_count}
        </div>
      </div>
    </a>
  );
};

export default GithubCard;