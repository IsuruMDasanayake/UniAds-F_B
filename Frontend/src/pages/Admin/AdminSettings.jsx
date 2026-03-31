import React, { useState, useEffect } from 'react';
import { Settings, Save, Upload, Globe, Mail, Phone, Image, Palette, Plus, Trash2, Home, Facebook, Instagram, Linkedin, Twitter, MessageCircle } from 'lucide-react';
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
        subscription_price: 4990,
        about_text: '',
        vision_text: '',
        mission_text: '',
        address_text: '',
        show_testimonials: true,
        show_partners: true,
    });

    const [socialLinks, setSocialLinks] = useState([]);
    const [homeSlides, setHomeSlides] = useState([]); // Local files for new slides
    const [existingSlides, setExistingSlides] = useState([]); // URLs from server
    const [removedSlides, setRemovedSlides] = useState([]); // Paths to remove on server

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
            const settings = response.data.data;

            setFormData({
                site_name: settings.site_name || '',
                tagline: settings.tagline || '',
                timezone: settings.timezone || 'Asia/Colombo',
                contact_email: settings.contact_email || '',
                support_phone: settings.support_phone || '',
                allow_institute_registration: settings.allow_institute_registration ?? true,
                allow_user_registration: settings.allow_user_registration ?? true,
                allow_login: settings.allow_login ?? true,
                subscription_price: settings.subscription_price || 4990,
                about_text: settings.about_text || '',
                vision_text: settings.vision_text || '',
                mission_text: settings.mission_text || '',
                address_text: settings.address_text || '',
                show_testimonials: settings.show_testimonials ?? true,
                show_partners: settings.show_partners ?? true,
            });

            setSocialLinks(settings.social_links || []);
            setExistingSlides(settings.home_slides_urls || []);

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
            setPreviews(prev => ({ ...prev, [type]: URL.createObjectURL(file) }));
        }
    };

    const handleHomeSlidesChange = (e) => {
        const selectedFiles = Array.from(e.target.files);
        setHomeSlides(prev => [...prev, ...selectedFiles]);
    };

    const removeNewSlide = (index) => {
        setHomeSlides(prev => prev.filter((_, i) => i !== index));
    };

    const removeExistingSlide = (url, index) => {
        const pathMatch = url.match(/settings\/slides\/(.+)$/);
        if (pathMatch) {
            setRemovedSlides(prev => [...prev, `settings/slides/${pathMatch[1]}`]);
        }
        setExistingSlides(prev => prev.filter((_, i) => i !== index));
    };

    const handleSocialLinkChange = (index, field, value) => {
        const updatedLinks = [...socialLinks];
        updatedLinks[index][field] = value;
        setSocialLinks(updatedLinks);
    };

    const addSocialLink = () => {
        setSocialLinks([...socialLinks, { platform: 'facebook', url: '' }]);
    };

    const removeSocialLink = (index) => {
        setSocialLinks(socialLinks.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setMessage({ type: '', text: '' });
        setErrors({});

        const data = new FormData();

        // Files
        if (files.logo) data.append('logo', files.logo);
        if (files.favicon) data.append('favicon', files.favicon);

        // New Slides
        homeSlides.forEach((file) => {
            data.append('home_slides[]', file);
        });

        // Removed Slides (JSON)
        data.append('removed_slides', JSON.stringify(removedSlides));

        // Social Links (JSON)
        data.append('social_links', JSON.stringify(socialLinks));

        // Text Fields & Booleans
        Object.keys(formData).forEach(key => {
            data.append(key, formData[key]);
        });

        try {
            const response = await axiosClient.post('/api/admin/settings', data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            setMessage({ type: 'success', text: 'Settings updated successfully!' });

            // Update current images with new URLs
            if (response.data.data) {
                setCurrentImages({
                    logo_url: response.data.data.logo_url,
                    favicon_url: response.data.data.favicon_url,
                });
                // Clear file inputs and previews
                setFiles({ logo: null, favicon: null });
                setPreviews({ logo: null, favicon: null });
            }

            setHomeSlides([]);
            setRemovedSlides([]);
            fetchSettings(); // Refresh to get proper URLs and synced state
        } catch (error) {
            console.error('Error updating settings:', error);
            if (error.response?.data?.errors) {
                const backendErrors = error.response.data.errors;
                setErrors(backendErrors);

                // Detailed error logging for debugging
                console.log('Validation Errors:', backendErrors);

                setMessage({ type: 'error', text: 'Please fix the validation errors' });
            } else {
                setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to update settings' });
            }
        } finally {
            setSaving(false);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    if (loading) {
        return (
            <div className="admin-settings-page admin-dashboard-scope" id="admin-settings-container">
                <div className="admin-loading-container">
                    <div className="loader"></div>
                    <span>Loading settings...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="admin-settings-page admin-dashboard-scope" id="admin-settings-container">
            <div className="page-header mb-8">
                <div className="header-text">
                    <h1 className="text-2xl font-bold">Platform Settings</h1>
                    <p className="text-muted">Manage system-wide configuration and preferences</p>
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
                                {/* <Mail size={18} /> */}
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
                                {/* <Phone size={18} /> */}
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

                        <div className="form-group">
                            <label htmlFor="subscription_price">Monthly Subscription Price (LKR) *</label>
                            <input
                                type="number"
                                id="subscription_price"
                                name="subscription_price"
                                value={formData.subscription_price}
                                onChange={handleInputChange}
                                className={errors.subscription_price ? 'error' : ''}
                                step="0.01"
                                min="0"
                                required
                            />
                            {errors.subscription_price && <span className="error-text">{errors.subscription_price[0]}</span>}
                        </div>

                        <div className="form-group full-width">
                            <label htmlFor="address_text">Platform Address/Location</label>
                            <input
                                type="text"
                                id="address_text"
                                name="address_text"
                                value={formData.address_text}
                                onChange={handleInputChange}
                                placeholder="e.g., Kandy, Sri Lanka"
                            />
                        </div>
                    </div>
                </div>

                {/* HomePage Content Section */}
                <div className="admin-glass-card settings-section">
                    <div className="section-header">
                        <Home size={24} />
                        <h3>HomePage Dynamic Content</h3>
                    </div>

                    <div className="form-grid">
                        <div className="form-group full-width">
                            <label htmlFor="about_text">About UniAds Section</label>
                            <textarea
                                id="about_text"
                                name="about_text"
                                value={formData.about_text}
                                onChange={handleInputChange}
                                rows="4"
                                placeholder="Edit the primary about text..."
                            ></textarea>
                        </div>

                        <div className="form-group full-width">
                            <label htmlFor="vision_text">Our Vision</label>
                            <textarea
                                id="vision_text"
                                name="vision_text"
                                value={formData.vision_text}
                                onChange={handleInputChange}
                                rows="2"
                            ></textarea>
                        </div>

                        <div className="form-group full-width">
                            <label htmlFor="mission_text">Our Mission</label>
                            <textarea
                                id="mission_text"
                                name="mission_text"
                                value={formData.mission_text}
                                onChange={handleInputChange}
                                rows="2"
                            ></textarea>
                        </div>
                    </div>
                </div>

                {/* Home Hero Slides Section */}
                <div className="admin-glass-card settings-section">
                    <div className="section-header">
                        <Image size={24} />
                        <h3>Home Hero Slideshow</h3>
                    </div>

                    <div className="slides-manager">
                        {errors.home_slides && <div className="error-text mb-4">{errors.home_slides[0]}</div>}
                        {Object.keys(errors).some(key => key.startsWith('home_slides.')) && (
                            <div className="error-text mb-4">One or more slides failed validation. Please ensure they are images and under 10MB.</div>
                        )}
                        <div className="slides-grid">
                            {/* Existing Slides */}
                            {existingSlides.map((url, index) => (
                                <div key={`existing-${index}`} className="slide-preview-card">
                                    <img src={url} alt={`Slide ${index}`} />
                                    <button
                                        type="button"
                                        className="remove-slide-btn"
                                        onClick={() => removeExistingSlide(url, index)}
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            ))}

                            {/* New Slides Previews */}
                            {homeSlides.map((file, index) => (
                                <div key={`new-${index}`} className="slide-preview-card new">
                                    <img src={URL.createObjectURL(file)} alt="New slide" />
                                    <button
                                        type="button"
                                        className="remove-slide-btn"
                                        onClick={() => removeNewSlide(index)}
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                    <span className="badge">New</span>
                                </div>
                            ))}

                            {/* Add Button */}
                            <label className="add-slide-card">
                                <input
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    onChange={handleHomeSlidesChange}
                                    style={{ display: 'none' }}
                                />
                                <Plus size={32} />
                                <span>Add Slides</span>
                            </label>
                        </div>
                    </div>
                </div>

                {/* Social Links Section */}
                <div className="admin-glass-card settings-section">
                    <div className="section-header">
                        <Globe size={24} />
                        <h3>Social Media Links</h3>
                    </div>

                    <div className="social-links-manager">
                        {socialLinks.map((link, index) => (
                            <div key={index} className="social-link-row">
                                <select
                                    value={link.platform}
                                    onChange={(e) => handleSocialLinkChange(index, 'platform', e.target.value)}
                                >
                                    <option value="facebook">Facebook</option>
                                    <option value="instagram">Instagram</option>
                                    <option value="linkedin">LinkedIn</option>
                                    <option value="twitter">Twitter / X</option>
                                    <option value="whatsapp">WhatsApp</option>
                                    <option value="youtube">YouTube</option>
                                </select>
                                <input
                                    type="text"
                                    placeholder="Enter profile/link URL"
                                    value={link.url}
                                    onChange={(e) => handleSocialLinkChange(index, 'url', e.target.value)}
                                />
                                <button
                                    type="button"
                                    className="remove-link-btn"
                                    onClick={() => removeSocialLink(index)}
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        ))}
                        <button type="button" className="add-link-btn" onClick={addSocialLink}>
                            <Plus size={18} /> Add New Social Link
                        </button>
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

                        <div className="toggle-item">
                            <div className="toggle-info">
                                <h4>Show Testimonials Section</h4>
                                <p>Display user feedback carousel on the HomePage</p>
                            </div>
                            <label className="toggle-switch">
                                <input
                                    type="checkbox"
                                    name="show_testimonials"
                                    checked={formData.show_testimonials}
                                    onChange={handleInputChange}
                                />
                                <span className="toggle-slider"></span>
                            </label>
                        </div>

                        <div className="toggle-item">
                            <div className="toggle-info">
                                <h4>Show Partners Section</h4>
                                <p>Display the "Our Partners" marquee on the HomePage.</p>
                            </div>
                            <label className="toggle-switch">
                                <input
                                    type="checkbox"
                                    name="show_partners"
                                    checked={formData.show_partners}
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
