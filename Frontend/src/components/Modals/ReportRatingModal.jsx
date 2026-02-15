import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertCircle, Loader2 } from 'lucide-react';

const ReportRatingModal = ({ isOpen, onClose, onConfirm, loading }) => {
    const [reason, setReason] = useState('False information');
    const [customReason, setCustomReason] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        const finalReason = reason === 'Other' ? customReason : reason;
        onConfirm(finalReason);
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="modal-overlay">
                <motion.div
                    className="modal-container-v2"
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                >
                    <div className="modal-header">
                        <div className="header-left">
                            <div className="icon-badge red">
                                <AlertCircle size={20} />
                            </div>
                            <h3 className="modal-title">Report Comment</h3>
                        </div>
                        <button className="close-btn" onClick={onClose} disabled={loading}>
                            <X size={20} />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="modal-body">
                        <p className="modal-description">
                            Please select the primary reason for reporting this student review. Our team will investigate.
                        </p>

                        <div className="form-group">
                            <label className="form-label">Reason for report</label>
                            <select
                                className="form-select"
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
                            <div className="form-group">
                                <label className="form-label">Please specify</label>
                                <textarea
                                    className="form-textarea"
                                    placeholder="Provide more details..."
                                    value={customReason}
                                    onChange={(e) => setCustomReason(e.target.value)}
                                    disabled={loading}
                                    required
                                    rows={3}
                                />
                            </div>
                        )}

                        <div className="modal-actions-v2">
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
                                {loading ? <Loader2 className="animate-spin" size={18} /> : 'Submit Report'}
                            </button>
                        </div>
                    </form>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default ReportRatingModal;
