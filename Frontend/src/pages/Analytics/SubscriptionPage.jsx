import React, { useEffect, useState } from 'react';
import axiosClient from '../../lib/axios';
import { CreditCard, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import './SubscriptionPage.css';

const SubscriptionPage = () => {
    const [subscription, setSubscription] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSubscription = async () => {
            try {
                const { data } = await axiosClient.get('/api/institute/analytics/subscription');
                setSubscription(data);
            } catch (error) {
                console.error('Error fetching subscription:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchSubscription();
    }, []);

    if (loading) return (
        <div id="analytics-subscription-page">
            <div className="skeleton-card"></div>
        </div>
    );

    if (!subscription) return <div className="text-center py-10">Failed to load subscription details.</div>;

    const isExpired = subscription.status === 'Expired';
    // eslint-disable-next-line no-unused-vars
    const isTrial = subscription.status === 'Trial';

    return (
        <div id="analytics-subscription-page">
            <div className="page-header">
                <h1 className="page-title">Subscription Plan</h1>
                <p className="page-subtitle">Manage your billing and plan details.</p>
            </div>

            {isExpired && (
                <div className="expired-alert">
                    <AlertCircle size={20} />
                    <span>Your subscription has expired. Please renew to continue accessing premium features.</span>
                </div>
            )}

            <div className="subscription-card">
                <div className="subscription-header">
                    <h2 className="plan-name">{subscription.plan}</h2>
                    <div className="plan-status">
                        {isExpired ? <AlertCircle size={14} /> : <CheckCircle size={14} />}
                        <span>{subscription.status}</span>
                    </div>
                </div>

                <div className="subscription-details">
                    <div className="detail-item">
                        <div className="detail-label-wrapper">
                            <Clock size={18} />
                            <span>Expiry Date</span>
                        </div>
                        <span className={`detail-value ${isExpired ? 'expiry-value' : ''}`}>
                            {subscription.ends_at ? new Date(subscription.ends_at).toLocaleDateString() : 'N/A'}
                        </span>
                    </div>
                    <div className="detail-item">
                        <div className="detail-label-wrapper">
                            <CreditCard size={18} />
                            <span>Payment Method</span>
                        </div>
                        <span className="detail-value">Visa ending in 4242</span>
                    </div>
                </div>

                <div className="subscription-footer">
                    <button className="upgrade-btn">
                        {isExpired ? 'Renew Subscription' : 'Upgrade Plan'}
                    </button>
                    <a href="#" className="manage-link">
                        View billing history
                    </a>
                </div>
            </div>
        </div>
    );
};

export default SubscriptionPage;
