import React, { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';

interface EditProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: ProfileUpdateData) => Promise<void>;
    currentData: {
        name: string;
        bio?: string;
        workplace?: string;
        location?: string;
        dateOfBirth?: string;
        phone?: string;
    };
}

export interface ProfileUpdateData {
    name: string;
    bio?: string;
    workplace?: string;
    location?: string;
    dateOfBirth?: string;
    phone?: string;
}

const EditProfileModal: React.FC<EditProfileModalProps> = ({
    isOpen,
    onClose,
    onSave,
    currentData,
}) => {
    const [formData, setFormData] = useState<ProfileUpdateData>({
        name: '',
        bio: '',
        workplace: '',
        location: '',
        dateOfBirth: '',
        phone: '',
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string>('');

    useEffect(() => {
        if (isOpen) {
            setFormData({
                name: currentData.name || '',
                bio: currentData.bio || '',
                workplace: currentData.workplace || '',
                location: currentData.location || '',
                dateOfBirth: currentData.dateOfBirth || '',
                phone: currentData.phone || '',
            });
            setError('');
        }
    }, [isOpen, currentData]);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!formData.name.trim()) {
            setError('Tên không được để trống');
            return;
        }

        setIsLoading(true);
        try {
            await onSave(formData);
            onClose();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Có lỗi xảy ra. Vui lòng thử lại.');
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <div className="bg-[#1a1a1a] rounded-2xl border border-gray-800 w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-800">
                    <h2 className="text-xl font-bold text-white">Chỉnh sửa trang cá nhân</h2>
                    <button
                        onClick={onClose}
                        disabled={isLoading}
                        className="text-gray-400 hover:text-white transition-colors disabled:opacity-50"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6">
                    {error && (
                        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm">
                            {error}
                        </div>
                    )}

                    <div className="space-y-4">
                        {/* Name */}
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
                                Tên <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-2.5 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
                                placeholder="Nhập tên của bạn"
                            />
                        </div>

                        {/* Bio */}
                        <div>
                            <label htmlFor="bio" className="block text-sm font-medium text-gray-300 mb-2">
                                Tiểu sử
                            </label>
                            <textarea
                                id="bio"
                                name="bio"
                                value={formData.bio}
                                onChange={handleChange}
                                rows={3}
                                maxLength={500}
                                className="w-full px-4 py-2.5 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors resize-none"
                                placeholder="Giới thiệu về bản thân..."
                            />
                            <div className="text-xs text-gray-500 mt-1 text-right">
                                {formData.bio?.length || 0}/500
                            </div>
                        </div>

                        {/* Workplace */}
                        <div>
                            <label htmlFor="workplace" className="block text-sm font-medium text-gray-300 mb-2">
                                Nơi làm việc
                            </label>
                            <input
                                type="text"
                                id="workplace"
                                name="workplace"
                                value={formData.workplace}
                                onChange={handleChange}
                                maxLength={100}
                                className="w-full px-4 py-2.5 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
                                placeholder="Công ty ABC"
                            />
                        </div>

                        {/* Location */}
                        <div>
                            <label htmlFor="location" className="block text-sm font-medium text-gray-300 mb-2">
                                Địa điểm
                            </label>
                            <input
                                type="text"
                                id="location"
                                name="location"
                                value={formData.location}
                                onChange={handleChange}
                                maxLength={100}
                                className="w-full px-4 py-2.5 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
                                placeholder="Thành phố Hồ Chí Minh"
                            />
                        </div>

                        {/* Date of Birth */}
                        <div>
                            <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-300 mb-2">
                                Ngày sinh
                            </label>
                            <input
                                type="date"
                                id="dateOfBirth"
                                name="dateOfBirth"
                                value={formData.dateOfBirth}
                                onChange={handleChange}
                                className="w-full px-4 py-2.5 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
                            />
                        </div>

                        {/* Phone */}
                        <div>
                            <label htmlFor="phone" className="block text-sm font-medium text-gray-300 mb-2">
                                Số điện thoại
                            </label>
                            <input
                                type="tel"
                                id="phone"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                className="w-full px-4 py-2.5 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
                                placeholder="0123456789"
                            />
                        </div>
                    </div>
                </form>

                {/* Footer */}
                <div className="flex gap-3 p-6 border-t border-gray-800">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isLoading}
                        className="flex-1 px-4 py-2.5 bg-gray-800 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                    >
                        Hủy
                    </button>
                    <button
                        type="submit"
                        onClick={handleSubmit}
                        disabled={isLoading}
                        className="flex-1 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 size={18} className="animate-spin" />
                                <span>Đang lưu...</span>
                            </>
                        ) : (
                            <span>Lưu thay đổi</span>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EditProfileModal;
