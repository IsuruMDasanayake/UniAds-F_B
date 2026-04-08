import { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    Home, Building2, GraduationCap, Calendar, Star, Search,
    Heart, MessageCircle, Bookmark, ChevronRight, User, LogOut,
    Clock, MapPin, CreditCard, ChevronDown, BadgeCheck,
    X, Send, Info, Link2, Check
} from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import axiosClient from '../lib/axios';
import { getStorageUrl } from '../lib/config';
import { copyToClipboard } from '../lib/clipboard';
import { useSettings } from '../context/SettingsContext';
import Navbar from '../components/Navbar';
import ProgrammeInfoModal from '../components/Modals/ProgrammeInfoModal';
import ApplyNowModal from '../components/Modals/ApplyNowModal';
import MoreInfoModal from '../components/Modals/MoreInfoModal';
import EventDetailsModal from '../components/Modals/EventDetailsModal';
import { isPremiumActive } from '../utils/premium';
import './FeedPage.css';

const PostSkeleton = () => (
    <div className="post-card skeleton-card">
        <div className="skeleton skeleton-image" />
        <div className="skeleton-content">
            <div className="post-header">
                <div className="skeleton skeleton-avatar" />
                <div className="post-meta">
                    <div className="skeleton skeleton-name" />
                    <div className="skeleton skeleton-date" />
                </div>
            </div>
            <div className="skeleton skeleton-title" />
            <div className="skeleton skeleton-description" />
            <div className="skeleton skeleton-description" />
            <div className="skeleton skeleton-description short" />
            <div className="skeleton-actions">
                <div className="skeleton skeleton-btn" />
                <div className="skeleton skeleton-btn" />
                <div className="skeleton skeleton-btn-round" />
            </div>
        </div>
    </div>
);


import { useUser } from '../hooks/useUser';
import { useInfinitePosts, useToggleLikePost, useToggleSavePost } from '../hooks/usePosts';
import { useInfiniteEvents, useToggleEventInterest, useDeclineEvent } from '../hooks/useEvents';

function FeedPage() {
    const { settings } = useSettings();
    const navigate = useNavigate();
    
    // TanStack Query Hooks
    const { data: userData } = useUser();
    const { 
        data: postsData, 
        fetchNextPage: fetchNextPosts, 
        hasNextPage: hasMorePosts, 
        isFetchingNextPage: loadingMorePosts,
        isLoading: postsLoading,
        refetch: refetchPosts
    } = useInfinitePosts();

    const { 
        data: eventsData, 
        fetchNextPage: fetchNextEvents, 
        hasNextPage: hasMoreEvents, 
        isFetchingNextPage: loadingMoreEvents,
        isLoading: eventsLoading
    } = useInfiniteEvents();

    const likeMutation = useToggleLikePost();
    const saveMutation = useToggleSavePost();
    const interestMutation = useToggleEventInterest();
    const declineMutation = useDeclineEvent();

    // Use localStorage as immediate fallback while useUser() query resolves (prevents race condition)
    const storedUser = (() => { try { return JSON.parse(localStorage.getItem('APP_USER') || 'null'); } catch { return null; } })();
    const user = userData || storedUser;
    const posts = postsData?.pages.flatMap(page => page.data) || [];
    const events = eventsData?.pages.flatMap(page => page.data) || [];

    const [selectedPost, setSelectedPost] = useState(null);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [showApplyModal, setShowApplyModal] = useState(false);
    const [showInfoModal, setShowInfoModal] = useState(false);
    const [applying, setApplying] = useState(false);
    const [submissionStatus, setSubmissionStatus] = useState({ type: '', message: '' });
    const [copiedPostId, setCopiedPostId] = useState(null);
    const [applyForm, setApplyForm] = useState({
        name: '',
        email: '',
        phone: '',
        message: '',
        privacyConsent: false
    });
    const [isEventsOpen, setIsEventsOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 900);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 900);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

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
    const eventLoaderRef = useRef(null);

    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting && hasMorePosts && !loadingMorePosts) {
                fetchNextPosts();
            }
        }, { threshold: 0.1, rootMargin: '300px' });

        if (loaderRef.current) observer.observe(loaderRef.current);
        return () => observer.disconnect();
    }, [hasMorePosts, loadingMorePosts, fetchNextPosts]);

    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting && hasMoreEvents && !loadingMoreEvents) {
                fetchNextEvents();
            }
        }, { threshold: 0.1, rootMargin: '100px' });

        if (eventLoaderRef.current) observer.observe(eventLoaderRef.current);
        return () => observer.disconnect();
    }, [hasMoreEvents, loadingMoreEvents, fetchNextEvents]);

    const handleLike = (postId) => {
        likeMutation.mutate(postId);
    };

    const handleSavePost = (postId) => {
        saveMutation.mutate(postId);
    };

    const handleEventInterest = (eventId) => {
        interestMutation.mutate(eventId);
    };

    const handleEventDecline = (eventId) => {
        declineMutation.mutate(eventId);
    };

    const openPostModal = (post) => {
        setSelectedPost(post);
        axiosClient.post(`/api/posts/${post.id}/track-view`).catch(() => { });
    };

    const handleCopyPostLink = (post) => {
        if (!post?.share_link) return;
        const url = `${window.location.origin}/post/${post.share_link}`;
        copyToClipboard(url).then(() => {
            setCopiedPostId(post.id);
            setTimeout(() => setCopiedPostId(null), 2000);
        }).catch(err => {
            console.error('Copy failed:', err?.message || err);
        });
    };

    const closeModals = () => {
        setSelectedPost(null);
        setSelectedEvent(null);
        setShowApplyModal(false);
        setShowInfoModal(false);
    };

    const openEventModal = (event) => {
        setSelectedEvent(event);
        if (event.id) {
            axiosClient.post(`/api/events/${event.id}/track-view`).catch(() => { });
        }
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
                privacy_consent: applyForm.privacyConsent 
            });

            setSubmissionStatus({ type: 'success', message: 'Application submitted successfully! We wish you all the best for your future.' });
            setApplyForm({ name: '', email: '', phone: '', message: '', privacyConsent: false });

            setTimeout(() => {
                setShowApplyModal(false);
                setSubmissionStatus({ type: '', message: '' });
            }, 5000);

        } catch (error) {
            console.error('Error submitting application:', error?.message || error);
            const errorMsg = error.response?.data?.message || "Failed to submit application. Please try again.";
            setSubmissionStatus({ type: 'error', message: errorMsg });
        } finally {
            setApplying(false);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const s = dateString.includes('T') ? dateString : dateString.replace(/-/g, "/");
        return new Date(s).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const loading = postsLoading;

    if (loading) {
        return (
            <div className="feed-page-wrapper feed-loading">
                <div className="spinner-box">
                    <div className="ui-loader loader-blk">
                        <svg viewBox="22 22 44 44" className="multiColor-loader">
                            <circle cx="44" cy="44" r="20.2" fill="none" strokeWidth="3.6" className="loader-circle loader-circle-animation"></circle>
                        </svg>
                    </div>
                    <p>Loading Feed...</p>
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
                        <>
                            {posts.map((post) => (
                                <motion.div
                                    key={post.id}
                                    className={`post-card ${post.status !== 'active' ? 'post-inactive' : ''}`}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    {/* Inactive Badge */}
                                    {post.status !== 'active' && (
                                        <div className="inactive-badge">
                                            Inactive
                                        </div>
                                    )}
                                    <div className="post-image">
                                        <img
                                            src={post.image ? getStorageUrl(post.image) : (settings.logo_url || '/images/logo.png')}
                                            alt={post.title}
                                        />
                                    </div>
                                    <div className="post-content">
                                        <div className="post-header">
                                            <Link
                                                to={(user?.role === 'Institute' && user?.institute?.id === post.institute?.id) ? '/profile' : `/institutions/${post.institute?.slug || post.institute?.id}/profile`}
                                                className="institute-link"
                                            >
                                                <img
                                                    src={post.institute?.profile_photo ? getStorageUrl(post.institute.profile_photo) : `https://ui-avatars.com/api/?name=${encodeURIComponent(post.institute?.institute_name || 'I')}&background=random`}
                                                    alt={post.institute?.institute_name}
                                                    className="institute-avatar"
                                                />
                                            </Link>
                                            <div className="post-meta">
                                                <Link
                                                    to={(user?.role === 'Institute' && user?.institute?.id === post.institute?.id) ? '/profile' : `/institutions/${post.institute?.slug || post.institute?.id}/profile`}
                                                    className="institute-name-link"
                                                    style={{ textDecoration: 'none', color: 'inherit' }}
                                                >
                                                    <span className="institute-name">
                                                        {post.institute?.institute_name}
                                                        {isPremiumActive(post.institute) && (
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
                                            {user?.role !== 'Institute' && (
                                                <button
                                                    className={`action-btn save-btn ${post.is_saved_by_user ? 'saved' : ''}`}
                                                    onClick={() => handleSavePost(post.id)}
                                                    title={post.is_saved_by_user ? 'Unsave' : 'Save'}
                                                >
                                                    <Bookmark size={20} fill={post.is_saved_by_user ? '#ffc107' : 'none'} color={post.is_saved_by_user ? '#ffc107' : 'currentColor'} />
                                                </button>
                                            )}
                                            <button
                                                className={`post-action-btn btn-copy-link ${copiedPostId === post.id ? 'copied' : ''}`}
                                                onClick={() => handleCopyPostLink(post)}
                                                title="Copy shareable link"
                                            >
                                                {copiedPostId === post.id ? <Check size={16} /> : <Link2 size={16} />}
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}

                            {/* Infinite Scroll Footer */}
                            <div className="infinite-scroll-footer" style={{ minHeight: '100px', width: '100%' }}>
                                {loadingMorePosts ? (
                                    isMobile ? (
                                        <div style={{ display: 'flex', justifyContent: 'center', padding: '30px 0', width: '100%' }}>
                                            <div className="ui-loader loader-blk" style={{ width: '32px', height: '32px' }}>
                                                <svg viewBox="22 22 44 44" className="multiColor-loader">
                                                    <circle cx="44" cy="44" r="20.2" fill="none" strokeWidth="3.6" className="loader-circle loader-circle-animation"></circle>
                                                </svg>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <PostSkeleton />
                                            <PostSkeleton />
                                        </>
                                    )
                                ) : hasMorePosts ? (
                                    <div ref={loaderRef} className="load-more-container" style={{ height: '50px' }} />
                                ) : (
                                    <div className="no-more-posts-container" style={{ textAlign: 'center', padding: '40px 0', width: '100%' }}>
                                        <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1rem' }}>No more posts to show</p>
                                        <button
                                            className="btn-secondary"
                                            onClick={() => refetchPosts()}
                                            style={{ margin: '0 auto' }}
                                        >
                                            Refresh Feed
                                        </button>
                                    </div>
                                )}
                            </div>
                        </>
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
                                                onClick={() => openEventModal(event)}
                                                style={{ cursor: 'pointer' }}
                                            >
                                                <div className="event-banner">
                                                    <img
                                                        src={event.event_image ? getStorageUrl(event.event_image) : (settings.logo_url || '/images/logo.png')}
                                                        alt={event.event_title}
                                                    />
                                                    <button
                                                        className="event-decline-btn"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleEventDecline(event.id);
                                                        }}
                                                        title="Hide this event"
                                                    >
                                                        &times;
                                                    </button>
                                                </div>
                                                <div className="event-card-content">
                                                    <div className="event-meta-row">
                                                        <span className="event-date-badge">
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
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleEventInterest(event.id);
                                                        }}
                                                    >
                                                        {hasInterested ? 'Interested' : 'Interest'}
                                                    </button>
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            )}

                            {/* Events Infinite Scroll Footer */}
                            <div className="events-infinite-scroll-footer" style={{ minHeight: '60px', width: '100%' }}>
                                {loadingMoreEvents ? (
                                    <div style={{ display: 'flex', justifyContent: 'center', padding: '15px 0', width: '100%' }}>
                                        <div className="ui-loader loader-blk" style={{ width: '24px', height: '24px' }}>
                                            <svg viewBox="22 22 44 44" className="multiColor-loader">
                                                <circle cx="44" cy="44" r="20.2" fill="none" strokeWidth="3.6" className="loader-circle loader-circle-animation"></circle>
                                            </svg>
                                        </div>
                                    </div>
                                ) : hasMoreEvents ? (
                                    <div ref={eventLoaderRef} className="load-more-events-container" style={{ height: '20px' }} />
                                ) : events.length > 0 ? (
                                    <div className="no-more-events-container" style={{ textAlign: 'center', padding: '15px 0', width: '100%' }}>
                                        <p style={{ color: '#64748b', fontSize: '0.8rem' }}>No more upcoming events</p>
                                    </div>
                                ) : null}
                            </div>
                        </div>
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
                isPremium={isPremiumActive(selectedPost?.institute)}
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
                course={selectedPost}
            />

            <EventDetailsModal
                isOpen={!!selectedEvent}
                event={selectedEvent}
                onClose={closeModals}
                onInterestToggle={handleEventInterest}
            />
        </div>
    );
}

export default FeedPage;
