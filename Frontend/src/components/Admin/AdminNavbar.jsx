import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Search, Bell, User as UserIcon, Menu } from 'lucide-react';
import './AdminNavbar.css';

const AdminNavbar = ({ toggleSidebar }) => {
    const location = useLocation();
    const [pageTitle, setPageTitle] = useState('Dashboard');

    useEffect(() => {
        const path = location.pathname.split('/').pop();
        if (path) {
            setPageTitle(path.charAt(0).toUpperCase() + path.slice(1));
        } else {
            setPageTitle('Dashboard');
        }
    }, [location]);

    return (
        <header className="admin-navbar admin-navbar-scope">
            <div className="navbar-left">
                <button className="mobile-toggle" onClick={toggleSidebar}>
                    <Menu size={24} />
                </button>
                <div className="breadcrumb">
                    <span className="bc-parent">Admin</span>
                    <span className="bc-separator">/</span>
                    <span className="bc-current">{pageTitle}</span>
                </div>
            </div>

            <div className="navbar-right">
                <div className="search-bar">
                    <Search size={18} className="search-icon" />
                    <input type="text" placeholder="Global search..." />
                </div>

                <div className="navbar-actions">
                    <button className="action-btn">
                        <Bell size={20} />
                        <span className="notification-badge"></span>
                    </button>

                    <div className="user-profile-summary">
                        <div className="user-info">
                            <span className="user-name">Admin User</span>
                            <span className="user-role">Super Admin</span>
                        </div>
                        <div className="user-avatar">
                            <UserIcon size={20} />
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default AdminNavbar;
