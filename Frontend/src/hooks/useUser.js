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
        
        // Sync with localStorage for legacy compatibility
        localStorage.setItem('APP_USER', JSON.stringify(fullUser));
        
        return fullUser;
      } catch (error) {
        if (error.response?.status === 401) {
          localStorage.removeItem('APP_USER');
          localStorage.removeItem('ACCESS_TOKEN');
          return null;
        }
        throw error;
      }
    },
    // Only fetch if we have a token
    enabled: !!localStorage.getItem('ACCESS_TOKEN'),
    staleTime: 1000 * 60 * 15, // Profile changes rarely, cache for 15 mins
  });
};
