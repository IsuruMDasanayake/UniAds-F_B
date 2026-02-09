import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axiosClient from '../lib/axios';
import { CheckCircle, AlertCircle, Rocket, Shield, BarChart2, Users, Star, Facebook, Layout, Loader, ArrowLeft, ChevronDown, Sparkles, X, AlertTriangle, ShieldAlert } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSettings } from '../context/SettingsContext';
import Navbar from '../components/Navbar';
import './PricingPage.css';

const PricingPage = () => {
    const navigate = useNavigate();
    const navigate = useNavigate();
    const location = useLocation();
    const { settings } = useSettings();

    const [loading, setLoading] = useState(true);
    const [pricingData, setPricingData] = useState(null);
    const [error, setError] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    // Status states for UI only (cleared from URL)
    const [showSuccess, setShowSuccess] = useState(false);
    const [showCancelled, setShowCancelled] = useState(false);

    // Modal States
    const [showCancelTrialModal, setShowCancelTrialModal] = useState(false);
    const [showCancelSubModal, setShowCancelSubModal] = useState(false);

    useEffect(() => {
        // Handle URL params once on mount then clear them
        const queryParams = new URLSearchParams(location.search);
        if (queryParams.get('success') === '1') {
            setShowSuccess(true);
            window.history.replaceState({}, '', window.location.pathname);
            setTimeout(() => setShowSuccess(false), 5000);
        }
        if (queryParams.get('cancelled') === '1') {
            setShowCancelled(true);
            window.history.replaceState({}, '', window.location.pathname);
            setTimeout(() => setShowCancelled(false), 5000);
        }

        fetchPricingData();
    }, [location.search]);

    const fetchPricingData = async () => {
        try {
            setLoading(true);
            const response = await axiosClient.get('/api/pricing');
            setPricingData(response.data);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching pricing data:', err);
            if (err.response && err.response.status === 403) {
                setError('Only institutions can access the pricing page.');
            } else {
                setError('Failed to load pricing information.');
            }
            setLoading(false);
        }
    };

    // Generic function to handle PayHere Payment Launch
    const launchPayHere = (paymentData) => {
        return new Promise((resolve, reject) => {
            window.payhere.onCompleted = async function onCompleted(orderId) {
                console.log("Payment completed. OrderID:" + orderId);
                try {
                    await axiosClient.post('/api/payment/verify', { order_id: orderId });
                    resolve(true); // Payment Verified
                } catch (verifyErr) {
                    console.error('Verification error:', verifyErr);
                    resolve(true); // Resolve true anyway so UI updates
                }
            };

            window.payhere.onDismissed = function onDismissed() {
                console.log("Payment dismissed");
                resolve(false);
            };

            window.payhere.onError = function onError(error) {
                console.log("Error:" + error);
                reject(error);
            };

            window.payhere.startPayment(paymentData);
        });
    };

    const handleStartTrial = async () => {
        try {
            setSubmitting(true);
            // Request trial payment initiation (Amount 0)
            const response = await axiosClient.post('/api/payment/initiate', { type: 'trial' });

            if (response.data.success) {
                const completed = await launchPayHere(response.data.payment_data);
                if (completed) {
                    await fetchPricingData();
                    setShowSuccess(true);
                }
            } else {
                setError('Failed to initiate trial.');
            }
        } catch (err) {
            console.error('Error starting trial:', err);
            setError(err.response?.data?.error || 'Failed to start trial.');
        } finally {
            setSubmitting(false);
        }
    }

    const handleSubscribe = async () => {
        try {
            setSubmitting(true);
            const response = await axiosClient.post('/api/payment/initiate', { type: 'subscription' });

            if (response.data.success) {
                const completed = await launchPayHere(response.data.payment_data);
                if (completed) {
                    setShowSuccess(true);
                    await fetchPricingData();
                }
            } else {
                setError('Failed to initiate payment.');
            }

        } catch (err) {
            console.error('Error initiating payment:', err);
            // If manual string reject from onError
            setError(typeof err === 'string' ? err : 'Failed to initiate payment.');
        } finally {
            setSubmitting(false);
        }
    };

    // Updated Handlers to Open Modals
    const handleCancelTrial = () => {
        setShowCancelTrialModal(true);
    };

    const handleCancelSubscription = () => {
        setShowCancelSubModal(true);
    };

    // Actual Cancellation Logic
    const confirmCancelTrial = async () => {
        setShowCancelTrialModal(false);
        try {
            setSubmitting(true);
            await axiosClient.post('/api/trial/cancel');
            await fetchPricingData();
            // Show Success Alert
            setShowSuccess(true);
        } catch (err) {
            console.error('Error cancelling trial:', err);
            // Show Error Alert (using the same mechanism if needed, or set error state)
            setError(err.response?.data?.error || 'Failed to cancel trial.');
        } finally {
            setSubmitting(false);
        }
    };

    const confirmCancelSubscription = async () => {
        setShowCancelSubModal(false);
        try {
            setSubmitting(true);
            await axiosClient.post('/api/pricing/cancel');
            await fetchPricingData();
            // Show Success Alert
            setShowSuccess(true);
        } catch (err) {
            console.error('Error cancelling subscription:', err);
            setError(err.response?.data?.error || 'Failed to cancel subscription.');
        } finally {
            setSubmitting(false);
        }
    };

    const features = [
        { icon: <BarChart2 size={20} />, text: 'Analytics Dashboard Access - Track views & reach' },
        { icon: <Users size={20} />, text: 'Student Follower System - Build your community' },
        { icon: <Star size={20} />, text: 'Public Reviews and Ratings - Build credibility' },
        { icon: <Facebook size={20} />, text: 'Promote on UniAds Facebook - Reach more students' },
        { icon: <Layout size={20} />, text: 'Priority in Search Results - Appear higher in listings' },
        { icon: <Shield size={20} />, text: 'Dedicated Premium Badge - Get verified status' },
    ];

    const { status, institute, activeSubscription, trial_expires_at, premium_expires_at } = pricingData || {};

    return (
        <div className="pricing-page-v2">
            <Navbar user={pricingData?.institute?.user} />

            {loading ? (
                <div className="pricing-loading-overlay">
                    <div className="spinner-box">
                        <div className="ui-loader loader-blk">
                            <svg viewBox="22 22 44 44" className="multiColor-loader">
                                <circle cx="44" cy="44" r="20.2" fill="none" strokeWidth="3.6" className="loader-circle loader-circle-animation"></circle>
                            </svg>
                        </div>
                        <p>Loading premium details...</p>
                    </div>
                </div>
            ) : error ? (
                <div className="pricing-error-container">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="error-card-v2"
                    >
                        <div className="error-icon-v2">
                            {error.includes('Only institutions') ? <ShieldAlert size={40} /> : <AlertCircle size={40} />}
                        </div>
                        <h2 className="error-title-v2">{error.includes('Only institutions') ? 'Access Restricted' : 'Oops!'}</h2>
                        <p className="error-msg-v2">{error}</p>
                        <button onClick={() => navigate(-1)} className="error-back-btn">
                            <ArrowLeft size={18} className="inline mr-2" /> Go Back
                        </button>
                    </motion.div>
                </div>
            ) : status === 'cancelled_but_valid' ? (
                // Cancelled State UI
                <div className="pricing-container">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="cancel-box"
                    >
                        <div className="cancel-icon-circle">
                            <AlertCircle size={40} />
                        </div>
                        <h2>Subscription Cancelled</h2>
                        <p>Your premium features are currently active, but the subscription is set to <strong>end</strong>.</p>

                        <div className="expiry-highlight">
                            Premium active until: {new Date(premium_expires_at).toDateString()}
                        </div>

                        <p className="text-sm italic">
                            No further charges will be made. You will lose access to all premium tools after the date shown above.
                        </p>

                        <div className="contact-box">
                            <p>Need help or want to reactivate?</p>
                            <ul className="contact-list">
                                <li>
                                    <Star size={18} className="text-yellow-500" />
                                    <span>Contact support at <a href={`mailto:${settings?.contact_email || 'uniads.lk@gmail.com'}`}>{settings?.contact_email || 'uniads.lk@gmail.com'}</a></span>
                                </li>
                                <li>
                                    <Star size={18} className="text-green-500" />
                                    <span>WhatsApp: <a href="https://wa.me/94772300279" target="_blank" rel="noreferrer">+94 77 230 0279</a></span>
                                </li>
                            </ul>
                        </div>
                    </motion.div>
                </div>
            ) : (
                // Main Pricing UI
                <div className="pricing-container">
                    <div className="pricing-content-wrapper">
                        {/* Left Column: Hero & Benefits */}
                        <div className="pricing-hero">
                            <motion.div
                                initial={{ opacity: 0, x: -30 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.6 }}
                            >
                                <h1>Unlock Your Full <span>Potential</span> <Sparkles className="inline text-yellow-400" size={40} /></h1>
                                <p>
                                    Boost your institute's visibility, gain deep analytics, and stand out from the competition with UniAds Premium.
                                </p>

                                {/* Visual Benefit Pills */}
                                <div className="hero-benefits">
                                    <motion.div
                                        className="hero-benefit-item"
                                        whileHover={{ scale: 1.05 }}
                                    >
                                        <CheckCircle size={18} />
                                        <span>3x More Visibility</span>
                                    </motion.div>
                                    <motion.div
                                        className="hero-benefit-item"
                                        whileHover={{ scale: 1.05 }}
                                    >
                                        <CheckCircle size={18} />
                                        <span>Student Demographics</span>
                                    </motion.div>
                                    <motion.div
                                        className="hero-benefit-item"
                                        whileHover={{ scale: 1.05 }}
                                    >
                                        <CheckCircle size={18} />
                                        <span>Verified Badge</span>
                                    </motion.div>
                                    <motion.div
                                        className="hero-benefit-item"
                                        whileHover={{ scale: 1.05 }}
                                    >
                                        <CheckCircle size={18} />
                                        <span>Student Community</span>
                                    </motion.div>
                                </div>
                            </motion.div>
                        </div>

                        {/* Right Column: Pricing Card */}
                        <motion.div
                            className="pricing-card-wrapper"
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                        >
                            <div className="popular-badge">RECOMMENDED</div>

                            <div className="pricing-header">
                                <div className="amount-box">
                                    <span className="currency">LKR</span>
                                    <span className="amount">4990</span>
                                </div>
                                <div className="plan-note">per month / billed monthly</div>
                            </div>

                            {/* Status Messages */}
                            {status === 'trial_active' && (
                                <div className="status-box">
                                    <h3><Rocket size={18} className="inline mr-2" /> Trial Active</h3>
                                    <p>Expires {new Date(trial_expires_at).toLocaleDateString()}</p>
                                </div>
                            )}

                            {status === 'active' && (
                                <div className="status-box">
                                    <h3><CheckCircle size={18} className="inline mr-2" /> Premium Active</h3>
                                    <p>Next billing: {new Date(premium_expires_at).toLocaleDateString()}</p>
                                </div>
                            )}

                            <div className="features-grid">
                                {features.map((feature, index) => (
                                    <motion.div
                                        key={index}
                                        className="feature-item"
                                        initial={{ x: 20, opacity: 0 }}
                                        animate={{ x: 0, opacity: 1 }}
                                        transition={{ delay: 0.4 + index * 0.1 }}
                                    >
                                        <div className="feature-icon">{feature.icon}</div>
                                        <span className="feature-text">{feature.text}</span>
                                    </motion.div>
                                ))}
                            </div>

                            <div className="pricing-actions">
                                {status === 'trial_available' && (
                                    <div className="w-full">
                                        <div className="trial-badge">🎁 30-Day Free Trial Available!</div>
                                        <button
                                            className="subscribe-btn"
                                            onClick={handleStartTrial}
                                            disabled={submitting}
                                        >
                                            {submitting ? 'Processing...' : 'Start Free Trial'}
                                        </button>
                                    </div>
                                )}

                                {status === 'trial_active' && (
                                    <div className="w-full text-center">
                                        <button className="cancel-trial-btn" onClick={handleCancelTrial}>
                                            Cancel Free Trial
                                        </button>
                                    </div>
                                )}

                                {status === 'subscribe' && (
                                    <div className="w-full">
                                        {institute?.trial_status === 'expired' && (
                                            <div className="trial-expired-msg">
                                                Your free trial has ended.
                                            </div>
                                        )}
                                        <button
                                            className="subscribe-btn"
                                            onClick={handleSubscribe}
                                            disabled={submitting}
                                        >
                                            {submitting ? 'Processing...' : 'Subscribe Now'}
                                        </button>
                                    </div>
                                )}

                                {status === 'active' && (
                                    <div className="text-center">
                                        <button className="cancel-sub-btn" onClick={handleCancelSubscription}>
                                            Cancel Subscription
                                        </button>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </div>

                    {/* Enhanced Widgets Section */}
                    <div className="premium-widgets">
                        <motion.div
                            className="widget-card"
                            initial={{ y: 30, opacity: 0 }}
                            whileInView={{ y: 0, opacity: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.2 }}
                        >
                            <div className="widget-icon"><Shield size={28} /></div>
                            <h3>Verified Institution</h3>
                            <p>Build trust instantly with the verified badge displayed prominently on your profile and all courses.</p>
                        </motion.div>
                        <motion.div
                            className="widget-card"
                            initial={{ y: 30, opacity: 0 }}
                            whileInView={{ y: 0, opacity: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.3 }}
                        >
                            <div className="widget-icon widget-icon2"><BarChart2 size={28} /></div>
                            <h3>Advanced Analytics</h3>
                            <p>See exactly who is viewing your courses. Make data-driven decisions to optimize your reach.</p>
                        </motion.div>
                        <motion.div
                            className="widget-card"
                            initial={{ y: 30, opacity: 0 }}
                            whileInView={{ y: 0, opacity: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.4 }}
                        >
                            <div className="widget-icon widget-icon3"><Users size={28} /></div>
                            <h3>Priority Support</h3>
                            <p>Get dedicated support from our team to help you set up and manage your campaigns effectively.</p>
                        </motion.div>
                    </div>

                    {/* FAQ Section */}
                    <div className="faq-section">
                        <div className="faq-header">
                            <h2>Common Questions</h2>
                        </div>
                        <div className="faq-item">
                            <div className="faq-question">Can I cancel anytime? <ChevronDown size={20} /></div>
                            <div className="faq-answer">Yes, there are no long-term contracts. You can cancel your subscription at any time from your dashboard.</div>
                        </div>
                        <div className="faq-item">
                            <div className="faq-question">What payment methods do you accept? <ChevronDown size={20} /></div>
                            <div className="faq-answer">We accept all major credit and debit cards via PayHere secure payment gateway.</div>
                        </div>
                    </div>
                </div>
            )}

            {/* Cancel Trial Modal */}
            <AnimatePresence>
                {showCancelTrialModal && (
                    <div className="modal-overlay" onClick={() => setShowCancelTrialModal(false)}>
                        <motion.div
                            className="modal-content delete-modal"
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={e => e.stopPropagation()}
                        >
                            <button className="modal-close-trigger" onClick={() => setShowCancelTrialModal(false)}>
                                <X size={24} />
                            </button>

                            <div className="modal-icon-container">
                                <AlertTriangle size={50} />
                            </div>

                            <h3>Cancel Free Trial?</h3>
                            <p>Are you sure you want to cancel your free trial? Once cancelled, you cannot reactivate it.</p>

                            <div className="modal-actions-confirm">
                                <button className="btn-modal-secondary" onClick={() => setShowCancelTrialModal(false)}>
                                    Keep Trial
                                </button>
                                <button className="btn-modal-danger" onClick={confirmCancelTrial}>
                                    Yes, Cancel Trial
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Cancel Subscription Modal */}
            <AnimatePresence>
                {showCancelSubModal && (
                    <div className="modal-overlay" onClick={() => setShowCancelSubModal(false)}>
                        <motion.div
                            className="modal-content delete-modal"
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={e => e.stopPropagation()}
                        >
                            <button className="modal-close-trigger" onClick={() => setShowCancelSubModal(false)}>
                                <X size={24} />
                            </button>

                            <div className="modal-icon-container">
                                <AlertTriangle size={50} />
                            </div>

                            <h3>Cancel Subscription?</h3>
                            <p>Are you sure? Your premium access will remain active until the end of the current billing period.</p>

                            <div className="modal-actions-confirm">
                                <button className="btn-modal-secondary" onClick={() => setShowCancelSubModal(false)}>
                                    Keep Subscription
                                </button>
                                <button className="btn-modal-danger" onClick={confirmCancelSubscription}>
                                    Yes, Cancel Sub
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {/* {showSuccess && (
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 0 }}
                        className="alert-floating alert-success"
                    >
                        <CheckCircle size={20} /> Action Successful!
                    </motion.div>
                )} */}
                {showCancelled && (
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 0 }}
                        className="alert-floating alert-error"
                    >
                        <AlertCircle size={20} /> Action was cancelled.
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default PricingPage;
