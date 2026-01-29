import React, { useEffect, useState, useCallback } from 'react';
import CreatePost from '../components/CreatePost';
import PostCard from '../components/PostCard';
import { getCurrentUser } from '../services/authService';
import { getPosts, IPost } from '../services/postService';
import { Loader2 } from 'lucide-react';

import { motion } from 'framer-motion';

const HomePage: React.FC = () => {
    const [user, setUser] = useState<any>(null);
    const [posts, setPosts] = useState<IPost[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);

    const fetchPosts = useCallback(async (pageNum: number, append: boolean = false) => {
        try {
            if (pageNum === 1) {
                setIsLoading(true);
            } else {
                setIsLoadingMore(true);
            }
            
            const response = await getPosts(pageNum, 10);
            
            if (append) {
                setPosts(prev => [...prev, ...response.posts]);
            } else {
                setPosts(response.posts);
            }
            
            setHasMore(pageNum < response.pagination.totalPages);
        } catch (error) {
            console.error('Error fetching posts:', error);
        } finally {
            setIsLoading(false);
            setIsLoadingMore(false);
        }
    }, []);

    useEffect(() => {
        const currentUser = getCurrentUser();
        if (currentUser) {
            setUser(currentUser);
        }
        fetchPosts(1);
    }, [fetchPosts]);

    const handlePostCreated = () => {
        // Refresh posts when a new post is created
        setPage(1);
        fetchPosts(1);
    };

    const loadMore = () => {
        if (!isLoadingMore && hasMore) {
            const nextPage = page + 1;
            setPage(nextPage);
            fetchPosts(nextPage, true);
        }
    };

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

    return (
        <motion.div
            className="max-w-2xl mx-auto pt-4 p-8"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            <motion.div variants={itemVariants}>
                <CreatePost user={user} onPostCreated={handlePostCreated} />
            </motion.div>

            {isLoading ? (
                <div className="flex justify-center items-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
                </div>
            ) : posts.length === 0 ? (
                <motion.div variants={itemVariants} className="text-center py-12">
                    <p className="text-gray-400">Chưa có bài viết nào. Hãy là người đầu tiên đăng bài!</p>
                </motion.div>
            ) : (
                <>
                    {posts.map((post) => (
                        <motion.div key={post._id} variants={itemVariants}>
                            <PostCard
                                postId={post._id}
                                user={post.author}
                                time={post.createdAt}
                                content={post.content}
                                images={post.images}
                                likes={post.likesCount}
                                comments={post.commentsCount}
                                isLiked={user ? post.likes.includes(user.id || user._id) : false}
                                currentUserId={user?.id || user?._id}
                            />
                        </motion.div>
                    ))}
                    
                    {hasMore && (
                        <motion.div variants={itemVariants} className="flex justify-center py-4">
                            <button
                                onClick={loadMore}
                                disabled={isLoadingMore}
                                className="px-6 py-2 bg-purple-600 text-white rounded-full hover:bg-purple-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                            >
                                {isLoadingMore ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Đang tải...
                                    </>
                                ) : (
                                    'Xem thêm'
                                )}
                            </button>
                        </motion.div>
                    )}
                </>
            )}
        </motion.div>
    );
};

export default HomePage;
