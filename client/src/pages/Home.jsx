import React, { useEffect, useState } from "react";
import api from "../api/axios";
import { Link } from "react-router-dom";
import { Loader2, Heart, MessageSquare, Share2, MoreHorizontal } from "lucide-react";
import GithubCard from "../components/GithubCard";

const Home = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchHomeFeed = async () => {
    try {
      const res = await api.get("/api/posts/home");
      // DEBUG: Check your console (F12) to see exact field names!
      console.log("Feed Data:", res.data); 
      setPosts(res.data);
    } catch (err) {
      console.error("Error loading feed:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHomeFeed();
  }, []);

  const getGithubUrl = (text) => {
    if (!text) return null;
    const match = text.match(/https:\/\/github\.com\/[^\s]+/);
    return match ? match[0] : null;
  };

  // Helper to format date safely
  const formatDate = (dateString) => {
    if (!dateString) return "Just now";
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (e) {
      return "Recently";
    }
  };

  const renderFile = (url) => {
    if (!url) return null;
    const ext = url.split(".").pop()?.toLowerCase() || "";
    const isImage = ["png", "jpg", "jpeg", "gif", "webp"].includes(ext);

    if (isImage) {
      return (
        <div className="mt-3 rounded-xl overflow-hidden border border-gray-100 bg-gray-50">
          <img src={url} alt="Post attachment" className="w-full h-auto max-h-[500px] object-contain" />
        </div>
      );
    }

    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-3 flex items-center gap-3 p-3 bg-indigo-50 border border-indigo-100 rounded-xl text-indigo-700 hover:bg-indigo-100 transition-colors group"
      >
        <div className="p-2 bg-white rounded-lg shadow-sm group-hover:scale-110 transition-transform">
          📎
        </div>
        <span className="font-medium">Download Attachment</span>
      </a>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50/50 pb-20 pt-6">
      <div className="max-w-xl mx-auto px-4 sm:px-0">
        
        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
            <p className="mt-4 text-gray-500 font-medium">Loading your feed...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && posts.length === 0 && (
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center mx-4 sm:mx-0">
            <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">📭</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900">Your feed is empty</h3>
            <p className="text-gray-500 mt-2 mb-6">Connect with others to see their updates here.</p>
            <Link 
              to="/friends" 
              className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition shadow-lg shadow-indigo-200"
            >
              Find People
            </Link>
          </div>
        )}

        {/* Feed */}
        <div className="space-y-6">
          {posts.map((post) => {
            // SAFE DATA ACCESS: Check multiple possible field names
            const userObj = post.user || post.author || {}; 
            const userName = userObj.full_name || userObj.name || post.author_name || "Unknown User";
            const userPic = userObj.profile_pic_url || userObj.profile_pic || "/default-profile.png";
            const userId = userObj.id || post.user_id;
            const timestamp = post.created_at || post.timestamp;
            const githubUrl = getGithubUrl(post.description || post.content);

            return (
              <div 
                key={post.id} 
                className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-gray-100 overflow-hidden hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)] transition-all duration-300"
              >
                
                {/* Header */}
                <div className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Link to={`/profile/${userId}`} className="shrink-0">
                      <img
                        src={userPic}
                        alt={userName}
                        className="w-10 h-10 sm:w-11 sm:h-11 rounded-full object-cover border border-gray-100"
                      />
                    </Link>
                    <div>
                      <Link 
                        to={`/profile/${userId}`} 
                        className="font-bold text-gray-900 hover:text-indigo-600 transition text-sm sm:text-base"
                      >
                        {userName}
                      </Link>
                      <p className="text-xs text-gray-500">{formatDate(timestamp)}</p>
                    </div>
                  </div>
                  <button className="p-2 text-gray-400 hover:bg-gray-50 rounded-full transition">
                    <MoreHorizontal className="w-5 h-5" />
                  </button>
                </div>

                {/* Content */}
                <div className="px-4 pb-3">
                  {post.title && <h3 className="font-bold text-lg text-gray-900 mb-2">{post.title}</h3>}
                  <p className="text-gray-700 whitespace-pre-wrap leading-relaxed text-sm sm:text-base">
                    {post.description || post.content}
                  </p>
                </div>

                {/* Attachments */}
                {(githubUrl || post.file_url) && (
                  <div className="px-4 pb-4">
                    {githubUrl && <div className="mb-3"><GithubCard repoUrl={githubUrl} /></div>}
                    {renderFile(post.file_url)}
                  </div>
                )}

                {/* Footer (Actions)
                <div className="px-4 py-3 border-t border-gray-50 flex items-center justify-between text-gray-500">
                  <div className="flex gap-4">
                    <button className="flex items-center gap-1.5 hover:text-red-500 transition-colors group">
                      <Heart className="w-5 h-5 group-hover:scale-110 transition-transform" />
                      <span className="text-sm font-medium">Like</span>
                    </button>
                    <button className="flex items-center gap-1.5 hover:text-indigo-600 transition-colors group">
                      <MessageSquare className="w-5 h-5 group-hover:scale-110 transition-transform" />
                      <span className="text-sm font-medium">Comment</span>
                    </button>
                  </div>
                  <button className="hover:text-gray-900 transition-colors">
                    <Share2 className="w-5 h-5" />
                  </button>
                </div> */}

              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Home;