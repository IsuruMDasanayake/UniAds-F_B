import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { BACKEND_URL } from '../lib/config';
import ChatService from '../services/ChatService';

const ChatContext = createContext();

export const useChat = () => useContext(ChatContext);

export const ChatProvider = ({ children, user }) => {
    const [conversations, setConversations] = useState([]);
    const [activeConversation, setActiveConversation] = useState(null);
    const [messages, setMessages] = useState([]);
    const [unreadTotal, setUnreadTotal] = useState(0);

    const fetchConversations = useCallback(async () => {
        if (!user) return;
        try {
            const response = await ChatService.getConversations();
            setConversations(response.data.data);

            // Calculate unread total
            const totalUnread = response.data.data.reduce((acc, conv) => acc + (conv.unread_count || 0), 0);
            setUnreadTotal(totalUnread);
        } catch (error) {
            console.error('Failed to fetch conversations:', error);
        }
    }, [user]);

    const refreshMessages = useCallback(async (conversationId) => {
        if (!user || !conversationId) return;
        try {
            const response = await ChatService.getMessages(conversationId);
            const newMessages = response.data.data.data;

            let gotNewMessages = false;

            // Simple optimization to avoid unnecessary re-renders
            setMessages(prev => {
                if (prev.length === newMessages.length && prev[0]?.id === newMessages[0]?.id) {
                    return prev;
                }

                // If we got new messages, mark them as read since the chat is open
                if (newMessages.length > prev.length) {
                    gotNewMessages = true;
                }

                return newMessages;
            });

            if (gotNewMessages) {
                await ChatService.markRead(conversationId);
                await fetchConversations(); // Re-fetch to update unread counts after DB is marked read
            }
        } catch (error) {
            console.error('Failed to refresh messages:', error);
        }
    }, [user, fetchConversations]);

    useEffect(() => {
        fetchConversations();
    }, [fetchConversations]);

    // Dual-interval Polling
    useEffect(() => {
        if (!user) return;

        // 1. Poll Conversations (every 15 seconds)
        const convInterval = setInterval(() => {
            fetchConversations();
        }, 15000);

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
        try {
            const response = await ChatService.getMessages(conversation.id);
            setMessages(response.data.data.data);

            // Update unread total dynamically
            const unreadInConv = conversation.unread_count || 0;
            if (unreadInConv > 0) {
                setUnreadTotal(prev => Math.max(0, prev - unreadInConv));
            }

            // Clear unread for this conversation locally
            setConversations(prev => prev.map(c =>
                c.id === conversation.id ? { ...c, unread_count: 0 } : c
            ));

            // Wait until the backend has registered the markRead, 
            // ensuring any subsequent polling gets the updated counts natively.
            await ChatService.markRead(conversation.id);
        } catch (error) {
            console.error('Failed to fetch messages:', error);
        }
    };

    const sendMessage = async (content) => {
        if (!activeConversation) return;
        try {
            const response = await ChatService.sendMessage(activeConversation.id, content);
            const sentMessage = response.data.data;

            setMessages(prev => [sentMessage, ...prev]);

            // Update conversation list
            setConversations(prev => prev.map(conv => {
                if (conv.id === activeConversation.id) {
                    return { ...conv, latest_message: sentMessage };
                }
                return conv;
            }));

            return sentMessage;
        } catch (error) {
            console.error('Failed to send message:', error);
            throw error;
        }
    };

    const value = {
        conversations,
        activeConversation,
        messages,
        unreadTotal,
        selectConversation,
        sendMessage,
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
