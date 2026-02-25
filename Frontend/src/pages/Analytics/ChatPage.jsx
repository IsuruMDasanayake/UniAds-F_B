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

    const filteredConversations = React.useMemo(() => {
        return conversations.filter(conv => {
            const other = conv.other_participant;
            const name = other?.institute?.institute_name || other?.user?.name || '';
            const matchesSearch = name.toLowerCase().includes(searchTerm.toLowerCase());

            const isInstitute = other?.role === 'Institute' || !!other?.institute;
            const matchesCategory = activeCategory === 'Institutes' ? isInstitute : !isInstitute;

            return matchesSearch && matchesCategory;
        });
    }, [conversations, searchTerm, activeCategory]);

    // Memoize the message renderer to avoid re-calculating link matches on every render
    const renderMessage = React.useCallback((msg) => {
        const isInternalLink = msg.message?.match(/\/post\/([a-fA-F0-9\-]+)/);
        const hasBackendPreview = msg.link_preview_data;

        if (isInternalLink && !hasBackendPreview) {
            return <LinkPreview url={msg.message} showApplyButton={false} />;
        } else if (hasBackendPreview) {
            return (
                <>
                    {!msg.link_preview_data.is_internal_post && <span>{msg.message}</span>}
                    <LinkPreview data={msg.link_preview_data} showApplyButton={false} />
                </>
            );
        } else {
            return <span>{msg.message}</span>;
        }
    }, []);

    return (
        <div id="analytics-chat-page" className={`acp-container ${activeConversation ? 'mobile-chat-active' : ''}`}>
            {/* Left Sidebar: Conversations */}
            <div className="acp-sidebar">
                <div className="acp-sidebar-header">
                    <h2>Messages</h2>
                    <div className="acp-sidebar-tabs">
                        <button
                            className={`acp-tab-btn ${activeCategory === 'Students' ? 'acp-active' : ''}`}
                            onClick={() => setActiveCategory('Students')}
                        >
                            Students
                        </button>
                        <button
                            className={`acp-tab-btn ${activeCategory === 'Institutes' ? 'acp-active' : ''}`}
                            onClick={() => setActiveCategory('Institutes')}
                        >
                            Institutes
                        </button>
                    </div>
                    <div className="acp-search-wrapper">
                        <Search size={18} />
                        <input
                            type="text"
                            placeholder={`Search ${activeCategory.toLowerCase()}...`}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="acp-conversation-list">
                    {filteredConversations.map(conv => {
                        const other = conv.other_participant;
                        const isActive = activeConversation?.id === conv.id;

                        return (
                            <div
                                key={conv.id}
                                className={`acp-conv-item ${isActive ? 'acp-active' : ''} ${conv.unread_count > 0 ? 'acp-unread' : ''}`}
                                onClick={() => selectConversation(conv)}
                            >
                                <div className="acp-avatar-wrapper">
                                    {other?.institute?.profile_photo ? (
                                        <img src={getStorageUrl(other.institute.profile_photo)} alt="Profile" />
                                    ) : (
                                        <div className="acp-avatar-placeholder">
                                            {getInitials(other?.institute?.institute_name || other?.user?.name)}
                                        </div>
                                    )}
                                    {conv.unread_count > 0 && <span className="acp-unread-badge">{conv.unread_count}</span>}
                                </div>
                                <div className="acp-conv-content">
                                    <div className="acp-conv-header">
                                        <span className="acp-conv-name">{other?.institute?.institute_name || other?.user?.name || 'User'}</span>
                                        <span className="acp-conv-time">
                                            {conv.latest_message ? format(new Date(conv.latest_message.created_at), 'HH:mm') : ''}
                                        </span>
                                    </div>
                                    <p className="acp-conv-preview">
                                        {conv.latest_message?.message || 'Started a new conversation'}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Right Pane: Active Chat */}
            <div className="acp-main-pane">
                {activeConversation ? (
                    <>
                        <div className="acp-header">
                            <div className="acp-header-info">
                                {activeConversation.other_participant?.institute?.profile_photo ? (
                                    <img src={getStorageUrl(activeConversation.other_participant.institute.profile_photo)} alt="Avatar" />
                                ) : (
                                    <div className="acp-avatar-placeholder-small">
                                        {getInitials(activeConversation.other_participant?.institute?.institute_name || activeConversation.other_participant?.user?.name)}
                                    </div>
                                )}
                                <div>
                                    <h3>{activeConversation.other_participant?.institute?.institute_name || activeConversation.other_participant?.user?.name}</h3>
                                    {/* <span className="online-status">Online</span> */}
                                </div>
                            </div>
                            <div className="acp-header-actions">
                                <button className="acp-close-chat-btn" onClick={() => selectConversation(null)} title="Close Chat">
                                    <X size={20} />
                                    <span className="acp-mobile-only-back">Back</span>
                                </button>
                            </div>
                        </div>

                        <div className="acp-messages-container">
                            {messages.slice().reverse().map((msg, index) => {
                                const isMine = displayUser?.role === 'Institute'
                                    ? (msg.sender_institute_id === displayUser?.institute?.id)
                                    : (msg.sender_user_id === displayUser?.id);

                                return (
                                    <div key={msg.id || index} className={`acp-message-row ${isMine ? 'acp-mine' : 'acp-theirs'}`}>
                                        <div className="acp-message-bubble">
                                            {renderMessage(msg)}
                                            <span className="acp-message-time">
                                                {format(new Date(msg.created_at), 'HH:mm')}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                            <div ref={messagesEndRef} />
                        </div>

                        <form className="acp-input-container" onSubmit={handleSend}>
                            <div className="acp-input-actions">
                                {/* <button type="button"><Smile size={22} /></button>
                                <button type="button"><Paperclip size={22} /></button> */}
                            </div>
                            <input
                                type="text"
                                placeholder="Type a message..."
                                value={msgInput}
                                onChange={(e) => setMsgInput(e.target.value)}
                            />
                            <button type="submit" className="acp-send-btn" disabled={isSending}>
                                <Send size={20} />
                            </button>
                        </form>
                    </>
                ) : (
                    <div className="acp-empty-state">
                        <div className="acp-empty-content">
                            <div className="acp-empty-icon-box">
                                <Send size={48} />
                            </div>
                            <h2>Welcome to Institute Messenger</h2>
                            <p>Select a conversation to start chatting with students or other institutes.</p>
                            <span className="acp-encryption-notice">
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
