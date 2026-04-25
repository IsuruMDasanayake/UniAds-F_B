import { useState, useEffect, useRef, useCallback } from 'react';
import { formatDistanceToNow } from 'date-fns';
import {
    Calendar, MapPin, Star, X, Loader2, Info,
    Filter, LayoutGrid, Clock, Users, ChevronRight,
    TrendingUp, Award, Bell, Search, Heart, ThumbsDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axiosClient from '../lib/axios';
import { getStorageUrl } from '../lib/config';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import EventDetailsModal from '../components/Modals/EventDetailsModal';
import AddEventModal from './InstituteProfile/modals/AddEventModal';
import './EventsPage.css';

import { useUser } from '../hooks/useUser';
import { useInfiniteEvents, useToggleEventInterest, useDeclineEvent, useLatestEvents } from '../hooks/useEvents';

// Global variable to track if the session-first loader has been shown
let hasShownSessionLoader = false;

function EventsPage() {
    const { data: user } = useUser();
    const [activeFilter, setActiveFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');

    // TanStack Query Hooks
    const {
        data: eventsData,
        fetchNextPage,
        hasNextPage: hasMoreEvents,
        isFetchingNextPage: loadingMoreEvents,
        isLoading: eventsLoading,
        refetch: refetchEvents,
    } = useInfiniteEvents({ searchQuery: debouncedSearchQuery, activeFilter });

    const { data: latestEvents = [], refetch: refetchLatest } = useLatestEvents(2);

    const interestMutation = useToggleEventInterest();
    const declineMutation = useDeclineEvent();

    const events = eventsData?.pages.flatMap(page => page.data) || [];
    
    // Maintain global total events count independent of search
    const [globalTotalEvents, setGlobalTotalEvents] = useState(null);

    useEffect(() => {
        // Only update global total when we have data and NO active search query
        if (!debouncedSearchQuery && activeFilter === 'all') {
            const currentTotal = eventsData?.pages[0]?.total;
            if (currentTotal !== undefined) {
                setGlobalTotalEvents(currentTotal);
            }
        }
    }, [debouncedSearchQuery, activeFilter, eventsData]);

    // Use globally cached count if available to prevent the stat card from changing during search
    const totalEvents = globalTotalEvents !== null ? globalTotalEvents : (eventsData?.pages[0]?.total || 0);

    const [selectedEvent, setSelectedEvent] = useState(null);
    const [showAddEventModal, setShowAddEventModal] = useState(false);
    const [showOverlay, setShowOverlay] = useState(!hasShownSessionLoader);
    const eventLoaderRef = useRef(null);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 900);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearchQuery(searchQuery);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 900);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        // If the overlay is active, wait for data AND a minimum time to feel consistent
        if (showOverlay) {
            if (!eventsLoading) {
                const timer = setTimeout(() => {
                    setShowOverlay(false);
                    hasShownSessionLoader = true;
                }, 800); // 800ms minimum for that premium "WOW" feel
                return () => clearTimeout(timer);
            }
        }
    }, [eventsLoading, showOverlay]);

    useEffect(() => {
        const observer = new IntersectionObserver(
            entries => {
                if (entries[0].isIntersecting && hasMoreEvents && !loadingMoreEvents) {
                    fetchNextPage();
                }
            },
            { threshold: 0.1, rootMargin: '100px' }
        );

        if (eventLoaderRef.current) observer.observe(eventLoaderRef.current);
        return () => observer.disconnect();
    }, [hasMoreEvents, loadingMoreEvents, fetchNextPage, showOverlay]);

    const handleMarkInterest = (eventId) => {
        interestMutation.mutate(eventId);
    };

    const handleDecline = (eventId) => {
        declineMutation.mutate(eventId);
    };

    const openEventModal = (event) => {
        setSelectedEvent(event);
        if (event.id) {
            axiosClient.post(`/api/events/${event.id}/track-view`, {})
                .catch(error => console.error('Error tracking event view:', error?.message || error));
        }
    };

    const closeEventModal = () => setSelectedEvent(null);

    const formatDate = (dateString, type = 'full') => {
        const d = new Date(dateString);
        if (type === 'day') return d.getDate();
        if (type === 'month') return d.toLocaleDateString('en-US', { month: 'short' });
        return d.toLocaleDateString('en-US', {
            month: 'long',
        });
    };

    const loading = eventsLoading;

    const EventSkeleton = () => (
        <div className="modern-event-card skeleton-card">
            <div className="card-media skeleton" style={{ height: '200px' }}></div>
            <div className="card-details" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', flex: 1 }}>
                <div className="skeleton" style={{ height: '14px', width: '40%', marginBottom: '10px', borderRadius: '4px' }}></div>
                <div className="skeleton" style={{ height: '20px', width: '80%', marginBottom: '15px', borderRadius: '4px' }}></div>
                <div className="info-chips" style={{ display: 'flex', gap: '0.5rem' }}>
                    <div className="skeleton" style={{ height: '28px', width: '90px', borderRadius: '8px' }}></div>
                    <div className="skeleton" style={{ height: '28px', width: '90px', borderRadius: '8px' }}></div>
                </div>
                <div className="card-actions" style={{ display: 'flex', gap: '0.75rem', marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid #f1f5f9' }}>
                    <div className="skeleton" style={{ height: '42px', flex: 1, borderRadius: '12px' }}></div>
                    <div className="skeleton" style={{ height: '42px', width: '100px', borderRadius: '12px' }}></div>
                </div>
            </div>
        </div>
    );

    // Show full-page loader on the session's first visit or if data is genuinely loading
    if (showOverlay || (eventsLoading && !hasShownSessionLoader)) {
        return (
            <div className="events-page-v2 events-loading">
                <div className="spinner-box">
                    <div className="ui-loader loader-blk">
                        <svg viewBox="22 22 44 44" className="multiColor-loader">
                            <circle cx="44" cy="44" r="20.2" fill="none" strokeWidth="3.6" className="loader-circle loader-circle-animation"></circle>
                        </svg>
                    </div>
                    <p>Loading Events...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="events-page-v2">
            <Navbar user={user} />

            <div className="events-container">
                {/* Left Sidebar - Navigation & Filters */}
                <aside className="events-left-sidebar">
                    <div className="sidebar-widget profile-mini">
                        <div className="welcome-text">
                            <h3>Hello, {user?.name?.split(' ')[0]}!</h3>
                            <p>Ready for the next big event?</p>
                        </div>
                    </div>

                    <div className="sidebar-widget filter-menu">
                        <h4>Explore Events</h4>
                        <nav>
                            <button
                                className={activeFilter === 'all' ? 'active' : ''}
                                onClick={() => setActiveFilter('all')}
                            >
                                <LayoutGrid size={18} />
                                <span>All Events</span>
                            </button>
                            <button
                                className={activeFilter === 'today' ? 'active' : ''}
                                onClick={() => setActiveFilter('today')}
                            >
                                <Clock size={18} />
                                <span>Happening Today</span>
                            </button>
                            <button
                                className={activeFilter === 'upcoming' ? 'active' : ''}
                                onClick={() => setActiveFilter('upcoming')}
                            >
                                <Calendar size={18} />
                                <span>Coming Soon</span>
                            </button>
                        </nav>
                    </div>

                    <div className="sidebar-widget stats-card">
                        <TrendingUp size={24} className="stats-icon" />
                        <div className="stats-info">
                            <span className="stats-label">Live Events</span>
                            <span className="stats-value">{totalEvents}</span>
                        </div>
                    </div>
                </aside>

                {/* Main Content Area */}
                <main className="events-feed">
                    <div className="feed-header">
                        <div className="header-text">
                            <h1>Events <span>Portal</span></h1>
                            <p>Connect with the best academic and cultural experiences.</p>
                        </div>
                        <div className="search-bar-wrapper">
                            <Search size={18} />
                            <input
                                type="text"
                                placeholder="Search events or locations..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Show skeletons during filter switches (when not the initial full-page load) */}
                    {eventsLoading && !showOverlay ? (
                         <div className="events-modern-grid">
                            {[...Array(6)].map((_, i) => (
                                <EventSkeleton key={i} />
                            ))}
                        </div>
                    ) : events.length === 0 && !loadingMoreEvents ? (
                        <div className="empty-state">
                            <div className="empty-icon-box">
                                <Calendar size={64} />
                            </div>
                            <h2>No Events Found</h2>
                            <p>Adjust your search or check back later for new updates.</p>
                            <button onClick={() => { setSearchQuery(''); setActiveFilter('all'); }} className="reset-btn">
                                Clear All Filters
                            </button>
                        </div>
                    ) : (
                        <div className="events-modern-grid">
                            {events.map((event, index) => (
                                <motion.div
                                    key={event.id}
                                    className="modern-event-card"
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 0.3, delay: (index % 10) * 0.05 }}
                                >
                                    <div className="card-media">
                                        <img src={getStorageUrl(event.event_image)} alt={event.event_title} onClick={() => openEventModal(event)} />
                                        <div className="date-overlay">
                                            <span className="day">{formatDate(event.event_date, 'day')}</span>
                                            <span className="month">{formatDate(event.event_date, 'month')}</span>
                                        </div>
                                        <button
                                            className="decline-float-btn"
                                            onClick={() => handleDecline(event.id)}
                                            title="Not Interested"
                                        >
                                            <ThumbsDown size={14} />
                                        </button>
                                    </div>

                                    <div className="card-details">
                                        <Link
                                            to={(user?.role === 'Institute' && user?.institute?.id === event.institute?.id) ? '/profile' : `/institutions/${event.institute?.slug || event.institute?.id}/profile`}
                                            className="institute-tag"
                                            style={{ textDecoration: 'none', color: 'inherit' }}
                                        >
                                            <Award size={14} />
                                            <span>{event.institute?.institute_name || 'Academic Institution'}</span>
                                        </Link>
                                        <h3 onClick={() => openEventModal(event)}>{event.event_title}</h3>

                                        <div className="info-chips">
                                            <div className="chip location">
                                                <MapPin size={14} />
                                                <span>{event.sub_location || 'Main Campus'}</span>
                                            </div>
                                            <div className="chip interested">
                                                <Users size={14} />
                                                <span>{event.interested_count || 0} Joined</span>
                                            </div>
                                        </div>

                                        <div className="card-actions">
                                            <button
                                                className={`interest-toggle-btn ${event.is_interested ? 'interested' : ''}`}
                                                onClick={() => handleMarkInterest(event.id)}
                                            >
                                                {event.is_interested ? <Heart size={16} fill="white" /> : <Star size={16} />}
                                                <span>{event.is_interested ? 'Interested' : 'Join Event'}</span>
                                            </button>
                                            <button
                                                className="details-link-btn"
                                                onClick={() => openEventModal(event)}
                                            >
                                                View <ChevronRight size={16} />
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}

                            {(loadingMoreEvents && events.length === 0) && (
                                <>
                                    <EventSkeleton />
                                    <EventSkeleton />
                                    <EventSkeleton />
                                </>
                            )}

                            {loadingMoreEvents && events.length > 0 && !isMobile && (
                                <>
                                    <EventSkeleton />
                                    <EventSkeleton />
                                </>
                            )}

                            {loadingMoreEvents && isMobile && (
                                <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'center', padding: '20px 0' }}>
                                    <Loader2 className="animate-spin" size={32} color="var(--c-primary)" />
                                </div>
                            )}

                            {hasMoreEvents && (
                                <div
                                    ref={eventLoaderRef}
                                    style={{
                                        height: '50px',
                                        gridColumn: '1 / -1',
                                        visibility: 'hidden'
                                    }}
                                />
                            )}

                            {!hasMoreEvents && events.length > 0 && (
                                <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px 0', color: 'var(--c-text-muted)', fontSize: '0.9rem' }}>

                                </div>
                            )}

                        </div>
                    )}
                </main>

                {/* Right Sidebar - Trends & Notifications */}
                <aside className="events-right-sidebar">
                    <div className="sidebar-widget notifications-area">
                        <div className="widget-header">
                            <Bell size={18} />
                            <h4>Latest Updates</h4>
                        </div>
                        <div className="notification-list">
                            {(() => {
                                const dotColors = ['blue', 'gold', 'green', 'purple', 'red'];
                                const recentUpdates = latestEvents.slice(0, 2);

                                if (recentUpdates.length === 0) {
                                    return (
                                        <div className="notif-item">
                                            <div className="notif-content">
                                                <p style={{ color: 'var(--c-text-muted)', fontStyle: 'italic' }}>No recent events.</p>
                                            </div>
                                        </div>
                                    );
                                }

                                return recentUpdates.map((event, idx) => (
                                    <div
                                        key={event.id}
                                        className="notif-item"
                                        style={{ cursor: 'pointer' }}
                                        onClick={() => openEventModal(event)}
                                    >
                                        <div className={`notif-dot ${dotColors[idx % dotColors.length]}`}></div>
                                        <div className="notif-content">
                                            <p>{event.event_title} by {event.institute?.institute_name || 'an Institute'}</p>
                                            <span>
                                                {event.created_at
                                                    ? formatDistanceToNow(new Date(event.created_at), { addSuffix: true })
                                                    : ''}
                                            </span>
                                        </div>
                                    </div>
                                ));
                            })()}
                        </div>
                    </div>

                    <div className="sidebar-widget help-card">
                        <h4>Organizing an Event?</h4>
                        <p>Get your institution featured on UniAds Portal.</p>
                        {user?.role === 'Institute' ? (
                            <button
                                onClick={() => setShowAddEventModal(true)}
                                className="help-link"
                                style={{ width: '100%', border: 'none', textAlign: 'center' }}
                            >
                                Add Event
                            </button>
                        ) : (
                            <Link to="/institutionprofileadd" className="help-link">Register Now</Link>
                        )}
                    </div>
                </aside>
            </div>

            <AnimatePresence>
                {showAddEventModal && (
                    <AddEventModal
                        institute={user?.institute}
                        onClose={() => setShowAddEventModal(false)}
                        onSuccess={() => {
                            setShowAddEventModal(false);
                            refetchEvents();
                            refetchLatest();
                        }}
                    />
                )}
            </AnimatePresence>

            <EventDetailsModal
                isOpen={!!selectedEvent}
                event={selectedEvent}
                onClose={closeEventModal}
                onInterestToggle={handleMarkInterest}
            />
        </div>
    );
}

export default EventsPage;
