import React, { useState, useEffect, useCallback } from 'react';
import { useSocket, IncomingCallData } from '../contexts/SocketContext';
import IncomingCall from './IncomingCall';
import VideoCall from './VideoCall';
import CallingScreen from './CallingScreen';
import { acceptCall as acceptCallApi, rejectCall as rejectCallApi, endCall as endCallApi } from '../services/callService';

interface ActiveCallData {
    appId: string;
    channelName: string;
    token: string | null;
    remoteUserName?: string;
    remoteUserAvatar?: string;
    callerId?: string;
}

const CALL_STATE_KEY = 'hala_active_call';

// Save call state to sessionStorage so we can notify on F5/close
const saveCallState = (callData: ActiveCallData | null, isInCall: boolean, isCalling: boolean) => {
    if (callData && (isInCall || isCalling)) {
        sessionStorage.setItem(CALL_STATE_KEY, JSON.stringify({ callData, isInCall, isCalling }));
    } else {
        sessionStorage.removeItem(CALL_STATE_KEY);
    }
};

const GlobalCallHandler: React.FC = () => {
    const { incomingCall, setIncomingCall, callAccepted, setCallAccepted, callRejected, setCallRejected, callEnded, setCallEnded, socket } = useSocket();
    const [isCalling, setIsCalling] = useState(false); // Đang gọi, đợi người nhận
    const [isInCall, setIsInCall] = useState(false); // Đang trong cuộc gọi video
    const [callData, setCallData] = useState<ActiveCallData | null>(null);

    // Get current user from localStorage
    const userStr = localStorage.getItem('user');
    const currentUser = userStr ? JSON.parse(userStr) : null;

    // Persist call state to sessionStorage whenever it changes
    useEffect(() => {
        saveCallState(callData, isInCall, isCalling);
    }, [callData, isInCall, isCalling]);

    // On mount: check if there was an active call before F5 (notify the other party)
    useEffect(() => {
        const savedState = sessionStorage.getItem(CALL_STATE_KEY);
        if (savedState) {
            try {
                const { callData: savedCallData } = JSON.parse(savedState);
                // Page was refreshed during a call → notify the other party via API
                if (savedCallData?.callerId) {
                    endCallApi(savedCallData.callerId).catch(() => {});
                }
            } catch (e) {
                // ignore parse errors
            }
            sessionStorage.removeItem(CALL_STATE_KEY);
        }
    }, []);

    // Notify the other party when user closes/refreshes the page
    const handleBeforeUnload = useCallback(() => {
        if ((isInCall || isCalling) && callData?.callerId) {
            // Use socket event for instant notification (sendBeacon is unreliable for WebSocket)
            if (socket) {
                socket.emit('call_ended_by_user', { otherId: callData.callerId });
            }
            // Also try to send via fetch as backup (sendBeacon for REST API)
            const token = localStorage.getItem('accessToken');
            if (token) {
                const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
                const body = JSON.stringify({ otherId: callData.callerId });
                // Use sendBeacon which works during page unload
                if (navigator.sendBeacon) {
                    const blob = new Blob([body], { type: 'application/json' });
                    navigator.sendBeacon(`${apiUrl}/api/calls/end?token=${token}`, blob);
                }
            }
        }
    }, [isInCall, isCalling, callData, socket]);

    useEffect(() => {
        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, [handleBeforeUnload]);

    // Handle when call is ended by the other user - exit VideoCall
    useEffect(() => {
        if (callEnded && (isInCall || isCalling)) {
            setIsInCall(false);
            setIsCalling(false);
            setCallData(null);
            setCallEnded(false);
        }
    }, [callEnded, isInCall, isCalling, setCallEnded]);

    // Handle when call is rejected - exit CallingScreen
    useEffect(() => {
        if (callRejected && isCalling) {
            setIsCalling(false);
            setCallData(null);
            setCallRejected(false);
        }
    }, [callRejected, isCalling, setCallRejected]);

    // Handle when caller receives call_accepted event
    useEffect(() => {
        if (callAccepted && callData && isCalling) {
            setIsCalling(false);
            setIsInCall(true);
            setCallData(prev => prev ? {
                ...prev,
                remoteUserName: callAccepted.userName || prev.remoteUserName,
                remoteUserAvatar: callAccepted.userAvatar || prev.remoteUserAvatar,
            } : null);
            setCallAccepted(null);
        }
    }, [callAccepted, callData, isCalling, setCallAccepted]);

    // Function to initiate call (called from MessagePage via custom event)
    useEffect(() => {
        const handleInitiateCall = (event: CustomEvent<ActiveCallData>) => {
            setCallData(event.detail);
            setIsCalling(true);
        };

        window.addEventListener('initiate-call' as any, handleInitiateCall);
        return () => {
            window.removeEventListener('initiate-call' as any, handleInitiateCall);
        };
    }, []);

    const handleAcceptCall = async (call: IncomingCallData) => {
        try {
            await acceptCallApi(
                call.callerId,
                call.channelName,
                currentUser?.name || 'User',
                currentUser?.avatar
            );
            
            setCallData({
                appId: call.appId,
                channelName: call.channelName,
                token: call.token,
                remoteUserName: call.callerName,
                remoteUserAvatar: call.callerAvatar,
                callerId: call.callerId,
            });
            setIsInCall(true);
            setIncomingCall(null);
        } catch (error) {
            // Handle error silently
        }
    };

    const handleRejectCall = async (call: IncomingCallData) => {
        try {
            await rejectCallApi(call.callerId);
            setIncomingCall(null);
        } catch (error) {
            // Handle error silently
        }
    };

    const handleCancelCall = async () => {
        try {
            if (callData?.callerId) {
                await endCallApi(callData.callerId);
            }
        } catch (error) {
            // Handle error silently
        } finally {
            setIsCalling(false);
            setCallData(null);
        }
    };

    const handleEndCall = async () => {
        try {
            if (callData?.callerId) {
                await endCallApi(callData.callerId);
            }
        } catch (error) {
            // Handle error silently
        } finally {
            setIsInCall(false);
            setIsCalling(false);
            setCallData(null);
        }
    };

    return (
        <>
            {/* Calling Screen - Shows when waiting for receiver */}
            {isCalling && callData && !isInCall && (
                <CallingScreen
                    remoteName={callData.remoteUserName || 'Đang gọi...'}
                    remoteAvatar={callData.remoteUserAvatar}
                    onCancel={handleCancelCall}
                />
            )}

            {/* Incoming Call Modal - Shows globally */}
            {incomingCall && !isInCall && !isCalling && (
                <IncomingCall
                    callerName={incomingCall.callerName}
                    callerAvatar={incomingCall.callerAvatar}
                    callType={incomingCall.callType}
                    onAccept={() => handleAcceptCall(incomingCall)}
                    onReject={() => handleRejectCall(incomingCall)}
                />
            )}

            {/* Video Call Modal */}
            {isInCall && callData && (
                <VideoCall
                    appId={callData.appId}
                    channelName={callData.channelName}
                    token={callData.token}
                    remoteUserName={callData.remoteUserName}
                    remoteUserAvatar={callData.remoteUserAvatar}
                    onEndCall={handleEndCall}
                />
            )}
        </>
    );
};

export default GlobalCallHandler;
