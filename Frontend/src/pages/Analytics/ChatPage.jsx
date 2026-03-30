import React, { useState, useEffect, useRef } from 'react';
import { Search, Send, User, MoreVertical, Paperclip, Smile, Phone, Video, Info, X, Building2, Trash2, ThumbsUp, Loader2 } from 'lucide-react';
import { useChat } from '../../context/ChatContext';
import { getStorageUrl } from '../../lib/config';
import axiosClient from '../../lib/axios';
import ChatService from '../../services/ChatService';
import DeleteConfirmModal from '../../components/Modals/DeleteConfirmModal';
import LinkPreview from '../../components/LinkPreview';
import { format, isToday, isThisYear } from 'date-fns';
import './ChatPage.css';

const ChatPage = () => {
    const {
        conversations,
        activeConversation,
        messages,
        selectConversation,
        sendMessage,
        fetchConversations,
        displayUser,
        isMessagesLoading
    } = useChat();

    const [searchTerm, setSearchTerm] = useState('');
    const [msgInput, setMsgInput] = useState('');
    const [activeCategory, setActiveCategory] = useState('Students');
    const [isSending, setIsSending] = useState(false);
    const messagesEndRef = useRef(null);
    const [institutes, setInstitutes] = useState([]);
    const [institutesLoading, setInstitutesLoading] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const getInitials = (name) => {
        if (!name) return '?';
        const parts = name.split(' ');
        if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
        return name[0].toUpperCase();
    };

    // Derive other_participant when it isn't pre-computed (e.g. freshly started conversations)
    const resolveOtherParticipant = (conversation) => {
        if (conversation.other_participant) return conversation;
        if (!conversation.participants) return conversation;
        const myInstId = displayUser?.institute?.id;
        const myUserId = displayUser?.id;
        const other = conversation.participants.find(p =>
            myInstId ? p.institute_id !== myInstId : p.user_id !== myUserId
        );
        return { ...conversation, other_participant: other || null };
    };

    // Fetch premium institutes when Institutes tab is active
    useEffect(() => {
        if (activeCategory !== 'Institutes') return;
        setInstitutesLoading(true);
        ChatService.getInstitutions()
            .then(res => {
                // Filter to only premium institutes
                const premiumOnly = (res.data.data || res.data || []).filter(inst => inst.is_premium);
                setInstitutes(premiumOnly);
            })
            .catch(err => console.error('Failed to load institutes:', err))
            .finally(() => setInstitutesLoading(false));
    }, [activeCategory]);

    useEffect(() => {
        fetchConversations();
    }, [fetchConversations]);

    const scrollToBottom = () => {
        setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }, 50);
    };

    useEffect(() => {
        if (!isMessagesLoading) {
            scrollToBottom();
        }
    }, [messages, isMessagesLoading]);

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

    const handleDeleteConversation = async () => {
        if (!deleteTarget) return;
        setIsDeleting(true);
        try {
            await axiosClient.delete(`/api/chat/${deleteTarget.id}`);
            if (activeConversation?.id === deleteTarget.id) {
                selectConversation(null);
            }
            await fetchConversations();
        } catch (error) {
            console.error('Failed to delete conversation:', error);
        } finally {
            setIsDeleting(false);
            setDeleteTarget(null);
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

    // Unread counts per tab
    const unreadCounts = React.useMemo(() => {
        let students = 0, institutes = 0;
        conversations.forEach(conv => {
            if ((conv.unread_count || 0) > 0) {
                const isInst = conv.other_participant?.role === 'Institute' || !!conv.other_participant?.institute;
                if (isInst) institutes += conv.unread_count;
                else students += conv.unread_count;
            }
        });
        return { students, institutes };
    }, [conversations]);

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

    // Memoize the message renderer to avoid re-calculating link matches on every render
    const renderMessage = React.useCallback((msg) => {
        if (msg.message === '(like)') {
            return <ThumbsUp size={32} className="acp-sent-like" />;
        }

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
                            {unreadCounts.students > 0 && <span className="acp-tab-badge">{unreadCounts.students}</span>}
                        </button>
                        <button
                            className={`acp-tab-btn ${activeCategory === 'Institutes' ? 'acp-active' : ''}`}
                            onClick={() => setActiveCategory('Institutes')}
                        >
                            Institutes
                            {unreadCounts.institutes > 0 && <span className="acp-tab-badge">{unreadCounts.institutes}</span>}
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
                    {/* Existing conversations always shown first */}
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
                                    {(() => {
                                        const photo = other?.institute?.profile_photo || other?.user?.profile_picture || other?.user?.profile_photo;
                                        return photo ? (
                                            <img src={getStorageUrl(photo)} alt="Profile" />
                                        ) : (
                                            <div className="acp-avatar-placeholder">
                                                {getInitials(other?.institute?.institute_name || other?.user?.name)}
                                            </div>
                                        );
                                    })()}
                                    {conv.unread_count > 0 && <span className="acp-unread-badge">{conv.unread_count}</span>}
                                </div>
                                <div className="acp-conv-content">
                                    <div className="acp-conv-header">
                                        <span className="acp-conv-name">{other?.institute?.institute_name || other?.user?.name || 'User'}</span>
                                        <div className="acp-conv-actions">
                                            <span className="acp-conv-time">
                                                {conv.latest_message ? format(new Date(conv.latest_message.created_at), 'HH:mm') : ''}
                                            </span>
                                        </div>
                                    </div>
                                    <p className="acp-conv-preview">
                                        {conv.latest_message?.message || 'Started a new conversation'}
                                    </p>
                                    <div className="acp-conv-actions">
                                        <button
                                            className="acp-delete-btn"
                                            title="Delete conversation"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setDeleteTarget(conv);
                                            }}
                                        >
                                            <Trash2 size={13} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}

                    {/* Institute Discovery: show premium institutes not yet in a conversation */}
                    {activeCategory === 'Institutes' && (
                        institutesLoading ? (
                            <div className="acp-empty-hint">Loading institutes...</div>
                        ) : (
                            (() => {
                                // IDs of institutes already in existing conversations
                                const existingInstIds = new Set(
                                    conversations
                                        .filter(c => c.other_participant?.institute)
                                        .map(c => c.other_participant.institute.id)
                                );
                                const currentInstId = displayUser?.institute?.id;
                                const discoverable = institutes.filter(inst =>
                                    inst.id !== currentInstId &&
                                    !existingInstIds.has(inst.id) &&
                                    inst.institute_name.toLowerCase().includes(searchTerm.toLowerCase())
                                );
                                if (discoverable.length === 0 && filteredConversations.length === 0) {
                                    return <div className="acp-empty-hint">No premium institutes found.</div>;
                                }
                                return discoverable.map(inst => (
                                    <div
                                        key={`discover-${inst.id}`}
                                        className="acp-conv-item acp-discovery-item"
                                        onClick={async () => {
                                            try {
                                                const res = await ChatService.startConversation('institute', inst.id);
                                                await fetchConversations();
                                                selectConversation(resolveOtherParticipant(res.data.data));
                                            } catch (e) {
                                                console.error('Failed to start conversation:', e);
                                            }
                                        }}
                                    >
                                        <div className="acp-avatar-wrapper">
                                            {inst.profile_photo ? (
                                                <img src={getStorageUrl(inst.profile_photo)} alt={inst.institute_name} />
                                            ) : (
                                                <div className="acp-avatar-placeholder">
                                                    {getInitials(inst.institute_name)}
                                                </div>
                                            )}
                                        </div>
                                        <div className="acp-conv-content">
                                            <div className="acp-conv-header">
                                                <span className="acp-conv-name">{inst.institute_name}</span>
                                                <span className="acp-premium-badge">Premium</span>
                                            </div>
                                            <p className="acp-conv-preview">{inst.location || 'Click to start chatting'}</p>
                                        </div>
                                    </div>
                                ));
                            })()
                        )
                    )}
                </div>
            </div>

            {/* Right Pane: Active Chat */}
            <div className="acp-main-pane">
                {activeConversation ? (
                    <>
                        <div className="acp-header">
                            <div className="acp-header-info">
                                {(() => {
                                    const other = activeConversation.other_participant;
                                    const photo = other?.institute?.profile_photo || other?.user?.profile_picture;
                                    const name = other?.institute?.institute_name || other?.user?.name;
                                    return photo ? (
                                        <img src={getStorageUrl(photo)} alt={name || 'User'} />
                                    ) : (
                                        <div className="acp-avatar-placeholder-small">
                                            {getInitials(name)}
                                        </div>
                                    );
                                })()}
                                <div>
                                    <h3>{activeConversation.other_participant?.institute?.institute_name || activeConversation.other_participant?.user?.name || 'User'}</h3>
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
                            {isMessagesLoading ? (
                                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', width: '100%' }}>
                                    <Loader2 size={32} className="animate-spin" color="var(--c-slate-400)" />
                                </div>
                            ) : (
                                <>
                                    {messages.slice().reverse().map((msg, index) => {
                                        const isMine = displayUser?.role === 'Institute'
                                            ? (msg.sender_institute_id === displayUser?.institute?.id)
                                            : (msg.sender_user_id === displayUser?.id);

                                        return (
                                            <div key={msg.id || index} className={`acp-message-row ${isMine ? 'acp-mine' : 'acp-theirs'}`}>
                                                <div className={`acp-message-bubble ${msg.message === '(like)' ? 'acp-like-bubble' : ''}`}>
                                                    {renderMessage(msg)}
                                                    <span className="acp-message-time">
                                                        {formatMessageDate(msg.created_at)}
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                    <div ref={messagesEndRef} />
                                </>
                            )}
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
                            <p>Select a conversation to start chatting with students or other premium institutes.</p>
                            <span className="acp-encryption-notice">
                                <Info size={14} /> End-to-end encrypted messaging
                            </span>
                        </div>
                    </div>
                )}
            </div>

            <DeleteConfirmModal
                isOpen={!!deleteTarget}
                onClose={() => setDeleteTarget(null)}
                onConfirm={handleDeleteConversation}
                isDeleting={isDeleting}
                title="Delete Conversation"
            />
        </div>
    );
};

export default ChatPage;
