import React, { useState, useEffect } from 'react';
import {
    Search,
    CreditCard,
    TrendingUp,
    Users,
    Gift,
    Clock,
    ArrowUpRight,
    ShieldCheck
} from 'lucide-react';
import ActionConfirmModal from '../../components/Modals/ActionConfirmModal';
import axiosClient from '../../lib/axios';
import { getStorageUrl } from '../../lib/config';
import './SubscriptionManagement.css';

const SubscriptionManagement = () => {
    const [subscriptions, setSubscriptions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // Status Toggle State
    const [statusModalOpen, setStatusModalOpen] = useState(false);
    const [selectedSubscription, setSelectedSubscription] = useState(null);
    const [targetStatus, setTargetStatus] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => {
        fetchSubscriptions();
    }, []);

    const fetchSubscriptions = async () => {
        try {
            setLoading(true);
            const response = await axiosClient.get('/api/admin/subscriptions');
            setSubscriptions(response.data);
        } catch (error) {
            console.error('Error fetching subscriptions:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleToggleStatus = (id, currentStatus) => {
        let newStatus = "";
        const status = (currentStatus || "").toLowerCase();

        if (status === 'active') {
            newStatus = 'expired';
        } else if (status === 'cancelled') {
            newStatus = 'active';
        } else if (status === 'expired') {
            console.warn('Expired subscriptions cannot be changed manually.');
            return;
        }

        setSelectedSubscription(id);
        setTargetStatus(newStatus);
        setStatusModalOpen(true);
    };

    const confirmStatusToggle = async () => {
        try {
            setIsProcessing(true);
            await axiosClient.patch(`/api/admin/subscriptions/${selectedSubscription}/toggle-status`, {
                status: targetStatus
            });
            fetchSubscriptions();
            setStatusModalOpen(false);
        } catch (error) {
            console.error('Error updating status:', error);
        } finally {
            setIsProcessing(false);
        }
    };

    const filteredSubscriptions = subscriptions.filter(sub =>
        (sub.institute?.institute_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (sub.plan?.toLowerCase() || '').includes(searchTerm.toLowerCase())
    );

    return (
        <div className="subscription-management-page admin-subscription-scope">
            <div className="page-header mb-8">
                <div className="header-text">
                    <h1 className="text-2xl font-bold">Subscription Management</h1>
                    <p className="text-muted">Monitor plans, renewals, and platform revenue</p>
                </div>
            </div>

            <div className="subscription-summary-grid mb-8">
                <div className="admin-glass-card summary-card">
                    <div className="summary-icon platinum"><TrendingUp size={24} /></div>
                    <div className="summary-content">
                        <span className="summary-label">Active Subscriptions</span>
                        <span className="summary-value">{subscriptions.filter(s => !s.is_trial).length}</span>
                    </div>
                </div>
                <div className="admin-glass-card summary-card">
                    <div className="summary-icon gold"><Gift size={24} /></div>
                    <div className="summary-content">
                        <span className="summary-label">Free Trials</span>
                        <span className="summary-value">{subscriptions.filter(s => s.is_trial).length}</span>
                    </div>
                </div>
            </div>

            <div className="admin-glass-card table-container">
                <div className="table-controls p-6">
                    <div className="search-box">
                        <Search size={18} className="search-icon" />
                        <input
                            type="text"
                            placeholder="Search by subscriber or plan..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="responsive-table">
                    <table>
                        <thead>
                            <tr>
                                <th>Institute</th>
                                <th>Plan</th>
                                <th>Trial</th>
                                <th>Status</th>
                                <th>Started At</th>
                                <th>Ends At</th>
                                <th>Cancelled At</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="8" className="text-center p-12">
                                        <div className="loader mx-auto mb-4"></div>
                                        <p className="text-muted">Loading subscriptions...</p>
                                    </td>
                                </tr>
                            ) : filteredSubscriptions.length === 0 ? (
                                <tr>
                                    <td colSpan="8" className="text-center p-12">
                                        <p className="text-muted">No subscriptions found.</p>
                                    </td>
                                </tr>
                            ) : (
                                filteredSubscriptions.map((sub) => (
                                    <tr key={sub.id}>
                                        <td>
                                            <div className="subscriber-cell">
                                                <div className="sub-avatar">
                                                    {sub.institute?.profile_photo ? (
                                                        <img
                                                            src={getStorageUrl(sub.institute.profile_photo)}
                                                            alt={sub.institute.institute_name}
                                                            className="avatar-img"
                                                        />
                                                    ) : (
                                                        <Users size={16} />
                                                    )}
                                                </div>
                                                <div className="sub-meta">
                                                    <span className="sub-name">{sub.institute?.institute_name || 'Admin'}</span>
                                                    <span className="sub-email">{sub.institute?.email || sub.user?.email || '-'}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <span className={`plan-badge ${(sub.plan || '').toLowerCase().replace(/\s+/g, '-')}`}>
                                                {sub.plan || 'Monthly'}
                                            </span>
                                        </td>
                                        <td>
                                            <span className={`trial-badge ${(sub.is_trial ? sub.status : (sub.institute?.trial_status || 'not_used'))}`}>
                                                {sub.is_trial ? sub.status : (sub.institute?.trial_status ? sub.institute.trial_status.replace('_', ' ') : 'Not used')}
                                            </span>
                                        </td>
                                        <td>
                                            <span className={`status-pill ${sub.status}`}>
                                                {sub.status || 'Active'}
                                            </span>
                                        </td>
                                        <td>{sub.started_at ? new Date(sub.started_at).toLocaleDateString() : 'N/A'}</td>
                                        <td>{sub.ends_at ? new Date(sub.ends_at).toLocaleDateString() : 'N/A'}</td>
                                        <td>{sub.cancelled_at ? new Date(sub.cancelled_at).toLocaleDateString() : 'N/A'}</td>
                                        <td>
                                            <div className="actions-cell">
                                                <button
                                                    className="action-btn-sm toggle"
                                                    title="Toggle Status"
                                                    onClick={() => handleToggleStatus(sub.id, sub.status)}
                                                >
                                                    <Clock size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <ActionConfirmModal
                isOpen={statusModalOpen}
                onClose={() => setStatusModalOpen(false)}
                onConfirm={confirmStatusToggle}
                isProcessing={isProcessing}
                title="Change Subscription Status"
                message={`Are you sure you want to change this subscription to ${targetStatus}? This will affect the institute's premium access.`}
                confirmText={`Yes, mark as ${targetStatus}`}
                type={targetStatus === 'active' ? 'success' : 'danger'}
            />
        </div>
    );
};

export default SubscriptionManagement;
