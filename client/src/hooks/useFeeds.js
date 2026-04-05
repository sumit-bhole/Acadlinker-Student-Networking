import { useQuery } from "@tanstack/react-query";
import api from "../api/axios";
import { helpService } from "../services/helpService";

// 1. Home Feed Hook
export const useHomeFeed = () => {
  return useQuery({
    queryKey: ['homeFeed'],
    queryFn: async () => {
      const res = await api.get("/api/posts/home");
      return res.data;
    },
    staleTime: 2 * 60 * 1000, // Consider fresh for 2 minutes
  });
};

// 2. Help Feed Hook
export const useHelpFeed = () => {
  return useQuery({
    queryKey: ['helpFeed'],
    queryFn: async () => {
      return await helpService.getFeed();
    },
    staleTime: 5 * 60 * 1000,
  });
};

// 3. Sidebar Profile Hook (Leverages exact same cache as Profile page!)
export const useSidebarProfile = (userId) => {
  return useQuery({
    queryKey: ['profile', userId],
    queryFn: async () => {
      const res = await api.get(`/api/profile/${userId}`);
      return res.data;
    },
    enabled: !!userId, // Wait until we have a user ID
    staleTime: 10 * 60 * 1000, // Profile data rarely changes, cache for 10 mins
  });
};