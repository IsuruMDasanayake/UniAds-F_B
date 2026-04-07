import React, { useState, useEffect } from 'react';
import axiosClient from '../../lib/axios';
import { Mail, Search, RefreshCw, Trash2, Eye, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ActionConfirmModal from '../../components/Modals/ActionConfirmModal';
import './AdminInboxPage.css';

const AdminInboxPage = () => {
    const [emails, setEmails] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState('all'); // all, unread
    const [selectedEmail, setSelectedEmail] = useState(null);
    const [pagination, setPagination] = useState({
        current_page: 1,
        last_page: 1,
        total: 0
    });

    // Delete Confirmation State
    const [deleteModal, setDeleteModal] = useState({
        isOpen: false,
        emailId: null,
        subject: ''
    });
    const [isDeleting, setIsDeleting] = useState(false);

    const fetchEmails = async (page = 1) => {
        setLoading(true);
        try {
            const params = {
                page,
                search: search || undefined,
                status: filter === 'unread' ? 'unread' : undefined
            };
            const response = await axiosClient.get('/api/admin/inbox', { params });
            const paginator = response.data.data;
            setEmails(paginator.data);
            setPagination({
                current_page: paginator.current_page,
                last_page: paginator.last_page,
                total: paginator.total
            });
        } catch (error) {
            console.error('Error fetching emails', error?.message || error);
        } finally {
            setLoading(false);
        }
    };

    const handleRefresh = async () => {
        setLoading(true);
        try {
            // Manually trigger IMAP Sync with force=true
            await axiosClient.post('/api/admin/inbox/sync?force=true');
            // Then fetch updated list
            await fetchEmails(1);
        } catch (error) {
            console.error('Error syncing emails', error?.message || error);
            // Fallback to just fetching if sync fails
            await fetchEmails(1);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEmails();
    }, [search, filter]);

    const handleMarkAsRead = async (id, e) => {
        e.stopPropagation();
        try {
            await axiosClient.patch(`/api/admin/inbox/${id}/read`);
            setEmails(emails.map(email =>
                email.id === id ? { ...email, is_read: true } : email
            ));
            if (selectedEmail && selectedEmail.id === id) {
                setSelectedEmail({ ...selectedEmail, is_read: true });
            }
        } catch (error) {
            console.error('Error marking as read', error?.message || error);
        }
    };

    const handleDelete = (id, subject, e) => {
        if (e) e.stopPropagation();
        setDeleteModal({
            isOpen: true,
            emailId: id,
            subject: subject || '(No Subject)'
        });
    };

    const confirmDelete = async () => {
        if (!deleteModal.emailId) return;

        setIsDeleting(true);
        try {
            await axiosClient.delete(`/api/admin/inbox/${deleteModal.emailId}`);
            setEmails(emails.filter(email => email.id !== deleteModal.emailId));
            if (selectedEmail && selectedEmail.id === deleteModal.emailId) {
                setSelectedEmail(null);
            }
            setDeleteModal({ isOpen: false, emailId: null, subject: '' });
        } catch (error) {
            console.error('Error deleting email', error?.message || error);
            alert('Failed to delete email');
        } finally {
            setIsDeleting(false);
        }
    };

    const openEmail = (email) => {
        setSelectedEmail(email);
        if (!email.is_read) {
            handleMarkAsRead(email.id, { stopPropagation: () => { } });
        }
    };

    return (
        <div className="admin-inbox-scope">
            <div className="inbox-page-header">
                <div>
                    <h1 className="inbox-title">Inbox</h1>
                    <p className="inbox-subtitle">Manage incoming contact messages</p>
                </div>
                <div className="header-actions">
                    <button className="inbox-refresh-btn" onClick={handleRefresh} title="Refresh Inbox (Syncs with Gmail)">
                        <RefreshCw size={20} className={loading ? 'spin-animation' : ''} />
                    </button>
                </div>
            </div>

            <div className={`inbox-layout ${selectedEmail ? 'has-selection' : ''}`}>
                <div className="inbox-list-side">
                    <div className="inbox-controls">
                        <div className="inbox-search-box">
                            <Search size={18} className="inbox-search-icon" />
                            <input
                                type="text"
                                placeholder="Search messages..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                        <select
                            className="inbox-filter-select"
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                        >
                            <option value="all">All Messages</option>
                            <option value="unread">Unread Only</option>
                        </select>
                    </div>

                    <div className="emails-scroll-area">
                        {loading && emails.length === 0 ? (
                            <div className="inbox-loading-state">
                                <RefreshCw className="spin-animation" size={32} />
                                <span>Syncing emails...</span>
                            </div>
                        ) : emails.length > 0 ? (
                            emails.map(email => (
                                <motion.div
                                    key={email.id}
                                    layoutId={`email-${email.id}`}
                                    className={`email-card ${!email.is_read ? 'is-unread' : ''} ${selectedEmail?.id === email.id ? 'active' : ''}`}
                                    onClick={() => openEmail(email)}
                                >
                                    {!email.is_read && <div className="unread-dot"></div>}
                                    <div className="card-content-wrapper">
                                        <div className="sender-avatar-sm">
                                            {email.sender_avatar ? (
                                                <img
                                                    src={email.sender_avatar}
                                                    alt=""
                                                    className="avatar-img-round"
                                                    onError={(e) => e.target.style.display = 'none'}
                                                />
                                            ) : null}
                                            <span className="avatar-letter">
                                                {(email.from_name || email.from_email).charAt(0).toUpperCase()}
                                            </span>
                                        </div>
                                        <div className="card-text-content">
                                            <div className="card-header">
                                                <span className="sender-label">{email.from_name || email.from_email}</span>
                                                <span className="date-label">{new Date(email.received_at).toLocaleDateString()}</span>
                                            </div>
                                            <span className="subject-label">{email.subject || '(No Subject)'}</span>
                                            <p className="preview-text">
                                                {email.body ? email.body.replace(/<[^>]*>/g, '').substring(0, 100) : '(No Content)'}
                                            </p>
                                        </div>
                                    </div>
                                </motion.div>
                            ))
                        ) : (
                            <div className="inbox-empty-state">
                                <Mail size={48} color="#475569" />
                                <p style={{ color: 'white' }}>No messages found</p>
                            </div>
                        )}
                    </div>

                    {pagination.last_page > 1 && (
                        <div className="inbox-pagination">
                            <button
                                className="pagination-btn"
                                disabled={pagination.current_page === 1}
                                onClick={() => fetchEmails(pagination.current_page - 1)}
                            >
                                Previous
                            </button>
                            <span className="pagination-info">
                                Page {pagination.current_page} of {pagination.last_page}
                            </span>
                            <button
                                className="pagination-btn"
                                disabled={pagination.current_page === pagination.last_page}
                                onClick={() => fetchEmails(pagination.current_page + 1)}
                            >
                                Next
                            </button>
                        </div>
                    )}
                </div>

                <AnimatePresence mode="wait">
                    {selectedEmail ? (
                        <motion.div
                            key={selectedEmail.id}
                            className="inbox-detail-side"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            transition={{ duration: 0.2 }}
                        >
                            <div className="detail-top-bar">
                                <button className="close-detail-btn" onClick={() => setSelectedEmail(null)}>
                                    Back to List
                                </button>
                                <button
                                    className="detail-delete-btn"
                                    onClick={(e) => handleDelete(selectedEmail.id, selectedEmail.subject, e)}
                                >
                                    <Trash2 size={18} /> Delete Message
                                </button>
                            </div>

                            <div className="detail-scroll-content">
                                <h2 className="detail-subject-title">{selectedEmail.subject || '(No Subject)'}</h2>
                                <div className="detail-sender-info">
                                    <div className="sender-avatar-large">
                                        {selectedEmail.sender_avatar ? (
                                            <img
                                                src={selectedEmail.sender_avatar}
                                                alt=""
                                                className="avatar-img-round"
                                                onError={(e) => e.target.style.display = 'none'}
                                            />
                                        ) : null}
                                        <span className="avatar-letter">
                                            {(selectedEmail.from_name || selectedEmail.from_email).charAt(0).toUpperCase()}
                                        </span>
                                    </div>
                                    <div className="sender-meta-group">
                                        <span className="sender-full-text">
                                            {selectedEmail.from_name} &lt;{selectedEmail.from_email}&gt;
                                        </span>
                                        <span className="received-time-text">
                                            {new Date(selectedEmail.received_at).toLocaleString(undefined, {
                                                dateStyle: 'full',
                                                timeStyle: 'short'
                                            })}
                                        </span>
                                    </div>
                                </div>
                                <div
                                    className="email-message-body"
                                    dangerouslySetInnerHTML={{ __html: selectedEmail.body }}
                                />
                            </div>
                        </motion.div>
                    ) : (
                        <div className="inbox-detail-side none-selected">
                            <div className="inbox-empty-state">
                                <Eye size={48} color="#475569" />
                                <p style={{ color: 'white' }}>Select a message to view its contents</p>
                            </div>
                        </div>
                    )}
                </AnimatePresence>
            </div>

            <ActionConfirmModal
                isOpen={deleteModal.isOpen}
                onClose={() => setDeleteModal({ isOpen: false, emailId: null, subject: '' })}
                onConfirm={confirmDelete}
                isProcessing={isDeleting}
                title="Delete Email"
                message={`Are you sure you want to delete the email "${deleteModal.subject}"? This action cannot be undone.`}
                confirmText="Yes, Delete"
                cancelText="Cancel"
                type="danger"
            />
        </div>
    );
};

export default AdminInboxPage;
