import { useQuery } from "@tanstack/react-query";
import api from "../api/axios";

export const useSearchQuery = (query) => {
  return useQuery({
    queryKey: ['search', query],
    queryFn: async () => {
      const res = await api.get(`/api/search?q=${encodeURIComponent(query)}`);
      return res.data;
    },
    // ✅ Re-enabled to allow 1-letter searches
    enabled: !!query && query.trim().length > 0,
    staleTime: 5 * 60 * 1000, 
    refetchOnWindowFocus: false,
  });
};