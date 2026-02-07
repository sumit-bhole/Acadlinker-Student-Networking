import React, { useEffect, useState } from "react";
import api from "../api/axios";

const UserPosts = ({ userId, isCurrentUser }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Create Post State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState(null);
  const [creating, setCreating] = useState(false);

  // --------------------------
  // Fetch posts
  // --------------------------
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

  // --------------------------
  // Create Post
  // --------------------------
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

      // Add newly created post on top
      setPosts((prev) => [res.data.post, ...prev]);

      // Clear form
      setTitle("");
      setDescription("");
      setFile(null);
    } catch (err) {
      console.error("Post create failed:", err);
      alert(err.response?.data?.error || "Failed to create post");
    } finally {
      setCreating(false);
    }
  };

  // --------------------------
  // Loading state
  // --------------------------
  if (loading)
    return <div className="text-center text-gray-500 p-4">Loading posts...</div>;

  return (
    <div className="space-y-6">

      {/* CREATE POST (only for owner profile) */}
      {isCurrentUser && (
        <form
          onSubmit={handleCreatePost}
          className="bg-white p-5 rounded-xl shadow-lg border space-y-4"
        >
          <h3 className="text-xl font-semibold text-gray-800">
            Create New Post
          </h3>

          <input
            type="text"
            placeholder="Post Title"
            className="w-full p-2 border rounded-lg"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <textarea
            placeholder="Write something..."
            className="w-full p-2 border rounded-lg"
            rows="3"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <input
            type="file"
            accept="image/png, image/jpeg, image/jpg"
            className="w-full border p-2 rounded-lg"
            onChange={(e) => setFile(e.target.files[0])}
          />

          <button
            type="submit"
            disabled={creating}
            className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700"
          >
            {creating ? "Posting..." : "Post"}
          </button>
        </form>
      )}

      {/* POSTS LIST */}
      {posts.length === 0 ? (
        <div className="text-center text-gray-500 p-4">No posts yet.</div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <div
              key={post.id}
              className="bg-white shadow rounded-xl border p-4"
            >
              <h3 className="text-lg font-semibold">{post.title}</h3>

              {post.description && (
                <p className="text-gray-700 mt-1">{post.description}</p>
              )}

              {/* File Rendering Logic - Updated to use 'file_url' */}
              {post.file_url && (
                ["png", "jpg", "jpeg", "gif"].includes(
                  (post.file_url.split(".").pop() || "").toLowerCase()
                ) ? (
                  <img
                    src={post.file_url}  
                    alt="Post"
                    className="mt-3 rounded-lg w-full object-cover max-h-96"
                  />
                ) : (
                  <a
                    href={post.file_url} 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-block bg-gray-200 px-3 py-2 rounded-lg text-indigo-700"
                  >
                    📎 Download File
                  </a>
                )
              )}

              <p className="text-gray-400 text-sm mt-2">
                {/* Ensure date_posted is used if timestamp is unavailable, or vice versa */}
                {new Date(post.date_posted || post.timestamp).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserPosts;