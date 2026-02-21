import React, { useState, useEffect, useRef } from 'react';
import { Bell, UserPlus, AlertTriangle, Check, Trash2, Shield, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axiosClient from '../../lib/axios';
import './AdminNotificationDropdown.css';

const AdminNotificationDropdown = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const dropdownRef = useRef(null);

    const fetchNotifications = async (isSilent = false) => {
        try {
            const { data } = await axiosClient.get('/api/admin/notifications');
            setNotifications(data.notifications.data);
            setUnreadCount(data.unreadCount);
        } catch (error) {
            console.error('Error fetching admin notifications:', error);
        }
    };

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(() => fetchNotifications(true), 30000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const markAsRead = async (id) => {
        try {
            await axiosClient.post(`/api/admin/notifications/${id}/read`);
            setNotifications(notifications.map(n =>
                n.id === id ? { ...n, is_read: true } : n
            ));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

    const markAllAsRead = async () => {
        try {
            await axiosClient.post('/api/admin/notifications/read-all');
            setNotifications(notifications.map(n => ({ ...n, is_read: true })));
            setUnreadCount(0);
        } catch (error) {
            console.error('Error marking all as read:', error);
        }
    };

    const deleteNotification = async (e, id) => {
        e.stopPropagation();
        try {
            await axiosClient.delete(`/api/admin/notifications/${id}`);
            const updated = notifications.filter(n => n.id !== id);
            setNotifications(updated);
            if (notifications.find(n => n.id === id)?.is_read === false) {
                setUnreadCount(prev => Math.max(0, prev - 1));
            }
        } catch (error) {
            console.error('Error deleting notification:', error);
        }
    };

    const getIcon = (type) => {
        switch (type) {
            case 'new_institute_registration':
                return <div className="notif-icon-container registration"><UserPlus size={20} /></div>;
            case 'review_reported':
                return <div className="notif-icon-container report"><AlertTriangle size={20} /></div>;
            case 'system':
                return <div className="notif-icon-container system"><Shield size={20} /></div>;
            default:
                return <div className="notif-icon-container"><Bell size={20} /></div>;
        }
    };

    return (
        <div className="admin-notification-wrapper" ref={dropdownRef}>
            <button
                className={`notif-bell-btn ${unreadCount > 0 ? 'has-unread' : ''}`}
                onClick={() => setIsOpen(!isOpen)}
                title="Notifications"
            >
                <Bell size={20} />
                {unreadCount > 0 && (
                    <span className="notif-badge">{unreadCount}</span>
                )}
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        id="admin-notification-dropdown"
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                    >
                        <div className="notif-header">
                            <h3>Admin Notifications</h3>
                            {unreadCount > 0 && (
                                <button onClick={markAllAsRead} className="mark-all-btn">
                                    Mark all as read
                                </button>
                            )}
                        </div>

                        <div className="notif-list custom-scrollbar">
                            {notifications.length === 0 ? (
                                <div className="notif-empty">
                                    <Bell size={40} className="empty-icon" />
                                    <p>No new notifications</p>
                                </div>
                            ) : (
                                notifications.map((notif) => (
                                    <div
                                        key={notif.id}
                                        className={`notif-item ${!notif.is_read ? 'unread' : ''}`}
                                        onClick={() => !notif.is_read && markAsRead(notif.id)}
                                    >
                                        {getIcon(notif.type)}
                                        <div className="notif-content">
                                            <p className="notif-title">{notif.title}</p>
                                            <p className="notif-msg">{notif.message}</p>
                                            <span className="notif-time">
                                                {new Date(notif.created_at).toLocaleDateString([], {
                                                    month: 'short',
                                                    day: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </span>
                                        </div>
                                        <div className="notif-actions">
                                            {!notif.is_read && (
                                                <button
                                                    className="notif-action-btn check"
                                                    onClick={(e) => { e.stopPropagation(); markAsRead(notif.id); }}
                                                    title="Mark as read"
                                                >
                                                    <Check size={14} />
                                                </button>
                                            )}
                                            <button
                                                className="notif-action-btn delete"
                                                onClick={(e) => deleteNotification(e, notif.id)}
                                                title="Delete"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AdminNotificationDropdown;
