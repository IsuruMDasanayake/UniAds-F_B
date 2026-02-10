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
    FileDown,
    Mail,
    LogOut
} from 'lucide-react';
import './AdminSidebar.css';

const AdminSidebar = ({ isOpen, setIsOpen }) => {
    const [unreadCount, setUnreadCount] = useState(0);

    const fetchUnreadCount = async () => {
        try {
            const response = await axiosClient.get('/api/admin/inbox/unread-count');
            setUnreadCount(response.data.count);
        } catch (error) {
            console.error('Error fetching unread count', error);
        }
    };

    useEffect(() => {
        fetchUnreadCount();
        // Refresh count every minute
        const interval = setInterval(fetchUnreadCount, 60000);
        return () => clearInterval(interval);
    }, []);

    const menuItems = [
        { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
        { name: 'Users', path: '/admin/users', icon: Users },
        { name: 'Institutes', path: '/admin/institutes', icon: Building2 },
        { name: 'Categories', path: '/admin/categories', icon: Layers },
        { name: 'Posts', path: '/admin/posts', icon: FileText },
        { name: 'Events', path: '/admin/events', icon: Calendar },
        { name: 'Subscriptions', path: '/admin/subscriptions', icon: CreditCard },
        { name: 'Ratings', path: '/admin/ratings', icon: Star },
        { name: 'Policies', path: '/admin/policies', icon: ShieldCheck },
        { name: 'Inbox', path: '/admin/inbox', icon: Mail, badge: unreadCount },
        { name: 'Broadcast Mail', path: '/admin/broadcast-mail', icon: Mail },
        { name: 'Applications', path: '/admin/applications', icon: FileText },
        { name: 'Reports', path: '/admin/reports', icon: FileDown },
        { name: 'Settings', path: '/admin/settings', icon: Settings },
    ];

    const handleItemClick = () => {
        // Auto-hide sidebar on mobile (max-width 1024px)
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
                {menuItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                        onClick={handleItemClick}
                    >
                        <item.icon size={20} className="nav-icon" />
                        <span className="nav-text">{item.name}</span>
                        {item.badge > 0 && (
                            <span className="nav-badge">{item.badge > 99 ? '99+' : item.badge}</span>
                        )}
                    </NavLink>
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
