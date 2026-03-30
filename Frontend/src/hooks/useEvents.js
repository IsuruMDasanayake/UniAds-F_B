import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import axiosClient from '../lib/axios';

/**
 * Hook to fetch events with Infinite Scroll support
 */
export const useInfiniteEvents = (options = {}) => {
    const { searchQuery = '', activeFilter = 'all' } = options;

    return useInfiniteQuery({
        queryKey: ['events', 'infinite', searchQuery, activeFilter],
        queryFn: async ({ pageParam = 1 }) => {
            const response = await axiosClient.get(`/api/events`, {
                params: {
                    page: pageParam,
                    search: searchQuery,
                    filter: activeFilter
                }
            });
            return response.data;
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
 * Hook to manage Event Interest with Optimistic Updates
 */
export const useToggleEventInterest = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (eventId) => {
            const response = await axiosClient.post(`/api/events/${eventId}/interest`);
            return response.data;
        },
        onMutate: async (eventId) => {
            await queryClient.cancelQueries({ queryKey: ['events'] });
            const previousEvents = queryClient.getQueriesData({ queryKey: ['events'] });

            queryClient.setQueriesData({ queryKey: ['events'] }, (oldData) => {
                if (!oldData) return oldData;

                const updateEvent = (event) => {
                    if (event.id === eventId) {
                        const isInterested = !event.is_interested;
                        return {
                            ...event,
                            is_interested: isInterested,
                            interested_count: isInterested ? (event.interested_count + 1) : (event.interested_count - 1),
                        };
                    }
                    return event;
                };

                if (Array.isArray(oldData)) {
                    return oldData.map(updateEvent);
                } else if (oldData.pages) {
                    return {
                        ...oldData,
                        pages: oldData.pages.map(page => ({
                            ...page,
                            data: page.data.map(updateEvent)
                        }))
                    };
                }
                return oldData;
            });

            return { previousEvents };
        },
        onError: (err, eventId, context) => {
            if (context?.previousEvents) {
                context.previousEvents.forEach(([queryKey, value]) => {
                    queryClient.setQueryData(queryKey, value);
                });
            }
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['events'] });
        },
    });
};

/**
 * Hook to Decline (Hide) an Event
 */
export const useDeclineEvent = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (eventId) => {
            const response = await axiosClient.post(`/api/events/${eventId}/decline`);
            return response.data;
        },
        onMutate: async (eventId) => {
            await queryClient.cancelQueries({ queryKey: ['events'] });
            const previousEvents = queryClient.getQueriesData({ queryKey: ['events'] });

            queryClient.setQueriesData({ queryKey: ['events'] }, (oldData) => {
                if (!oldData) return oldData;

                const filterEvent = (event) => event.id !== eventId;

                if (Array.isArray(oldData)) {
                    return oldData.filter(filterEvent);
                } else if (oldData.pages) {
                    return {
                        ...oldData,
                        pages: oldData.pages.map(page => ({
                            ...page,
                            data: page.data.filter(filterEvent)
                        }))
                    };
                }
                return oldData;
            });

            return { previousEvents };
        },
        onError: (err, eventId, context) => {
            if (context?.previousEvents) {
                context.previousEvents.forEach(([queryKey, value]) => {
                    queryClient.setQueryData(queryKey, value);
                });
            }
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['events'] });
        },
    });
};
