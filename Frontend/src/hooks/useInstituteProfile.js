import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import axiosClient from '../lib/axios';

/**
 * Hook to fetch Institute Profile Details
 */
export const useInstituteProfile = (id) => {
    return useQuery({
        queryKey: ['institute', 'profile', id || 'me'],
        queryFn: async () => {
            const endpoint = id ? `/api/institutions/${id}/profile` : `/api/profile/me`;
            const response = await axiosClient.get(endpoint, { params: { per_page: 12 } });
            return response.data.data;
        },
    });
};

/**
 * Hook to fetch Institute Posts with Infinite Scroll
 */
export const useInstitutePosts = (id, options = {}, queryOptions = {}) => {
    const { perPage = 10, filterType = 'all', sort = 'latest' } = options;
    
    return useInfiniteQuery({
        queryKey: ['institute', id, 'posts', filterType, sort],
        queryFn: async ({ pageParam = 1 }) => {
            const response = await axiosClient.get(`/api/posts`, {
                params: {
                    institute_id: id,
                    page: pageParam,
                    per_page: perPage,
                    filter: filterType,
                    sort: sort
                }
            });
            return response.data.data;
        },
        getNextPageParam: (lastPage) => {
            if (lastPage && lastPage.next_page_url) {
                return lastPage.current_page + 1;
            }
            return undefined;
        },
        enabled: !!id,
        ...queryOptions
    });
};

/**
 * Hook to fetch Institute Events with Infinite Scroll
 */
export const useInstituteEvents = (id, options = {}, queryOptions = {}) => {
    const { perPage = 10, filter = 'all' } = options;
    
    return useInfiniteQuery({
        queryKey: ['institute', id, 'events', filter],
        queryFn: async ({ pageParam = 1 }) => {
            const response = await axiosClient.get(`/api/events`, {
                params: {
                    institute_id: id,
                    page: pageParam,
                    per_page: perPage,
                    filter: filter
                }
            });
            return response.data.data;
        },
        getNextPageParam: (lastPage) => {
            if (lastPage && lastPage.next_page_url) {
                return lastPage.current_page + 1;
            }
            return undefined;
        },
        enabled: !!id,
        ...queryOptions
    });
};

/**
 * Hook to fetch Institute Gallery 
 */
export const useInstituteGallery = (id) => {
    return useQuery({
        queryKey: ['institute', id, 'gallery'],
        queryFn: async () => {
            const response = await axiosClient.get(`/api/institutions/${id}/gallery`);
            return response.data.data;
        },
        enabled: !!id,
    });
};

/**
 * Hook to fetch Institute Courses
 */
export const useInstituteCourses = (id, options = {}, queryOptions = {}) => {
    return useInfiniteQuery({
        queryKey: ['institute', id, 'courses'],
        queryFn: async ({ pageParam = 1 }) => {
            // Note: Courses might come from posts with a specific filter? 
            // Or there is an api/courses endpoint. Usually it's /api/posts with filter=courses
            const response = await axiosClient.get(`/api/posts`, {
                params: {
                    institute_id: id,
                    page: pageParam,
                    per_page: 10,
                    filter: 'courses'
                }
            });
            return response.data.data;
        },
        getNextPageParam: (lastPage) => {
            if (lastPage && lastPage.next_page_url) {
                return lastPage.current_page + 1;
            }
            return undefined;
        },
        enabled: !!id,
        ...queryOptions
    });
};
