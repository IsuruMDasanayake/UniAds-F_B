import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, CreditCard, Sparkles, AlertCircle, CheckCircle2, Ban } from 'lucide-react';

const SubscriptionSummaryCard = ({ currentPlan, onCancelPlan, onUpgrade }) => {
    if (!currentPlan) return null;

    const getStatusColor = (status) => {
        switch (status) {
            case 'active': return 'status-active';
            case 'trial': return 'status-trial';
            case 'expired': return 'status-expired';
            case 'cancelled': return 'status-cancelled';
            default: return 'status-inactive';
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    };

    const isTrial = currentPlan.type === 'trial';
    const isActive = currentPlan.status === 'active';
    const isCancelled = !!currentPlan.cancelled_at;

    return (
        <motion.div
            className="analytics-card-v2 subscription-summary-card-v2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
        >
            <div className="card-header-v2">
                <div className="header-info-v2">
                    <h3 className="card-title-v2">Current Plan</h3>
                    <p className="card-subtitle-v2">Details of your active subscription</p>
                </div>
                <div className="plan-actions-v2">
                    {isActive && !isCancelled && (
                        <button className="action-btn-v2 cancel" onClick={onCancelPlan}>
                            <Ban size={18} />
                            <span>{isTrial ? 'Cancel Trial' : 'Cancel Subscription'}</span>
                        </button>
                    )}
                    {isTrial && isActive && (
                        <button className="action-btn-v2 upgrade" onClick={onUpgrade}>
                            <Sparkles size={18} />
                            <span>Upgrade to Premium</span>
                        </button>
                    )}
                </div>
            </div>

            <div className="card-content-v2">
                <div className="plan-details-grid-v2">
                    <div className="metric-cell-v2">
                        <div className={`metric-icon ${isTrial ? 'blue' : 'green'}`}>
                            {isTrial ? <Sparkles size={20} /> : <CreditCard size={20} />}
                        </div>
                        <div className="metric-info">
                            <span className="metric-label">Current Plan</span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '4px' }}>
                                <span className="metric-value">{currentPlan.plan_name}</span>
                                <span className={`status-badge-v2 ${currentPlan.status}`} style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem' }}>
                                    <span className="dot"></span>
                                    {currentPlan.status.charAt(0).toUpperCase() + currentPlan.status.slice(1)}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="metric-cell-v2">
                        <div className="metric-icon blue"><Calendar size={20} /></div>
                        <div className="metric-info">
                            <span className="metric-label">Started At</span>
                            <span className="metric-value">{formatDate(currentPlan.started_at)}</span>
                        </div>
                    </div>

                    <div className="metric-cell-v2">
                        <div className="metric-icon amber"><Clock size={20} /></div>
                        <div className="metric-info">
                            <span className="metric-label">{isTrial ? 'Trial Ends' : 'Next Billing'}</span>
                            <span className="metric-value">{formatDate(currentPlan.ends_at)}</span>
                        </div>
                    </div>

                    {isCancelled && currentPlan.ends_at && (
                        <div className="metric-cell-v2 danger">
                            <div className="metric-icon red"><Ban size={20} /></div>
                            <div className="metric-info">
                                <span className="metric-label">Access Ends</span>
                                <span className="metric-value">{formatDate(currentPlan.ends_at)}</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

export default SubscriptionSummaryCard;
