import axiosClient from '../lib/axios';

const ChatService = {
    getConversations: () => axiosClient.get('/api/chat/conversations'),
    
    startConversation: (targetType, targetId) => 
        axiosClient.post('/api/chat/start', { 
            target_type: targetType.toLowerCase(), // backend validates 'user' | 'institute' (lowercase)
            target_id: targetId 
        }),

    getMessages: (conversationId, page = 1) => 
        axiosClient.get(`/api/chat/${conversationId}/messages?page=${page}`),

    sendMessage: (conversationId, message) => 
        axiosClient.post(`/api/chat/${conversationId}/send`, { message }),

    markRead: (conversationId) => 
        axiosClient.post(`/api/chat/${conversationId}/mark-read`),

    getInstitutions: () => axiosClient.get('/api/institutions')
};

export default ChatService;
