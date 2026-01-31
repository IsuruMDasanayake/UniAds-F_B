import { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    Home, Building2, GraduationCap, Calendar, Star, Search,
    Heart, MessageCircle, Bookmark, ChevronRight, User, LogOut,
    Clock, MapPin, CreditCard, ChevronDown, BadgeCheck,
    X, Send, Info, Loader2
} from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import axiosClient from '../lib/axios';
import { getStorageUrl } from '../lib/config';
import Navbar from '../components/Navbar';
import ProgrammeInfoModal from '../components/Modals/ProgrammeInfoModal';
import ApplyNowModal from '../components/Modals/ApplyNowModal';
import MoreInfoModal from '../components/Modals/MoreInfoModal';
import './FeedPage.css';

function FeedPage() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [posts, setPosts] = useState([]);
    const [events, setEvents] = useState([]);
    const [selectedPost, setSelectedPost] = useState(null);
    const [showApplyModal, setShowApplyModal] = useState(false);
    const [showInfoModal, setShowInfoModal] = useState(false);
    const [applying, setApplying] = useState(false);
    const [submissionStatus, setSubmissionStatus] = useState({ type: '', message: '' });
    const [applyForm, setApplyForm] = useState({
        name: '',
        email: '',
        phone: '',
        message: '',
        privacyConsent: false
    });
    const [isEventsOpen, setIsEventsOpen] = useState(false);

    // Pagination State
    const [postsPage, setPostsPage] = useState(1);
    const [hasMorePosts, setHasMorePosts] = useState(false);
    const [loadingMorePosts, setLoadingMorePosts] = useState(false);

    const [eventsPage, setEventsPage] = useState(1);
    const [hasMoreEvents, setHasMoreEvents] = useState(false);
    const [loadingMoreEvents, setLoadingMoreEvents] = useState(false);

    // Sidebar State
    const [expandedSections, setExpandedSections] = useState({
        bachelors: false,
        masters: false,
        diplomas: false
    });

    const toggleSection = (section) => {
        setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
    };


    const loaderRef = useRef(null);

    const fetchMorePosts = useCallback(async (force = false) => {
        if (loadingMorePosts || (!hasMorePosts && !force)) return;
        setLoadingMorePosts(true);

        try {
            const response = await axiosClient.get(`/api/posts?page=${postsPage + 1}`);
            const newPosts = response.data.data;

            if (newPosts.length === 0) {
                if (force) setHasMorePosts(false);
            } else {
                // Merge with saved status
                const savedIds = user?.saved_posts?.map(p => p.id) || [];
                const newPostsWithSaved = newPosts.map(post => ({
                    ...post,
                    is_liked_by_user: post.is_liked_by_user || false,
                    is_saved_by_user: post.is_saved_by_user || savedIds.includes(post.id)
                }));

                setPosts(prevPosts => {
                    const existingIds = new Set(prevPosts.map(p => p.id));
                    const uniqueNewPosts = newPostsWithSaved.filter(p => !existingIds.has(p.id));
                    return [...prevPosts, ...uniqueNewPosts];
                });

                setPostsPage(response.data.current_page);
                setHasMorePosts(!!response.data.next_page_url);
            }
        } catch (error) {
            console.error('Error loading more posts:', error);
        } finally {
            setLoadingMorePosts(false);
        }
    }, [postsPage, hasMorePosts, loadingMorePosts, user]);

    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            const target = entries[0];
            if (target.isIntersecting && hasMorePosts && !loadingMorePosts) {
                fetchMorePosts();
            }
        }, {
            root: null, // viewport
            rootMargin: "20px",
            threshold: 1.0
        });

        if (loaderRef.current) {
            observer.observe(loaderRef.current);
        }

        return () => {
            if (loaderRef.current) {
                observer.unobserve(loaderRef.current);
            }
        };
    }, [fetchMorePosts, hasMorePosts, loadingMorePosts]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [profileRes, feedRes] = await Promise.all([
                    axiosClient.get('/api/profile/me'),
                    axiosClient.get('/api/feed')
                ]);

                const currentUser = {
                    ...profileRes.data.user,
                    role: profileRes.data.role,
                    institute: profileRes.data.institute || null,
                    saved_posts: profileRes.data.savedPosts || []
                };

                const savedIds = currentUser.saved_posts?.map(p => p.id) || [];

                const postsWithSaved = (feedRes.data.posts?.data || []).map(post => ({
                    ...post,
                    is_liked_by_user: post.is_liked_by_user || false,
                    is_saved_by_user: post.is_saved_by_user || savedIds.includes(post.id)
                }));

                setUser(currentUser);
                setPosts(postsWithSaved);
                setPostsPage(feedRes.data.posts?.current_page || 1);
                setHasMorePosts(!!feedRes.data.posts?.next_page_url);

                setEvents(feedRes.data.events || []);
                // Initial load of events is via feedApi which only gets top 10.
                // If more are needed, we start pagination from page 1 of events API if needed, 
                // but since we already have 10, maybe we consider page 1 done? 
                // However, feedApi isn't paginated in the same way. It uses take(10).
                // So for "Load More", we should start fetching from page 2 of apiIndex.
                setEventsPage(1);
                setHasMoreEvents(feedRes.data.events?.length === 10); // Assume if 10 returned, there might be more.

            } catch (error) {
                console.error('Failed to fetch data:', error);
                navigate('/login');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [navigate]);


    const handleLike = async (postId) => {
        try {
            const response = await axiosClient.post(`/api/posts/${postId}/toggle-like`);
            setPosts(posts.map(post =>
                post.id === postId
                    ? { ...post, likes_count: response.data.likes_count, is_liked_by_user: response.data.liked }
                    : post
            ));
        } catch (error) {
            console.error('Error liking post:', error);
        }
    };

    const handleSavePost = async (postId) => {
        try {
            const response = await axiosClient.post(`/api/posts/${postId}/save`);
            // Update the post's is_saved status in the local state
            setPosts(posts.map(post =>
                post.id === postId
                    ? { ...post, is_saved_by_user: response.data.saved }
                    : post
            ));
        } catch (error) {
            console.error('Error saving post:', error);
        }
    };

    const handleEventInterest = async (eventId) => {
        try {
            const resp = await axiosClient.post(`/api/events/${eventId}/interest`);
            const isRemoving = resp.data.status === 'uninterested';

            setEvents(events.map(event =>
                event.id === eventId
                    ? {
                        ...event,
                        interested_count: isRemoving ? (event.interested_count - 1) : (event.interested_count + 1),
                        is_interested: !isRemoving
                    }
                    : event
            ));
        } catch (error) {
            console.error('Error registering event interest:', error);
        }
    };

    const handleEventDecline = async (eventId) => {
        try {
            await axiosClient.post(`/api/events/${eventId}/decline`);
            // Set animation or remove immediately
            setEvents(events.filter(event => event.id !== eventId));
        } catch (error) {
            console.error('Error declining event:', error);
        }
    };

    const handleLoadMoreEvents = async () => {
        if (loadingMoreEvents || !hasMoreEvents) return;
        setLoadingMoreEvents(true);

        try {
            const response = await axiosClient.get(`/api/events?page=${eventsPage + 1}`);
            const newEvents = response.data.data;

            setEvents(prevEvents => [...prevEvents, ...newEvents]);
            setEventsPage(response.data.current_page);
            setHasMoreEvents(!!response.data.next_page_url);
        } catch (error) {
            console.error('Error loading more events:', error);
        } finally {
            setLoadingMoreEvents(false);
        }
    };

    const openPostModal = (post) => {
        setSelectedPost(post);
        // Track view
        axiosClient.post(`/api/posts/${post.id}/track-view`).catch(() => { });
    };

    const closeModals = () => {
        setSelectedPost(null);
        setShowApplyModal(false);
        setShowInfoModal(false);
    };

    const handleApplySubmit = async (e) => {
        e.preventDefault();
        if (!selectedPost) return;

        setApplying(true);
        setSubmissionStatus({ type: '', message: '' });

        try {
            await axiosClient.post(`/api/course/apply/${selectedPost.institute_id}`, {
                ...applyForm,
                course_title: selectedPost.title,
                post_id: selectedPost.id,
                privacy_consent: applyForm.privacyConsent // Map privacyConsent to privacy_consent
            });

            setSubmissionStatus({ type: 'success', message: 'Application submitted successfully! We wish you all the best for your future.' });
            setApplyForm({ name: '', email: '', phone: '', message: '', privacyConsent: false });

            setTimeout(() => {
                setShowApplyModal(false);
                setSubmissionStatus({ type: '', message: '' });
            }, 5000);

        } catch (error) {
            console.error('Error submitting application:', error);
            const errorMsg = error.response?.data?.message || "Failed to submit application. Please try again.";
            setSubmissionStatus({ type: 'error', message: errorMsg });
        } finally {
            setApplying(false);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    if (loading) {
        return (
            <div className="feed-page-wrapper feed-loading">
                <div className="spinner-box">
                    <div className="ui-loader loader-blk">
                        <svg viewBox="22 22 44 44" className="multiColor-loader">
                            <circle cx="44" cy="44" r="20.2" fill="none" strokeWidth="3.6" className="loader-circle loader-circle-animation"></circle>
                        </svg>
                    </div>
                    <p>Loading feed...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="feed-page-wrapper feed-page">
            <Navbar user={user} />

            <main className="feed-main">
                {/* Left Sidebar - Categories */}
                <aside className="left-sidebar">
                    <div className="sidebar-card">
                        <h3>Bachelor&apos;s Degrees</h3>
                        <ul className="category-list">
                            <li><Link to="/courses?search=Bachelor of Science in IT">Bachelor of Science in IT</Link></li>
                            <li><Link to="/courses?search=Bachelor of Business Administration">Bachelor of Business Administration</Link></li>
                            <li><Link to="/courses?search=Bachelor of Arts">Bachelor of Arts</Link></li>
                            {expandedSections.bachelors && (
                                <>
                                    <li><Link to="/courses?search=Bachelor of Computer Science">Bachelor of Computer Science</Link></li>
                                    <li><Link to="/courses?search=Bachelor of Economics">Bachelor of Economics</Link></li>
                                    <li><Link to="/courses?search=Bachelor of Fine Arts">Bachelor of Fine Arts</Link></li>
                                </>
                            )}
                        </ul>
                        <button className="see-more-btn" onClick={() => toggleSection('bachelors')}>
                            {expandedSections.bachelors ? 'See Less' : 'See More'}
                        </button>

                        <h3>Master&apos;s Degrees</h3>
                        <ul className="category-list">
                            <li><Link to="/courses?search=Master of Science in Data Science">Master of Science in Data Science</Link></li>
                            <li><Link to="/courses?search=Master of Business Administration">Master of Business Administration</Link></li>
                            <li><Link to="/courses?search=Master of Arts in Education">Master of Arts in Education</Link></li>
                            {expandedSections.masters && (
                                <>
                                    <li><Link to="/courses?search=Master of Science in Cybersecurity">Master of Science in Cybersecurity</Link></li>
                                    <li><Link to="/courses?search=Master of Marketing">Master of Marketing</Link></li>
                                    <li><Link to="/courses?search=Master of Information Technology">Master of Information Technology</Link></li>
                                </>
                            )}
                        </ul>
                        <button className="see-more-btn" onClick={() => toggleSection('masters')}>
                            {expandedSections.masters ? 'See Less' : 'See More'}
                        </button>

                        <h3>Diplomas</h3>
                        <ul className="category-list">
                            <li><Link to="/courses?search=Diploma in IT">Diploma in IT</Link></li>
                            <li><Link to="/courses?search=Diploma in Marketing">Diploma in Marketing</Link></li>
                            <li><Link to="/courses?search=Diploma in Graphic Design">Diploma in Graphic Design</Link></li>
                            {expandedSections.diplomas && (
                                <>
                                    <li><Link to="/courses?search=Diploma in Data Science">Diploma in Data Science</Link></li>
                                    <li><Link to="/courses?search=Diploma in Business Management">Diploma in Business Management</Link></li>
                                    <li><Link to="/courses?search=Diploma in Hospitality Management">Diploma in Hospitality Management</Link></li>
                                </>
                            )}
                        </ul>
                        <button className="see-more-btn" onClick={() => toggleSection('diplomas')}>
                            {expandedSections.diplomas ? 'See Less' : 'See More'}
                        </button>
                    </div>
                </aside>

                {/* Center - Posts */}
                <section className="posts-section">
                    {posts.length === 0 ? (
                        <div className="no-posts">
                            <p>No posts available yet.</p>
                        </div>
                    ) : (
                        posts.map((post) => (
                            <motion.div
                                key={post.id}
                                className="post-card"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3 }}
                            >
                                <div className="post-image">
                                    <img
                                        src={post.image ? getStorageUrl(post.image) : '/images/logo.png'}
                                        alt={post.title}
                                    />
                                </div>
                                <div className="post-content">
                                    <div className="post-header">
                                        <Link
                                            to={(user?.role === 'Institute' && user?.institute?.id === post.institute?.id) ? '/profile' : `/institutions/${post.institute?.id}/profile`}
                                            className="institute-link"
                                        >
                                            <img
                                                src={post.institute?.profile_photo ? getStorageUrl(post.institute.profile_photo) : '/images/logo.png'}
                                                alt={post.institute?.institute_name}
                                                className="institute-avatar"
                                            />
                                        </Link>
                                        <div className="post-meta">
                                            <Link
                                                to={(user?.role === 'Institute' && user?.institute?.id === post.institute?.id) ? '/profile' : `/institutions/${post.institute?.id}/profile`}
                                                className="institute-name-link"
                                                style={{ textDecoration: 'none', color: 'inherit' }}
                                            >
                                                <span className="institute-name">
                                                    {post.institute?.institute_name}
                                                    {!!(post.institute?.is_premium && post.institute?.premium_expires_at && new Date() <= new Date(post.institute.premium_expires_at)) && (
                                                        <BadgeCheck size={18} fill="#ff4757" color="#ffffff" style={{ marginLeft: '4px', verticalAlign: 'middle', display: 'inline-block' }} />
                                                    )}
                                                </span>
                                            </Link>
                                            <span className="post-date">{formatDate(post.created_at)}</span>
                                        </div>
                                    </div>
                                    <h3 className="post-title">{post.title}</h3>
                                    <p className="post-description">{post.small_description}</p>
                                    <div className="post-actions">
                                        <button
                                            className={`post-action-btn btn-like ${post.is_liked_by_user ? 'liked' : ''}`}
                                            onClick={() => handleLike(post.id)}
                                        >
                                            <Heart size={16} fill={post.is_liked_by_user ? 'white' : 'transparent'} />
                                            <span>{post.likes_count || 0}</span>
                                        </button>
                                        <button
                                            className="post-action-btn btn-see-more"
                                            onClick={() => openPostModal(post)}
                                        >
                                            <span>See More</span>
                                            <Info size={16} />
                                        </button>
                                        {user?.role === 'User' && (
                                            <button
                                                className={`action-btn save-btn ${post.is_saved_by_user ? 'saved' : ''}`}
                                                onClick={() => handleSavePost(post.id)}
                                                title={post.is_saved_by_user ? 'Unsave' : 'Save'}
                                            >
                                                <Bookmark size={18} fill={post.is_saved_by_user ? '#ffc107' : 'none'} color={post.is_saved_by_user ? '#ffc107' : 'currentColor'} />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        ))
                    )}

                    {hasMorePosts ? (
                        <div ref={loaderRef} className="load-more-container" style={{ textAlign: 'center', margin: '20px 0', width: '100%', minHeight: '50px' }}>
                            {loadingMorePosts && <p>Loading...</p>}
                        </div>
                    ) : (
                        <div className="no-more-posts-container" style={{ textAlign: 'center', margin: '20px auto', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                            <p style={{ marginBottom: '10px', color: '#0f172a' }}>No more posts</p>
                            <button
                                className="btn-secondary"
                                onClick={() => fetchMorePosts(true)}
                                disabled={loadingMorePosts}
                            >
                                {loadingMorePosts ? 'Loading...' : 'Refresh'}
                            </button>
                        </div>
                    )}
                </section>

                {/* Right Sidebar - Events */}
                {/* Mobile Backdrop Overlay */}
                {isEventsOpen && (
                    <div
                        className="mobile-events-overlay"
                        onClick={() => setIsEventsOpen(false)}
                    />
                )}

                <aside className={`right-sidebar ${isEventsOpen ? 'is-open' : ''}`}>
                    <div className="events-card">
                        <div className="events-header">
                            <h3>Upcoming Events</h3>
                            <Link to="/events" className="see-all">See all</Link>
                        </div>
                        <div className="events-scroll-container">
                            {events.length === 0 ? (
                                <div className="no-events-container">
                                    <p className="no-events">No upcoming events found.</p>
                                </div>
                            ) : (
                                <div className="events-list">
                                    {events.map((event) => {
                                        const hasInterested = event.is_interested;
                                        return (
                                            <motion.div
                                                key={event.id}
                                                className="event-item-card"
                                                layout
                                                initial={{ opacity: 0, x: 20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, x: -20 }}
                                                transition={{ duration: 0.3 }}
                                            >
                                                <div className="event-banner">
                                                    <img
                                                        src={event.event_image ? getStorageUrl(event.event_image) : '/images/logo.png'}
                                                        alt={event.event_title}
                                                    />
                                                    <button
                                                        className="event-decline-btn"
                                                        onClick={() => handleEventDecline(event.id)}
                                                        title="Hide this event"
                                                    >
                                                        &times;
                                                    </button>
                                                </div>
                                                <div className="event-card-content">
                                                    <div className="event-meta-row">
                                                        <span className="event-date-badge">
                                                            <Calendar size={12} style={{ marginRight: '4px' }} />
                                                            {formatDate(event.event_date)}
                                                        </span>
                                                        <span className="event-card-institute">{event.institute?.institute_name}</span>
                                                    </div>
                                                    <h4 className="event-card-title">{event.event_title}</h4>
                                                    <div className="event-location-row">
                                                        <MapPin size={14} />
                                                        <span className="event-card-location">{event.sub_location || 'KDU'}</span>
                                                    </div>
                                                    <div className="event-stats-row">
                                                        <Star size={14} className="star-icon" />
                                                        <span>{event.interested_count || 0} interested</span>
                                                    </div>
                                                    <button
                                                        className={`event-interest-btn ${hasInterested ? 'interested' : ''}`}
                                                        onClick={() => handleEventInterest(event.id)}
                                                    >
                                                        {hasInterested ? 'Interested' : 'Interest'}
                                                    </button>
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                        {hasMoreEvents && (
                            <div className="load-more-events" style={{ textAlign: 'center', padding: '10px' }}>
                                <button
                                    className="see-all"
                                    onClick={handleLoadMoreEvents}
                                    style={{ background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}
                                    disabled={loadingMoreEvents}
                                >
                                    {loadingMoreEvents ? 'Loading...' : 'Load More Events'}
                                </button>
                            </div>
                        )}
                    </div>
                </aside>

                {/* Mobile Events Toggle */}
                <button
                    className={`mobile-events-toggle ${isEventsOpen ? 'is-open' : ''}`}
                    onClick={() => setIsEventsOpen(!isEventsOpen)}
                    aria-label="Toggle Events"
                >
                    <ChevronRight size={24} />
                </button>
            </main>

            {/* Reusable Modals */}
            <ProgrammeInfoModal
                course={selectedPost}
                isOpen={!!selectedPost && !showApplyModal && !showInfoModal}
                onClose={closeModals}
                onApply={() => setShowApplyModal(true)}
                onMoreInfo={() => setShowInfoModal(true)}
                userRole={user?.role}
            />

            <ApplyNowModal
                isOpen={showApplyModal}
                onClose={() => setShowApplyModal(false)}
                courseTitle={selectedPost?.title}
                form={{ ...applyForm, privacy_consent: applyForm.privacyConsent }} // Map privacyConsent to privacy_consent for shared component
                onChange={(e) => {
                    const { name, value, checked, type } = e.target;
                    // Handle special case for shared component expecting privacy_consent but local state using privacyConsent
                    if (name === 'privacy_consent') {
                        setApplyForm({ ...applyForm, privacyConsent: checked });
                    } else {
                        setApplyForm({ ...applyForm, [name]: type === 'checkbox' ? checked : value });
                    }
                }}
                onSubmit={handleApplySubmit}
                isSubmitting={applying}
                status={submissionStatus}
            />

            <MoreInfoModal
                isOpen={showInfoModal}
                onClose={() => setShowInfoModal(false)}
                contactNumber={selectedPost?.institute?.contact_number}
            />
        </div>
    );
}

export default FeedPage;
