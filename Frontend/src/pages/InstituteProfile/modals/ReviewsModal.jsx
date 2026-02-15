import React, { useState, useEffect } from 'react';
import axiosClient from '../../../lib/axios';
import { Star, Trash2, MessageSquare, X, Send, Loader2, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import '../InstituteModals.css';

const DeleteConfirmationModal = ({ onConfirm, onCancel, title, message, isDeleting }) => (
    <div className="institute-modal-overlay confirmation-overlay" style={{ zIndex: 100000 }} onClick={onCancel}>
        <motion.div
            className="modal-content confirmation-modal"
            onClick={e => e.stopPropagation()}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
        >
            <div className="confirm-icon-box">
                <AlertTriangle size={40} />
            </div>
            <h3 className="confirm-title">{title || 'Delete Item?'}</h3>
            <p className="confirm-message">
                {message || 'Are you sure you want to delete this? This action cannot be undone.'}
            </p>
            <div className="confirm-actions">
                <button
                    className="btn btn-cancel"
                    onClick={onCancel}
                    disabled={isDeleting}
                >
                    Cancel
                </button>
                <button
                    className="btn btn-confirm-delete"
                    onClick={onConfirm}
                    disabled={isDeleting}
                >
                    {isDeleting ? <Loader2 className="animate-spin" size={20} /> : 'Delete Now'}
                </button>
            </div>
        </motion.div>
    </div>
);

const ReviewsModal = ({ institute, currentUser, onClose }) => {
    const [reviews, setReviews] = useState([]);
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [comment, setComment] = useState('');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);

    // Delete confirmation state
    const [reviewToDelete, setReviewToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        fetchReviews();
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [institute.id]);

    const fetchReviews = async () => {
        try {
            setLoading(true);
            const res = await axiosClient.get(`/api/institutes/${institute.id}/ratings`);
            setReviews(res.data);
            setError(null);
        } catch (error) {
            console.error("Failed to fetch reviews", error);
            setError("Failed to load reviews. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (rating === 0) {
            setError("Please select a rating.");
            return;
        }
        setSubmitting(true);
        setError(null);
        try {
            await axiosClient.post(`/api/institutes/${institute.id}/rate`, { rating, comment });
            setRating(0);
            setComment('');
            fetchReviews();
        } catch (error) {
            console.error("Failed to submit review", error);
            setError(error.response?.data?.message || "Failed to submit review.");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (!reviewToDelete) return;
        setIsDeleting(true);
        try {
            await axiosClient.delete(`/api/reviews/${reviewToDelete}`);
            setReviews(prev => prev.filter(r => r.id !== reviewToDelete));
            setReviewToDelete(null);
        } catch (error) {
            console.error("Failed to delete review", error);
            setError("Failed to delete review.");
        } finally {
            setIsDeleting(false);
        }
    };

    const getAvatarSrc = (user) => {
        if (user?.profile_picture) {
            const path = user.profile_picture;
            if (path.startsWith('http')) return path;
            return `http://localhost:8000/storage/${path}`;
        }
        // Fallback to DiceBear initials as seen in UserProfilePage.jsx
        return `https://api.dicebear.com/7.x/initials/svg?seed=${user?.name || 'User'}&backgroundColor=ffc107`;
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const canReview = currentUser && currentUser.role === 'User' && institute.reviews_enabled;

    return (
        <>
            <div className="institute-modal-overlay" onClick={onClose} id="reviews-modal">
                <motion.div
                    className="modal-content"
                    onClick={e => e.stopPropagation()}
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    transition={{ type: "spring", damping: 25, stiffness: 300 }}
                    style={{ maxWidth: '700px' }}
                >
                    <button className="modal-close-trigger" onClick={onClose}>
                        <X size={24} />
                    </button>

                    <div className="modal-header">
                        <h3 className="modal-title">Reviews & Ratings</h3>
                        {/* <p style={{ color: '#64748b', fontSize: '0.85rem', fontWeight: 500, marginTop: '4px' }}>
                            {institute.institute_name}
                        </p> */}
                    </div>

                    <div className="modal-body">
                        {error && (
                            <motion.div
                                className="error-summary"
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                style={{ marginBottom: '1.5rem' }}
                            >
                                <p>{error}</p>
                            </motion.div>
                        )}

                        <div className="reviews-container">
                            {canReview && (
                                <div className="rating-form-container" style={{ marginBottom: '2rem' }}>
                                    <h4 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '16px', color: '#0f172a' }}>
                                        Write a Review
                                    </h4>
                                    <form onSubmit={handleSubmit}>
                                        <div className="star-rating-input">
                                            {[1, 2, 3, 4, 5].map((num) => (
                                                <button
                                                    key={num}
                                                    type="button"
                                                    className={`star-btn ${(hoverRating || rating) >= num ? 'active' : ''}`}
                                                    onMouseEnter={() => setHoverRating(num)}
                                                    onMouseLeave={() => setHoverRating(0)}
                                                    onClick={() => setRating(num)}
                                                >
                                                    <Star
                                                        size={32}
                                                        fill={(hoverRating || rating) >= num ? "currentColor" : "none"}
                                                        strokeWidth={2}
                                                    />
                                                </button>
                                            ))}
                                            <span style={{ marginLeft: '12px', fontWeight: 700, color: '#64748b', fontSize: '1.2rem' }}>
                                                {rating > 0 ? `${rating}.0` : ''}
                                            </span>
                                        </div>

                                        <div className="form-group" style={{ marginBottom: '16px' }}>
                                            <textarea
                                                value={comment}
                                                onChange={e => setComment(e.target.value)}
                                                placeholder="Share your experience with this institute..."
                                                style={{ minHeight: '100px', resize: 'vertical' }}
                                                required
                                            />
                                        </div>

                                        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                            <button
                                                type="submit"
                                                className="btn btn-primary"
                                                disabled={submitting}
                                                style={{ width: 'auto', padding: '8px 16px', borderRadius: '12px', marginTop: '1rem' }}
                                            >
                                                {submitting ? (
                                                    <>
                                                        <Loader2 className="animate-spin" size={18} />
                                                        <span>Submitting...</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Send size={18} />
                                                        <span>Submit Review</span>
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            )}

                            <div className="reviews-list-section">
                                {loading ? (
                                    <div className="modal-loading-centered">
                                        <Loader2 className="animate-spin" size={40} />
                                        <p>Loading reviews...</p>
                                    </div>
                                ) : reviews.length === 0 ? (
                                    <div className="empty-reviews">
                                        <MessageSquare size={48} color="#cbd5e1" style={{ margin: '0 auto' }} />
                                        <p>No reviews yet. Be the first to share your thoughts!</p>
                                    </div>
                                ) : (
                                    <div className="reviews-list" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                        <AnimatePresence mode="popLayout">
                                            {reviews.map((review, index) => (
                                                <motion.div
                                                    key={review.id}
                                                    className="review-card"
                                                    layout
                                                    initial={{ opacity: 0, x: -20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: index * 0.05 }}
                                                >
                                                    <div className="review-header">
                                                        <div className="reviewer-info">
                                                            <img
                                                                src={getAvatarSrc(review.user)}
                                                                alt={review.user?.name}
                                                                className="reviewer-avatar"
                                                            />
                                                            <div>
                                                                <span className="reviewer-name">{review.user?.name || 'Anonymous'}</span>
                                                                <span className="review-date">{formatDate(review.created_at)}</span>
                                                            </div>
                                                        </div>
                                                        <div className="review-stars">
                                                            {[...Array(5)].map((_, i) => (
                                                                <Star
                                                                    key={i}
                                                                    size={14}
                                                                    fill={i < review.rating ? "currentColor" : "none"}
                                                                    strokeWidth={2}
                                                                />
                                                            ))}
                                                        </div>
                                                    </div>
                                                    <p className="review-comment">{review.comment}</p>

                                                    {(currentUser?.id === review.user_id || currentUser?.role === 'Admin') && (
                                                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px' }}>
                                                            <button
                                                                onClick={() => setReviewToDelete(review.id)}
                                                                className="delete-review-btn"
                                                            >
                                                                <Trash2 size={12} style={{ marginRight: '4px' }} />
                                                                Delete
                                                            </button>
                                                        </div>
                                                    )}
                                                </motion.div>
                                            ))}
                                        </AnimatePresence>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>

            <AnimatePresence>
                {reviewToDelete && (
                    <DeleteConfirmationModal
                        title="Delete Review?"
                        message="Are you sure you want to permanently delete this review? This action cannot be undone."
                        isDeleting={isDeleting}
                        onConfirm={handleDelete}
                        onCancel={() => setReviewToDelete(null)}
                    />
                )}
            </AnimatePresence>
        </>
    );
};

export default ReviewsModal;
