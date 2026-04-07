import React, { useState, useEffect } from 'react';
import axiosClient from '../../lib/axios';
import FeedbackModal from './FeedbackModal';

const GlobalFeedbackModal = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [status, setStatus] = useState({ type: '', message: '' });

    useEffect(() => {
        const handleShowFeedback = async () => {
            try {
                // Check if user is eligible to give feedback
                const response = await axiosClient.get('/api/feedback/check-eligibility');
                if (response.data.data?.eligible) {
                    setIsOpen(true);
                    setStatus({ type: '', message: '' });
                }
            } catch (error) {
                console.error("Error checking feedback eligibility:", error?.message || error);
            }
        };

        window.addEventListener('showFeedbackModal', handleShowFeedback);

        return () => {
            window.removeEventListener('showFeedbackModal', handleShowFeedback);
        };
    }, []);

    const handleSubmit = async (data) => {
        setIsSubmitting(true);
        setStatus({ type: '', message: '' });
        try {
            await axiosClient.post('/api/feedback', data);
            setStatus({ type: 'success', message: 'Thank you for your valuable feedback!' });
            setTimeout(() => {
                setIsOpen(false);
            }, 3000);
        } catch (error) {
            console.error('Error submitting feedback:', error?.message || error);
            setStatus({ type: 'error', message: error.response?.data?.message || 'Failed to submit feedback. Please try again later.' });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <FeedbackModal
            isOpen={isOpen}
            onClose={() => setIsOpen(false)}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            status={status}
        />
    );
};

export default GlobalFeedbackModal;
