import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Send, ArrowLeft, Search, MessageCircle, Video } from 'lucide-react';
import { useSocket } from '../contexts/SocketContext';
import {
    getConversations,
    getMessages,
    sendMessage as sendMessageApi,
    getOrCreateConversation,
    markAsRead,
    Conversation,
    Message
} from '../services/messageService';
import { initiateCall } from '../services/callService';

const MessagePage: React.FC = () => {
    const [searchParams] = useSearchParams();
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [sendingMessage, setSendingMessage] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const { socket, resetUnreadMessages } = useSocket();

    // Get current user ID from localStorage
    const userStr = localStorage.getItem('user');
    const currentUser = userStr ? JSON.parse(userStr) : null;
    const currentUserId = currentUser?.id || currentUser?._id;

    // Reset unread message count when entering the page
    useEffect(() => {
        resetUnreadMessages();
    }, [resetUnreadMessages]);

    // Scroll to bottom of messages
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    // Load conversations
    useEffect(() => {
        const loadConversations = async () => {
            try {
                const data = await getConversations();
                setConversations(data);
            } catch (error) {
                console.error('Error loading conversations:', error);
            } finally {
                setLoading(false);
            }
        };
        loadConversations();
    }, []);

    // Handle URL params for direct message
    useEffect(() => {
        const userId = searchParams.get('userId');
        if (userId) {
            const openConversation = async () => {
                try {
                    const conversation = await getOrCreateConversation(userId);
                    setSelectedConversation(conversation);
                    // Add to conversations list if not exists
                    setConversations(prev => {
                        const exists = prev.find(c => c._id === conversation._id);
                        if (!exists) {
                            return [conversation, ...prev];
                        }
                        return prev;
                    });
                } catch (error) {
                    console.error('Error opening conversation:', error);
                }
            };
            openConversation();
        }
    }, [searchParams]);

    // Load messages when conversation selected
    useEffect(() => {
        const loadMessages = async () => {
            if (!selectedConversation) return;

            try {
                const data = await getMessages(selectedConversation._id);
                setMessages(data);
                await markAsRead(selectedConversation._id);
                
                // Reset unread count for this conversation locally
                setConversations(prev => prev.map(conv => {
                    if (conv._id === selectedConversation._id) {
                        return { ...conv, unreadCount: 0 };
                    }
                    return conv;
                }));
            } catch (error) {
                console.error('Error loading messages:', error);
            }
        };
        loadMessages();
    }, [selectedConversation]);

    // Scroll to bottom when messages change
    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Socket listener for new messages
    useEffect(() => {
        if (!socket) return;

        const handleNewMessage = (data: { message: Message; conversationId: string }) => {
            const { message, conversationId } = data;

            // Update messages if in current conversation
            if (selectedConversation?._id === conversationId) {
                setMessages(prev => [...prev, message]);
                markAsRead(conversationId);
            }

            // Update conversation list
            setConversations(prev => {
                const updated = prev.map(conv => {
                    if (conv._id === conversationId) {
                        // If not in current conversation, increment unread count
                        const isCurrentConversation = selectedConversation?._id === conversationId;
                        return {
                            ...conv,
                            lastMessage: message.content,
                            lastMessageTime: message.createdAt,
                            unreadCount: isCurrentConversation ? 0 : (conv.unreadCount || 0) + 1,
                        };
                    }
                    return conv;
                });
                // Sort by last message time
                return updated.sort((a, b) => {
                    const timeA = a.lastMessageTime ? new Date(a.lastMessageTime).getTime() : 0;
                    const timeB = b.lastMessageTime ? new Date(b.lastMessageTime).getTime() : 0;
                    return timeB - timeA;
                });
            });
        };

        socket.on('new_message', handleNewMessage);

        return () => {
            socket.off('new_message', handleNewMessage);
        };
    }, [socket, selectedConversation]);

    // Send message
    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedConversation || sendingMessage) return;

        setSendingMessage(true);
        try {
            const message = await sendMessageApi(selectedConversation._id, newMessage.trim());
            setMessages(prev => [...prev, message]);
            setNewMessage('');

            // Update conversation list
            setConversations(prev => {
                const updated = prev.map(conv => {
                    if (conv._id === selectedConversation._id) {
                        return {
                            ...conv,
                            lastMessage: message.content,
                            lastMessageTime: message.createdAt,
                        };
                    }
                    return conv;
                });
                return updated.sort((a, b) => {
                    const timeA = a.lastMessageTime ? new Date(a.lastMessageTime).getTime() : 0;
                    const timeB = b.lastMessageTime ? new Date(b.lastMessageTime).getTime() : 0;
                    return timeB - timeA;
                });
            });
        } catch (error) {
            console.error('Error sending message:', error);
        } finally {
            setSendingMessage(false);
        }
    };

    // Filter conversations by search
    const filteredConversations = conversations.filter(conv =>
        conv.participant?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Format time
    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));

        if (days === 0) {
            return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
        } else if (days === 1) {
            return 'Hôm qua';
        } else if (days < 7) {
            return date.toLocaleDateString('vi-VN', { weekday: 'short' });
        } else {
            return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-[#1a1a1a] overflow-hidden -m-4">
            {/* Conversation List */}
            <div className={`w-full md:w-80 border-r border-gray-800 flex flex-col ${selectedConversation ? 'hidden md:flex' : 'flex'}`}>
                {/* Header */}
                <div className="p-4 border-b border-gray-800">
                    <h2 className="text-xl font-bold text-white mb-4">Tin nhắn</h2>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Tìm kiếm cuộc trò chuyện..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-gray-800 text-white pl-10 pr-4 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                    </div>
                </div>

                {/* Conversation List */}
                <div className="flex-1 overflow-y-auto">
                    {filteredConversations.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-gray-400 p-4">
                            <MessageCircle size={48} className="mb-4 opacity-50" />
                            <p className="text-center">Chưa có cuộc trò chuyện nào</p>
                            <p className="text-sm text-center mt-2">Bắt đầu nhắn tin với bạn bè của bạn!</p>
                        </div>
                    ) : (
                        filteredConversations.map(conv => {
                            const hasUnread = (conv.unreadCount ?? 0) > 0;
                            return (
                                <div
                                    key={conv._id}
                                    onClick={() => setSelectedConversation(conv)}
                                    className={`flex items-center gap-3 p-4 cursor-pointer hover:bg-gray-800 transition-colors ${selectedConversation?._id === conv._id ? 'bg-gray-800' : ''} ${hasUnread ? 'bg-purple-500/5' : ''}`}
                                >
                                    {/* Avatar with online indicator potential */}
                                    <div className="relative flex-shrink-0">
                                        <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold overflow-hidden">
                                            {conv.participant?.avatar ? (
                                                <img src={conv.participant.avatar} alt={conv.participant.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <span>{conv.participant?.name?.[0]?.toUpperCase() || '?'}</span>
                                            )}
                                        </div>
                                        {/* Unread indicator dot */}
                                        {hasUnread && (
                                            <div className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-purple-500 rounded-full flex items-center justify-center">
                                                <span className="text-[10px] text-white font-bold">
                                                    {conv.unreadCount! > 9 ? '9+' : conv.unreadCount}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between">
                                            <h3 className={`font-medium truncate ${hasUnread ? 'text-white font-semibold' : 'text-white'}`}>
                                                {conv.participant?.name}
                                            </h3>
                                            {conv.lastMessageTime && (
                                                <span className={`text-xs flex-shrink-0 ${hasUnread ? 'text-purple-400 font-medium' : 'text-gray-400'}`}>
                                                    {formatTime(conv.lastMessageTime)}
                                                </span>
                                            )}
                                        </div>
                                        {conv.lastMessage && (
                                            <p className={`text-sm truncate ${hasUnread ? 'text-gray-200 font-medium' : 'text-gray-400'}`}>
                                                {conv.lastMessage}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            {/* Chat Area */}
            <div className={`flex-1 flex flex-col ${!selectedConversation ? 'hidden md:flex' : 'flex'}`}>
                {selectedConversation ? (
                    <>
                        {/* Chat Header */}
                        <div className="flex items-center gap-3 p-4 border-b border-gray-800">
                            <button
                                onClick={() => setSelectedConversation(null)}
                                className="md:hidden text-gray-400 hover:text-white"
                            >
                                <ArrowLeft size={24} />
                            </button>
                            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold overflow-hidden">
                                {selectedConversation.participant?.avatar ? (
                                    <img
                                        src={selectedConversation.participant.avatar}
                                        alt={selectedConversation.participant.name}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <span>{selectedConversation.participant?.name?.[0]?.toUpperCase()}</span>
                                )}
                            </div>
                            <div>
                                <h3 className="font-medium text-white">{selectedConversation.participant?.name}</h3>
                                <p className="text-xs text-gray-400">{selectedConversation.participant?.email}</p>
                            </div>
                            {/* Video Call Button */}
                            <button
                                onClick={async () => {
                                    try {
                                        const result = await initiateCall(
                                            selectedConversation.participant._id,
                                            currentUser?.name || 'User',
                                            currentUser?.avatar
                                        );
                                        // Dispatch custom event to GlobalCallHandler
                                        const callEvent = new CustomEvent('initiate-call', {
                                            detail: {
                                                appId: result.appId,
                                                channelName: result.channelName,
                                                token: result.token,
                                                remoteUserName: selectedConversation.participant?.name,
                                                remoteUserAvatar: selectedConversation.participant?.avatar,
                                                callerId: selectedConversation.participant._id,
                                            }
                                        });
                                        window.dispatchEvent(callEvent);
                                    } catch (error) {
                                        console.error('Error initiating call:', error);
                                    }
                                }}
                                className="ml-auto p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-full transition-colors"
                                title="Gọi video"
                            >
                                <Video size={22} />
                            </button>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {messages.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full text-gray-400">
                                    <p>Bắt đầu cuộc trò chuyện!</p>
                                </div>
                            ) : (
                                messages.map((message) => {
                                    const isOwn = message.sender._id === currentUserId;
                                    return (
                                        <div
                                            key={message._id}
                                            className={`flex items-end gap-2 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}
                                        >
                                            {/* Avatar */}
                                            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 flex items-center justify-center text-white text-sm font-bold overflow-hidden flex-shrink-0">
                                                {isOwn ? (
                                                    currentUser?.avatar ? (
                                                        <img 
                                                            src={currentUser.avatar} 
                                                            alt="Tôi" 
                                                            className="w-full h-full object-cover" 
                                                        />
                                                    ) : (
                                                        <span>{currentUser?.name?.[0]?.toUpperCase() || 'T'}</span>
                                                    )
                                                ) : (
                                                    message.sender.avatar ? (
                                                        <img 
                                                            src={message.sender.avatar} 
                                                            alt={message.sender.name} 
                                                            className="w-full h-full object-cover" 
                                                        />
                                                    ) : (
                                                        <span>{message.sender.name?.[0]?.toUpperCase()}</span>
                                                    )
                                                )}
                                            </div>
                                            
                                            {/* Message Bubble */}
                                            <div className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}>
                                                {/* Sender name (only for other's messages) */}
                                                {!isOwn && (
                                                    <span className="text-xs text-gray-400 mb-1 ml-1">
                                                        {message.sender.name}
                                                    </span>
                                                )}
                                                <div
                                                    className={`max-w-[280px] sm:max-w-[400px] px-4 py-2 rounded-2xl ${isOwn
                                                            ? 'bg-purple-600 text-white rounded-br-md'
                                                            : 'bg-gray-800 text-white rounded-bl-md'
                                                        }`}
                                                >
                                                    <p className="break-words">{message.content}</p>
                                                    <p className={`text-xs mt-1 ${isOwn ? 'text-purple-200' : 'text-gray-400'}`}>
                                                        {formatTime(message.createdAt)}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Message Input */}
                        <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-800">
                            <div className="flex items-center gap-3">
                                <input
                                    type="text"
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    placeholder="Nhập tin nhắn..."
                                    className="flex-1 bg-gray-800 text-white px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                                />
                                <button
                                    type="submit"
                                    disabled={!newMessage.trim() || sendingMessage}
                                    className="bg-purple-600 text-white p-3 rounded-xl hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <Send size={20} />
                                </button>
                            </div>
                        </form>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
                        <MessageCircle size={64} className="mb-4 opacity-50" />
                        <p className="text-xl">Chọn một cuộc trò chuyện</p>
                        <p className="text-sm mt-2">Chọn từ danh sách bên trái để bắt đầu nhắn tin</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MessagePage;
