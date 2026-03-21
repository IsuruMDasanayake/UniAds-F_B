import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Info, Link2, Check } from 'lucide-react';
import { getStorageUrl } from '../../lib/config';
import { copyToClipboard } from '../../lib/clipboard';
import axiosClient from '../../lib/axios';
import './ProgrammeInfoModal.css';

const ProgrammeInfoModal = ({ course, isOpen, onClose, onApply, onMoreInfo, userRole, isPremium, institute: explicitInstitute, hideApply = false }) => {
    const [copied, setCopied] = useState(false);

    // Use explicit institute prop if provided, otherwise fallback to course.institute
    const activeInstitute = explicitInstitute || course?.institute;

    React.useEffect(() => {
        if (isOpen && course?.id) {
            axiosClient.post(`/api/posts/${course.id}/track-view`).catch(err => {
                console.error("Failed to track post view:", err);
            });
        }
    }, [isOpen, course?.id]);

    const handleCopyLink = () => {
        if (!course?.share_link) return;
        const url = `${window.location.origin}/post/${course.share_link}`;
        copyToClipboard(url).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }).catch(err => {
            console.error('Copy failed:', err);
        });
    };
    return (
        <AnimatePresence>
            {isOpen && course && (
                <div className="programme-info-modal-overlay" onClick={onClose}>
                    <motion.div
                        className="programme-info-modal-content"
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Fixed Header */}
                        <div className="programme-info-modal-header">
                            <h2 className="programme-info-modal-title">{course.title}</h2>
                            <button className="programme-info-modal-close" onClick={onClose}>
                                <X size={24} />
                            </button>
                        </div>

                        {/* Scrollable Content */}
                        <div className="programme-info-modal-scroll">
                            <img
                                src={course.image ? getStorageUrl(course.image) : getStorageUrl(course.image_path) || '/images/default-course.jpg'}
                                alt={course.title}
                                className="programme-info-modal-img"
                            />

                            <div className="programme-info-modal-attributes">
                                <div className="programme-info-modal-attr-item">
                                    <span className="programme-info-modal-attr-label">Course Category:</span>
                                    <span className="programme-info-modal-attr-value">{course.course_name || 'N/A'}</span>
                                </div>
                                <div className="programme-info-modal-attr-item">
                                    <span className="programme-info-modal-attr-label">Course Type:</span>
                                    <span className="programme-info-modal-attr-value">{course.course_type || 'N/A'}</span>
                                </div>
                                <div className="programme-info-modal-attr-item">
                                    <span className="programme-info-modal-attr-label">Location(s):</span>
                                    <span className="programme-info-modal-attr-value">{course.location || 'N/A'}</span>
                                </div>
                                <div className="programme-info-modal-attr-item">
                                    <span className="programme-info-modal-attr-label">Duration:</span>
                                    <span className="programme-info-modal-attr-value">{course.duration || 'N/A'}</span>
                                </div>
                                <div className="programme-info-modal-attr-item">
                                    <span className="programme-info-modal-attr-label">Format:</span>
                                    <span className="programme-info-modal-attr-value">{course.course_format || 'N/A'}</span>
                                </div>
                                <div className="programme-info-modal-attr-item">
                                    <span className="programme-info-modal-attr-label">Attendance:</span>
                                    <span className="programme-info-modal-attr-value">{course.attendance_type || 'N/A'}</span>
                                </div>
                            </div>

                            <div className="programme-info-modal-body">
                                <p className="programme-info-modal-desc">{course.description}</p>
                            </div>
                        </div>

                        {/* Fixed Footer */}
                        <div className="programme-info-modal-footer">
                            {userRole === 'User' && (
                                <>
                                    {(activeInstitute?.applications_enabled !== false && Number(activeInstitute?.applications_enabled) !== 0 && !hideApply) && (
                                        <button className="programme-info-apply-btn" onClick={onApply}>
                                            Apply Now <Send size={18} />
                                        </button>
                                    )}
                                    {isPremium && (activeInstitute?.chat_enabled !== false && Number(activeInstitute?.chat_enabled) !== 0) && (
                                        <button className="programme-info-info-btn" onClick={onMoreInfo}>
                                            Get More Info <Info size={18} />
                                        </button>
                                    )}
                                </>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default ProgrammeInfoModal;
