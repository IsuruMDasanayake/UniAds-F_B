import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, User, Minus, Phone, Video, PlusCircle, Image as ImageIcon, StickyNote, Gift, ThumbsUp, Loader2, Clock } from 'lucide-react';
import { format, isToday, isThisYear } from 'date-fns';
import { useChat } from '../context/ChatContext';
import { getStorageUrl } from '../lib/config';
import LinkPreview from './LinkPreview';
import './Messenger.css';

const ChatModal = () => {
    const { activeConversation, setActiveConversation, messages, sendMessage, displayUser, isMessagesLoading } = useChat();
    const [inputValue, setInputValue] = useState('');
    const messagesEndRef = useRef(null);
 
    const formatMessageDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        const time = format(date, 'HH:mm');
 
        if (isToday(date)) {
            return `Today at ${time}`;
        }
 
        if (isThisYear(date)) {
            return `${format(date, 'MMM d').toUpperCase()} at ${time}`;
        }
 
        return `${format(date, 'MMM d, yyyy').toUpperCase()} at ${time}`;
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        // Ensure DOM has fully painted the new messages or finished loading animations before scrolling
        const scrollTimeout = setTimeout(() => {
            scrollToBottom();
        }, 50);

        return () => clearTimeout(scrollTimeout);
    }, [messages, isMessagesLoading, activeConversation]);

    const handleSend = (e) => {
        if (e) e.preventDefault();
        const content = inputValue.trim();
        if (!content) return;

        setInputValue('');
        sendMessage(content).catch(error => {
            console.error('Failed to send:', error);
            if (error.response?.status === 422 && error.response?.data?.message) {
                alert(error.response.data.message);
            } else {
                alert('Failed to send message. Please check your connection.');
            }
        });
    };

    const handleSendLike = () => {
        sendMessage('(like)').catch(error => {
            console.error('Failed to send like:', error);
            alert('Failed to send. Please try again.');
        });
        scrollToBottom();
    };

    if (!activeConversation) return null;

    let other = activeConversation.other_participant;
    if (!other && activeConversation.participants) {
        other = activeConversation.participants.find(p => {
            if (displayUser?.role === 'User') {
                return p.user_id !== displayUser?.id;
            } else {
                // If logged in as institute, find the participant that isn't THIS institute
                return p.institute_id !== displayUser?.institute_id;
            }
        });
    }

    return createPortal(
        <AnimatePresence>
            <>
                {/* Modal Overlay for matching mobile backdrop */}
                <motion.div
                    className="chat-modal-overlay"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setActiveConversation(null)}
                />
                <motion.div
                    className="chat-modal-floating fb-style"
                    initial={{ opacity: 0, y: 50, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 50, scale: 0.95 }}
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                >
                    <div className="chat-modal-header fb">
                        <div className="header-left">
                            <div className="avatar-stack">
                                {other?.institute?.profile_photo ? (
                                    <img src={getStorageUrl(other.institute.profile_photo)} alt="Avatar" />
                                ) : (
                                    <div className="avatar-placeholder">
                                        <User size={20} />
                                    </div>
                                )}
                                {/* <span className="online-indicator"></span> */}
                            </div>
                            <div className="user-info">
                                <h4>{other?.institute?.institute_name || other?.user?.name || 'Chat'}</h4>
                                {/* <span>Active now</span> */}
                            </div>
                        </div>
                        <div className="header-actions-fb">
                            {/* <button title="Voice Call"><Phone size={18} /></button>
                            <button title="Video Call"><Video size={18} /></button>
                            <button title="Minimize"><Minus size={18} /></button> */}
                            <button onClick={() => setActiveConversation(null)} className="close-chat" title="Close">
                                <X size={18} />
                            </button>
                        </div>
                    </div>

                    <div className="chat-messages-area fb premium-scroll">
                        {isMessagesLoading ? (
                            <div className="chat-loading-centered">
                                <Loader2 size={32} className="chat-loader-spin" />
                            </div>
                        ) : messages.length === 0 ? (
                            <div className="chat-welcome-section">
                                <div className="welcome-avatar-large">
                                    {other?.institute?.profile_photo || other?.user?.profile_photo ? (
                                        <img src={getStorageUrl(other?.institute?.profile_photo || other?.user?.profile_photo)} alt="avatar" />
                                    ) : (
                                        <div className="avatar-placeholder-large">
                                            <User size={48} />
                                        </div>
                                    )}
                                </div>
                                <h3>{other?.institute?.institute_name || other?.user?.name || 'Chat'}</h3>
                                <p className="welcome-msg">You're now connected! Send a message to start your conversation.</p>
                                
                                <div className="encryption-badge">
                                    <svg viewBox="0 0 24 24" width="12" height="12" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                                    <span>End-to-end encrypted</span>
                                </div>
                            </div>
                        ) : (
                            [...messages].reverse().map((msg, index) => {
                                // Current user check
                                let isMine = false;
                                if (displayUser?.role === 'User' || !displayUser?.institute_id) {
                                    isMine = msg.sender_user_id === displayUser?.id;
                                } else {
                                    isMine = msg.sender_institute_id === displayUser?.institute_id;
                                }

                                return (
                                    <div key={msg.id || index} className={`message-row-fb ${isMine ? 'mine' : 'theirs'}`}>
                                        {!isMine && (
                                            <div className="msg-avatar">
                                                {other?.institute?.profile_photo ? (
                                                    <img src={getStorageUrl(other.institute.profile_photo)} alt="avatar" />
                                                ) : (
                                                    <div className="avatar-placeholder" style={{ width: '100%', height: '100%', borderRadius: '50%', background: 'var(--c-slate-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--c-slate-400)' }}>
                                                        <User size={14} />
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                        <div className="message-bubble-wrapper-fb">
                                            <div className={`message-bubble-fb ${msg.link_preview_data?.is_internal_post ? 'internal-post' : ''} ${msg.message === '(like)' ? 'like-icon-bubble' : ''}`}>
                                                {(() => {
                                                    if (msg.message === '(like)') {
                                                        return <ThumbsUp size={32} className="chat-sent-like" />;
                                                    }

                                                    const isInternalLink = msg.message?.match(/\/post\/([a-f_A-F0-9\-]+)/);
                                                    const hasBackendPreview = msg.link_preview_data;

                                                    if (isInternalLink && !hasBackendPreview) {
                                                        return <LinkPreview url={msg.message} />;
                                                    } else if (hasBackendPreview) {
                                                        return (
                                                            <>
                                                                {!msg.link_preview_data.is_internal_post && <span>{msg.message}</span>}
                                                                <LinkPreview data={msg.link_preview_data} />
                                                            </>
                                                        );
                                                    } else {
                                                        return <span>{msg.message}</span>;
                                                    }
                                                })()}
                                            </div>
                                            <span className="chat-message-time-fb">
                                                {formatMessageDate(msg.created_at)}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    <div className="chat-input-area-fb">
                        {/* <div className="input-actions-left">
                            <button title="Add More"><PlusCircle size={20} /></button>
                            <button title="Attach Image"><ImageIcon size={20} /></button>
                            <button title="Attach File"><StickyNote size={20} /></button>
                            <button title="Send Gift"><Gift size={20} /></button>
                        </div> */}
                        <form className="input-wrapper-fb" onSubmit={handleSend}>
                            <input
                                type="text"
                                placeholder="Aa"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                            />
                        </form>
                        <div className="input-actions-right">
                            {inputValue.trim() ? (
                                <button onClick={handleSend} className="send-btn-fb" title="Send Message">
                                    <Send size={18} />
                                </button>
                            ) : (
                                <button className="like-btn-fb" title="Send Like" onClick={handleSendLike}>
                                    <ThumbsUp size={20} />
                                </button>
                            )}
                        </div>
                    </div>
                </motion.div>
            </>
        </AnimatePresence>,
        document.body
    );
};

export default ChatModal;
