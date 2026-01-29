import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
    Home,
    User,
    Users,
    MessageCircle,
    Bell,
    LogOut
} from 'lucide-react';
import { logout } from '../services/authService';
import { useSocket } from '../contexts/SocketContext';

interface SidebarProps {
    user: {
        name: string;
        avatar?: string;
    } | null;
}

const Sidebar: React.FC<SidebarProps> = ({ user }) => {
    const navigate = useNavigate();
    const { unreadCount, unreadMessageCount, pendingFriendRequestCount } = useSocket();

    const handleLogout = async () => {
        await logout();
        navigate('/auth');
    };

    const navItems = [
        { icon: Home, label: 'Trang chủ', path: '/' },
        { icon: User, label: 'Trang cá nhân', path: '/profile' },
        { icon: Users, label: 'Bạn bè', path: '/friends' },
        { icon: MessageCircle, label: 'Tin nhắn', path: '/messages' },
        { icon: Bell, label: 'Thông báo', path: '/notifications' },
    ];

    return (
        <div className="w-64 min-h-screen bg-[#1a1a1a] p-4 flex flex-col border-r border-gray-800 fixed left-0 top-0">
            {/* App Logo */}
            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent mb-8 px-4">
                Hala
            </h1>

            {/* User Profile Summary */}
            <div className="flex items-center gap-3 mb-8 px-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold overflow-hidden">
                    {user?.avatar ? (
                        <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                    ) : (
                        <span>{user?.name?.[0]?.toUpperCase() || 'U'}</span>
                    )}
                </div>
                <div className="flex flex-col">
                    <span className="text-white font-medium text-sm">{user?.name || 'User'}</span>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 space-y-2">
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-4 py-3 rounded-xl transition-all relative ${isActive
                                ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/20'
                                : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                            }`
                        }
                    >
                        <item.icon size={20} />
                        <span className="font-medium">{item.label}</span>
                        {item.label === 'Thông báo' && unreadCount > 0 && (
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                                {unreadCount > 9 ? '9+' : unreadCount}
                            </span>
                        )}
                        {item.label === 'Tin nhắn' && unreadMessageCount > 0 && (
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 bg-green-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                                {unreadMessageCount > 9 ? '9+' : unreadMessageCount}
                            </span>
                        )}
                        {item.label === 'Bạn bè' && pendingFriendRequestCount > 0 && (
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 bg-blue-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                                {pendingFriendRequestCount > 9 ? '9+' : pendingFriendRequestCount}
                            </span>
                        )}
                    </NavLink>
                ))}
            </nav>

            {/* Logout */}
            <button
                onClick={handleLogout}
                className="flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500/10 hover:text-red-300 rounded-xl transition-all mt-auto"
            >
                <LogOut size={20} />
                <span className="font-medium">Đăng xuất</span>
            </button>
        </div>
    );
};

export default Sidebar;
