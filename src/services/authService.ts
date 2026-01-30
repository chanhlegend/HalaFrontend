import axios from 'axios';

const API_URL = '/api/auth';

export interface RegisterData {
    name: string;
    email: string;
    password: string;
}

export interface LoginData {
    email: string;
    password: string;
}

export interface AuthResponse {
    message: string;
    accessToken?: string;
    refreshToken?: string;
    user?: {
        id: string;
        name: string;
        email: string;
        avatar?: string;
    };
    email?: string;
}

/**
 * Register a new user
 */
export const register = async (data: RegisterData): Promise<AuthResponse> => {
    const response = await axios.post(`${API_URL}/register`, data);
    return response.data;
};

/**
 * Verify OTP
 */
export const verifyOTP = async (email: string, otp: string): Promise<AuthResponse> => {
    const response = await axios.post(`${API_URL}/verify-otp`, { email, otp });
    return response.data;
};

/**
 * Resend OTP
 */
export const resendOTP = async (email: string): Promise<AuthResponse> => {
    const response = await axios.post(`${API_URL}/resend-otp`, { email });
    return response.data;
};

/**
 * Login user
 */
export const login = async (data: LoginData): Promise<AuthResponse> => {
    const response = await axios.post(`${API_URL}/login`, data);

    // Store tokens in localStorage
    if (response.data.accessToken) {
        localStorage.setItem('accessToken', response.data.accessToken);
    }
    if (response.data.refreshToken) {
        localStorage.setItem('refreshToken', response.data.refreshToken);
    }
    if (response.data.user) {
        localStorage.setItem('user', JSON.stringify(response.data.user));
    }

    return response.data;
};

/**
 * Login with Google
 */
export const googleLogin = async (credential: string): Promise<AuthResponse> => {
    const response = await axios.post(`${API_URL}/google`, { credential });

    // Store tokens in localStorage
    if (response.data.accessToken) {
        localStorage.setItem('accessToken', response.data.accessToken);
    }
    if (response.data.refreshToken) {
        localStorage.setItem('refreshToken', response.data.refreshToken);
    }
    if (response.data.user) {
        localStorage.setItem('user', JSON.stringify(response.data.user));
    }

    return response.data;
};

/**
 * Logout user
 */
export const logout = async (): Promise<void> => {
    const refreshToken = localStorage.getItem('refreshToken');

    if (refreshToken) {
        try {
            await axios.post(`${API_URL}/logout`, { refreshToken });
        } catch (error) {
            console.error('Logout error:', error);
        }
    }

    // Clear localStorage
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
};

/**
 * Refresh access token
 */
export const refreshAccessToken = async (): Promise<string | null> => {
    const refreshToken = localStorage.getItem('refreshToken');

    if (!refreshToken) {
        return null;
    }

    try {
        const response = await axios.post(`${API_URL}/refresh-token`, { refreshToken });
        const newAccessToken = response.data.accessToken;

        localStorage.setItem('accessToken', newAccessToken);
        return newAccessToken;
    } catch (error) {
        console.error('Refresh token error:', error);
        // If refresh fails, logout user
        await logout();
        return null;
    }
};

/**
 * Get current user from localStorage
 */
export const getCurrentUser = () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
};

/**
 * Get access token from localStorage
 */
export const getAccessToken = (): string | null => {
    return localStorage.getItem('accessToken');
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = (): boolean => {
    return !!getAccessToken();
};

export const forgotPassword = async (email: string) => {
    const response = await axios.post(`${API_URL}/forgot-password`, { email });
    return response.data;
};

export const verifyForgotPasswordOTP = async (email: string, otp: string) => {
    const response = await axios.post(`${API_URL}/verify-reset-otp`, { email, otp });
    return response.data;
};

export const resetPassword = async (data: any) => {
    const response = await axios.post(`${API_URL}/reset-password`, data);
    return response.data;
};
