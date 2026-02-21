import React, { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, CheckCheck, User } from 'lucide-react';
import { useChat } from '../context/ChatContext';
import { getStorageUrl } from '../lib/config';
import { formatDistanceToNow } from 'date-fns';

const MessengerDropdown = ({ isOpen, onClose }) => {
    const { conversations, selectConversation, fetchConversations } = useChat();
    const dropdownRef = useRef(null);

    useEffect(() => {
        if (isOpen) {
            fetchConversations();
        }
    }, [isOpen, fetchConversations]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                onClose();
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [onClose]);

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    ref={dropdownRef}
                    className="messenger-dropdown"
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                >
                    <div className="messenger-header">
                        <h3>Messages</h3>
                        <button onClick={onClose} className="close-dropdown">
                            <X size={18} />
                        </button>
                    </div>

                    <div className="messenger-body">
                        {conversations.length === 0 ? (
                            <div className="empty-messenger">
                                <MessageSquare size={48} />
                                <p>No conversations yet</p>
                            </div>
                        ) : (
                            conversations.map(conv => (
                                <div
                                    key={conv.id}
                                    className={`conversation-item ${conv.unread_count > 0 ? 'unread' : ''}`}
                                    onClick={() => {
                                        selectConversation(conv);
                                        onClose();
                                    }}
                                >
                                    <div className="participant-avatar">
                                        {conv.other_participant?.institute?.profile_photo ? (
                                            <img src={getStorageUrl(conv.other_participant.institute.profile_photo)} alt="Avatar" />
                                        ) : (
                                            <div className="avatar-placeholder">
                                                <User size={20} />
                                            </div>
                                        )}
                                        {conv.unread_count > 0 && <span className="unread-dot"></span>}
                                    </div>
                                    <div className="conversation-info">
                                        <div className="conv-top">
                                            <span className="participant-name">
                                                {conv.other_participant?.institute?.institute_name || conv.other_participant?.user?.name || 'Unknown'}
                                            </span>
                                            <span className="conv-time">
                                                {conv.latest_message ? formatDistanceToNow(new Date(conv.latest_message.created_at), { addSuffix: false }) : ''}
                                            </span>
                                        </div>
                                        <div className="conv-bottom">
                                            <p className="latest-msg">
                                                {conv.latest_message?.message || 'No messages yet'}
                                            </p>
                                            {conv.latest_message && <CheckCheck size={14} className="message-status" />}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                    <div className="messenger-footer">
                        <button className="view-all-chats">View All in Messenger</button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default MessengerDropdown;
