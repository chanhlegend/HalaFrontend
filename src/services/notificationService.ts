import apiClient from './apiClient';

export interface Notification {
    _id: string;
    recipient: string;
    sender: {
        _id: string;
        name: string;
        email: string;
        avatar?: string;
    };
    type: string;
    relatedObject?: string;
    relatedObjectModel?: string;
    message: string;
    isRead: boolean;
    readAt?: string;
    createdAt: string;
    updatedAt: string;
}

export interface NotificationsResponse {
    notifications: Notification[];
    unreadCount: number;
}

export const notificationService = {
    getNotifications: async (limit: number = 20, skip: number = 0) => {
        const response = await apiClient.get<NotificationsResponse>(`/api/notifications?limit=${limit}&skip=${skip}`);
        return response.data;
    },

    getUnreadCount: async () => {
        const response = await apiClient.get<{ unreadCount: number }>('/api/notifications/unread-count');
        return response.data;
    },

    markAsRead: async (notificationId: string) => {
        const response = await apiClient.post('/api/notifications/mark-read', { notificationId });
        return response.data;
    },

    markAllAsRead: async () => {
        const response = await apiClient.post('/api/notifications/mark-all-read');
        return response.data;
    },

    deleteNotification: async (notificationId: string) => {
        const response = await apiClient.delete(`/api/notifications/${notificationId}`);
        return response.data;
    },

    deleteAllNotifications: async () => {
        const response = await apiClient.delete('/api/notifications');
        return response.data;
    }
};
