import React, { useState } from 'react';
import axiosClient from '../../lib/axios';
import './InstituteContact.css';

const InstituteContact = ({ institute }) => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });
    const [status, setStatus] = useState('');

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
            setTimeout(() => setStatus(''), 5000);
        } catch (error) {
            console.error(error);
            setStatus('error');
            setTimeout(() => setStatus(''), 5000);
        }
    };

    return (
        <div className="contact-page-container">
            <div className="contact-card-wrapper">
                {/* Left Side: Contact Info */}
                <div className="contact-info-section">
                    <h2 className="contact-info-title">Contact Us</h2>
                    <p className="contact-info-bio">{institute.bio}</p>

                    <div className="contact-details-list">
                        <div className="contact-detail-item">
                            <span className="contact-detail-icon">📍</span>
                            <div className="contact-detail-content">
                                <strong className="contact-detail-label">Address</strong>
                                <span className="contact-detail-value">{institute.location}</span>
                            </div>
                        </div>
                        <div className="contact-detail-item">
                            <span className="contact-detail-icon">📞</span>
                            <div className="contact-detail-content">
                                <strong className="contact-detail-label">Phone</strong>
                                <span className="contact-detail-value">{institute.contact_number}</span>
                            </div>
                        </div>
                        <div className="contact-detail-item">
                            <span className="contact-detail-icon">✉️</span>
                            <div className="contact-detail-content">
                                <strong className="contact-detail-label">Email</strong>
                                <span className="contact-detail-value">
                                    <a href={`mailto:${institute.email}`}>{institute.email}</a>
                                </span>
                            </div>
                        </div>
                        <div className="contact-detail-item">
                            <span className="contact-detail-icon">🌐</span>
                            <div className="contact-detail-content">
                                <strong className="contact-detail-label">Website</strong>
                                <span className="contact-detail-value">
                                    <a href={institute.website} target="_blank" rel="noopener noreferrer">{institute.website}</a>
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Simple Map Embed */}
                    <div className="contact-map-container">
                        <iframe
                            width="100%"
                            height="100%"
                            frameBorder="0"
                            src={`https://www.google.com/maps?q=${encodeURIComponent(institute.location)}&output=embed`}
                            allowFullScreen
                            title="Institute Location"
                        ></iframe>
                    </div>
                </div>

                {/* Right Side: Message Form */}
                <div className="contact-form-section">
                    <h3 className="contact-form-title">Send Us a Message</h3>
                    <form onSubmit={handleSubmit} className="contact-form">
                        <div className="form-row">
                            <div className="form-group">
                                <label className="form-label">Full Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    className="form-input"
                                    placeholder="Your Full Name"
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    className="form-input"
                                    placeholder="your.email@example.com"
                                />
                            </div>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Subject</label>
                            <input
                                type="text"
                                name="subject"
                                value={formData.subject}
                                onChange={handleChange}
                                required
                                className="form-input"
                                placeholder="What is this about?"
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Message</label>
                            <textarea
                                name="message"
                                value={formData.message}
                                onChange={handleChange}
                                required
                                rows={10}
                                className="form-textarea"
                                placeholder="Write your message here..."
                            ></textarea>
                        </div>

                        {status === 'success' && (
                            <div className="status-message status-success">
                                ✓ Message sent successfully!
                            </div>
                        )}
                        {status === 'error' && (
                            <div className="status-message status-error">
                                ✗ Failed to send message. Please try again.
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={status === 'sending'}
                            className="submit-button"
                        >
                            {status === 'sending' ? 'Sending...' : 'Send Message'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default InstituteContact;
