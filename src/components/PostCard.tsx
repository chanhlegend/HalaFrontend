import React from 'react';
import { MoreHorizontal, Heart, MessageCircle, Share2 } from 'lucide-react';

interface PostProps {
    user: {
        name: string;
        avatar?: string;
    };
    time: string;
    content: string;
    image?: string;
    likes: number;
    comments: number;
}

const PostCard: React.FC<PostProps> = ({ user, time, content, image, likes, comments }) => {
    return (
        <div className="bg-[#1a1a1a] rounded-2xl border border-gray-800 overflow-hidden mb-6">
            {/* Post Header */}
            <div className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold overflow-hidden">
                        {user.avatar ? (
                            <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                        ) : (
                            <span>{user.name[0].toUpperCase()}</span>
                        )}
                    </div>
                    <div>
                        <h3 className="text-white font-medium">{user.name}</h3>
                        <span className="text-gray-500 text-xs">{time}</span>
                    </div>
                </div>
                <button className="text-gray-400 hover:text-white">
                    <MoreHorizontal size={20} />
                </button>
            </div>

            {/* Post Content */}
            <div className="px-4 pb-3">
                <p className="text-gray-300 leading-relaxed">{content}</p>
            </div>

            {/* Post Image */}
            {image && (
                <div className="w-full">
                    <img src={image} alt="Post content" className="w-full h-auto object-cover" />
                </div>
            )}

            {/* Post Stats */}
            <div className="p-4 border-t border-gray-800 mt-2">
                <div className="flex items-center justify-between mb-4">
                    <span className="text-gray-400 text-sm hover:underline cursor-pointer">{likes} lượt thích</span>
                    <span className="text-gray-400 text-sm hover:underline cursor-pointer">{comments} bình luận</span>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-gray-800">
                    <button className="flex-1 flex items-center justify-center gap-2 py-2 text-gray-400 hover:text-purple-400 hover:bg-gray-800 rounded-lg transition-colors">
                        <Heart size={20} />
                        <span className="font-medium">Thích</span>
                    </button>
                    <button className="flex-1 flex items-center justify-center gap-2 py-2 text-gray-400 hover:text-blue-400 hover:bg-gray-800 rounded-lg transition-colors">
                        <MessageCircle size={20} />
                        <span className="font-medium">Bình luận</span>
                    </button>
                    <button className="flex-1 flex items-center justify-center gap-2 py-2 text-gray-400 hover:text-green-400 hover:bg-gray-800 rounded-lg transition-colors">
                        <Share2 size={20} />
                        <span className="font-medium">Chia sẻ</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PostCard;
