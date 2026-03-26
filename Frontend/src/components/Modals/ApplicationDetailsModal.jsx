import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X,
    User,
    Mail,
    Phone,
    Calendar,
    MessageSquare,
    Send,
    RefreshCw,
    Clock,
    CheckCircle2,
    AlertCircle,
    ChevronDown,
    History
} from 'lucide-react';
import axiosClient from '../../lib/axios';
import { getStorageUrl } from '../../lib/config';
import './ApplicationDetailsModal.css';

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

const ApplicationDetailsModal = ({ isOpen, onClose, application, onReplySent }) => {
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');
    const [sending, setSending] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');
    const [showHistory, setShowHistory] = useState(false);

    useEffect(() => {
        if (application) {
            setSubject(`Regarding your application for ${application.course_title}`);
        }
    }, [application]);

    if (!isOpen || !application) return null;

    const handleSendReply = async (e) => {
        e.preventDefault();
        setSending(true);
        setError('');

        try {
            const { data } = await axiosClient.post(`/api/institute/applications/${application.id}/reply`, {
                subject,
                message
            });

            if (data.success) {
                setSuccess(true);
                setTimeout(() => {
                    setSuccess(false);
                    onReplySent(data.application || { ...application, status: 'contacted', contacted_at: new Date().toISOString() });
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
            <div className="modal-overlay-v2" onClick={onClose}>
                <motion.div
                    id="application-details-modal"
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="modal-container-v2"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="modal-header">
                        <div className="header-info">
                            <h3>Application Details</h3>
                            <span className="application-id">ID: #{application.id}</span>
                        </div>
                        <button className="close-btn" onClick={onClose}><X size={20} /></button>
                    </div>

                    <div className="modal-body">
                        <div className="modal-grid">
                            {/* Left Column: Student Info */}
                            <div className="info-column">
                                <div className="info-section">
                                    <h4 className="section-title"><User size={16} /> Student Information</h4>
                                    <div className="info-card">
                                        <div className="info-row">
                                            <span className="label">Name</span>
                                            <span className="value">{application.student_name}</span>
                                        </div>
                                        <div className="info-row">
                                            <span className="label">Email</span>
                                            <span className="value student-email-link"> {application.student_email}</span>
                                        </div>
                                        <div className="info-row">
                                            <span className="label">Phone</span>
                                            <span className="value">{application.student_phone || 'N/A'}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="info-section">
                                    <h4 className="section-title"><Calendar size={16} /> Course Details</h4>
                                    <div className="info-card course-card">
                                        <div className="course-card-content">
                                            <div className="course-info-text">
                                                <div className="info-row">
                                                    <span className="label">Applied For</span>
                                                    <span className="value course-highlight">{application.course_title}</span>
                                                </div>
                                                <div className="info-row">
                                                    <span className="label">Applied Date</span>
                                                    <span className="value">{formatDate(application.applied_at)}</span>
                                                </div>
                                            </div>
                                            {application.post?.image && (
                                                <div className="course-post-image">
                                                    <img
                                                        src={getStorageUrl(application.post.image)}
                                                        alt={application.course_title}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="info-section message-section">
                                    <h4 className="section-title"><MessageSquare size={16} /> Student Message</h4>
                                    <div className="student-message-box">
                                        {application.message || 'No message provided.'}
                                    </div>
                                </div>
                            </div>

                            {/* Right Column: Reply Form */}
                            <div className="reply-column">
                                <div className="reply-container">
                                    <h4 className="section-title"><Send size={16} /> Send Reply</h4>
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
                                                rows={8}
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
                                            <span>{sending ? 'Sending...' : success ? 'Sent Successfully' : 'Send Reply'}</span>
                                        </button>
                                    </form>
                                    <p className="reply-hint">This will send an email to the student and update the application status to "Contacted".</p>
                                </div>

                                {application.contacted_emails && application.contacted_emails.length > 0 && (
                                    <div className="history-trigger" onClick={() => setShowHistory(!showHistory)}>
                                        <History size={16} />
                                        <span>View Communication History ({application.contacted_emails.length})</span>
                                        <ChevronDown size={16} className={showHistory ? 'rotate' : ''} />
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* History Overlay/Section */}
                        <AnimatePresence>
                            {showHistory && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="history-content"
                                >
                                    <h4 className="section-title">Past Communications</h4>
                                    <div className="history-list">
                                        {application.contacted_emails.map((email, idx) => (
                                            <div key={idx} className="history-item">
                                                <div className="history-header">
                                                    <span className="history-subject">{email.subject}</span>
                                                    <span className="history-date"><Clock size={12} /> {new Date(email.sent_at).toLocaleString()}</span>
                                                </div>
                                                <div className="history-body">{email.message}</div>
                                            </div>
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default ApplicationDetailsModal;
