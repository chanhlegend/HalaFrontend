import React, { useEffect, useState } from 'react';
import CreatePost from '../components/CreatePost';
import PostCard from '../components/PostCard';
import { getCurrentUser } from '../services/authService';

import { motion } from 'framer-motion';

const HomePage: React.FC = () => {
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        const currentUser = getCurrentUser();
        if (currentUser) {
            setUser(currentUser);
        }
    }, []);

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
            className="max-w-2xl mx-auto pt-4"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            <motion.div variants={itemVariants}>
                <CreatePost user={user} />
            </motion.div>

            <motion.div variants={itemVariants}>
                <PostCard
                    user={{ name: 'Trần Thị Mai', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60' }}
                    time="2 giờ trước"
                    content="Ngày hôm nay thật tuyệt vời! Cảm ơn tất cả mọi người đã ủng hộ 🎉"
                    image="https://images.unsplash.com/photo-1517694712202-14dd9538aa97?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80"
                    likes={124}
                    comments={2}
                />
            </motion.div>

            <motion.div variants={itemVariants}>
                <PostCard
                    user={{ name: 'Nguyễn Văn Nam' }}
                    time="5 giờ trước"
                    content="Vừa hoàn thành project mới, cảm giác thật tuyệt! 🚀 #coding #life"
                    likes={86}
                    comments={15}
                />
            </motion.div>

            <motion.div variants={itemVariants}>
                <PostCard
                    user={{ name: 'Lê Thu Hà', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60' }}
                    time="1 ngày trước"
                    content="Hoàng hôn hôm nay đẹp quá! 🌅"
                    image="https://images.unsplash.com/photo-1472214103451-9374bd1c798e?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80"
                    likes={256}
                    comments={42}
                />
            </motion.div>
        </motion.div>
    );
};

export default HomePage;
