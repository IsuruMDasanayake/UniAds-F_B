import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import {
    Compass, Building2, GraduationCap, Calendar, Search,
    LogOut, CreditCard, ChevronDown, X, Loader2,
    BookOpen, MapPin, Star, BarChart3, ChevronRight,
    MessageSquare
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axiosClient from '../lib/axios';
import { getStorageUrl } from '../lib/config';
import { useSettings } from '../context/SettingsContext';
import { useChat } from '../context/ChatContext';
import ProgrammeInfoModal from './Modals/ProgrammeInfoModal';
import ApplyNowModal from './Modals/ApplyNowModal';
import MoreInfoModal from './Modals/MoreInfoModal';
import MessengerDropdown from './MessengerDropdown';
import ChatModal from './ChatModal';
import './Navbar.css';
import './Messenger.css';

function Navbar({ user }) {
    const { settings } = useSettings();
    const { unreadTotal } = useChat();
    const navigate = useNavigate();

    const location = useLocation();
    const searchRef = useRef(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [messengerOpen, setMessengerOpen] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [lastScrollY, setLastScrollY] = useState(0);

    // Modal States for share links
    const [selectedPost, setSelectedPost] = useState(null);
    const [showApplyModal, setShowApplyModal] = useState(false);
    const [showInfoModal, setShowInfoModal] = useState(false);
    const [isSearchingLink, setIsSearchingLink] = useState(false);
    const [submissionStatus, setSubmissionStatus] = useState({ type: '', message: '' });
    const [applying, setApplying] = useState(false);
    const [applyForm, setApplyForm] = useState({
        name: '',
        email: '',
        phone: '',
        message: '',
        privacyConsent: false
    });
    // Keep a local cached user so brief null/undefined props don't switch the avatar
    const [cachedUser, setCachedUser] = useState(() => {
        try {
            const raw = localStorage.getItem('APP_USER');
            return raw ? JSON.parse(raw) : null;
        } catch (e) {
            return null;
        }
    });

    const displayUser = user ?? cachedUser;

    useEffect(() => {
        if (user) {
            try {
                localStorage.setItem('APP_USER', JSON.stringify(user));
                setCachedUser(user);
            } catch (e) {
                // ignore storage errors
            }
        }
    }, [user]);

    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;
            if (window.innerWidth <= 900) {
                if (currentScrollY > 50 && currentScrollY > lastScrollY) {
                    setIsMinimized(true);
                } else {
                    setIsMinimized(false);
                }
            } else {
                setIsMinimized(false);
            }
            setLastScrollY(currentScrollY);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, [lastScrollY]);

    const handleLogout = async () => {
        try {
            await axiosClient.post('/api/logout');
        } catch (error) {
            console.error('Logout error:', error);
        }
        localStorage.removeItem('ACCESS_TOKEN');
        localStorage.removeItem('APP_USER');
        navigate('/');
    };

    const clearSearch = () => {
        setSearchQuery('');
    };

    const handleResultClick = (path) => {
        navigate(path);
    };

    const handleKeyDown = async (e) => {
        if (e.key === 'Enter' && searchQuery.trim()) {
            const query = searchQuery.trim();

            // Intercept share links (contains a UUID)
            const uuidPattern = /([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/i;
            if (uuidPattern.test(query)) {
                setIsSearchingLink(true);
                try {
                    const response = await axiosClient.get(`/api/search?query=${query}`);
                    if (response.data.is_share_link_match && response.data.posts.length === 1) {
                        const post = response.data.posts[0];
                        setSelectedPost(post);
                        setSearchQuery(''); // Clear search bar on success
                        // Track view
                        axiosClient.post(`/api/posts/${post.id}/track-view`).catch(() => { });
                        return;
                    }
                } catch (error) {
                    console.error('Error searching link:', error);
                } finally {
                    setIsSearchingLink(false);
                }
            }

            // Fallback for regular search
            navigate(`/search?query=${query}`);
        }
    };

    const closeModals = () => {
        setSelectedPost(null);
        setShowApplyModal(false);
        setShowInfoModal(false);
        setSubmissionStatus({ type: '', message: '' });
    };

    const handleApplySubmit = async (e) => {
        e.preventDefault();
        setApplying(true);
        setSubmissionStatus({ type: '', message: '' });

        try {
            await axiosClient.post(`/api/course/apply/${selectedPost.institute_id}`, {
                ...applyForm,
                course_title: selectedPost.title,
                post_id: selectedPost.id,
                privacy_consent: applyForm.privacyConsent
            });

            setSubmissionStatus({ type: 'success', message: 'Application submitted successfully!' });
            setApplyForm({ name: '', email: '', phone: '', message: '', privacyConsent: false });

            setTimeout(() => {
                setShowApplyModal(false);
                setSubmissionStatus({ type: '', message: '' });
            }, 5000);
        } catch (error) {
            const errorMsg = error.response?.data?.message || "Failed to submit application.";
            setSubmissionStatus({ type: 'error', message: errorMsg });
        } finally {
            setApplying(false);
        }
    };

    return (
        <>
            <header className={`main-navbar ${isMinimized ? 'navbar-minimized' : ''}`}>
                <div className="navbar-wrapper">
                    <div className="navbar-logo">
                        <Link to="/feed">
                            <img src={settings.logo_url || "/images/logo.png"} alt={settings.site_name} className="navbar-logo-img" />
                        </Link>
                    </div>

                    <div className="navbar-search-container" ref={searchRef}>
                        <div className="navbar-search-bar">
                            <div className="search-icon-box">
                                <Search size={18} className={isSearchingLink ? 'searching-animate' : ''} />
                            </div>
                            <input
                                type="text"
                                placeholder="Search courses or links..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyDown={handleKeyDown}
                                disabled={isSearchingLink}
                            />
                            {isSearchingLink && (
                                <div className="search-spinner">
                                    <Loader2 size={16} className="animate-spin" />
                                </div>
                            )}
                            {searchQuery && !isSearchingLink && (
                                <button className="search-clear-btn" onClick={clearSearch}>
                                    <X size={16} />
                                </button>
                            )}
                        </div>
                    </div>

                    <nav className="navbar-links">
                        <Link to="/feed" className={`nav-icon-link ${location.pathname === '/feed' ? 'active' : ''}`} title="Feed">
                            <Compass size={24} />
                            <span className="nav-label">Feed</span>
                        </Link>
                        <Link to="/institutions" className={`nav-icon-link ${location.pathname === '/institutions' ? 'active' : ''}`} title="Institutes">
                            <Building2 size={24} />
                            <span className="nav-label">Institutes</span>
                        </Link>
                        <Link to="/courses" className={`nav-icon-link ${location.pathname === '/courses' ? 'active' : ''}`} title="Courses">
                            <GraduationCap size={24} />
                            <span className="nav-label">Courses</span>
                        </Link>
                        <Link to="/events" className={`nav-icon-link ${location.pathname === '/events' ? 'active' : ''}`} title="Events">
                            <Calendar size={24} />
                            <span className="nav-label">Events</span>
                        </Link>
                        {displayUser?.role === 'Institute' && (
                            <Link to="/pricing" className={`nav-icon-link pricing ${location.pathname === '/pricing' ? 'active' : ''}`} title="Pricing">
                                <CreditCard size={24} />
                                <span className="nav-label">Pricing</span>
                            </Link>
                        )}
                        {displayUser?.role === 'User' && (
                            <div className="navbar-messenger-container" style={{ position: 'relative' }}>
                                <button
                                    className={`nav-icon-link ${messengerOpen ? 'active' : ''}`}
                                    title="Messages"
                                    onClick={() => setMessengerOpen(!messengerOpen)}
                                >
                                    <div className="icon-with-badge">
                                        <MessageSquare size={24} />
                                        {unreadTotal > 0 && <span className="unread-count-badge">{unreadTotal}</span>}
                                    </div>
                                    <span className="nav-label">Chats</span>
                                </button>
                                <MessengerDropdown
                                    isOpen={messengerOpen}
                                    onClose={() => setMessengerOpen(false)}
                                />
                            </div>
                        )}

                    </nav>

                    <div className="navbar-profile-section">
                        <div className="navbar-separator"></div>
                        <div className="navbar-profile-dropdown">
                            <button
                                className="navbar-profile-btn"
                                onClick={() => setDropdownOpen(!dropdownOpen)}
                            >
                                <img
                                    src={displayUser?.role === 'Institute'
                                        ? (displayUser?.institute?.profile_photo ? getStorageUrl(displayUser.institute.profile_photo) : '/images/profile.png')
                                        : `https://api.dicebear.com/7.x/initials/svg?seed=${displayUser?.name || 'User'}&backgroundColor=ffc107`
                                    }
                                    alt="Profile"
                                    className="navbar-profile-img"
                                />
                                <span className="navbar-username">
                                    {displayUser?.role === 'Institute'
                                        ? (displayUser?.institute?.institute_name || displayUser?.name)
                                        : displayUser?.name}
                                </span>
                                <ChevronDown size={14} className="navbar-dropdown-arrow" />
                            </button>
                            {dropdownOpen && (
                                <div className="navbar-dropdown-menu">
                                    {displayUser?.role === 'Institute' && (
                                        <Link to="/profile">Profile</Link>
                                    )}
                                    {displayUser?.role === 'User' && (
                                        <Link to="/profile">Profile</Link>
                                    )}
                                    {displayUser?.role === 'Institute' && Boolean(displayUser?.institute?.is_premium) && (
                                        <Link to={`/analytics/${displayUser?.institute?.slug || displayUser?.institute?.id}/overview`} className="analytics-link" target="_blank" rel="noopener noreferrer">
                                            Dashboard
                                        </Link>
                                    )}
                                    {(
                                        <button onClick={handleLogout} className="navbar-logout-btn">
                                            <LogOut size={16} /> Log Out
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            {/* Mobile Bottom Navigation */}
            <nav className={`mobile-bottom-nav ${isMinimized ? 'hidden' : ''}`}>
                <Link to="/feed" className={`nav-icon-link mobile ${location.pathname === '/feed' ? 'active' : ''}`} title="Feed">
                    <Compass size={24} />
                    <span className="nav-label">Feed</span>
                </Link>
                <Link to="/institutions" className={`nav-icon-link mobile ${location.pathname === '/institutions' ? 'active' : ''}`} title="Institutes">
                    <Building2 size={24} />
                    <span className="nav-label">Institutes</span>
                </Link>
                <Link to="/courses" className={`nav-icon-link mobile ${location.pathname === '/courses' ? 'active' : ''}`} title="Courses">
                    <GraduationCap size={24} />
                    <span className="nav-label">Courses</span>
                </Link>
                <Link to="/events" className={`nav-icon-link mobile ${location.pathname === '/events' ? 'active' : ''}`} title="Events">
                    <Calendar size={24} />
                    <span className="nav-label">Events</span>
                </Link>
                {displayUser?.role === 'Institute' && (
                    <Link to="/pricing" className={`nav-icon-link mobile pricing ${location.pathname === '/pricing' ? 'active' : ''}`} title="Pricing">
                        <CreditCard size={24} />
                        <span className="nav-label">Pricing</span>
                    </Link>
                )}
                {displayUser?.role === 'User' && (
                    <button
                        className={`nav-icon-link mobile ${messengerOpen ? 'active' : ''}`}
                        onClick={() => setMessengerOpen(!messengerOpen)}
                    >
                        <div className="icon-with-badge">
                            <MessageSquare size={24} />
                            {unreadTotal > 0 && <span className="unread-count-badge mobile">{unreadTotal}</span>}
                        </div>
                        <span className="nav-label">Chats</span>
                    </button>
                )}

            </nav>

            {/* Share Link Direct Modals */}
            <ProgrammeInfoModal
                course={selectedPost}
                isOpen={!!selectedPost && !showApplyModal && !showInfoModal}
                onClose={closeModals}
                onApply={() => setShowApplyModal(true)}
                onMoreInfo={() => setShowInfoModal(true)}
                userRole={displayUser?.role}
                isPremium={!!selectedPost?.institute?.is_premium}
                institute={selectedPost?.institute}
            />

            <ApplyNowModal
                isOpen={showApplyModal}
                onClose={() => setShowApplyModal(false)}
                courseTitle={selectedPost?.title}
                form={{ ...applyForm, privacy_consent: applyForm.privacyConsent }}
                onChange={(e) => {
                    const { name, value, checked, type } = e.target;
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

            <ChatModal />
        </>
    );
}

export default Navbar;
