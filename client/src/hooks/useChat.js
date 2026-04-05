import { useQuery, useQueryClient } from "@tanstack/react-query";
import api from "../api/axios";

export const useFriends = () => {
  const queryClient = useQueryClient();

  const { data: friends = [], isLoading: loading } = useQuery({
    queryKey: ['friends'],
    queryFn: async () => {
      const res = await api.get("/api/friends/list");
      return res.data;
    },
    // ✅ OVERRIDE: We WANT this to refetch when the user focuses the tab for live updates
    refetchOnWindowFocus: true,
    staleTime: 0, // Always consider chat data stale to ensure freshness
  });

  // ✅ Backwards compatibility: Allows UI to manually update the cache just like useState
  const setFriends = (updater) => {
    queryClient.setQueryData(['friends'], (oldData) => {
      return typeof updater === 'function' ? updater(oldData || []) : updater;
    });
  };

  return { friends, loading, setFriends };
};

export const useMessages = (friendId) => {
  const queryClient = useQueryClient();

  const { data: messages = [], isLoading: loading, refetch: loadMessages } = useQuery({
    queryKey: ['messages', friendId],
    queryFn: async () => {
      const res = await api.get(`/api/messages/chat/${friendId}`);
      return res.data.messages || [];
    },
    enabled: !!friendId, // Won't run until friendId exists
    // ✅ OVERRIDE: Automatically grab new messages when tab is focused
    refetchOnWindowFocus: true,
    staleTime: 0,
  });

  // ✅ Backwards compatibility: Allows UI to manually update the cache just like useState
  const setMessages = (updater) => {
    queryClient.setQueryData(['messages', friendId], (oldData) => {
      return typeof updater === 'function' ? updater(oldData || []) : updater;
    });
  };

  return { messages, loading, setMessages, loadMessages };
};