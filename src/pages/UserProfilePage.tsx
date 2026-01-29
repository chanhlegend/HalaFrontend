import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Briefcase, MapPin, Calendar, UserPlus, UserMinus, UserCheck, MessageCircle, Clock, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import PostCard from '../components/PostCard';
import { getUserById } from '../services/userService';
import { friendService } from '../services/friendService';
import { getPostsByUser, IPost } from '../services/postService';
import { useToast } from '../contexts/ToastContext';
import { IUser } from '../types';

const UserProfilePage: React.FC = () => {
    const { userId } = useParams<{ userId: string }>();
    const navigate = useNavigate();
    const [user, setUser] = useState<IUser | null>(null);
    const [posts, setPosts] = useState<IPost[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isPostsLoading, setIsPostsLoading] = useState(false);
    const [friendshipStatus, setFriendshipStatus] = useState<'none' | 'friend' | 'sent' | 'received' | 'self'>('none');
    const [requestId, setRequestId] = useState<string | null>(null);
    const [isActionLoading, setIsActionLoading] = useState(false);
    const { showToast } = useToast();

    // Get current user from localStorage
    const userStr = localStorage.getItem('user');
    const currentUser = userStr ? JSON.parse(userStr) : null;
    const currentUserId = currentUser?.id || currentUser?._id;

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.15
            }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: {
                duration: 0.5,
                ease: "easeOut" as const
            }
        }
    };

    // Load user profile
    useEffect(() => {
        if (userId) {
            // If viewing own profile, redirect to /profile
            if (userId === currentUserId) {
                navigate('/profile');
                return;
            }
            loadUserProfile();
            loadFriendshipStatus();
        }
    }, [userId, currentUserId]);

    // Load posts when user is loaded
    useEffect(() => {
        if (user?._id) {
            loadPosts();
        }
    }, [user?._id]);

    const loadUserProfile = async () => {
        if (!userId) return;
        try {
            setIsLoading(true);
            const userData = await getUserById(userId);
            setUser(userData);
        } catch (error: any) {
            showToast(error.response?.data?.message || 'Không thể tải thông tin người dùng', 'error');
            navigate('/');
        } finally {
            setIsLoading(false);
        }
    };

    const loadFriendshipStatus = async () => {
        if (!userId) return;
        try {
            const response = await friendService.getFriendshipStatus(userId);
            setFriendshipStatus(response.status as any);
            if (response.requestId) {
                setRequestId(response.requestId);
            }
        } catch (error) {
            console.error('Error loading friendship status:', error);
        }
    };

    const loadPosts = async () => {
        if (!user?._id) return;
        try {
            setIsPostsLoading(true);
            const response = await getPostsByUser(user._id);
            setPosts(response.posts);
        } catch (error: any) {
            console.error('Error loading posts:', error);
        } finally {
            setIsPostsLoading(false);
        }
    };

    const handleSendFriendRequest = async () => {
        if (!userId) return;
        try {
            setIsActionLoading(true);
            await friendService.sendFriendRequest(userId);
            setFriendshipStatus('sent');
            showToast('Đã gửi lời mời kết bạn!', 'success');
            loadFriendshipStatus();
        } catch (error: any) {
            showToast(error.response?.data?.message || 'Không thể gửi lời mời kết bạn', 'error');
        } finally {
            setIsActionLoading(false);
        }
    };

    const handleCancelFriendRequest = async () => {
        if (!requestId) return;
        try {
            setIsActionLoading(true);
            await friendService.cancelFriendRequest(requestId);
            setFriendshipStatus('none');
            setRequestId(null);
            showToast('Đã hủy lời mời kết bạn', 'success');
        } catch (error: any) {
            showToast(error.response?.data?.message || 'Không thể hủy lời mời kết bạn', 'error');
        } finally {
            setIsActionLoading(false);
        }
    };

    const handleAcceptFriendRequest = async () => {
        if (!requestId) return;
        try {
            setIsActionLoading(true);
            await friendService.acceptFriendRequest(requestId);
            setFriendshipStatus('friend');
            setRequestId(null);
            showToast('Đã chấp nhận lời mời kết bạn!', 'success');
        } catch (error: any) {
            showToast(error.response?.data?.message || 'Không thể chấp nhận lời mời kết bạn', 'error');
        } finally {
            setIsActionLoading(false);
        }
    };

    const handleUnfriend = async () => {
        if (!userId) return;
        try {
            setIsActionLoading(true);
            await friendService.unfriend(userId);
            setFriendshipStatus('none');
            showToast('Đã hủy kết bạn', 'success');
        } catch (error: any) {
            showToast(error.response?.data?.message || 'Không thể hủy kết bạn', 'error');
        } finally {
            setIsActionLoading(false);
        }
    };

    const handleSendMessage = () => {
        if (!userId) return;
        navigate(`/messages?userId=${userId}`);
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

    const renderFriendshipButton = () => {
        switch (friendshipStatus) {
            case 'friend':
                return (
                    <div className="flex gap-2">
                        <button
                            onClick={handleSendMessage}
                            className="flex items-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
                        >
                            <MessageCircle size={18} />
                            <span>Nhắn tin</span>
                        </button>
                        <button
                            onClick={handleUnfriend}
                            disabled={isActionLoading}
                            className="flex items-center gap-2 px-5 py-2.5 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                        >
                            <UserMinus size={18} />
                            <span>{isActionLoading ? 'Đang xử lý...' : 'Hủy kết bạn'}</span>
                        </button>
                    </div>
                );
            case 'sent':
                return (
                    <button
                        onClick={handleCancelFriendRequest}
                        disabled={isActionLoading}
                        className="flex items-center gap-2 px-5 py-2.5 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                    >
                        <Clock size={18} />
                        <span>{isActionLoading ? 'Đang xử lý...' : 'Đã gửi lời mời'}</span>
                    </button>
                );
            case 'received':
                return (
                    <div className="flex gap-2">
                        <button
                            onClick={handleAcceptFriendRequest}
                            disabled={isActionLoading}
                            className="flex items-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                        >
                            <UserCheck size={18} />
                            <span>{isActionLoading ? 'Đang xử lý...' : 'Chấp nhận'}</span>
                        </button>
                        <button
                            onClick={handleCancelFriendRequest}
                            disabled={isActionLoading}
                            className="flex items-center gap-2 px-5 py-2.5 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                        >
                            <span>Từ chối</span>
                        </button>
                    </div>
                );
            case 'none':
            default:
                return (
                    <button
                        onClick={handleSendFriendRequest}
                        disabled={isActionLoading}
                        className="flex items-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                    >
                        <UserPlus size={18} />
                        <span>{isActionLoading ? 'Đang xử lý...' : 'Kết bạn'}</span>
                    </button>
                );
        }
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

    return (
        <motion.div
            className="min-h-screen bg-[#0d0d0d]"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            {/* Cover Photo Section */}
            <motion.div className="relative h-[300px] md:h-[350px] w-full" variants={itemVariants}>
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
                {/* Back button */}
                <button
                    onClick={() => navigate(-1)}
                    className="absolute top-4 left-4 flex items-center gap-2 px-4 py-2 bg-black/50 hover:bg-black/70 text-white rounded-lg backdrop-blur-sm transition-colors"
                >
                    <ArrowLeft size={18} />
                    <span className="text-sm font-medium">Quay lại</span>
                </button>
            </motion.div>

            {/* Profile Info Section */}
            <motion.div className="max-w-4xl mx-auto px-4 -mt-20 relative z-10" variants={itemVariants}>
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
                        {/* Friendship indicator */}
                        {friendshipStatus === 'friend' && (
                            <div className="absolute bottom-2 right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white border-2 border-[#0d0d0d]">
                                <UserCheck size={16} />
                            </div>
                        )}
                    </div>

                    {/* Name and Bio */}
                    <div className="flex-1 md:mb-4">
                        <h1 className="text-2xl md:text-3xl font-bold text-white mb-1">{user.name}</h1>
                        {user.bio && <p className="text-purple-400">{user.bio}</p>}
                        {friendshipStatus === 'friend' && (
                            <span className="inline-flex items-center gap-1 text-green-400 text-sm mt-1">
                                <UserCheck size={14} /> Bạn bè
                            </span>
                        )}
                    </div>

                    {/* Action Buttons */}
                    <div className="md:mb-4">
                        {renderFriendshipButton()}
                    </div>
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
                </div>

                {/* Posts Section */}
                <motion.div className="pb-8" variants={itemVariants}>
                    <h2 className="text-xl font-semibold text-white mb-4">Bài viết</h2>
                    <div className="space-y-6">
                        {isPostsLoading ? (
                            <div className="text-center py-8 text-gray-400">Đang tải bài viết...</div>
                        ) : posts.length === 0 ? (
                            <div className="text-center py-8 text-gray-400">Chưa có bài viết nào</div>
                        ) : (
                            posts.map((post) => (
                                <PostCard
                                    key={post._id}
                                    postId={post._id}
                                    user={post.author}
                                    time={post.createdAt}
                                    content={post.content}
                                    images={post.images}
                                    likes={post.likesCount}
                                    comments={post.commentsCount}
                                    isLiked={currentUser ? post.likes.includes(currentUserId) : false}
                                    currentUserId={currentUserId}
                                />
                            ))
                        )}
                    </div>
                </motion.div>
            </motion.div>
        </motion.div>
    );
};

export default UserProfilePage;
