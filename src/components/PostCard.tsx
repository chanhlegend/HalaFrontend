import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MoreHorizontal, Heart, MessageCircle, Share2 } from 'lucide-react';
import { likePost } from '../services/postService';
import CommentSection from './CommentSection';

interface PostProps {
    postId: string;
    user: {
        _id?: string;
        name: string;
        avatar?: string;
    };
    time: string;
    content: string;
    images?: string[];
    likes: number;
    comments: number;
    isLiked?: boolean;
    currentUserId?: string;
}

const PostCard: React.FC<PostProps> = ({ postId, user, time, content, images, likes, comments, isLiked = false, currentUserId }) => {
    const navigate = useNavigate();
    const [liked, setLiked] = useState(isLiked);
    const [likesCount, setLikesCount] = useState(likes);
    const [isLiking, setIsLiking] = useState(false);
    const [showComments, setShowComments] = useState(false);
    const [commentsCount, setCommentsCount] = useState(comments);

    const handleLike = async () => {
        if (isLiking) return;
        
        // Optimistic update
        setLiked(!liked);
        setLikesCount(liked ? likesCount - 1 : likesCount + 1);
        
        setIsLiking(true);
        try {
            const response = await likePost(postId);
            setLiked(response.liked);
            setLikesCount(response.likesCount);
        } catch (error) {
            // Revert on error
            setLiked(liked);
            setLikesCount(likesCount);
            console.error('Error liking post:', error);
        } finally {
            setIsLiking(false);
        }
    };

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Vừa xong';
        if (diffMins < 60) return `${diffMins} phút trước`;
        if (diffHours < 24) return `${diffHours} giờ trước`;
        if (diffDays < 7) return `${diffDays} ngày trước`;
        return date.toLocaleDateString('vi-VN');
    };

    const handleCommentCountChange = (count: number) => {
        setCommentsCount(count);
    };

    return (
        <div className="bg-[#1a1a1a] rounded-2xl border border-gray-800 overflow-hidden mb-6">
            {/* Post Header */}
            <div className="p-4 flex items-center justify-between">
                <div 
                    className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() => user._id && navigate(`/user/${user._id}`)}
                >
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold overflow-hidden">
                        {user.avatar ? (
                            <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                        ) : (
                            <span>{user.name[0].toUpperCase()}</span>
                        )}
                    </div>
                    <div>
                        <h3 className="text-white font-medium hover:text-purple-400 transition-colors">{user.name}</h3>
                        <span className="text-gray-500 text-xs">{typeof time === 'string' && time.includes('T') ? formatTime(time) : time}</span>
                    </div>
                </div>
                <button className="text-gray-400 hover:text-white">
                    <MoreHorizontal size={20} />
                </button>
            </div>

            {/* Post Content */}
            <div className="px-4 pb-3">
                <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">{content}</p>
            </div>

            {/* Post Images */}
            {images && images.length > 0 && (
                <div className={`w-full grid gap-1 ${images.length === 1 ? '' : images.length === 2 ? 'grid-cols-2' : images.length === 3 ? 'grid-cols-2' : 'grid-cols-2'}`}>
                    {images.slice(0, 4).map((img, index) => (
                        <div 
                            key={index} 
                            className={`relative ${images.length === 3 && index === 0 ? 'row-span-2' : ''} ${images.length > 4 && index === 3 ? 'relative' : ''}`}
                        >
                            <img 
                                src={img} 
                                alt={`Post image ${index + 1}`} 
                                className={`w-full object-cover ${images.length === 1 ? 'max-h-[500px]' : 'h-48'}`}
                            />
                            {images.length > 4 && index === 3 && (
                                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                    <span className="text-white text-2xl font-bold">+{images.length - 4}</span>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Post Stats */}
            <div className="p-4 border-t border-gray-800 mt-2">
                <div className="flex items-center justify-between mb-4">
                    <span className="text-gray-400 text-sm hover:underline cursor-pointer">{likesCount} lượt thích</span>
                    <button 
                        onClick={() => setShowComments(!showComments)}
                        className="text-gray-400 text-sm hover:underline cursor-pointer"
                    >
                        {commentsCount} bình luận
                    </button>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-gray-800">
                    <button 
                        onClick={handleLike}
                        disabled={isLiking}
                        className={`flex-1 flex items-center justify-center gap-2 py-2 hover:bg-gray-800 rounded-lg transition-colors ${liked ? 'text-red-500' : 'text-gray-400 hover:text-purple-400'}`}
                    >
                        <Heart size={20} fill={liked ? 'currentColor' : 'none'} />
                        <span className="font-medium">Thích</span>
                    </button>
                    <button 
                        onClick={() => setShowComments(!showComments)}
                        className={`flex-1 flex items-center justify-center gap-2 py-2 hover:bg-gray-800 rounded-lg transition-colors ${showComments ? 'text-blue-400' : 'text-gray-400 hover:text-blue-400'}`}
                    >
                        <MessageCircle size={20} />
                        <span className="font-medium">Bình luận</span>
                    </button>
                    <button className="flex-1 flex items-center justify-center gap-2 py-2 text-gray-400 hover:text-green-400 hover:bg-gray-800 rounded-lg transition-colors">
                        <Share2 size={20} />
                        <span className="font-medium">Chia sẻ</span>
                    </button>
                </div>
            </div>

            {/* Comment Section */}
            {showComments && (
                <CommentSection 
                    postId={postId} 
                    currentUserId={currentUserId}
                    onCommentCountChange={handleCommentCountChange}
                />
            )}
        </div>
    );
};

export default PostCard;
