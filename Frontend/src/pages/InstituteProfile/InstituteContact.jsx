import React, { useState } from 'react';
import axiosClient from '../../lib/axios';
import './InstituteContact.css';

const InstituteContact = ({ institute, isOwner }) => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });
    const [status, setStatus] = useState('idle'); // idle, sending, success, error

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus('sending');
        try {
            await axiosClient.post(`/api/institutions/${institute.id}/contact`, formData);
            setStatus('success');
            setFormData({ name: '', email: '', subject: '', message: '' });
            setTimeout(() => setStatus('idle'), 5000);
        } catch (error) {
            console.error('Error sending message:', error);
            setStatus('error');
            setTimeout(() => setStatus('idle'), 5000);
        }
    };

    // Use exact latitude/longitude if available, otherwise fallback to address string
    const mapSrc = institute.latitude && institute.longitude
        ? `https://www.google.com/maps?q=${institute.latitude},${institute.longitude}&z=15&output=embed`
        : `https://www.google.com/maps?q=${encodeURIComponent(institute.location || '')}&z=15&output=embed`;

    return (
        <div className="ic-page-container">
            <div className="ic-info-header">
                <div className="ic-header-content">
                    <h2 className="ic-title">Contact Us</h2>
                    <p className="ic-bio">{institute.bio}</p>
                </div>

                <div className="ic-details-row">
                    <div className="ic-compact-detail-item">
                        <span className="ic-detail-icon">📍</span>
                        <div className="ic-detail-info">
                            <span className="ic-detail-label">Address</span>
                            <span className="ic-detail-value">{institute.location}</span>
                        </div>
                    </div>
                    <div className="ic-compact-detail-item">
                        <span className="ic-detail-icon">📞</span>
                        <div className="ic-detail-info">
                            <span className="ic-detail-label">Phone</span>
                            <span className="ic-detail-value">{institute.contact_number}</span>
                        </div>
                    </div>
                    <div className="ic-compact-detail-item">
                        <span className="ic-detail-icon">🌐</span>
                        <div className="ic-detail-info">
                            <span className="ic-detail-label">Website</span>
                            <span className="ic-detail-value">
                                {institute.website ? (
                                    <a href={institute.website.startsWith('http') ? institute.website : `https://${institute.website}`} target="_blank" rel="noopener noreferrer">
                                        {institute.website.replace(/^https?:\/\//, '')}
                                    </a>
                                ) : (
                                    'Not Available'
                                )}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="ic-main-grid">
                {/* Left Side: Map (1/3) */}
                <div className="ic-map-wrapper">
                    <iframe
                        width="100%"
                        height="100%"
                        frameBorder="0"
                        src={mapSrc}
                        allowFullScreen
                        title="Institute Location"
                        className="ic-map-iframe"
                    ></iframe>
                </div>

                {/* Right Side: Message Form (2/3) */}
                <div className="ic-form-wrapper">
                    {isOwner ? (
                        <div className="ic-form-card ic-owner-preview-card">
                            <div className="ic-owner-preview-content">
                                <div className="ic-preview-icon">🏠</div>
                                <h3 className="ic-form-title">Contact Form Preview</h3>
                                <p className="ic-preview-text">
                                    This is how your contact form appears to students and visitors.
                                    As the owner, you cannot send messages to yourself.
                                </p>
                                <div className="ic-preview-form-skeleton">
                                    <div className="ic-skeleton-row">
                                        <div className="ic-skeleton-item"></div>
                                        <div className="ic-skeleton-item"></div>
                                    </div>
                                    <div className="ic-skeleton-item ic-full"></div>
                                    <div className="ic-skeleton-item ic-area"></div>
                                    <div className="ic-skeleton-button"></div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="ic-form-card">
                            <h3 className="ic-form-title">Send Us a Message</h3>
                            {Number(institute.inquiries_enabled) === 0 ? (
                                <div className="ic-disabled-message">
                                    <div className="ic-disabled-icon">🔒</div>
                                    <p>General inquiries are currently disabled for this institute.</p>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className="ic-contact-form">
                                    <div className="ic-form-row">
                                        <div className="ic-form-group">
                                            <label className="ic-form-label">Full Name</label>
                                            <input
                                                type="text"
                                                name="name"
                                                value={formData.name}
                                                onChange={handleChange}
                                                required
                                                className="ic-form-input"
                                                placeholder="Your Full Name"
                                            />
                                        </div>
                                        <div className="ic-form-group">
                                            <label className="ic-form-label">Email</label>
                                            <input
                                                type="email"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleChange}
                                                required
                                                className="ic-form-input"
                                                placeholder="your.email@example.com"
                                            />
                                        </div>
                                    </div>
                                    <div className="ic-form-group">
                                        <label className="ic-form-label">Subject</label>
                                        <input
                                            type="text"
                                            name="subject"
                                            value={formData.subject}
                                            onChange={handleChange}
                                            required
                                            className="ic-form-input"
                                            placeholder="What is this about?"
                                        />
                                    </div>
                                    <div className="ic-form-group">
                                        <label className="ic-form-label">Message</label>
                                        <textarea
                                            name="message"
                                            value={formData.message}
                                            onChange={handleChange}
                                            required
                                            rows={6}
                                            className="ic-form-textarea"
                                            placeholder="Write your message here..."
                                        ></textarea>
                                    </div>

                                    {status === 'success' && (
                                        <div className="ic-status-message ic-status-success">
                                            ✓ Message sent successfully!
                                        </div>
                                    )}
                                    {status === 'error' && (
                                        <div className="ic-status-message ic-status-error">
                                            ✗ Failed to send message. Please try again.
                                        </div>
                                    )}

                                    <button
                                        type="submit"
                                        disabled={status === 'sending'}
                                        className="ic-submit-button"
                                    >
                                        {status === 'sending' ? 'Sending...' : 'Send Message'}
                                    </button>
                                </form>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default InstituteContact;
