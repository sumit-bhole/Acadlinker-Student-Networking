import React, { useEffect, useState } from "react";
import api from "../api/axios";
import { Link } from "react-router-dom";
import { Loader2, MoreHorizontal, Users, TrendingUpIcon, Calendar } from "lucide-react";
import GithubCard from "../components/GithubCard";
import HelpFeedWidget from "../components/HelpFeedWidget";

const Home = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchHomeFeed = async () => {
    try {
      const res = await api.get("/api/posts/home");
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

  // Dummy trending topics
  const trendingTopics = [
    { tag: "#reactjs", posts: 245 },
    { tag: "#webdev", posts: 189 },
    { tag: "#javascript", posts: 312 },
    { tag: "#opensource", posts: 98 },
    { tag: "#nextjs", posts: 167 },
  ];

  // Dummy upcoming events
  const upcomingEvents = [
    { title: "Web3 Hackathon", date: "Mar 15-17", participants: 120 },
    { title: "React Conference", date: "Apr 8-10", participants: 450 },
    { title: "AI Workshop", date: "Mar 22", participants: 85 },
  ];

  return (
    <div className="min-h-screen bg-gray-50/50 pb-20 pt-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">

        {/* Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">

          {/* =======================
              LEFT COLUMN
              Logic: Hidden on Mobile (default), Visible on Large screens (lg:block)
              ======================= */}
          <div className="hidden lg:block lg:col-span-1">
            <div className="sticky top-24 space-y-6">

              {/* Left Panel Placeholder */}
              <div className="bg-gradient-to-br from-gray-50 to-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mb-4">
                    <Users className="w-8 h-8 text-indigo-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Left Panel</h3>
                  <p className="text-gray-500 text-sm mb-4">
                    This space is reserved for future features.
                  </p>
                </div>
              </div>

              {/* Trending Topics Widget */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUpIcon className="w-5 h-5 text-orange-500" />
                  <h3 className="font-semibold text-gray-900">Trending Topics</h3>
                </div>
                <div className="space-y-3">
                  {trendingTopics.map((topic, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition-colors cursor-pointer group"
                    >
                      <span className="font-medium text-gray-900 group-hover:text-indigo-600 transition-colors">
                        {topic.tag}
                      </span>
                      <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                        {topic.posts} posts
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* =======================
              CENTER COLUMN (Main Feed)
              ======================= */}
          <div className="lg:col-span-2 space-y-6">

            {/* Loading State */}
            {loading && (
              <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
                <p className="mt-4 text-gray-500 font-medium">Loading your feed...</p>
              </div>
            )}

            {/* Empty State */}
            {!loading && posts.length === 0 && (
              <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center">
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

            {/* Posts Feed */}
            {posts.map((post) => {
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
                </div>
              );
            })}
          </div>

          {/* =======================
              RIGHT COLUMN
              Logic: Sticky handling for widgets
              ======================= */}
          <div className="hidden lg:block lg:col-span-1">
            {/*
                We use 'sticky top-24' to make the sidebar follow the scroll.
                Using 'space-y-6' to separate widgets.
            */}
            <div className="sticky top-24 space-y-6">

              {/* Help Feed Widget */}
              <div className="relative z-10">
                <HelpFeedWidget />
              </div>

              {/* Upcoming Events */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex items-center gap-2 mb-4">
                  <Calendar className="w-5 h-5 text-purple-500" />
                  <h3 className="font-semibold text-gray-900">Upcoming Events</h3>
                </div>
                <div className="space-y-4">
                  {upcomingEvents.map((event, index) => (
                    <div
                      key={index}
                      className="p-4 bg-gradient-to-r from-purple-50 to-white border border-purple-100 rounded-xl hover:shadow-md transition-shadow cursor-pointer group"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-semibold text-gray-900 group-hover:text-purple-600 transition-colors">
                          {event.title}
                        </h4>
                        <span className="text-xs font-medium bg-purple-100 text-purple-800 px-2 py-1 rounded-full whitespace-nowrap">
                          {event.date}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Users className="w-4 h-4" />
                        <span>{event.participants} participants</span>
                      </div>
                    </div>
                  ))}
                </div>
                <button className="w-full mt-4 text-sm text-purple-600 font-medium hover:text-purple-700 py-2 rounded-lg hover:bg-purple-50 transition-colors">
                  See all events →
                </button>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Home;