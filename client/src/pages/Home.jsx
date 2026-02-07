import React, { useEffect, useState } from "react";
import api from "../api/axios";
import { Link } from "react-router-dom";
import { Loader2 } from "lucide-react";
// --- NEW IMPORT ---
import GithubCard from "../components/GithubCard";

const Home = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch Home Feed
  const fetchHomeFeed = async () => {
    try {
      const res = await api.get("/api/posts/home");
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

  // Helper to extract GitHub URL from description
  const getGithubUrl = (text) => {
    if (!text) return null;
    const match = text.match(/https:\/\/github\.com\/[^\s]+/);
    return match ? match[0] : null;
  };

  // Helper to render file attachments safely
  const renderFile = (url) => {
    if (!url) return null;
    
    const ext = url.split(".").pop()?.toLowerCase() || "";
    const isImage = ["png", "jpg", "jpeg", "gif", "webp"].includes(ext);

    if (isImage) {
      return (
        <img
          src={url}
          alt="Post content"
          className="mt-3 rounded-lg w-full max-h-96 object-cover bg-gray-50 border border-gray-100"
        />
      );
    }

    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-3 inline-flex items-center gap-2 bg-indigo-50 hover:bg-indigo-100 px-4 py-2 rounded-lg text-indigo-700 transition"
      >
        <span>📎</span> Download Attachment
      </a>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-2xl mx-auto px-4">

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center py-20">
             <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
          </div>
        )}

        {/* Empty State */}
        {!loading && posts.length === 0 && (
          <div className="bg-white p-10 rounded-2xl shadow-sm border border-gray-100 text-center">
            <h3 className="text-xl font-semibold text-gray-700">Your feed is empty!</h3>
            <p className="text-gray-500 mt-2">Follow some friends or create a post to get started.</p>
            <Link to="/search" className="mt-4 inline-block text-indigo-600 font-medium hover:underline">
                Find Friends →
            </Link>
          </div>
        )}

        {/* Posts Feed */}
        <div className="space-y-6">
          {posts.map((post) => {
            const githubUrl = getGithubUrl(post.description);
            
            return (
              <div
                key={post.id}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
              >
                {/* Post Header */}
                <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-50">
                  <Link to={`/profile/${post.user?.id}`}>
                      <img
                      src={post.user?.profile_pic_url || "/default-profile.png"}
                      alt={post.user?.full_name}
                      className="w-10 h-10 rounded-full object-cover border border-gray-200"
                      />
                  </Link>
                  <div>
                    <Link
                      to={`/profile/${post.user?.id}`}
                      className="font-bold text-gray-900 hover:text-indigo-600 transition"
                    >
                      {post.user?.full_name || "Unknown User"}
                    </Link>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {post.timestamp ? new Date(post.timestamp).toLocaleString() : "Just now"}
                    </p>
                  </div>
                </div>

                {/* Post Body */}
                <div className="p-5">
                  {post.title && (
                      <h3 className="text-lg font-bold text-gray-900 mb-2">
                      {post.title}
                      </h3>
                  )}

                  <p className="text-gray-700 whitespace-pre-line leading-relaxed">
                    {post.description}
                  </p>

                  {/* --- UNIQUE FEATURE: GITHUB CARD --- */}
                  {githubUrl && (
                      <GithubCard repoUrl={githubUrl} />
                  )}

                  {/* File Attachment */}
                  {renderFile(post.file_url)}
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
};

export default Home;