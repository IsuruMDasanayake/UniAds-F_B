import React, { useEffect, useState } from 'react';
import axiosClient from '../../lib/axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, FileText, Calendar, Users, Briefcase } from 'lucide-react';

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
        const fetchTrends = async () => {
            if (!data) setLoading(true);
            else setIsUpdating(true);

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
    }, [range, compare]);

    if (loading && !data) {
        return (
            <div id="analytics-trends-v2">
                <div className="trends-header-v2">
                    <div className="skeleton-loader" style={{ width: '200px', height: '40px' }}></div>
                </div>
                <div className="stat-cards-row-v2" style={{ marginBottom: '2rem' }}>
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="skeleton-loader" style={{ height: '120px' }}></div>
                    ))}
                </div>
                <div className="skeleton-loader" style={{ height: '400px', marginBottom: '2rem' }}></div>
                <div className="charts-grid-v2">
                    <div className="skeleton-loader" style={{ height: '350px' }}></div>
                    <div className="skeleton-loader" style={{ height: '350px' }}></div>
                </div>
            </div>
        );
    }

    const { totals, postViews, eventViews, profileViews, applications, followers, demographics, summary, insights } = data;

    // Helper for multi-dataset charts
    const getTrafficDatasets = () => {
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
    };

    const getSingleDataset = (metricData, label, color) => {
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
    };

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
                <StatCard icon={FileText} label="Post Views" value={totals.postViews.value} change={range === 'all' ? null : totals.postViews.change} color="blue" />
                <StatCard icon={Calendar} label="Event Views" value={totals.eventViews.value} change={range === 'all' ? null : totals.eventViews.change} color="green" />
                <StatCard icon={Briefcase} label="Applications" value={totals.applications.value} change={range === 'all' ? null : totals.applications.change} color="amber" />
                <StatCard icon={Users} label="Total Followers" value={totals.followers.value} change={range === 'all' ? null : totals.followers.change} color="red" />
                <StatCard icon={Eye} label="Profile Views" value={totals.profileViews.value} change={range === 'all' ? null : totals.profileViews.change} color="white" />
            </div>

            {/* Insights Section */}
            <TrendsInsights insights={insights} style={{ marginBottom: '2rem' }} />

            {/* Main Traffic Overview */}
            <div className="main-section-v2">
                <ChartCard title="Traffic Overview" subtitle="Post, Event and Profile views compared">
                    <div style={{ height: '400px' }}>
                        <LineChart
                            labels={postViews.labels}
                            datasets={getTrafficDatasets()}
                            showLegend={true}
                        />
                    </div>
                </ChartCard>
            </div>

            {/* Detailed Grid */}
            <div className="charts-grid-v2">
                <ChartCard title="Course Applications Trend">
                    <div style={{ height: '300px' }}>
                        <LineChart
                            labels={applications.labels}
                            datasets={getSingleDataset(applications, 'Applications', '#f59e0b')}
                        />
                    </div>
                </ChartCard>
                <ChartCard title="Followers Growth">
                    <div style={{ height: '300px' }}>
                        <LineChart
                            labels={followers.labels}
                            datasets={getSingleDataset(followers, 'Followers', '#8b5cf6')}
                        />
                    </div>
                </ChartCard>
            </div>

            {/* Demographics */}
            <div className="overview-section-v2">
                <h2 className="section-title-v2">User Demographics</h2>
                <DemographicCharts demographics={demographics} loading={isUpdating} />
            </div>
        </div>
    );
};

export default TrendsPage;
