import React, { useEffect, useState } from 'react';
import axiosClient from '../../lib/axios';
import { Star, Flag, MessageSquare, User } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import './RatingsPage.css';

const RatingsPage = () => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchReviews = async () => {
            try {
                const { data } = await axiosClient.get('/api/institute/analytics/ratings');
                setReviews(data);
            } catch (error) {
                console.error('Error fetching reviews:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchReviews();
    }, []);

    const handleReport = async (id) => {
        if (!window.confirm('Report this review as inappropriate?')) return;
        try {
            await axiosClient.post(`/api/institute/ratings/${id}/report`);
            alert('Review reported to administrators.');
        } catch (error) {
            console.error('Error reporting review:', error);
        }
    };

    return (
        <div id="analytics-ratings-page">
            <div className="page-header">
                <h1 className="page-title">Student Reviews</h1>
                <p className="page-subtitle">Understand student sentiment.</p>
            </div>

            {loading ? (
                <div className="ratings-loading-grid">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="skeleton-review"></div>
                    ))}
                </div>
            ) : reviews.length > 0 ? (
                <div className="ratings-grid">
                    <AnimatePresence>
                        {reviews.map((review, i) => (
                            <motion.div
                                key={review.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.05 }}
                                className="review-card"
                            >
                                <div className="review-header">
                                    <div className="reviewer-info">
                                        <div className="reviewer-avatar-placeholder">
                                            <User size={20} />
                                        </div>
                                        <div className="reviewer-details">
                                            <span className="reviewer-name">
                                                {review.student_name || 'Anonymous Student'}
                                            </span>
                                            <span className="review-date">
                                                {new Date(review.created_at).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="review-stars">
                                        {[...Array(5)].map((_, idx) => (
                                            <Star
                                                key={idx}
                                                size={16}
                                                className={`star-icon ${idx < review.rating ? 'star-filled' : 'star-empty'}`}
                                            />
                                        ))}
                                    </div>
                                </div>

                                <p className="review-content">
                                    {review.comment || (
                                        <span className="italic text-slate-400">No written comment provided.</span>
                                    )}
                                </p>

                                <div className="review-actions">
                                    <button
                                        onClick={() => handleReport(review.id)}
                                        className="report-btn"
                                    >
                                        <Flag size={14} />
                                        Report
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            ) : (
                <div className="empty-state">
                    <MessageSquare size={48} className="empty-icon" />
                    <p className="empty-text">No reviews received yet.</p>
                </div>
            )}
        </div>
    );
};

export default RatingsPage;
