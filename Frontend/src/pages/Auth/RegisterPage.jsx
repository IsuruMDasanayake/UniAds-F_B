import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import axiosClient from '../../lib/axios';
import { useSettings } from '../../context/SettingsContext';
import AccessDeniedModal from '../../components/Modals/AccessDeniedModal';
import './RegisterPage.css';

import { districts, educationLevels } from '../../lib/constants';

const RegisterPage = () => {
    const navigate = useNavigate();
    const { settings } = useSettings();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        gender: '',
        birthday: '',
        district: '',
        education_level: '',
        password: '',
        password_confirmation: ''
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [passwordStrength, setPasswordStrength] = useState('');
    const [modalConfig, setModalConfig] = useState({ isOpen: false, title: '', message: '' });

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

    // Email validation
    const isValidEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };



    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        // Clear error for this field when user types
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    const handlePasswordChange = (e) => {
        const newPassword = e.target.value;
        setFormData(prev => ({ ...prev, password: newPassword }));
        setPasswordStrength(calculatePasswordStrength(newPassword));
        if (errors.password) {
            setErrors(prev => ({ ...prev, password: null }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors({});

        if (!settings.allow_user_registration) {
            setModalConfig({
                isOpen: true,
                title: "Registration Disabled",
                message: "New registrations are currently disabled by the administrator. Please contact support if you need assistance."
            });
            return;
        }

        // Comprehensive validation
        const validationErrors = {};

        if (!isValidEmail(formData.email)) {
            validationErrors.email = "Please enter a valid email address";
        }

        if (formData.password.length < 8) {
            validationErrors.password = "Password must be at least 8 characters";
        }

        if (formData.password !== formData.password_confirmation) {
            validationErrors.password_confirmation = "Passwords do not match";
        }

        // Check age (must be at least 13 years old)
        const birthDate = new Date(formData.birthday);
        const today = new Date();
        const age = today.getFullYear() - birthDate.getFullYear();
        if (age < 13) {
            validationErrors.birthday = "You must be at least 13 years old to register";
        }

        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        setIsLoading(true);

        try {
            // Attempt Register
            const response = await axiosClient.post('/api/register', formData);

            // Save token if returned
            if (response.data.token) {
                localStorage.setItem('ACCESS_TOKEN', response.data.token);
                if (response.data.user) {
                    localStorage.setItem('APP_USER', JSON.stringify(response.data.user));
                }
            }

            // Registration successful
            console.log("Registration Success:", response.data);

            // Role-based redirect (new users default to 'User' role)
            const userRole = response.data.user?.role;
            if (userRole === 'Admin') {
                navigate('/admin/dashboard');
            } else if (userRole === 'Institute') {
                navigate('/feed');
            } else {
                navigate('/feed');
            }

        } catch (err) {
            console.error('Registration error:', err);
            if (err.response && err.response.status === 422) {
                // Laravel validation errors
                setErrors(err.response.data.errors);
            } else if (err.response && err.response.status === 429) {
                setErrors({ general: 'Too many attempts. Please wait a minute and try again.' });
            } else {
                setErrors({ general: 'Something went wrong. Please try again.' });
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="register-auth-container">
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
                <h1 className="auth-welcome-title">Join {settings.site_name}</h1>
                <p className="auth-description">
                    Create an account to start your educational journey. Access exclusive resources and connect with top institutes.
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

                        <h2>Create Account</h2>
                        <br />



                    </div>

                    {errors.general && (
                        <div className="auth-error-message" style={{ color: 'red', textAlign: 'center', marginBottom: '1rem' }}>
                            {errors.general}
                        </div>
                    )}

                    <form className="auth-form" onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label htmlFor="name">Full Name</label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                className={`form-input ${errors.name ? 'input-error' : ''}`}
                                placeholder=""
                                value={formData.name}
                                onChange={handleChange}
                                required
                            />
                            {errors.name && <span className="error-text">{errors.name}</span>}
                        </div>

                        <div className="form-group">
                            <label htmlFor="email">Email</label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                className={`form-input ${errors.email ? 'input-error' : ''}`}
                                placeholder=""
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />
                            {errors.email && <span className="error-text">{errors.email}</span>}
                        </div>

                        <div className="form-group">
                            <label>Gender</label>
                            <div className="gender-options">
                                <label className="gender-label">
                                    <input
                                        type="radio"
                                        name="gender"
                                        value="Male"
                                        checked={formData.gender === 'Male'}
                                        onChange={handleChange}
                                        required
                                    /> Male
                                </label>
                                <label className="gender-label">
                                    <input
                                        type="radio"
                                        name="gender"
                                        value="Female"
                                        checked={formData.gender === 'Female'}
                                        onChange={handleChange}
                                    /> Female
                                </label>
                            </div>
                            {errors.gender && <span className="error-text">{errors.gender}</span>}
                        </div>

                        <div className="form-group">
                            <label htmlFor="birthday">Birthday</label>
                            <input
                                type="date"
                                id="birthday"
                                name="birthday"
                                max={new Date().toISOString().split("T")[0]}
                                className={`form-input ${errors.birthday ? 'input-error' : ''}`}
                                value={formData.birthday}
                                onChange={handleChange}
                                required
                            />
                            {errors.birthday && <span className="error-text">{errors.birthday}</span>}
                        </div>

                        <div className="form-group">
                            <label htmlFor="district">District</label>
                            <select
                                id="district"
                                name="district"
                                className={`form-input ${errors.district ? 'input-error' : ''}`}
                                value={formData.district}
                                onChange={handleChange}
                                required
                            >
                                <option value=""></option>
                                {districts.map(d => <option key={d} value={d}>{d}</option>)}
                            </select>
                            {errors.district && <span className="error-text">{errors.district}</span>}
                        </div>

                        <div className="form-group">
                            <label htmlFor="education_level">Education Level</label>
                            <select
                                id="education_level"
                                name="education_level"
                                className={`form-input ${errors.education_level ? 'input-error' : ''}`}
                                value={formData.education_level}
                                onChange={handleChange}
                                required
                            >
                                <option value=""></option>
                                {educationLevels.map(l => <option key={l} value={l}>{l}</option>)}
                            </select>
                            {errors.education_level && <span className="error-text">{errors.education_level}</span>}
                        </div>

                        <div className="form-group">
                            <label htmlFor="password">Password</label>
                            <div className="password-wrapper">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    id="password"
                                    name="password"
                                    className={`form-input ${errors.password ? 'input-error' : ''}`}
                                    value={formData.password}
                                    onChange={handlePasswordChange}
                                    minLength={8}
                                    required
                                    autoComplete="new-password"
                                />
                                <button
                                    type="button"
                                    className="password-toggle"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? <Eye size={16} /> : <EyeOff size={16} />}
                                </button>
                            </div>
                            {formData.password && passwordStrength && (
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
                            {errors.password && <span className="error-text">{errors.password}</span>}
                        </div>

                        <div className="form-group">
                            <label htmlFor="password_confirmation">Confirm Password</label>
                            <div className="password-wrapper">
                                <input
                                    type={showConfirmPassword ? "text" : "password"}
                                    id="password_confirmation"
                                    name="password_confirmation"
                                    className={`form-input ${errors.password_confirmation ? 'input-error' : ''}`}
                                    value={formData.password_confirmation}
                                    onChange={handleChange}
                                    minLength={8}
                                    required
                                    autoComplete="new-password"
                                />
                                <button
                                    type="button"
                                    className="password-toggle"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                >
                                    {showConfirmPassword ? <Eye size={16} /> : <EyeOff size={16} />}
                                </button>
                            </div>
                            {errors.password_confirmation && <span className="error-text">{errors.password_confirmation}</span>}
                        </div>

                        <button type="submit" className="auth-submit-btn submit-button" disabled={isLoading}>
                            {isLoading ? 'Creating Account...' : 'REGISTER'}
                        </button>
                    </form>

                    <div className="institute-section-bottom">
                        <p className="institute-quote">&quot;Are you an Institute?&quot;</p>
                        <Link
                            to="/institutionprofileadd"
                            className="institute-btn-bottom"
                            onClick={(e) => {
                                if (!settings.allow_institute_registration) {
                                    e.preventDefault();
                                    setModalConfig({
                                        isOpen: true,
                                        title: "Registration Disabled",
                                        message: "Institute registrations are currently disabled by the administrator. Please contact support if you need assistance."
                                    });
                                }
                            }}
                        >
                            INSTITUTE REGISTRATION
                        </Link>
                    </div>

                    <div className="auth-footer compact-footer">
                        <p>Already have an account? <Link to="/login" onClick={(e) => {
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

export default RegisterPage;
