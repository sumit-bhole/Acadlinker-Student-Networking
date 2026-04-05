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
      return lastPage.has_more ? allPages.length + 1 : undefined;
    },
    staleTime: 2 * 60 * 1000, 
  });
};

// -------------------------------------------------
// 2. SAVED POSTS
// -------------------------------------------------
export const useSavedPosts = () => {
  return useQuery({
    queryKey: ['savedPosts'],
    queryFn: async () => {
      const res = await api.get('/api/posts/saved');
      return res.data;
    },
    staleTime: 0, // Always fetch fresh list when navigating to the page
  });
};

// -------------------------------------------------
// 3. OPTIMISTIC MUTATIONS (Global Sync)
// -------------------------------------------------
export const useToggleLike = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (postId) => api.post(`/api/posts/${postId}/like`),
    onMutate: async (postId) => {
      // 1. Cancel all outgoing requests so they don't overwrite our optimistic update
      await queryClient.cancelQueries({ queryKey: ['homeFeed'] });
      await queryClient.cancelQueries({ queryKey: ['savedPosts'] });
      await queryClient.cancelQueries({ queryKey: ['posts'] });

      // Helper for standard array feeds (Saved & Profile)
      const toggleLikeInList = (oldData) => {
        if (!oldData) return oldData;
        return oldData.map(post =>
          post.id === postId ? {
            ...post,
            is_liked: !post.is_liked,
            likes_count: post.is_liked ? post.likes_count - 1 : post.likes_count + 1
          } : post
        );
      };

      // Helper for infinite scroll feeds (Home)
      const toggleLikeInInfinite = (oldData) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          pages: oldData.pages.map(page => ({
            ...page,
            posts: toggleLikeInList(page.posts)
          }))
        };
      };

      // 2. Instantly update ALL feeds anywhere in the app simultaneously
      queryClient.setQueriesData({ queryKey: ['homeFeed'] }, toggleLikeInInfinite);
      queryClient.setQueriesData({ queryKey: ['savedPosts'] }, toggleLikeInList);
      queryClient.setQueriesData({ queryKey: ['posts'] }, toggleLikeInList); // Matches all profile feeds

      return { postId };
    },
    onError: () => {
      // If the API fails, invalidate everything to force a sync with the truth
      queryClient.invalidateQueries({ queryKey: ['homeFeed'] });
      queryClient.invalidateQueries({ queryKey: ['savedPosts'] });
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    }
  });
};

export const useToggleSave = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (postId) => api.post(`/api/posts/${postId}/save`),
    onMutate: async (postId) => {
      await queryClient.cancelQueries({ queryKey: ['homeFeed'] });
      await queryClient.cancelQueries({ queryKey: ['savedPosts'] });
      await queryClient.cancelQueries({ queryKey: ['posts'] });

      // Notice we DO NOT delete the post from the array!
      // We only toggle the boolean. This creates the "Instagram Effect" where it stays on screen.
      const toggleSaveInList = (oldData) => {
        if (!oldData) return oldData;
        return oldData.map(post =>
          post.id === postId ? { ...post, is_saved: !post.is_saved } : post
        );
      };

      const toggleSaveInInfinite = (oldData) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          pages: oldData.pages.map(page => ({
            ...page,
            posts: toggleSaveInList(page.posts)
          }))
        };
      };

      // Instantly update ALL feeds globally
      queryClient.setQueriesData({ queryKey: ['homeFeed'] }, toggleSaveInInfinite);
      queryClient.setQueriesData({ queryKey: ['savedPosts'] }, toggleSaveInList);
      queryClient.setQueriesData({ queryKey: ['posts'] }, toggleSaveInList);

      return { postId };
    },
    onError: () => {
      queryClient.invalidateQueries({ queryKey: ['homeFeed'] });
      queryClient.invalidateQueries({ queryKey: ['savedPosts'] });
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
    // CRITICAL FIX: We purposely DO NOT include an `onSettled` block here. 
    // If we invalidated the query after saving/unsaving, the UI would refresh instantly and the post would vanish!
  });
};

// -------------------------------------------------
// 4. WIDGETS & SIDEBARS
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