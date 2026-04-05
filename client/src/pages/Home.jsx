import React, { useState, Suspense, lazy } from "react";
import { Link } from "react-router-dom";
import { Heart, Bookmark, X } from "lucide-react";
import GithubCard from "../components/GithubCard";
import { useHomeFeed } from "../hooks/useFeeds"; // 🚀 Import new hook

// 🚀 LAZY LOAD SIDEBARS (Does not block main feed rendering)
const LeftSidebar = lazy(() => import("../components/LeftSidebar"));
const HelpFeedWidget = lazy(() => import("../components/HelpFeedWidget"));

// 🦴 SKELETON LOADER (Prevents Layout Shift)
const PostSkeleton = () => (
  <div className="bg-white rounded-2xl border border-slate-200 p-4 mb-6 shadow-sm animate-pulse">
    <div className="flex items-center gap-3 mb-4">
      <div className="w-11 h-11 bg-slate-200 rounded-full"></div>
      <div className="flex flex-col gap-2">
        <div className="w-32 h-3 bg-slate-200 rounded-full"></div>
        <div className="w-20 h-2 bg-slate-100 rounded-full"></div>
      </div>
    </div>
    <div className="w-full h-4 bg-slate-200 rounded-full mb-2"></div>
    <div className="w-3/4 h-4 bg-slate-200 rounded-full mb-4"></div>
    <div className="w-full h-64 bg-slate-100 rounded-xl"></div>
  </div>
);

const Home = () => {
  // 🚀 REACT QUERY: Automatic caching, deduplication, and loading states
  const { data: posts = [], isLoading: loading } = useHomeFeed();
  
  const [expandedImage, setExpandedImage] = useState(null);

  const getGithubUrl = (text) => {
    if (!text) return null;
    const match = text.match(/https:\/\/github\.com\/[^\s]+/);
    return match ? match[0] : null;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Just now";
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
      });
    } catch (e) {
      return "Recently";
    }
  };

  const getInitials = (name) => {
    if (!name || name === "Unknown User") return "?";
    return name.charAt(0).toUpperCase();
  };

  const renderFile = (url) => {
    if (!url) return null;
    const ext = url.split(".").pop()?.toLowerCase() || "";
    const isImage = ["png", "jpg", "jpeg", "gif", "webp"].includes(ext);

    if (isImage) {
      return (
        <div 
          className="w-full bg-slate-100 border-y border-slate-100 cursor-pointer group overflow-hidden relative"
          onClick={() => setExpandedImage(url)}
        >
          <img 
            src={url} 
            alt="Post attachment" 
            loading="lazy" // 🚀 BROWSER OPTIMIZATION: Defers off-screen images
            decoding="async" 
            className="w-full h-64 sm:h-80 object-cover group-hover:scale-105 transition-transform duration-500" 
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300"></div>
        </div>
      );
    }

    return (
      <div className="px-4 pb-2">
        <a href={url} target="_blank" rel="noopener noreferrer" className="mt-2 flex items-center gap-3 p-3 bg-indigo-50/50 border border-indigo-100/50 rounded-xl text-indigo-700 hover:bg-indigo-50 transition-colors group">
          <div className="p-2 bg-white rounded-lg shadow-sm group-hover:scale-110 transition-transform">📎</div>
          <span className="font-medium">Download Attachment</span>
        </a>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20 pt-0 relative">
      <div className="w-full px-4 lg:pl-0 lg:pr-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-2 lg:gap-6">

          {/* ======================= LEFT COLUMN ======================= */}
          {/* 🚀 SUSPENSE: Fallback UI while bundle loads */}
          <Suspense fallback={<div className="hidden lg:block lg:col-span-3 h-full"><div className="sticky top-16 h-[calc(100vh-4rem)] animate-pulse border-r border-slate-200 bg-slate-50"></div></div>}>
            <LeftSidebar />
          </Suspense>

          {/* ======================= CENTER COLUMN ======================= */}
          <div className="lg:col-span-6 space-y-6 sm:space-y-8 max-w-[600px] mx-auto w-full pt-8 lg:pt-10">
            
            {loading && (
              <>
                <PostSkeleton />
                <PostSkeleton />
              </>
            )}

            {!loading && posts.length === 0 && (
              <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center shadow-sm">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100 shadow-inner">
                  <span className="text-3xl">📷</span>
                </div>
                <h3 className="text-lg font-bold text-slate-900">No posts yet</h3>
                <p className="text-slate-500 text-sm mt-2 mb-6">Follow people to see their updates here.</p>
                <Link to="/friends" className="inline-flex px-6 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-500 transition shadow-lg shadow-indigo-200">
                  Find Friends
                </Link>
              </div>
            )}

            {posts.map((post) => {
              const userObj = post.user || post.author || {};
              const userName = userObj.full_name || userObj.name || post.author_name || "Unknown User";
              const userPic = userObj.profile_pic_url || userObj.profile_pic || "/default-profile.png";
              const userId = userObj.id || post.user_id;
              const timestamp = post.created_at || post.timestamp;
              const githubUrl = getGithubUrl(post.description || post.content);
              const dummyLikes = Math.floor(Math.random() * 300) + 12;

              return (
                <div key={post.id} className="bg-white sm:rounded-2xl border-y sm:border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
                  <div className="p-3 sm:p-4 flex items-center justify-between border-b border-slate-50">
                    <div className="flex items-center gap-3">
                      <Link to={`/profile/${userId}`} className="shrink-0">
                        {userPic && !userPic.includes("default") ? (
                          <img src={userPic} loading="lazy" alt={userName} className="w-9 h-9 sm:w-11 sm:h-11 rounded-full object-cover border border-slate-100 p-[2px] ring-2 ring-transparent hover:ring-indigo-400 transition-all" />
                        ) : (
                          <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-full border border-slate-100 p-[2px] ring-2 ring-transparent hover:ring-indigo-400 transition-all bg-indigo-50 flex items-center justify-center">
                            <span className="text-sm sm:text-base font-black text-indigo-400">{getInitials(userName)}</span>
                          </div>
                        )}
                      </Link>
                      <div className="flex flex-col">
                        <Link to={`/profile/${userId}`} className="font-bold text-slate-900 hover:text-indigo-600 transition-colors text-sm sm:text-base">
                          {userName}
                        </Link>
                        <p className="text-[11px] sm:text-xs text-slate-500 font-medium mt-0.5">
                          {formatDate(timestamp)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="px-4 pt-3 pb-3 text-sm leading-relaxed">
                    {post.title && <h3 className="font-bold text-slate-900 mb-1">{post.title}</h3>}
                    <span className="text-slate-700 whitespace-pre-wrap">{post.description || post.content}</span>
                  </div>

                  {(githubUrl || post.file_url) && (
                    <div className="w-full">
                      {githubUrl && <div className="px-4 pb-3"><GithubCard repoUrl={githubUrl} /></div>}
                      {renderFile(post.file_url)}
                    </div>
                  )}

                  <div className="px-3 sm:px-4 py-3 flex items-center justify-between border-t border-slate-50 mt-1">
                    <div className="flex items-center gap-5">
                      <button className="flex items-center gap-1.5 group">
                        <Heart className="w-6 h-6 sm:w-7 sm:h-7 text-slate-600 group-hover:text-pink-500 transition-colors" />
                        <span className="font-semibold text-sm text-slate-600 group-hover:text-pink-500 transition-colors">{dummyLikes}</span>
                      </button>
                    </div>
                    <button className="group">
                      <Bookmark className="w-6 h-6 sm:w-7 sm:h-7 text-slate-600 group-hover:text-amber-500 transition-colors" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* ======================= RIGHT COLUMN ======================= */}
          <div className="hidden lg:block lg:col-span-3 sticky top-16 h-[calc(100vh-4rem)] overflow-hidden pt-8 pb-8">
            <div className="space-y-6">
              <div className="relative z-10 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <Suspense fallback={<div className="h-[300px] w-full bg-slate-100 animate-pulse"></div>}>
                  <HelpFeedWidget />
                </Suspense>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Lightbox Modal */}
      {expandedImage && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/90 backdrop-blur-sm p-4 animate-in fade-in duration-200 cursor-zoom-out" onClick={() => setExpandedImage(null)}>
          <div className="relative max-w-5xl w-full max-h-[90vh] flex items-center justify-center">
            <button onClick={(e) => { e.stopPropagation(); setExpandedImage(null); }} className="absolute -top-12 right-0 text-white hover:text-slate-300 p-2 bg-slate-800/50 hover:bg-slate-700/50 rounded-full transition-colors backdrop-blur-md">
              <X size={24} />
            </button>
            <img src={expandedImage} alt="Expanded post" loading="lazy" className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl animate-in zoom-in-95 duration-200 cursor-default" onClick={(e) => e.stopPropagation()} />
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;