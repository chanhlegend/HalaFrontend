import React, { useState, useEffect } from 'react';
import { Camera, Edit, Briefcase, MapPin, Calendar, Mail } from 'lucide-react';
import PostCard from '../components/PostCard';
import CreatePost from '../components/CreatePost';
import EditProfileModal from '../components/EditProfileModal';
import { getProfile, updateProfile } from '../services/userService';
import { friendService, Friend } from '../services/friendService';
import { useToast } from '../contexts/ToastContext';
import { IUser } from '../types';

type TabType = 'posts' | 'about' | 'friends';

// Mock data - sẽ được thay thế bằng data thật từ API
const mockUser = {
    _id: '1',
    name: 'Nguyễn Văn Minh',
    email: 'user@example.com',
    avatar: '',
    coverPhoto: '',
    bio: 'Yêu thích công nghệ và du lịch. Luôn tìm kiếm những trải nghiệm mới mẻ!',
    workplace: 'Công ty ABC',
    location: 'Thành phố Hồ Chí Minh',
    dateOfBirth: '1995-05-15',
};

const mockPosts = [
    {
        id: '1',
        user: { name: 'Nguyễn Văn Minh', avatar: '' },
        time: '3 giờ trước',
        content: 'Đã hoàn thành dự án mới! Cảm giác tuyệt vời 🎉',
        likes: 45,
        comments: 0,
    },
    {
        id: '2',
        user: { name: 'Nguyễn Văn Minh', avatar: '' },
        time: '1 ngày trước',
        content: 'Chuyến du lịch Đà Lạt thật tuyệt vời! 🌲⛰️',
        image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
        likes: 120,
        comments: 15,
    },
];

const mockFriends = [
    { id: '1', name: 'Trần Thị Hoa', avatar: '', mutualFriends: 5 },
    { id: '2', name: 'Lê Văn Nam', avatar: '', mutualFriends: 12 },
    { id: '3', name: 'Phạm Thị Lan', avatar: '', mutualFriends: 8 },
    { id: '4', name: 'Ngô Văn Hải', avatar: '', mutualFriends: 3 },
    { id: '5', name: 'Đỗ Thị Mai', avatar: '', mutualFriends: 7 },
    { id: '6', name: 'Vũ Văn Tùng', avatar: '', mutualFriends: 2 },
];

const ProfilePage: React.FC = () => {
    const [activeTab, setActiveTab] = useState<TabType>('posts');
    const [user, setUser] = useState<IUser | null>(null);
    const [friends, setFriends] = useState<Friend[]>([]);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isFriendsLoading, setIsFriendsLoading] = useState(false);
    const { showToast } = useToast();

    // Load user profile
    useEffect(() => {
        loadProfile();
        loadFriends();
    }, []);

    const loadProfile = async () => {
        try {
            setIsLoading(true);
            const profileData = await getProfile();
            setUser(profileData);
        } catch (error: any) {
            showToast(error.response?.data?.message || 'Không thể tải thông tin người dùng', 'error');
            // Fallback to mock data for development
            setUser(mockUser as any);
        } finally {
            setIsLoading(false);
        }
    };

    const loadFriends = async () => {
        try {
            setIsFriendsLoading(true);
            const friendsData = await friendService.getFriends();
            setFriends(friendsData);
        } catch (error: any) {
            console.error('Error loading friends:', error);
            // Fallback to mock data for development
            setFriends(mockFriends.map(f => ({
                _id: f.id,
                user: '1',
                friend: {
                    _id: f.id,
                    name: f.name,
                    email: '',
                    avatar: f.avatar
                }
            })));
        } finally {
            setIsFriendsLoading(false);
        }
    };

    const handleUpdateProfile = async (data: any) => {
        try {
            const updatedUser = await updateProfile(data);
            setUser(updatedUser);
            showToast('Cập nhật thông tin thành công!', 'success');
        } catch (error: any) {
            throw error;
        }
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN', {
            day: 'numeric',
            month: 'numeric',
            year: 'numeric',
        });
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#0d0d0d] flex items-center justify-center">
                <div className="text-white">Đang tải...</div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="min-h-screen bg-[#0d0d0d] flex items-center justify-center">
                <div className="text-white">Không tìm thấy thông tin người dùng</div>
            </div>
        );
    }

    const renderTabContent = () => {
        switch (activeTab) {
            case 'posts':
                return (
                    <div className="space-y-6">
                        <CreatePost user={user} />
                        {mockPosts.map((post) => (
                            <PostCard
                                key={post.id}
                                user={post.user}
                                time={post.time}
                                content={post.content}
                                image={post.image}
                                likes={post.likes}
                                comments={post.comments}
                            />
                        ))}
                    </div>
                );
            case 'about':
                return (
                    <div className="bg-[#1a1a1a] rounded-2xl border border-gray-800 p-6">
                        <h3 className="text-xl font-semibold text-white mb-6">Giới thiệu</h3>
                        <div className="space-y-4">
                            <div className="flex items-center gap-3 text-gray-300">
                                <Briefcase size={20} className="text-gray-500" />
                                <span>Làm việc tại <strong className="text-white">{user.workplace}</strong></span>
                            </div>
                            <div className="flex items-center gap-3 text-gray-300">
                                <MapPin size={20} className="text-gray-500" />
                                <span>Sống tại <strong className="text-white">{user.location}</strong></span>
                            </div>
                            <div className="flex items-center gap-3 text-gray-300">
                                <Calendar size={20} className="text-gray-500" />
                                <span>Sinh ngày <strong className="text-white">{formatDate(user.dateOfBirth)}</strong></span>
                            </div>
                            <div className="flex items-center gap-3 text-gray-300">
                                <Mail size={20} className="text-gray-500" />
                                <span><strong className="text-white">{user.email}</strong></span>
                            </div>
                        </div>
                        {user.bio && (
                            <div className="mt-6 pt-6 border-t border-gray-800">
                                <h4 className="text-lg font-medium text-white mb-2">Tiểu sử</h4>
                                <p className="text-gray-300">{user.bio}</p>
                            </div>
                        )}
                    </div>
                );
            case 'friends':
                return (
                    <div className="bg-[#1a1a1a] rounded-2xl border border-gray-800 p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-semibold text-white">Bạn bè</h3>
                            <span className="text-gray-400">{friends.length} người bạn</span>
                        </div>
                        {isFriendsLoading ? (
                            <div className="text-center py-8 text-gray-400">Đang tải...</div>
                        ) : friends.length === 0 ? (
                            <div className="text-center py-8 text-gray-400">Chưa có bạn bè nào</div>
                        ) : (
                            <div className="grid grid-cols-2 gap-4">
                                {friends.map((friendItem) => (
                                    <div
                                        key={friendItem._id}
                                        className="flex items-center gap-3 p-3 rounded-xl bg-gray-800/50 hover:bg-gray-800 transition-colors cursor-pointer"
                                    >
                                        <div className="w-16 h-16 rounded-xl bg-gradient-to-tr from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-xl overflow-hidden">
                                            {friendItem.friend.avatar ? (
                                                <img src={friendItem.friend.avatar} alt={friendItem.friend.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <span>{friendItem.friend.name[0].toUpperCase()}</span>
                                            )}
                                        </div>
                                        <div className="flex-1 overflow-hidden">
                                            <h4 className="text-white font-medium truncate">{friendItem.friend.name}</h4>
                                            <span className="text-gray-500 text-sm truncate">{friendItem.friend.email}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-[#0d0d0d]">
            {/* Cover Photo Section */}
            <div className="relative h-[300px] md:h-[350px] w-full">
                <div className="absolute inset-0 bg-gradient-to-b from-purple-900/30 to-[#0d0d0d]">
                    {user.coverPhoto ? (
                        <img
                            src={user.coverPhoto}
                            alt="Cover"
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-r from-purple-900 to-pink-900" />
                    )}
                </div>
                <button className="absolute top-4 right-4 flex items-center gap-2 px-4 py-2 bg-black/50 hover:bg-black/70 text-white rounded-lg backdrop-blur-sm transition-colors">
                    <Camera size={18} />
                    <span className="text-sm font-medium">Sửa ảnh bìa</span>
                </button>
            </div>

            {/* Profile Info Section */}
            <div className="max-w-4xl mx-auto px-4 -mt-20 relative z-10">
                {/* Avatar and Basic Info */}
                <div className="flex flex-col md:flex-row md:items-end gap-4 mb-6">
                    {/* Avatar */}
                    <div className="relative">
                        <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-[#0d0d0d] bg-gradient-to-tr from-purple-500 to-pink-500 flex items-center justify-center text-white text-4xl font-bold overflow-hidden">
                            {user.avatar ? (
                                <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                            ) : (
                                <span>{user.name[0].toUpperCase()}</span>
                            )}
                        </div>
                        <button className="absolute bottom-2 right-2 w-9 h-9 bg-gray-800 hover:bg-gray-700 rounded-full flex items-center justify-center text-white border-2 border-[#0d0d0d] transition-colors">
                            <Camera size={16} />
                        </button>
                    </div>

                    {/* Name and Bio */}
                    <div className="flex-1 md:mb-4">
                        <h1 className="text-2xl md:text-3xl font-bold text-white mb-1">{user.name}</h1>
                        <p className="text-purple-400">{user.bio}</p>
                    </div>

                    {/* Edit Profile Button */}
                    <button 
                        onClick={() => setIsEditModalOpen(true)}
                        className="flex items-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors md:mb-4"
                    >
                        <Edit size={18} />
                        <span>Chỉnh sửa trang cá nhân</span>
                    </button>
                </div>

                {/* User Info Row */}
                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-400 mb-6 pb-6 border-b border-gray-800">
                    {user.workplace && (
                        <div className="flex items-center gap-2">
                            <Briefcase size={16} />
                            <span>Làm việc tại <strong className="text-gray-300">{user.workplace}</strong></span>
                        </div>
                    )}
                    {user.location && (
                        <div className="flex items-center gap-2">
                            <MapPin size={16} />
                            <span>{user.location}</span>
                        </div>
                    )}
                    {user.dateOfBirth && (
                        <div className="flex items-center gap-2">
                            <Calendar size={16} />
                            <span>Sinh ngày {formatDate(user.dateOfBirth)}</span>
                        </div>
                    )}
                    <div className="flex items-center gap-2">
                        <Mail size={16} />
                        <span>{user.email}</span>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-gray-800 mb-6">
                    <button
                        onClick={() => setActiveTab('posts')}
                        className={`flex-1 py-3 text-center font-medium transition-colors relative ${
                            activeTab === 'posts'
                                ? 'text-purple-400'
                                : 'text-gray-400 hover:text-gray-300'
                        }`}
                    >
                        Bài viết
                        {activeTab === 'posts' && (
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-500" />
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab('about')}
                        className={`flex-1 py-3 text-center font-medium transition-colors relative ${
                            activeTab === 'about'
                                ? 'text-purple-400'
                                : 'text-gray-400 hover:text-gray-300'
                        }`}
                    >
                        Giới thiệu
                        {activeTab === 'about' && (
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-500" />
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab('friends')}
                        className={`flex-1 py-3 text-center font-medium transition-colors relative ${
                            activeTab === 'friends'
                                ? 'text-purple-400'
                                : 'text-gray-400 hover:text-gray-300'
                        }`}
                    >
                        Bạn bè
                        {activeTab === 'friends' && (
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-500" />
                        )}
                    </button>
                </div>

                {/* Tab Content */}
                <div className="pb-8">
                    {renderTabContent()}
                </div>
            </div>

            {/* Edit Profile Modal */}
            <EditProfileModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                onSave={handleUpdateProfile}
                currentData={{
                    name: user.name,
                    bio: user.bio,
                    workplace: user.workplace,
                    location: user.location,
                    dateOfBirth: user.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split('T')[0] : '',
                    phone: user.phone,
                }}
            />
        </div>
    );
};

export default ProfilePage;
