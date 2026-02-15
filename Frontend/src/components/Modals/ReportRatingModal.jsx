import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertCircle, Loader2 } from 'lucide-react';
import './ReportRatingModal.css';

const ReportRatingModal = ({ isOpen, onClose, onConfirm, loading }) => {
    const [reason, setReason] = useState('False information');
    const [customReason, setCustomReason] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        const finalReason = reason === 'Other' ? customReason : reason;
        onConfirm(finalReason);
    };

    if (!isOpen) return null;

    return createPortal(
        <AnimatePresence>
            {isOpen && (
                <div className="report-rating-overlay" onClick={onClose}>
                    <motion.div
                        className="report-rating-modal-container"
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button className="report-rating-close-trigger" onClick={onClose} disabled={loading}>
                            <X size={24} />
                        </button>

                        <div className="report-rating-icon-wrapper red">
                            <AlertCircle size={32} />
                        </div>

                        <h3>Report Comment</h3>

                        <p className="report-rating-description">
                            Please select the primary reason for reporting this student review. Our team will investigate.
                        </p>

                        <form onSubmit={handleSubmit} className="report-rating-modal-body">
                            <div className="report-rating-form-group">
                                <label className="report-rating-form-label">Reason for report</label>
                                <select
                                    className="report-rating-form-select"
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                    disabled={loading}
                                    required
                                >
                                    <option value="False information">False information</option>
                                    <option value="Offensive language">Offensive language</option>
                                    <option value="Spam or unrelated content">Spam or unrelated content</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>

                            {reason === 'Other' && (
                                <div className="report-rating-form-group">
                                    <label className="report-rating-form-label">Please specify</label>
                                    <textarea
                                        className="report-rating-form-textarea"
                                        placeholder="Provide more details..."
                                        value={customReason}
                                        onChange={(e) => setCustomReason(e.target.value)}
                                        disabled={loading}
                                        required
                                        rows={3}
                                    />
                                </div>
                            )}

                            <div className="report-rating-actions">
                                <button
                                    type="button"
                                    className="btn-secondary"
                                    onClick={onClose}
                                    disabled={loading}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="btn-primary danger"
                                    disabled={loading || (reason === 'Other' && !customReason.trim())}
                                >
                                    {loading ? <Loader2 className="report-rating-animate-spin" size={18} /> : 'Submit Report'}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>,
        document.body
    );
};

export default ReportRatingModal;
