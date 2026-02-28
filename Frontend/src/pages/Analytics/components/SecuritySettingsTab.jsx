import React, { useState } from 'react';
import { Shield, Key, LogOut, CheckCircle, Mail, ArrowRight, Loader2 } from 'lucide-react';
import axiosClient from '../../../lib/axios';
import LogoutConfirmModal from './LogoutConfirmModal';

const SecuritySettingsTab = () => {
    const [step, setStep] = useState(1);
    const [pwdData, setPwdData] = useState({
        current_password: '',
        otp: '',
        new_password: '',
        new_password_confirmation: ''
    });

    const [isLoading, setIsLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState(null);
    const [successMsg, setSuccessMsg] = useState(null);
    const [logoutLoading, setLogoutLoading] = useState(false);
    const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

    const handlePwdChange = (e) => {
        const { name, value } = e.target;
        setPwdData(prev => ({ ...prev, [name]: value }));
        setErrorMsg(null);
    };

    const requestOtp = async (e) => {
        e.preventDefault();

        if (!pwdData.current_password) {
            setErrorMsg("Current password is required.");
            return;
        }

        setIsLoading(true);
        setErrorMsg(null);
        setSuccessMsg(null);

        try {
            await axiosClient.post('/api/profile/password/otp', {
                current_password: pwdData.current_password
            });

            setStep(2);
            setSuccessMsg("Success! A verification code has been sent to your email. Please check your inbox.");

            // Auto hide success message after 5 seconds
            setTimeout(() => setSuccessMsg(null), 5000);
        } catch (error) {
            console.error('Error requesting OTP:', error);
            let extractedError = 'Failed to send verification code.';
            if (error.response?.data?.errors) {
                extractedError = Object.values(error.response.data.errors)[0][0];
            } else if (error.response?.data?.message) {
                extractedError = error.response.data.message;
            }

            setErrorMsg(extractedError);
        } finally {
            setIsLoading(false);
        }
    };

    const updatePassword = async (e) => {
        e.preventDefault();

        // Custom check for password strength before sending
        const pwd = pwdData.new_password;
        if (pwd.length < 8 || !/[A-Z]/.test(pwd) || !/[a-z]/.test(pwd) || !/[0-9]/.test(pwd) || !/[^A-Za-z0-9]/.test(pwd)) {
            const errorStr = "Password must be at least 8 characters and contain at least one uppercase letter, one lowercase letter, one number, and one symbol.";
            setErrorMsg(errorStr);
            return;
        }

        if (pwdData.new_password !== pwdData.new_password_confirmation) {
            setErrorMsg("New passwords do not match.");
            return;
        }

        setIsLoading(true);
        setErrorMsg(null);
        setSuccessMsg(null);

        try {
            const response = await axiosClient.post('/api/profile/password', {
                otp: pwdData.otp,
                new_password: pwdData.new_password,
                new_password_confirmation: pwdData.new_password_confirmation
            });

            setSuccessMsg(response.data.message || 'Password updated successfully!');
            setPwdData({
                current_password: '',
                otp: '',
                new_password: '',
                new_password_confirmation: ''
            });
            setStep(1);
        } catch (error) {
            console.error('Error updating password:', error);
            let extractedError = 'Failed to update password.';
            if (error.response?.data?.errors) {
                extractedError = Object.values(error.response.data.errors)[0][0];
            } else if (error.response?.data?.message) {
                extractedError = error.response.data.message;
            }

            setErrorMsg(extractedError);
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogoutAll = async () => {
        setIsLogoutModalOpen(false);
        setLogoutLoading(true);
        try {
            await axiosClient.post('/api/logout-all');
            // Clear local storage and redirect
            localStorage.removeItem('APP_USER');
            localStorage.removeItem('ACCESS_TOKEN');
            window.location.href = '/login';
        } catch (error) {
            console.error("Logout all devices failed:", error);
            setErrorMsg("Failed to logout from all devices. Please try again.");
            setLogoutLoading(false);
        }
    };

    return (
        <div className="sp-security-wrapper">
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1e293b', marginBottom: '1.5rem' }}>Change Password</h3>

            {errorMsg && (
                <div style={{ padding: '1rem', borderRadius: '12px', background: '#fef2f2', border: '1px solid #fee2e2', color: '#dc2626', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', animation: 'fadeIn 0.3s ease' }}>
                    <Shield size={20} />
                    <span style={{ fontSize: '0.95rem', fontWeight: 500 }}>{errorMsg}</span>
                </div>
            )}

            {successMsg && (
                <div style={{ padding: '1rem', borderRadius: '12px', background: '#f0fdf4', border: '1px solid #dcfce7', color: '#16a34a', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', animation: 'fadeIn 0.3s ease' }}>
                    <CheckCircle size={20} />
                    <span style={{ fontSize: '0.95rem', fontWeight: 500 }}>{successMsg}</span>
                </div>
            )}
            <div className="sp-form-container">
                {step === 1 ? (
                    <form onSubmit={requestOtp}>
                        <div className="sp-form-group" style={{ maxWidth: '500px' }}>
                            <label>Current Password</label>
                            <input
                                type="password"
                                name="current_password"
                                value={pwdData.current_password}
                                onChange={handlePwdChange}
                                placeholder="Enter your current password"
                                required
                            />
                            <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.5rem' }}>We need your current password to send a secure verification code to your email.</p>
                        </div>

                        <button type="submit" className="sp-save-btn" disabled={isLoading || !pwdData.current_password}>
                            {isLoading ? (
                                <>Processing...</>
                            ) : (
                                <>Request Verification Code <ArrowRight size={18} /></>
                            )}
                        </button>
                    </form>
                ) : (
                    <form onSubmit={updatePassword}>
                        <div className="sp-form-group" style={{ maxWidth: '500px' }}>
                            <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <Mail size={16} className="text-blue-500" /> Verification Code (OTP)
                                </div>
                                <button
                                    type="button"
                                    onClick={requestOtp}
                                    disabled={isLoading}
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        color: '#3b82f6',
                                        cursor: 'pointer',
                                        fontSize: '0.85rem',
                                        fontWeight: '600',
                                        textDecoration: 'underline'
                                    }}
                                >
                                    Resend OTP
                                </button>
                            </label>
                            <input
                                type="text"
                                name="otp"
                                value={pwdData.otp}
                                onChange={handlePwdChange}
                                placeholder="Enter 6-digit code sent to your email"
                                maxLength="6"
                                required
                                style={{ letterSpacing: '2px', fontSize: '1.1rem', fontWeight: '500' }}
                            />
                        </div>

                        <div className="sp-form-row">
                            <div className="sp-form-group">
                                <label>New Password</label>
                                <input
                                    type="password"
                                    name="new_password"
                                    value={pwdData.new_password}
                                    onChange={handlePwdChange}
                                    placeholder="Enter new password (min 8 characters)"
                                    required
                                    minLength="8"
                                />
                            </div>
                            <div className="sp-form-group">
                                <label>Confirm New Password</label>
                                <input
                                    type="password"
                                    name="new_password_confirmation"
                                    value={pwdData.new_password_confirmation}
                                    onChange={handlePwdChange}
                                    placeholder="Confirm new password"
                                    required
                                    minLength="8"
                                />
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                            <button type="submit" className="sp-save-btn" disabled={isLoading || !pwdData.otp || !pwdData.new_password || !pwdData.new_password_confirmation}>
                                {isLoading ? (
                                    <>Updating Password...</>
                                ) : (
                                    <><CheckCircle size={18} /> Update Password</>
                                )}
                            </button>

                            <button
                                type="button"
                                onClick={() => {
                                    setStep(1);
                                    setSuccessMsg(null);
                                    setErrorMsg(null);
                                }}
                                disabled={isLoading}
                                className="sp-cancel-btn"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                )}
            </div>

            <div className="sp-danger-zone">
                <h3>Device Management</h3>
                <p>If you notice suspicious activity, you can securely log out of all active sessions across all browsers and devices.</p>

                <button
                    className="sp-danger-btn"
                    onClick={() => setIsLogoutModalOpen(true)}
                    disabled={logoutLoading}
                >
                    {logoutLoading ? <Loader2 className="animate-spin" size={18} /> : <LogOut size={18} />}
                    Logout from all devices
                </button>
            </div>

            <LogoutConfirmModal
                isOpen={isLogoutModalOpen}
                onClose={() => setIsLogoutModalOpen(false)}
                onConfirm={handleLogoutAll}
                isLoading={logoutLoading}
            />
        </div>
    );
};

export default SecuritySettingsTab;
