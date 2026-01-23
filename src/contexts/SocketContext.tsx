import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useToast } from './ToastContext';

interface Notification {
    _id: string;
    type: string;
    message: string;
    sender: {
        _id: string;
        name: string;
        email: string;
        avatar?: string;
    };
    isRead: boolean;
    createdAt: string;
}

interface SocketContextType {
    socket: Socket | null;
    isConnected: boolean;
    notifications: Notification[];
    unreadCount: number;
    markAsRead: (notificationId: string) => void;
    markAllAsRead: () => void;
    clearNotifications: () => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const useSocket = () => {
    const context = useContext(SocketContext);
    if (!context) {
        throw new Error('useSocket must be used within a SocketProvider');
    }
    return context;
};

interface SocketProviderProps {
    children: React.ReactNode;
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const socketRef = useRef<Socket | null>(null);
    const { showToast } = useToast();

    useEffect(() => {
        const token = localStorage.getItem('accessToken');
        
        if (!token) {
            console.log('No token found, skipping socket connection');
            return;
        }

        console.log('Connecting to socket with token...');

        // Connect to socket server
        const newSocket = io(import.meta.env.VITE_API_URL || 'http://localhost:5000', {
            auth: {
                token,
            },
        });

        socketRef.current = newSocket;
        setSocket(newSocket);

        newSocket.on('connect', () => {
            console.log('✅ Socket connected successfully');
            setIsConnected(true);
        });

        newSocket.on('disconnect', () => {
            console.log('❌ Socket disconnected');
            setIsConnected(false);
        });

        newSocket.on('connect_error', (error) => {
            console.error('Socket connection error:', error);
        });

        newSocket.on('notification', (data: { type: string; notification: Notification }) => {
            console.log('🔔 Received notification:', data);
            setNotifications(prev => [data.notification, ...prev]);
            setUnreadCount(prev => prev + 1);
            
            // Show toast notification
            showToast(data.notification.message, 'info');
        });

        return () => {
            console.log('Cleaning up socket connection');
            newSocket.close();
        };
    }, [showToast]);

    const markAsRead = (notificationId: string) => {
        setNotifications(prev =>
            prev.map(notif =>
                notif._id === notificationId ? { ...notif, isRead: true } : notif
            )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
    };

    const markAllAsRead = () => {
        setNotifications(prev => prev.map(notif => ({ ...notif, isRead: true })));
        setUnreadCount(0);
    };

    const clearNotifications = () => {
        setNotifications([]);
        setUnreadCount(0);
    };

    const value: SocketContextType = {
        socket,
        isConnected,
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        clearNotifications,
    };

    return (
        <SocketContext.Provider value={value}>
            {children}
        </SocketContext.Provider>
    );
};
