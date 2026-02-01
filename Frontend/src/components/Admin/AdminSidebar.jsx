import React from 'react';
import { NavLink } from 'react-router-dom';
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
    LogOut
} from 'lucide-react';
import './AdminSidebar.css';

const AdminSidebar = ({ isOpen }) => {
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
    ];

    const handleLogout = () => {
        localStorage.removeItem('ACCESS_TOKEN');
        localStorage.removeItem('APP_USER');
        window.location.href = '/login';
    };

    return (
        <div className={`admin-sidebar admin-sidebar-scope ${isOpen ? 'open' : ''}`}>
            <div className="sidebar-brand">
                <span className="brand-logo">UA</span>
                <span className="brand-name">UniAds Admin</span>
            </div>

            <nav className="sidebar-nav">
                {menuItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                    >
                        <item.icon size={20} className="nav-icon" />
                        <span className="nav-text">{item.name}</span>
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
