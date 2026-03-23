import React, { useEffect, useState } from "react";
import api from "../api/axios";
import { Link } from "react-router-dom";
import { 
  Loader2, 
  MoreHorizontal, 
  Users, 
  Calendar,
  Heart, 
  MessageCircle, 
  Send, 
  Bookmark 
} from "lucide-react";
import GithubCard from "../components/GithubCard";
import HelpFeedWidget from "../components/HelpFeedWidget";
import LeftSidebar from "../components/LeftSidebar"; 

const Home = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

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

  const getGithubUrl = (text) => {
    if (!text) return null;
    const match = text.match(/https:\/\/github\.com\/[^\s]+/);
    return match ? match[0] : null;
  };

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
        <div className="w-full bg-slate-50 border-y border-slate-100">
          <img src={url} alt="Post attachment" className="w-full h-auto max-h-[600px] object-cover sm:object-contain" />
        </div>
      );
    }

    return (
      <div className="px-4 pb-2">
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 flex items-center gap-3 p-3 bg-indigo-50/50 border border-indigo-100/50 rounded-xl text-indigo-700 hover:bg-indigo-50 transition-colors group"
        >
          <div className="p-2 bg-white rounded-lg shadow-sm group-hover:scale-110 transition-transform">
            📎
          </div>
          <span className="font-medium">Download Attachment</span>
        </a>
      </div>
    );
  };

  const upcomingEvents = [
    { title: "Web3 Hackathon", date: "Mar 15-17", participants: 120 },
    { title: "React Conference", date: "Apr 8-10", participants: 450 },
    { title: "AI Workshop", date: "Mar 22", participants: 85 },
  ];

  return (
    <div className="min-h-screen bg-slate-50 pb-20 pt-0">
      <div className="w-full px-4 lg:pl-0 lg:pr-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-2 lg:gap-6">

          {/* =======================
              LEFT COLUMN
              ======================= */}
          <LeftSidebar />

          {/* =======================
              CENTER COLUMN (Main Feed)
              ======================= */}
          <div className="lg:col-span-6 space-y-6 sm:space-y-8 max-w-[600px] mx-auto w-full pt-8 lg:pt-10">
            {loading && (
              <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="w-10 h-10 text-indigo-400 animate-spin" />
              </div>
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
                        <img src={userPic} alt={userName} className="w-9 h-9 sm:w-11 sm:h-11 rounded-full object-cover border border-slate-100 p-[2px] ring-2 ring-transparent hover:ring-indigo-400 transition-all" />
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
                    <button className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors">
                      <MoreHorizontal className="w-5 h-5" />
                    </button>
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
                      <button className="group">
                        <MessageCircle className="w-6 h-6 sm:w-7 sm:h-7 text-slate-600 group-hover:text-blue-500 transition-colors" />
                      </button>
                      <button className="group">
                        <Send className="w-6 h-6 sm:w-7 sm:h-7 text-slate-600 group-hover:text-indigo-500 transition-colors" />
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

          {/* =======================
              RIGHT COLUMN
              ======================= */}
          {/* 🟢 CHANGED: overflow-y-auto to overflow-hidden so it strictly fits the screen and won't scroll */}
          <div className="hidden lg:block lg:col-span-3 sticky top-16 h-[calc(100vh-4rem)] overflow-hidden pt-8 pb-8">
            <div className="space-y-6">
              
              <div className="relative z-10 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <HelpFeedWidget />
              </div>

              <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
                <div className="flex items-center gap-2 mb-4">
                  <div className="p-1.5 bg-indigo-50 rounded-lg">
                    <Calendar className="w-4 h-4 text-indigo-600" strokeWidth={2.5} />
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm tracking-wide">Upcoming Events</h3>
                </div>
                
                <div className="space-y-3">
                  {/* 🟢 CHANGED: Sliced the array to show only 2 events to reduce height */}
                  {upcomingEvents.slice(0, 2).map((event, index) => (
                    <div key={index} className="p-3 bg-slate-50 rounded-xl border border-slate-100 hover:border-indigo-200 hover:bg-white transition-all cursor-pointer group shadow-sm">
                      <div className="flex justify-between items-start mb-1.5">
                        <h4 className="font-bold text-sm text-slate-800 group-hover:text-indigo-600 transition-colors">
                          {event.title}
                        </h4>
                      </div>
                      <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                        <span className="text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">{event.date}</span>
                        <div className="flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5" />
                          <span>{event.participants}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <button className="w-full mt-4 text-xs font-bold text-slate-500 hover:text-indigo-600 hover:bg-slate-50 py-2.5 rounded-xl transition-colors border-t border-slate-100">
                  See all events
                </button>
              </div>

            </div>
          </div>

        </div>
      </div>
      
      {/* 🟢 CSS block ensuring scrollbars stay hidden on the right section too */}
      <style>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};

export default Home;