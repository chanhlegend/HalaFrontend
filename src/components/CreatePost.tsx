import React, { useState, useRef } from 'react';
import { Image, Video, Smile, X, Send, Loader2 } from 'lucide-react';
import { createPost } from '../services/postService';

interface CreatePostProps {
    user: {
        name: string;
        avatar?: string;
    } | null;
    onPostCreated?: () => void;
}

const CreatePost: React.FC<CreatePostProps> = ({ user, onPostCreated }) => {
    const [content, setContent] = useState('');
    const [selectedImages, setSelectedImages] = useState<File[]>([]);
    const [previewUrls, setPreviewUrls] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files) return;

        const newFiles = Array.from(files);
        
        // Limit to 10 images total
        if (selectedImages.length + newFiles.length > 10) {
            setError('Chỉ được chọn tối đa 10 ảnh');
            return;
        }

        // Validate file sizes (5MB each)
        const oversizedFiles = newFiles.filter(file => file.size > 5 * 1024 * 1024);
        if (oversizedFiles.length > 0) {
            setError('Mỗi ảnh không được quá 5MB');
            return;
        }

        setError(null);
        setSelectedImages(prev => [...prev, ...newFiles]);

        // Create preview URLs
        newFiles.forEach(file => {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewUrls(prev => [...prev, reader.result as string]);
            };
            reader.readAsDataURL(file);
        });
    };

    const removeImage = (index: number) => {
        setSelectedImages(prev => prev.filter((_, i) => i !== index));
        setPreviewUrls(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async () => {
        if (!content.trim() && selectedImages.length === 0) {
            setError('Vui lòng nhập nội dung hoặc chọn ảnh');
            return;
        }

        if (content.length > 5000) {
            setError('Nội dung không được quá 5000 ký tự');
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            await createPost({
                content: content.trim(),
                images: selectedImages.length > 0 ? selectedImages : undefined,
            });

            // Reset form
            setContent('');
            setSelectedImages([]);
            setPreviewUrls([]);
            
            // Notify parent component
            if (onPostCreated) {
                onPostCreated();
            }
        } catch (err: any) {
            console.error('Error creating post:', err);
            setError(err.response?.data?.message || 'Có lỗi xảy ra khi đăng bài');
        } finally {
            setIsLoading(false);
        }
    };

    const handleImageButtonClick = () => {
        fileInputRef.current?.click();
    };

    const canPost = content.trim().length > 0 || selectedImages.length > 0;

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
                <div className="flex-1">
                    <textarea
                        placeholder="Bạn đang nghĩ gì?"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        className="bg-gray-900 w-full text-white placeholder-gray-500 focus:outline-none p-3 rounded-xl border border-gray-800 focus:border-purple-500 transition-colors resize-none min-h-[60px]"
                        rows={2}
                        disabled={isLoading}
                    />
                </div>
            </div>

            {/* Image Previews */}
            {previewUrls.length > 0 && (
                <div className="mb-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                    {previewUrls.map((url, index) => (
                        <div key={index} className="relative group">
                            <img
                                src={url}
                                alt={`Preview ${index + 1}`}
                                className="w-full h-24 object-cover rounded-lg"
                            />
                            <button
                                onClick={() => removeImage(index)}
                                className="absolute top-1 right-1 p-1 bg-black/70 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500"
                                disabled={isLoading}
                            >
                                <X size={14} className="text-white" />
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Error Message */}
            {error && (
                <div className="mb-3 text-red-400 text-sm bg-red-500/10 px-3 py-2 rounded-lg">
                    {error}
                </div>
            )}

            {/* Hidden File Input */}
            <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                multiple
                onChange={handleImageSelect}
                className="hidden"
                disabled={isLoading}
            />

            <div className="flex items-center justify-between border-t border-gray-800 pt-3">
                <div className="flex gap-1 sm:gap-2">
                    <button 
                        onClick={handleImageButtonClick}
                        className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-2 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-green-400 transition-colors disabled:opacity-50"
                        disabled={isLoading || selectedImages.length >= 10}
                    >
                        <Image size={20} className="text-green-500" />
                        <span className="text-sm font-medium hidden sm:inline">Ảnh</span>
                        {selectedImages.length > 0 && (
                            <span className="text-xs bg-green-500/20 text-green-400 px-1.5 py-0.5 rounded">
                                {selectedImages.length}
                            </span>
                        )}
                    </button>
                    <button className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-2 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-red-400 transition-colors opacity-50 cursor-not-allowed">
                        <Video size={20} className="text-red-500" />
                        <span className="text-sm font-medium hidden sm:inline">Video</span>
                    </button>
                    <button className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-2 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-yellow-400 transition-colors opacity-50 cursor-not-allowed">
                        <Smile size={20} className="text-yellow-500" />
                        <span className="text-sm font-medium hidden sm:inline">Cảm xúc</span>
                    </button>
                </div>

                <button 
                    onClick={handleSubmit}
                    disabled={!canPost || isLoading}
                    className="flex items-center gap-2 px-4 py-2 rounded-full bg-purple-600 text-white hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isLoading ? (
                        <>
                            <Loader2 size={18} className="animate-spin" />
                            <span className="text-sm font-medium">Đang đăng...</span>
                        </>
                    ) : (
                        <>
                            <Send size={18} />
                            <span className="text-sm font-medium">Đăng</span>
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};

export default CreatePost;
