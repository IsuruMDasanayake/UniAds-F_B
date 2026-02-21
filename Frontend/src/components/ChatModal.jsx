import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, User, ChevronDown } from 'lucide-react';
import { useChat } from '../context/ChatContext';
import { getStorageUrl } from '../lib/config';
import LinkPreview from './LinkPreview';
import './Messenger.css';

const ChatModal = () => {
    const { activeConversation, setActiveConversation, messages, sendMessage } = useChat();
    const [inputValue, setInputValue] = useState('');
    const [isSending, setIsSending] = useState(false);
    const messagesEndRef = useRef(null);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!inputValue.trim() || isSending) return;

        setIsSending(true);
        try {
            await sendMessage(inputValue);
            setInputValue('');
        } catch (error) {
            console.error('Failed to send:', error);
        } finally {
            setIsSending(false);
        }
    };

    if (!activeConversation) return null;

    const other = activeConversation.other_participant;

    return (
        <AnimatePresence>
            <motion.div
                className="chat-modal-floating"
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
            >
                <div className="chat-modal-header">
                    <div className="header-user">
                        {other?.institute?.profile_photo ? (
                            <img src={getStorageUrl(other.institute.profile_photo)} alt="Avatar" />
                        ) : (
                            <div className="avatar-placeholder small">
                                <User size={16} />
                            </div>
                        )}
                        <h4>{other?.institute?.institute_name || other?.user?.name || 'Chat'}</h4>
                    </div>
                    <div className="header-actions">
                        <button onClick={() => setActiveConversation(null)} className="close-chat">
                            <X size={20} />
                        </button>
                    </div>
                </div>

                <div className="chat-messages-area">
                    <div ref={messagesEndRef} />
                    {messages.map((msg, index) => {
                        // Logic to determine "mine" vs "theirs"
                        // If I'm an institute, sender_institute_id matches mine
                        // etc.
                        const isMine = msg.sender_user_id ? true : false; // Simplistic for now

                        return (
                            <div key={msg.id || index} className={`message-bubble ${isMine ? 'mine' : 'theirs'}`}>
                                {msg.message}
                                {msg.link_preview_data && <LinkPreview data={msg.link_preview_data} />}
                            </div>
                        );
                    })}
                </div>

                <form className="chat-input-area" onSubmit={handleSend}>
                    <input
                        type="text"
                        placeholder="Type a message..."
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                    />
                    <button type="submit" disabled={isSending}>
                        <Send size={18} />
                    </button>
                </form>
            </motion.div>
        </AnimatePresence>
    );
};

export default ChatModal;
