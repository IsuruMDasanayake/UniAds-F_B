import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff, ArrowLeft, RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axiosClient from '../../lib/axios';
import { useSettings } from '../../context/SettingsContext';
import AccessDeniedModal from '../../components/Modals/AccessDeniedModal';
import './ResetPasswordPage.css';

const ResetPasswordPage = () => {
    const { settings } = useSettings();
    const navigate = useNavigate();
    const location = useLocation();
    const email = location.state?.email || '';

    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [password, setPassword] = useState('');
    const [passwordConfirmation, setPasswordConfirmation] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [errors, setErrors] = useState({});
    const [success, setSuccess] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [passwordStrength, setPasswordStrength] = useState('');
    const [modalConfig, setModalConfig] = useState({ isOpen: false, title: '', message: '' });
    const [timer, setTimer] = useState(120); // 2 minutes
    const [isResending, setIsResending] = useState(false);
    const [liveValidation, setLiveValidation] = useState({
        password: ''
    });

    useEffect(() => {
        const countdown = setInterval(() => {
            setTimer((prev) => (prev > 0 ? prev - 1 : 0));
        }, 1000);

        return () => clearInterval(countdown);
    }, []);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handleOtpChange = (index, value) => {
        if (isNaN(value)) return;

        const newOtp = [...otp];
        newOtp[index] = value.substring(value.length - 1);
        setOtp(newOtp);

        // Auto focus next input
        if (value && index < 5) {
            document.getElementById(`otp-${index + 1}`).focus();
        }

        if (errors.reset_code) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors.reset_code;
                return newErrors;
            });
        }
    };

    const handleOtpKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            document.getElementById(`otp-${index - 1}`).focus();
        }
    };

    const handleResendCode = async () => {
        if (timer > 0 || !email) return;
        setIsResending(true);
        setErrors({});

        try {
            await axiosClient.post('/api/password/forgot', { email });
            setTimer(120);
            setOtp(['', '', '', '', '', '']);
        } catch (err) {
            setErrors({ general: 'Failed to resend code. Please try again.' });
        } finally {
            setIsResending(false);
        }
    };

    // Strong password validation (matches Blade template / Register page)
    const calculatePasswordStrength = (pass) => {
        if (pass.length === 0) return '';
        const strongRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
        if (strongRegex.test(pass)) {
            return 'strong';
        }
        return 'weak';
    };

    const handlePasswordChange = (e) => {
        const newPassword = e.target.value;
        setPassword(newPassword);
        const strength = calculatePasswordStrength(newPassword);
        setPasswordStrength(strength);

        if (newPassword.length === 0) {
            setLiveValidation(prev => ({ ...prev, password: '' }));
        } else if (strength === 'strong') {
            setLiveValidation(prev => ({ ...prev, password: 'Strong password ✅' }));
        } else {
            setLiveValidation(prev => ({
                ...prev,
                password: 'Include uppercase, lowercase, number & special char, min 8 chars.'
            }));
        }

        if (errors.password) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors.password;
                return newErrors;
            });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors({});
        setSuccess(false);

        const validationErrors = {};

        if (otp.join('').length !== 6) {
            validationErrors.reset_code = 'Please enter the full 6-digit reset code from your email';
        }

        if (passwordStrength !== 'strong') {
            validationErrors.password = 'Password must contain uppercase, lowercase, number & special char, min 8 chars';
        }

        if (password !== passwordConfirmation) {
            validationErrors.password_confirmation = 'Passwords do not match';
        }

        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        setIsLoading(true);

        try {
            await axiosClient.get('/sanctum/csrf-cookie');

            await axiosClient.post('/api/password/reset', {
                reset_code: otp.join(''),
                password: password,
                password_confirmation: passwordConfirmation
            });

            setSuccess(true);
            setTimeout(() => {
                navigate('/login');
            }, 3000);

        } catch (err) {
            console.error('Reset password error:', err);
            if (err.response && err.response.status === 422) {
                const backendErrors = err.response.data.errors || {};
                const message = err.response.data.message;
                const processedErrors = {};

                if (Object.keys(backendErrors).length > 0) {
                    Object.keys(backendErrors).forEach(key => {
                        processedErrors[key] = Array.isArray(backendErrors[key]) ? backendErrors[key][0] : backendErrors[key];
                    });
                } else if (message) {
                    // Map generic message to reset_code for visual feedback
                    processedErrors.reset_code = message;
                }
                setErrors(processedErrors);
            } else if (err.response && err.response.status === 429) {
                setErrors({ general: 'Too many requests. Please wait a moment and try again' });
            } else {
                setErrors({ general: err.response?.data?.message || 'Unable to reset password. Please try again later' });
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="reset-auth-container">

            <Link to="/" className="back-home-floating">
                <ArrowLeft size={20} /> <span className="back-text">Back </span>
            </Link>

            {/* Left Side: Visuals */}
            <motion.div
                className="auth-left"
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.6 }}
            >
                <img src={settings.logo_url || "/images/logo.png"} alt={settings.site_name} className="auth-brand-logo" />
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

                    {/* Error and Success Alerts */}
                    <AnimatePresence mode="wait">
                        {Object.keys(errors).length > 0 && (
                            <motion.div
                                className="auth-error-message shake-anim"
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                            >
                                <div className="error-alert-header">
                                    <AlertCircle size={18} />
                                    <strong>Password Reset Failed</strong>
                                </div>
                                <ul className="error-list">
                                    {Object.entries(errors).map(([field, message]) => (
                                        <li key={field}>{message}</li>
                                    ))}
                                </ul>
                            </motion.div>
                        )}

                        {success && (
                            <motion.div
                                className="auth-success-message"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                            >
                                <CheckCircle2 size={18} />
                                <span>Password reset successful! Redirecting to login...</span>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <form className="auth-form" onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label>RESET CODE</label>
                            <p className="timer-text">Expires in <span className="timer-highlight">{formatTime(timer)}</span></p>
                            <div className="otp-input-container">
                                {otp.map((digit, index) => (
                                    <input
                                        key={index}
                                        id={`otp-${index}`}
                                        type="text"
                                        className={`otp-input ${errors.reset_code ? 'input-error' : ''}`}
                                        value={digit}
                                        onChange={(e) => handleOtpChange(index, e.target.value)}
                                        onKeyDown={(e) => handleOtpKeyDown(index, e)}
                                        maxLength={1}
                                        autoComplete="off"
                                        disabled={success}
                                    />
                                ))}
                            </div>
                            {errors.reset_code && <span className="error-text">{errors.reset_code}</span>}
                        </div>

                        <div className="form-group">
                            <label htmlFor="password">NEW PASSWORD</label>
                            <div className="password-wrapper">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    id="password"
                                    className={`form-input ${errors.password ? 'input-error' : ''}`}
                                    placeholder="Strong password required"
                                    value={password}
                                    onChange={handlePasswordChange}
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
                            {liveValidation.password && (
                                <span className={liveValidation.password.includes('✅') ? 'success-text' : 'error-text'}>
                                    {liveValidation.password}
                                </span>
                            )}
                            {errors.password && <span className="error-text">{errors.password}</span>}

                            {/* Strength indicator bar */}
                            {password && (
                                <div className="password-strength">
                                    <div className="strength-bar">
                                        <div className={`strength-fill ${passwordStrength}`}></div>
                                    </div>
                                    <span className={`strength-text ${passwordStrength}`}>
                                        {passwordStrength === 'weak' ? '' : ''}
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
                                    className={`form-input ${errors.password_confirmation ? 'input-error' : ''}`}
                                    placeholder="Repeat new password"
                                    value={passwordConfirmation}
                                    onChange={(e) => {
                                        setPasswordConfirmation(e.target.value);
                                        if (errors.password_confirmation) {
                                            setErrors(prev => {
                                                const newErrors = { ...prev };
                                                delete newErrors.password_confirmation;
                                                return newErrors;
                                            });
                                        }
                                    }}
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
                            {errors.password_confirmation && <span className="error-text">{errors.password_confirmation}</span>}
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
                        <p>Didn't receive the code?</p>
                        <button
                            type="button"
                            onClick={handleResendCode}
                            className="resend-link-btn"
                            disabled={timer > 0 || isResending || !email}
                        >
                            {isResending ? (
                                <RefreshCw size={16} className="spin" />
                            ) : (
                                timer > 0 ? `Resend in ${formatTime(timer)}` : 'Resend Code'
                            )}
                        </button>
                        <p style={{ marginTop: '1rem' }}>Remember your password? <Link to="/login" onClick={(e) => {
                            if (!settings.allow_login) {
                                e.preventDefault();
                                setModalConfig({
                                    isOpen: true,
                                    title: "Login Disabled",
                                    message: "Login functionality is currently disabled by the administrator. Please try again later."
                                });
                            }
                        }}>Log in here</Link></p>
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

export default ResetPasswordPage;
