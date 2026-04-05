import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../api/axios";
import { helpService } from "../services/helpService";

// -------------------------------------------------
// 1. HOME FEED (Infinite Scroll)
// -------------------------------------------------
export const useHomeFeed = () => {
  return useInfiniteQuery({
    queryKey: ['homeFeed'],
    queryFn: async ({ pageParam = 1 }) => {
      const res = await api.get(`/api/posts/home?page=${pageParam}`);
      return res.data;
    },
    getNextPageParam: (lastPage, allPages) => {
      // If the backend says there are more pages, fetch the next one
      return lastPage.has_more ? allPages.length + 1 : undefined;
    },
    staleTime: 2 * 60 * 1000, 
  });
};

// -------------------------------------------------
// 2. OPTIMISTIC MUTATIONS (Likes & Saves)
// -------------------------------------------------
export const useToggleLike = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (postId) => api.post(`/api/posts/${postId}/like`),
    onMutate: async (postId) => {
      await queryClient.cancelQueries({ queryKey: ['homeFeed'] });
      const previousData = queryClient.getQueryData(['homeFeed']);

      // Optimistically update the cache
      queryClient.setQueryData(['homeFeed'], (oldData) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          pages: oldData.pages.map(page => ({
            ...page,
            posts: page.posts.map(post => {
              if (post.id === postId) {
                return {
                  ...post,
                  is_liked: !post.is_liked,
                  likes_count: post.is_liked ? post.likes_count - 1 : post.likes_count + 1
                };
              }
              return post;
            })
          }))
        };
      });

      return { previousData };
    },
    onError: (err, postId, context) => {
      // Rollback on failure
      queryClient.setQueryData(['homeFeed'], context.previousData);
    },
    onSettled: () => {
      // Ensure absolute sync in background
      queryClient.invalidateQueries({ queryKey: ['homeFeed'] });
    }
  });
};

export const useToggleSave = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (postId) => api.post(`/api/posts/${postId}/save`),
    onMutate: async (postId) => {
      await queryClient.cancelQueries({ queryKey: ['homeFeed'] });
      const previousData = queryClient.getQueryData(['homeFeed']);

      queryClient.setQueryData(['homeFeed'], (oldData) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          pages: oldData.pages.map(page => ({
            ...page,
            posts: page.posts.map(post => 
              post.id === postId ? { ...post, is_saved: !post.is_saved } : post
            )
          }))
        };
      });

      return { previousData };
    },
    onError: (err, postId, context) => {
      queryClient.setQueryData(['homeFeed'], context.previousData);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['homeFeed'] });
    }
  });
};

// -------------------------------------------------
// 3. WIDGETS & SIDEBARS
// -------------------------------------------------
export const useHelpFeed = () => {
  return useQuery({
    queryKey: ['helpFeed'],
    queryFn: async () => await helpService.getFeed(),
    staleTime: 5 * 60 * 1000,
  });
};

export const useSidebarProfile = (userId) => {
  return useQuery({
    queryKey: ['profile', userId],
    queryFn: async () => {
      const res = await api.get(`/api/profile/${userId}`);
      return res.data;
    },
    enabled: !!userId,
    staleTime: 10 * 60 * 1000,
  });
};

// Add this at the bottom of useFeeds.js
export const useSavedPosts = () => {
  return useQuery({
    queryKey: ['savedPosts'],
    queryFn: async () => {
      const res = await api.get('/api/posts/saved');
      return res.data;
    },
    staleTime: 2 * 60 * 1000, 
  });
};