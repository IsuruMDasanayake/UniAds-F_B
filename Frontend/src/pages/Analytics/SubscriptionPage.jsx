import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../../lib/axios';
import { motion, AnimatePresence } from 'framer-motion';
import { CreditCard, Calendar, Clock, Sparkles, RefreshCw, CheckCircle } from 'lucide-react';
import StatCard from '../../components/Analytics/StatCard';
import SubscriptionSummaryCard from '../../components/Analytics/SubscriptionSummaryCard';
import SubscriptionHistoryTable from '../../components/Analytics/SubscriptionHistoryTable';
import CancelSubscriptionModal from '../../components/Modals/CancelSubscriptionModal';
import './SubscriptionPage.css';

const SubscriptionPage = () => {
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isUpdating, setIsUpdating] = useState(false);
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [cancelling, setCancelling] = useState(false);

    const fetchSubscriptionData = async (isSilent = false) => {
        if (!data) setLoading(true);
        else if (!isSilent) setIsUpdating(true);

        try {
            const { data } = await axiosClient.get('/api/institute/analytics/subscriptions');
            setData(data);
        } catch (error) {
            console.error('Error fetching subscription data:', error);
        } finally {
            setLoading(false);
            setIsUpdating(false);
        }
    };

    useEffect(() => {
        fetchSubscriptionData();

        // Polling every 60 seconds
        const intervalId = setInterval(() => {
            fetchSubscriptionData(true);
        }, 60000);

        return () => clearInterval(intervalId);
    }, []);

    const handleCancelConfirm = async (reason) => {
        setCancelling(true);
        try {
            const isTrial = data?.current_plan?.type === 'trial';
            await axiosClient.post('/api/institute/subscription/cancel', { reason });

            if (isTrial) {
                // If trial is cancelled, redirect immediately as access is revoked
                navigate('/pricing');
                return;
            }

            await fetchSubscriptionData(true);
            setShowCancelModal(false);
        } catch (error) {
            console.error('Error cancelling subscription:', error);
        } finally {
            setCancelling(false);
        }
    };

    const handleUpgrade = async () => {
        try {
            setIsUpdating(true);
            const response = await axiosClient.post('/api/payment/initiate', { type: 'subscription' });

            if (response.data.success) {
                // Launch PayHere payment gateway
                const paymentData = response.data.payment_data;

                window.payhere.onCompleted = async function onCompleted(orderId) {
                    console.log("Payment completed. OrderID:" + orderId);
                    try {
                        await axiosClient.post('/api/payment/verify', { order_id: orderId });
                        await fetchSubscriptionData(true);
                    } catch (verifyErr) {
                        console.error('Verification error:', verifyErr);
                        await fetchSubscriptionData(true);
                    }
                };

                window.payhere.onDismissed = function onDismissed() {
                    console.log("Payment dismissed");
                    setIsUpdating(false);
                };

                window.payhere.onError = function onError(error) {
                    console.log("Error:" + error);
                    setIsUpdating(false);
                };

                window.payhere.startPayment(paymentData);
            }
        } catch (error) {
            console.error('Error initiating payment:', error);
            setIsUpdating(false);
        }
    };

    const isInitialLoading = loading && !data;
    const isTrial = data?.current_plan?.type === 'trial';

    const getTrialStatusLabel = () => {
        if (!data?.trial_info) return 'None';
        const { status, expires_at } = data.trial_info;
        if (status === 'active' && expires_at && new Date(expires_at) < new Date()) {
            return 'Expired';
        }
        return status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ');
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'None';
        return new Date(dateString).toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    };

    return (
        <div id="analytics-subscriptions-v2" className={isUpdating ? 'updating' : ''}>
            <div className={`page-header-card-v2 ${isUpdating ? 'updating' : ''}`}>
                <div className="header-content-v2">
                    <div className="header-left-v2">
                        <h1 className="page-title-v2">Subscription & Billing</h1>
                        <p className="page-subtitle-v2">Manage your plan and review billing history</p>
                    </div>
                    <div className="header-right-v2">
                        {data?.current_plan && (
                            <div className={`status-badge-v2 large ${data.current_plan.status}`}>
                                <span className="dot"></span>
                                {data.current_plan.status === 'active' ? 'Premium Active' :
                                    data.current_plan.status === 'cancelled' ? 'Premium Cancelled' :
                                        data.current_plan.type === 'trial' ? 'Trial Period' :
                                            data.current_plan.status.charAt(0).toUpperCase() + data.current_plan.status.slice(1)}
                            </div>
                        )}
                        <button
                            className="refresh-btn-v2"
                            onClick={() => fetchSubscriptionData(true)}
                            disabled={isUpdating}
                        >
                            <RefreshCw size={18} className={isUpdating ? 'animate-spin' : ''} />
                        </button>
                    </div>
                </div>
            </div>

            <div className="subscription-content-v2">
                <div className="summary-section">
                    {isInitialLoading ? (
                        <div className="skeleton-summary-card"></div>
                    ) : (
                        <SubscriptionSummaryCard
                            currentPlan={data?.current_plan}
                            onCancelPlan={() => setShowCancelModal(true)}
                            onUpgrade={handleUpgrade}
                        />
                    )}
                </div>

                <div className="stats-cards-row-v2">
                    <StatCard
                        icon={CreditCard}
                        label="Total Subscriptions"
                        value={data?.stats?.total_subscriptions}
                        color="blue"
                        loading={isInitialLoading}
                        delay={0.1}
                    />
                    <StatCard
                        icon={Clock}
                        label="Days Remaining"
                        value={data?.stats?.active_days_remaining}
                        color="green"
                        loading={isInitialLoading}
                        delay={0.2}
                    />
                    <StatCard
                        icon={Sparkles}
                        label="Trial Status"
                        value={getTrialStatusLabel()}
                        color="purple"
                        loading={isInitialLoading}
                        delay={0.3}
                    />
                </div>

                <div className="history-section">
                    <SubscriptionHistoryTable
                        history={data?.history || []}
                        loading={isInitialLoading}
                        onCancel={(row) => setShowCancelModal(true)}
                    />
                </div>
            </div>

            <CancelSubscriptionModal
                isOpen={showCancelModal}
                onClose={() => setShowCancelModal(false)}
                onConfirm={handleCancelConfirm}
                loading={cancelling}
                planName={data?.current_plan?.plan_name}
            />
        </div>
    );
};

export default SubscriptionPage;
