import React from 'react';
import { Phone, PhoneOff } from 'lucide-react';

interface CallingScreenProps {
    remoteName: string;
    remoteAvatar?: string;
    onCancel: () => void;
}

const CallingScreen: React.FC<CallingScreenProps> = ({
    remoteName,
    remoteAvatar,
    onCancel,
}) => {
    return (
        <div className="fixed inset-0 z-50 bg-gradient-to-b from-gray-900 to-black flex flex-col items-center justify-center">
            {/* Animated rings */}
            <div className="relative mb-8">
                <div className="absolute inset-0 w-32 h-32 rounded-full bg-green-500/20 animate-ping"></div>
                <div className="absolute inset-0 w-32 h-32 rounded-full bg-green-500/10 animate-ping" style={{ animationDelay: '0.5s' }}></div>
                
                {/* Avatar */}
                <div className="relative w-32 h-32 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 flex items-center justify-center text-white text-4xl font-bold overflow-hidden">
                    {remoteAvatar ? (
                        <img src={remoteAvatar} alt={remoteName} className="w-full h-full object-cover" />
                    ) : (
                        <span>{remoteName?.[0]?.toUpperCase() || '?'}</span>
                    )}
                </div>
            </div>

            {/* Caller info */}
            <h2 className="text-white text-2xl font-semibold mb-2">{remoteName}</h2>
            <p className="text-gray-400 mb-8 flex items-center gap-2">
                <Phone className="w-4 h-4 animate-pulse" />
                Đang gọi...
            </p>

            {/* Cancel button */}
            <button
                onClick={onCancel}
                className="w-16 h-16 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center text-white transition-all transform hover:scale-110"
            >
                <PhoneOff size={28} />
            </button>
            <p className="text-gray-400 text-sm mt-3">Hủy cuộc gọi</p>
        </div>
    );
};

export default CallingScreen;
