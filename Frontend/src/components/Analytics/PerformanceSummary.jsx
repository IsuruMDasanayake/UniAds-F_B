import React from 'react';
import { Award, Users, TrendingUp, Star } from 'lucide-react';
import PeriodFilter from './PeriodFilter';
import './PerformanceSummary.css';

const PerformanceSummary = ({ summary, period, setPeriod, isUpdating, loading = false }) => {
    if (loading || !summary) {
        return (
            <div className="analytics-performance-summary loading">
                <div className="summary-header">
                    <h3 className="summary-title">Performance Highlights</h3>
                    <div className="summary-filter-wrapper">
                        <PeriodFilter period={period} setPeriod={setPeriod} size="small" />
                    </div>
                </div>
                <div className="summary-grid">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="summary-card skeleton-card">
                            <div className="summary-icon skeleton-loader" style={{ width: '40px', height: '40px', borderRadius: '10px' }}></div>
                            <div className="summary-content">
                                <div className="skeleton-loader" style={{ width: '60px', height: '12px', marginBottom: '8px' }}></div>
                                <div className="skeleton-loader" style={{ width: '100px', height: '16px', marginBottom: '4px' }}></div>
                                <div className="skeleton-loader" style={{ width: '80px', height: '12px' }}></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    const { most_viewed_course, most_applied_course, followers_this_period, new_ratings } = summary;

    return (
        <div className={`analytics-performance-summary ${isUpdating ? 'updating' : ''}`}>
            <div className="summary-header">
                <h3 className="summary-title">Performance Highlights</h3>
                <div className="summary-filter-wrapper">
                    <span className="filter-label">Filter:</span>
                    <PeriodFilter period={period} setPeriod={setPeriod} size="small" />
                </div>
            </div>

            <div className="summary-grid">
                {most_viewed_course && (
                    <div className="summary-card">
                        <div className="summary-icon blue">
                            <Award size={20} />
                        </div>
                        <div className="summary-content">
                            <p className="summary-label">Top Course Views</p>
                            <h4 className="summary-value">{most_viewed_course.title}</h4>
                            <p className="summary-meta">{most_viewed_course.views} total views</p>
                        </div>
                    </div>
                )}

                {most_applied_course && (
                    <div className="summary-card">
                        <div className="summary-icon green">
                            <TrendingUp size={20} />
                        </div>
                        <div className="summary-content">
                            <p className="summary-label">Most Applied Course</p>
                            <h4 className="summary-value">{most_applied_course.title}</h4>
                            <p className="summary-meta">{most_applied_course.applications} in period</p>
                        </div>
                    </div>
                )}

                <div className="summary-card">
                    <div className="summary-icon red">
                        <Users size={20} />
                    </div>
                    <div className="summary-content">
                        <p className="summary-label">New Followers</p>
                        <h4 className="summary-value">{followers_this_period}</h4>
                        <p className="summary-meta">In selected period</p>
                    </div>
                </div>

                <div className="summary-card">
                    <div className="summary-icon yellow">
                        <Star size={20} />
                    </div>
                    <div className="summary-content">
                        <p className="summary-label">New Ratings</p>
                        <h4 className="summary-value">{summary.new_ratings || 0}</h4>
                        <p className="summary-meta">Received in period</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PerformanceSummary;
