import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { BACKEND_URL } from '../lib/config';
import ChatService from '../services/ChatService';
import EncryptionService from '../services/EncryptionService';

const ChatContext = createContext();

export const useChat = () => useContext(ChatContext);

export const ChatProvider = ({ children, user }) => {
    const [conversations, setConversations] = useState([]);
    const [activeConversation, setActiveConversation] = useState(null);
    const [messages, setMessages] = useState([]);
    const [isMessagesLoading, setIsMessagesLoading] = useState(false);
    const [unreadTotal, setUnreadTotal] = useState(0);

    const fetchConversations = useCallback(async () => {
        if (!user || !localStorage.getItem('ACCESS_TOKEN')) return;
        try {
            const response = await ChatService.getConversations();
            const rawConversations = response.data.data;

            // Decrypt latest_message for each conversation
            const decryptedConversations = await Promise.all(rawConversations.map(async (conv) => {
                if (conv.latest_message) {
                    conv.latest_message.message = await EncryptionService.decrypt(
                        conv.latest_message.message,
                        conv.id
                    );
                }
                return conv;
            }));

            setConversations(decryptedConversations);

            // Calculate unread total
            const totalUnread = decryptedConversations.reduce((acc, conv) => acc + (conv.unread_count || 0), 0);
            setUnreadTotal(totalUnread);
        } catch (error) {
            console.error('Failed to fetch conversations:', error?.message || error);
        }
    }, [user]);

    const refreshMessages = useCallback(async (conversationId) => {
        if (!user || !conversationId) return;
        try {
            const response = await ChatService.getMessages(conversationId);
            const rawMessages = response.data.data.data;

            // Decrypt all messages
            const decryptedMessages = await Promise.all(rawMessages.map(async (msg) => {
                msg.message = await EncryptionService.decrypt(msg.message, conversationId);
                return msg;
            }));

            let gotNewMessages = false;

            // Simple optimization to avoid unnecessary re-renders
            setMessages(prev => {
                // Keep optimistic messages (pending)
                const optimisticMessages = prev.filter(m => m.isOptimistic);
                const currentRealMessages = prev.filter(m => !m.isOptimistic);

                // Optimization: If nothing changed in the "real" messages, return prev to keep all (including optimistic)
                if (currentRealMessages.length === decryptedMessages.length && currentRealMessages[0]?.id === decryptedMessages[0]?.id) {
                    return prev;
                }

                // If real messages changed (e.g. new messages from others), merge with our optimistic ones
                if (decryptedMessages.length > currentRealMessages.length) {
                    gotNewMessages = true;
                }

                // IMPORTANT: optimisticMessages first to keep them at the top
                return [...optimisticMessages, ...decryptedMessages];
            });

            if (gotNewMessages) {
                await ChatService.markRead(conversationId);
                await fetchConversations(); // Re-fetch to update unread counts after DB is marked read
            }
        } catch (error) {
            console.error('Failed to refresh messages:', error?.message || error);
        }
    }, [user, fetchConversations]);

    useEffect(() => {
        fetchConversations();
    }, [fetchConversations]);

    // Dual-interval Polling
    useEffect(() => {
        if (!user || !localStorage.getItem('ACCESS_TOKEN')) return;

        // 1. Poll Conversations (every 15 seconds)
        const fetchAndScheduleConv = () => {
            fetchConversations();
        };

        const convInterval = setInterval(fetchAndScheduleConv, 15000);

        // 2. Poll Active Messages (every 5 seconds)
        let msgInterval;
        if (activeConversation) {
            msgInterval = setInterval(() => {
                refreshMessages(activeConversation.id);
            }, 5000);
        }

        return () => {
            clearInterval(convInterval);
            if (msgInterval) clearInterval(msgInterval);
        };
    }, [user, fetchConversations, refreshMessages, activeConversation]);

    const selectConversation = async (conversation) => {
        setActiveConversation(conversation);
        if (!conversation) {
            setMessages([]);
            setIsMessagesLoading(false);
            return;
        }

        // Clear only if it is a different conversation or if we want to ensure fresh load
        // This prevents the "flash" of old messages
        setMessages([]);
        setIsMessagesLoading(true);

        try {
            const response = await ChatService.getMessages(conversation.id);
            const rawMessages = response.data.data.data;

            // Decrypt all messages
            const decryptedMessages = await Promise.all(rawMessages.map(async (msg) => {
                msg.message = await EncryptionService.decrypt(msg.message, conversation.id);
                return msg;
            }));

            setMessages(decryptedMessages);

            // Update unread total dynamically
            const unreadInConv = conversation.unread_count || 0;
            if (unreadInConv > 0) {
                setUnreadTotal(prev => Math.max(0, prev - unreadInConv));
            }

            // Clear unread for this conversation locally
            setConversations(prev => prev.map(c =>
                c.id === conversation.id ? { ...c, unread_count: 0 } : c
            ));

            // Mark as read in backend
            await ChatService.markRead(conversation.id);
        } catch (error) {
            console.error('Failed to fetch messages:', error?.message || error);
        } finally {
            setIsMessagesLoading(false);
        }
    };

    const sendMessage = async (content) => {
        if (!activeConversation) return;

        const tempId = `temp-${Date.now()}`;
        const optimisticMessage = {
            id: tempId,
            message: content,
            sender_user_id: user?.role === 'User' ? user?.id : null,
            sender_institute_id: user?.role === 'Institute' ? (user?.institute_id || user?.institute?.id) : null,
            created_at: new Date().toISOString(),
            isOptimistic: true 
        };

        // 1. ADD IMMEDIATELY (Optimistic Update)
        setMessages(prev => [optimisticMessage, ...prev]);

        try {
            // Encrypt message content before sending to API
            const encryptedContent = await EncryptionService.encrypt(content, activeConversation.id);

            const response = await ChatService.sendMessage(activeConversation.id, encryptedContent);
            const sentMessage = response.data.data;

            // Update with decrypted version (original content)
            sentMessage.message = content;

            // 2. REPLACE TEMP WITH REAL (Once confirmed by server)
            setMessages(prev => prev.map(m => m.id === tempId ? sentMessage : m));

            // Update conversation list and move to top
            setConversations(prev => {
                const updatedConvIndex = prev.findIndex(c => c.id === activeConversation.id);
                if (updatedConvIndex === -1) return prev;

                const updatedConv = {
                    ...prev[updatedConvIndex],
                    latest_message: sentMessage,
                    updated_at: new Date().toISOString() 
                };

                const newConversations = [...prev];
                newConversations.splice(updatedConvIndex, 1);
                return [updatedConv, ...newConversations];
            });

            return sentMessage;
        } catch (error) {
            console.error('Failed to send message:', error?.message || error);
            // 3. REMOVE ON FAILURE
            setMessages(prev => prev.filter(m => m.id !== tempId));
            throw error;
        }
    };

    const value = {
        conversations,
        activeConversation,
        messages,
        unreadTotal,
        isMessagesLoading,
        selectConversation,
        sendMessage,
        refreshMessages,
        fetchConversations,
        setActiveConversation,
        displayUser: user
    };

    return (
        <ChatContext.Provider value={value}>
            {children}
        </ChatContext.Provider>
    );
};
