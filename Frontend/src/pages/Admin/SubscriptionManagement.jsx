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
import axiosClient from '../../lib/axios';
import './SubscriptionManagement.css';

const SubscriptionManagement = () => {
    const [subscriptions, setSubscriptions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

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

    const filteredSubscriptions = subscriptions.filter(sub =>
        (sub.user?.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (sub.plan_name?.toLowerCase() || '').includes(searchTerm.toLowerCase())
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
                        <span className="summary-value">{subscriptions.length}</span>
                    </div>
                </div>
                <div className="admin-glass-card summary-card">
                    <div className="summary-icon gold"><Gift size={24} /></div>
                    <div className="summary-content">
                        <span className="summary-label">Premium Plans</span>
                        <span className="summary-value">{subscriptions.filter(s => s.plan_name?.includes('Premium')).length}</span>
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
                                <th>Subscriber</th>
                                <th>Plan Name</th>
                                <th>Price</th>
                                <th>Duration</th>
                                <th>Expires</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="text-center p-12">
                                        <div className="loader mx-auto mb-4"></div>
                                        <p className="text-muted">Loading subscriptions...</p>
                                    </td>
                                </tr>
                            ) : filteredSubscriptions.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="text-center p-12">
                                        <p className="text-muted">No subscriptions found.</p>
                                    </td>
                                </tr>
                            ) : (
                                filteredSubscriptions.map((sub) => (
                                    <tr key={sub.id}>
                                        <td>
                                            <div className="subscriber-cell">
                                                <div className="sub-avatar">
                                                    <Users size={16} />
                                                </div>
                                                <div className="sub-meta">
                                                    <span className="sub-name">{sub.user?.name || 'Unknown'}</span>
                                                    <span className="sub-email">{sub.user?.email || '-'}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <span className={`plan-badge ${(sub.plan_name || '').toLowerCase().replace(/\s+/g, '-')}`}>
                                                {sub.plan_name}
                                            </span>
                                        </td>
                                        <td>Rs. {(sub.price || 0).toLocaleString()}</td>
                                        <td>{sub.duration_months} Months</td>
                                        <td>
                                            <div className="expiry-cell">
                                                <Clock size={14} className="text-muted" />
                                                <span>{new Date(sub.expires_at).toLocaleDateString()}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <span className="status-indicator active">
                                                <ShieldCheck size={14} /> Active
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default SubscriptionManagement;
