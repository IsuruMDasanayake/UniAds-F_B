import React, { useEffect, useState } from 'react';
import axiosClient from '../../lib/axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, FileText, Calendar, Users, Briefcase, Heart, Star, CalendarCheck, CalendarX } from 'lucide-react';

// Components
import StatCard from '../../components/Analytics/StatCard';
import LineChart from '../../components/Analytics/LineChart';
import ChartCard from '../../components/Analytics/ChartCard';
import TrendsHeader from '../../components/Analytics/TrendsHeader';
import DemographicCharts from '../../components/Analytics/DemographicCharts';
import TrendsInsights from '../../components/Analytics/TrendsInsights';

// Styling
import './TrendsPage.css';

const TrendsPage = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isUpdating, setIsUpdating] = useState(false);

    // Filters
    const [range, setRange] = useState('30');
    const [compare, setCompare] = useState(false);

    useEffect(() => {
        const fetchTrends = async (isSilent = false) => {
            if (!data) setLoading(true);
            else if (!isSilent) setIsUpdating(true);

            try {
                const response = await axiosClient.get(`/api/institute/analytics/trends?range=${range}&compare=${compare}`);
                setData(response.data);
            } catch (error) {
                console.error('Error fetching trends v2:', error);
            } finally {
                setLoading(false);
                setIsUpdating(false);
            }
        };

        fetchTrends();

        // Polling every 60 seconds
        const intervalId = setInterval(() => {
            fetchTrends(true);
        }, 60000);

        return () => clearInterval(intervalId);
    }, [range, compare, data === null]);

    // Unified loading state
    const isInitialLoading = loading && !data;

    // Destructure with defaults
    const {
        totals = {
            postViews: { value: 0, change: 0 },
            eventViews: { value: 0, change: 0 },
            profileViews: { value: 0, change: 0 },
            applications: { value: 0, change: 0 },
            followers: { value: 0, change: 0 },
            postLikes: { value: 0, change: 0 }
        },

        postViews = { labels: [], data: [] },
        eventViews = { labels: [], data: [] },
        profileViews = { labels: [], data: [] },
        applications = { labels: [], data: [] },
        followers = { labels: [], data: [] },
        postLikes = { labels: [], data: [] },
        eventInterests = { labels: [], data: [] },
        eventDeclines = { labels: [], data: [] },
        ratings = { labels: [], data: [] },
        demographics = {},
        summary = {},
        insights = []
    } = data || {};

    // Helper for multi-dataset charts - Memoize to prevent chart re-renders
    const trafficDatasets = React.useMemo(() => {
        const sets = [
            { label: 'Post Views', data: postViews.data, borderColor: '#3b82f6', backgroundColor: 'transparent' },
            { label: 'Event Views', data: eventViews.data, borderColor: '#10b981', backgroundColor: 'transparent' },
            { label: 'Profile Views', data: profileViews.data, borderColor: '#8b5cf6', backgroundColor: 'transparent' }
        ];

        if (compare) {
            if (postViews.previous_data) sets.push({ label: 'Prev Posts', data: postViews.previous_data, borderColor: '#3b82f640', borderDash: [5, 5], pointRadius: 0 });
            if (eventViews.previous_data) sets.push({ label: 'Prev Events', data: eventViews.previous_data, borderColor: '#10b98140', borderDash: [5, 5], pointRadius: 0 });
        }

        return sets;
    }, [postViews, eventViews, profileViews, compare]);

    const postEngagementDatasets = React.useMemo(() => {
        const sets = [
            { label: 'Post Views', data: postViews.data, borderColor: '#3b82f6', backgroundColor: 'transparent' },
            { label: 'Post Likes', data: postLikes.data, borderColor: '#ef4444', backgroundColor: 'transparent' }
        ];

        if (compare) {
            if (postViews.previous_data) sets.push({ label: 'Prev Views', data: postViews.previous_data, borderColor: '#3b82f640', borderDash: [5, 5], pointRadius: 0 });
            if (postLikes.previous_data) sets.push({ label: 'Prev Likes', data: postLikes.previous_data, borderColor: '#ef444440', borderDash: [5, 5], pointRadius: 0 });
        }

        return sets;
    }, [postViews, postLikes, compare]);

    const eventEngagementDatasets = React.useMemo(() => {
        const sets = [
            { label: 'Event Views', data: eventViews.data, borderColor: '#3b82f6', backgroundColor: 'transparent' },
            { label: 'Interests', data: eventInterests.data, borderColor: '#10b981', backgroundColor: 'transparent' },
            { label: 'Declines', data: eventDeclines.data, borderColor: '#ef4444', backgroundColor: 'transparent' }
        ];

        if (compare) {
            if (eventViews.previous_data) sets.push({ label: 'Prev Views', data: eventViews.previous_data, borderColor: '#3b82f640', borderDash: [5, 5], pointRadius: 0 });
            if (eventInterests.previous_data) sets.push({ label: 'Prev Int.', data: eventInterests.previous_data, borderColor: '#10b98140', borderDash: [5, 5], pointRadius: 0 });
            if (eventDeclines.previous_data) sets.push({ label: 'Prev Dec.', data: eventDeclines.previous_data, borderColor: '#ef444440', borderDash: [5, 5], pointRadius: 0 });
        }

        return sets;
    }, [eventViews, eventInterests, eventDeclines, compare]);

    const getSingleDataset = React.useCallback((metricData, label, color) => {
        const sets = [{
            label,
            data: metricData.data,
            borderColor: color,
            backgroundColor: (context) => {
                const ctx = context.chart.ctx;
                const gradient = ctx.createLinearGradient(0, 0, 0, 300);
                gradient.addColorStop(0, `${color}40`);
                gradient.addColorStop(1, `${color}00`);
                return gradient;
            },
            fill: true
        }];

        if (compare && metricData.previous_data) {
            sets.push({
                label: `Prev ${range} Days`,
                data: metricData.previous_data,
                borderColor: '#cbd5e1',
                borderDash: [5, 5],
                pointRadius: 0,
                fill: false
            });
        }
        return sets;
    }, [compare, range]);

    return (
        <div id="analytics-trends-v2" className={isUpdating ? 'updating' : ''}>
            <TrendsHeader
                range={range}
                setRange={setRange}
                compare={compare}
                setCompare={setCompare}
                loading={isUpdating}
            />

            {/* Stat Cards Row */}
            <div className="stat-cards-row-v2">
                <StatCard icon={FileText} label="Post Views" value={totals.postViews.value} change={range === 'all' ? null : totals.postViews.change} color="blue" loading={isInitialLoading} />
                <StatCard icon={Heart} label="Post Likes" value={totals.postLikes.value} change={range === 'all' ? null : totals.postLikes.change} color="red" loading={isInitialLoading} />
                <StatCard icon={Briefcase} label="Applications" value={totals.applications.value} change={range === 'all' ? null : totals.applications.change} color="amber" loading={isInitialLoading} />
                <StatCard icon={Calendar} label="Event Views" value={totals.eventViews.value} change={range === 'all' ? null : totals.eventViews.change} color="red" loading={isInitialLoading} />
                <StatCard icon={CalendarCheck} label="Event Interests" value={totals.eventInterests?.value} change={range === 'all' ? null : totals.eventInterests?.change} color="green" loading={isInitialLoading} />
                <StatCard icon={CalendarX} label="Event Declines" value={totals.eventDeclines?.value} change={range === 'all' ? null : totals.eventDeclines?.change} color="red" loading={isInitialLoading} />
                <StatCard icon={Eye} label="Profile Views" value={totals.profileViews.value} change={range === 'all' ? null : totals.profileViews.change} color="blue" loading={isInitialLoading} />
                <StatCard icon={Users} label="Followers" value={totals.followers.value} change={range === 'all' ? null : totals.followers.change} color="red" loading={isInitialLoading} />
                <StatCard icon={Star} label="Ratings" value={totals.ratings?.value} change={range === 'all' ? null : totals.ratings?.change} color="yellow" loading={isInitialLoading} />

            </div>

            {/* Insights Section */}
            <TrendsInsights insights={insights} loading={isInitialLoading} style={{ marginBottom: '2rem' }} />

            {/* Main Traffic Overview */}
            <div className="main-section-v2">
                <ChartCard
                    title="Traffic Overview"
                    subtitle="Post, Event and Profile views compared"
                    loading={isInitialLoading}
                >
                    <div style={{ height: '400px' }}>
                        <LineChart
                            labels={postViews.labels}
                            datasets={trafficDatasets}
                            showLegend={true}
                        />
                    </div>
                </ChartCard>
            </div>



            {/* Detailed Grid */}
            <div className="charts-grid-v2">
                <ChartCard title="Post Engagement" loading={isInitialLoading}>
                    <div style={{ height: '300px' }}>
                        <LineChart
                            labels={postViews.labels}
                            datasets={postEngagementDatasets}
                        />
                    </div>
                </ChartCard>
                <ChartCard title="Profile Views" loading={isInitialLoading}>
                    <div style={{ height: '300px' }}>
                        <LineChart
                            labels={profileViews.labels}
                            datasets={getSingleDataset(profileViews, 'Profile Views', '#8b5cf6')}
                        />
                    </div>
                </ChartCard>
                <ChartCard title="Course Applications Trend" loading={isInitialLoading}>
                    <div style={{ height: '300px' }}>
                        <LineChart
                            labels={applications.labels}
                            datasets={getSingleDataset(applications, 'Applications', '#f59e0b')}
                        />
                    </div>
                </ChartCard>
                <ChartCard title="Followers Growth" loading={isInitialLoading}>
                    <div style={{ height: '300px' }}>
                        <LineChart
                            labels={followers.labels}
                            datasets={getSingleDataset(followers, 'Followers', '#8b5cf6')}
                        />
                    </div>
                </ChartCard>
                <ChartCard title="Event Engagement" loading={isInitialLoading}>
                    <div style={{ height: '300px' }}>
                        <LineChart
                            labels={eventInterests.labels}
                            datasets={eventEngagementDatasets}
                        />
                    </div>
                </ChartCard>
                <ChartCard title="Ratings Growth" loading={isInitialLoading}>
                    <div style={{ height: '300px' }}>
                        <LineChart
                            labels={ratings.labels}
                            datasets={getSingleDataset(ratings, 'New Ratings', '#eab308')}
                        />
                    </div>
                </ChartCard>
            </div>

            {/* Demographics */}
            <div className="overview-section-v2">
                <h2 className="section-title-v2">All Time User Demographics</h2>
                <DemographicCharts demographics={demographics} loading={isInitialLoading || isUpdating} />
            </div>
        </div >
    );
};

export default TrendsPage;
