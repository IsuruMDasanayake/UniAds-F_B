import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import axiosClient from '../../lib/axios';
import {
    LayoutDashboard,
    Users,
    Building2,
    Layers,
    FileText,
    Calendar,
    CreditCard,
    Star,
    ShieldCheck,
    Settings,
    Navigation,
    FileDown,
    Mail,
    ChevronDown,
    LogOut,
    History,
    MessageSquare,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import './AdminSidebar.css';

const AdminSidebar = ({ isOpen, setIsOpen }) => {
    const [unreadCount, setUnreadCount] = useState(0);
    const [expandedGroups, setExpandedGroups] = useState({
        'DASHBOARD': true,
        'USER & CONTENT': true,
        'COMMUNICATION': true,
        'OPERATIONS': true,
        'REPORTS & LOGS': true,
        'SYSTEM': true
    });

    const toggleGroup = (groupName) => {
        setExpandedGroups(prev => ({
            ...prev,
            [groupName]: !prev[groupName]
        }));
    };

    const fetchUnreadCount = async () => {
        try {
            const response = await axiosClient.get('/api/admin/inbox/unread-count');
            setUnreadCount(response.data.data?.count ?? 0);
        } catch (error) {
            console.error('Error fetching unread count', error?.message || error);
        }
    };

    useEffect(() => {
        fetchUnreadCount();
        const interval = setInterval(fetchUnreadCount, 60000);
        return () => clearInterval(interval);
    }, []);

    const menuGroups = [
        {
            group: 'DASHBOARD',
            items: [
                { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
            ]
        },
        {
            group: 'USER & CONTENT',
            items: [
                { name: 'Users', path: '/admin/users', icon: Users },
                { name: 'Institutes', path: '/admin/institutes', icon: Building2 },
                { name: 'Career Guidance', path: '/admin/career-guidance', icon: Navigation },
                { name: 'Categories', path: '/admin/categories', icon: Layers },
                { name: 'Posts', path: '/admin/posts', icon: FileText },
                { name: 'Events', path: '/admin/events', icon: Calendar },
                { name: 'Ratings', path: '/admin/ratings', icon: Star },
                { name: 'Policies', path: '/admin/policies', icon: ShieldCheck },
            ]
        },
        {
            group: 'COMMUNICATION',
            items: [
                { name: 'Inbox', path: '/admin/inbox', icon: Mail, badge: unreadCount },
                { name: 'Broadcast Mail', path: '/admin/broadcast-mail', icon: Mail },
                { name: 'System Feedback', path: '/admin/feedbacks', icon: MessageSquare },
            ]
        },
        {
            group: 'OPERATIONS',
            items: [
                { name: 'Subscriptions', path: '/admin/subscriptions', icon: CreditCard },
                { name: 'Applications', path: '/admin/applications', icon: FileText },
            ]
        },
        {
            group: 'REPORTS & LOGS',
            items: [
                { name: 'Reports', path: '/admin/reports', icon: FileDown },
                { name: 'Activity Logs', path: '/admin/activity-logs', icon: History },
            ]
        },
        {
            group: 'SYSTEM',
            items: [
                { name: 'Platform Settings', path: '/admin/settings', icon: Settings },
            ]
        }
    ];

    const handleItemClick = () => {
        if (window.innerWidth <= 1024) {
            setIsOpen(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('ACCESS_TOKEN');
        localStorage.removeItem('APP_USER');
        window.location.href = '/login';
    };

    return (
        <div className={`admin-sidebar admin-sidebar-scope ${isOpen ? 'open' : ''}`}>
            <div className="sidebar-brand">
                <img src="/images/logoN.png" alt="UniAds Admin" className="sidebar-logo-img" />
            </div>

            <nav className="sidebar-nav">
                {menuGroups.map((group) => (
                    <div key={group.group} className="nav-group">
                        <button
                            className="nav-group-header"
                            onClick={() => toggleGroup(group.group)}
                        >
                            <span className="nav-group-label">{group.group}</span>
                            <ChevronDown
                                size={14}
                                className={`group-chevron ${expandedGroups[group.group] ? 'expanded' : ''}`}
                            />
                        </button>

                        <AnimatePresence initial={false}>
                            {expandedGroups[group.group] && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                                    className="group-items-container"
                                >
                                    {group.items.map((item) => (
                                        <NavLink
                                            key={item.path}
                                            to={item.path}
                                            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                                            onClick={handleItemClick}
                                        >
                                            <item.icon size={18} className="nav-icon" />
                                            <span className="nav-text">{item.name}</span>
                                            {item.badge > 0 && (
                                                <span className="nav-badge">{item.badge > 99 ? '99+' : item.badge}</span>
                                            )}
                                        </NavLink>
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                ))}
            </nav>

            <div className="sidebar-footer">
                <button onClick={handleLogout} className="logout-btn">
                    <LogOut size={20} className="nav-icon" />
                    <span className="nav-text">Logout</span>
                </button>
            </div>
        </div>
    );
};

export default AdminSidebar;
