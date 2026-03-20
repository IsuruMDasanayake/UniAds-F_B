import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Star } from 'lucide-react';
import './FeedbackModal.css';

const FeedbackModal = ({ isOpen, onClose, onSubmit, isSubmitting, status }) => {
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [message, setMessage] = useState('');
    const [timeLeft, setTimeLeft] = useState(20);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (rating === 0) return;
        onSubmit({ rating, message });
    };

    // Timer logic
    React.useEffect(() => {
        let timer;
        if (isOpen && timeLeft > 0 && rating === 0 && message.trim() === '') {
            timer = setInterval(() => {
                setTimeLeft(prev => prev - 1);
            }, 1000);
        } else if (timeLeft === 0 && isOpen && rating === 0 && message.trim() === '') {
            onClose();
        }

        return () => clearInterval(timer);
    }, [isOpen, timeLeft, rating, message, onClose]);

    // Reset state when modal opens
    React.useEffect(() => {
        if (isOpen) {
            setRating(0);
            setHoverRating(0);
            setMessage('');
            setTimeLeft(20);
        }
    }, [isOpen]);

    return createPortal(
        <AnimatePresence>
            {isOpen && (
                <div className="fdbk-modal-overlay">
                    <motion.div
                        className="fdbk-modal-container"
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        onClick={e => e.stopPropagation()}
                    >
                        
                        <div className="fdbk-header">
                            <h2>How was your experience?</h2>
                            <p>Your feedback helps us improve the platform for everyone.</p>
                            {timeLeft > 0 && timeLeft < 20 && rating === 0 && message.trim() === '' && (
                                <div className="fdbk-timer">Closing in {timeLeft} seconds...</div>
                            )}
                        </div>

                        {status && status.message && (
                            <div className={`fdbk-alert ${status.type === 'error' ? 'fdbk-alert-error' : 'fdbk-alert-success'}`}>
                                {status.message}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="fdbk-form">
                            <div className="fdbk-star-rating">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        type="button"
                                        key={star}
                                        className={`fdbk-star-btn ${star <= (hoverRating || rating) ? 'active' : ''}`}
                                        onMouseEnter={() => setHoverRating(star)}
                                        onMouseLeave={() => setHoverRating(0)}
                                        onClick={() => setRating(star)}
                                    >
                                        <Star size={36} fill={star <= (hoverRating || rating) ? "currentColor" : "none"} />
                                    </button>
                                ))}
                            </div>
                            
                            <div className="fdbk-form-group">
                                <label>Tell us more (Optional)</label>
                                <textarea
                                    name="message"
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    rows="4"
                                    placeholder="What did you like? What can we improve?"
                                    maxLength="1000"
                                ></textarea>
                            </div>

                            <button 
                                type="submit" 
                                className="fdbk-submit-btn" 
                                disabled={isSubmitting || rating === 0}
                            >
                                {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : 'Submit Feedback'}
                            </button>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>,
        document.body
    );
};

export default FeedbackModal;
