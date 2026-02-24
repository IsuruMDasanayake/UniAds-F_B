import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, User, Minus, Phone, Video, PlusCircle, Image as ImageIcon, StickyNote, Gift, ThumbsUp, Loader2 } from 'lucide-react';
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
            if (error.response?.status === 422 && error.response?.data?.message) {
                alert(error.response.data.message);
            }
        } finally {
            setIsSending(false);
        }
    };

    const handleSendLike = async () => {
        if (isSending) return;
        setIsSending(true);
        try {
            await sendMessage('👍');
            scrollToBottom();
        } catch (error) {
            console.error('Failed to send like:', error);
        } finally {
            setIsSending(false);
        }
    };

    if (!activeConversation) return null;

    let other = activeConversation.other_participant;
    if (!other && activeConversation.participants) {
        other = activeConversation.participants.find(p => p.id !== displayUser?.id);
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
                        {[...messages].reverse().map((msg, index) => {
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
                                    <div className={`message-bubble-fb ${msg.link_preview_data?.is_internal_post ? 'internal-post' : ''}`}>
                                        {(!msg.link_preview_data || !msg.link_preview_data.is_internal_post) && (
                                            <span>{msg.message}</span>
                                        )}
                                        {msg.link_preview_data && <LinkPreview data={msg.link_preview_data} />}
                                    </div>
                                </div>
                            );
                        })}
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
                                <button onClick={handleSend} className="send-btn-fb" title="Send Message" disabled={isSending}>
                                    {isSending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                                </button>
                            ) : (
                                <button className="like-btn-fb" title="Send Like" onClick={handleSendLike} disabled={isSending}>
                                    {isSending ? <Loader2 size={18} className="animate-spin" /> : <ThumbsUp size={20} />}
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
