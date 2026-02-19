import React, { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
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
import { History } from 'lucide-react';

// Styling
import './ApplicationsPage.css';

const ApplicationsPage = () => {
    const [applications, setApplications] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isUpdating, setIsUpdating] = useState(false);

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

    const fetchApplications = useCallback(async (isInitial = false) => {
        if (isInitial) setLoading(true);
        else setIsUpdating(true);

        try {
            const { data } = await axiosClient.get('/api/institute/applications', {
                params: {
                    page,
                    search,
                    status
                }
            });

            setApplications(data.applications.data || []);
            setStats(data.stats);
            setPagination({
                current_page: data.applications.current_page,
                last_page: data.applications.last_page,
                total: data.applications.total,
                from: data.applications.from,
                to: data.applications.to
            });
        } catch (error) {
            console.error('Error fetching applications:', error);
        } finally {
            setLoading(false);
            setIsUpdating(false);
        }
    }, [page, search, status]);

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchApplications(!applications.length);
        }, search ? 500 : 0);
        return () => clearTimeout(timer);
    }, [search, status, page, fetchApplications]);

    const handleViewDetails = async (application) => {
        setSelectedApplication(application);
        setDetailsModalOpen(true);

        // Mark as viewed if new
        if (application.status === 'new') {
            try {
                const { data } = await axiosClient.put(`/api/institute/applications/${application.id}/view`);
                // Update local state update
                setApplications(prev => prev.map(a => a.id === application.id ? { ...a, status: 'viewed', viewed_at: data.application.viewed_at } : a));
                // Update stats
                setStats(prev => ({ ...prev, new: prev.new - 1 }));
            } catch (err) {
                console.error('Error marking as viewed:', err);
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
            const { data } = await axiosClient.get('/api/institute/communications/history');
            setCommunicationsHistory(data);
            setShowHistoryModal(true);
        } catch (error) {
            console.error('Error fetching communications history:', error);
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
            render: (row) => (
                <div className="date-cell">
                    <Calendar size={14} className="icon-v2" />
                    <span>{new Date(row.applied_at).toLocaleDateString()}</span>
                </div>
            )
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
                <button
                    className="view-details-btn"
                    onClick={() => handleViewDetails(row)}
                >
                    View Details
                    <ChevronRight size={16} />
                </button>
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

            {/* Stats Cards */}
            <div className="stat-cards-row-v2">
                <StatCard
                    icon={Briefcase}
                    label="Total Applications"
                    value={stats?.total}
                    color="blue"
                    loading={isInitialLoading}
                />
                <StatCard
                    icon={TrendingUp}
                    label="Applications This Month"
                    value={stats?.this_month}
                    color="green"
                    loading={isInitialLoading}
                />
                <StatCard
                    icon={Clock}
                    label="New Applications"
                    value={stats?.new}
                    color="amber"
                    loading={isInitialLoading}
                />
                <StatCard
                    icon={CheckCircle}
                    label="Contacted"
                    value={stats?.contacted}
                    color="purple"
                    loading={isInitialLoading}
                />
            </div>

            {/* Table Section */}
            <ApplicationsTableCard
                search={search}
                onSearchChange={(val) => { setSearch(val); setPage(1); }}
                status={status}
                onStatusChange={(val) => { setStatus(val); setPage(1); }}
                totalApplications={pagination.total || 0}
                onHistoryClick={handleHistoryClick}
                isFetchingHistory={fetchingHistory}
                showHistoryButton={stats?.contacted > 0}
            >
                <div className="table-responsive-wrapper">
                    {isInitialLoading ? (
                        <SkeletonTable rows={5} cols={6} />
                    ) : applications.length > 0 ? (
                        <DataTable
                            columns={columns}
                            data={applications}
                            pagination={pagination}
                            onPageChange={setPage}
                            loading={isUpdating}
                            showSearch={false}
                        />
                    ) : (
                        <EmptyState
                            icon={MessageSquare}
                            title="No applications found"
                            subtitle={search || status !== 'all' ? "Try adjusting your filters." : "Incoming course applications will appear here."}
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
