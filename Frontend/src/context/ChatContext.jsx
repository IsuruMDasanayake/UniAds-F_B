import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';
import { BACKEND_URL } from '../lib/config';
import ChatService from '../services/ChatService';

const ChatContext = createContext();

export const useChat = () => useContext(ChatContext);

export const ChatProvider = ({ children, user }) => {
    const [conversations, setConversations] = useState([]);
    const [activeConversation, setActiveConversation] = useState(null);
    const [messages, setMessages] = useState([]);
    const [unreadTotal, setUnreadTotal] = useState(0);
    const [echo, setEcho] = useState(null);

    // Initialize Echo
    useEffect(() => {
        if (user && !echo) {
            window.Pusher = Pusher;
            const echoInstance = new Echo({
                broadcaster: 'reverb',
                key: 'ysnvqfuqsvtqq2wklhre',
                wsHost: 'localhost',
                wsPort: 8082,
                forceTLS: false,
                enabledTransports: ['ws', 'wss'],
                authEndpoint: `${BACKEND_URL}/api/broadcasting/auth`,
                auth: {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('ACCESS_TOKEN')}`
                    }
                }
            });
            setEcho(echoInstance);

            return () => {
                echoInstance.disconnect();
            };
        }
    }, [user]);

    const fetchConversations = useCallback(async () => {
        if (!user) return;
        try {
            const response = await ChatService.getConversations();
            setConversations(response.data.data);

            // Calculate unread total
            // (Note: This depends on backend mapping unread flag/count to conversation model)
            // For now we'll assume conversations have that data or we fetch it
        } catch (error) {
            console.error('Failed to fetch conversations:', error);
        }
    }, [user]);

    useEffect(() => {
        fetchConversations();
    }, [fetchConversations]);

    // Handle incoming messages globally
    useEffect(() => {
        if (echo && user) {
            conversations.forEach(conv => {
                echo.private(`conversation.${conv.id}`)
                    .listen('.message.sent', (data) => {
                        handleIncomingMessage(data.message);
                    });
            });
        }

        return () => {
            if (echo) {
                conversations.forEach(conv => {
                    echo.leave(`conversation.${conv.id}`);
                });
            }
        };
    }, [echo, conversations, user]);

    const handleIncomingMessage = (newMessage) => {
        // Update messages if conversation is active
        if (activeConversation && activeConversation.id === newMessage.conversation_id) {
            setMessages(prev => [newMessage, ...prev]);
            // Mark as read if active
            ChatService.markRead(newMessage.conversation_id);
        }

        // Update conversation list latest message
        setConversations(prev => prev.map(conv => {
            if (conv.id === newMessage.conversation_id) {
                return {
                    ...conv,
                    latest_message: newMessage,
                    // Increment unread if not active
                    unread_count: (activeConversation?.id === conv.id) ? 0 : (conv.unread_count || 0) + 1
                };
            }
            return conv;
        }));
    };

    const selectConversation = async (conversation) => {
        setActiveConversation(conversation);
        try {
            const response = await ChatService.getMessages(conversation.id);
            setMessages(response.data.data.data);
            ChatService.markRead(conversation.id);

            // Clear unread for this conversation locally
            setConversations(prev => prev.map(c =>
                c.id === conversation.id ? { ...c, unread_count: 0 } : c
            ));
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
        setActiveConversation
    };

    return (
        <ChatContext.Provider value={value}>
            {children}
        </ChatContext.Provider>
    );
};
