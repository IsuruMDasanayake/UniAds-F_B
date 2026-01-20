import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Info } from 'lucide-react';
import { getStorageUrl } from '../../lib/config';
import './ProgrammeInfoModal.css';

const ProgrammeInfoModal = ({ course, isOpen, onClose, onApply, onMoreInfo, userRole }) => {
    return (
        <AnimatePresence>
            {isOpen && course && (
                <div className="courses-modal-overlay" onClick={onClose}>
                    <motion.div
                        className="courses-modal-content"
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        onClick={e => e.stopPropagation()}
                    >
                        <button className="modal-close-trigger" onClick={onClose}><X size={24} /></button>
                        <img
                            src={course.image ? getStorageUrl(course.image) : getStorageUrl(course.image_path) || '/images/default-course.jpg'}
                            alt={course.title}
                            className="modal-img"
                        />
                        <div className="modal-body">
                            <h2>{course.title}</h2>
                            <p className="modal-desc">{course.description}</p>
                            {userRole === 'User' && (
                                <div className="modal-footer">
                                    <button className="apply-btn" onClick={onApply}>
                                        Apply Now <Send size={18} />
                                    </button>
                                    <button className="info-btn" onClick={onMoreInfo}>
                                        Get More Info <Info size={18} />
                                    </button>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default ProgrammeInfoModal;
