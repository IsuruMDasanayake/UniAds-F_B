import React, { useRef, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, CheckCheck, User, Search, MoreHorizontal, Maximize2, Edit3, ChevronRight, BadgeCheck, Loader2 } from 'lucide-react';
import { useChat } from '../context/ChatContext';
import ChatService from '../services/ChatService';
import { getStorageUrl } from '../lib/config';
import { formatDistanceToNow } from 'date-fns';
import { isPremiumActive } from '../utils/premium';

const MessengerDropdown = ({ isOpen, onClose }) => {
    const { conversations, selectConversation, fetchConversations, setActiveConversation, displayUser } = useChat();
    const dropdownRef = useRef(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState('All');
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const mediaQuery = window.matchMedia("(max-width: 900px)");
        const handleResize = (e) => setIsMobile(e.matches);

        setIsMobile(mediaQuery.matches);
        mediaQuery.addEventListener('change', handleResize);
        return () => mediaQuery.removeEventListener('change', handleResize);
    }, []);

    useEffect(() => {
        if (conversations.length === 0 && activeTab === 'All') {
            setActiveTab('Discover');
        }
    }, [conversations, activeTab]);
    const [institutions, setInstitutions] = useState([]);
    const [isLoadingInst, setIsLoadingInst] = useState(false);

    useEffect(() => {
        if (isOpen) {
            fetchConversations();
            fetchPremiumInstitutions();
        }
    }, [isOpen, fetchConversations]);

    const fetchPremiumInstitutions = async () => {
        setIsLoadingInst(true);
        try {
            const res = await ChatService.getInstitutions();
            // Handle standard ApiResponse wrapper { success, message, data: [...] OR data: { data: [...] } }
            const payload = res.data.data;
            const dataArray = Array.isArray(payload) ? payload : (payload?.data || []);
            
            // Filter for premium partners
            setInstitutions(dataArray.filter(i => isPremiumActive(i)));
        } catch (error) {
            console.error('Failed to fetch institutions:', error);
            setInstitutions([]);
        } finally {
            setIsLoadingInst(false);
        }
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                onClose();
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [onClose]);

    const startConversationWith = async (inst) => {
        try {
            if (inst.conversation_id) {
                const existingConv = conversations.find(c => c.id === inst.conversation_id);
                if (existingConv) {
                    selectConversation(existingConv);
                    onClose();
                    return;
                }
            }

            const res = await ChatService.startConversation('institute', inst.id);
            const newConv = res.data.data;
            selectConversation(newConv);
            onClose();
        } catch (error) {
            console.error('Failed to start conversation:', error);
        }
    };

    const filteredConversations = conversations.filter(conv => {
        const otherInst = conv.other_participant?.institute;
        const chatEnabled = otherInst ? otherInst.chat_enabled : true;

        const name = otherInst?.institute_name || conv.other_participant?.user?.name || '';
        const matchesSearch = name.toLowerCase().includes(searchTerm.toLowerCase());

        // Hide if chat is explicitly disabled for the institute
        if (otherInst && (chatEnabled === false || Number(chatEnabled) === 0)) {
            return false;
        }

        if (activeTab === 'Unread') return matchesSearch && conv.unread_count > 0;
        return matchesSearch;
    });

    const filteredInstitutions = institutions.filter(inst => {
        const matchesSearch = inst.institute_name.toLowerCase().includes(searchTerm.toLowerCase());
        // Exclude if an active conversation already exists with this institute or chat is disabled
        const hasConversation = conversations.some(c =>
            c.participants?.some(p => p.institute_id === inst.id)
        );
        return matchesSearch && !hasConversation && Number(inst.chat_enabled) !== 0;
    }).map(inst => {
        return {
            ...inst,
            latest_message: null, // No longer need this here as they won't have conversations
            unread_count: 0,
            conversation_id: null
        };
    });

    const categories = ['All', 'Unread', 'Discover'];

    const content = (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Dark Overlay for Mobile */}
                    {isMobile && (
                        <motion.div
                            className="messenger-mobile-overlay"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={onClose}
                        />
                    )}

                    <motion.div
                        ref={dropdownRef}
                        className="messenger-dropdown"
                        initial={{
                            opacity: 0,
                            y: isMobile ? "100%" : 10,
                            scale: isMobile ? 1 : 0.95
                        }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{
                            opacity: 0,
                            y: isMobile ? "100%" : 10,
                            scale: isMobile ? 1 : 0.95
                        }}
                        transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    >
                        <div className="messenger-header">
                            <div className="header-top">
                                <h3>Chats</h3>
                            </div>

                            <div className="messenger-search-bar">
                                <Search size={14} className="text-muted" />
                                <input
                                    type="text"
                                    placeholder="Search"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="messenger-body premium-scroll">
                            {/* Recent Conversations FIRST */}
                            {filteredConversations.length > 0 && filteredConversations
                                .map(conv => {
                                    const other = conv.other_participant;
                                    const name = other?.institute?.institute_name || other?.user?.name || 'User';
                                    const photo = other?.institute?.profile_photo || other?.user?.profile_photo;

                                    return (
                                        <div
                                            key={conv.id}
                                            className={`conversation-item ${conv.unread_count > 0 ? 'unread' : ''}`}
                                            onClick={() => {
                                                selectConversation(conv);
                                                onClose();
                                            }}
                                        >
                                            <div className="participant-avatar">
                                                {photo ? (
                                                    <img src={getStorageUrl(photo)} alt={name} />
                                                ) : (
                                                    <div className="avatar-placeholder">
                                                        {name.charAt(0)}
                                                    </div>
                                                )}
                                                {conv.unread_count > 0 && <div className="unread-dot-vibrant" />}
                                            </div>
                                            <div className="conversation-info">
                                                <div className="conv-top">
                                                    <span className="participant-name">{name}</span>
                                                </div>
                                                <p className="latest-msg">
                                                    {conv.latest_message?.message || 'Start a conversation'}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })
                            }

                            {/* Discover Section SECOND */}
                            {isLoadingInst ? (
                                <div className="discovery-loading" style={{ display: 'flex', justifyContent: 'center', padding: '20px' }}>
                                    <Loader2 className="animate-spin" size={24} />
                                </div>
                            ) : (
                                filteredInstitutions.length > 0 && (
                                    <div className="discovery-section">
                                        <p className="discovery-hint">Connect with Premium Partners</p>
                                        {filteredInstitutions.map(inst => (
                                            <div key={inst.id} className="discovery-item" onClick={() => startConversationWith(inst)}>
                                                <div className="inst-avatar-mini">
                                                    {inst.profile_photo ? (
                                                        <img src={getStorageUrl(inst.profile_photo)} alt={inst.institute_name} />
                                                    ) : (
                                                        <div className="avatar-placeholder">
                                                            <User size={20} />
                                                        </div>
                                                    )}
                                                    {inst.unread_count > 0 && <span className="unread-badge-dot"></span>}
                                                </div>
                                                <div className="inst-mini-info">
                                                    <div className="inst-mini-name">{inst.institute_name}</div>
                                                    <div className="inst-mini-last-message">
                                                        {inst.latest_message ? (
                                                            <span className={inst.unread_count > 0 ? 'unread-text' : ''}>
                                                                {inst.latest_message.message}
                                                            </span>
                                                        ) : (
                                                            <span className="location-hint">{inst.location || 'Premium Partner'}</span>
                                                        )}
                                                    </div>
                                                </div>
                                                <ChevronRight size={14} className="discovery-arrow" />
                                            </div>
                                        ))}
                                    </div>
                                )
                            )}
                        </div>

                        <div className="messenger-footer">
                            <button className="view-all-chats"></button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );

    if (isMobile) {
        return createPortal(content, document.body);
    }

    return content;
};

export default MessengerDropdown;
