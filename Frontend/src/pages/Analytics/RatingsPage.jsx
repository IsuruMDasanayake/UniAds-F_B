import React, { useEffect, useState, useCallback } from 'react';
import axiosClient from '../../lib/axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Flag, MessageSquare, User, AlertTriangle, RefreshCw } from 'lucide-react';

// Components
import DataTable from '../../components/Analytics/DataTable';
import RatingsStatCards from '../../components/Analytics/RatingsStatCards';
import RatingsTableCard from '../../components/Analytics/RatingsTableCard';
import SkeletonTable from '../../components/Analytics/SkeletonTable';
import EmptyState from '../../components/Analytics/EmptyState';

// Modals
import ReportRatingModal from '../../components/Modals/ReportRatingModal';
import { getStorageUrl } from '../../lib/config';
import './RatingsPage.css';

const RatingsAnalyticsPage = () => {
    const [reviews, setReviews] = useState([]);
    const [stats, setStats] = useState(null);
    const [distribution, setDistribution] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isUpdating, setIsUpdating] = useState(false);

    // Filters & Pagination
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [rating, setRating] = useState('all');
    const [reported, setReported] = useState('all');
    const [sort, setSort] = useState('newest');
    const [pagination, setPagination] = useState({});

    // Modal States
    const [reportingId, setReportingId] = useState(null);
    const [isReporting, setIsReporting] = useState(false);

    const fetchRatings = useCallback(async (isInitial = false) => {
        if (isInitial) setLoading(true);
        else setIsUpdating(true);

        try {
            const { data } = await axiosClient.get('/api/institute/analytics/ratings', {
                params: { page, search, rating, reported, sort }
            });

            setReviews(data.ratings.data || []);
            setStats(data.stats);
            setDistribution(data.distribution);
            setPagination({
                current_page: data.ratings.current_page,
                last_page: data.ratings.last_page,
                total: data.ratings.total,
                from: data.ratings.from,
                to: data.ratings.to
            });
        } catch (error) {
            console.error('Error fetching ratings:', error);
        } finally {
            setLoading(false);
            setIsUpdating(false);
        }
    }, [page, search, rating, reported, sort]);

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchRatings(!reviews.length);
        }, search ? 500 : 0);
        return () => clearTimeout(timer);
    }, [search, rating, reported, sort, page, fetchRatings]);

    const handleReportSubmit = async (reason) => {
        setIsReporting(true);
        try {
            await axiosClient.post(`/api/institute/ratings/${reportingId}/report`, { reason });
            setReportingId(null);
            fetchRatings();
        } catch (error) {
            console.error('Error reporting review:', error);
        } finally {
            setIsReporting(false);
        }
    };

    const columns = [
        {
            header: 'Student',
            accessor: 'user',
            render: (row) => {
                const user = row.user || {};
                const name = user.name || 'User';
                const initialsUrl = `https://api.dicebear.com/7.x/initials/svg?seed=${name}&backgroundColor=ffc107`;
                const avatarSrc = user?.profile_picture
                    ? getStorageUrl(user.profile_picture)
                    : initialsUrl;

                return (
                    <div className="student-cell-v2">
                        <div className="student-avatar-v2">
                            <img
                                src={avatarSrc}
                                alt="Profile"
                                onError={(e) => {
                                    if (e.target.src !== initialsUrl) {
                                        e.target.src = initialsUrl;
                                    }
                                }}
                            />
                        </div>
                        <div className="student-info-v2">
                            <span className="student-name">{user?.name || 'Anonymous Student'}</span>
                            <span className="student-email">{user.email || 'N/A'}</span>
                        </div>
                    </div>
                );
            }
        },
        {
            header: 'Rating',
            accessor: 'rating',
            render: (row) => {
                const val = row.rating;
                return (
                    <div className="rating-cell-v2">
                        <div className="stars-mini">
                            {[...Array(5)].map((_, i) => (
                                <Star
                                    key={i}
                                    size={14}
                                    className={i < val ? 'star-filled' : 'star-empty'}
                                />
                            ))}
                        </div>
                        <span className="rating-value">{val}.0</span>
                    </div>
                );
            }
        },
        {
            header: 'Comment',
            accessor: 'comment',
            render: (row) => {
                const comment = row.comment;
                return (
                    <div className="comment-cell-v2" title={comment}>
                        {comment ? (
                            <span className="comment-text">{comment}</span>
                        ) : (
                            <span className="no-comment">No comment provided</span>
                        )}
                    </div>
                );
            }
        },
        {
            header: 'Posted At',
            accessor: 'created_at',
            render: (row) => (
                <div className="date-cell-v2">
                    {new Date(row.created_at).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                    })}
                </div>
            )
        },
        {
            header: 'Status',
            accessor: 'is_reported',
            render: (row) => (
                <div className="status-cell-v2">
                    {row.is_reported ? (
                        <div className="report-badge" title={row.report_reason}>
                            <AlertTriangle size={12} />
                            Reported
                        </div>
                    ) : (
                        <span className="text-muted text-xs">—</span>
                    )}
                </div>
            )
        },
        {
            header: 'Action',
            accessor: 'id',
            className: 'text-right',
            render: (row) => (
                <div className="actions-cell-v2">
                    {!row.is_reported ? (
                        <button
                            className="action-btn-v2 report"
                            title="Report Review"
                            onClick={(e) => {
                                e.stopPropagation();
                                setReportingId(row.id);
                            }}
                        >
                            <Flag size={16} />
                        </button>
                    ) : (
                        <div className="reported-status-icon" title="Reported">
                            <Flag size={16} className="text-red-500 opacity-50" />
                        </div>
                    )}
                </div>
            )
        }
    ];

    return (
        <div id="analytics-ratings-v2" className={isUpdating ? 'updating' : ''}>
            {/* Page Header */}
            <div className={`page-header-card-v2 ${isUpdating ? 'updating' : ''}`}>
                <div className="header-content-v2">
                    <div className="header-left-v2">
                        <h1 className="page-title-v2">Student Reviews & Ratings</h1>
                        <p className="page-subtitle-v2">Monitor student feedback and manage reported reviews</p>
                    </div>
                    {isUpdating && (
                        <div className="updating-loader-v2">
                            <RefreshCw className="animate-spin" size={20} />
                        </div>
                    )}
                </div>
            </div>

            {/* Stats Row */}
            <RatingsStatCards stats={stats} loading={loading} />

            <div className="main-section-v2">
                <RatingsTableCard
                    distribution={distribution}
                    loading={loading}
                    isUpdating={isUpdating}
                    search={search}
                    setSearch={setSearch}
                    rating={rating}
                    setRating={setRating}
                    reported={reported}
                    setReported={setReported}
                    sort={sort}
                    setSort={setSort}
                >
                    {loading ? (
                        <SkeletonTable columns={6} rows={5} />
                    ) : (
                        <div className="table-responsive-wrapper">
                            {reviews.length > 0 ? (
                                <DataTable
                                    columns={columns}
                                    data={reviews}
                                    pagination={pagination}
                                    onPageChange={setPage}
                                    loading={isUpdating}
                                    showSearch={false}
                                />
                            ) : (
                                <EmptyState
                                    icon={MessageSquare}
                                    title="No reviews found"
                                    subtitle={search || rating !== 'all' || reported !== 'all' ? "Try adjusting your filters to find what you're looking for." : "Student reviews will appear here once they start rating your institute."}
                                />
                            )}
                        </div>
                    )}
                </RatingsTableCard>
            </div>

            {/* Modals */}
            <ReportRatingModal
                isOpen={!!reportingId}
                onClose={() => setReportingId(null)}
                onConfirm={handleReportSubmit}
                loading={isReporting}
            />
        </div>
    );
};

export default RatingsAnalyticsPage;
