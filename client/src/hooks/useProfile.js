import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/axios';

// 1. Fetch Profile Query
export const useProfileQuery = (userId) => {
  return useQuery({
    queryKey: ['profile', userId],
    queryFn: async () => {
      const res = await api.get(`/api/profile/${userId}`);
      return res.data;
    },
    enabled: !!userId, // Won't run until userId is available
  });
};

// 2. Update Profile Mutation
export const useUpdateProfileMutation = (userId) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data) => api.patch('/api/profile/edit', data),
    onSuccess: () => {
      // Instantly triggers a background refetch to sync the UI
      queryClient.invalidateQueries({ queryKey: ['profile', userId] });
    }
  });
};

// 3. Friend Action Mutations (Send, Accept, Reject)
export const useFriendActionsMutation = (userId) => {
  const queryClient = useQueryClient();

  const onSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ['profile', userId] });
  };

  const sendRequest = useMutation({
    mutationFn: (targetId) => api.post(`/api/friends/send/${targetId}`),
    onSuccess
  });

  const acceptRequest = useMutation({
    mutationFn: (requestId) => api.post(`/api/friends/accept/${requestId}`),
    onSuccess
  });

  const rejectRequest = useMutation({
    mutationFn: (requestId) => api.post(`/api/friends/reject/${requestId}`),
    onSuccess
  });

  return { sendRequest, acceptRequest, rejectRequest };
};