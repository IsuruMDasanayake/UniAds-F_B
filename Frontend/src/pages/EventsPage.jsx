import { useState, useEffect, useRef } from 'react';
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
    const [loading, setLoading] = useState(true);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [activeFilter, setActiveFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [processingId, setProcessingId] = useState(null);
    const [showAddEventModal, setShowAddEventModal] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [userRes, eventsRes] = await Promise.all([
                    axiosClient.get('/api/user'),
                    axiosClient.get('/api/events')
                ]);
                setUser(userRes.data);
                // API paginated data: { data: [...], current_page: 1, ... }
                setEvents(eventsRes.data.data || []);
            } catch (error) {
                console.error('Failed to fetch events:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const fetchEvents = async () => {
        try {
            const eventsRes = await axiosClient.get('/api/events');
            setEvents(eventsRes.data.data || []);
        } catch (error) {
            console.error('Failed to fetch events:', error);
        }
    };

    const handleMarkInterest = async (eventId) => {
        if (processingId) return;
        setProcessingId(eventId);
        try {
            const resp = await axiosClient.post(`/api/events/${eventId}/interest`);
            const isRemoving = resp.data.status === 'uninterested';

            setEvents(prev => prev.map(ev =>
                ev.id === eventId
                    ? {
                        ...ev,
                        interested_count: isRemoving ? (ev.interested_count - 1) : (ev.interested_count + 1),
                        is_interested: !isRemoving
                    }
                    : ev
            ));

            if (selectedEvent && selectedEvent.id === eventId) {
                setSelectedEvent(prev => ({
                    ...prev,
                    interested_count: isRemoving ? (prev.interested_count - 1) : (prev.interested_count + 1),
                    is_interested: !isRemoving
                }));
            }
        } catch (error) {
            console.error('Error marking interest:', error);
        } finally {
            setProcessingId(null);
        }
    };

    const handleDecline = async (eventId) => {
        if (processingId) return;
        setProcessingId(eventId);
        try {
            await axiosClient.post(`/api/events/${eventId}/decline`);
            setEvents(prev => prev.filter(ev => ev.id !== eventId));
        } catch (error) {
            console.error('Error declining event:', error);
        } finally {
            setProcessingId(null);
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
            day: 'numeric',
            year: 'numeric'
        });
    };

    const filteredEvents = events.filter(event => {
        const matchesSearch = event.event_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            event.sub_location?.toLowerCase().includes(searchQuery.toLowerCase());

        if (activeFilter === 'all') return matchesSearch;
        // Basic filtering logic based on date comparison
        const eventDate = new Date(event.event_date);
        const today = new Date();
        if (activeFilter === 'today') return matchesSearch && eventDate.toDateString() === today.toDateString();
        return matchesSearch;
    });

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

                    {filteredEvents.length === 0 ? (
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
                            {filteredEvents.map((event) => (
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
                                            className={`decline-float-btn ${processingId === event.id ? 'pulsing' : ''}`}
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
                                                className={`interest-toggle-btn ${event.is_interested ? 'interested' : ''} ${processingId === event.id ? 'loading' : ''}`}
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
