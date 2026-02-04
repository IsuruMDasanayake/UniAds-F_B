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

    // Group subscriptions by institute
    const institutesMap = {};
    subscriptions.forEach(sub => {
        if (!sub.institute) return; // specific safety check
        const instId = sub.institute.id;
        if (!institutesMap[instId]) {
            institutesMap[instId] = {
                details: sub.institute,
                records: [],
                hasActive: false,
                primaryStatus: 'expired',
                expiryDate: null
            };
        }
        institutesMap[instId].records.push(sub);

        // Check for active status
        if (sub.status === 'active' || sub.status === 'trial_active' || (sub.is_trial && sub.status === 'active')) {
            institutesMap[instId].hasActive = true;
            // prioritize setting primary status info from the active record
            institutesMap[instId].primaryStatus = sub.is_trial ? 'Trial Active' : 'Subscription Active';
            institutesMap[instId].expiryDate = sub.ends_at || sub.trial_expires_at;
        }
    });

    const activeInstitutes = Object.values(institutesMap).filter(inst => inst.hasActive);

    // Filter by search
    const filteredInstitutes = activeInstitutes.filter(inst =>
        (inst.details.institute_name?.toLowerCase() || '').includes(searchTerm.toLowerCase())
    );

    const handleViewDetails = (instituteData) => {
        setSelectedSubscription(instituteData); // Reusing state for selected institute data wrapper
        setStatusModalOpen(true); // Using this to open details modal now
    };

    const closeDetailsModal = () => {
        setStatusModalOpen(false);
        setSelectedSubscription(null);
    };

    // Helper to calculate "Ends in X days"
    const getRelativeTime = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = date - now;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays < 0) return 'Expired';
        if (diffDays === 0) return 'Ends today';
        return `Ends in ${diffDays} days`;
    };

    return (
        <div className="subscription-management-page admin-subscription-scope">
            <div className="page-header mb-8">
                <div className="header-text">
                    <h1 className="text-2xl font-bold">Subscription Management</h1>
                    <p className="text-muted">Manage active institute subscriptions</p>
                </div>
            </div>

            <div className="table-controls p-0 mb-6 bg-transparent border-0">
                <div className="search-box w-full max-w-md">
                    <Search size={18} className="search-icon" />
                    <input
                        type="text"
                        placeholder="Search active institutes..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {loading ? (
                <div className="text-center p-12">
                    <div className="loader mx-auto mb-4"></div>
                    <p className="text-muted">Loading active subscriptions...</p>
                </div>
            ) : filteredInstitutes.length === 0 ? (
                <div className="text-center p-12 admin-glass-card">
                    <p className="text-muted">No active subscriptions found.</p>
                </div>
            ) : (
                <div className="institute-grid">
                    {filteredInstitutes.map((inst) => (
                        <div key={inst.details.id} className="institute-card admin-glass-card">
                            <div className="inst-card-header">
                                <div className="inst-logo-wrapper">
                                    {inst.details.profile_photo ? (
                                        <img
                                            src={getStorageUrl(inst.details.profile_photo)}
                                            alt={inst.details.institute_name}
                                            className="inst-logo-img"
                                        />
                                    ) : (
                                        <Users size={24} />
                                    )}
                                </div>
                                <div className="inst-info">
                                    <h3>{inst.details.institute_name}</h3>
                                    <span className={`status-badge ${inst.primaryStatus.toLowerCase().includes('trial') ? 'trial-active' : 'sub-active'}`}>
                                        {inst.primaryStatus}
                                    </span>
                                </div>
                            </div>

                            <div className="inst-card-body">
                                <div className="expiry-info">
                                    <Clock size={16} className="inline mr-2" /> &nbsp;
                                    {getRelativeTime(inst.expiryDate)}
                                </div>
                                <button
                                    className="view-details-btn"
                                    onClick={() => handleViewDetails(inst)}
                                >
                                    <ArrowUpRight size={16} className="ml-1" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Details Modal */}
            {statusModalOpen && selectedSubscription && (
                <div className="modal-overlay" onClick={closeDetailsModal}>
                    <div className="modal-content subscription-details-modal" onClick={e => e.stopPropagation()}>


                        <div className="modal-header-section">
                            <div className="inst-logo-lg">
                                {selectedSubscription.details.profile_photo ? (
                                    <img
                                        src={getStorageUrl(selectedSubscription.details.profile_photo)}
                                        alt={selectedSubscription.details.institute_name}
                                    />
                                ) : (
                                    <Users size={32} />
                                )}
                            </div>
                            <div>
                                <h2>{selectedSubscription.details.institute_name}</h2>
                                <p className="text-muted">{selectedSubscription.details.email}</p>
                            </div>
                        </div>

                        <div className="modal-body-section">
                            <h3 className="section-title">Subscription History</h3>
                            <div className="responsive-table modal-table">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Plan</th>
                                            <th>Status</th>
                                            <th>Started At</th>
                                            <th>Ends At</th>
                                            <th>Cancelled At</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {selectedSubscription.records.sort((a, b) => new Date(b.started_at) - new Date(a.started_at)).map(sub => (
                                            <tr key={sub.id}>
                                                <td>
                                                    <span className={`plan-badge ${(sub.plan || 'trial').toLowerCase()}`}>
                                                        {sub.plan || (sub.is_trial ? 'Trial' : 'Monthly')}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span className={`status-pill ${sub.status}`}>
                                                        {sub.status}
                                                    </span>
                                                </td>
                                                <td>{sub.started_at ? new Date(sub.started_at).toLocaleDateString() : '-'}</td>
                                                <td>{sub.ends_at ? new Date(sub.ends_at).toLocaleDateString() : '-'}</td>
                                                <td>{sub.cancelled_at ? new Date(sub.cancelled_at).toLocaleDateString() : '—'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SubscriptionManagement;
