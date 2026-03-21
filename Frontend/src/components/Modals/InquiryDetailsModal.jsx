import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X,
    User,
    Mail,
    Send,
    RefreshCw,
    Clock,
    CheckCircle2,
    AlertCircle,
    MessageSquare
} from 'lucide-react';
import axiosClient from '../../lib/axios';
import './InquiryDetailsModal.css';

const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    
    // Replace dashes with slashes for iOS Safari compatibility
    const safeDateString = dateString.replace(/-/g, '/').replace('T', ' ');
    const parts = safeDateString.split('.'); // Handle fractional seconds
    const cleanDate = parts[0];

    const d = new Date(cleanDate);
    if (isNaN(d.getTime())) {
        return dateString.split(' ')[0] || dateString;
    }
    return d.toLocaleString();
};

const InquiryDetailsModal = ({ isOpen, onClose, inquiry, onReplySent }) => {
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');
    const [sending, setSending] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (inquiry) {
            setSubject(`Re: ${inquiry.subject}`);
        }
    }, [inquiry]);

    if (!isOpen || !inquiry) return null;

    const handleSendReply = async (e) => {
        e.preventDefault();
        setSending(true);
        setError('');

        try {
            const { data } = await axiosClient.post(`/api/institute/inquiries/${inquiry.id}/reply`, {
                subject,
                message
            });

            if (data.success) {
                setSuccess(true);
                setTimeout(() => {
                    setSuccess(false);
                    onReplySent(data.reply);
                    onClose();
                }, 2000);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to send reply. Please try again.');
        } finally {
            setSending(false);
        }
    };

    return (
        <AnimatePresence>
            <div id="inquiry-details-modal-overlay" onClick={onClose}>
                <motion.div
                    id="inquiry-details-modal"
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="modal-container-v2"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="modal-header">
                        <div className="header-info">
                            <h3>Inquiry Details</h3>
                            <span className="application-id">ID: #{inquiry.id}</span>
                        </div>
                        <button className="close-btn" onClick={onClose}><X size={20} /></button>
                    </div>

                    <div className="modal-body">
                        <div className="modal-grid">
                            {/* Left Column: Inquiry Info */}
                            <div className="info-column">
                                <div className="info-section">
                                    <h4 className="section-title"><User size={16} /> Sender Information</h4>
                                    <div className="info-card">
                                        <div className="info-row">
                                            <span className="label">Name</span>
                                            <span className="value">{inquiry.name}</span>
                                        </div>
                                        <div className="info-row">
                                            <span className="label">Email</span>
                                            <span className="value student-email-link"> {inquiry.email}</span>
                                        </div>
                                        <div className="info-row">
                                            <span className="label">Date</span>
                                            <span className="value">{formatDate(inquiry.created_at)}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="info-section message-section">
                                    <h4 className="section-title"><MessageSquare size={16} /> Subject: {inquiry.subject}</h4>
                                    <div className="student-message-box">
                                        {inquiry.message || 'No message content.'}
                                    </div>
                                </div>
                            </div>

                            {/* Right Column: Reply Form */}
                            <div className="reply-column">
                                <div className="reply-container">
                                    <h4 className="section-title"><Send size={16} /> Send Response</h4>
                                    <form onSubmit={handleSendReply} className="reply-form">
                                        <div className="input-group">
                                            <label>Subject</label>
                                            <input
                                                type="text"
                                                value={subject}
                                                onChange={(e) => setSubject(e.target.value)}
                                                placeholder="Enter subject..."
                                                required
                                            />
                                        </div>
                                        <div className="input-group">
                                            <label>Message</label>
                                            <textarea
                                                value={message}
                                                onChange={(e) => setMessage(e.target.value)}
                                                placeholder="Write your response to the student..."
                                                rows={5}
                                                required
                                            />
                                        </div>

                                        {error && (
                                            <div className="reply-error">
                                                <AlertCircle size={16} /> {error}
                                            </div>
                                        )}

                                        <button
                                            type="submit"
                                            className={`send-reply-btn ${success ? 'success' : ''}`}
                                            disabled={sending || success}
                                        >
                                            {sending ? <RefreshCw className="animate-spin" size={18} /> :
                                                success ? <CheckCircle2 size={18} /> : <Send size={18} />}
                                            <span>{sending ? 'Sending...' : success ? 'Sent Successfully' : 'Send Response'}</span>
                                        </button>
                                    </form>
                                    <p className="reply-hint">This will send an email to the sender and update the inquiry status to "Contacted".</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default InquiryDetailsModal;
