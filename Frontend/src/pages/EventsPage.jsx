import { useState, useEffect, useRef, useCallback } from 'react';
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

function EventsPage() {
    const [user, setUser] = useState(null);
    const [events, setEvents] = useState([]);
    const [eventsPage, setEventsPage] = useState(1);
    const [hasMoreEvents, setHasMoreEvents] = useState(true);
    const [loadingMoreEvents, setLoadingMoreEvents] = useState(false);
    const [loading, setLoading] = useState(true);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [activeFilter, setActiveFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
    const processingIds = useRef(new Set());
    const [showAddEventModal, setShowAddEventModal] = useState(false);
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

    const fetchData = async (isInitialAppLoad = false) => {
        // Only show total page loader if we don't have user data yet (first entry)
        if (isInitialAppLoad && !user) setLoading(true);
        else {
            setLoadingMoreEvents(true);
            setEvents([]); // Reset events to show skeletons
        }

        try {
            const response = await axiosClient.get(`/api/events`, {
                params: {
                    page: 1,
                    search: debouncedSearchQuery,
                    filter: activeFilter
                }
            });

            if (isInitialAppLoad && !user) {
                const userRes = await axiosClient.get('/api/user');
                setUser(userRes.data);
            }

            setEvents(response.data.data || []);
            setEventsPage(response.data.current_page || 1);
            setHasMoreEvents(!!response.data.next_page_url);
        } catch (error) {
            console.error('Failed to fetch events:', error);
        } finally {
            setLoading(false);
            setLoadingMoreEvents(false);
        }
    };

    useEffect(() => {
        fetchData(true); // Initial load or re-fetch on filter/search change
    }, [debouncedSearchQuery, activeFilter]);

    const fetchEvents = async () => {
        fetchData(true);
    };

    const handleLoadMoreEvents = useCallback(async () => {
        if (!hasMoreEvents || loadingMoreEvents) return;
        setLoadingMoreEvents(true);
        try {
            const response = await axiosClient.get(`/api/events`, {
                params: {
                    page: eventsPage + 1,
                    search: debouncedSearchQuery,
                    filter: activeFilter
                }
            });
            if (response.data && response.data.data) {
                const newEvents = response.data.data;
                setEvents(prevEvents => {
                    const existingIds = new Set(prevEvents.map(e => e.id));
                    const uniqueNewEvents = newEvents.filter(e => !existingIds.has(e.id));
                    return [...prevEvents, ...uniqueNewEvents];
                });
                setEventsPage(response.data.current_page);
                setHasMoreEvents(!!response.data.next_page_url);
            }
        } catch (error) {
            console.error('Failed to load more events:', error);
        } finally {
            setLoadingMoreEvents(false);
        }
    }, [hasMoreEvents, loadingMoreEvents, eventsPage, debouncedSearchQuery, activeFilter]);


    useEffect(() => {
        if (loading) return; // Don't setup observer while full-page loading

        const observer = new IntersectionObserver(
            entries => {
                const target = entries[0];
                if (target.isIntersecting && hasMoreEvents && !loadingMoreEvents) {
                    handleLoadMoreEvents();
                }
            },
            { threshold: 0.1, rootMargin: '100px' }
        );

        const currentLoader = eventLoaderRef.current;
        if (currentLoader) {
            observer.observe(currentLoader);
        }

        return () => {
            if (currentLoader) {
                observer.unobserve(currentLoader);
            }
        };
    }, [hasMoreEvents, loadingMoreEvents, eventsPage, handleLoadMoreEvents, loading]);


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




    const handleMarkInterest = async (eventId) => {
        // Prevent duplicate in-flight requests for the same event
        if (processingIds.current.has(eventId)) return;
        processingIds.current.add(eventId);

        // Snapshot for rollback
        const previousEvents = [...events];
        const previousSelected = selectedEvent ? { ...selectedEvent } : null;

        // Optimistic UI update
        const applyToggle = (ev) => {
            if (ev.id !== eventId) return ev;
            const isInterested = !ev.is_interested;
            return {
                ...ev,
                is_interested: isInterested,
                interested_count: isInterested ? (ev.interested_count + 1) : Math.max(0, ev.interested_count - 1)
            };
        };

        setEvents(prev => prev.map(applyToggle));
        if (selectedEvent?.id === eventId) {
            setSelectedEvent(prev => applyToggle(prev));
        }

        try {
            const resp = await axiosClient.post(`/api/events/${eventId}/interest`);
            const isRemoving = resp.data.status === 'uninterested';

            // Sync with server truth
            setEvents(prev => prev.map(ev =>
                ev.id === eventId ? { ...ev, is_interested: !isRemoving } : ev
            ));
            if (selectedEvent?.id === eventId) {
                setSelectedEvent(prev => prev ? { ...prev, is_interested: !isRemoving } : prev);
            }
        } catch (error) {
            console.error('Error marking interest:', error);
            // Rollback
            setEvents(previousEvents);
            if (previousSelected) setSelectedEvent(previousSelected);
        } finally {
            processingIds.current.delete(eventId);
        }
    };

    const handleDecline = async (eventId) => {
        if (processingIds.current.has(eventId)) return;
        processingIds.current.add(eventId);

        // Snapshot for rollback
        const previousEvents = [...events];

        // Optimistic: remove card immediately
        setEvents(prev => prev.filter(ev => ev.id !== eventId));
        if (selectedEvent?.id === eventId) setSelectedEvent(null);

        try {
            await axiosClient.post(`/api/events/${eventId}/decline`);
        } catch (error) {
            console.error('Error declining event:', error);
            // Rollback
            setEvents(previousEvents);
        } finally {
            processingIds.current.delete(eventId);
        }
    };

    const openEventModal = (event) => {
        setSelectedEvent(event);
        if (event.id) {
            axiosClient.post(`/api/events/${event.id}/track-view`, {})
                .catch(error => console.error('Error tracking event view:', error));
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

    if (loading) {
        return (
            <div className="events-loading">
                <div className="ui-loader loader-blk">
                    <svg viewBox="22 22 44 44" className="multiColor-loader">
                        <circle cx="44" cy="44" r="20.2" fill="none" strokeWidth="3.6" className="loader-circle loader-circle-animation"></circle>
                    </svg>
                </div>
                <p>Loading Events...</p>
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
                            <span className="stats-value">{events.length}</span>
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

                    {events.length === 0 && !loadingMoreEvents ? (
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
                            {events.map((event) => (
                                <motion.div
                                    key={event.id}
                                    className="modern-event-card"
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    whileInView={{ opacity: 1, scale: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.3 }}
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
                                    No more upcoming events
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
                            <div className="notif-item">
                                <div className="notif-dot blue"></div>
                                <div className="notif-content">
                                    <p>Scholarship Seminar added by PIBT</p>
                                    <span>2 hours ago</span>
                                </div>
                            </div>
                            <div className="notif-item">
                                <div className="notif-dot gold"></div>
                                <div className="notif-content">
                                    <p>New Workshop next Monday!</p>
                                    <span>Today</span>
                                </div>
                            </div>
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
                            fetchEvents();
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
