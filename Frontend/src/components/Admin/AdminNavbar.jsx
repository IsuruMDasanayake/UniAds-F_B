import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Search, Bell, User as UserIcon, Menu, X, Camera, Save } from 'lucide-react';
import axiosClient from '../../lib/axios';
import { getStorageUrl } from '../../lib/config';
import './AdminNavbar.css';

const AdminProfileModal = ({ isOpen, onClose, user, onUpdate }) => {
    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        profile_picture: null
    });
    const [previewUrl, setPreviewUrl] = useState(user?.profile_picture ? getStorageUrl(user.profile_picture) : null);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (isOpen && user) {
            setFormData({
                name: user.name || '',
                email: user.email || '',
                profile_picture: null
            });
            setPreviewUrl(user.profile_picture ? getStorageUrl(user.profile_picture) : null);
        }
    }, [isOpen, user]);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData({ ...formData, profile_picture: file });
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        setError(null);

        try {
            // 1. Update Profile Info
            await axiosClient.post('/api/profile/update', {
                name: formData.name
            });

            // 2. Update Profile Picture if changed
            if (formData.profile_picture) {
                const picData = new FormData();
                picData.append('profile_picture', formData.profile_picture);
                await axiosClient.post('/api/profile/picture', picData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            }

            onUpdate();
            onClose();
        } catch (err) {
            console.error('Error updating profile:', err?.message || err);
            setError(err.response?.data?.message || 'Failed to update profile');
        } finally {
            setIsSaving(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="admin-profile-modal-overlay" onClick={onClose}>
            <div className="admin-profile-modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Update Profile</h2>
                    <button className="close-btn" onClick={onClose}><X size={20} /></button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="modal-body">
                        <div className="profile-pic-upload">
                            <div className="avatar-preview">
                                {previewUrl ? (
                                    <img src={previewUrl} alt="Preview" />
                                ) : (
                                    <UserIcon size={40} />
                                )}
                                <label htmlFor="profile-upload" className="upload-overlay">
                                    <Camera size={20} />
                                </label>
                            </div>
                            <input
                                id="profile-upload"
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                                hidden
                            />
                            <p className="upload-hint">Click icon to change photo</p>
                        </div>

                        <div className="form-group-admin">
                            <label>Full Name</label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                placeholder="Admin Name"
                                required
                            />
                        </div>

                        <div className="form-group-admin">
                            <label>Email Address</label>
                            <input
                                type="email"
                                value={formData.email}
                                disabled
                                className="disabled-input"
                            />
                            <span className="input-info">Email cannot be changed</span>
                        </div>

                        {error && <div className="modal-error">{error}</div>}
                    </div>

                    <div className="modal-footer">
                        <button type="button" className="admin-btn-secondary" onClick={onClose}>Cancel</button>
                        <button type="submit" className="admin-btn-primary" disabled={isSaving}>
                            <Save size={18} />
                            {isSaving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

import AdminNotificationDropdown from './AdminNotificationDropdown';

const AdminNavbar = ({ toggleSidebar }) => {
    const location = useLocation();
    const [pageTitle, setPageTitle] = useState('Dashboard');
    const [admin, setAdmin] = useState(null);
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

    const fetchAdminData = async () => {
        try {
            const response = await axiosClient.get('/api/user');
            const userData = response.data.data;
            setAdmin(userData);
            // Sync with localStorage
            localStorage.setItem('APP_USER', JSON.stringify(userData));
        } catch (error) {
            console.error('Error fetching admin data:', error?.message || error);
            // Fallback to localStorage if API fails
            const storedUser = localStorage.getItem('APP_USER');
            if (storedUser) setAdmin(JSON.parse(storedUser));
        }
    };

    useEffect(() => {
        fetchAdminData();
    }, []);

    useEffect(() => {
        const path = location.pathname.split('/').pop();
        if (path) {
            setPageTitle(path.charAt(0).toUpperCase() + path.slice(1));
        } else {
            setPageTitle('Dashboard');
        }
    }, [location]);

    return (
        <>
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
                    <div className="admin-live-badge desktop-only">
                        <span className="live-dot pulse"></span>
                        <span className="live-text">LIVE</span>
                    </div>
                </div>

                <div className="navbar-right">
                    <div className="search-bar">
                        <Search size={18} className="search-icon" />
                        <input type="text" placeholder="Global search..." />
                    </div>

                    <div className="navbar-actions">
                        <AdminNotificationDropdown />

                        <div
                            className="user-profile-summary clickable"
                            onClick={() => setIsProfileModalOpen(true)}
                        >
                            <div className="user-info">
                                <span className="user-name">{admin?.name || 'Admin User'}</span>
                                <span className="user-role">{admin?.email || 'Super Admin'}</span>
                            </div>
                            <div className="user-avatar">
                                {admin?.profile_picture ? (
                                    <img src={getStorageUrl(admin.profile_picture)} alt="" className="navbar-avatar-img" />
                                ) : (
                                    <UserIcon size={20} />
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <AdminProfileModal
                isOpen={isProfileModalOpen}
                onClose={() => setIsProfileModalOpen(false)}
                user={admin}
                onUpdate={fetchAdminData}
            />
        </>
    );
};

export default AdminNavbar;
