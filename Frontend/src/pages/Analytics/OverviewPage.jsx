import React, { useEffect, useState } from 'react';
import axiosClient from '../../lib/axios';
import StatCard from '../../components/Analytics/StatCard';
import PeriodFilter from '../../components/Analytics/PeriodFilter';
import PerformanceSummary from '../../components/Analytics/PerformanceSummary';
import ConversionMetrics from '../../components/Analytics/ConversionMetrics';
import InsightsBox from '../../components/Analytics/InsightsBox';
import { Eye, FileText, Calendar, Users, Briefcase, Star, BookOpen } from 'lucide-react';
import { motion } from 'framer-motion';
import './OverviewPage.css';

const OverviewPage = () => {
    const [period, setPeriod] = useState(30);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isUpdating, setIsUpdating] = useState(false);

    useEffect(() => {
        const fetchStats = async () => {
            if (!stats) {
                setLoading(true);
            } else {
                setIsUpdating(true);
            }

            try {
                const { data } = await axiosClient.get(`/api/institute/analytics/overview?period=${period}`);
                setStats(data.overviewStats);
            } catch (error) {
                console.error('Error fetching overview stats:', error);
            } finally {
                setLoading(false);
                setIsUpdating(false);
            }
        };

        fetchStats();
    }, [period]);

    if (loading && !stats) {
        return (
            <div id="analytics-overview-page">
                <div className="overview-header">
                    <div className="skeleton-loader" style={{ width: '200px', height: '40px' }}></div>
                </div>
                <div className="skeleton-loader" style={{ height: '200px', marginBottom: '2rem' }}></div>
                <div className="overview-grid">
                    {[...Array(8)].map((_, i) => (
                        <div key={i} className="skeleton-loader" style={{ height: '150px' }}></div>
                    ))}
                </div>
            </div>
        );
    }

    if (!stats) {
        return (
            <div className="error-state">
                <p>Failed to load analytics data. Please try again later.</p>
            </div>
        );
    }

    const { metrics, conversion, content_health, performance_summary, insights } = stats;

    // Determine CTA message based on growth
    const hasPositiveGrowth = metrics.post_views_change > 0 || metrics.followers_change > 0;
    const ctaMessage = hasPositiveGrowth
        ? "Your institute is growing well. Check trends for deeper insights."
        : "Engagement needs attention. Review trends to improve performance.";

    const sections = [
        {
            title: 'Visibility',
            items: [
                {
                    label: 'Profile Views',
                    value: metrics.profile_views,
                    change: metrics.profile_views_change,
                    icon: Eye,
                    color: 'blue'
                },
                {
                    label: 'Post Views',
                    value: metrics.post_views,
                    change: metrics.post_views_change,
                    icon: FileText,
                    color: 'blue'
                },
                {
                    label: 'Event Views',
                    value: metrics.event_views,
                    change: metrics.event_views_change,
                    icon: Calendar,
                    color: 'blue'
                },
            ]
        },
        {
            title: 'Engagement',
            items: [
                {
                    label: 'New Followers',
                    value: metrics.followers,
                    change: metrics.followers_change,
                    icon: Users,
                    color: 'purple'
                },
                {
                    label: 'Applications',
                    value: metrics.course_applications,
                    change: metrics.course_applications_change,
                    icon: Briefcase,
                    color: 'purple'
                },
                {
                    label: 'Reviews Received',
                    value: metrics.reviews_count,
                    icon: Star,
                    color: 'purple'
                },
            ]
        },
        {
            title: 'Content & Reputation',
            items: [
                {
                    label: 'Active Courses',
                    value: content_health.active_courses,
                    icon: BookOpen,
                    color: 'green'
                },
                {
                    label: 'Average Rating',
                    value: metrics.average_rating,
                    change: metrics.rating_change,
                    icon: Star,
                    color: 'yellow'
                },
            ]
        }
    ];

    return (
        <div id="analytics-overview-page" className={isUpdating ? 'updating' : ''}>
            {/* Period Filter */}
            <div className="overview-header">
                <div>
                    <h1 className="overview-page-title">Analytics Overview</h1>
                    <p className="overview-page-subtitle">Track your institute's performance</p>
                </div>
                <PeriodFilter period={period} setPeriod={setPeriod} />
            </div>

            {/* Performance Summary */}
            <PerformanceSummary summary={performance_summary} />

            {/* KPI Sections */}
            {sections.map((section, idx) => (
                <div key={idx} className="overview-section">
                    <h2 className="overview-section-title">{section.title}</h2>
                    <div className="overview-grid">
                        {section.items.map((item, i) => (
                            <StatCard
                                key={i}
                                icon={item.icon}
                                label={item.label}
                                value={item.value}
                                change={item.change}
                                color={item.color}
                                delay={i * 0.1}
                            />
                        ))}
                    </div>
                </div>
            ))}

            {/* Conversion & Health Metrics */}
            <ConversionMetrics conversion={conversion} contentHealth={content_health} />

            {/* Insights */}
            <InsightsBox insights={insights} />

            {/* Dynamic CTA */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className={`overview-cta ${hasPositiveGrowth ? 'positive' : 'negative'}`}
            >
                <h3 className="cta-title">
                    {hasPositiveGrowth ? '🎉 Great Performance!' : '📊 Room for Improvement'}
                </h3>
                <p className="cta-text">{ctaMessage}</p>
                <a href="/analytics/trends" className="cta-button">
                    View Detailed Trends
                </a>
            </motion.div>
        </div>
    );
};

export default OverviewPage;
