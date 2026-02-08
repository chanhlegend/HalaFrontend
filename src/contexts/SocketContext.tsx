import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useToast } from './ToastContext';
import { notificationService } from '../services/notificationService';
import { getUnreadCount as getUnreadMessageCount } from '../services/messageService';
import { friendService } from '../services/friendService';

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

export interface IncomingCallData {
    callerId: string;
    callerName: string;
    callerAvatar?: string;
    channelName: string;
    token: string | null;
    appId: string;
    callType: 'video' | 'audio';
}

export interface CallAcceptedData {
    userId: string;
    userName: string;
    userAvatar?: string;
    channelName: string;
}

interface SocketContextType {
    socket: Socket | null;
    isConnected: boolean;
    notifications: Notification[];
    unreadCount: number;
    unreadMessageCount: number;
    pendingFriendRequestCount: number;
    incomingCall: IncomingCallData | null;
    callAccepted: CallAcceptedData | null;
    callRejected: boolean;
    callEnded: boolean;
    markAsRead: (notificationId: string) => void;
    markAllAsRead: () => void;
    clearNotifications: () => void;
    incrementUnreadMessages: () => void;
    resetUnreadMessages: () => void;
    refreshPendingFriendRequests: () => void;
    setIncomingCall: (call: IncomingCallData | null) => void;
    setCallEnded: (ended: boolean) => void;
    setCallAccepted: (data: CallAcceptedData | null) => void;
    setCallRejected: (rejected: boolean) => void;
    acceptCall: () => void;
    rejectCall: () => void;
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
    const [unreadMessageCount, setUnreadMessageCount] = useState(0);
    const [pendingFriendRequestCount, setPendingFriendRequestCount] = useState(0);
    const [incomingCall, setIncomingCall] = useState<IncomingCallData | null>(null);
    const [callAccepted, setCallAccepted] = useState<CallAcceptedData | null>(null);
    const [callRejected, setCallRejected] = useState(false);
    const [callEnded, setCallEnded] = useState(false);
    const socketRef = useRef<Socket | null>(null);
    const { showToast } = useToast();

    // Fetch initial unread counts on mount
    useEffect(() => {
        const fetchUnreadCounts = async () => {
            const token = localStorage.getItem('accessToken');
            if (!token) return;

            try {
                // Fetch notification unread count
                const notifData = await notificationService.getUnreadCount();
                setUnreadCount(notifData.unreadCount);

                // Fetch message unread count
                const msgCount = await getUnreadMessageCount();
                setUnreadMessageCount(msgCount);

                // Fetch pending friend requests count
                const friendRequests = await friendService.getFriendRequests();
                setPendingFriendRequestCount(friendRequests.length);
            } catch (error) {
                console.error('Error fetching unread counts:', error);
            }
        };

        fetchUnreadCounts();
    }, []);

    useEffect(() => {
        const connectSocket = () => {
            const token = localStorage.getItem('accessToken');
            
            if (!token) {
                console.log('No token found, skipping socket connection');
                return null;
            }

            console.log('Connecting to socket with token...');

            // Connect to socket server
            const newSocket = io(import.meta.env.VITE_API_URL || 'http://localhost:5000', {
                auth: {
                    token,
                },
                reconnection: true,
                reconnectionAttempts: 10,
                reconnectionDelay: 1000,
                reconnectionDelayMax: 5000,
            });

            socketRef.current = newSocket;
            setSocket(newSocket);

            newSocket.on('connect', () => {
                console.log('✅ Socket connected successfully');
                setIsConnected(true);
            });

            newSocket.on('disconnect', (reason) => {
                console.log('❌ Socket disconnected, reason:', reason);
                setIsConnected(false);
                // If server disconnected us (not a client-initiated disconnect),
                // it means the connection was lost unexpectedly
                if (reason === 'io server disconnect' || reason === 'transport close' || reason === 'transport error') {
                    console.log('⚠️ Unexpected disconnect - active calls may be affected');
                }
            });

            newSocket.on('connect_error', (error) => {
                console.error('Socket connection error:', error.message);
                if (error.message === 'Authentication error') {
                    // Token might be expired, disconnect and wait for refresh
                    newSocket.disconnect();
                }
            });

            return newSocket;
        };

        // Initial connection
        const initialSocket = connectSocket();

        // Handle token refresh
        const handleTokenRefresh = () => {
            console.log('Token refreshed, reconnecting socket...');
            
            // Disconnect old socket
            if (socketRef.current) {
                socketRef.current.disconnect();
            }
            
            // Update token in localStorage (already done in apiClient)
            // Reconnect with new token
            const newSocket = connectSocket();
            
            if (newSocket) {
                // Re-attach event listeners
                newSocket.on('notification', (data: { type: string; notification: Notification }) => {
                    console.log('🔔 Received notification:', data);
                    setNotifications(prev => [data.notification, ...prev]);
                    setUnreadCount(prev => prev + 1);
                    
                    // Increment pending friend requests if it's a friend request
                    if (data.type === 'friend_request') {
                        setPendingFriendRequestCount(prev => prev + 1);
                    }
                    
                    showToast(data.notification.message, 'info');
                });

                newSocket.on('new_message', (data: { message: any; conversationId: string }) => {
                    console.log('💬 Received new message:', data);
                    setUnreadMessageCount(prev => prev + 1);
                    showToast(`Tin nhắn mới từ ${data.message.sender.name}`, 'info');
                });

                newSocket.on('incoming_call', (data: IncomingCallData) => {
                    console.log('📞 Incoming call:', data);
                    setIncomingCall(data);
                });

                newSocket.on('call_ended', () => {
                    console.log('📴 Call ended by other user');
                    setIncomingCall(null);
                    setCallEnded(true);
                    showToast('Cuộc gọi đã kết thúc', 'info');
                });

                newSocket.on('call_rejected', () => {
                    console.log('❌ Call rejected');
                    setCallRejected(true);
                    showToast('Cuộc gọi bị từ chối', 'error');
                });

                newSocket.on('call_accepted', (data: CallAcceptedData) => {
                    console.log('✅ Call accepted:', data);
                    setCallAccepted(data);
                });
            }
        };

        window.addEventListener('token-refreshed', handleTokenRefresh);

        if (initialSocket) {
            initialSocket.on('notification', (data: { type: string; notification: Notification }) => {
                console.log('🔔 Received notification:', data);
                setNotifications(prev => [data.notification, ...prev]);
                setUnreadCount(prev => prev + 1);
                
                // Increment pending friend requests if it's a friend request
                if (data.type === 'friend_request') {
                    setPendingFriendRequestCount(prev => prev + 1);
                }
                
                // Show toast notification
                showToast(data.notification.message, 'info');
            });

            initialSocket.on('new_message', (data: { message: any; conversationId: string }) => {
                console.log('💬 Received new message:', data);
                setUnreadMessageCount(prev => prev + 1);
                showToast(`Tin nhắn mới từ ${data.message.sender.name}`, 'info');
            });

            initialSocket.on('incoming_call', (data: IncomingCallData) => {
                console.log('📞 Incoming call:', data);
                setIncomingCall(data);
            });

            initialSocket.on('call_ended', () => {
                console.log('📴 Call ended by other user');
                setIncomingCall(null);
                setCallEnded(true);
                showToast('Cuộc gọi đã kết thúc', 'info');
            });

            initialSocket.on('call_rejected', () => {
                console.log('❌ Call rejected');
                setCallRejected(true);
                showToast('Cuộc gọi bị từ chối', 'error');
            });

            initialSocket.on('call_accepted', (data: CallAcceptedData) => {
                console.log('✅ Call accepted:', data);
                setCallAccepted(data);
            });
        }

        return () => {
            console.log('Cleaning up socket connection');
            window.removeEventListener('token-refreshed', handleTokenRefresh);
            if (socketRef.current) {
                socketRef.current.close();
            }
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

    const incrementUnreadMessages = () => {
        setUnreadMessageCount(prev => prev + 1);
    };

    const resetUnreadMessages = () => {
        setUnreadMessageCount(0);
    };

    const refreshPendingFriendRequests = async () => {
        try {
            const friendRequests = await friendService.getFriendRequests();
            setPendingFriendRequestCount(friendRequests.length);
        } catch (error) {
            console.error('Error refreshing pending friend requests:', error);
        }
    };

    const acceptCall = () => {
        // This will be handled by the component that renders IncomingCall
        setIncomingCall(null);
    };

    const rejectCall = () => {
        setIncomingCall(null);
    };

    const value: SocketContextType = {
        socket,
        isConnected,
        notifications,
        unreadCount,
        unreadMessageCount,
        pendingFriendRequestCount,
        incomingCall,
        callAccepted,
        callRejected,
        callEnded,
        markAsRead,
        markAllAsRead,
        clearNotifications,
        incrementUnreadMessages,
        resetUnreadMessages,
        refreshPendingFriendRequests,
        setIncomingCall,
        setCallAccepted,
        setCallRejected,
        setCallEnded,
        acceptCall,
        rejectCall,
    };

    return (
        <SocketContext.Provider value={value}>
            {children}
        </SocketContext.Provider>
    );
};
