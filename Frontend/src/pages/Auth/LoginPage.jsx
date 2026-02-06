import { useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import axiosClient from '../../lib/axios'; // Import configured axios
import { useSettings } from '../../context/SettingsContext';
import AccessDeniedModal from '../../components/Modals/AccessDeniedModal';
import './LoginPage.css';

const LoginPage = () => {
    const navigate = useNavigate();
    const { settings } = useSettings();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState(null);
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

        if (!settings.allow_login) {
            setModalConfig({
                isOpen: true,
                title: "Login Disabled",
                message: "Login functionality is currently disabled by the administrator. Please try again later."
            });
            return;
        }

        // Validate email format
        if (!isValidEmail(email)) {
            setError('Please enter a valid email address');
            return;
        }

        setIsLoading(true);

        try {
            // 1. Attempt Login
            const response = await axiosClient.post('/api/login', {
                email,
                password
            });

            // 2. Login Successful - Save Token & User
            if (response.data.token) {
                localStorage.setItem('ACCESS_TOKEN', response.data.token);
                if (response.data.user) {
                    localStorage.setItem('APP_USER', JSON.stringify(response.data.user));
                }
            }

            // Role-based redirect using window.location to ensure fresh page load
            const userRole = response.data.user?.role;

            if (userRole === 'Admin') {
                window.location.href = '/admin/dashboard';
            } else if (userRole === 'Institute') {
                window.location.href = '/feed';
            } else {
                window.location.href = '/feed';
            }

        } catch (err) {
            if (err.response && err.response.status === 422) {
                setError('Invalid credentials. Please try again.');
            } else if (err.response && err.response.status === 429) {
                setError('Too many attempts. Please wait a minute and try again.');
            } else {
                setError('Something went wrong. Please try again later.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="login-auth-container">
            <Link to="/" className="back-home-floating">
                <ArrowLeft size={20} /> <span className="back-text">Back to Home</span>
            </Link>

            {/* Left Side: Visuals */}
            <motion.div
                className="auth-left"
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.6 }}
            >
                <img src={settings.logo_url || "/images/logo.png"} alt={settings.site_name} className="auth-brand-logo" />
                <h1 className="auth-welcome-title">Welcome Back!</h1>
                <p className="auth-description">
                    Log in to continue exploring educational opportunities, managing your profile, and connecting with institutions.
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
                        <h2>Login Account</h2>
                        <p>Please sign in to your dashboard</p>
                    </div>

                    {error && (
                        <div className="auth-error-message" style={{ color: 'red', textAlign: 'center', marginBottom: '1rem' }}>
                            {error}
                        </div>
                    )}

                    <form className="auth-form" onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label htmlFor="email">EMAIL ADDRESS</label>
                            <input
                                type="email"
                                id="email"
                                className="form-input"
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="password">PASSWORD</label>
                            <div className="password-wrapper">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    id="password"
                                    className="form-input"
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                                <button
                                    type="button"
                                    className="password-toggle"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? <Eye size={20} /> : <EyeOff size={20} />}
                                </button>
                            </div>
                        </div>

                        <div className="form-extras">
                            <Link to="/forgot-password" className="forgot-link">Forgot Password?</Link>
                        </div>

                        <button type="submit" className="auth-submit-btn submit-button" disabled={isLoading}>
                            {isLoading ? 'Loading...' : 'LOG IN'}
                        </button>
                    </form>

                    <div className="auth-footer">
                        <p>Don&apos;t have an account? <Link to="/register" onClick={(e) => {
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

export default LoginPage;
