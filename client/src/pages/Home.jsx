import React, { useState, Suspense, lazy } from "react";
import { Link } from "react-router-dom";
import { X, Loader2 } from "lucide-react";
import { useHomeFeed } from "../hooks/useFeeds"; 
import PostCard from "../components/PostCard"; // 🚀 Import the new PostCard component!

const LeftSidebar = lazy(() => import("../components/LeftSidebar"));
const HelpFeedWidget = lazy(() => import("../components/HelpFeedWidget"));

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
  // 🚀 INFINITE QUERY DESTRUCTURING
  const { 
    data, 
    isLoading, 
    fetchNextPage, 
    hasNextPage, 
    isFetchingNextPage 
  } = useHomeFeed();
  
  const [expandedImage, setExpandedImage] = useState(null);

  // Flatten the paginated data into a single array of posts
  const posts = data?.pages.flatMap(page => page.posts) || [];

  return (
    <div className="min-h-screen bg-slate-200 pb-20 pt-0 relative">
      <div className="w-full px-4 lg:pl-0 lg:pr-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-2 lg:gap-6">

          <Suspense fallback={<div className="hidden lg:block lg:col-span-3 h-full"><div className="sticky top-16 h-[calc(100vh-4rem)] animate-pulse border-r border-slate-300 bg-slate-200"></div></div>}>
            <LeftSidebar />
          </Suspense>

          <div className="lg:col-span-6 space-y-6 sm:space-y-8 max-w-[600px] mx-auto w-full pt-8 lg:pt-10">
            
            {isLoading && (
              <>
                <PostSkeleton />
                <PostSkeleton />
              </>
            )}

            {!isLoading && posts.length === 0 && (
              <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center shadow-sm">
                <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-300 shadow-inner">
                  <span className="text-3xl">📷</span>
                </div>
                <h3 className="text-lg font-bold text-slate-900">No posts yet</h3>
                <p className="text-slate-500 text-sm mt-2 mb-6">Follow people and add skills to see updates here.</p>
                <Link to="/friends" className="inline-flex px-6 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-500 transition shadow-lg shadow-indigo-200">
                  Find Friends
                </Link>
              </div>
            )}

            {/* 🚀 REPLACED ALL THE MESSY HTML WITH THE POSTCARD */}
            {posts.map((post) => (
              <PostCard 
                key={post.id} 
                post={post} 
                onExpandImage={setExpandedImage} 
              />
            ))}

            {/* 🟢 LOAD MORE BUTTON */}
            {hasNextPage && (
              <div className="flex justify-center pt-4">
                <button
                  onClick={() => fetchNextPage()}
                  disabled={isFetchingNextPage}
                  className="px-6 py-2.5 bg-white border border-slate-300 text-indigo-600 font-bold rounded-xl shadow-sm hover:bg-indigo-50 hover:border-indigo-300 transition-all flex items-center gap-2"
                >
                  {isFetchingNextPage ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Loading...</>
                  ) : (
                    "Load More Posts"
                  )}
                </button>
              </div>
            )}
            
            {!hasNextPage && posts.length > 0 && (
              <p className="text-center text-slate-600 font-medium text-sm pt-4">You're all caught up!</p>
            )}

          </div>

          <div className="hidden lg:block lg:col-span-3 sticky top-16 h-[calc(100vh-4rem)] overflow-hidden pt-8 pb-8">
            <div className="space-y-6">
              <div className="relative z-10 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <Suspense fallback={<div className="h-[300px] w-full bg-slate-300 animate-pulse"></div>}>
                  <HelpFeedWidget />
                </Suspense>
              </div>
            </div>
          </div>

        </div>
      </div>

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