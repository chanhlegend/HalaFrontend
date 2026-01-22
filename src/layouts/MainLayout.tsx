import React, { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import { motion } from 'framer-motion';
import { getCurrentUser } from '../services/authService';

interface MainLayoutProps {
    children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        const currentUser = getCurrentUser();
        if (currentUser) {
            setUser(currentUser);
        }
    }, []);

    return (
        <div className="min-h-screen bg-black text-white flex">
            <motion.div
                initial={{ x: -100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="fixed left-0 top-0 h-full z-10"
            >
                <Sidebar user={user} />
            </motion.div>

            <main className="ml-64 w-full p-8 min-h-screen">
                {children}
            </main>
        </div>
    );
};

export default MainLayout;
