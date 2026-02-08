import React from 'react';
import { X, Users, Building2, Send, Loader } from 'lucide-react';
import './FilterComponents.css';

const RecipientPreviewModal = ({ show, onClose, onConfirm, previewData, loading, targetType }) => {
    if (!show) return null;

    return (
        <div className="bfc-modal-overlay" onClick={onClose}>
            <div className="bfc-modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="bfc-modal-header">
                    <h3>Recipient Preview</h3>
                    <button onClick={onClose} className="bfc-close-btn">
                        <X size={20} />
                    </button>
                </div>

                <div className="bfc-modal-body">
                    {loading ? (
                        <div className="bfc-loading-container">
                            <Loader size={32} className="bfc-spin" />
                            <p>Loading recipients...</p>
                        </div>
                    ) : previewData ? (
                        <>
                            <div className="bfc-preview-count">
                                {targetType === 'users' ? <Users size={24} /> : <Building2 size={24} />}
                                <div>
                                    <h4>{previewData.count}</h4>
                                    <p>Total Recipients</p>
                                </div>
                            </div>

                            {previewData.sample && previewData.sample.length > 0 && (
                                <div className="bfc-preview-list">
                                    <h4>Sample Recipients (First 10)</h4>
                                    {previewData.sample.map((recipient, idx) => (
                                        <div key={idx} className="bfc-preview-item">
                                            <div className="bfc-recipient-info">
                                                <strong>{recipient.name}</strong>
                                                <span className="bfc-recipient-email">{recipient.email}</span>
                                            </div>
                                            {(recipient.district || recipient.location) && (
                                                <span className="bfc-location-badge">
                                                    {recipient.district || recipient.location}
                                                </span>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </>
                    ) : (
                        <p className="bfc-no-data">No preview data available</p>
                    )}
                </div>

                <div className="bfc-modal-footer">
                    <button className="bfc-btn-secondary" onClick={onClose}>
                        Close
                    </button>
                    <button
                        className="bfc-btn-primary"
                        onClick={onConfirm}
                        disabled={loading || !previewData || previewData.count === 0}
                    >
                        {loading ? <Loader size={18} className="bfc-spin" /> : <Send size={18} />}
                        Confirm & Send
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RecipientPreviewModal;
