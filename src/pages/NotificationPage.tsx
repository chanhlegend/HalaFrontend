import React, { useEffect, useState } from 'react';
import { useSocket } from '../contexts/SocketContext';
import { notificationService, Notification } from '../services/notificationService';
import { useToast } from '../contexts/ToastContext';
import { Bell, Check, CheckCheck, Trash2, UserPlus, UserCheck } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';

const NotificationPage: React.FC = () => {
    const { notifications: realtimeNotifications, unreadCount, markAsRead, markAllAsRead } = useSocket();
    const [allNotifications, setAllNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const { showToast } = useToast();

    useEffect(() => {
        fetchNotifications();
    }, []);

    // Merge realtime notifications with fetched notifications
    useEffect(() => {
        if (realtimeNotifications.length > 0) {
            setAllNotifications(prev => {
                const newNotifs = realtimeNotifications.filter(
                    rn => !prev.some(n => n._id === rn._id)
                );
                return [...newNotifs, ...prev];
            });
        }
    }, [realtimeNotifications]);

    const fetchNotifications = async () => {
        try {
            const data = await notificationService.getNotifications(50);
            setAllNotifications(data.notifications);
        } catch (error) {
            console.error('Error fetching notifications:', error);
            showToast('Không thể tải thông báo', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleMarkAsRead = async (notificationId: string) => {
        try {
            await notificationService.markAsRead(notificationId);
            markAsRead(notificationId);
            setAllNotifications(prev =>
                prev.map(n => n._id === notificationId ? { ...n, isRead: true } : n)
            );
        } catch (error) {
            console.error('Error marking as read:', error);
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            await notificationService.markAllAsRead();
            markAllAsRead();
            setAllNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
            showToast('Đã đánh dấu tất cả đã đọc', 'success');
        } catch (error) {
            console.error('Error marking all as read:', error);
            showToast('Có lỗi xảy ra', 'error');
        }
    };

    const handleDelete = async (notificationId: string) => {
        try {
            await notificationService.deleteNotification(notificationId);
            setAllNotifications(prev => prev.filter(n => n._id !== notificationId));
            showToast('Đã xóa thông báo', 'success');
        } catch (error) {
            console.error('Error deleting notification:', error);
            showToast('Có lỗi xảy ra', 'error');
        }
    };

    const getNotificationIcon = (type: string) => {
        switch (type) {
            case 'friend_request':
                return <UserPlus className="text-blue-400" size={20} />;
            case 'friend_request_accepted':
                return <UserCheck className="text-green-400" size={20} />;
            default:
                return <Bell className="text-gray-400" size={20} />;
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0f0f1a] text-white p-8">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center py-10 text-gray-400">Đang tải...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0f0f1a] text-white p-8">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold">Thông báo</h1>
                        <p className="text-gray-400 mt-1">
                            {unreadCount > 0 ? `Bạn có ${unreadCount} thông báo chưa đọc` : 'Không có thông báo mới'}
                        </p>
                    </div>
                    {unreadCount > 0 && (
                        <button
                            onClick={handleMarkAllAsRead}
                            className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors text-sm font-medium"
                        >
                            <CheckCheck size={18} />
                            Đánh dấu tất cả đã đọc
                        </button>
                    )}
                </div>

                {/* Notifications List */}
                <div className="space-y-3">
                    {allNotifications.length === 0 ? (
                        <div className="bg-[#151525] rounded-2xl p-12 text-center border border-gray-800/50">
                            <Bell size={48} className="mx-auto text-gray-600 mb-4" />
                            <p className="text-gray-400">Chưa có thông báo nào</p>
                        </div>
                    ) : (
                        allNotifications.map((notification) => (
                            <div
                                key={notification._id}
                                className={`bg-[#151525] rounded-xl p-4 border transition-all hover:border-gray-700 ${
                                    notification.isRead ? 'border-gray-800/50' : 'border-purple-500/30 bg-purple-900/5'
                                }`}
                            >
                                <div className="flex items-start gap-4">
                                    {/* Avatar */}
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0 overflow-hidden">
                                        {notification.sender.avatar ? (
                                            <img 
                                                src={notification.sender.avatar} 
                                                alt={notification.sender.name}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <span className="text-white font-bold">
                                                {notification.sender.name[0]?.toUpperCase()}
                                            </span>
                                        )}
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start gap-2 mb-1">
                                            {getNotificationIcon(notification.type)}
                                            <p className="text-white text-sm flex-1">
                                                {notification.message}
                                            </p>
                                            {!notification.isRead && (
                                                <span className="w-2 h-2 bg-purple-500 rounded-full flex-shrink-0 mt-1"></span>
                                            )}
                                        </div>
                                        <p className="text-gray-500 text-xs">
                                            {formatDistanceToNow(new Date(notification.createdAt), { 
                                                addSuffix: true,
                                                locale: vi 
                                            })}
                                        </p>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex gap-2 flex-shrink-0">
                                        {!notification.isRead && (
                                            <button
                                                onClick={() => handleMarkAsRead(notification._id)}
                                                className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                                                title="Đánh dấu đã đọc"
                                            >
                                                <Check size={18} className="text-gray-400" />
                                            </button>
                                        )}
                                        <button
                                            onClick={() => handleDelete(notification._id)}
                                            className="p-2 hover:bg-red-500/10 rounded-lg transition-colors"
                                            title="Xóa"
                                        >
                                            <Trash2 size={18} className="text-red-400" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default NotificationPage;
