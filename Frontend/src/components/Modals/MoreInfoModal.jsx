import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, ChevronDown, MessageSquare, Loader2 } from 'lucide-react';
import { useChat } from '../../context/ChatContext';
import ChatService from '../../services/ChatService';
import EncryptionService from '../../services/EncryptionService';
import './MoreInfoModal.css';

const MoreInfoModal = ({ isOpen, onClose, course }) => {
    const { selectConversation, fetchConversations } = useChat();
    const [selectedInquiry, setSelectedInquiry] = useState('Course Duration & Schedule');
    const [customInquiry, setCustomInquiry] = useState('');
    const [isSending, setIsSending] = useState(false);

    const inquiries = [
        'Course Fee',
        'Next Intake',
        'Entry Requirements',
        'Scholarships & Discounts',
        'Course Duration & Schedule',
        'Other'
    ];

    const handleSendMessage = async () => {
        if (!course || isSending) return;

        const finalInquiry = selectedInquiry === 'Other' ? customInquiry.trim() : selectedInquiry;
        if (selectedInquiry === 'Other' && !finalInquiry) {
            alert('Please specify your inquiry.');
            return;
        }

        setIsSending(true);

        try {
            // 1. Initialize conversation - this is the only one we really need to wait for
            const response = await ChatService.startConversation('institute', course.institute_id);
            const conversation = response.data.data;

            // 2. Open chat UI immediately for a "premium" fast feel
            onClose(); // Close the inquiry modal
            await selectConversation(conversation); // Open chat and load messages

            // 3. Send messages in the background (don't block the UI)
            const postUrl = `${window.location.origin}/post/${course.share_link}`;
            const messageText = selectedInquiry === 'Other'
                ? `Hello, I have a specific question about this course: ${finalInquiry}`
                : `Hello, I would like to know more about the "${finalInquiry}" for this course.`;

            // Fire and forget (or rather, background processing)
            (async () => {
                try {
                    // Encrypt both messages before background sending
                    const encryptedUrl = await EncryptionService.encrypt(postUrl, conversation.id);
                    const encryptedText = await EncryptionService.encrypt(messageText, conversation.id);

                    await ChatService.sendMessage(conversation.id, encryptedUrl);
                    await ChatService.sendMessage(conversation.id, encryptedText);
                    // Single refresh after both are sent
                    await fetchConversations();
                } catch (e) {
                    console.error("Background message sending failed:", e);
                }
            })();

        } catch (error) {
            console.error('Failed to start inquiry:', error);
            alert('Failed to start conversation. Please try again.');
        } finally {
            setIsSending(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="courses-modal-overlay" onClick={onClose}>
                    <motion.div
                        className="courses-modal-content inquiry-modal"
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        onClick={e => e.stopPropagation()}
                    >
                        <button className="modal-close-trigger" onClick={onClose}><X size={24} /></button>

                        <div className="inquiry-modal-header">
                            <div className="icon-badge">
                                <MessageSquare size={24} color="var(--c-primary)" />
                            </div>
                            <h2>Quick Inquiry</h2>
                            <p>Send a message to <strong>{course?.institute?.institute_name}</strong> about this course.</p>
                        </div>

                        <div className="inquiry-form">
                            <label>What would you like to ask?</label>
                            <div className="select-wrapper">
                                <select
                                    value={selectedInquiry}
                                    onChange={(e) => setSelectedInquiry(e.target.value)}
                                    disabled={isSending}
                                >
                                    {inquiries.map(q => (
                                        <option key={q} value={q}>{q}</option>
                                    ))}
                                </select>
                                <ChevronDown className="select-icon" size={18} />
                            </div>

                            {selectedInquiry === 'Other' && (
                                <motion.div
                                    className="custom-inquiry-area"
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                >
                                    <textarea
                                        placeholder="Type your question here..."
                                        value={customInquiry}
                                        onChange={(e) => setCustomInquiry(e.target.value)}
                                        disabled={isSending}
                                        rows={3}
                                    />
                                </motion.div>
                            )}

                            <button
                                className="send-inquiry-btn"
                                onClick={handleSendMessage}
                                disabled={isSending}
                            >
                                {isSending ? (
                                    <>Sending... <Loader2 size={18} className="animate-spin" /></>
                                ) : (
                                    <>Send Message <Send size={18} /></>
                                )}
                            </button>
                        </div>

                        <p className="inquiry-footer-note">
                            This will start a chat session with the institute.
                        </p>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default MoreInfoModal;
