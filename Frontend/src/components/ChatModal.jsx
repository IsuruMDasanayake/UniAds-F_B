import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, User, Minus, Phone, Video, PlusCircle, Image as ImageIcon, StickyNote, Gift, ThumbsUp } from 'lucide-react';
import { useChat } from '../context/ChatContext';
import { getStorageUrl } from '../lib/config';
import LinkPreview from './LinkPreview';
import './Messenger.css';

const ChatModal = () => {
    const { activeConversation, setActiveConversation, messages, sendMessage, displayUser } = useChat();
    const [inputValue, setInputValue] = useState('');
    const [isSending, setIsSending] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async (e) => {
        if (e) e.preventDefault();
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
                className="chat-modal-floating fb-style"
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
            >
                <div className="chat-modal-header fb">
                    <div className="header-left">
                        <div className="avatar-stack">
                            {other?.institute?.profile_photo ? (
                                <img src={getStorageUrl(other.institute.profile_photo)} alt="Avatar" />
                            ) : (
                                <div className="avatar-placeholder small">
                                    <User size={16} />
                                </div>
                            )}
                            <span className="online-indicator"></span>
                        </div>
                        <div className="user-info">
                            <h4>{other?.institute?.institute_name || other?.user?.name || 'Chat'}</h4>
                            <span>Active now</span>
                        </div>
                    </div>
                    <div className="header-actions-fb">
                        <button title="Voice Call"><Phone size={18} /></button>
                        <button title="Video Call"><Video size={18} /></button>
                        <button title="Minimize"><Minus size={18} /></button>
                        <button onClick={() => setActiveConversation(null)} className="close-chat" title="Close">
                            <X size={18} />
                        </button>
                    </div>
                </div>

                <div className="chat-messages-area fb">
                    {[...messages].reverse().map((msg, index) => {
                        // Current user check
                        const isMine = displayUser?.role === 'User'
                            ? msg.sender_user_id === displayUser.id
                            : msg.sender_institute_id === displayUser.institute_id;

                        return (
                            <div key={msg.id || index} className={`message-row-fb ${isMine ? 'mine' : 'theirs'}`}>
                                {!isMine && (
                                    <div className="msg-avatar">
                                        {other?.institute?.profile_photo && (
                                            <img src={getStorageUrl(other.institute.profile_photo)} alt="avatar" />
                                        )}
                                    </div>
                                )}
                                <div className="message-bubble-fb">
                                    {msg.message}
                                    {msg.link_preview_data && <LinkPreview data={msg.link_preview_data} />}
                                </div>
                            </div>
                        );
                    })}
                    <div ref={messagesEndRef} />
                </div>

                <div className="chat-input-area-fb">
                    <div className="input-actions-left">
                        <button><PlusCircle size={20} /></button>
                        <button><ImageIcon size={20} /></button>
                        <button><StickyNote size={20} /></button>
                        <button><Gift size={20} /></button>
                    </div>
                    <form className="input-wrapper-fb" onSubmit={handleSend}>
                        <input
                            type="text"
                            placeholder="Aa"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                        />
                        <button type="button" className="emoji-btn">😀</button>
                    </form>
                    <div className="input-actions-right">
                        {inputValue.trim() ? (
                            <button onClick={handleSend} className="send-btn-fb"><Send size={20} /></button>
                        ) : (
                            <button className="like-btn-fb"><ThumbsUp size={20} /></button>
                        )}
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
};

export default ChatModal;

