import React, { useState, useEffect } from 'react';
import {
    Search,
    Star,
    Trash2,
    MessageCircle,
    User,
    Building2,
    AlertTriangle
} from 'lucide-react';
import axiosClient from '../../lib/axios';
import './RatingManagement.css';

const RatingManagement = () => {
    const [ratings, setRatings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchRatings();
    }, []);

    const fetchRatings = async () => {
        try {
            setLoading(true);
            const response = await axiosClient.get('/api/admin/ratings');
            setRatings(response.data);
        } catch (error) {
            console.error('Error fetching ratings:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to remove this rating?')) {
            try {
                await axiosClient.delete(`/api/admin/ratings/${id}`);
                setRatings(ratings.filter(r => r.id !== id));
            } catch (error) {
                console.error('Error deleting rating:', error);
            }
        }
    };

    const filteredRatings = ratings.filter(r =>
        (r.user?.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (r.institute?.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (r.comment?.toLowerCase() || '').includes(searchTerm.toLowerCase())
    );

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

            <div className="admin-glass-card table-container">
                <div className="table-controls p-6">
                    <div className="search-box">
                        <Search size={18} className="search-icon" />
                        <input
                            type="text"
                            placeholder="Search by user, institute or comment..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="responsive-table">
                    <table>
                        <thead>
                            <tr>
                                <th>User</th>
                                <th>Institute</th>
                                <th>Rating</th>
                                <th>Comment</th>
                                <th className="text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="text-center p-12">
                                        <div className="loader mx-auto mb-4"></div>
                                        <p className="text-muted">Loading ratings...</p>
                                    </td>
                                </tr>
                            ) : filteredRatings.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="text-center p-12">
                                        <p className="text-muted">No ratings found.</p>
                                    </td>
                                </tr>
                            ) : (
                                filteredRatings.map((rating) => (
                                    <tr key={rating.id}>
                                        <td>
                                            <div className="user-info-sm">
                                                <User size={14} className="text-muted" />
                                                <span>{rating.user?.name || 'Anonymous'}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="inst-info-sm">
                                                <Building2 size={14} className="text-muted" />
                                                <span>{rating.institute?.name || '-'}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="stars-wrapper">
                                                {renderStars(rating.rating)}
                                            </div>
                                        </td>
                                        <td>
                                            <div className="comment-cell" title={rating.comment}>
                                                {rating.comment || <span className="text-muted italic">No comment provided</span>}
                                            </div>
                                        </td>
                                        <td>
                                            <div className="actions-cell">
                                                <button
                                                    className="icon-btn delete"
                                                    title="Remove Review"
                                                    onClick={() => handleDelete(rating.id)}
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
        </div>
    );
};

export default RatingManagement;
