import React, { useEffect, useState, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import { motion } from 'framer-motion';
import axiosClient from '../../lib/axios';
import DataTable from '../../components/Analytics/DataTable';
import {
    Inbox,
    MessageCircle,
    Activity,
    RefreshCw,
    Mail,
    Eye
} from 'lucide-react';

// Components
import StatCard from '../../components/Analytics/StatCard';
import SkeletonTable from '../../components/Analytics/SkeletonTable';
import EmptyState from '../../components/Analytics/EmptyState';
import ApplicationsTableCard from '../../components/Analytics/ApplicationsTableCard';
import InquiryDetailsModal from '../../components/Modals/InquiryDetailsModal';
import CommunicationsHistoryModal from '../../components/Modals/CommunicationsHistoryModal';

// Styling
import './GeneralInquiriesPage.css';

const GeneralInquiriesPage = () => {
    const { fetchNewInquiriesCount } = useOutletContext();
    const [inquiries, setInquiries] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isUpdating, setIsUpdating] = useState(false);

    // Filters
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [status, setStatus] = useState('all');
    const [pagination, setPagination] = useState({});

    // Modal States
    const [selectedInquiry, setSelectedInquiry] = useState(null);
    const [detailsModalOpen, setDetailsModalOpen] = useState(false);

    // Communication History States
    const [communicationsHistory, setCommunicationsHistory] = useState([]);
    const [showHistoryModal, setShowHistoryModal] = useState(false);
    const [fetchingHistory, setFetchingHistory] = useState(false);

    const fetchInquiries = useCallback(async (isInitial = false) => {
        if (isInitial) setLoading(true);
        else setIsUpdating(true);

        try {
            const { data } = await axiosClient.get('/api/institute/inquiries', {
                params: {
                    page,
                    search,
                    status
                }
            });

            setInquiries(data.inquiries.data || []);
            setStats(data.stats);
            setPagination({
                current_page: data.inquiries.current_page,
                last_page: data.inquiries.last_page,
                total: data.inquiries.total,
                from: data.inquiries.from,
                to: data.inquiries.to
            });
        } catch (error) {
            console.error('Error fetching inquiries:', error);
        } finally {
            setLoading(false);
            setIsUpdating(false);
        }
    }, [page, search, status]);

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchInquiries(!inquiries.length);
        }, search ? 500 : 0);

        // Polling every 30 seconds
        const intervalId = setInterval(() => {
            fetchInquiries(false);
        }, 30000);

        return () => {
            clearTimeout(timer);
            clearInterval(intervalId);
        };
    }, [search, status, page, fetchInquiries, inquiries.length === 0]);

    const handleViewDetails = async (inquiry) => {
        setSelectedInquiry(inquiry);
        setDetailsModalOpen(true);

        // Mark as viewed if new
        if (inquiry.status === 'new') {
            try {
                const { data } = await axiosClient.put(`/api/institute/inquiries/${inquiry.id}/view`);
                // Update local state
                setInquiries(prev => prev.map(i => i.id === inquiry.id ? { ...i, status: 'viewed', viewed_at: data.inquiry.viewed_at } : i));
                setStats(prev => ({ ...prev, new: Math.max(0, prev.new - 1) }));
                // Refresh sidebar badge
                fetchNewInquiriesCount();
            } catch (error) {
                console.error('Error marking inquiry as viewed:', error);
            }
        }
    };

    const handleReplySent = (reply) => {
        // Update the inquiry status in local state to 'contacted'
        if (selectedInquiry) {
            setInquiries(prev => prev.map(i =>
                i.id === selectedInquiry.id
                    ? { ...i, status: 'contacted', contacted_at: new Date().toISOString() }
                    : i
            ));
        }
        fetchInquiries(false); // Refresh stats
    };

    const handleHistoryClick = async () => {
        if (fetchingHistory) return;

        setFetchingHistory(true);
        try {
            const { data } = await axiosClient.get('/api/institute/communications/history', {
                params: { type: 'inquiry' }
            });
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
            header: 'Sender',
            render: (row) => (
                <div className="sender-info">
                    <div className="sender-name">{row.name}</div>
                    <div className="sender-email">{row.email}</div>
                </div>
            )
        },
        {
            header: 'Subject',
            render: (row) => (
                <div className="inquiry-subject">
                    {row.subject}
                </div>
            )
        },
        {
            header: 'Status',
            render: (row) => (
                <span className={`status-badge-v2 ${row.status}`}>
                    <span className="dot"></span>
                    {row.status.charAt(0).toUpperCase() + row.status.slice(1)}
                </span>
            )
        },
        {
            header: 'Date Received',
            render: (row) => (
                <div className="date-info">
                    {new Date(row.created_at).toLocaleDateString()}
                    <span className="time-sub">{new Date(row.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
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

    return (
        <div id="general-inquiries-page" className={`general-inquiries-page ${isUpdating ? 'updating' : ''}`}>
            <div className={`page-header-card-v2 ${isUpdating ? 'updating' : ''}`}>
                <div className="header-content-v2">
                    <div className="header-left-v2">
                        <h1 className="page-title-v2">General Inquiries</h1>
                        <p className="page-subtitle-v2">Manage and respond to direct inquiries from your profile.</p>
                    </div>
                    {isUpdating && (
                        <div className="updating-loader-v2">
                            <RefreshCw className="animate-spin" size={20} />
                        </div>
                    )}
                </div>
            </div>

            <div className="stats-grid-v2">
                <StatCard
                    label="Total Inquiries"
                    value={stats?.total || 0}
                    icon={Inbox}
                    color="blue"
                    loading={loading}
                />
                <StatCard
                    label="New Messages"
                    value={stats?.new || 0}
                    icon={MessageCircle}
                    color="green"
                    loading={loading}
                />
                <StatCard
                    label="Monthly Activity"
                    value={stats?.this_month || 0}
                    icon={Activity}
                    color="amber"
                    loading={loading}
                />
            </div>

            <ApplicationsTableCard
                title="Direct Inquiries"
                subtitle={`${pagination.total || 0} inquiries found`}
                search={search}
                onSearchChange={setSearch}
                searchPlaceholder="Search by sender or subject..."
                status={status}
                onStatusChange={setStatus}
                showHistoryButton={true}
                onHistoryClick={handleHistoryClick}
                isFetchingHistory={fetchingHistory}
                statusOptions={[
                    { value: 'all', label: 'All Messages' },
                    { value: 'new', label: 'New' },
                    { value: 'viewed', label: 'Reviewed' },
                    { value: 'contacted', label: 'Contacted' }
                ]}
            >
                <div className="table-container-v2">
                    {loading ? (
                        <SkeletonTable rows={5} cols={5} />
                    ) : inquiries.length > 0 ? (
                        <DataTable
                            columns={columns}
                            data={inquiries}
                            pagination={pagination}
                            onPageChange={setPage}
                            loading={isUpdating}
                            showSearch={false}
                            onRowClick={handleViewDetails}
                        />
                    ) : (
                        <EmptyState
                            icon={Mail}
                            title="No inquiries found"
                            type="inquiries"
                            search={search}
                            status={status}
                        />
                    )}
                </div>
            </ApplicationsTableCard>

            {/* Modal */}
            {selectedInquiry && (
                <InquiryDetailsModal
                    isOpen={detailsModalOpen}
                    onClose={() => setDetailsModalOpen(false)}
                    inquiry={selectedInquiry}
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

export default GeneralInquiriesPage;
