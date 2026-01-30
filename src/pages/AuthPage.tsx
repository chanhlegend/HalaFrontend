import React, { useState } from 'react';
import * as authService from '../services/authService';
import { motion, AnimatePresence } from 'framer-motion';
import { GoogleLogin, CredentialResponse } from '@react-oauth/google';

import ForgotPasswordModal from '../components/ForgotPasswordModal';

const AuthPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'login' | 'register'>('register');
    const [showOTPModal, setShowOTPModal] = useState(false);
    const [showForgotModal, setShowForgotModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Register form state
    const [registerData, setRegisterData] = useState({
        name: '',
        email: '',
        password: '',
    });

    // Login form state
    const [loginData, setLoginData] = useState({
        email: '',
        password: '',
    });

    // OTP state
    const [otp, setOtp] = useState(['', '', '', '']);
    const [otpEmail, setOtpEmail] = useState('');

    // Handle register
    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        try {
            const response = await authService.register(registerData);
            setSuccess(response.message);
            setOtpEmail(registerData.email);
            setShowOTPModal(true);
        } catch (err: any) {
            setError(err.response?.data?.error || 'Đã xảy ra lỗi khi đăng ký');
        } finally {
            setLoading(false);
        }
    };

    // Handle login
    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        try {
            const response = await authService.login(loginData);
            setSuccess(response.message);
            // Redirect to home page or dashboard
            setTimeout(() => {
                window.location.href = '/';
            }, 1500);
        } catch (err: any) {
            setError(err.response?.data?.error || 'Đã xảy ra lỗi khi đăng nhập');
        } finally {
            setLoading(false);
        }
    };

    // Handle OTP verification
    const handleVerifyOTP = async () => {
        const otpCode = otp.join('');
        if (otpCode.length !== 4) {
            setError('Vui lòng nhập đầy đủ mã OTP');
            return;
        }

        setError('');
        setLoading(true);

        try {
            const response = await authService.verifyOTP(otpEmail, otpCode);
            setSuccess(response.message);
            setShowOTPModal(false);
            setActiveTab('login');
            setOtp(['', '', '', '']);
        } catch (err: any) {
            setError(err.response?.data?.error || 'Mã OTP không chính xác');
        } finally {
            setLoading(false);
        }
    };

    // Handle resend OTP
    const handleResendOTP = async () => {
        setError('');
        setLoading(true);

        try {
            const response = await authService.resendOTP(otpEmail);
            setSuccess(response.message);
        } catch (err: any) {
            setError(err.response?.data?.error || 'Đã xảy ra lỗi');
        } finally {
            setLoading(false);
        }
    };

    // Handle OTP input change
    const handleOTPChange = (index: number, value: string) => {
        if (value.length > 1) return;
        if (value && !/^\d$/.test(value)) return;

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        // Auto focus next input
        if (value && index < 3) {
            const nextInput = document.getElementById(`otp-${index + 1}`);
            nextInput?.focus();
        }
    };

    // Handle OTP backspace
    const handleOTPKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            const prevInput = document.getElementById(`otp-${index - 1}`);
            prevInput?.focus();
        }
    };

    // Handle Google Login
    const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
        if (!credentialResponse.credential) {
            setError('Không thể đăng nhập bằng Google');
            return;
        }

        setError('');
        setSuccess('');
        setLoading(true);

        try {
            const response = await authService.googleLogin(credentialResponse.credential);
            setSuccess(response.message);
            // Redirect to home page
            setTimeout(() => {
                window.location.href = '/';
            }, 1500);
        } catch (err: any) {
            setError(err.response?.data?.error || 'Đã xảy ra lỗi khi đăng nhập bằng Google');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleError = () => {
        setError('Đăng nhập Google thất bại. Vui lòng thử lại.');
    };

    return (
        <div className="min-h-screen w-full bg-gradient-to-br from-purple-900 via-purple-800 to-purple-700 flex items-center justify-center p-4">
            {/* Left Side - Branding */}
            <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                className="hidden lg:flex lg:w-1/2 flex-col justify-center px-12 text-white"
            >
                <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-purple-300 via-pink-300 to-purple-300 bg-clip-text text-transparent bg-300% animate-gradient">
                    HalaConnect
                </h1>
                <p className="text-xl text-purple-200 leading-relaxed">
                    Kết nối với bạn bè và chia sẻ những khoảnh khắc ý nghĩa trong cuộc sống của bạn.
                </p>
            </motion.div>

            {/* Right Side - Auth Form */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md lg:w-1/2 lg:max-w-lg"
            >
                <div className="bg-gray-900/80 backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden border border-white/10">
                    {/* Tabs */}
                    <div className="flex border-b border-gray-800">
                        <button
                            onClick={() => setActiveTab('login')}
                            className={`flex-1 py-4 text-center font-medium transition-all ${activeTab === 'login'
                                ? 'text-white bg-white/10'
                                : 'text-gray-400 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            Đăng nhập
                        </button>
                        <button
                            onClick={() => setActiveTab('register')}
                            className={`flex-1 py-4 text-center font-medium transition-all ${activeTab === 'register'
                                ? 'text-white bg-white/10'
                                : 'text-gray-400 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            Đăng ký
                        </button>
                    </div>

                    {/* Form Content */}
                    <div className="p-8">
                        <AnimatePresence mode="wait">
                            {/* Error/Success Messages */}
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm"
                                >
                                    {error}
                                </motion.div>
                            )}
                            {success && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="mb-4 p-3 bg-green-500/10 border border-green-500/50 rounded-lg text-green-400 text-sm"
                                >
                                    {success}
                                </motion.div>
                            )}

                            {/* Register Form */}
                            {activeTab === 'register' && (
                                <motion.form
                                    key="register"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ duration: 0.3 }}
                                    onSubmit={handleRegister}
                                    className="space-y-4"
                                >
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2 text-left">
                                            Họ và tên
                                        </label>
                                        <input
                                            type="text"
                                            value={registerData.name}
                                            onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
                                            className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                                            placeholder="Nguyễn Văn A"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2 text-left">
                                            Email
                                        </label>
                                        <input
                                            type="email"
                                            value={registerData.email}
                                            onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                                            className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                                            placeholder="your@email.com"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2 text-left">
                                            Mật khẩu
                                        </label>
                                        <input
                                            type="password"
                                            value={registerData.password}
                                            onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                                            className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                                            placeholder="••••••••"
                                            required
                                            minLength={6}
                                        />
                                        <p className="mt-1 text-xs text-gray-500 text-left">
                                            Bằng cách đăng ký, bạn đồng ý với Điều khoản dịch vụ và Chính sách bảo mật của chúng tôi.
                                        </p>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium rounded-lg transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-purple-500/20"
                                    >
                                        {loading ? 'Đang xử lý...' : 'Đăng ký'}
                                    </button>
                                </motion.form>
                            )}

                            {/* Login Form */}
                            {activeTab === 'login' && (
                                <motion.form
                                    key="login"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    transition={{ duration: 0.3 }}
                                    onSubmit={handleLogin}
                                    className="space-y-4"
                                >
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2 text-left">
                                            Email
                                        </label>
                                        <input
                                            type="email"
                                            value={loginData.email}
                                            onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                                            className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                                            placeholder="your@email.com"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2 text-left">
                                            Mật khẩu
                                        </label>
                                        <input
                                            type="password"
                                            value={loginData.password}
                                            onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                                            className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                                            placeholder="••••••••"
                                            required
                                        />
                                        <div className="mt-2 text-right">
                                            <a
                                                href="#"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    setShowForgotModal(true);
                                                }}
                                                className="text-sm text-purple-400 hover:text-purple-300 transition-colors"
                                            >
                                                Quên mật khẩu?
                                            </a>
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium rounded-lg transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-purple-500/20"
                                    >
                                        {loading ? 'Đang xử lý...' : 'Đăng nhập'}
                                    </button>
                                </motion.form>
                            )}
                        </AnimatePresence>

                        {/* Social Login */}
                        <div className="mt-6">
                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-gray-800"></div>
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <span className="px-2 bg-gray-900 text-gray-500">HOẶC TIẾP TỤC VỚI</span>
                                </div>
                            </div>

                            <div className="mt-6 flex flex-col items-center gap-3">
                                <GoogleLogin
                                    onSuccess={handleGoogleSuccess}
                                    onError={handleGoogleError}
                                    theme="filled_black"
                                    size="large"
                                    width="100%"
                                    text="continue_with"
                                    shape="rectangular"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* OTP Modal */}
            <AnimatePresence>
                {showOTPModal && (
                    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="bg-gray-900 rounded-2xl shadow-2xl max-w-md w-full p-8 border border-gray-800"
                        >
                            <h2 className="text-2xl font-bold text-white mb-2 text-center">Xác thực Email</h2>
                            <p className="text-gray-400 mb-6 text-center">
                                Chúng tôi đã gửi mã OTP gồm 4 chữ số đến email <span className="text-purple-400">{otpEmail}</span>
                            </p>

                            {/* Error/Success Messages */}
                            {error && (
                                <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm">
                                    {error}
                                </div>
                            )}
                            {success && (
                                <div className="mb-4 p-3 bg-green-500/10 border border-green-500/50 rounded-lg text-green-400 text-sm">
                                    {success}
                                </div>
                            )}

                            {/* OTP Input */}
                            <div className="flex gap-3 mb-6 justify-center">
                                {otp.map((digit, index) => (
                                    <input
                                        key={index}
                                        id={`otp-${index}`}
                                        type="text"
                                        maxLength={1}
                                        value={digit}
                                        onChange={(e) => handleOTPChange(index, e.target.value)}
                                        onKeyDown={(e) => handleOTPKeyDown(index, e)}
                                        className="w-14 h-14 text-center text-2xl font-bold bg-gray-800 border-2 border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                                    />
                                ))}
                            </div>

                            {/* Buttons */}
                            <div className="space-y-3">
                                <button
                                    onClick={handleVerifyOTP}
                                    disabled={loading}
                                    className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium rounded-lg transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-purple-500/20"
                                >
                                    {loading ? 'Đang xác thực...' : 'Xác thực'}
                                </button>

                                <button
                                    onClick={handleResendOTP}
                                    disabled={loading}
                                    className="w-full py-3 bg-gray-800 hover:bg-gray-750 text-gray-300 font-medium rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Gửi lại mã OTP
                                </button>

                                <button
                                    onClick={() => {
                                        setShowOTPModal(false);
                                        setOtp(['', '', '', '']);
                                        setError('');
                                    }}
                                    className="w-full py-3 text-gray-400 hover:text-white transition-colors"
                                >
                                    Hủy
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Forgot Password Modal */}
            <ForgotPasswordModal
                isOpen={showForgotModal}
                onClose={() => setShowForgotModal(false)}
            />
        </div>
    );
};

export default AuthPage;
