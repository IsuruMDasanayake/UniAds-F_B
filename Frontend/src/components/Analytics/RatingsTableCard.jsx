import React from 'react';
import { Search, Filter, Star, ChevronDown, X } from 'lucide-react';

const RatingsTableCard = ({
    children,
    distribution,
    search,
    setSearch,
    rating,
    setRating,
    reported,
    setReported,
    sort,
    setSort,
    loading,
    isUpdating
}) => {
    const totalReviews = distribution ? Object.values(distribution).reduce((a, b) => a + b, 0) : 0;

    const getWidth = (count) => {
        if (!totalReviews) return '0%';
        return `${(count / totalReviews) * 100}%`;
    };

    return (
        <div className={`analytics-card-v2 posts-table-card ratings-table-card ${isUpdating ? 'updating' : ''}`}>
            <div className="card-header-v2">
                <div className="header-text-group">
                    <h2 className="card-title-v2">Reviews Table</h2>
                    <p className="card-subtitle-v2">Detailed student feedback and ratings</p>
                </div>

                <div className="header-actions-v2">
                    {/* Search Input */}
                    <div className="search-wrapper-v2">
                        <Search className="search-icon" size={18} />
                        <input
                            type="text"
                            placeholder="Search reviews..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="search-input-v2"
                        />
                        {search && (
                            <button
                                className="clear-search-btn"
                                onClick={() => setSearch('')}
                            >
                                <X size={14} />
                            </button>
                        )}
                    </div>

                    {/* Rating Filter */}
                    <div className="filter-wrapper-v2">
                        <Star className="filter-icon" size={18} />
                        <select
                            value={rating}
                            onChange={(e) => setRating(e.target.value)}
                            className="status-select-v2"
                        >
                            <option value="all">All Ratings</option>
                            <option value="5">5 Stars</option>
                            <option value="4">4 Stars</option>
                            <option value="3">3 Stars</option>
                            <option value="2">2 Stars</option>
                            <option value="1">1 Star</option>
                        </select>
                    </div>

                    {/* Reported Filter */}
                    <div className="filter-wrapper-v2">
                        <Filter className="filter-icon" size={18} />
                        <select
                            value={reported}
                            onChange={(e) => setReported(e.target.value)}
                            className="status-select-v2"
                        >
                            <option value="all">All Status</option>
                            <option value="true">Reported</option>
                            <option value="false">Not Reported</option>
                        </select>
                    </div>

                    {/* Sort Filter */}
                    <div className="filter-wrapper-v2 no-icon">
                        <select
                            value={sort}
                            onChange={(e) => setSort(e.target.value)}
                            className="status-select-v2 no-icon"
                        >
                            <option value="newest">Newest First</option>
                            <option value="oldest">Oldest First</option>
                            <option value="highest">Highest Rating</option>
                            <option value="lowest">Lowest Rating</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Distribution Bar (SaaS Touch) */}
            {!loading && distribution && (
                <div className="rating-distribution-v2">
                    {[5, 4, 3, 2, 1].map(stars => (
                        <div key={stars} className="dist-row">
                            <span className="dist-label">{stars}★</span>
                            <div className="dist-bar-bg">
                                <div
                                    className="dist-bar-fill"
                                    style={{
                                        width: getWidth(distribution[stars]),
                                        backgroundColor: stars >= 4 ? '#10b981' : (stars === 3 ? '#f59e0b' : '#ef4444')
                                    }}
                                ></div>
                            </div>
                            <span className="dist-count">{distribution[stars]}</span>
                        </div>
                    ))}
                </div>
            )}

            <div className="card-body-v2">
                {children}
            </div>
        </div>
    );
};

export default RatingsTableCard;
