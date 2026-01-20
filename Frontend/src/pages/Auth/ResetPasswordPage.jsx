import { useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axiosClient from '../../lib/axios';
import './ResetPasswordPage.css';

const ResetPasswordPage = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const [resetCode, setResetCode] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirmation, setPasswordConfirmation] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [passwordStrength, setPasswordStrength] = useState('');

    // Calculate password strength
    const calculatePasswordStrength = (pass) => {
        if (pass.length === 0) return '';
        if (pass.length < 8) return 'weak';

        let strength = 0;
        if (pass.length >= 8) strength++;
        if (pass.length >= 12) strength++;
        if (/[a-z]/.test(pass) && /[A-Z]/.test(pass)) strength++;
        if (/\d/.test(pass)) strength++;
        if (/[^a-zA-Z\d]/.test(pass)) strength++;

        if (strength <= 2) return 'weak';
        if (strength <= 4) return 'medium';
        return 'strong';
    };

    const handlePasswordChange = (e) => {
        const newPassword = e.target.value;
        setPassword(newPassword);
        setPasswordStrength(calculatePasswordStrength(newPassword));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(false);

        // Validation
        if (password.length < 8) {
            setError('Password must be at least 8 characters long');
            return;
        }

        if (password !== passwordConfirmation) {
            setError('Passwords do not match');
            return;
        }

        if (!resetCode.trim()) {
            setError('Please enter the reset code from your email');
            return;
        }

        setIsLoading(true);

        try {
            // Get CSRF cookie
            await axiosClient.get('/sanctum/csrf-cookie');

            // Reset password
            const response = await axiosClient.post('/api/password/reset', {
                reset_code: resetCode,
                password: password,
                password_confirmation: passwordConfirmation
            });

            // Success
            setSuccess(true);

            // Redirect to login after 5 seconds
            setTimeout(() => {
                navigate('/login');
            }, 5000);

        } catch (err) {
            console.error('Reset password error:', err);
            if (err.response && err.response.status === 400) {
                setError('Invalid or expired reset code');
            } else if (err.response && err.response.status === 422) {
                const errors = err.response.data.errors;
                if (errors) {
                    const firstError = Object.values(errors)[0][0];
                    setError(firstError);
                } else {
                    setError('Invalid reset code or password');
                }
            } else if (err.response && err.response.status === 429) {
                setError('Too many requests. Please wait a moment and try again');
            } else {
                setError('Unable to reset password. Please try again later');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="reset-auth-container">

            <Link to="/forgot-password" className="back-home-floating">
                <ArrowLeft size={20} /> <span className="back-text">Back </span>
            </Link>

            {/* Left Side: Visuals */}
            <motion.div
                className="auth-left"
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.6 }}
            >
                <img src="/images/logo.png" alt="UniAds" className="auth-brand-logo" />
                <h1 className="auth-welcome-title">Reset Password</h1>
                <p className="auth-description">
                    Secure your account by entering the reset code from your email and creating a new strong password.
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
                        <h2>Create New Password</h2>
                        <p>Enter the code and your new password</p>
                    </div>

                    {error && (
                        <div className="auth-error-message">
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="auth-success-message">
                            Password reset successful! Redirecting to login...
                        </div>
                    )}

                    <form className="auth-form" onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label htmlFor="resetCode">RESET CODE</label>
                            <input
                                type="text"
                                id="resetCode"
                                className="form-input"
                                placeholder="Enter code from email"
                                value={resetCode}
                                onChange={(e) => setResetCode(e.target.value)}
                                required
                                disabled={success}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="password">NEW PASSWORD</label>
                            <div className="password-wrapper">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    id="password"
                                    className="form-input"
                                    placeholder="At least 8 characters"
                                    value={password}
                                    onChange={handlePasswordChange}
                                    minLength={8}
                                    required
                                    disabled={success}
                                />
                                <button
                                    type="button"
                                    className="password-toggle"
                                    onClick={() => setShowPassword(!showPassword)}
                                    disabled={success}
                                >
                                    {showPassword ? <Eye size={20} /> : <EyeOff size={20} />}
                                </button>
                            </div>
                            {password && passwordStrength && (
                                <div className="password-strength">
                                    <div className="strength-bar">
                                        <div className={`strength-fill ${passwordStrength}`}></div>
                                    </div>
                                    <span className={`strength-text ${passwordStrength}`}>
                                        {passwordStrength === 'weak' && 'Weak Password'}
                                        {passwordStrength === 'medium' && 'Medium Strength'}
                                        {passwordStrength === 'strong' && 'Strong Password'}
                                    </span>
                                </div>
                            )}
                        </div>

                        <div className="form-group">
                            <label htmlFor="passwordConfirmation">CONFIRM PASSWORD</label>
                            <div className="password-wrapper">
                                <input
                                    type={showConfirmPassword ? "text" : "password"}
                                    id="passwordConfirmation"
                                    className="form-input"
                                    placeholder="Repeat new password"
                                    value={passwordConfirmation}
                                    onChange={(e) => setPasswordConfirmation(e.target.value)}
                                    minLength={8}
                                    required
                                    disabled={success}
                                />
                                <button
                                    type="button"
                                    className="password-toggle"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    disabled={success}
                                >
                                    {showConfirmPassword ? <Eye size={20} /> : <EyeOff size={20} />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="auth-submit-btn submit-button"
                            disabled={isLoading || success}
                        >
                            {isLoading ? 'Resetting...' : success ? 'Password Reset!' : 'RESET PASSWORD'}
                        </button>
                    </form>

                    <div className="auth-footer">
                        <p>Remember your password? <Link to="/login">Log in here</Link></p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default ResetPasswordPage;
