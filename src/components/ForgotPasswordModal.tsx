import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as authService from '../services/authService';

interface ForgotPasswordModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({ isOpen, onClose }) => {
    const [step, setStep] = useState<'EMAIL' | 'OTP' | 'NEW_PASSWORD'>('EMAIL');
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState(['', '', '', '']);
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const resetState = () => {
        setStep('EMAIL');
        setEmail('');
        setOtp(['', '', '', '']);
        setNewPassword('');
        setConfirmPassword('');
        setError('');
        setSuccess('');
    };

    const handleClose = () => {
        resetState();
        onClose();
    };

    const handleSendOTP = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const res = await authService.forgotPassword(email);
            setSuccess(res.message);
            setTimeout(() => {
                setSuccess('');
                setStep('OTP');
            }, 1000);
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to send OTP');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOTP = async () => {
        const otpCode = otp.join('');
        if (otpCode.length !== 4) return setError('Please enter full OTP');

        setLoading(true);
        setError('');
        try {
            const res = await authService.verifyForgotPasswordOTP(email, otpCode);
            setSuccess(res.message);
            setTimeout(() => {
                setSuccess('');
                setStep('NEW_PASSWORD');
            }, 1000);
        } catch (err: any) {
            setError(err.response?.data?.error || 'Invalid OTP');
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            setError('Mật khẩu không khớp');
            return;
        }

        setLoading(true);
        setError('');
        try {
            const res = await authService.resetPassword({
                email,
                otp: otp.join(''),
                newPassword
            });
            setSuccess(res.message);
            setTimeout(() => {
                handleClose();
            }, 2000);
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to reset password');
        } finally {
            setLoading(false);
        }
    };

    const handleOTPChange = (index: number, value: string) => {
        if (value.length > 1) return;
        if (value && !/^\d$/.test(value)) return;
        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);
        if (value && index < 3) {
            document.getElementById(`forgot-otp-${index + 1}`)?.focus();
        }
    };

    const handleOTPKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            document.getElementById(`forgot-otp-${index - 1}`)?.focus();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-gray-900 rounded-2xl shadow-2xl max-w-md w-full p-8 border border-gray-800"
            >
                <h2 className="text-2xl font-bold text-white mb-2 text-center">
                    {step === 'EMAIL' && 'Quên Mật Khẩu'}
                    {step === 'OTP' && 'Xác Thực OTP'}
                    {step === 'NEW_PASSWORD' && 'Đặt Lại Mật Khẩu'}
                </h2>

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

                {step === 'EMAIL' && (
                    <form onSubmit={handleSendOTP} className="space-y-4">
                        <p className="text-gray-400 text-center mb-4">Nhập email của bạn để nhận mã xác thực.</p>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                            placeholder="Email của bạn"
                            required
                        />
                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={handleClose}
                                className="flex-1 py-3 text-gray-400 hover:text-white transition-colors"
                            >
                                Hủy
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-1 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors font-medium"
                            >
                                {loading ? 'Đang gửi...' : 'Gửi mã'}
                            </button>
                        </div>
                    </form>
                )}

                {step === 'OTP' && (
                    <div className="space-y-6">
                        <p className="text-gray-400 text-center">Nhập mã 4 số đã gửi tới {email}</p>
                        <div className="flex gap-3 justify-center">
                            {otp.map((digit, index) => (
                                <input
                                    key={index}
                                    id={`forgot-otp-${index}`}
                                    type="text"
                                    maxLength={1}
                                    value={digit}
                                    onChange={(e) => handleOTPChange(index, e.target.value)}
                                    onKeyDown={(e) => handleOTPKeyDown(index, e)}
                                    className="w-14 h-14 text-center text-2xl font-bold bg-gray-800 border-2 border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                                />
                            ))}
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setStep('EMAIL')}
                                className="flex-1 py-3 text-gray-400 hover:text-white transition-colors"
                            >
                                Quay lại
                            </button>
                            <button
                                onClick={handleVerifyOTP}
                                disabled={loading}
                                className="flex-1 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors font-medium"
                            >
                                {loading ? 'Đang xác thực...' : 'Tiếp tục'}
                            </button>
                        </div>
                    </div>
                )}

                {step === 'NEW_PASSWORD' && (
                    <form onSubmit={handleResetPassword} className="space-y-4">
                        <input
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                            placeholder="Mật khẩu mới"
                            required
                            minLength={6}
                        />
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                            placeholder="Xác nhận mật khẩu mới"
                            required
                            minLength={6}
                        />
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors font-medium"
                        >
                            {loading ? 'Đang đặt lại...' : 'Đặt lại mật khẩu'}
                        </button>
                    </form>
                )}
            </motion.div>
        </div>
    );
};

export default ForgotPasswordModal;
