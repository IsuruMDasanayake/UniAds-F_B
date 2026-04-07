import React, { useState, useEffect, useRef } from 'react';
import { Bell, User, Star, AlertTriangle, Check, Trash2, X, Heart, Info, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axiosClient from '../../lib/axios';
import { getStorageUrl } from '../../lib/config';
import './NotificationDropdown.css';

const NotificationDropdown = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const dropdownRef = useRef(null);

    const fetchNotifications = async () => {
        try {
            const { data } = await axiosClient.get('/api/institute/notifications');
            if (data.data) {
                setNotifications(data.data.notifications.data);
                setUnreadCount(data.data.unreadCount);
            }
        } catch (error) {
            console.error('Error fetching notifications:', error?.message || error);
        }
    };

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 30000);
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
            await axiosClient.post(`/api/institute/notifications/${id}/read`);
            setNotifications(notifications.map(n =>
                n.id === id ? { ...n, is_read: true } : n
            ));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error('Error marking notification as read:', error?.message || error);
        }
    };

    const markAllAsRead = async () => {
        try {
            await axiosClient.post('/api/institute/notifications/read-all');
            setNotifications(notifications.map(n => ({ ...n, is_read: true })));
            setUnreadCount(0);
        } catch (error) {
            console.error('Error marking all as read:', error?.message || error);
        }
    };

    const deleteNotification = async (e, id) => {
        e.stopPropagation();
        try {
            await axiosClient.delete(`/api/institute/notifications/${id}`);
            const updated = notifications.filter(n => n.id !== id);
            setNotifications(updated);
            if (!notifications.find(n => n.id === id).is_read) {
                setUnreadCount(prev => Math.max(0, prev - 1));
            }
        } catch (error) {
            console.error('Error deleting notification:', error?.message || error);
        }
    };



    const getIcon = (notif) => {
        const { type, data } = notif;

        if (data?.image) {
            return (
                <>
                    <img
                        src={getStorageUrl(data.image)}
                        alt=""
                        className="notif-img"
                        onError={(e) => {
                            e.target.style.display = 'none';
                            if (e.target.nextSibling) e.target.nextSibling.style.display = 'block';
                        }}
                    />
                    <Bell className="notif-icon-default" size={18} style={{ display: 'none' }} />
                </>
            );
        }

        switch (type) {
            case 'application_new': return <User className="notif-icon-user" size={18} />;
            case 'review_new': return <Star className="notif-icon-review" size={18} />;
            case 'post_like': return <Heart className="notif-icon-heart" size={18} />;
            case 'follower_new': return <User className="notif-icon-user" size={18} />;
            case 'event_interest': return <Info className="notif-icon-info" size={18} />;
            case 'event_starting': return <Calendar className="notif-icon-event" size={18} />;
            case 'subscription_expiring':
            case 'trial_expiring': return <AlertTriangle className="notif-icon-subs" size={18} />;
            case 'review_reported': return <AlertTriangle className="notif-icon-report" size={18} />;
            default: return <Bell className="notif-icon-default" size={18} />;
        }
    };

    return (
        <div className="analytics-notification-wrapper" ref={dropdownRef}>
            <button
                className={`notif-bell-btn ${unreadCount > 0 ? 'has-unread' : ''}`}
                onClick={() => setIsOpen(!isOpen)}
            >
                <Bell size={22} />
                {unreadCount > 0 && (
                    <span className="notif-badge">{unreadCount}</span>
                )}
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        id="analytics-notification-dropdown"
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                    >
                        <div className="notif-header">
                            <h3>Notifications</h3>
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
                                    <p>No notifications yet</p>
                                </div>
                            ) : (
                                notifications.map((notif) => (
                                    <div
                                        key={notif.id}
                                        className={`notif-item ${!notif.is_read ? 'unread' : ''}`}
                                        onClick={() => !notif.is_read && markAsRead(notif.id)}
                                    >
                                        <div className="notif-icon-container">
                                            {getIcon(notif)}
                                        </div>
                                        <div className="notif-content">
                                            <p className="notif-title">{notif.title}</p>
                                            <p className="notif-msg">{notif.message}</p>
                                            <span className="notif-time">
                                                {new Date(notif.created_at).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
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

export default NotificationDropdown;
