import React from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Ban, Loader2, AlertTriangle, ChevronDown } from 'lucide-react';
import './CancelSubscriptionModal.css';

const PREDEFINED_REASONS = [
    "Too expensive",
    "Missing features",
    "Switching to another platform",
    "Difficult to use",
    "Other"
];

const CancelSubscriptionModal = ({ isOpen, onClose, onConfirm, loading, planName }) => {
    const [reason, setReason] = React.useState('');
    const [otherReason, setOtherReason] = React.useState('');

    if (!isOpen) return null;

    const handleConfirm = () => {
        const finalReason = reason === 'Other' ? otherReason : reason;
        onConfirm(finalReason);
    };

    const isConfirmDisabled = !reason || (reason === 'Other' && !otherReason.trim()) || loading;

    return createPortal(
        <AnimatePresence>
            {isOpen && (
                <div className="cancel-sub-overlay" onClick={onClose}>
                    <motion.div
                        className="cancel-sub-modal-container"
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button className="cancel-sub-close-trigger" onClick={onClose} disabled={loading}>
                            <X size={24} />
                        </button>

                        <div className="cancel-sub-icon-wrapper danger">
                            <AlertTriangle size={32} />
                        </div>

                        <h3>Cancel {planName}?</h3>

                        <div className="cancel-sub-info-box">
                            <p>
                                {planName?.toLowerCase().includes('trial') ? (
                                    <>
                                        Are you sure you want to cancel your <strong>{planName}</strong>?
                                        <br /><br />
                                        <strong>All premium access will be removed immediately</strong> and you will be redirected to the pricing page.
                                    </>
                                ) : (
                                    <>
                                        Are you sure you want to cancel your <strong>{planName}</strong>?
                                        You will retain access to premium features until the current billing period ends.
                                    </>
                                )}
                            </p>
                        </div>

                        <div className="cancel-sub-reason-section">
                            <label className="reason-label">Why are you cancelling?</label>
                            <div className="reason-select-wrapper">
                                <select
                                    className="reason-select"
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                    disabled={loading}
                                >
                                    <option value="" disabled>Select a reason</option>
                                    {PREDEFINED_REASONS.map((r) => (
                                        <option key={r} value={r}>{r}</option>
                                    ))}
                                </select>
                                <ChevronDown className="select-icon" size={18} />
                            </div>

                            {reason === 'Other' && (
                                <motion.div
                                    className="other-reason-container"
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                >
                                    <textarea
                                        className="other-reason-input"
                                        placeholder="Please tell us more..."
                                        value={otherReason}
                                        onChange={(e) => setOtherReason(e.target.value)}
                                        disabled={loading}
                                        rows={3}
                                    />
                                </motion.div>
                            )}
                        </div>

                        <div className="cancel-sub-actions">
                            <button
                                type="button"
                                className="btn-secondary"
                                onClick={onClose}
                                disabled={loading}
                            >
                                Keep Plan
                            </button>
                            <button
                                type="button"
                                className="btn-primary danger"
                                onClick={handleConfirm}
                                disabled={isConfirmDisabled}
                            >
                                {loading ? <Loader2 className="cancel-sub-animate-spin" size={18} /> : 'Confirm Cancellation'}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>,
        document.body
    );
};

export default CancelSubscriptionModal;
