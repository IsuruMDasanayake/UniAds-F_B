import React, { useEffect, useState } from 'react';
import axiosClient from '../../lib/axios';
import { useParams, Link } from 'react-router-dom';
import StatCard from '../../components/Analytics/StatCard';
import PeriodFilter from '../../components/Analytics/PeriodFilter';
import PerformanceSummary from '../../components/Analytics/PerformanceSummary';
import ConversionMetrics from '../../components/Analytics/ConversionMetrics';
import InsightsBox from '../../components/Analytics/InsightsBox';
import { Eye, FileText, Calendar, Users, Briefcase, Star, BookOpen, Heart, ThumbsUp } from 'lucide-react';
import { motion } from 'framer-motion';
import './OverviewPage.css';

const OverviewPage = () => {
    const { slug } = useParams();
    const [period, setPeriod] = useState(30);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isUpdating, setIsUpdating] = useState(false);

    useEffect(() => {
        const fetchStats = async (isSilent = false) => {
            if (!stats) {
                setLoading(true);
            } else if (!isSilent) {
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

        // Polling every 60 seconds
        const intervalId = setInterval(() => fetchStats(true), 60000);

        return () => clearInterval(intervalId);
    }, [period, stats === null]); // stats === null is a trick to only show loading once

    // Unified loading state for components
    const isInitialLoading = loading && !stats;

    if (isInitialLoading && false) { // Kept for reference but bypassed
        return null;
    }

    const {
        metrics = {},
        conversion = {},
        content_health = {},
        performance_summary = {},
        insights = [],
        cta = {}
    } = stats || {};

    const hasPositiveGrowth = cta?.hasPositiveGrowth || false;
    const ctaMessage = cta?.message || "Analyzing your performance data...";

    // Memoize static sections to prevent re-calculating on every render
    const sections = React.useMemo(() => [
        {
            title: 'Visibility',
            items: [
                {
                    label: 'Profile Views',
                    value: metrics.profile_views,
                    icon: Eye,
                    color: 'blue'
                },
                {
                    label: 'Post Views',
                    value: metrics.post_views,
                    icon: FileText,
                    color: 'blue'
                },
                {
                    label: 'Event Views',
                    value: metrics.event_views,
                    icon: Calendar,
                    color: 'blue'
                },
            ]
        },
        {
            title: 'Engagement',
            items: [
                {
                    label: 'Total Followers',
                    value: metrics.followers,
                    icon: Users,
                    color: 'red'
                },
                {
                    label: 'Total Posts Likes',
                    value: metrics.post_likes,
                    icon: Heart,
                    color: 'red'
                },
                {
                    label: 'Total Interest Count',
                    value: metrics.event_interests,
                    icon: ThumbsUp,
                    color: 'red'
                },
            ]
        },
        {
            title: 'Content & Reputation',
            items: [
                {
                    label: 'Total Applications',
                    value: metrics.course_applications,
                    icon: Briefcase,
                    color: 'yellow'
                },
                {
                    label: 'Active Courses',
                    value: content_health.active_courses,
                    icon: BookOpen,
                    color: 'green'
                },
                {
                    label: 'Total Ratings Count',
                    value: metrics.ratings_count,
                    icon: Star,
                    color: 'yellow'
                },
            ]
        }
    ], [metrics, content_health]);

    return (
        <div id="analytics-overview-page" className={isUpdating ? 'updating' : ''}>
            {/* Period Filter */}
            <div className="overview-header">
                <div>
                    <h1 className="overview-page-title">Analytics Overview</h1>
                    <p className="overview-page-subtitle">Historical performance of your institute</p>
                </div>
            </div>

            {/* Performance Summary (with internal filter) */}
            <PerformanceSummary
                summary={performance_summary}
                period={period}
                setPeriod={setPeriod}
                isUpdating={isUpdating}
                loading={isInitialLoading}
            />

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
                                color={item.color}
                                delay={i * 0.1}
                                loading={isInitialLoading}
                            />
                        ))}
                    </div>
                </div>
            ))}

            {/* Conversion & Health Metrics */}
            <ConversionMetrics
                conversion={conversion}
                contentHealth={content_health}
                loading={isInitialLoading}
            />

            {/* Insights */}
            <InsightsBox insights={insights} loading={isInitialLoading} />

            {/* Dynamic CTA */}
            {!isInitialLoading && (
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
                    <Link to={`/analytics/${slug}/trends`} className="cta-button">
                        View Detailed Trends
                    </Link>
                </motion.div>
            )}
        </div>
    );
};

export default OverviewPage;
