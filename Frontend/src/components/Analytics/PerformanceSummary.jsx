import React from 'react';
import { Award, Users, TrendingUp, Star } from 'lucide-react';
import './PerformanceSummary.css';

const PerformanceSummary = ({ summary }) => {
    if (!summary) return null;

    const { most_viewed_course, most_applied_course, followers_this_period, rating_change } = summary;

    return (
        <div className="analytics-performance-summary">
            <h3 className="summary-title">Performance Highlights</h3>
            <div className="summary-grid">
                {most_viewed_course && (
                    <div className="summary-card">
                        <div className="summary-icon blue">
                            <Award size={20} />
                        </div>
                        <div className="summary-content">
                            <p className="summary-label">Most Viewed Course</p>
                            <h4 className="summary-value">{most_viewed_course.title}</h4>
                            <p className="summary-meta">{most_viewed_course.views} views</p>
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
                            <p className="summary-meta">{most_applied_course.applications} applications</p>
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
                        <p className="summary-meta">This period</p>
                    </div>
                </div>

                <div className="summary-card">
                    <div className="summary-icon yellow">
                        <Star size={20} />
                    </div>
                    <div className="summary-content">
                        <p className="summary-label">Rating Change</p>
                        <h4 className={`summary-value ${rating_change >= 0 ? 'positive' : 'negative'}`}>
                            {rating_change >= 0 ? '+' : ''}{rating_change}
                        </h4>
                        <p className="summary-meta">Points</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PerformanceSummary;
