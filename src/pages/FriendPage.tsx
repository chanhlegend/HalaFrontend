import React, { useState, useEffect } from 'react';
import { friendService, Friend, FriendRequest, UserSuggestion } from '../services/friendService';
import { useToast } from '../contexts/ToastContext';
import ConfirmModal from '../components/ConfirmModal';

const FriendPage: React.FC = () => {
    const { showToast } = useToast();
    const [activeTab, setActiveTab] = useState<'friends' | 'requests' | 'search'>('friends');
    const [friends, setFriends] = useState<Friend[]>([]);
    const [requests, setRequests] = useState<FriendRequest[]>([]);
    const [searchResult, setSearchResult] = useState<{ user: UserSuggestion, status: string } | null>(null);
    const [searchEmail, setSearchEmail] = useState('');
    const [searchError, setSearchError] = useState('');
    const [loading, setLoading] = useState(false);

    // Modal State
    const [isUnfriendModalOpen, setIsUnfriendModalOpen] = useState(false);
    const [friendToUnfriend, setFriendToUnfriend] = useState<string | null>(null);

    useEffect(() => {
        fetchAllData();
        setSearchError('');
        setSearchResult(null);
    }, [activeTab]);

    const fetchAllData = async () => {
        setLoading(true);
        try {
            const [friendsData, requestsData] = await Promise.all([
                friendService.getFriends(),
                friendService.getFriendRequests()
            ]);
            setFriends(friendsData);
            setRequests(requestsData);
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchEmail) return;

        setLoading(true);
        setSearchError('');
        setSearchResult(null);

        try {
            const data = await friendService.searchUser(searchEmail);
            setSearchResult(data);
        } catch (error: any) {
            setSearchError(error.response?.data?.message || 'Không tìm thấy người dùng');
        } finally {
            setLoading(false);
        }
    };

    // ... existing handle logic ...

    const handleAccept = async (requestId: string) => {
        try {
            await friendService.acceptFriendRequest(requestId);
            setRequests(requests.filter(req => req._id !== requestId));
            showToast("Đã chấp nhận lời mời kết bạn", "success");
        } catch (error) {
            console.error("Error accepting request:", error);
            showToast("Có lỗi xảy ra", "error");
        }
    };

    const handleReject = async (requestId: string) => {
        try {
            await friendService.rejectFriendRequest(requestId);
            setRequests(requests.filter(req => req._id !== requestId));
            showToast("Đã từ chối lời mời", "info");
        } catch (error) {
            console.error("Error rejecting request:", error);
            showToast("Có lỗi xảy ra", "error");
        }
    };

    const openUnfriendModal = (friendId: string) => {
        setFriendToUnfriend(friendId);
        setIsUnfriendModalOpen(true);
    };

    const confirmUnfriend = async () => {
        if (!friendToUnfriend) return;

        try {
            await friendService.unfriend(friendToUnfriend);
            setFriends(friends.filter(f => f.friend._id !== friendToUnfriend));
            showToast("Đã hủy kết bạn", "success");
            setIsUnfriendModalOpen(false);
        } catch (error) {
            console.error("Error unfriending:", error);
            showToast("Có lỗi xảy ra", "error");
        }
    };


    const handleSendRequest = async (userId: string) => {
        try {
            await friendService.sendFriendRequest(userId);
            if (searchResult && searchResult.user._id === userId) {
                setSearchResult({ ...searchResult, status: 'sent' });
            }
            showToast("Đã gửi lời mời kết bạn!", "success");
        } catch (error) {
            console.error("Error sending request:", error);
            showToast("Gửi lời mời thất bại", "error");
        }
    };

    return (
        <div className="min-h-screen bg-[#0f0f1a] text-white p-8">
            <ConfirmModal
                isOpen={isUnfriendModalOpen}
                onClose={() => setIsUnfriendModalOpen(false)}
                onConfirm={confirmUnfriend}
                title="Hủy kết bạn?"
                message="Bạn có chắc chắn muốn hủy kết bạn với người này không? Hành động này không thể hoàn tác."
                confirmText="Hủy kết bạn"
                cancelText="Quay lại"
                type="danger"
            />

            <div className="max-w-4xl mx-auto">
                {/* Tabs */}
                <div className="flex bg-[#1a1a2e] rounded-full p-1 mb-8">
                    <button
                        onClick={() => setActiveTab('friends')}
                        className={`flex-1 py-3 px-6 rounded-full text-sm font-medium transition-all duration-200 ${activeTab === 'friends' ? 'bg-[#2a2a40] text-white shadow-lg' : 'text-gray-400 hover:text-white'
                            }`}
                    >
                        Bạn bè ({friends.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('requests')}
                        className={`flex-1 py-3 px-6 rounded-full text-sm font-medium transition-all duration-200 ${activeTab === 'requests' ? 'bg-[#2a2a40] text-white shadow-lg' : 'text-gray-400 hover:text-white'
                            }`}
                    >
                        Lời mời ({requests.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('search')}
                        className={`flex-1 py-3 px-6 rounded-full text-sm font-medium transition-all duration-200 ${activeTab === 'search' ? 'bg-[#2a2a40] text-white shadow-lg' : 'text-gray-400 hover:text-white'
                            }`}
                    >
                        Tìm kiếm
                    </button>
                </div>

                {/* Content */}
                <div className="bg-[#151525] rounded-2xl p-6 border border-gray-800/50 min-h-[500px]">
                    <h2 className="text-xl font-semibold mb-6">
                        {activeTab === 'friends' && 'Danh sách bạn bè'}
                        {activeTab === 'requests' && 'Lời mời kết bạn'}
                        {activeTab === 'search' && 'Tìm kiếm bạn bè'}
                    </h2>

                    {loading && <div className="text-center py-10 text-gray-400">Đang tải...</div>}

                    {!loading && (
                        <div className="space-y-4">
                            {/* Friends Tab */}
                            {activeTab === 'friends' && friends.map((item) => (
                                <div key={item._id} className="flex items-center justify-between p-4 bg-[#1e1e2d] rounded-xl border border-gray-800 hover:border-gray-700 transition-all">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-full bg-gray-600 overflow-hidden">
                                            {item.friend.avatar ? (
                                                <img src={item.friend.avatar} alt={item.friend.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-purple-600 text-lg font-bold">
                                                    {item.friend.name.charAt(0).toUpperCase()}
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-white">{item.friend.name}</h3>
                                            <p className="text-sm text-green-400 flex items-center gap-1">
                                                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                                                Đang hoạt động
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => openUnfriendModal(item.friend._id)}
                                        className="px-4 py-2 rounded-lg border border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white transition-colors text-sm flex items-center gap-2"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="8.5" cy="7" r="4" /><line x1="18" x2="23" y1="8" y2="13" /><line x1="23" x2="18" y1="8" y2="13" /></svg>
                                        Hủy kết bạn
                                    </button>
                                </div>
                            ))}

                            {/* Requests Tab */}
                            {activeTab === 'requests' && requests.map((req) => (
                                <div key={req._id} className="flex items-center justify-between p-4 bg-[#1e1e2d] rounded-xl border border-gray-800 hover:border-gray-700 transition-all">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-full bg-gray-600 overflow-hidden">
                                            {req.sender.avatar ? (
                                                <img src={req.sender.avatar} alt={req.sender.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-blue-600 text-lg font-bold">
                                                    {req.sender.name.charAt(0).toUpperCase()}
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-white">{req.sender.name}</h3>
                                            <p className="text-sm text-gray-400">12 bạn chung</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => handleAccept(req._id)}
                                            className="px-6 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-medium transition-colors text-sm flex items-center gap-2"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                                            Chấp nhận
                                        </button>
                                        <button
                                            onClick={() => handleReject(req._id)}
                                            className="px-6 py-2 rounded-lg bg-[#2a2a40] hover:bg-[#32324a] text-white border border-gray-700 transition-colors text-sm flex items-center gap-2"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" x2="6" y1="6" y2="18" /><line x1="6" x2="18" y1="6" y2="18" /></svg>
                                            Từ chối
                                        </button>
                                    </div>
                                </div>
                            ))}

                            {/* Search Tab */}
                            {activeTab === 'search' && (
                                <div className="space-y-6">
                                    <form onSubmit={handleSearch} className="flex gap-3">
                                        <input
                                            type="email"
                                            placeholder="Nhập email bạn bè..."
                                            className="flex-1 bg-[#1e1e2d] border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500"
                                            value={searchEmail}
                                            onChange={(e) => setSearchEmail(e.target.value)}
                                        />
                                        <button
                                            type="submit"
                                            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                                        >
                                            Tìm kiếm
                                        </button>
                                    </form>

                                    {searchError && (
                                        <div className="p-4 bg-red-900/20 border border-red-800 text-red-200 rounded-lg">
                                            {searchError}
                                        </div>
                                    )}

                                    {searchResult && (
                                        <div className="flex items-center justify-between p-4 bg-[#1e1e2d] rounded-xl border border-gray-800">
                                            <div className="flex items-center gap-4">
                                                <div className="w-14 h-14 rounded-full bg-gray-600 overflow-hidden">
                                                    {searchResult.user.avatar ? (
                                                        <img src={searchResult.user.avatar} alt={searchResult.user.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center bg-indigo-600 text-xl font-bold">
                                                            {searchResult.user.name.charAt(0).toUpperCase()}
                                                        </div>
                                                    )}
                                                </div>
                                                <div>
                                                    <h3 className="font-semibold text-lg text-white">{searchResult.user.name}</h3>
                                                    <p className="text-gray-400">{searchResult.user.email}</p>
                                                </div>
                                            </div>

                                            {searchResult.status === 'friend' && (
                                                <span className="px-4 py-2 bg-green-900/30 text-green-400 rounded-lg border border-green-900/50">
                                                    Đã là bạn bè
                                                </span>
                                            )}

                                            {searchResult.status === 'sent' && (
                                                <span className="px-4 py-2 bg-yellow-900/30 text-yellow-400 rounded-lg border border-yellow-900/50">
                                                    Đã gửi lời mời
                                                </span>
                                            )}

                                            {searchResult.status === 'received' && (
                                                <span className="px-4 py-2 bg-blue-900/30 text-blue-400 rounded-lg border border-blue-900/50">
                                                    Đã nhận được lời mời
                                                </span>
                                            )}

                                            {searchResult.status === 'none' && (
                                                <button
                                                    onClick={() => handleSendRequest(searchResult.user._id)}
                                                    className="px-6 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors"
                                                >
                                                    Kết bạn
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}

                            {!loading && activeTab === 'friends' && friends.length === 0 && (
                                <p className="text-center text-gray-500 py-8">Chưa có bạn bè nào.</p>
                            )}
                            {!loading && activeTab === 'requests' && requests.length === 0 && (
                                <p className="text-center text-gray-500 py-8">Không có lời mời kết bạn nào.</p>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FriendPage;
