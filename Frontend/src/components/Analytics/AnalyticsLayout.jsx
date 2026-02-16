import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, Link, useLocation } from 'react-router-dom';
import {
    LayoutDashboard, TrendingUp, FileText, Calendar,
    Star, CreditCard, Megaphone, Menu, X, ChevronRight, LogOut
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getStorageUrl } from '../../lib/config';
import { useSettings } from '../../context/SettingsContext';
import EditProfileModal from '../../pages/InstituteProfile/modals/EditProfileModal';
import './AnalyticsLayout.css';

const AnalyticsLayout = () => {
    const { settings } = useSettings();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const location = useLocation();
    const [user, setUser] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);

    const navItems = [
        { path: '/analytics/overview', label: 'Overview', icon: LayoutDashboard },
        { path: '/analytics/trends', label: 'Trends', icon: TrendingUp },
        { path: '/analytics/posts', label: 'Posts', icon: FileText },
        { path: '/analytics/events', label: 'Events', icon: Calendar },
        { path: '/analytics/ratings', label: 'Reviews', icon: Star },
        { path: '/analytics/ads', label: 'Ads Manager', icon: Megaphone },
        { path: '/analytics/subscription', label: 'Subscription', icon: CreditCard },
    ];

    useEffect(() => {
        try {
            const storedUser = localStorage.getItem('APP_USER');
            if (storedUser) {
                setUser(JSON.parse(storedUser));
            }
        } catch (error) {
            console.error('Error loading user data:', error);
        }
    }, []);

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
                    <span className="mobile-brand">Analytics</span>
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
                    <div className="nav-section-title">
                        Dashboard
                    </div>

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
                            {item.path === '/analytics/ads' && (
                                <span className="badge-soon">SOON</span>
                            )}
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
                        <h1 className="page-title">{getCurrentTitle()}</h1>
                        <p className="page-subtitle">Welcome to your institute dashboard</p>
                    </div>
                    <div className="header-user" onClick={() => setShowEditModal(true)} style={{ cursor: 'pointer' }}>
                        <div className="user-info">
                            <p className="user-role">{instituteName}</p>
                            <p className="user-status">Premium Member</p>
                        </div>
                        <div className="user-avatar">
                            <img src={profilePhoto} alt={instituteName} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                        </div>
                    </div>
                </header>

                <div className="content-area">
                    <Outlet />
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
