import React, { useState, useEffect } from "react";
import api from "../api/axios";
import { Image as ImageIcon, Send, X, Trash2, Edit3, AlertCircle, Loader2 } from "lucide-react"; 
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import PostCard from "./PostCard";

const UserPosts = ({ userId, isCurrentUser }) => {
  const queryClient = useQueryClient();

  // Modal States
  const [isCreatePostModalOpen, setIsCreatePostModalOpen] = useState(false);
  const [postToDelete, setPostToDelete] = useState(null);

  // Form State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null); // 🚀 NEW: Image Preview State
  
  // Lightbox State
  const [expandedImage, setExpandedImage] = useState(null);

  // 🚀 REACT QUERY: FETCH POSTS
  const { data: posts = [], isLoading: loading } = useQuery({
    queryKey: ['posts', userId],
    queryFn: async () => {
      const res = await api.get(`/api/profile/${userId}/posts`);
      return res.data;
    },
    enabled: !!userId,
  });

  // 🚀 CLEANUP: Prevent memory leaks from object URLs when modal closes
  useEffect(() => {
    if (!isCreatePostModalOpen && previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
      setFile(null);
      setTitle("");
      setDescription("");
    }
  }, [isCreatePostModalOpen]);

  // 🚀 FILE HANDLER
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      // Generate a temporary local URL to show the image preview immediately
      setPreviewUrl(URL.createObjectURL(selectedFile));
    }
  };

  const removeFile = () => {
    setFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    const fileInput = document.getElementById("fileInput");
    if (fileInput) fileInput.value = "";
  };

  // 🚀 REACT QUERY: CREATE POST MUTATION
  const createPostMutation = useMutation({
    mutationFn: (formData) => api.post("/api/posts/create", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts', userId] });
      setIsCreatePostModalOpen(false); 
    },
    onError: (err) => {
      console.error("Post create failed:", err);
      alert(err.response?.data?.error || "Failed to create post");
    }
  });

  // 🚀 REACT QUERY: DELETE POST MUTATION
  const deletePostMutation = useMutation({
    mutationFn: (postId) => api.delete(`/api/posts/${postId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts', userId] });
      setPostToDelete(null); 
    },
    onError: (err) => {
      console.error("Failed to delete post:", err);
      alert("Failed to delete post. Please try again.");
    }
  });

  const handleCreatePost = (e) => {
    e.preventDefault();
    if (!title.trim()) {
      alert("Title is required");
      return;
    }
    // 🟢 REQUIREMENT 1: Enforce Image Upload
    if (!file) {
      alert("An image is required to create a post.");
      return;
    }
    
    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("file", file);

    createPostMutation.mutate(formData);
  };

  const confirmDelete = () => {
    if (postToDelete) {
      deletePostMutation.mutate(postToDelete);
    }
  };

  if (loading)
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );

  return (
    <div className="space-y-6 relative">

      {/* --- CREATE POST TRIGGER --- */}
      {isCurrentUser && (
        <div 
          onClick={() => setIsCreatePostModalOpen(true)}
          className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 mb-8 flex items-center gap-4 cursor-text hover:border-indigo-200 hover:shadow-md transition-all group"
        >
          <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center shrink-0 border border-indigo-100 group-hover:bg-indigo-100 transition-colors">
            <Edit3 className="w-5 h-5 text-indigo-500" />
          </div>
          <div className="flex-1 bg-slate-50 hover:bg-slate-100 transition-colors border border-slate-100 rounded-full px-5 py-3 text-slate-500 font-medium text-sm">
            Share a photo and your thoughts...
          </div>
        </div>
      )}

      {/* --- POSTS LIST SECTION --- */}
      {posts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 bg-white rounded-2xl border border-dashed border-slate-300 text-center">
          <div className="bg-slate-50 p-4 rounded-full mb-3 border border-slate-100">
             <ImageIcon className="w-6 h-6 text-slate-400" />
          </div>
          <p className="text-slate-500 font-bold">No posts to show yet.</p>
        </div>
      ) : (
        <div className="space-y-6"> 
          {posts.map((post) => (
            <div key={post.id} className="relative group/post">
              
              <PostCard 
                post={post} 
                onExpandImage={setExpandedImage} 
              />
              
              {isCurrentUser && (
                <button 
                  onClick={() => setPostToDelete(post.id)}
                  title="Delete Post"
                  className="absolute top-4 right-4 z-10 p-2 bg-white/90 backdrop-blur-sm text-slate-400 hover:text-rose-500 rounded-xl border border-slate-100 shadow-sm opacity-0 group-hover/post:opacity-100 transition-all hover:bg-rose-50"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}

            </div>
          ))}
        </div>
      )}

      {/* ========================================================= */}
      {/* 🟢 MODAL: CREATE POST */}
      {/* ========================================================= */}
      {isCreatePostModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            
            <div className="flex justify-between items-center p-5 border-b border-slate-100 shrink-0">
              <h3 className="font-bold text-slate-800 text-lg">Create a Post</h3>
              <button 
                onClick={() => setIsCreatePostModalOpen(false)} 
                className="text-slate-400 hover:text-slate-700 hover:bg-slate-100 p-1.5 rounded-full transition-colors"
              >
                <X size={20}/>
              </button>
            </div>
            
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
                    placeholder="What's on your mind? Share details or ideas..."
                    className="w-full min-h-[80px] text-slate-600 font-medium placeholder-slate-400 border-none focus:ring-0 p-0 focus:outline-none resize-none text-sm leading-relaxed"
                    rows="3"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>

                {/* 🟢 REQUIREMENT 2: LIVE IMAGE PREVIEW */}
                {previewUrl && (
                  <div className="relative rounded-2xl overflow-hidden border border-slate-100 bg-slate-50 shadow-sm group">
                    <img 
                      src={previewUrl} 
                      alt="Upload preview" 
                      className="w-full max-h-64 object-contain"
                    />
                    <button 
                      type="button" 
                      onClick={removeFile}
                      className="absolute top-2 right-2 bg-slate-900/60 text-white p-1.5 rounded-full hover:bg-rose-500 transition-colors backdrop-blur-md opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
                      title="Remove image"
                    >
                      <X size={16} />
                    </button>
                  </div>
                )}
              </div>

              <div className="h-px bg-slate-100 w-full my-4 shrink-0"></div>

              <div className="flex items-center justify-between shrink-0">
                <div className="flex items-center">
                  <label 
                    htmlFor="fileInput" 
                    className="flex items-center justify-center w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 hover:bg-indigo-100 cursor-pointer transition-colors"
                    title="Add Media"
                  >
                    <ImageIcon className="w-5 h-5" />
                  </label>
                  <input
                    id="fileInput"
                    type="file"
                    accept="image/png, image/jpeg, image/jpg, image/webp"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                  {/* Warning if no image selected */}
                  {!file && <span className="text-xs font-bold text-rose-500 ml-3">Image required *</span>}
                </div>

                {/* 🟢 REQUIREMENT 1: Disable button if no file is selected */}
                <button
                  type="submit"
                  disabled={createPostMutation.isPending || !title.trim() || !file}
                  className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl font-bold text-sm transition-all shadow-md shadow-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {createPostMutation.isPending ? "Posting..." : <><span className="hidden sm:inline">Post</span><Send className="w-3.5 h-3.5" /></>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 🟢 MODAL: CONFIRM DELETE */}
      {/* ========================================================= */}
      {postToDelete && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 p-6 text-center">
            
            <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-rose-600" />
            </div>
            
            <h3 className="text-xl font-bold text-slate-900 mb-2">Delete Post?</h3>
            <p className="text-sm text-slate-500 mb-6 px-2">
              Are you sure you want to delete this post? This action cannot be undone.
            </p>
            
            <div className="flex gap-3">
              <button
                onClick={() => setPostToDelete(null)}
                disabled={deletePostMutation.isPending}
                className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={deletePostMutation.isPending}
                className="flex-1 py-3 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow-md shadow-rose-200 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {deletePostMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin"/> : "Delete"}
              </button>
            </div>

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