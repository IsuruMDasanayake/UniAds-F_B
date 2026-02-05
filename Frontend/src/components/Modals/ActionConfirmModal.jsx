import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, AlertTriangle, Loader2 } from 'lucide-react';
import './ActionConfirmModal.css';

const ActionConfirmModal = ({
    isOpen,
    onClose,
    onConfirm,
    isProcessing,
    title,
    message,
    confirmText = "Confirm",
    cancelText = "Cancel",
    type = "success" // 'success' | 'danger'
}) => {
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

    const isDanger = type === 'danger';
    // Dark theme specific colors
    const mainColor = isDanger ? '#ef4444' : '#10b981';
    const iconBgColor = isDanger ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)';

    return createPortal(
        <AnimatePresence>
            {isOpen && (
                <div className="action-confirm-modal-overlay">
                    <motion.div
                        className="action-confirm-modal-content"
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        onClick={e => e.stopPropagation()}
                        style={{
                            maxWidth: '400px',
                            width: '90%',
                            textAlign: 'center',
                            padding: '40px 30px',
                            zIndex: 1000001,
                            borderRadius: '16px',
                            background: '#0f172a', // Dark background
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)',
                            position: 'relative'
                        }}
                    >
                        <button
                            onClick={onClose}
                            style={{
                                position: 'absolute',
                                top: '16px',
                                right: '16px',
                                background: 'transparent',
                                border: 'none',
                                color: '#94a3b8',
                                cursor: 'pointer'
                            }}
                        >
                            <X size={20} />
                        </button>

                        <div style={{
                            color: mainColor,
                            marginBottom: '20px',
                            background: iconBgColor,
                            width: '80px',
                            height: '80px',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 20px auto'
                        }}>
                            {isDanger ? <AlertTriangle size={40} /> : <CheckCircle size={40} />}
                        </div>

                        <h2 style={{ marginBottom: '15px', fontSize: '1.5rem', fontWeight: '800', color: '#fff' }}>{title}</h2>
                        <p style={{ color: '#94a3b8', marginBottom: '30px', lineHeight: '1.6', fontSize: '0.95rem' }}>
                            {message}
                        </p>

                        <div style={{ display: 'flex', gap: '12px' }}>
                            <button
                                onClick={onClose}
                                disabled={isProcessing}
                                style={{
                                    flex: 1,
                                    background: 'transparent',
                                    color: '#fff',
                                    padding: '12px',
                                    borderRadius: '10px',
                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                    fontWeight: '600',
                                    fontSize: '1rem',
                                    cursor: 'pointer',
                                    transition: 'background 0.2s'
                                }}
                                onMouseEnter={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.05)'}
                                onMouseLeave={(e) => e.target.style.background = 'transparent'}
                            >
                                {cancelText}
                            </button>
                            <button
                                onClick={onConfirm}
                                disabled={isProcessing}
                                style={{
                                    flex: 1,
                                    background: mainColor,
                                    color: 'white',
                                    padding: '12px',
                                    borderRadius: '10px',
                                    border: 'none',
                                    fontWeight: '600',
                                    fontSize: '1rem',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '8px',
                                    opacity: isProcessing ? 0.7 : 1
                                }}
                            >
                                {isProcessing ? <Loader2 className="animate-spin" size={20} /> : confirmText}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>,
        document.body
    );
};

export default ActionConfirmModal;
