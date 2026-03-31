import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import axiosClient from '../lib/axios';

/**
 * Hook to fetch posts with Infinite Scrolling support
 */
export const useInfinitePosts = () => {
    return useInfiniteQuery({
        queryKey: ['posts', 'infinite'],
        queryFn: async ({ pageParam = 1 }) => {
            const response = await axiosClient.get(`/api/posts?page=${pageParam}`);
            // Paginator is inside response.data.data
            return response.data.data;
        },
        getNextPageParam: (lastPage) => {
            if (lastPage.next_page_url) {
                return lastPage.current_page + 1;
            }
            return undefined;
        },
    });
};

/**
 * Hook to fetch posts with filtering and search support (Standard Query)
 */
export const usePosts = (filterType, filterValue, options = {}) => {
  const { searchQuery = '', activeFilters = {} } = options;

  return useQuery({
    queryKey: ['posts', filterType, filterValue, searchQuery, JSON.stringify(activeFilters)],
    queryFn: async () => {
      if (!filterType || !filterValue) return [];

      const response = await axiosClient.get(`/api/posts/filter/${filterType}/${filterValue}`, {
        params: {
          search: searchQuery,
          filters: activeFilters
        }
      });

      const payload = response.data.data;
      
      // Handle standardized response: { posts: { data: [...] }, ... }
      if (payload?.posts) {
        return payload.posts.data || (Array.isArray(payload.posts) ? payload.posts : []);
      }

      // Handle simple paginated response: { data: [...] }
      if (payload?.data) return payload.data;

      // Handle raw array
      return Array.isArray(payload) ? payload : [];
    },
    enabled: !!(filterType && filterValue),
    placeholderData: (prev) => prev,
  });
};

/**
 * Hook to manage categories list
 */
export const useCategories = () => {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await axiosClient.get('/api/categories');
      return response.data.data;
    },
    staleTime: 1000 * 60 * 60, // Categories change very rarely, cache for 1 hour
  });
};

/**
 * Hook to handle saving/unsaving posts with Optimistic Updates
 */
export const useToggleSavePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (postId) => {
      const response = await axiosClient.post(`/api/posts/${postId}/save`);
      return response.data;
    },
    // Optimistic Update
    onMutate: async (postId) => {
      // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries({ queryKey: ['posts'] });

      // Snapshot the previous value
      const previousQueries = queryClient.getQueriesData({ queryKey: ['posts'] });

      const updatePost = (post) => 
        post.id === postId ? { ...post, is_saved_by_user: !post.is_saved_by_user } : post;

      // Optimistically update to the new value in all cached post queries
      queryClient.setQueriesData({ queryKey: ['posts'] }, (oldData) => {
        if (!oldData) return oldData;

        // Handle both simple arrays (usePosts) and infinite query data
        if (Array.isArray(oldData)) {
          return oldData.map(updatePost);
        } else if (oldData.pages) {
          return {
            ...oldData,
            pages: oldData.pages.map(page => ({
              ...page,
              data: page.data.map(updatePost)
            }))
          };
        }
        return oldData;
      });

      // Return a context object with the snapshotted value
      return { previousQueries };
    },
    // If the mutation fails, use the context returned from onMutate to roll back
    onError: (err, postId, context) => {
      if (context?.previousQueries) {
        context.previousQueries.forEach(([queryKey, value]) => {
          queryClient.setQueryData(queryKey, value);
        });
      }
    },
    // Always refetch after error or success:
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });
};

/**
 * Hook to handle liking/unliking posts with Optimistic Updates
 */
export const useToggleLikePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (postId) => {
      const response = await axiosClient.post(`/api/posts/${postId}/toggle-like`);
      return response.data;
    },
    onMutate: async (postId) => {
      await queryClient.cancelQueries({ queryKey: ['posts'] });
      const previousQueries = queryClient.getQueriesData({ queryKey: ['posts'] });

      queryClient.setQueriesData({ queryKey: ['posts'] }, (oldData) => {
        if (!oldData) return oldData;

        const updatePost = (post) => {
          if (post.id === postId) {
            const isLiked = !post.is_liked_by_user;
            return {
              ...post,
              is_liked_by_user: isLiked,
              likes_count: isLiked ? (post.likes_count + 1) : (post.likes_count - 1),
            };
          }
          return post;
        };

        // Handle both simple arrays (usePosts) and infinite query data
        if (Array.isArray(oldData)) {
          return oldData.map(updatePost);
        } else if (oldData.pages) {
          return {
            ...oldData,
            pages: oldData.pages.map(page => ({
              ...page,
              data: page.data.map(updatePost)
            }))
          };
        }
        return oldData;
      });

      return { previousQueries };
    },
    onError: (err, postId, context) => {
      if (context?.previousQueries) {
        context.previousQueries.forEach(([queryKey, value]) => {
          queryClient.setQueryData(queryKey, value);
        });
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });
};
