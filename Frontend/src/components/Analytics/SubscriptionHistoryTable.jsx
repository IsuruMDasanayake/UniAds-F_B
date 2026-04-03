import React from 'react';
import { motion } from 'framer-motion';
import DataTable from './DataTable';
import SkeletonTable from './SkeletonTable';
import { Ban, Calendar } from 'lucide-react';

const SubscriptionHistoryTable = ({ history, loading, onCancel }) => {
    const formatDate = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    };

    const columns = [
        {
            header: 'Plan',
            render: (row) => (
                <span className={`status-badge-v2 ${row.is_trial ? 'upcoming' : 'active'}`}>
                    <span className="dot"></span>
                    {row.plan}
                </span>
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
            header: 'Started At',
            render: (row) => (
                <div className="date-time-v2">
                    <div className="date-main">{row.started_at ? new Date(row.started_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'}</div>
                    <div className="time-sub">{row.started_at ? new Date(row.started_at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: true }).toUpperCase() : ''}</div>
                </div>
            )
        },
        {
            header: 'Ends At',
            render: (row) => (
                <div className="date-time-v2">
                    <div className="date-main">{row.ends_at ? new Date(row.ends_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'}</div>
                    <div className="time-sub">{row.ends_at ? new Date(row.ends_at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: true }).toUpperCase() : ''}</div>
                </div>
            )
        },
        {
            header: 'Cancelled At',
            render: (row) => (
                <div className="date-time-v2">
                    <div className="date-main">{row.cancelled_at ? new Date(row.cancelled_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'}</div>
                    <div className="time-sub">{row.cancelled_at ? new Date(row.cancelled_at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: true }).toUpperCase() : ''}</div>
                </div>
            )
        },
        {
            header: 'Cancel Reason',
            render: (row) => row.cancel_reason || row.trial_cancel_reason || '-'
        },
        {
            header: 'Action',
            key: 'id',
            render: (row) => {
                const canCancel = row.status === 'active' && !row.cancelled_at;
                return (
                    <div className="action-buttons-v2">
                        {canCancel ? (
                            <button
                                className="action-btn-v2 cancel"
                                title="Cancel Subscription"
                                onClick={() => onCancel(row)}
                            >
                                <Ban size={16} />
                            </button>
                        ) : row.cancelled_at ? (
                            <span className="cancelled-label">Cancelled</span>
                        ) : (
                            <span className="no-action">-</span>
                        )}
                    </div>
                );
            }
        }
    ];

    return (
        <motion.div
            className="analytics-card-v2 subscription-history-card-v2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
        >
            <div className="card-header-v2">
                <div className="header-info-v2">
                    <h3 className="card-title-v2">Subscription History</h3>
                    <p className="card-subtitle-v2">Your past and current subscriptions</p>
                </div>
            </div>

            <div className="table-responsive-wrapper">
                {loading ? (
                    <SkeletonTable rows={5} cols={6} />
                ) : history.length > 0 ? (
                    <DataTable
                        columns={columns}
                        data={history}
                        loading={loading}
                        emptyMessage="No subscription history found"
                        showSearch={false}
                    />
                ) : (
                    <div className="empty-history-state-v2">
                        <div className="empty-icon-v2"><Calendar size={32} /></div>
                        <p>No subscription history found</p>
                    </div>
                )}
            </div>
        </motion.div>
    );
};

export default SubscriptionHistoryTable;
