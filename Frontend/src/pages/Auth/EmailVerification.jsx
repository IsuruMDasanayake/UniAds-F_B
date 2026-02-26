import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Mail, RefreshCw, CheckCircle2 } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axiosClient from '../../lib/axios';
import './EmailVerification.css';

const EmailVerification = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [timer, setTimer] = useState(120); // 2 minutes
    const [isResending, setIsResending] = useState(false);

    const email = location.state?.email || localStorage.getItem('VERIFICATION_EMAIL');

    useEffect(() => {
        if (!email) {
            navigate('/login');
        }

        const countdown = setInterval(() => {
            setTimer((prev) => (prev > 0 ? prev - 1 : 0));
        }, 1000);

        return () => clearInterval(countdown);
    }, [email, navigate]);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handleChange = (index, value) => {
        if (isNaN(value)) return;

        const newOtp = [...otp];
        newOtp[index] = value.substring(value.length - 1);
        setOtp(newOtp);

        // Auto focus next input
        if (value && index < 5) {
            document.getElementById(`otp-${index + 1}`).focus();
        }
    };

    const handleKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            document.getElementById(`otp-${index - 1}`).focus();
        }
    };

    const handleVerify = async (e) => {
        e.preventDefault();
        const otpString = otp.join('');
        if (otpString.length !== 6) {
            setError('Please enter the full 6-digit code.');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            const response = await axiosClient.post('/api/email/verify-otp', { otp: otpString });
            if (response.data.success) {
                setSuccess('Email verified successfully!');
                setTimeout(() => {
                    navigate('/feed');
                }, 2000);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Verification failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleResend = async () => {
        if (timer > 0) return;

        setIsResending(true);
        setError('');
        setSuccess('');

        try {
            const response = await axiosClient.post('/api/email/resend-otp', { email });
            setSuccess(response.data.message || 'A new verification code has been sent!');
            setTimer(120);
            setOtp(['', '', '', '', '', '']);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to resend code. Please try again.');
        } finally {
            setIsResending(false);
        }
    };

    return (
        <div className="verification-auth-container">
            <Link to="/" className="back-home-floating">
                <ArrowLeft size={20} /> <span className="back-text">Back to Home</span>
            </Link>

            <motion.div
                className="auth-left verification-auth-left"
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.6 }}
            >
                <div className="verification-visual">
                    <Mail size={80} className="mail-icon-anim" />
                </div>
                <h1 className="auth-welcome-title">Verify Your Email</h1>
                <p className="auth-description">
                    We've sent a 6-digit verification code to <br />
                    <strong>{email}</strong>
                </p>
            </motion.div>

            <motion.div
                className="auth-right"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.6 }}
            >
                <div className="auth-form-wrapper">
                    <div className="auth-header">
                        <h2>Enter Code</h2>
                        <p>The code expires in <span className="timer-highlight">{formatTime(timer)}</span></p>
                    </div>

                    {error && <div className="auth-error-message">{error}</div>}
                    {success && <div className="auth-success-message"><CheckCircle2 size={18} /> {success}</div>}

                    <form className="auth-form" onSubmit={handleVerify}>
                        <div className="otp-input-container">
                            {otp.map((digit, index) => (
                                <input
                                    key={index}
                                    id={`otp-${index}`}
                                    type="text"
                                    className="otp-input"
                                    value={digit}
                                    onChange={(e) => handleChange(index, e.target.value)}
                                    onKeyDown={(e) => handleKeyDown(index, e)}
                                    maxLength={1}
                                    autoComplete="off"
                                />
                            ))}
                        </div>

                        <button
                            type="submit"
                            className="auth-submit-btn verify-btn"
                            disabled={isLoading || otp.join('').length !== 6}
                        >
                            {isLoading ? 'Verifying...' : 'Verify Account'}
                        </button>
                    </form>

                    <div className="auth-footer">
                        <p>Didn't receive the code?</p>
                        <button
                            onClick={handleResend}
                            className="resend-btn"
                            disabled={timer > 0 || isResending}
                        >
                            {isResending ? (
                                <RefreshCw size={16} className="spin" />
                            ) : (
                                timer > 0 ? `Resend in ${formatTime(timer)}` : 'Resend Code'
                            )}
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default EmailVerification;
