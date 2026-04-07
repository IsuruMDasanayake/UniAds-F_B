import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Mail } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import axiosClient from '../../lib/axios';
import { useSettings } from '../../context/SettingsContext';
import AccessDeniedModal from '../../components/Modals/AccessDeniedModal';
import './ForgotPasswordPage.css';

const ForgotPasswordPage = () => {
    const { settings } = useSettings();
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [modalConfig, setModalConfig] = useState({ isOpen: false, title: '', message: '' });

    // Email validation
    const isValidEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(false);

        // Validate email format
        if (!isValidEmail(email)) {
            setError('Please enter a valid email address');
            return;
        }

        setIsLoading(true);

        try {
            // Get CSRF cookie
            await axiosClient.get('/sanctum/csrf-cookie');

            // Send reset code request using the new API endpoint
            const response = await axiosClient.post('/api/password/forgot', {
                email
            });

            // Success
            setSuccess(true);

            // Redirect to reset password page after 5 seconds
            setTimeout(() => {
                navigate('/reset-password', { state: { email } });
            }, 5000);

        } catch (err) {
            console.error('Forgot password error:', err?.message || err);
            console.error('Error response:', err.response);
            console.error('Error data:', err.response?.data);

            if (err.response?.data?.message) {
                setError(err.response.data.message);
            } else if (err.response?.status === 404) {
                setError('Password reset service not found. Please contact support.');
            } else if (err.response?.status === 429) {
                setError('Too many requests. Please wait a moment and try again');
            } else if (err.response?.status === 422) {
                // Validation errors
                const errors = err.response.data.errors;
                if (errors?.email) {
                    setError(errors.email[0]);
                } else {
                    setError(err.response.data.message || 'Validation failed');
                }
            } else {
                setError('Unable to send reset code. Please try again later');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="forgot-auth-container">

            <Link
                to="/login"
                className="back-home-floating"
                onClick={(e) => {
                    if (!settings.allow_login) {
                        e.preventDefault();
                        setModalConfig({
                            isOpen: true,
                            title: "Login Disabled",
                            message: "Login functionality is currently disabled by the administrator. Please try again later."
                        });
                    }
                }}
            >
                <ArrowLeft size={20} /> <span className="back-text">Back to Login </span>
            </Link>

            {/* Left Side: Visuals */}
            <motion.div
                className="auth-left"
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.6 }}
            >
                <img src={settings.logo_url || "/images/logo.png"} alt={settings.site_name} className="auth-brand-logo" />
                <h1 className="auth-welcome-title">Forgot Password?</h1>
                <p className="auth-description">
                    Don&apos;t worry, it happens to the best of us. Enter your email address and we&apos;ll send you a reset code to recover your account.
                </p>
            </motion.div>

            {/* Right Side: Form */}
            <motion.div
                className="auth-right"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.6 }}
            >
                <div className="auth-form-wrapper">
                    <div className="auth-header">
                        <h2>Reset Your Password</h2>
                        <p>Enter your email to receive a reset code</p>
                    </div>

                    {error && (
                        <div className="auth-error-message">
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="auth-success-message">
                            Reset code sent successfully! Check your email and redirecting...
                        </div>
                    )}

                    <form className="auth-form" onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label htmlFor="email">EMAIL ADDRESS</label>
                            <input
                                type="email"
                                id="email"
                                className="form-input"
                                placeholder="example@mail.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                disabled={success}
                            />
                        </div>

                        <button
                            type="submit"
                            className="auth-submit-btn submit-button"
                            disabled={isLoading || success}
                        >
                            {isLoading ? 'Sending...' : success ? 'Code Sent!' : 'SEND RESET CODE'}
                        </button>
                    </form>

                    <div className="auth-footer">
                        <p>Remember your password? <Link to="/login" onClick={(e) => {
                            if (!settings.allow_login) {
                                e.preventDefault();
                                setModalConfig({
                                    isOpen: true,
                                    title: "Login Disabled",
                                    message: "Login functionality is currently disabled by the administrator. Please try again later."
                                });
                            }
                        }}>Log in here</Link></p>
                        <p>New to UniAds? <Link to="/register" onClick={(e) => {
                            if (!settings.allow_user_registration) {
                                e.preventDefault();
                                setModalConfig({
                                    isOpen: true,
                                    title: "Registration Disabled",
                                    message: "New registrations are currently disabled by the administrator. Please contact support if you need assistance."
                                });
                            }
                        }}>Register here</Link></p>
                    </div>
                </div>
            </motion.div>

            <AccessDeniedModal
                isOpen={modalConfig.isOpen}
                onClose={() => setModalConfig({ ...modalConfig, isOpen: false })}
                title={modalConfig.title}
                message={modalConfig.message}
            />
        </div>
    );
};

export default ForgotPasswordPage;
