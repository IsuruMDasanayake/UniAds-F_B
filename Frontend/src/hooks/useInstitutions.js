import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import axiosClient from '../lib/axios';

/**
 * Hook to fetch institutions with Infinite Scroll support
 */
export const useInfiniteInstitutions = (options = {}) => {
    const { searchQuery = '' } = options;

    return useInfiniteQuery({
        queryKey: ['institutions', 'infinite', searchQuery],
        queryFn: async ({ pageParam = 1 }) => {
            const response = await axiosClient.get(`/api/institutions`, {
                params: {
                    page: pageParam,
                    query: searchQuery,
                    per_page: 12
                }
            });
            // response.data is { success, message, data: { data: [...], current_page, ... } }
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
