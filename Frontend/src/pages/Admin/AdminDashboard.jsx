import React, { useState, useEffect } from 'react';
import {
    Users,
    Building2,
    FileText,
    Calendar,
    Eye,
    UserCheck,
    TrendingUp,
    AlertTriangle,
    Clock,
    Activity,
    CreditCard,
    MessageSquare,
    Briefcase,
    ShieldAlert,
    CheckCircle
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
    Legend,
    PieChart,
    Pie,
    Cell,
    LineChart,
    Line
} from 'recharts';
import axiosClient from '../../lib/axios';
import './AdminDashboard.css';

const formatNumber = (num) => {
    if (num === null || num === undefined || isNaN(num)) return 0;
    if (num >= 1000000000) return (num / 1000000000).toFixed(1).replace(/\.0$/, '') + 'B';
    if (num >= 1000000) return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
    return num.toString();
};

const AdminDashboard = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async (isSilent = false) => {
            if (!isSilent) setLoading(true);
            try {
                const response = await axiosClient.get('/api/admin/dashboard');
                setData(response.data.data);
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
            } finally {
                if (!isSilent) setLoading(false);
            }
        };

        fetchData();

        // Polling every 30 seconds
        const intervalId = setInterval(() => fetchData(true), 30000);

        return () => clearInterval(intervalId);
    }, []);

    if (loading) {
        return (
            <div className="admin-dashboard-scope">
                <div className="admin-loading-container">
                    <div className="loader"></div>
                    <span>Loading comprehensive analytics...</span>
                </div>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="admin-dashboard-scope">
                <div className="admin-loading-container">
                    <p className="text-red-400">Error loading dashboard data. Please try refreshing.</p>
                </div>
            </div>
        );
    }

    const { stats, trends, demographics, subscription_data, alerts, activity_feed } = data;

    // --- KPI Cards Configuration ---
    const kpiCards = [
        { title: 'Total Users', value: stats?.userCount, icon: Users, color: '#3b82f6', sub: `${stats?.dailyActiveUsers} active today` },
        { title: 'Institutes', value: stats?.instituteCount, icon: Building2, color: '#8b5cf6', sub: `${subscription_data?.trial_vs_paid?.[0]?.value} on trial` },
        { title: 'Active Posts', value: stats?.postCount, icon: FileText, color: '#10b981', sub: `${stats?.avgViewsPerPost} avg views` },
        { title: 'Total Events', value: stats?.eventCount, icon: Calendar, color: '#f59e0b', sub: 'Upcoming events' },
        { title: 'Site Views', value: stats?.siteViews, icon: Eye, color: '#ec4899', sub: 'All time views' },
        { title: 'Revenue (Subs)', value: stats?.activeSubscriptions, icon: CreditCard, color: '#0ea5e9', sub: 'Active subscriptions' },
        { title: 'Total Followers', value: stats?.followersCount, icon: UserCheck, color: '#f43f5e', sub: 'Across all institutes' },
        { title: 'Applications', value: stats?.courseApplications, icon: Briefcase, color: '#14b8a6', sub: 'Total applications' },
    ];

    // --- Chart Data Transformation ---
    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

    const growthData = trends?.labels?.map((label, index) => ({
        name: label,
        Users: trends.userCounts?.[index] || 0,
        Institutes: trends.instituteCounts?.[index] || 0,
        Posts: trends.postCounts?.[index] || 0,
    })) || [];

    const engagementData = trends?.labels?.map((label, index) => ({
        name: label,
        Applications: trends.applicationCounts?.[index] || 0,
        Views: trends.siteViewsCounts?.[index] || 0,
    })) || [];

    return (
        <div className="admin-dashboard-page admin-dashboard-scope">
            <div className="dashboard-header mb-8">
                <h2>Platform Analytics</h2>
                <p>Comprehensive system overview and operational insights</p>
            </div>

            {/* 1. Platform Overview (KPIs) */}
            <div className="stats-grid mb-8">
                {kpiCards.map((card, idx) => (
                    <div key={idx} className="admin-glass-card stat-card">
                        <div className="stat-icon-wrapper" style={{ backgroundColor: `${card.color}20`, color: card.color }}>
                            <card.icon size={24} />
                        </div>
                        <div className="stat-content">
                            <span className="stat-sub">{card.title}</span>
                            <span className="stat-value">{formatNumber(card.value)}</span>
                            <span className="stat-label text-muted mt-1">{card.sub}</span>
                        </div>
                    </div>
                ))}
            </div>

            <div className="charts-grid">
                {/* 2. Growth Trends */}
                <div className="admin-glass-card chart-container grid-col-8 p-6">
                    <div className="chart-header mb-6">
                        <h3 className="section-title">Growth Trajectory</h3>
                        <p className="section-subtitle">User and content acquisition over time</p>
                    </div>
                    <div className="chart-wrapper">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={growthData}>
                                <defs>
                                    <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(val) => val.slice(5)} />
                                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1e293b', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }}
                                    itemStyle={{ color: '#fff' }}
                                />
                                <Legend />
                                <Area type="monotone" dataKey="Users" stroke="#3b82f6" fillOpacity={1} fill="url(#colorUsers)" />
                                <Area type="monotone" dataKey="Institutes" stroke="#8b5cf6" fill="transparent" />
                                <Area type="monotone" dataKey="Posts" stroke="#10b981" fill="transparent" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* 3. Alerts & Operational Panel */}
                <div className="admin-glass-card chart-container grid-col-4 p-6">
                    <div className="chart-header mb-4">
                        <h3 className="section-title">Operational Alerts</h3>
                        <p className="section-subtitle">Items requiring attention</p>
                    </div>
                    <div className="alerts-list">
                        {alerts?.trials_ending > 0 ? (
                            <div className="alert-item warning">
                                <AlertTriangle size={20} />
                                <span>{alerts.trials_ending} trials ending within 3 days</span>
                            </div>
                        ) : (
                            <div className="alert-item" style={{ borderColor: 'rgba(16, 185, 129, 0.2)', backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#6ee7b7' }}>
                                <CheckCircle size={20} />
                                <span>No trials ending soon</span>
                            </div>
                        )}

                        {alerts?.expired_subs > 0 && (
                            <div className="alert-item">
                                <ShieldAlert size={20} />
                                <span>{alerts.expired_subs} subscriptions expired</span>
                            </div>
                        )}

                        <div className="alert-item" style={{ borderColor: 'rgba(59, 130, 246, 0.2)', backgroundColor: 'rgba(59, 130, 246, 0.1)', color: '#93c5fd' }}>
                            <Activity size={20} />
                            <span>System Healthy: All services operational</span>
                        </div>
                    </div>

                    <div className="mt-8">
                        <h3 className="section-title mb-4">Subscription Types</h3>
                        <div className="chart-wrapper" style={{ height: '200px' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={subscription_data?.trial_vs_paid}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={40}
                                        outerRadius={70}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {subscription_data?.trial_vs_paid.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={index === 0 ? '#fbbf24' : '#10b981'} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#1e293b', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}
                                        itemStyle={{ color: '#fff' }}
                                    />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* 4. Demographics Row */}
                <div className="admin-glass-card chart-container grid-col-4 p-6">
                    <h3 className="section-title">User Education</h3>
                    <p className="section-subtitle">Distribution by education level</p>
                    <div className="chart-wrapper">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={demographics?.education} layout="vertical" margin={{ left: 20 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(255,255,255,0.05)" />
                                <XAxis type="number" stroke="#94a3b8" fontSize={10} hide />
                                <YAxis dataKey="education_level" type="category" width={80} stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                                <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} contentStyle={{ backgroundColor: '#1e293b', borderRadius: '8px' }} />
                                <Bar dataKey="count" fill="#8884d8" radius={[0, 4, 4, 0]}>
                                    {demographics?.education.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="admin-glass-card chart-container grid-col-4 p-6">
                    <h3 className="section-title">Age Groups</h3>
                    <p className="section-subtitle">User age distribution</p>
                    <div className="chart-wrapper">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={demographics?.age}
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="count"
                                    nameKey="age_group"
                                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                                >
                                    {demographics?.age.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderRadius: '8px' }} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="admin-glass-card chart-container grid-col-4 p-6">
                    <h3 className="section-title">Top Districts</h3>
                    <p className="section-subtitle">Geographic user density</p>
                    <div className="chart-wrapper">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={demographics?.district?.slice(0, 7)}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                                <XAxis dataKey="district" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} interval={0} />
                                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                                <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} contentStyle={{ backgroundColor: '#1e293b', borderRadius: '8px' }} />
                                <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* 5. Engagement & Activity */}
                <div className="admin-glass-card chart-container grid-col-8 p-6">
                    <h3 className="section-title">Engagement Metrics</h3>
                    <p className="section-subtitle">Application cases and post views</p>
                    <div className="chart-wrapper">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={engagementData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(val) => val.slice(5)} />
                                <YAxis yAxisId="left" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                                <YAxis yAxisId="right" orientation="right" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                                <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }} />
                                <Legend />
                                <Line yAxisId="left" type="monotone" dataKey="Applications" stroke="#f59e0b" activeDot={{ r: 8 }} />
                                <Line yAxisId="right" type="monotone" dataKey="Views" stroke="#06b6d4" />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* 6. Recent Activity Feed */}
                <div className="admin-glass-card chart-container grid-col-4 p-6">
                    <h3 className="section-title">Live Activity</h3>
                    <p className="section-subtitle">Recent system events</p>
                    <div className="activity-feed">
                        {activity_feed?.slice(0, 4).map((item, idx) => (
                            <div key={idx} className="activity-item">
                                <div className="activity-icon">
                                    {item.type === 'user' && <Users size={16} />}
                                    {item.type === 'institute' && <Building2 size={16} />}
                                    {item.type === 'post' && <FileText size={16} />}
                                </div>
                                <div className="activity-content">
                                    <p className="activity-message">{item.message}</p>
                                    <span className="activity-time">{new Date(item.time).toLocaleString()}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
