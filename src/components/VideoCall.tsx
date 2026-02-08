import React, { useEffect, useRef, useState } from 'react';
import AgoraRTC, {
    IAgoraRTCClient,
    IAgoraRTCRemoteUser,
    ICameraVideoTrack,
    IMicrophoneAudioTrack,
} from 'agora-rtc-sdk-ng';
import { Mic, MicOff, Video, VideoOff, PhoneOff } from 'lucide-react';

interface VideoCallProps {
    appId: string;
    channelName: string;
    token: string | null; // Can be null for testing mode
    onEndCall: () => void;
    remoteUserName?: string;
    remoteUserAvatar?: string;
}

const VideoCall: React.FC<VideoCallProps> = ({
    appId,
    channelName,
    token,
    onEndCall,
    remoteUserName,
    remoteUserAvatar,
}) => {
    const [client] = useState<IAgoraRTCClient>(() =>
        AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' })
    );
    const [localVideoTrack, setLocalVideoTrack] = useState<ICameraVideoTrack | null>(null);
    const [localAudioTrack, setLocalAudioTrack] = useState<IMicrophoneAudioTrack | null>(null);
    const [remoteUsers, setRemoteUsers] = useState<IAgoraRTCRemoteUser[]>([]);
    const [isVideoEnabled, setIsVideoEnabled] = useState(true);
    const [isAudioEnabled, setIsAudioEnabled] = useState(true);
    const [isConnecting, setIsConnecting] = useState(true);

    const localVideoRef = useRef<HTMLDivElement>(null);
    const remoteVideoRef = useRef<HTMLDivElement>(null);

    // Play remote video AFTER React has rendered the remote video container
    useEffect(() => {
        if (remoteUsers.length > 0 && remoteVideoRef.current) {
            const remoteUser = remoteUsers[remoteUsers.length - 1];
            if (remoteUser.videoTrack) {
                remoteUser.videoTrack.play(remoteVideoRef.current);
            }
        }
    }, [remoteUsers]);

    useEffect(() => {
        const init = async () => {
            // Handle remote user events
            client.on('user-published', async (user, mediaType) => {
                await client.subscribe(user, mediaType);
                
                if (mediaType === 'video') {
                    setRemoteUsers(prev => {
                        if (prev.find(u => u.uid === user.uid)) return prev;
                        return [...prev, user];
                    });
                    // Video will be played by the useEffect above after re-render
                }
                
                if (mediaType === 'audio') {
                    user.audioTrack?.play();
                }
            });

            client.on('user-unpublished', (user, mediaType) => {
                if (mediaType === 'video') {
                    setRemoteUsers(prev => prev.filter(u => u.uid !== user.uid));
                }
            });

            client.on('user-left', (user) => {
                setRemoteUsers(prev => prev.filter(u => u.uid !== user.uid));
            });

            try {
                // Join channel
                await client.join(appId, channelName, token, null);
                
                // Create and publish local tracks - with fallback if device is busy
                let audioTrack = null;
                let videoTrack = null;
                
                // Try to create audio track
                try {
                    audioTrack = await AgoraRTC.createMicrophoneAudioTrack();
                    setLocalAudioTrack(audioTrack);
                } catch (audioError) {
                    setIsAudioEnabled(false);
                }
                
                // Try to create video track
                try {
                    videoTrack = await AgoraRTC.createCameraVideoTrack();
                    setLocalVideoTrack(videoTrack);
                    
                    // Play local video
                    if (localVideoRef.current) {
                        videoTrack.play(localVideoRef.current);
                    }
                } catch (videoError) {
                    setIsVideoEnabled(false);
                }
                
                // Publish available tracks
                const tracksToPublish = [audioTrack, videoTrack].filter(Boolean);
                if (tracksToPublish.length > 0) {
                    await client.publish(tracksToPublish as any);
                }
                
                setIsConnecting(false);
            } catch (error) {
                setIsConnecting(false);
            }
        };

        init();

        return () => {
            // Cleanup
            localVideoTrack?.close();
            localAudioTrack?.close();
            client.leave();
        };
    }, [appId, channelName, token, client]);

    const toggleVideo = async () => {
        if (localVideoTrack) {
            await localVideoTrack.setEnabled(!isVideoEnabled);
            setIsVideoEnabled(!isVideoEnabled);
        }
    };

    const toggleAudio = async () => {
        if (localAudioTrack) {
            await localAudioTrack.setEnabled(!isAudioEnabled);
            setIsAudioEnabled(!isAudioEnabled);
        }
    };

    const handleEndCall = async () => {
        try {
            localVideoTrack?.close();
            localAudioTrack?.close();
            await client.leave();
        } catch (error) {
            // Ignore cleanup errors
        }
        onEndCall();
    };

    return (
        <div className="fixed inset-0 bg-black z-50 flex flex-col">
            {/* Remote Video (Full Screen) */}
            <div className="flex-1 relative">
                {remoteUsers.length > 0 ? (
                    <div
                        ref={remoteVideoRef}
                        className="w-full h-full"
                    />
                ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-gray-900">
                        {isConnecting ? (
                            <>
                                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mb-4"></div>
                                <p className="text-white text-lg">Đang kết nối...</p>
                            </>
                        ) : (
                            <>
                                <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 flex items-center justify-center text-white text-3xl font-bold overflow-hidden mb-4">
                                    {remoteUserAvatar ? (
                                        <img src={remoteUserAvatar} alt={remoteUserName} className="w-full h-full object-cover" />
                                    ) : (
                                        <span>{remoteUserName?.[0]?.toUpperCase() || '?'}</span>
                                    )}
                                </div>
                                <p className="text-white text-xl">{remoteUserName || 'Đang chờ...'}</p>
                                <p className="text-gray-400 mt-2">Đang chờ người dùng khác tham gia...</p>
                            </>
                        )}
                    </div>
                )}

                {/* Local Video (Picture-in-Picture) */}
                <div
                    ref={localVideoRef}
                    className="absolute bottom-24 right-4 w-32 h-44 bg-gray-800 rounded-xl overflow-hidden shadow-lg border-2 border-gray-700"
                />
            </div>

            {/* Controls */}
            <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-6">
                <button
                    type="button"
                    onClick={toggleAudio}
                    className={`w-14 h-14 rounded-full flex items-center justify-center transition-colors ${
                        isAudioEnabled ? 'bg-gray-700 hover:bg-gray-600' : 'bg-red-500 hover:bg-red-600'
                    }`}
                >
                    {isAudioEnabled ? (
                        <Mic className="text-white" size={24} />
                    ) : (
                        <MicOff className="text-white" size={24} />
                    )}
                </button>

                <button
                    type="button"
                    onClick={handleEndCall}
                    className="w-14 h-14 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center transition-colors"
                >
                    <PhoneOff className="text-white" size={24} />
                </button>

                <button
                    type="button"
                    onClick={toggleVideo}
                    className={`w-14 h-14 rounded-full flex items-center justify-center transition-colors ${
                        isVideoEnabled ? 'bg-gray-700 hover:bg-gray-600' : 'bg-red-500 hover:bg-red-600'
                    }`}
                >
                    {isVideoEnabled ? (
                        <Video className="text-white" size={24} />
                    ) : (
                        <VideoOff className="text-white" size={24} />
                    )}
                </button>
            </div>
        </div>
    );
};

export default VideoCall;
