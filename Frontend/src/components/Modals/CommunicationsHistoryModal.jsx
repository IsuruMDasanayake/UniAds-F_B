import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, MessageSquare, Calendar, History, ExternalLink } from 'lucide-react';
import './CommunicationsHistoryModal.css';

const CommunicationsHistoryModal = ({ isOpen, onClose, history, loading }) => {
    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="modal-overlay-v2" onClick={onClose}>
                <motion.div
                    id="communications-history-modal"
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="modal-container-v2"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="modal-header">
                        <div className="header-info">
                            <div className="header-title-row">
                                <History size={20} className="header-icon" />
                                <h3>Communication History</h3>
                            </div>
                            <div className="header-meta-row">
                                {history.length > 0 && (
                                    <span className={`type-badge ${history[0].type}`}>
                                        {history[0].type === 'application' ? 'Course inquiry' : 'General inquiry'}
                                    </span>
                                )}
                                <span className="history-count">{history.length} messages sent</span>
                            </div>
                        </div>
                        <button className="close-btn" onClick={onClose}><X size={20} /></button>
                    </div>

                    <div className="modal-body">
                        {loading ? (
                            <div className="history-skeletons">
                                {[1, 2, 3, 4].map((i) => (
                                    <div key={i} className="history-skeleton-item">
                                        <div className="skeleton-col">
                                            <div className="skeleton skeleton-title"></div>
                                            <div className="skeleton skeleton-text" style={{ width: '40%' }}></div>
                                        </div>
                                        <div className="skeleton-col">
                                            <div className="skeleton skeleton-text"></div>
                                            <div className="skeleton skeleton-text" style={{ width: '80%' }}></div>
                                        </div>
                                        <div className="skeleton-col" style={{ width: '100px' }}>
                                            <div className="skeleton skeleton-text"></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : history.length === 0 ? (
                            <div className="empty-history">
                                <Mail size={48} />
                                <p>No communication history found.</p>
                            </div>
                        ) : (
                            <div className="history-table-wrapper">
                                <table className="history-table">
                                    <thead>
                                        <tr>
                                            <th>
                                                {history.length > 0 && history[0].type === 'application'
                                                    ? 'Course & Student'
                                                    : 'Subject & Sender'}
                                            </th>
                                            <th>Message Details</th>
                                            <th>Sent Date</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {history.map((item, index) => (
                                            <tr key={item.type + (item.id || index)}>
                                                <td>
                                                    <div className="history-entity">
                                                        <span className="course-name">
                                                            {item.type === 'application'
                                                                ? (item.apply_case?.course_title || 'Unknown Course')
                                                                : (item.inquiry?.subject || 'General Inquiry')}
                                                        </span>
                                                        <span className="student-email">
                                                            <Mail size={12} /> {item.type === 'application' ? item.student_email : item.inquiry?.email}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="message-preview">
                                                        <span className="message-subject">{item.subject}</span>
                                                        <p className="message-text">{item.message}</p>
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="sent-date">
                                                        <Calendar size={12} />
                                                        <span>{new Date(item.sent_at).toLocaleDateString()}</span>
                                                        <span className="sent-time">{new Date(item.sent_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default CommunicationsHistoryModal;
