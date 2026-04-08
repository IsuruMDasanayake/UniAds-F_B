import { useQuery } from '@tanstack/react-query';
import axiosClient from '../lib/axios';

/**
 * Hook to manage the current authenticated user's profile
 */
export const useUser = () => {
  return useQuery({
    queryKey: ['user', 'me'],
    queryFn: async () => {
      try {
        const response = await axiosClient.get('/api/profile/me');
        const payload = response.data.data;
        const userData = payload.user;
        
        // Add role and institute info if it exists in the response
        const fullUser = {
          ...userData,
          role: payload.role,
          institute: payload.institute || null
        };
        
        return fullUser;
      } catch (error) {
        // 401 = not authenticated; return null so callers can treat as logged-out
        if (error.response?.status === 401) {
          return null;
        }
        throw error;
      }
    },
    // Always attempt to resolve auth from the session cookie — no localStorage flag needed.
    staleTime: 1000 * 60 * 15, // Profile changes rarely, cache for 15 mins
  });
};
