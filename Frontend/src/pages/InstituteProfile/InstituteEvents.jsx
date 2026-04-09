import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Calendar, MapPin, Edit2, Trash2, ArrowRight } from 'lucide-react';
import axiosClient from '../../lib/axios';
import { getStorageUrl } from '../../lib/config';
import EditEventModal from '../../components/Modals/EditEventModal';
import DeleteConfirmModal from '../../components/Modals/DeleteConfirmModal';
import EventDetailsModal from '../../components/Modals/EventDetailsModal';
import { useInstituteEvents } from '../../hooks/useInstituteProfile';
import './InstituteEvents.css';

const InstituteEvents = ({ events: initialEvents, institute, isOwner, onEventsUpdate, isSidebar }) => {
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // New state for details modal
    const [viewModalOpen, setViewModalOpen] = useState(false);
    const [viewEvent, setViewEvent] = useState(null);

    // Local state and Infinite Scroll synced with TanStack Query
    const [localEvents, setLocalEvents] = useState(initialEvents || []);
    const observer = useRef();

    const {
        data: eventsData,
        fetchNextPage,
        hasNextPage: hasMore,
        isFetchingNextPage: loadingMore
    } = useInstituteEvents(institute?.id, { perPage: 12 }, {
        initialData: () => {
            if (initialEvents && initialEvents.length > 0) {
                return {
                    pages: [{ data: initialEvents, next_page_url: initialEvents.length === 12 ? 'has_next' : null, current_page: 1 }],
                    pageParams: [1]
                };
            }
            return undefined;
        }
    });

    // Sync query data down to local state for optimistic updates
    useEffect(() => {
        if (eventsData) {
            const fetchedEvents = eventsData.pages.flatMap(page => page.data);
            setLocalEvents(fetchedEvents);
        }
    }, [eventsData]);

    const fetchMoreEvents = () => {
        if (!loadingMore && hasMore) {
            fetchNextPage();
        }
    };

    const lastEventRef = useCallback(node => {
        if (loadingMore) return;
        if (observer.current) observer.current.disconnect();

        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore) {
                fetchMoreEvents();
            }
        });

        if (node) observer.current.observe(node);
    }, [loadingMore, hasMore, fetchNextPage]);

    const sortedEvents = React.useMemo(() => {
        if (!localEvents) return [];
        const now = new Date();
        now.setHours(0, 0, 0, 0);

        return [...localEvents].sort((a, b) => {
            const dateA = new Date(a.event_date);
            const dateB = new Date(b.event_date);
            const isExpiredA = dateA < now;
            const isExpiredB = dateB < now;

            if (isExpiredA !== isExpiredB) {
                return isExpiredA ? 1 : -1; // Active first
            }

            // Both active: sort by date ASC (soonest first)
            // Both expired: sort by date DESC (most recently expired first)
            return isExpiredA ? dateB - dateA : dateA - dateB;
        });
    }, [localEvents]);

    const handleEditClick = (event, e) => {
        e.stopPropagation();
        setSelectedEvent(event);
        setEditModalOpen(true);
    };

    const handleDeleteClick = (event, e) => {
        e.stopPropagation();
        setSelectedEvent(event);
        setDeleteModalOpen(true);
    };

    const handleEventClick = async (event) => {
        // Clone event to avoid mutation of prop
        let currentEvent = { ...event };

        const viewedKey = `viewed_event_${event.id}`;
        const hasViewed = sessionStorage.getItem(viewedKey);

        // ALWAYS open the modal immediately with current data
        setViewEvent(currentEvent);
        setViewModalOpen(true);

        // Only increment if not viewed yet
        if (!hasViewed) {
            try {
                // 1. Call API to increment view
                await axiosClient.post(`/api/events/${event.id}/track-view`);

                // 2. Update session storage to prevents duplicate counting
                sessionStorage.setItem(viewedKey, 'true');

                // 3. Calculate new count for UI
                const newViewCount = (currentEvent.view_count || 0) + 1;

                // 4. Update the modal's event object
                const updatedEventForModal = { ...currentEvent, view_count: newViewCount };
                setViewEvent(updatedEventForModal);

                // 5. Optimistically update the card in the list
                setLocalEvents(prevEvents =>
                    prevEvents.map(ev =>
                        ev.id === event.id ? { ...ev, view_count: newViewCount } : ev
                    )
                );

            } catch (error) {
                console.error("Failed to track view:", error?.message || error);
            }
        }
    };

    // Use this for actions that genuinely require a data refresh (Edit/Delete)
    const handleEventsRefresh = () => {
        if (onEventsUpdate) onEventsUpdate();
    };

    // Compatibility alias: if any old reference or HMR issue expects handleEventUpdated
    const handleEventUpdated = (e) => handleEventsRefresh();

    const handleConfirmDelete = async () => {
        if (!selectedEvent) return;
        setIsDeleting(true);
        try {
            await axiosClient.delete(`/api/events/${selectedEvent.id}`);
            if (onEventsUpdate) onEventsUpdate();
            setDeleteModalOpen(false);
        } catch (error) {
            console.error("Failed to delete event", error?.message || error);
            alert("Failed to delete event. Please try again.");
        } finally {
            setIsDeleting(false);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    return (
        <div id="institute-profile-events-wrapper">
            <div className="events-header">
                {/* <h3 className="events-section-title">Events</h3> */}
            </div>

            <div className={`events-grid ${isSidebar ? 'is-sidebar' : ''}`}>
                {sortedEvents && sortedEvents.length > 0 ? (
                    sortedEvents.map((event, index) => {
                        const isExpired = new Date(event.event_date) < new Date().setHours(0, 0, 0, 0);
                        return (
                            <div
                                key={event.id}
                                ref={index === sortedEvents.length - 1 ? lastEventRef : null}
                                className={`institute-event-card clickable-card ${isExpired ? 'is-expired' : ''}`}
                                onClick={() => handleEventClick(event)}
                                style={{ cursor: 'pointer' }}
                            >
                                <div className="event-image-container">
                                    <img
                                        src={event.event_image ? getStorageUrl(event.event_image) : 'https://via.placeholder.com/400x300?text=No+Event+Image'}
                                        alt={event.event_title}
                                        className="event-card-img"
                                    />
                                    <div className="event-date-badge">
                                        <span className="event-day">{new Date(event.event_date).getDate()}</span>
                                        <span className="event-month">{new Date(event.event_date).toLocaleString('default', { month: 'short' })}</span>
                                    </div>
                                    {isExpired && (
                                        <div className="event-status-overlay">
                                            <span className="status-label">PASSED</span>
                                        </div>
                                    )}
                                </div>

                                <div className="event-content">
                                    <h4 className="event-title" title={event.event_title || event.title}>
                                        {event.event_title || event.title}
                                    </h4>

                                    <div className="event-meta">
                                        <div className="meta-item">
                                            <Calendar size={14} className="meta-icon" />
                                            <span>{formatDate(event.event_date)}</span>
                                        </div>
                                        <div className="meta-item">
                                            <MapPin size={14} className="meta-icon" />
                                            <span>{event.main_location}</span>
                                        </div>
                                        <div className="meta-item">
                                            <MapPin size={14} className="meta-icon" />
                                            <span>{event.sub_location}</span>
                                        </div>
                                    </div>
                                    {/* Description Preview Removed */}

                                    {isOwner && (
                                        <div className="event-actions-bar">
                                            <button
                                                className="action-btn-sm edit-btn"
                                                onClick={(e) => handleEditClick(event, e)}
                                                title="Edit Event"
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                            <button
                                                className="action-btn-sm delete-btn"
                                                onClick={(e) => handleDeleteClick(event, e)}
                                                title="Delete Event"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    )}

                                    {/* <div className="event-footer-stats" style={{ marginTop: 'auto', paddingTop: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem', color: '#64748b' }}>
                                    <span>{event.view_count || 0} Views</span>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#3b82f6', fontWeight: '500' }}>
                                        Details <ArrowRight size={14} />
                                    </span>
                                </div> */}
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div className="no-events-placeholder">
                        <Calendar size={48} className="text-gray-300 mb-2" />
                        <p>No upcoming events listed yet.</p>
                    </div>
                )}
            </div>

            {(loadingMore || (!hasMore && sortedEvents.length > 0)) && (
                <div className="events-infinite-scroll-footer">
                    {loadingMore ? (
                        <div className="mobile-spinner-container">
                            <div className="ui-loader loader-blk" style={{ width: '30px', height: '30px' }}>
                                <svg viewBox="22 22 44 44" className="multiColor-loader">
                                    <circle cx="44" cy="44" r="20.2" fill="none" strokeWidth="3.6" className="loader-circle loader-circle-animation"></circle>
                                </svg>
                            </div>
                        </div>
                    ) : (
                        <p className="no-more-data">No more events...</p>
                    )}
                </div>
            )}

            {/* Modals */}
            <EditEventModal
                isOpen={editModalOpen}
                onClose={() => setEditModalOpen(false)}
                event={selectedEvent}
                onUpdate={handleEventsRefresh}
            />

            <DeleteConfirmModal
                isOpen={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                onConfirm={handleConfirmDelete}
                isDeleting={isDeleting}
                title={selectedEvent?.event_title || selectedEvent?.title}
            />

            <EventDetailsModal
                isOpen={viewModalOpen}
                event={viewModalOpen ? viewEvent : null}
                onClose={() => setViewModalOpen(false)}
            />
        </div>
    );
};

export default InstituteEvents;
