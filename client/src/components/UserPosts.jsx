import React, { useEffect, useState } from "react";
import api from "../api/axios";
import { Link } from "react-router-dom";
import { Image, Send, Paperclip, Clock, X, Trash2, Edit3 } from "lucide-react";

// --- HELPERS ---
const getImageUrl = (url) => {
  if (!url) return null;
  if (!url.startsWith("http") && !url.startsWith("https")) {
    return `http://localhost:5000/static/uploads/${url}`;
  }
  return url;
};

const formatDate = (dateString) => {
  if (!dateString) return "Just now";
  try {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  } catch (e) {
    return "Recently";
  }
};

const getInitials = (name) => {
  if (!name || name === "Unknown User") return "?";
  return name.charAt(0).toUpperCase();
};

const UserPosts = ({ userId, isCurrentUser }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🟢 NEW: Modal State for Create Post
  const [isCreatePostModalOpen, setIsCreatePostModalOpen] = useState(false);

  // Form State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState(null);
  const [creating, setCreating] = useState(false);
  
  // Lightbox State
  const [expandedImage, setExpandedImage] = useState(null);

  // Fetch Posts
  useEffect(() => {
    if (!userId) return;
    const fetchPosts = async () => {
      try {
        const res = await api.get(`/api/profile/${userId}/posts`);
        setPosts(res.data);
      } catch (err) {
        console.error("Failed to load posts:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, [userId]);

  // Create Post Handler
  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      alert("Title is required");
      return;
    }
    setCreating(true);
    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      if (file) formData.append("file", file);

      const res = await api.post("/api/posts/create", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setPosts((prev) => [res.data.post, ...prev]);
      
      // Reset Form & Close Modal
      setTitle("");
      setDescription("");
      setFile(null);
      setIsCreatePostModalOpen(false); 
      
      const fileInput = document.getElementById("fileInput");
      if (fileInput) fileInput.value = "";
    } catch (err) {
      console.error("Post create failed:", err);
      alert(err.response?.data?.error || "Failed to create post");
    } finally {
      setCreating(false);
    }
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;
    
    try {
      await api.delete(`/api/posts/${postId}`);
      setPosts((prev) => prev.filter(p => p.id !== postId));
    } catch (err) {
      console.error("Failed to delete post:", err);
      alert("Failed to delete post. Please try again.");
    }
  };

  // Render File Helper
  const renderFile = (rawUrl) => {
    const url = getImageUrl(rawUrl);
    if (!url) return null;
    const ext = url.split(".").pop()?.toLowerCase() || "";
    const isImage = ["png", "jpg", "jpeg", "gif", "webp"].includes(ext) || url.includes("cloudinary");

    if (isImage) {
      return (
        <div 
          className="w-full mt-3 bg-slate-100 rounded-xl overflow-hidden cursor-pointer group relative"
          onClick={() => setExpandedImage(url)}
        >
          <img 
            src={url} 
            alt="Attachment" 
            className="w-full h-64 sm:h-80 object-cover group-hover:scale-105 transition-transform duration-500" 
            onError={(e) => { e.target.style.display = 'none'; }}
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300"></div>
        </div>
      );
    }
    
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-3 flex items-center gap-2 p-3 bg-indigo-50 border border-indigo-100 rounded-lg text-indigo-700 hover:bg-indigo-100 transition-colors text-sm"
      >
        <div className="p-2 bg-white rounded-lg shadow-sm">
          <Paperclip className="w-4 h-4" />
        </div>
        <span className="font-medium">Download Attachment</span>
      </a>
    );
  };

  if (loading)
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );

  return (
    <div className="space-y-6 relative">

      {/* --- 🟢 NEW: SLEEK CREATE POST TRIGGER --- */}
      {isCurrentUser && (
        <div 
          onClick={() => setIsCreatePostModalOpen(true)}
          className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 mb-8 flex items-center gap-4 cursor-text hover:border-indigo-200 hover:shadow-md transition-all group"
        >
          <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center shrink-0 border border-indigo-100 group-hover:bg-indigo-100 transition-colors">
            <Edit3 className="w-5 h-5 text-indigo-500" />
          </div>
          <div className="flex-1 bg-slate-50 hover:bg-slate-100 transition-colors border border-slate-100 rounded-full px-5 py-3 text-slate-500 font-medium text-sm">
            Share your thoughts, ideas, or updates...
          </div>
        </div>
      )}

      {/* --- POSTS LIST SECTION --- */}
      {posts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 bg-white rounded-2xl border border-dashed border-slate-300 text-center">
          <div className="bg-slate-50 p-4 rounded-full mb-3 border border-slate-100">
             <Image className="w-6 h-6 text-slate-400" />
          </div>
          <p className="text-slate-500 font-bold">No posts to show yet.</p>
        </div>
      ) : (
        <div className="space-y-6"> 
          {posts.map((post) => {
            const userObj = post.user || {};
            const userName = userObj.full_name || "Unknown User";
            const userPic = userObj.profile_pic_url || "/default-profile.png";
            const timestamp = post.created_at || post.timestamp;

            return (
              <div
                key={post.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden"
              >
                {/* Post Header */}
                <div className="px-5 py-4 flex items-start justify-between border-b border-slate-50">
                  <div className="flex items-center gap-3">
                    <Link to={`/profile/${userObj.id}`} className="shrink-0">
                      {userPic && userPic !== "/default-profile.png" ? (
                        <img src={userPic} alt={userName} className="w-10 h-10 rounded-full object-cover border border-slate-100 p-[2px] ring-2 ring-transparent hover:ring-indigo-400 transition-all" />
                      ) : (
                        <div className="w-10 h-10 rounded-full border border-slate-100 p-[2px] ring-2 ring-transparent hover:ring-indigo-400 transition-all bg-indigo-50 flex items-center justify-center">
                          <span className="text-sm font-black text-indigo-400">{getInitials(userName)}</span>
                        </div>
                      )}
                    </Link>
                    <div>
                      <Link to={`/profile/${userObj.id}`} className="font-bold text-slate-900 text-sm hover:text-indigo-600 transition-colors leading-tight">
                        {userName}
                      </Link>
                      <div className="flex items-center gap-1 text-xs font-medium text-slate-400 mt-0.5">
                        <Clock className="w-3 h-3" />
                        {formatDate(timestamp)}
                      </div>
                    </div>
                  </div>
                  
                  {/* Delete Button */}
                  {isCurrentUser && (
                    <button 
                      onClick={() => handleDeletePost(post.id)}
                      title="Delete Post"
                      className="text-slate-400 hover:text-rose-500 p-2 rounded-xl hover:bg-rose-50 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Post Body */}
                <div className="px-5 pt-3 pb-4">
                  {post.title && (
                    <h3 className="text-lg font-extrabold text-slate-900 mb-1 leading-tight">
                      {post.title}
                    </h3>
                  )}
                  {post.description && (
                    <p className="text-slate-700 text-sm font-medium leading-relaxed whitespace-pre-wrap">
                      {post.description}
                    </p>
                  )}
                  
                  {/* Attachments */}
                  {post.file_url && renderFile(post.file_url)}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ========================================================= */}
      {/* 🟢 MODAL: CREATE POST */}
      {/* ========================================================= */}
      {isCreatePostModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="flex justify-between items-center p-5 border-b border-slate-100 shrink-0">
              <h3 className="font-bold text-slate-800 text-lg">Create a Post</h3>
              <button 
                onClick={() => setIsCreatePostModalOpen(false)} 
                className="text-slate-400 hover:text-slate-700 hover:bg-slate-100 p-1.5 rounded-full transition-colors"
              >
                <X size={20}/>
              </button>
            </div>
            
            {/* Modal Form */}
            <form onSubmit={handleCreatePost} className="p-5 flex flex-col flex-1 overflow-y-auto no-scrollbar">
              <div className="space-y-4 flex-1">
                <div>
                  <input
                    type="text"
                    placeholder="Give your post a catchy title..."
                    className="w-full text-lg font-bold placeholder-slate-400 border-none focus:ring-0 p-0 focus:outline-none text-slate-800"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    autoFocus
                  />
                </div>

                <div>
                  <textarea
                    placeholder="What's on your mind? Share details, code, or ideas..."
                    className="w-full min-h-[120px] text-slate-600 font-medium placeholder-slate-400 border-none focus:ring-0 p-0 focus:outline-none resize-none text-sm leading-relaxed"
                    rows="5"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>

                {/* File preview name if selected */}
                {file && (
                  <div className="flex items-center gap-2 bg-indigo-50 text-indigo-700 px-4 py-2 rounded-xl text-sm font-bold w-max max-w-full">
                    <Image className="w-4 h-4 shrink-0" />
                    <span className="truncate">{file.name}</span>
                    <button 
                      type="button" 
                      onClick={() => setFile(null)}
                      className="ml-2 hover:bg-indigo-100 p-1 rounded-full text-indigo-500 hover:text-indigo-800"
                    >
                      <X size={14} />
                    </button>
                  </div>
                )}
              </div>

              <div className="h-px bg-slate-100 w-full my-4 shrink-0"></div>

              {/* Footer Actions */}
              <div className="flex items-center justify-between shrink-0">
                <div className="flex items-center">
                  <label 
                    htmlFor="fileInput" 
                    className="flex items-center justify-center w-10 h-10 rounded-full bg-slate-50 text-slate-500 hover:bg-slate-100 hover:text-indigo-600 cursor-pointer transition-colors"
                    title="Add Media"
                  >
                    <Image className="w-5 h-5" />
                  </label>
                  <input
                    id="fileInput"
                    type="file"
                    accept="image/png, image/jpeg, image/jpg, image/webp"
                    className="hidden"
                    onChange={(e) => setFile(e.target.files[0])}
                  />
                </div>

                <button
                  type="submit"
                  disabled={creating || !title.trim()}
                  className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl font-bold text-sm transition-all shadow-md shadow-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {creating ? "Posting..." : <><span className="hidden sm:inline">Post</span><Send className="w-3.5 h-3.5" /></>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 🟢 LIGHTBOX MODAL FOR FULL IMAGES */}
      {/* ========================================================= */}
      {expandedImage && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/90 backdrop-blur-sm p-4 animate-in fade-in duration-200 cursor-zoom-out"
          onClick={() => setExpandedImage(null)}
        >
          <div className="relative max-w-5xl w-full max-h-[90vh] flex items-center justify-center">
            <button 
              onClick={(e) => { e.stopPropagation(); setExpandedImage(null); }}
              className="absolute -top-12 right-0 text-white hover:text-slate-300 p-2 bg-slate-800/50 hover:bg-slate-700/50 rounded-full transition-colors backdrop-blur-md"
            >
              <X size={24} />
            </button>
            <img 
              src={expandedImage} 
              alt="Expanded post" 
              className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl animate-in zoom-in-95 duration-200 cursor-default" 
              onClick={(e) => e.stopPropagation()} 
            />
          </div>
        </div>
      )}

    </div>
  );
};

export default UserPosts;