import React, { useState, useEffect, useRef } from 'react';
import { Search, Send, User, MoreVertical, Paperclip, Smile, Phone, Video, Info, X } from 'lucide-react';
import { useChat } from '../../context/ChatContext';
import { getStorageUrl } from '../../lib/config';
import LinkPreview from '../../components/LinkPreview';
import { format } from 'date-fns';
import './ChatPage.css';

const ChatPage = () => {
    const {
        conversations,
        activeConversation,
        messages,
        selectConversation,
        sendMessage,
        fetchConversations,
        displayUser
    } = useChat();

    const [searchTerm, setSearchTerm] = useState('');
    const [msgInput, setMsgInput] = useState('');
    const [activeCategory, setActiveCategory] = useState('Students');
    const [isSending, setIsSending] = useState(false);
    const messagesEndRef = useRef(null);

    const getInitials = (name) => {
        if (!name) return '?';
        const parts = name.split(' ');
        if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
        return name[0].toUpperCase();
    };

    useEffect(() => {
        fetchConversations();
    }, [fetchConversations]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!msgInput.trim() || isSending) return;

        setIsSending(true);
        try {
            await sendMessage(msgInput);
            setMsgInput('');
        } catch (error) {
            console.error('Failed to send message:', error);
        } finally {
            setIsSending(false);
        }
    };

    const filteredConversations = conversations.filter(conv => {
        const other = conv.other_participant;
        const name = other?.institute?.institute_name || other?.user?.name || '';
        const matchesSearch = name.toLowerCase().includes(searchTerm.toLowerCase());

        const isInstitute = other?.role === 'Institute' || !!other?.institute;
        const matchesCategory = activeCategory === 'Institutes' ? isInstitute : !isInstitute;

        return matchesSearch && matchesCategory;
    });

    return (
        <div className={`full-chat-container ${activeConversation ? 'mobile-chat-active' : ''}`}>
            {/* Left Sidebar: Conversations */}
            <div className="chat-sidebar">
                <div className="sidebar-header-chat">
                    <h2>Messages</h2>
                    <div className="sidebar-tabs">
                        <button
                            className={`tab-btn ${activeCategory === 'Students' ? 'active' : ''}`}
                            onClick={() => setActiveCategory('Students')}
                        >
                            Students
                        </button>
                        <button
                            className={`tab-btn ${activeCategory === 'Institutes' ? 'active' : ''}`}
                            onClick={() => setActiveCategory('Institutes')}
                        >
                            Institutes
                        </button>
                    </div>
                    <div className="chat-search-wrapper">
                        <Search size={18} />
                        <input
                            type="text"
                            placeholder={`Search ${activeCategory.toLowerCase()}...`}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="conversation-list-full">
                    {filteredConversations.map(conv => {
                        const other = conv.other_participant;
                        const isActive = activeConversation?.id === conv.id;

                        return (
                            <div
                                key={conv.id}
                                className={`conv-item-full ${isActive ? 'active' : ''} ${conv.unread_count > 0 ? 'unread' : ''}`}
                                onClick={() => selectConversation(conv)}
                            >
                                <div className="avatar-wrapper-full">
                                    {other?.institute?.profile_photo ? (
                                        <img src={getStorageUrl(other.institute.profile_photo)} alt="Profile" />
                                    ) : (
                                        <div className="avatar-placeholder-full">
                                            {getInitials(other?.institute?.institute_name || other?.user?.name)}
                                        </div>
                                    )}
                                    {conv.unread_count > 0 && <span className="unread-badge-full">{conv.unread_count}</span>}
                                </div>
                                <div className="conv-content-full">
                                    <div className="conv-header-full">
                                        <span className="conv-name">{other?.institute?.institute_name || other?.user?.name || 'User'}</span>
                                        <span className="conv-time-full">
                                            {conv.latest_message ? format(new Date(conv.latest_message.created_at), 'HH:mm') : ''}
                                        </span>
                                    </div>
                                    <p className="conv-preview-full">
                                        {conv.latest_message?.message || 'Started a new conversation'}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Right Pane: Active Chat */}
            <div className="chat-main-pane">
                {activeConversation ? (
                    <>
                        <div className="chat-header-full">
                            <div className="header-info-full">
                                {activeConversation.other_participant?.institute?.profile_photo ? (
                                    <img src={getStorageUrl(activeConversation.other_participant.institute.profile_photo)} alt="Avatar" />
                                ) : (
                                    <div className="avatar-placeholder-small">
                                        {getInitials(activeConversation.other_participant?.institute?.institute_name || activeConversation.other_participant?.user?.name)}
                                    </div>
                                )}
                                <div>
                                    <h3>{activeConversation.other_participant?.institute?.institute_name || activeConversation.other_participant?.user?.name}</h3>
                                    {/* <span className="online-status">Online</span> */}
                                </div>
                            </div>
                            <div className="header-actions-full">
                                <button className="close-chat-btn" onClick={() => selectConversation(null)} title="Close Chat">
                                    <X size={20} />
                                    <span className="mobile-only-back">Back</span>
                                </button>
                            </div>
                        </div>

                        <div className="messages-container-full">
                            {messages.slice().reverse().map((msg, index) => {
                                const isMine = displayUser?.role === 'Institute'
                                    ? (msg.sender_institute_id === displayUser?.institute?.id)
                                    : (msg.sender_user_id === displayUser?.id);

                                return (
                                    <div key={msg.id || index} className={`message-row ${isMine ? 'mine' : 'theirs'}`}>
                                        <div className="message-bubble-full">
                                            {msg.message}
                                            {msg.link_preview_data && <LinkPreview data={msg.link_preview_data} showApplyButton={false} />}
                                            <span className="message-time">
                                                {format(new Date(msg.created_at), 'HH:mm')}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                            <div ref={messagesEndRef} />
                        </div>

                        <form className="chat-input-full" onSubmit={handleSend}>
                            <div className="input-actions-full">
                                {/* <button type="button"><Smile size={22} /></button>
                                <button type="button"><Paperclip size={22} /></button> */}
                            </div>
                            <input
                                type="text"
                                placeholder="Type a message..."
                                value={msgInput}
                                onChange={(e) => setMsgInput(e.target.value)}
                            />
                            <button type="submit" className="send-btn-full" disabled={isSending}>
                                <Send size={20} />
                            </button>
                        </form>
                    </>
                ) : (
                    <div className="chat-empty-state">
                        <div className="empty-state-content">
                            <div className="empty-icon-box">
                                <Send size={48} />
                            </div>
                            <h2>Welcome to Institute Messenger</h2>
                            <p>Select a conversation to start chatting with students or other institutes.</p>
                            <span className="encryption-notice">
                                <Info size={14} /> End-to-end encrypted messaging
                            </span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ChatPage;
