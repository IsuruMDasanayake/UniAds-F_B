import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, LogOut, Loader2, AlertCircle } from 'lucide-react';
import './LogoutConfirmModal.css';

const LogoutConfirmModal = ({ isOpen, onClose, onConfirm, isLoading }) => {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    useEffect(() => {
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
                <div className="logout-modal-overlay" onClick={onClose}>
                    <motion.div
                        className="logout-modal-card"
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        transition={{ type: "spring", duration: 0.5, bounce: 0.3 }}
                        onClick={e => e.stopPropagation()}
                    >
                        <button className="logout-modal-close" onClick={onClose}>
                            <X size={20} />
                        </button>

                        <div className="logout-modal-icon-wrapper">
                            <AlertCircle size={48} />
                        </div>

                        <h2 className="logout-modal-title">Sign Out All Devices?</h2>
                        <p className="logout-modal-description">
                            Are you sure you want to log out from all devices?
                            <br />
                            <span>You will be signed out from this current session as well.</span>
                        </p>

                        <div className="logout-modal-actions">
                            <button
                                className="logout-modal-btn cancel"
                                onClick={onClose}
                                disabled={isLoading}
                            >
                                Stay Signed In
                            </button>
                            <button
                                className="logout-modal-btn confirm"
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
