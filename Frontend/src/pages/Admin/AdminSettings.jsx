import React, { useState, useEffect } from 'react';
import { Settings, Save, Upload, Globe, Mail, Phone, Image, Palette } from 'lucide-react';
import axiosClient from '../../lib/axios';
import './AdminSettings.css';

const AdminSettings = () => {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [errors, setErrors] = useState({});

    const [formData, setFormData] = useState({
        site_name: '',
        tagline: '',
        timezone: 'Asia/Colombo',
        contact_email: '',
        support_phone: '',
        allow_institute_registration: true,
        allow_user_registration: true,
        allow_login: true,
    });

    const [files, setFiles] = useState({
        logo: null,
        favicon: null,
    });

    const [previews, setPreviews] = useState({
        logo: null,
        favicon: null,
    });

    const [currentImages, setCurrentImages] = useState({
        logo_url: null,
        favicon_url: null,
    });

    const timezones = [
        'Asia/Colombo',
        'Asia/Kolkata',
        'Asia/Dubai',
        'Asia/Singapore',
        'Asia/Tokyo',
        'Europe/London',
        'America/New_York',
        'America/Los_Angeles',
        'Australia/Sydney',
    ];

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const response = await axiosClient.get('/api/admin/settings');
            const settings = response.data;

            setFormData({
                site_name: settings.site_name || '',
                tagline: settings.tagline || '',
                timezone: settings.timezone || 'Asia/Colombo',
                contact_email: settings.contact_email || '',
                support_phone: settings.support_phone || '',
                allow_institute_registration: settings.allow_institute_registration ?? true,
                allow_user_registration: settings.allow_user_registration ?? true,
                allow_login: settings.allow_login ?? true,
            });

            setCurrentImages({
                logo_url: settings.logo_url,
                favicon_url: settings.favicon_url,
            });
        } catch (error) {
            console.error('Error fetching settings:', error);
            setMessage({ type: 'error', text: 'Failed to load settings' });
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
        // Clear error for this field
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    const handleFileChange = (e, type) => {
        const file = e.target.files[0];
        if (file) {
            setFiles(prev => ({ ...prev, [type]: file }));

            // Create preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviews(prev => ({ ...prev, [type]: reader.result }));
            };
            reader.readAsDataURL(file);

            // Clear error for this field
            if (errors[type]) {
                setErrors(prev => ({ ...prev, [type]: null }));
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setMessage({ type: '', text: '' });
        setErrors({});

        try {
            const submitData = new FormData();

            // Append text fields
            Object.keys(formData).forEach(key => {
                submitData.append(key, formData[key]);
            });

            // Append files if selected
            if (files.logo) {
                submitData.append('logo', files.logo);
            }
            if (files.favicon) {
                submitData.append('favicon', files.favicon);
            }

            const response = await axiosClient.post('/api/admin/settings', submitData);

            setMessage({ type: 'success', text: 'Settings updated successfully!' });

            // Update current images with new URLs
            if (response.data.settings) {
                setCurrentImages({
                    logo_url: response.data.settings.logo_url,
                    favicon_url: response.data.settings.favicon_url,
                });
                // Clear file inputs and previews
                setFiles({ logo: null, favicon: null });
                setPreviews({ logo: null, favicon: null });
            }

            // Clear message after 5 seconds
            setTimeout(() => setMessage({ type: '', text: '' }), 5000);
        } catch (error) {
            console.error('Error updating settings:', error);

            if (error.response?.data?.errors) {
                setErrors(error.response.data.errors);
                setMessage({ type: 'error', text: 'Please fix the validation errors' });
            } else {
                setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to update settings' });
            }
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="admin-settings-page admin-dashboard-scope">
                <div className="admin-loading-container">
                    <div className="loader"></div>
                    <span>Loading settings...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="admin-settings-page admin-dashboard-scope">
            <div className="settings-header">
                <div className="header-content">
                    <Settings size={32} />
                    <div>
                        <h2>Platform Settings</h2>
                        <p>Manage system-wide configuration and preferences</p>
                    </div>
                </div>
            </div>

            {message.text && (
                <div className={`alert alert-${message.type}`}>
                    {message.text}
                </div>
            )}

            <form onSubmit={handleSubmit} className="settings-form">
                {/* General Settings Section */}
                <div className="admin-glass-card settings-section">
                    <div className="section-header">
                        <Globe size={24} />
                        <h3>General Settings</h3>
                    </div>

                    <div className="form-grid">
                        <div className="form-group">
                            <label htmlFor="site_name">Site Name *</label>
                            <input
                                type="text"
                                id="site_name"
                                name="site_name"
                                value={formData.site_name}
                                onChange={handleInputChange}
                                className={errors.site_name ? 'error' : ''}
                                required
                            />
                            {errors.site_name && <span className="error-text">{errors.site_name[0]}</span>}
                        </div>

                        <div className="form-group">
                            <label htmlFor="tagline">Tagline</label>
                            <input
                                type="text"
                                id="tagline"
                                name="tagline"
                                value={formData.tagline}
                                onChange={handleInputChange}
                                placeholder="Optional tagline"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="timezone">Timezone *</label>
                            <select
                                id="timezone"
                                name="timezone"
                                value={formData.timezone}
                                onChange={handleInputChange}
                                required
                            >
                                {timezones.map(tz => (
                                    <option key={tz} value={tz}>{tz}</option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label htmlFor="contact_email">Contact Email *</label>
                            <div className="input-with-icon">
                                <Mail size={18} />
                                <input
                                    type="email"
                                    id="contact_email"
                                    name="contact_email"
                                    value={formData.contact_email}
                                    onChange={handleInputChange}
                                    className={errors.contact_email ? 'error' : ''}
                                    required
                                />
                            </div>
                            {errors.contact_email && <span className="error-text">{errors.contact_email[0]}</span>}
                        </div>

                        <div className="form-group">
                            <label htmlFor="support_phone">Support Phone *</label>
                            <div className="input-with-icon">
                                <Phone size={18} />
                                <input
                                    type="text"
                                    id="support_phone"
                                    name="support_phone"
                                    value={formData.support_phone}
                                    onChange={handleInputChange}
                                    className={errors.support_phone ? 'error' : ''}
                                    required
                                />
                            </div>
                            {errors.support_phone && <span className="error-text">{errors.support_phone[0]}</span>}
                        </div>
                    </div>
                </div>

                {/* Branding Assets Section */}
                <div className="admin-glass-card settings-section">
                    <div className="section-header">
                        <Palette size={24} />
                        <h3>Branding Assets</h3>
                    </div>

                    <div className="branding-grid">
                        <div className="upload-group">
                            <label>Logo (Max 4MB)</label>
                            <div className="upload-area">
                                {(previews.logo || currentImages.logo_url) && (
                                    <div className="image-preview">
                                        <img
                                            src={previews.logo || currentImages.logo_url}
                                            alt="Logo preview"
                                        />
                                    </div>
                                )}
                                <label htmlFor="logo" className="upload-button">
                                    <Upload size={20} />
                                    <span>{files.logo ? 'Change Logo' : 'Upload Logo'}</span>
                                </label>
                                <input
                                    type="file"
                                    id="logo"
                                    accept="image/*"
                                    onChange={(e) => handleFileChange(e, 'logo')}
                                    style={{ display: 'none' }}
                                />
                            </div>
                            {errors.logo && <span className="error-text">{errors.logo[0]}</span>}
                        </div>

                        <div className="upload-group">
                            <label>Favicon (Max 1MB)</label>
                            <div className="upload-area">
                                {(previews.favicon || currentImages.favicon_url) && (
                                    <div className="image-preview favicon-preview">
                                        <img
                                            src={previews.favicon || currentImages.favicon_url}
                                            alt="Favicon preview"
                                        />
                                    </div>
                                )}
                                <label htmlFor="favicon" className="upload-button">
                                    <Image size={20} />
                                    <span>{files.favicon ? 'Change Favicon' : 'Upload Favicon'}</span>
                                </label>
                                <input
                                    type="file"
                                    id="favicon"
                                    accept="image/*,.ico,image/x-icon"
                                    onChange={(e) => handleFileChange(e, 'favicon')}
                                    style={{ display: 'none' }}
                                />
                            </div>
                            {errors.favicon && <span className="error-text">{errors.favicon[0]}</span>}
                        </div>
                    </div>
                </div>

                {/* Platform Behavior Section */}
                <div className="admin-glass-card settings-section">
                    <div className="section-header">
                        <Settings size={24} />
                        <h3>Platform Behavior</h3>
                    </div>

                    <div className="toggles-grid">
                        <div className="toggle-item">
                            <div className="toggle-info">
                                <h4>Allow Institute Registration</h4>
                                <p>Enable new institutes to register on the platform</p>
                            </div>
                            <label className="toggle-switch">
                                <input
                                    type="checkbox"
                                    name="allow_institute_registration"
                                    checked={formData.allow_institute_registration}
                                    onChange={handleInputChange}
                                />
                                <span className="toggle-slider"></span>
                            </label>
                        </div>

                        <div className="toggle-item">
                            <div className="toggle-info">
                                <h4>Allow User Registration</h4>
                                <p>Enable new users to register on the platform</p>
                            </div>
                            <label className="toggle-switch">
                                <input
                                    type="checkbox"
                                    name="allow_user_registration"
                                    checked={formData.allow_user_registration}
                                    onChange={handleInputChange}
                                />
                                <span className="toggle-slider"></span>
                            </label>
                        </div>

                        <div className="toggle-item">
                            <div className="toggle-info">
                                <h4>Allow Login</h4>
                                <p>Enable or disable login for all users</p>
                            </div>
                            <label className="toggle-switch">
                                <input
                                    type="checkbox"
                                    name="allow_login"
                                    checked={formData.allow_login}
                                    onChange={handleInputChange}
                                />
                                <span className="toggle-slider"></span>
                            </label>
                        </div>
                    </div>
                </div>

                {/* Submit Button */}
                <div className="form-actions">
                    <button type="submit" className="save-button" disabled={saving}>
                        <Save size={20} />
                        <span>{saving ? 'Saving...' : 'Save Settings'}</span>
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AdminSettings;
