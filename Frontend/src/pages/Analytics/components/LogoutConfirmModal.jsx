import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, LogOut, Loader2, AlertCircle } from 'lucide-react';
import './LogoutConfirmModal.css';

const LogoutConfirmModal = ({ isOpen, onClose, onConfirm, isLoading }) => {
    const [mounted, setMounted] = React.useState(false);

    React.useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    React.useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }
        return () => { document.body.style.overflow = 'auto'; };
    }, [isOpen]);

    if (!mounted) return null;

    return createPortal(
        <AnimatePresence>
            {isOpen && (
                <div className="lm-overlay" onClick={onClose}>
                    <motion.div
                        className="lm-card"
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        transition={{ type: "spring", duration: 0.5, bounce: 0.3 }}
                        onClick={e => e.stopPropagation()}
                    >
                        <button className="lm-close" onClick={onClose}>
                            <X size={20} />
                        </button>

                        <div className="lm-icon-wrapper">
                            <AlertCircle size={48} />
                        </div>

                        <h2 className="lm-title">Sign Out All Devices?</h2>
                        <p className="lm-description">
                            Are you sure you want to log out from all devices?
                            <br />
                            <span>You will be signed out from this current session as well.</span>
                        </p>

                        <div className="lm-actions">
                            <button
                                className="lm-btn cancel"
                                onClick={onClose}
                                disabled={isLoading}
                            >
                                Stay Signed In
                            </button>
                            <button
                                className="lm-btn confirm"
                                onClick={onConfirm}
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <Loader2 className="animate-spin" size={20} />
                                ) : (
                                    <>
                                        <LogOut size={18} />
                                        Logout Everywhere
                                    </>
                                )}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>,
        document.body
    );
};

export default LogoutConfirmModal;
