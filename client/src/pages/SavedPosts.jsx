import React, { useState } from "react";
import { Link } from "react-router-dom";
import { X, ArrowLeft, BookmarkMinus } from "lucide-react";
import { useSavedPosts } from "../hooks/useFeeds";
import PostCard from "../components/PostCard"; // 🚀 Import shared component

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

const SavedPosts = () => {
  const { data: posts = [], isLoading } = useSavedPosts();
  const [expandedImage, setExpandedImage] = useState(null);

  return (
    <div className="min-h-screen bg-slate-50 pb-20 pt-8 lg:pt-12 relative">
      <div className="max-w-[600px] mx-auto w-full px-4 lg:px-0 space-y-6 sm:space-y-8">
        
        {/* Header */}
        <div className="flex items-center gap-4 border-b border-slate-200 pb-6">
          <Link to="/" className="p-2 bg-white rounded-full shadow-sm hover:bg-slate-100 transition-colors border border-slate-200 text-slate-500 hover:text-slate-800">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Saved Items</h1>
            <p className="text-sm text-slate-500 font-medium">Only visible to you</p>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <>
            <PostSkeleton />
            <PostSkeleton />
          </>
        )}

        {/* Empty State */}
        {!isLoading && posts.length === 0 && (
          <div className="bg-white p-10 rounded-2xl border border-slate-200 border-dashed text-center shadow-sm mt-8">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-5 border border-slate-100 shadow-inner">
              <BookmarkMinus className="w-10 h-10 text-slate-300" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">No saved posts</h3>
            <p className="text-slate-500 text-sm mb-6 max-w-sm mx-auto">
              Tap the bookmark icon on any post to save it here for later.
            </p>
            <Link to="/" className="inline-flex px-6 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-500 transition shadow-lg shadow-indigo-200">
              Explore the Feed
            </Link>
          </div>
        )}

        {/* 🚀 SHARED POSTCARD LIST */}
        {!isLoading && posts.map((post) => (
          <PostCard 
            key={post.id} 
            post={post} 
            onExpandImage={setExpandedImage} 
          />
        ))}
      </div>

      {/* Lightbox */}
      {expandedImage && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/90 backdrop-blur-sm p-4 animate-in fade-in duration-200 cursor-zoom-out" onClick={() => setExpandedImage(null)}>
          <div className="relative max-w-5xl w-full max-h-[90vh] flex items-center justify-center">
            <button onClick={(e) => { e.stopPropagation(); setExpandedImage(null); }} className="absolute -top-12 right-0 text-white hover:text-slate-300 p-2 bg-slate-800/50 hover:bg-slate-700/50 rounded-full transition-colors backdrop-blur-md">
              <X size={24} />
            </button>
            <img src={expandedImage} alt="Expanded post" className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl animate-in zoom-in-95 duration-200 cursor-default" onClick={(e) => e.stopPropagation()} />
          </div>
        </div>
      )}
    </div>
  );
};

export default SavedPosts;