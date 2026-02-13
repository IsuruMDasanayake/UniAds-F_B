import React, { useEffect, useState } from 'react';
import axiosClient from '../../lib/axios';
import LineChart from '../../components/Analytics/LineChart';
import { motion } from 'framer-motion';
import './TrendsPage.css';

const TrendsPage = () => {
    const [trends, setTrends] = useState(null);
    const [loading, setLoading] = useState(true);
    const [range, setRange] = useState('30'); // 7, 30, 90

    useEffect(() => {
        const fetchTrends = async () => {
            setLoading(true);
            try {
                const { data } = await axiosClient.get(`/api/institute/analytics/trends?range=${range}`);
                setTrends(data);
            } catch (error) {
                console.error('Error fetching trends:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchTrends();
    }, [range]);

    return (
        <div id="analytics-trends-page">
            <div className="trends-header">
                <div>
                    <h1 className="trends-title">Performance Trends</h1>
                    <p className="trends-subtitle">Visualize your growth over time.</p>
                </div>
                <div className="trends-controls">
                    {['7', '30', '90'].map((r) => (
                        <button
                            key={r}
                            onClick={() => setRange(r)}
                            className={`range-btn ${range === r ? 'active' : ''}`}
                        >
                            {r} Days
                        </button>
                    ))}
                </div>
            </div>

            {loading ? (
                <div className="trends-loading-grid">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="skeleton-chart"></div>
                    ))}
                </div>
            ) : trends ? (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="trends-grid"
                >
                    <div className="chart-wrapper">
                        <LineChart
                            title="Post Views"
                            data={trends.postViews?.data || []}
                            labels={trends.postViews?.labels || []}
                            color="#3b82f6"
                        />
                    </div>
                    <div className="chart-wrapper">
                        <LineChart
                            title="Event Views"
                            data={trends.eventViews?.data || []}
                            labels={trends.eventViews?.labels || []}
                            color="#10b981"
                        />
                    </div>
                    <div className="chart-wrapper">
                        <LineChart
                            title="Profile Views"
                            data={trends.profileViews?.data || []}
                            labels={trends.profileViews?.labels || []}
                            color="#6366f1"
                        />
                    </div>
                    <div className="chart-wrapper">
                        <LineChart
                            title="Course Applications"
                            data={trends.applications?.data || []}
                            labels={trends.applications?.labels || []}
                            color="#f59e0b"
                        />
                    </div>
                    <div className="chart-wrapper full-width">
                        <LineChart
                            title="Followers Growth"
                            data={trends.followers?.data || []}
                            labels={trends.followers?.labels || []}
                            color="#8b5cf6"
                        />
                    </div>
                </motion.div>
            ) : (
                <div className="text-center py-10">Failed to load data.</div>
            )}
        </div>
    );
};

export default TrendsPage;
