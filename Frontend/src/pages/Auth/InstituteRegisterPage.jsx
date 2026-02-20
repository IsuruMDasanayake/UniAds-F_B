import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff, ArrowLeft, Building2, Check } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import axiosClient from '../../lib/axios';
import { useSettings } from '../../context/SettingsContext';
import AccessDeniedModal from '../../components/Modals/AccessDeniedModal';
import './InstituteRegisterPage.css';

const InstituteRegisterPage = () => {
    const navigate = useNavigate();
    const { settings } = useSettings();
    const [formData, setFormData] = useState({
        institute_name: '',
        institute_type: '',
        email: '',
        location: '',
        gov_register_number: '',
        website: '',
        contact_number: '',
        password: '',
        password_confirmation: ''
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [showAccessModal, setShowAccessModal] = useState(false);
    const [passwordStrength, setPasswordStrength] = useState('');
    const [liveValidation, setLiveValidation] = useState({
        contact: '',
        website: '',
        password: ''
    });

    const instituteTypes = [
        "University",
        "Higher Education Institute",
        "College",
        "Institute",
        "Training Center",
        "Vocational Training Center",
        "Technical Institute",
        "Professional Institute",
        "Academy",
        "Government Institute",
        "International Institute"
    ];

    // Strong password validation (matches Blade template)
    const calculatePasswordStrength = (pass) => {
        if (pass.length === 0) return '';

        const strongRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
        if (strongRegex.test(pass)) {
            return 'strong';
        }
        return 'weak';
    };

    // Email validation
    const isValidEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    // Phone number validation (Sri Lankan format: +94XXXXXXXXX or 0XXXXXXXXX)
    const isValidPhone = (phone) => {
        const phoneRegex = /^(\+94\d{9}|0\d{9})$/;
        return phoneRegex.test(phone.trim());
    };

    // Website URL validation - must start with https://
    const isValidURL = (url) => {
        if (!url) return false;
        return url.trim().startsWith('https://');
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        // Clear error for this field
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }

        // Live validation for specific fields
        if (name === 'contact_number') {
            const val = value.trim();
            if (val === '') {
                setLiveValidation(prev => ({ ...prev, contact: '' }));
            } else if (!isValidPhone(val)) {
                setLiveValidation(prev => ({
                    ...prev,
                    contact: 'Contact number must be in the format +94XXXXXXXXX or 01XXXXXXXX with no spaces.'
                }));
            } else {
                setLiveValidation(prev => ({ ...prev, contact: 'Valid contact number format.' }));
            }
        }

        if (name === 'website') {
            const val = value.trim();
            if (val === '') {
                setLiveValidation(prev => ({ ...prev, website: '' }));
            } else if (!val.startsWith('https://')) {
                setLiveValidation(prev => ({
                    ...prev,
                    website: 'Website URL must start with https://'
                }));
            } else {
                setLiveValidation(prev => ({ ...prev, website: '' }));
            }
        }
    };

    const handlePasswordChange = (e) => {
        const newPassword = e.target.value;
        setFormData(prev => ({ ...prev, password: newPassword }));
        const strength = calculatePasswordStrength(newPassword);
        setPasswordStrength(strength);

        if (newPassword.length === 0) {
            setLiveValidation(prev => ({ ...prev, password: '' }));
        } else if (strength === 'strong') {
            setLiveValidation(prev => ({ ...prev, password: 'Strong password ✅' }));
        } else {
            setLiveValidation(prev => ({
                ...prev,
                password: 'Password must contain uppercase, lowercase, number & special char, min 8 chars.'
            }));
        }

        if (errors.password) {
            setErrors(prev => ({ ...prev, password: null }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors({});

        if (!settings.allow_institute_registration) {
            setShowAccessModal(true);
            return;
        }

        // Comprehensive validation
        const validationErrors = {};

        if (!formData.institute_name.trim()) {
            validationErrors.institute_name = "Institute name is required";
        }

        if (!formData.institute_type) {
            validationErrors.institute_type = "Institute type is required";
        }

        if (!isValidEmail(formData.email)) {
            validationErrors.email = "Please enter a valid email address";
        }

        if (!formData.location.trim()) {
            validationErrors.location = "Location is required";
        }

        if (!formData.gov_register_number.trim()) {
            validationErrors.gov_register_number = "Government registration number is required";
        }

        if (!isValidURL(formData.website)) {
            validationErrors.website = "Website URL is required and must start with https://";
        }

        if (!isValidPhone(formData.contact_number)) {
            validationErrors.contact_number = "Contact number must be in the format +94XXXXXXXXX or 01XXXXXXXX with no spaces";
        }

        if (passwordStrength !== 'strong') {
            validationErrors.password = "Password must contain uppercase, lowercase, number & special char, min 8 chars";
        }

        if (formData.password !== formData.password_confirmation) {
            validationErrors.password_confirmation = "Passwords do not match";
        }

        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        setIsLoading(true);

        try {
            // Get CSRF cookie for SPA authentication
            await axiosClient.get('/sanctum/csrf-cookie');

            const response = await axiosClient.post('/api/register-institute', formData);

            console.log("Institute Registration Success:", response.data);

            // Save token and user for immediate login
            if (response.data.token) {
                localStorage.setItem('ACCESS_TOKEN', response.data.token);
                if (response.data.user) {
                    localStorage.setItem('APP_USER', JSON.stringify(response.data.user));
                }
            }

            navigate('/login');

        } catch (err) {
            console.error('Institute Registration error:', err);
            console.error('Error response:', err.response);
            console.error('Error data:', err.response?.data);
            console.error('Validation errors:', err.response?.data?.errors);

            if (err.response && err.response.status === 422) {
                // Laravel validation errors
                const backendErrors = err.response.data.errors || {};

                // Convert array errors to string (Laravel returns arrays)
                const processedErrors = {};
                Object.keys(backendErrors).forEach(key => {
                    if (Array.isArray(backendErrors[key])) {
                        processedErrors[key] = backendErrors[key][0]; // Take first error message
                    } else {
                        processedErrors[key] = backendErrors[key];
                    }
                });

                if (Object.keys(processedErrors).length > 0) {
                    setErrors(processedErrors);
                } else {
                    setErrors({ general: err.response.data.message || 'Validation failed' });
                }
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
        <div className="institute-auth-container">
            <Link to="/" className="back-home-floating">
                <ArrowLeft size={20} /> <span className="back-text">Back to Home</span>
            </Link>

            {/* Left Side: Benefits */}
            <motion.div
                className="auth-left institute-auth-left"
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.6 }}
            >
                <h1 className="auth-welcome-title">Register Your Institute</h1>
                <p className="auth-description" style={{ marginBottom: '0.75rem' }}>
                    Join UniAds and showcase your institute to the world.
                </p>
                <ul style={{
                    listStyle: 'none',
                    padding: 0,
                    textAlign: 'left',
                    maxWidth: '450px',
                    fontSize: '0.95rem',
                    lineHeight: '1.8'
                }}>
                    <li style={{ marginBottom: '1rem', display: 'flex', gap: '0.5rem' }}>
                        <Check size={20} style={{ flexShrink: 0, marginTop: '2px' }} />
                        <span><strong>Basic Privileges on Approval:</strong> Get started with editing your profile and exploring features until approved by the admin.</span>
                    </li>
                    <li style={{ marginBottom: '1rem', display: 'flex', gap: '0.5rem' }}>
                        <Check size={20} style={{ flexShrink: 0, marginTop: '2px' }} />
                        <span><strong>Profile Customization:</strong> Add your institute's bio, photos, contact details, and more.</span>
                    </li>
                    <li style={{ marginBottom: '1rem', display: 'flex', gap: '0.5rem' }}>
                        <Check size={20} style={{ flexShrink: 0, marginTop: '2px' }} />
                        <span><strong>Insightful Analytics:</strong> Track views and engagement to understand your audience better.</span>
                    </li>
                    <li style={{ marginBottom: '0', display: 'flex', gap: '0.5rem' }}>
                        <Check size={20} style={{ flexShrink: 0, marginTop: '2px' }} />
                        <span><strong>24/7 Support:</strong> Get assistance whenever you need help managing your institute profile.</span>
                    </li>
                </ul>
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
                        <h2>Institute Register</h2>
                    </div>

                    {/* Error Alert - Show all errors */}
                    {Object.keys(errors).length > 0 && (
                        <div className="auth-error-message" style={{ marginBottom: '1rem' }}>
                            <strong>Please fix the following errors:</strong>
                            <ul style={{ marginTop: '0.5rem', paddingLeft: '1.5rem' }}>
                                {Object.entries(errors).map(([field, message]) => (
                                    <li key={field}>
                                        <strong>{field.replace(/_/g, ' ')}:</strong> {message}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    <form className="auth-form" onSubmit={handleSubmit}>
                        {/* Institute Name */}
                        <div className="form-group full-width">
                            <label htmlFor="institute_name">Institute Name</label>
                            <input
                                type="text"
                                id="institute_name"
                                name="institute_name"
                                className={`form-input ${errors.institute_name ? 'input-error' : ''}`}
                                value={formData.institute_name}
                                onChange={handleChange}
                                required
                            />
                            {errors.institute_name && <span className="error-text">{errors.institute_name}</span>}
                        </div>

                        {/* Email and Institute Type */}
                        <div className="form-group">
                            <label htmlFor="email">Email</label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                className={`form-input ${errors.email ? 'input-error' : ''}`}
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />
                            {errors.email && <span className="error-text">{errors.email}</span>}
                        </div>

                        <div className="form-group">
                            <label htmlFor="institute_type">Institute Type</label>
                            <select
                                id="institute_type"
                                name="institute_type"
                                className={`form-input ${errors.institute_type ? 'input-error' : ''}`}
                                value={formData.institute_type}
                                onChange={handleChange}
                                required
                            >
                                <option value="">Select Type</option>
                                {instituteTypes.map(type => (
                                    <option key={type} value={type}>{type}</option>
                                ))}
                            </select>
                            {errors.institute_type && <span className="error-text">{errors.institute_type}</span>}
                        </div>

                        {/* Location */}
                        <div className="form-group">
                            <label htmlFor="location">Location</label>
                            <input
                                type="text"
                                id="location"
                                name="location"
                                className={`form-input ${errors.location ? 'input-error' : ''}`}
                                value={formData.location}
                                onChange={handleChange}
                                required
                            />
                            {errors.location && <span className="error-text">{errors.location}</span>}
                        </div>

                        {/* Government Registration Number */}
                        <div className="form-group">
                            <label htmlFor="gov_register_number">Government Registration Number</label>
                            <input
                                type="text"
                                id="gov_register_number"
                                name="gov_register_number"
                                className={`form-input ${errors.gov_register_number ? 'input-error' : ''}`}
                                value={formData.gov_register_number}
                                onChange={handleChange}
                                required
                            />
                            {errors.gov_register_number && <span className="error-text">{errors.gov_register_number}</span>}
                        </div>

                        {/* Website */}
                        <div className="form-group">
                            <label htmlFor="website">Website</label>
                            <input
                                type="url"
                                id="website"
                                name="website"
                                className={`form-input ${errors.website ? 'input-error' : ''}`}
                                placeholder="https://example.com"
                                value={formData.website}
                                onChange={handleChange}
                                required
                            />
                            {liveValidation.website ? (
                                <span className={liveValidation.website.includes('must') ? 'error-text' : 'success-text'}>
                                    {liveValidation.website}
                                </span>
                            ) : (
                                errors.website && <span className="error-text">{errors.website}</span>
                            )}
                        </div>

                        {/* Contact Number */}
                        <div className="form-group">
                            <label htmlFor="contact_number">Contact Number</label>
                            <input
                                type="tel"
                                id="contact_number"
                                name="contact_number"
                                className={`form-input ${errors.contact_number ? 'input-error' : ''}`}
                                placeholder="+94123456789 or 0112345678"
                                value={formData.contact_number}
                                onChange={handleChange}
                                required
                            />
                            {liveValidation.contact ? (
                                <span className={liveValidation.contact.includes('Valid') ? 'success-text' : 'error-text'}>
                                    {liveValidation.contact}
                                </span>
                            ) : (
                                errors.contact_number && <span className="error-text">{errors.contact_number}</span>
                            )}
                        </div>

                        {/* Password */}
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
                                    required
                                />
                                <button
                                    type="button"
                                    className="password-toggle"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? <Eye size={16} /> : <EyeOff size={16} />}
                                </button>
                            </div>
                            {liveValidation.password ? (
                                <span className={liveValidation.password.includes('✅') ? 'success-text' : 'error-text'}>
                                    {liveValidation.password}
                                </span>
                            ) : (
                                errors.password && <span className="error-text">{errors.password}</span>
                            )}
                        </div>

                        {/* Confirm Password */}
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
                                    required
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

                        {/* Submit Button */}
                        <button type="submit" className="auth-submit-btn institute-submit-btn submit-button" disabled={isLoading}>
                            {isLoading ? 'Registering...' : 'Register Institute'}
                        </button>
                    </form>
                </div>
            </motion.div>

            <AccessDeniedModal
                isOpen={showAccessModal}
                onClose={() => setShowAccessModal(false)}
                title="Registration Disabled"
                message="Institute registrations are currently disabled by the administrator. Please contact support if you need assistance."
            />
        </div>
    );
};

export default InstituteRegisterPage;
