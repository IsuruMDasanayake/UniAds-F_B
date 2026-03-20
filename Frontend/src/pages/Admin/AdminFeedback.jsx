import React, { useState, useEffect } from 'react';
import {
    Search,
    Trash2,
    Star,
    User,
    Building2,
    Filter
} from 'lucide-react';
import axiosClient from '../../lib/axios';
import ActionConfirmModal from '../../components/Modals/ActionConfirmModal';
import './AdminFeedback.css';

const AdminFeedback = () => {
    const [feedbacks, setFeedbacks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('All');
    
    // Delete Confirmation State
    const [deleteModal, setDeleteModal] = useState({
        isOpen: false,
        feedbackId: null,
        userName: ''
    });
    const [isDeleting, setIsDeleting] = useState(false);

    const fetchFeedbacks = async (isSilent = false) => {
        try {
            if (!isSilent) setLoading(true);
            const response = await axiosClient.get('/api/admin/feedbacks');
            setFeedbacks(response.data);
        } catch (error) {
            console.error('Error fetching feedbacks:', error);
        } finally {
            if (!isSilent) setLoading(false);
        }
    };

    useEffect(() => {
        fetchFeedbacks();
    }, []);

    const filteredFeedbacks = Array.isArray(feedbacks) ? feedbacks.filter(fb => {
        const nameMatch = (fb.user?.name?.toLowerCase() || '').includes(searchTerm.toLowerCase());
        const messageMatch = (fb.message?.toLowerCase() || '').includes(searchTerm.toLowerCase());
        const matchesSearch = nameMatch || messageMatch;
        const matchesRole = roleFilter === 'All' || fb.role === roleFilter;
        return matchesSearch && matchesRole;
    }) : [];

    const handleDeleteClick = (fb) => {
        setDeleteModal({
            isOpen: true,
            feedbackId: fb.id,
            userName: fb.user?.name || 'Unknown User'
        });
    };

    const confirmDelete = async () => {
        if (!deleteModal.feedbackId) return;

        setIsDeleting(true);
        try {
            await axiosClient.delete(`/api/admin/feedbacks/${deleteModal.feedbackId}`);
            setFeedbacks(feedbacks.filter(fb => fb.id !== deleteModal.feedbackId));
            setDeleteModal({ isOpen: false, feedbackId: null, userName: '' });
        } catch (error) {
            console.error('Error deleting feedback:', error);
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className="admin-feedback-page admin-feedback-scope">
            <div className="page-header mb-8">
                <div className="header-text">
                    <h1 className="text-2xl font-bold">Feedback Management</h1>
                    <p className="text-muted">Monitor and manage user and institute feedback</p>
                </div>
            </div>

            <div className="admin-glass-card table-container">
                <div className="table-controls p-6">
                    <div className="search-box">
                        <Search size={18} className="search-icon" />
                        <input
                            type="text"
                            placeholder="Search by user or message..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="filter-box">
                        <Filter size={18} className="filter-icon" />
                        <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="feedback-filter-select">
                            <option value="All">All Roles</option>
                            <option value="User">Students/Users</option>
                            <option value="Institute">Institutes</option>
                        </select>
                    </div>
                </div>

                <div className="responsive-table">
                    <table>
                        <thead>
                            <tr>
                                <th>User</th>
                                <th>Role</th>
                                <th>Rating</th>
                                <th style={{ width: '40%' }}>Message</th>
                                <th>Date</th>
                                <th className="text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="text-center p-12">
                                        <div className="loader mx-auto mb-4"></div>
                                        <p className="text-muted">Fetching feedbacks...</p>
                                    </td>
                                </tr>
                            ) : filteredFeedbacks.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="text-center p-12">
                                        <p className="text-muted">No feedbacks found.</p>
                                    </td>
                                </tr>
                            ) : (
                                filteredFeedbacks.map((fb) => (
                                    <tr key={fb.id}>
                                        <td>
                                            <div className="user-cell">
                                                <div className="user-avatar-sm">
                                                    {fb.role === 'Institute' ? <Building2 size={16} /> : <User size={16} />}
                                                </div>
                                                <div className="user-meta">
                                                    <span className="user-name-text">{fb.user?.name || 'Unknown'}</span>
                                                    <span className="user-email-text">{fb.user?.email || 'No email'}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <span className={`role-badge ${fb.role.toLowerCase()}`}>
                                                {fb.role}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="rating-display">
                                                <Star size={14} className="star-icon filled" />
                                                <span className="rating-value">{fb.rating}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <p className="feedback-message-text" title={fb.message}>
                                                {fb.message || <span className="text-muted italic">No comment provided</span>}
                                            </p>
                                        </td>
                                        <td>{new Date(fb.created_at).toLocaleDateString()}</td>
                                        <td>
                                            <div className="actions-cell">
                                                <button
                                                    className="icon-btn delete"
                                                    title="Delete Feedback"
                                                    onClick={() => handleDeleteClick(fb)}
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <ActionConfirmModal
                isOpen={deleteModal.isOpen}
                onClose={() => setDeleteModal({ isOpen: false, feedbackId: null, userName: '' })}
                onConfirm={confirmDelete}
                isProcessing={isDeleting}
                title="Delete Feedback"
                message={`Are you sure you want to delete feedback from ${deleteModal.userName}? This action cannot be undone.`}
                confirmText="Yes, Delete"
                cancelText="Cancel"
                type="danger"
            />
        </div>
    );
};

export default AdminFeedback;
