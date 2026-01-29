import apiClient from './apiClient';

export interface CallTokenResponse {
    token: string;
    appId: string;
    channelName: string;
    uid: number;
}

export interface IncomingCallData {
    callerId: string;
    callerName: string;
    callerAvatar?: string;
    channelName: string;
    token: string;
    appId: string;
    callType: 'video' | 'audio';
}

// Generate Agora token
export const generateToken = async (channelName: string): Promise<CallTokenResponse> => {
    const response = await apiClient.post('/api/calls/token', { channelName });
    return response.data;
};

// Initiate a call
export const initiateCall = async (
    receiverId: string,
    callerName: string,
    callerAvatar?: string,
    callType: 'video' | 'audio' = 'video'
): Promise<CallTokenResponse> => {
    const response = await apiClient.post('/api/calls/initiate', {
        receiverId,
        callerName,
        callerAvatar,
        callType,
    });
    return response.data;
};

// Accept a call
export const acceptCall = async (
    callerId: string,
    channelName: string,
    userName: string,
    userAvatar?: string
): Promise<void> => {
    await apiClient.post('/api/calls/accept', {
        callerId,
        channelName,
        userName,
        userAvatar,
    });
};

// Reject a call
export const rejectCall = async (callerId: string, reason?: string): Promise<void> => {
    await apiClient.post('/api/calls/reject', { callerId, reason });
};

// End a call
export const endCall = async (otherId: string): Promise<void> => {
    await apiClient.post('/api/calls/end', { otherId });
};
