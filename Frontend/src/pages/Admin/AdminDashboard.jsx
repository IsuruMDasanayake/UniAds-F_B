import React, { useState, useEffect } from 'react';
import {
    Users,
    Building2,
    FileText,
    Calendar,
    Eye,
    UserCheck
} from 'lucide-react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
    Legend
} from 'recharts';
import axiosClient from '../../lib/axios';
import './AdminDashboard.css';

const AdminDashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await axiosClient.get('/api/admin/dashboard');
                setStats(response.data);
            } catch (error) {
                console.error('Error fetching dashboard stats:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    if (loading) {
        return (
            <div className="admin-dashboard-scope">
                <div className="admin-loading-container">
                    <div className="loader"></div>
                    <span>Preparing your dashboard...</span>
                </div>
            </div>
        );
    }

    const statCards = [
        { title: 'Total Users', value: stats?.stats?.userCount || 0, icon: Users, color: '#3b82f6' },
        { title: 'Institutes', value: stats?.stats?.instituteCount || 0, icon: Building2, color: '#8b5cf6' },
        { title: 'Active Posts', value: stats?.stats?.postCount || 0, icon: FileText, color: '#10b981' },
        { title: 'Total Events', value: stats?.stats?.eventCount || 0, icon: Calendar, color: '#f59e0b' },
        { title: 'Site Views', value: stats?.stats?.siteViews || 0, icon: Eye, color: '#ec4899' },
        { title: 'Followers', value: stats?.stats?.followersCount || 0, icon: UserCheck, color: '#06b6d4' },
    ];

    // Transform trend data for Recharts
    const trendData = stats?.trends?.labels?.map((label, index) => ({
        name: label,
        Users: stats.trends.userCounts?.[index] || 0,
        Institutes: stats.trends.instituteCounts?.[index] || 0,
        Posts: stats.trends.postCounts?.[index] || 0,
        Events: stats.trends.eventCounts?.[index] || 0,
    })) || [];

    const engagementData = stats?.trends?.labels?.map((label, index) => ({
        name: label,
        Views: stats.trends.siteViewsCounts?.[index] || 0,
        Ratings: stats.trends.ratingsCounts?.[index] || 0,
    })) || [];

    return (
        <div className="admin-dashboard-page admin-dashboard-scope">
            <div className="dashboard-header mb-8">
                <h1 className="text-2xl font-bold">System Analytics</h1>
                <p className="text-muted">30-day performance overview</p>
            </div>

            <div className="stats-grid">
                {statCards.map((card, idx) => (
                    <div key={idx} className="admin-glass-card stat-card">
                        <div className="stat-icon-wrapper" style={{ backgroundColor: `${card.color}20`, color: card.color }}>
                            <card.icon size={24} />
                        </div>
                        <div className="stat-content">
                            <span className="stat-label">{card.title}</span>
                            <span className="stat-value">{card.value.toLocaleString()}</span>
                        </div>
                    </div>
                ))}
            </div>

            <div className="charts-grid mt-8">
                <div className="admin-glass-card chart-container p-6">
                    <div className="chart-header mb-6">
                        <h3 className="text-lg font-semibold">Growth Trends</h3>
                        <p className="text-sm text-muted">Daily registrations and content creation</p>
                    </div>
                    <div className="chart-wrapper">
                        <ResponsiveContainer width="100%" height={300}>
                            <AreaChart data={trendData}>
                                <defs>
                                    <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1e293b', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }}
                                    itemStyle={{ color: '#fff' }}
                                />
                                <Legend iconType="circle" />
                                <Area type="monotone" dataKey="Users" stroke="#3b82f6" fillOpacity={1} fill="url(#colorUsers)" />
                                <Area type="monotone" dataKey="Institutes" stroke="#8b5cf6" fill="transparent" />
                                <Area type="monotone" dataKey="Posts" stroke="#10b981" fill="transparent" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="admin-glass-card chart-container p-6">
                    <div className="chart-header mb-6">
                        <h3 className="text-lg font-semibold">Engagement Metrics</h3>
                        <p className="text-sm text-muted">Daily views and satisfaction ratings</p>
                    </div>
                    <div className="chart-wrapper">
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={engagementData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1e293b', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }}
                                />
                                <Legend iconType="circle" />
                                <Bar dataKey="Views" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="Ratings" fill="#ec4899" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
