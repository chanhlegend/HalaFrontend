import apiClient from './apiClient';

export interface Friend {
    _id: string;
    user: string;
    friend: {
        _id: string;
        name: string;
        email: string;
        avatar?: string;
    };
}

export interface FriendRequest {
    _id: string;
    sender: {
        _id: string;
        name: string;
        email: string;
        avatar?: string;
    };
    receiver: string;
    status: 'pending' | 'accepted' | 'rejected';
    createdAt: string;
}

export interface UserSuggestion {
    _id: string;
    name: string;
    email: string;
    avatar?: string;
}

export const friendService = {
    getFriends: async () => {
        const response = await apiClient.get<Friend[]>('/api/friends');
        return response.data;
    },

    getFriendRequests: async () => {
        const response = await apiClient.get<FriendRequest[]>('/api/friends/requests');
        return response.data;
    },

    getSuggestions: async () => {
        const response = await apiClient.get<UserSuggestion[]>('/api/friends/suggestions');
        return response.data;
    },

    sendFriendRequest: async (receiverId: string) => {
        const response = await apiClient.post('/api/friends/request', { receiverId });
        return response.data;
    },

    acceptFriendRequest: async (requestId: string) => {
        const response = await apiClient.post('/api/friends/request/accept', { requestId });
        return response.data;
    },

    rejectFriendRequest: async (requestId: string) => {
        const response = await apiClient.post('/api/friends/request/reject', { requestId });
        return response.data;
    },

    unfriend: async (friendId: string) => {
        const response = await apiClient.delete(`/api/friends/${friendId}`);
        return response.data;
    },

    searchUser: async (email: string) => {
        const response = await apiClient.post('/api/friends/search', { email });
        return response.data;
    },

    getFriendshipStatus: async (targetUserId: string): Promise<{ status: string; requestId?: string }> => {
        const response = await apiClient.get(`/api/friends/status/${targetUserId}`);
        return response.data;
    },

    cancelFriendRequest: async (requestId: string) => {
        const response = await apiClient.delete(`/api/friends/request/${requestId}`);
        return response.data;
    }
};
