import React from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Ban, Loader2, AlertTriangle } from 'lucide-react';
import './CancelSubscriptionModal.css';

const CancelSubscriptionModal = ({ isOpen, onClose, onConfirm, loading, planName }) => {
    if (!isOpen) return null;

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
                                onClick={onConfirm}
                                disabled={loading}
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
