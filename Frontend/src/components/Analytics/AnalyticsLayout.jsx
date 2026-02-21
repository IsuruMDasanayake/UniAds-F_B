import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, Link, useLocation, useParams, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard, TrendingUp, FileText, Calendar,
    Star, CreditCard, Megaphone, Menu, X, ChevronRight, LogOut,
    UserCheck, Mail, MessageSquare
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axiosClient from '../../lib/axios';
import { getStorageUrl } from '../../lib/config';
import { useSettings } from '../../context/SettingsContext';
import EditProfileModal from '../../pages/InstituteProfile/modals/EditProfileModal';
import NotificationDropdown from './NotificationDropdown';
import './AnalyticsLayout.css';

const AnalyticsLayout = () => {
    const { settings } = useSettings();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const { slug } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const [user, setUser] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [newAppsCount, setNewAppsCount] = useState(0);
    const [newInquiriesCount, setNewInquiriesCount] = useState(0);

    const navItems = [
        { path: `/analytics/${slug}/overview`, label: 'Overview', icon: LayoutDashboard },
        { path: `/analytics/${slug}/trends`, label: 'Trends', icon: TrendingUp },
        { path: `/analytics/${slug}/posts`, label: 'Posts', icon: FileText },
        { path: `/analytics/${slug}/events`, label: 'Events', icon: Calendar },
        { path: `/analytics/${slug}/ratings`, label: 'Reviews', icon: Star },
        { path: `/analytics/${slug}/applications`, label: 'Applications', icon: UserCheck },
        { path: `/analytics/${slug}/inquiries`, label: 'Inquiries', icon: Mail },
        { path: `/analytics/${slug}/chat`, label: 'Messenger', icon: MessageSquare },
        { path: `/analytics/${slug}/ads`, label: 'Ads & Boosting', icon: Megaphone },
        { path: `/analytics/${slug}/subscription`, label: 'Subscription', icon: CreditCard },
    ];

    useEffect(() => {
        try {
            const storedUser = localStorage.getItem('APP_USER');
            if (storedUser) {
                const userData = JSON.parse(storedUser);
                setUser(userData);

                // Handle Redirection if slug is missing
                if (!slug && userData?.institute?.slug) {
                    const pathParts = location.pathname.split('/');
                    const subPath = pathParts[2] || 'overview';
                    navigate(`/analytics/${userData.institute.slug}/${subPath}`, { replace: true });
                }
            }
        } catch (error) {
            console.error('Error loading user data:', error);
        }

        fetchNewAppsCount();
        fetchNewInquiriesCount();
    }, [slug, navigate, location.pathname]);

    const fetchNewAppsCount = async () => {
        try {
            const { data } = await axiosClient.get('/api/institute/applications', {
                params: { per_page: 1 }
            });
            if (data.stats && data.stats.new !== undefined) {
                setNewAppsCount(data.stats.new);
            }
        } catch (error) {
            console.error('Error fetching new apps count:', error);
        }
    };

    const fetchNewInquiriesCount = async () => {
        try {
            const { data } = await axiosClient.get('/api/institute/inquiries', {
                params: { page: 1 }
            });
            if (data.stats && data.stats.new !== undefined) {
                setNewInquiriesCount(data.stats.new);
            }
        } catch (error) {
            console.error('Error fetching new inquiries count:', error);
        }
    };

    const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
    const closeMobileMenu = () => setIsMobileMenuOpen(false);

    const handleProfileUpdate = (updatedInstitute) => {
        const updatedUser = { ...user, institute: updatedInstitute };
        setUser(updatedUser);
        localStorage.setItem('APP_USER', JSON.stringify(updatedUser));
    };

    // Get current page title based on path
    const getCurrentTitle = () => {
        const current = navItems.find(item => item.path === location.pathname);
        return current ? current.label : 'Analytics';
    };

    const instituteName = user?.institute?.institute_name || 'Institute';
    const profilePhoto = user?.institute?.profile_photo
        ? getStorageUrl(user.institute.profile_photo)
        : '/images/profile.png';
    const firstLetter = instituteName.charAt(0).toUpperCase();

    return (
        <div id="analytics-layout-wrapper">
            {/* Mobile Header */}
            <div className="mobile-header">
                <div className="mobile-header-content">
                    <button onClick={toggleMobileMenu} className="mobile-menu-btn">
                        <Menu size={24} />
                    </button>
                    <NotificationDropdown />
                    <div className="live-status-mobile">
                        <span className="live-dot pulse"></span>
                        <span className="live-text">LIVE</span>
                    </div>
                </div>

                <div className="header-user mobile" onClick={() => setShowEditModal(true)}>
                    <div className="user-info">
                        <p className="user-role">{instituteName}</p>
                        <p className="user-status">Premium Member</p>
                    </div>
                    <div className="user-avatar">
                        <img src={profilePhoto} alt={instituteName} />
                    </div>
                </div>
            </div>

            {/* Sidebar Overlay */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={closeMobileMenu}
                        className="sidebar-overlay"
                    />
                )}
            </AnimatePresence>

            {/* Sidebar */}
            <motion.aside
                className={`analytics-sidebar ${isMobileMenuOpen ? 'open' : ''}`}
            >
                <div className="sidebar-header">
                    <Link to="/feed" className="brand-link">
                        <img src={settings.logo_url || "/images/logo.png"} alt={settings.site_name} style={{ height: '45px', width: 'auto' }} />
                        <span className="institute-badge" style={{ color: "#FFC107 !important" }}>Premium</span>
                    </Link>
                    <button onClick={closeMobileMenu} className="sidebar-close-btn">
                        <X size={20} />
                    </button>
                </div>

                <nav className="sidebar-nav">


                    {navItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            onClick={closeMobileMenu}
                            className={({ isActive }) =>
                                `nav-item ${isActive ? 'active' : ''}`
                            }
                        >
                            <item.icon size={20} />
                            <span className="nav-label">{item.label}</span>
                            {item.path.includes('/applications') && newAppsCount > 0 && (
                                <span className="nav-badge">{newAppsCount}</span>
                            )}
                            {item.path.includes('/inquiries') && newInquiriesCount > 0 && (
                                <span className="nav-badge yellow">{newInquiriesCount}</span>
                            )}
                            {/* {item.path.includes('/ads') && (
                                <span className="badge-soon">SOON</span>
                            )} */}
                        </NavLink>
                    ))}

                    <div className="sidebar-footer">
                        <Link
                            to="/profile"
                            className="footer-link"
                        >
                            <div className="profile-initial">
                                <span className="initial-text"><img src={profilePhoto} alt={instituteName} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} /></span>
                            </div>
                            <span className="nav-label">My Profile</span>
                        </Link>
                        <Link
                            to="/"
                            className="footer-link logout"
                        >
                            <LogOut size={20} />
                            <span className="nav-label">Back to Home</span>
                        </Link>
                    </div>
                </nav>
            </motion.aside>

            {/* Main Content */}
            <main className="analytics-main">
                {/* Desktop Header */}
                <header className="desktop-header">
                    <div>
                        <div className="title-row">
                            <h1 className="page-title">{getCurrentTitle()}</h1>
                            <div className="live-badge">
                                <span className="live-dot pulse"></span>
                                <span className="live-text">LIVE DATA</span>
                            </div>
                        </div>
                        <p className="page-subtitle">Welcome to your Analytics dashboard</p>
                    </div>

                    <div className="header-actions">
                        <NotificationDropdown />

                        <div className="header-user" onClick={() => setShowEditModal(true)} style={{ cursor: 'pointer' }}>
                            <div className="user-info">
                                <p className="user-role">{instituteName}</p>
                                <p className="user-status">Premium Member</p>
                            </div>
                            <div className="user-avatar">
                                <img src={profilePhoto} alt={instituteName} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                            </div>
                        </div>
                    </div>
                </header>

                <div className="content-area">
                    <Outlet context={{ fetchNewAppsCount, fetchNewInquiriesCount }} />
                </div>
            </main>

            <AnimatePresence>
                {showEditModal && user?.institute && (
                    <EditProfileModal
                        institute={user.institute}
                        onClose={() => setShowEditModal(false)}
                        onUpdate={handleProfileUpdate}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

export default AnalyticsLayout;
