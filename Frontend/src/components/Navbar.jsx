import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import {
    Compass, Building2, GraduationCap, Calendar, Search,
    LogOut, CreditCard, ChevronDown, X, Loader2,
    BookOpen, MapPin, Star, BarChart3, ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axiosClient from '../lib/axios';
import { getStorageUrl } from '../lib/config';
import { useSettings } from '../context/SettingsContext';
import './Navbar.css';

function Navbar({ user }) {
    const { settings } = useSettings();
    const navigate = useNavigate();
    const location = useLocation();
    const searchRef = useRef(null);
    const [searchQuery, setSearchQuery] = useState('');
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

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && searchQuery.trim()) {
            navigate(`/search?query=${searchQuery}`);
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
                                <Search size={18} />
                            </div>
                            <input
                                type="text"
                                placeholder="Search courses..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyDown={handleKeyDown}
                            />
                            {searchQuery && (
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
                                        <Link to="/analytics/overview" className="analytics-link">
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
            </nav>
        </>
    );
}

export default Navbar;
