import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2 } from 'lucide-react';
import './ApplyNowModal.css';

const ApplyNowModal = ({ isOpen, onClose, courseTitle, form, onChange, onSubmit, isSubmitting, status }) => {
    useEffect(() => {
        if (status && status.type === 'success') {
            // Trigger the global feedback modal after a short delay
            const timer = setTimeout(() => {
                window.dispatchEvent(new CustomEvent('showFeedbackModal'));
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [status]);

    return createPortal(
        <AnimatePresence>
            {isOpen && (
                <div className="courses-modal-overlay" onClick={onClose} style={{ zIndex: 99999 }}>
                    <motion.div
                        className="courses-modal-content apply-modal"
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        onClick={e => e.stopPropagation()}
                    >
                        <button className="modal-close-trigger" onClick={onClose}><X size={24} /></button>
                        <h2>Apply for {courseTitle}</h2>

                        {status && status.message && (
                            <div className={`alert-message ${status.type === 'error' ? 'alert-error' : 'alert-success'}`}>
                                {status.message}
                            </div>
                        )}

                        <form onSubmit={onSubmit} className="apply-form">
                            <div className="form-group">
                                <label>Your Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={form.name}
                                    onChange={onChange}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Your Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={form.email}
                                    onChange={onChange}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Phone Number</label>
                                <input
                                    type="text"
                                    name="phone"
                                    value={form.phone}
                                    onChange={onChange}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Message</label>
                                <textarea
                                    name="message"
                                    value={form.message}
                                    onChange={onChange}
                                    rows="3"
                                    required
                                ></textarea>
                            </div>
                            <div className="consent-group">
                                <input
                                    type="checkbox"
                                    id="consent"
                                    name="privacy_consent"
                                    checked={form.privacy_consent}
                                    onChange={onChange}
                                    required
                                />
                                <label htmlFor="consent">
                                    Yes, I agree to share my details with the institute and acknowledge UniAds' <Link to="/privacy-policy" target="_blank" rel="noopener noreferrer">Privacy Policy</Link> & <Link to="/terms-conditions" target="_blank" rel="noopener noreferrer">Terms & Conditions</Link>.
                                </label>
                            </div>
                            <button type="submit" className="submit-application" disabled={isSubmitting}>
                                {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : 'Send Application'}
                            </button>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>,
        document.body
    );
};

export default ApplyNowModal;
