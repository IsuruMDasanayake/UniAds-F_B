import React, { useState, useEffect } from 'react';
import {
    Search,
    Star,
    Trash2,
    MessageCircle,
    User,
    Building2,
    AlertTriangle,
    Filter,
    X
} from 'lucide-react';
import ActionConfirmModal from '../../components/Modals/ActionConfirmModal';
import axiosClient from '../../lib/axios';
import './RatingManagement.css';

const RatingManagement = () => {
    const stripHtml = (html) => {
        if (!html) return '';
        return html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ');
    };

    const [ratings, setRatings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [institutes, setInstitutes] = useState([]);
    const [selectedInstitute, setSelectedInstitute] = useState('all');

    // Deletion Modal State
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [ratingToDelete, setRatingToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const fetchRatings = async (isSilent = false) => {
        try {
            if (!isSilent) setLoading(true);
            const response = await axiosClient.get('/api/admin/ratings');
            const payload = response.data.data;
            const fetchedRatings = Array.isArray(payload) ? payload : (payload?.data || []);
            setRatings(fetchedRatings);

            // Extract unique institutes from the ratings for the filter dropdown
            const uniqueInstitutes = [];
            const instIds = new Set();
            fetchedRatings.forEach(r => {
                if (r.institute && !instIds.has(r.institute.id)) {
                    instIds.add(r.institute.id);
                    uniqueInstitutes.push(r.institute);
                }
            });
            setInstitutes(uniqueInstitutes);

        } catch (error) {
            console.error('Error fetching ratings:', error);
        } finally {
            if (!isSilent) setLoading(false);
        }
    };

    useEffect(() => {
        fetchRatings();

        const intervalId = setInterval(() => fetchRatings(true), 30000);
        return () => clearInterval(intervalId);
    }, []);

    const handleDeleteClick = (id) => {
        setRatingToDelete(id);
        setDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        try {
            setIsDeleting(true);
            await axiosClient.delete(`/api/admin/ratings/${ratingToDelete}`);
            setRatings(ratings.filter(r => r.id !== ratingToDelete));
            setDeleteModalOpen(false);
        } catch (error) {
            console.error('Error deleting rating:', error);
        } finally {
            setIsDeleting(false);
            setRatingToDelete(null);
        }
    };

    const filteredRatings = ratings
        .filter(r => {
            const matchesSearch = (r.user?.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                (r.institute?.institute_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                (r.comment?.toLowerCase() || '').includes(searchTerm.toLowerCase());

            const matchesInstitute = selectedInstitute === 'all' || r.institute_id === parseInt(selectedInstitute);

            return matchesSearch && matchesInstitute;
        })
        .sort((a, b) => {
            if (b.is_reported !== a.is_reported) {
                return b.is_reported ? 1 : -1;
            }
            return new Date(b.created_at) - new Date(a.created_at);
        });

    const renderStars = (rating) => {
        return Array(5).fill(0).map((_, i) => (
            <Star
                key={i}
                size={14}
                fill={i < rating ? "#f59e0b" : "none"}
                color={i < rating ? "#f59e0b" : "#94a3b8"}
            />
        ));
    };

    return (
        <div className="rating-management-page admin-rating-scope">
            <div className="page-header mb-8">
                <div className="header-text">
                    <h1 className="text-2xl font-bold">Rating & Reviews</h1>
                    <p className="text-muted">Monitor feedback and moderate platform reviews</p>
                </div>
            </div>

            <div className="table-controls p-0 mb-6 bg-transparent border-0 flex justify-between items-center gap-4">
                <div className="search-box flex-1 max-w-md">
                    <Search size={18} className="search-icon" />
                    <input
                        type="text"
                        placeholder="Search by user, institute or comment..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="filter-box">
                    <Filter size={18} className="filter-icon" />
                    <select
                        className="admin-select"
                        value={selectedInstitute}
                        onChange={(e) => setSelectedInstitute(e.target.value)}
                    >
                        <option value="all">All Institutes</option>
                        {institutes.map(inst => (
                            <option key={inst.id} value={inst.id}>{inst.institute_name}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="admin-glass-card table-container">
                <div className="responsive-table">
                    <table>
                        <thead>
                            <tr>
                                <th>User</th>
                                <th>Rating</th>
                                <th>Comment</th>
                                <th>Institute</th>
                                <th>Posted At</th>
                                <th>Reason</th>
                                <th className="text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="8" className="text-center p-12">
                                        <div className="loader mx-auto mb-4"></div>
                                        <p className="text-muted">Loading ratings...</p>
                                    </td>
                                </tr>
                            ) : filteredRatings.length === 0 ? (
                                <tr>
                                    <td colSpan="8" className="text-center p-12">
                                        <p className="text-muted">No ratings found.</p>
                                    </td>
                                </tr>
                            ) : (
                                filteredRatings.map((rating) => (
                                    <tr key={rating.id}>
                                        <td>
                                            <div className="user-info-sm">
                                                <span>{rating.user?.name || 'Anonymous'}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="stars-wrapper">
                                                {renderStars(rating.rating)}
                                            </div>
                                        </td>
                                        <td>
                                            <div className="comment-cell" title={stripHtml(rating.comment)}>
                                                {stripHtml(rating.comment) || <span className="text-muted italic">No comment provided</span>}
                                            </div>
                                        </td>
                                        <td>
                                            <div className="inst-info-sm">
                                                <span>{rating.institute?.institute_name || '-'}</span>
                                            </div>
                                        </td>
                                        <td>{rating.created_at ? new Date(rating.created_at).toLocaleString('en-US', {
                                            month: 'short',
                                            day: 'numeric',
                                            year: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit',
                                            hour12: true
                                        }) : '-'}</td>
                                        <td>
                                            <span className={rating.is_reported ? 'reason-reported' : 'reason-none'}>
                                                {rating.report_reason || '—'}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="actions-cell">
                                                <button
                                                    className={`icon-btn delete ${!rating.is_reported ? 'disabled' : ''}`}
                                                    title={rating.is_reported ? "Remove Review" : "Only reported reviews can be deleted"}
                                                    onClick={() => rating.is_reported && handleDeleteClick(rating.id)}
                                                    disabled={!rating.is_reported}
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
                isOpen={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                isProcessing={isDeleting}
                title="Delete Reported Review"
                message="Are you sure you want to permanently delete this reported review? This action cannot be undone."
                confirmText="Yes, Delete Review"
                type="danger"
            />
        </div>
    );
};

export default RatingManagement;
