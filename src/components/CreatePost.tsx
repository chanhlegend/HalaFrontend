import React from 'react';
import { Image, Video, Smile } from 'lucide-react';

interface CreatePostProps {
    user: {
        name: string;
        avatar?: string;
    } | null;
}

const CreatePost: React.FC<CreatePostProps> = ({ user }) => {
    return (
        <div className="bg-[#1a1a1a] rounded-2xl p-4 border border-gray-800 mb-6">
            <div className="flex gap-4 mb-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 flex-shrink-0 flex items-center justify-center text-white font-bold overflow-hidden">
                    {user?.avatar ? (
                        <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                    ) : (
                        <span>{user?.name?.[0]?.toUpperCase() || 'U'}</span>
                    )}
                </div>
                <div className="flex-1 bg-gray-900 rounded-full flex items-center px-4 border border-gray-800 focus-within:border-purple-500 transition-colors">
                    <input
                        type="text"
                        placeholder="Bạn đang nghĩ gì?"
                        className="bg-transparent w-full text-white placeholder-gray-500 focus:outline-none py-2"
                    />
                </div>
            </div>

            <div className="flex items-center justify-between border-t border-gray-800 pt-3">
                <div className="flex gap-2">
                    <button className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-green-400 transition-colors">
                        <Image size={20} className="text-green-500" />
                        <span className="text-sm font-medium">Ảnh</span>
                    </button>
                    <button className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-red-400 transition-colors">
                        <Video size={20} className="text-red-500" />
                        <span className="text-sm font-medium">Video</span>
                    </button>
                    <button className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-yellow-400 transition-colors">
                        <Smile size={20} className="text-yellow-500" />
                        <span className="text-sm font-medium">Cảm xúc</span>
                    </button>
                </div>

                {/* <button className="p-2 rounded-full bg-purple-600 text-white hover:bg-purple-700 transition-colors">
            <Send size={18} />
        </button> */}
            </div>
        </div>
    );
};

export default CreatePost;
