import React, { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import { motion } from 'framer-motion';
import { getCurrentUser } from '../services/authService';
import { NavLink } from 'react-router-dom';
import { Home, User, Users, MessageCircle, Bell } from 'lucide-react';
import { useSocket } from '../contexts/SocketContext';

interface MainLayoutProps {
    children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
    const [user, setUser] = useState<any>(null);
    const { unreadCount, unreadMessageCount, pendingFriendRequestCount } = useSocket();

    useEffect(() => {
        const currentUser = getCurrentUser();
        if (currentUser) {
            setUser(currentUser);
        }

        // Lắng nghe sự kiện cập nhật user
        const handleUserUpdate = () => {
            const updatedUser = getCurrentUser();
            if (updatedUser) {
                setUser(updatedUser);
            }
        };

        window.addEventListener('userUpdated', handleUserUpdate);

        return () => {
            window.removeEventListener('userUpdated', handleUserUpdate);
        };
    }, []);

    const mobileNavItems = [
        { icon: Home, label: 'Trang chủ', path: '/', badge: 0 },
        { icon: Users, label: 'Bạn bè', path: '/friends', badge: pendingFriendRequestCount },
        { icon: MessageCircle, label: 'Tin nhắn', path: '/messages', badge: unreadMessageCount },
        { icon: Bell, label: 'Thông báo', path: '/notifications', badge: unreadCount },
        { icon: User, label: 'Cá nhân', path: '/profile', badge: 0 },
    ];

    return (
        <div className="min-h-screen bg-black text-white flex">
            {/* Desktop Sidebar */}
            <motion.div
                initial={{ x: -100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="fixed left-0 top-0 h-full z-10 hidden md:block"
            >
                <Sidebar user={user} />
            </motion.div>

            {/* Main Content */}
            <main className="md:ml-64 w-full min-h-screen pb-20 md:pb-0">
                {children}
            </main>

            {/* Mobile Bottom Navigation */}
            <nav className="fixed bottom-0 left-0 right-0 bg-[#1a1a1a] border-t border-gray-800 z-50 md:hidden">
                <div className="flex items-center justify-around py-2 px-1">
                    {mobileNavItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) =>
                                `flex flex-col items-center justify-center py-2 px-3 rounded-xl transition-all relative ${
                                    isActive
                                        ? 'text-purple-500'
                                        : 'text-gray-400'
                                }`
                            }
                        >
                            <item.icon size={22} />
                            <span className="text-[10px] mt-1 font-medium">{item.label}</span>
                            {item.badge > 0 && (
                                <span className="absolute -top-1 right-0 bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                                    {item.badge > 9 ? '9+' : item.badge}
                                </span>
                            )}
                        </NavLink>
                    ))}
                </div>
            </nav>
        </div>
    );
};

export default MainLayout;
