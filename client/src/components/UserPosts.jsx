import React, { useEffect, useState } from "react";
import api from "../api/axios";
import { Image, Send, Paperclip, MoreHorizontal, Clock } from "lucide-react";

// --- HELPERS (Logic Same as before) ---
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

const UserPosts = ({ userId, isCurrentUser }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState(null);
  const [creating, setCreating] = useState(false);

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
      setTitle("");
      setDescription("");
      setFile(null);
      const fileInput = document.getElementById("fileInput");
      if (fileInput) fileInput.value = "";
    } catch (err) {
      console.error("Post create failed:", err);
      alert(err.response?.data?.error || "Failed to create post");
    } finally {
      setCreating(false);
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
        <div className="mt-3 rounded-lg overflow-hidden border border-gray-100 bg-gray-50">
          <img
            src={url}
            alt="Attachment"
            className="w-full h-auto max-h-96 object-cover" 
            onError={(e) => { e.target.style.display = 'none'; }}
          />
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
        <Paperclip className="w-4 h-4" />
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
    <div className="space-y-8"> {/* Increased vertical space between sections */}

      {/* --- CREATE POST SECTION (Styling Improved) --- */}
      {isCurrentUser && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-100 bg-gray-50/50">
            <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide">
              Create a Post
            </h3>
          </div>
          
          <form onSubmit={handleCreatePost} className="p-4 space-y-4">
            {/* Title Input */}
            <div>
              <input
                type="text"
                placeholder="Give your post a catchy title..."
                className="w-full text-lg font-semibold placeholder-gray-400 border-none focus:ring-0 p-0 focus:outline-none text-gray-800"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            {/* Description Input */}
            <div>
              <textarea
                placeholder="What's on your mind? Share details, code, or ideas..."
                className="w-full min-h-[80px] text-gray-600 placeholder-gray-400 border-none focus:ring-0 p-0 focus:outline-none resize-none text-sm leading-relaxed"
                rows="3"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            {/* Divider */}
            <div className="h-px bg-gray-100 w-full my-2"></div>

            {/* Footer Actions */}
            <div className="flex items-center justify-between pt-2">
              {/* Custom File Input */}
              <div className="flex items-center">
                <label 
                  htmlFor="fileInput" 
                  className={`flex items-center gap-2 cursor-pointer px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    file ? "bg-indigo-50 text-indigo-600" : "text-gray-500 hover:bg-gray-100"
                  }`}
                >
                  <Image className="w-4 h-4" />
                  {file ? (
                    <span className="max-w-[100px] truncate">{file.name}</span>
                  ) : (
                    "Add Media"
                  )}
                </label>
                <input
                  id="fileInput"
                  type="file"
                  accept="image/png, image/jpeg, image/jpg, image/webp"
                  className="hidden"
                  onChange={(e) => setFile(e.target.files[0])}
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={creating}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-full font-medium text-sm transition-all shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {creating ? (
                  "Posting..."
                ) : (
                  <>
                    <span>Post</span>
                    <Send className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* --- POSTS LIST SECTION --- */}
      {posts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 bg-white rounded-2xl border border-dashed border-gray-300 text-center">
          <div className="bg-gray-50 p-4 rounded-full mb-3">
             <Image className="w-6 h-6 text-gray-400" />
          </div>
          <p className="text-gray-500 font-medium">No posts to show yet.</p>
          {isCurrentUser && <p className="text-gray-400 text-sm mt-1">Create your first post above!</p>}
        </div>
      ) : (
        <div className="space-y-6"> {/* Gap between cards */}
          {posts.map((post) => {
            const userObj = post.user || {};
            const userName = userObj.full_name || "Unknown User";
            const userPic = userObj.profile_pic_url || "/default-profile.png";
            const timestamp = post.created_at || post.timestamp;

            return (
              <div
                key={post.id}
                className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden"
              >
                {/* Post Header */}
                <div className="px-5 py-4 flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={userPic}
                      alt={userName}
                      className="w-10 h-10 rounded-full object-cover border border-gray-100 shadow-sm"
                    />
                    <div>
                      <h4 className="font-bold text-gray-900 text-sm leading-tight">
                        {userName}
                      </h4>
                      <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                        <Clock className="w-3 h-3" />
                        {formatDate(timestamp)}
                      </div>
                    </div>
                  </div>
                  
                  <button className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors">
                    <MoreHorizontal className="w-5 h-5" />
                  </button>
                </div>

                {/* Post Body */}
                <div className="px-5 pb-2">
                  {post.title && (
                    <h3 className="text-lg font-bold text-gray-800 mb-2 leading-tight">
                      {post.title}
                    </h3>
                  )}
                  {post.description && (
                    <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-wrap">
                      {post.description}
                    </p>
                  )}
                </div>

                {/* Attachments (Compact Container) */}
                {post.file_url && (
                  <div className="px-5 pb-5">
                    {renderFile(post.file_url)}
                  </div>
                )}
                
                {/* Optional: Footer Action Bar (Like/Comment placeholder for visual balance) */}
                {/* <div className="px-5 py-3 border-t border-gray-50 bg-gray-50/30 flex gap-4 text-gray-500 text-sm">
                   ... buttons here if needed ...
                </div> */}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default UserPosts;