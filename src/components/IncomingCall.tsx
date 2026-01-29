import React, { useEffect, useRef } from 'react';
import { Phone, PhoneOff, Video } from 'lucide-react';

interface IncomingCallProps {
    callerName: string;
    callerAvatar?: string;
    callType: 'video' | 'audio';
    onAccept: () => void;
    onReject: () => void;
}

const IncomingCall: React.FC<IncomingCallProps> = ({
    callerName,
    callerAvatar,
    callType,
    onAccept,
    onReject,
}) => {
    const audioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        // Create and play ringtone
        const audio = new Audio('/ringtone.mp3');
        audio.loop = true;
        audio.volume = 0.7;
        audioRef.current = audio;

        // Try to play (may be blocked by browser autoplay policy)
        audio.play().catch(err => {
            console.log('Autoplay blocked:', err);
        });

        return () => {
            // Stop ringtone when component unmounts
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current = null;
            }
        };
    }, []);

    const handleAccept = () => {
        if (audioRef.current) {
            audioRef.current.pause();
        }
        onAccept();
    };

    const handleReject = () => {
        if (audioRef.current) {
            audioRef.current.pause();
        }
        onReject();
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="bg-[#1a1a1a] rounded-3xl p-8 max-w-sm w-full mx-4 shadow-2xl border border-gray-800">
                {/* Caller Info */}
                <div className="flex flex-col items-center mb-8">
                    {/* Animated Avatar */}
                    <div className="relative mb-6">
                        <div className="w-28 h-28 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 flex items-center justify-center text-white text-4xl font-bold overflow-hidden animate-pulse">
                            {callerAvatar ? (
                                <img src={callerAvatar} alt={callerName} className="w-full h-full object-cover" />
                            ) : (
                                <span>{callerName?.[0]?.toUpperCase() || '?'}</span>
                            )}
                        </div>
                        {/* Ripple effect */}
                        <div className="absolute inset-0 rounded-full border-4 border-purple-500 animate-ping opacity-30"></div>
                        <div className="absolute inset-0 rounded-full border-4 border-purple-500 animate-ping opacity-20 animation-delay-200"></div>
                    </div>

                    <h2 className="text-white text-2xl font-bold mb-2">{callerName}</h2>
                    <p className="text-gray-400 flex items-center gap-2">
                        {callType === 'video' ? (
                            <>
                                <Video size={18} />
                                <span>Cuộc gọi video đến...</span>
                            </>
                        ) : (
                            <>
                                <Phone size={18} />
                                <span>Cuộc gọi đến...</span>
                            </>
                        )}
                    </p>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-center gap-8">
                    {/* Reject Button */}
                    <button
                        type="button"
                        onClick={handleReject}
                        className="flex flex-col items-center gap-2 group"
                    >
                        <div className="w-16 h-16 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center transition-all group-hover:scale-110 shadow-lg shadow-red-500/30">
                            <PhoneOff className="text-white" size={28} />
                        </div>
                        <span className="text-gray-400 text-sm">Từ chối</span>
                    </button>

                    {/* Accept Button */}
                    <button
                        type="button"
                        onClick={handleAccept}
                        className="flex flex-col items-center gap-2 group"
                    >
                        <div className="w-16 h-16 rounded-full bg-green-500 hover:bg-green-600 flex items-center justify-center transition-all group-hover:scale-110 shadow-lg shadow-green-500/30 animate-bounce">
                            {callType === 'video' ? (
                                <Video className="text-white" size={28} />
                            ) : (
                                <Phone className="text-white" size={28} />
                            )}
                        </div>
                        <span className="text-gray-400 text-sm">Chấp nhận</span>
                    </button>
                </div>
            </div>

            <style>{`
                @keyframes ping {
                    75%, 100% {
                        transform: scale(1.5);
                        opacity: 0;
                    }
                }
                .animation-delay-200 {
                    animation-delay: 0.2s;
                }
            `}</style>
        </div>
    );
};

export default IncomingCall;
