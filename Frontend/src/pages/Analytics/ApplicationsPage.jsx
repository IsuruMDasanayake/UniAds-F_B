import React, { useEffect, useState, useCallback } from 'react';
import { useLocation, useOutletContext } from 'react-router-dom';
import axiosClient from '../../lib/axios';
import DataTable from '../../components/Analytics/DataTable';
import {
    Users,
    Calendar,
    Mail,
    Phone,
    Eye,
    CheckCircle,
    Clock,
    Search,
    RefreshCw,
    Briefcase,
    MessageSquare,
    ChevronRight,
    TrendingUp
} from 'lucide-react';

// Components
import StatCard from '../../components/Analytics/StatCard';
import SkeletonTable from '../../components/Analytics/SkeletonTable';
import EmptyState from '../../components/Analytics/EmptyState';
import ApplicationsTableCard from '../../components/Analytics/ApplicationsTableCard';
import ApplicationDetailsModal from '../../components/Modals/ApplicationDetailsModal';
import CommunicationsHistoryModal from '../../components/Modals/CommunicationsHistoryModal';
import LineChart from '../../components/Analytics/LineChart';
import ChartCard from '../../components/Analytics/ChartCard';

// Styling
import './ApplicationsPage.css';

const ApplicationsPage = () => {
    const { fetchNewAppsCount } = useOutletContext();
    const [applications, setApplications] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isUpdating, setIsUpdating] = useState(false);
    const [trendData, setTrendData] = useState(null);
    const [loadingTrend, setLoadingTrend] = useState(true);

    // Filters
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [status, setStatus] = useState('all');
    const [pagination, setPagination] = useState({});

    // Modal States
    const [selectedApplication, setSelectedApplication] = useState(null);
    const [detailsModalOpen, setDetailsModalOpen] = useState(false);

    // Communication History States
    const [communicationsHistory, setCommunicationsHistory] = useState([]);
    const [showHistoryModal, setShowHistoryModal] = useState(false);
    const [fetchingHistory, setFetchingHistory] = useState(false);

    const fetchApplications = useCallback(async (isInitial = false, isSilent = false) => {
        if (isInitial) setLoading(true);
        else if (!isSilent) setIsUpdating(true);

        try {
            const response = await axiosClient.get('/api/institute/applications', {
                params: {
                    page,
                    search,
                    status
                }
            });

            const payload = response.data.data;
            setApplications(payload.applications.data || []);
            setStats(payload.stats);
            setPagination({
                current_page: payload.applications.current_page,
                last_page: payload.applications.last_page,
                total: payload.applications.total,
                from: payload.applications.from,
                to: payload.applications.to
            });
        } catch (error) {
            console.error('Error fetching applications:', error?.message || error);
        } finally {
            setLoading(false);
            setIsUpdating(false);
        }
    }, [page, search, status]);

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchApplications(!applications.length);
        }, search ? 500 : 0);

        // Polling every 60 seconds
        const intervalId = setInterval(() => {
            fetchApplications(false, true);
        }, 60000);

        return () => {
            clearTimeout(timer);
            clearInterval(intervalId);
        };
    }, [search, status, page, fetchApplications, applications.length === 0]);

    useEffect(() => {
        const fetchTrends = async () => {
            setLoadingTrend(true);
            try {
                const response = await axiosClient.get('/api/institute/analytics/trends', {
                    params: { range: '90', compare: 'false' }
                });
                setTrendData(response.data.data.applications || null);
            } catch (error) {
                console.error('Error fetching application trends:', error?.message || error);
            } finally {
                setLoadingTrend(false);
            }
        };

        fetchTrends();
    }, []);

    const handleViewDetails = async (application) => {
        setSelectedApplication(application);
        setDetailsModalOpen(true);

        // Mark as viewed if new
        if (application.status === 'new') {
            try {
                const response = await axiosClient.put(`/api/institute/applications/${application.id}/view`);
                // Update local state update
                const viewedAt = response.data?.data?.viewed_at;
                setApplications(prev => prev.map(a => a.id === application.id ? { ...a, status: 'viewed', viewed_at: viewedAt || new Date().toISOString() } : a));
                // Update stats
                setStats(prev => ({ ...prev, new: prev.new - 1 }));
                // Refresh sidebar badge
                fetchNewAppsCount();
            } catch (err) {
                console.error('Error marking as viewed:', err?.message || err);
            }
        }
    };

    const handleReplySent = (updatedApplication) => {
        setApplications(prev => prev.map(a => a.id === updatedApplication.id ? { ...a, ...updatedApplication } : a));
        fetchApplications(false); // Refresh to update stats properly
    };

    const handleHistoryClick = async () => {
        if (fetchingHistory) return;

        setFetchingHistory(true);
        try {
            const response = await axiosClient.get('/api/institute/communications/history', {
                params: { type: 'application' }
            });
            setCommunicationsHistory(response.data.data.data || []);
            setShowHistoryModal(true);
        } catch (error) {
            console.error('Error fetching communications history:', error?.message || error);
        } finally {
            setFetchingHistory(false);
        }
    };

    const columns = [
        {
            header: 'Student',
            accessor: 'student_name',
            render: (row) => (
                <div className="application-student-cell">
                    <div className="student-avatar">
                        <Users size={16} />
                    </div>
                    <div className="student-info">
                        <span className="student-name">{row.student_name || 'N/A'}</span>
                        <span className="student-email">{row.student_email || '—'}</span>
                    </div>
                </div>
            )
        },
        {
            header: 'Course',
            accessor: 'course_title',
            render: (row) => (
                <div className="application-course-cell">
                    <span className="course-title" title={row.course_title}>{row.course_title}</span>
                </div>
            )
        },
        {
            header: 'Applied At',
            accessor: 'applied_at',
            render: (row) => {
                if (!row.applied_at) return <span>—</span>;
                const s = row.applied_at.includes('T') ? row.applied_at : row.applied_at.replace(/-/g, "/");
                return (
                    <div className="date-cell">
                        <Calendar size={14} className="icon-v2" />
                        <span>{new Date(s).toLocaleDateString()}</span>
                    </div>
                );
            }
        },
        {
            header: 'Status',
            accessor: 'status',
            render: (row) => (
                <span className={`status-badge-v2 ${row.status}`}>
                    <span className="dot"></span>
                    {row.status.charAt(0).toUpperCase() + row.status.slice(1)}
                </span>
            )
        },
        {
            header: 'Contact',
            render: (row) => (
                <div className="contact-info-cell">
                    <div className="contact-item"><Phone size={14} /> {row.student_phone || 'N/A'}</div>
                </div>
            )
        },
        {
            header: 'Action',
            render: (row) => (
                <div className="action-buttons-v2" onClick={(e) => e.stopPropagation()}>
                    <button
                        className="action-btn-v2 view"
                        onClick={() => handleViewDetails(row)}
                        title="View Details"
                    >
                        <Eye size={18} />
                    </button>
                </div>
            )
        }
    ];

    const isInitialLoading = loading && !stats;

    return (
        <div id="analytics-applications-page" className={isUpdating ? 'updating' : ''}>
            {/* Header section */}
            <div className={`page-header-card-v2 ${isUpdating ? 'updating' : ''}`}>
                <div className="header-content-v2">
                    <div className="header-left-v2">
                        <h1 className="page-title-v2">Applications Analytics</h1>
                        <p className="page-subtitle-v2">Monitor performance of your course applications across your institute.</p>
                    </div>
                </div>
            </div>

            {/* Stat Cards Row */}
            <div className="stat-cards-row-v2">
                <StatCard
                    icon={Briefcase}
                    label="TOTAL APPLICATIONS"
                    value={stats?.total || 0}
                    color="blue"
                    loading={loading}
                />
                <StatCard
                    icon={TrendingUp}
                    label="APPLICATIONS THIS MONTH"
                    value={stats?.this_month || 0}
                    color="green"
                    loading={loading}
                />
                <StatCard
                    icon={Clock}
                    label="NEW APPLICATIONS"
                    value={stats?.new || 0}
                    color="yellow"
                    loading={loading}
                />
                <StatCard
                    icon={CheckCircle}
                    label="CONTACTED"
                    value={stats?.contacted || 0}
                    color="red"
                    loading={loading}
                />
            </div>

            {/* Application Trends Chart */}
            <div className="chart-section">
                <ChartCard
                    title="Application Volume (90 Days)"
                    subtitle="Track your course applications trend over the last 3 months"
                    loading={loadingTrend || loading}
                >
                    <div className="application-trend-chart-wrapper">
                        <LineChart
                            labels={trendData?.labels || []}
                            datasets={[{
                                label: 'Applications',
                                data: trendData?.data || [],
                                borderColor: '#3b82f6',
                                backgroundColor: (context) => {
                                    const ctx = context.chart.ctx;
                                    const gradient = ctx.createLinearGradient(0, 0, 0, 300);
                                    gradient.addColorStop(0, 'rgba(59, 130, 246, 0.4)');
                                    gradient.addColorStop(1, 'rgba(59, 130, 246, 0)');
                                    return gradient;
                                },
                                fill: true
                            }]}
                            showLegend={false}
                        />
                    </div>
                </ChartCard>
            </div>

            {/* Main Table Card */}
            <ApplicationsTableCard
                title="Applications Performance"
                subtitle={`${pagination.total || 0} applications found`}
                search={search}
                onSearchChange={setSearch}
                searchPlaceholder="Search by student or course..."
                status={status}
                onStatusChange={setStatus}
                showHistoryButton={true}
                onHistoryClick={handleHistoryClick}
                isFetchingHistory={fetchingHistory}
            >
                <div className="table-container-v2">
                    {loading ? (
                        <SkeletonTable rows={5} cols={6} />
                    ) : applications.length > 0 ? (
                        <DataTable
                            columns={columns}
                            data={applications}
                            pagination={pagination}
                            onPageChange={setPage}
                            loading={isUpdating}
                            showSearch={false}
                            onRowClick={handleViewDetails}
                        />
                    ) : (
                        <EmptyState
                            icon={FileText}
                            title="No applications found"
                            type="applications"
                            search={search}
                            status={status}
                        />
                    )}
                </div>
            </ApplicationsTableCard>

            {/* Modal */}
            {selectedApplication && (
                <ApplicationDetailsModal
                    isOpen={detailsModalOpen}
                    onClose={() => setDetailsModalOpen(false)}
                    application={selectedApplication}
                    onReplySent={handleReplySent}
                />
            )}

            <CommunicationsHistoryModal
                isOpen={showHistoryModal}
                onClose={() => setShowHistoryModal(false)}
                history={communicationsHistory}
                loading={fetchingHistory}
            />
        </div>
    );
};

export default ApplicationsPage;
