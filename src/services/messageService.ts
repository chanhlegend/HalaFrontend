import apiClient from './apiClient';

export interface Participant {
    _id: string;
    name: string;
    email: string;
    avatar?: string;
}

export interface Conversation {
    _id: string;
    participant: Participant;
    lastMessage?: string;
    lastMessageTime?: string;
    updatedAt: string;
    unreadCount?: number;
}

export interface Message {
    _id: string;
    conversation: string;
    sender: Participant;
    type: 'text' | 'image';
    content: string;
    mediaUrl?: string;
    isRead: boolean;
    readAt?: string;
    createdAt: string;
}

// Get all conversations
export const getConversations = async (): Promise<Conversation[]> => {
    const response = await apiClient.get('/api/messages/conversations');
    return response.data;
};

// Get messages for a conversation
export const getMessages = async (conversationId: string, page = 1, limit = 50): Promise<Message[]> => {
    const response = await apiClient.get(`/api/messages/${conversationId}`, {
        params: { page, limit }
    });
    return response.data;
};

// Send a message
export const sendMessage = async (conversationId: string, content: string, type: 'text' | 'image' = 'text', mediaUrl?: string): Promise<Message> => {
    const response = await apiClient.post('/api/messages/send', {
        conversationId,
        content,
        type,
        mediaUrl
    });
    return response.data;
};

// Get or create conversation with a user
export const getOrCreateConversation = async (participantId: string): Promise<Conversation> => {
    const response = await apiClient.post('/api/messages/conversation', {
        participantId
    });
    return response.data;
};

// Mark messages as read
export const markAsRead = async (conversationId: string): Promise<void> => {
    await apiClient.put(`/api/messages/${conversationId}/read`);
};

// Delete a message
export const deleteMessage = async (messageId: string): Promise<void> => {
    await apiClient.delete(`/api/messages/${messageId}`);
};

// Get unread message count
export const getUnreadCount = async (): Promise<number> => {
    const response = await apiClient.get('/api/messages/unread-count');
    return response.data.unreadCount;
};
