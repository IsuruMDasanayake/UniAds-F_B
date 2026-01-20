import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import './MoreInfoModal.css';

const MoreInfoModal = ({ isOpen, onClose, contactNumber }) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <div className="courses-modal-overlay" onClick={onClose}>
                    <motion.div
                        className="courses-modal-content info-modal"
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        onClick={e => e.stopPropagation()}
                    >
                        <button className="modal-close-trigger" onClick={onClose}><X size={24} /></button>
                        <h2>More Information</h2>
                        <div className="info-content">
                            <p>For more information about this course, please call the institute directly:</p>
                            <div className="contact-reveal">
                                <span className="phone-num">{contactNumber}</span>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default MoreInfoModal;
