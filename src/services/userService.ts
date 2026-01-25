import apiClient from './apiClient';
import { IUser } from '../types';

export interface UpdateProfileData {
    name?: string;
    bio?: string;
    workplace?: string;
    location?: string;
    dateOfBirth?: string;
    phone?: string;
}

// Get current user profile
export const getProfile = async (): Promise<IUser> => {
    const response = await apiClient.get('/api/users/profile');
    return response.data;
};

// Update user profile
export const updateProfile = async (data: UpdateProfileData): Promise<IUser> => {
    const response = await apiClient.put('/api/users/profile', data);
    return response.data;
};

// Upload avatar
export const uploadAvatar = async (file: File): Promise<{ avatar: string; user: IUser }> => {
    const formData = new FormData();
    formData.append('avatar', file);
    
    const response = await apiClient.post('/api/users/upload-avatar', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};

// Upload cover photo
export const uploadCoverPhoto = async (file: File): Promise<{ coverPhoto: string; user: IUser }> => {
    const formData = new FormData();
    formData.append('coverPhoto', file);
    
    const response = await apiClient.post('/api/users/upload-cover', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};
