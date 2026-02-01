import React from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Lock } from 'lucide-react';
import './AccessDeniedModal.css';

const AccessDeniedModal = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return createPortal(
        <AnimatePresence>
            {isOpen && (
                <div className="access-denied-overlay" onClick={onClose}>
                    <motion.div
                        className="access-denied-content"
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        onClick={e => e.stopPropagation()}
                    >
                        <button className="close-btn" onClick={onClose}>
                            <X size={20} />
                        </button>

                        <div className="icon-wrapper">
                            <Lock size={32} />
                        </div>

                        <h2>Access Restricted</h2>
                        <p>
                            Your account is currently <strong>pending approval</strong>.
                            <br />
                            You cannot create posts or events until your institute account is verified and approved by an administrator.
                        </p>

                        <button className="primary-btn" onClick={onClose}>
                            Got it
                        </button>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>,
        document.body
    );
};

export default AccessDeniedModal;
