import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
    Home, Building2, GraduationCap, Calendar, Search,
    LogOut, CreditCard, ChevronDown, X, Loader2,
    BookOpen, MapPin, Star, BarChart3, ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axiosClient from '../lib/axios';
import { getStorageUrl } from '../lib/config';
import './Navbar.css';

function Navbar({ user }) {
    const navigate = useNavigate();
    const searchRef = useRef(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState({ posts: [], institutes: [], events: [] });
    const [isSearching, setIsSearching] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [lastScrollY, setLastScrollY] = useState(0);
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

    // Instant Search logic
    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            if (searchQuery.length >= 2) {
                performSearch();
            } else {
                setSearchResults({ posts: [], institutes: [], events: [] });
                setShowResults(false);
            }
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [searchQuery]);

    // Handle clicks outside search
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setShowResults(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const performSearch = async () => {
        setIsSearching(true);
        setShowResults(true);
        try {
            const resp = await axiosClient.get(`/api/search?query=${searchQuery}`);
            setSearchResults(resp.data);
        } catch (error) {
            console.error('Search error:', error);
        } finally {
            setIsSearching(false);
        }
    };

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
        setSearchResults({ posts: [], institutes: [], events: [] });
        setShowResults(false);
    };

    const handleResultClick = (path) => {
        setShowResults(false);
        navigate(path);
    };

    const hasResults = searchResults.posts.length > 0 ||
        searchResults.institutes.length > 0 ||
        searchResults.events.length > 0;

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && searchQuery.trim()) {
            setShowResults(false);
            navigate(`/search?query=${searchQuery}`);
        }
    };

    return (
        <>
            <header className={`main-navbar ${isMinimized ? 'navbar-minimized' : ''}`}>
                <div className="navbar-wrapper">
                    <div className="navbar-logo">
                        <Link to="/feed">
                            <img src="/images/logo.png" alt="UniAds" className="navbar-logo-img" />
                        </Link>
                    </div>

                    <div className="navbar-search-container" ref={searchRef}>
                        <div className={`navbar-search-bar ${showResults ? 'active' : ''}`}>
                            <div className="search-icon-box">
                                <Search size={18} />
                            </div>
                            <input
                                type="text"
                                placeholder="Search courses, institutes, events..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onFocus={() => searchQuery.length >= 2 && setShowResults(true)}
                                onKeyDown={handleKeyDown}
                            />
                            {searchQuery && (
                                <button className="search-clear-btn" onClick={clearSearch}>
                                    <X size={16} />
                                </button>
                            )}
                        </div>

                        <AnimatePresence>
                            {showResults && (
                                <motion.div
                                    className="search-results-dropdown"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 10 }}
                                >
                                    {isSearching ? (
                                        <div className="search-loading">
                                            <div className="ui-loader loader-blk">
                                                <svg viewBox="22 22 44 44" className="multiColor-loader">
                                                    <circle cx="44" cy="44" r="20.2" fill="none" strokeWidth="3.6" className="loader-circle loader-circle-animation"></circle>
                                                </svg>
                                            </div>
                                            <span>Searching...</span>
                                        </div>
                                    ) : !hasResults ? (
                                        <div className="no-results-found">
                                            <p>No results found for "{searchQuery}"</p>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="results-scroll-area">
                                                {/* Courses */}
                                                {searchResults.posts.length > 0 && (
                                                    <div className="result-group">
                                                        <h4 className="group-title">Courses</h4>
                                                        {searchResults.posts.map(post => (
                                                            <div key={post.id} className="result-item" onClick={() => handleResultClick('/courses')}>
                                                                <div className="item-icon courses"><BookOpen size={16} /></div>
                                                                <div className="item-info">
                                                                    <span className="item-name">{post.title}</span>
                                                                    <span className="item-sub">{post.institute?.institute_name}</span>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}

                                                {/* Institutes */}
                                                {searchResults.institutes.length > 0 && (
                                                    <div className="result-group">
                                                        <h4 className="group-title">Institutes</h4>
                                                        {searchResults.institutes.map(inst => (
                                                            <div key={inst.id} className="result-item" onClick={() => handleResultClick('/institutions')}>
                                                                <div className="item-icon institutes"><Building2 size={16} /></div>
                                                                <div className="item-info">
                                                                    <div className="name-with-badge">
                                                                        <span className="item-name">{inst.institute_name}</span>
                                                                        {inst.is_premium === 1 && <span className="premium-dot"></span>}
                                                                    </div>
                                                                    <span className="item-sub">{inst.location || 'Education Institute'}</span>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}

                                                {/* Events */}
                                                {searchResults.events.length > 0 && (
                                                    <div className="result-group">
                                                        <h4 className="group-title">Events</h4>
                                                        {searchResults.events.map(event => (
                                                            <div key={event.id} className="result-item" onClick={() => handleResultClick('/events')}>
                                                                <div className="item-icon events"><Calendar size={16} /></div>
                                                                <div className="item-info">
                                                                    <span className="item-name">{event.event_title}</span>
                                                                    <div className="item-meta">
                                                                        <span><MapPin size={10} /> {event.sub_location || 'Campus'}</span>
                                                                        <span><Star size={10} /> {event.interested_count || 0} interested</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="see-all-results" onClick={() => handleResultClick(`/search?query=${searchQuery}`)}>
                                                <span>See all results for "{searchQuery}"</span>
                                                <ChevronRight size={16} />
                                            </div>
                                        </>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    <nav className="navbar-links">
                        <Link to="/feed" className="nav-icon-link active" title="Home">
                            <Home size={24} />
                        </Link>
                        <Link to="/institutions" className="nav-icon-link" title="Institutes">
                            <Building2 size={24} />
                        </Link>
                        <Link to="/courses" className="nav-icon-link" title="Courses">
                            <GraduationCap size={24} />
                        </Link>
                        <Link to="/events" className="nav-icon-link" title="Events">
                            <Calendar size={24} />
                        </Link>
                        {displayUser?.role === 'Institute' && (
                            <Link to="/pricing" className="nav-icon-link pricing" title="Pricing">
                                <CreditCard size={24} />
                            </Link>
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
                                    <Link to="/profile">Profile</Link>
                                    {displayUser?.role === 'Institute' && displayUser?.institute?.is_premium === 1 && (
                                        <Link to="/analytics" className="analytics-link">
                                            Dashboard
                                        </Link>
                                    )}
                                    {user?.role === 'User' && (
                                        <Link to="/saved-posts">Saved Posts</Link>
                                    )}
                                    <button onClick={handleLogout} className="navbar-logout-btn">
                                        <LogOut size={16} /> Log Out
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            {/* Mobile Bottom Navigation */}
            <nav className={`mobile-bottom-nav ${isMinimized ? 'hidden' : ''}`}>
                <Link to="/feed" className="nav-icon-link mobile" title="Home">
                    <Home size={24} />
                </Link>
                <Link to="/institutions" className="nav-icon-link mobile" title="Institutes">
                    <Building2 size={24} />
                </Link>
                <Link to="/courses" className="nav-icon-link mobile" title="Courses">
                    <GraduationCap size={24} />
                </Link>
                <Link to="/events" className="nav-icon-link mobile" title="Events">
                    <Calendar size={24} />
                </Link>
                {displayUser?.role === 'Institute' && (
                    <Link to="/pricing" className="nav-icon-link mobile pricing" title="Pricing">
                        <CreditCard size={24} />
                    </Link>
                )}
            </nav>
        </>
    );
}

export default Navbar;
