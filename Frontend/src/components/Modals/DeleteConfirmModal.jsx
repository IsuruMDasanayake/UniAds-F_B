import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, Loader2, AlertTriangle } from 'lucide-react';

const DeleteConfirmModal = ({ isOpen, onClose, onConfirm, isDeleting, title }) => {
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
                <div className="courses-modal-overlay" onClick={onClose} style={{ zIndex: 1000000 }}>
                    <motion.div
                        className="courses-modal-content delete-modal"
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        onClick={e => e.stopPropagation()}
                        style={{ maxWidth: '400px', width: '90%', textAlign: 'center', padding: '40px 30px', zIndex: 1000001, borderRadius: '24px' }}
                    >
                        <button className="modal-close-trigger" onClick={onClose}><X size={24} /></button>

                        <div style={{ color: '#ff4757', marginBottom: '20px' }}>
                            <AlertTriangle size={50} style={{ margin: '0 auto' }} />
                        </div>

                        <h2 style={{ marginBottom: '15px', fontSize: '1.5rem', fontWeight: '800', color: '#1e293b' }}>Confirm Deletion</h2>
                        <p style={{ color: '#64748b', marginBottom: '30px', lineHeight: '1.6', fontSize: '0.95rem' }}>
                            Are you sure you want to delete this? <br /> <span style={{ fontWeight: '700' }}>This cannot be undone</span>
                        </p>

                        <div style={{ display: 'flex', gap: '12px' }}>
                            <button
                                className="action-btn"
                                onClick={onClose}
                                style={{
                                    flex: 1,
                                    background: '#e2e8f0',
                                    color: '#475569',
                                    padding: '14px',
                                    borderRadius: '12px',
                                    border: 'none',
                                    fontWeight: '700',
                                    fontSize: '1rem',
                                    cursor: 'pointer'
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                className="action-btn"
                                onClick={onConfirm}
                                disabled={isDeleting}
                                style={{
                                    flex: 1,
                                    background: '#ff4757',
                                    color: 'white',
                                    padding: '14px',
                                    borderRadius: '12px',
                                    border: 'none',
                                    fontWeight: '700',
                                    fontSize: '1rem',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '8px',
                                    boxShadow: '0 4px 12px rgba(255, 71, 87, 0.3)'
                                }}
                            >
                                {isDeleting ? <Loader2 className="animate-spin" size={20} /> : (
                                    <>
                                        Yes, Delete
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

export default DeleteConfirmModal;
