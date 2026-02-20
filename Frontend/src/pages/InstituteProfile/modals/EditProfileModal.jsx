
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Loader2 } from 'lucide-react';
import axiosClient from '../../../lib/axios';
import '../InstituteModals.css';

const EditProfileModal = ({ institute, onClose, onUpdate }) => {
    const [formData, setFormData] = useState({
        institute_name: '',
        institute_type: '',
        location: '',
        email: '',
        contact_number: '',
        website: '',
        bio: '',
        followers_enabled: false,
        reviews_enabled: false
    });
    const [profilePhoto, setProfilePhoto] = useState(null);
    const [coverPhoto, setCoverPhoto] = useState(null);
    const [previewProfile, setPreviewProfile] = useState(null);
    const [previewCover, setPreviewCover] = useState(null);
    const [loading, setLoading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [errorMessages, setErrorMessages] = useState([]);
    const [successMessage, setSuccessMessage] = useState('');

    useEffect(() => {
        if (institute) {
            setFormData({
                institute_name: institute.institute_name || '',
                institute_type: institute.institute_type || '',
                location: institute.location || '',
                email: institute.email || '',
                contact_number: institute.contact_number || '',
                website: institute.website || '',
                bio: institute.bio || '',
                followers_enabled: !!institute.followers_enabled,
                reviews_enabled: !!institute.reviews_enabled
            });
            setPreviewProfile(institute.profile_photo ? `http://localhost:8000/storage/${institute.profile_photo}` : '/images/profile.png');
            setPreviewCover(institute.cover_photo ? `http://localhost:8000/storage/${institute.cover_photo}` : '/images/cover.png');
        }
    }, [institute]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
        // Clear success message when user starts editing again
        if (successMessage) setSuccessMessage('');
    };

    const handleFileChange = (e, type) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) {
                setErrorMessages(['File size exceeds 2MB limit.']);
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                if (type === 'profile') {
                    setProfilePhoto(file);
                    setPreviewProfile(reader.result);
                } else {
                    setCoverPhoto(file);
                    setPreviewCover(reader.result);
                }
            };
            reader.readAsDataURL(file);
            if (successMessage) setSuccessMessage('');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrorMessages([]);
        setSuccessMessage('');

        const data = new FormData();
        // Append text fields
        Object.keys(formData).forEach(key => {
            if (typeof formData[key] === 'boolean') {
                data.append(key, formData[key] ? '1' : '0');
            } else {
                data.append(key, formData[key] || '');
            }
        });

        if (profilePhoto) data.append('profile_photo', profilePhoto);
        if (coverPhoto) data.append('cover_photo', coverPhoto);

        try {
            setUploadProgress(0);

            const response = await axiosClient.post(`/api/institutions/${institute.id}/update`, data, {
                headers: { 'Content-Type': 'multipart/form-data' },
                onUploadProgress: (progressEvent) => {
                    const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    setUploadProgress(progress);
                }
            });

            if (response.status === 200) {
                setSuccessMessage("");
                // Wait a bit to show success before updating parent and closing
                setTimeout(() => {
                    onUpdate(response.data.institute);
                    onClose();
                }, 1500);
            }
        } catch (error) {
            console.error("DEBUG: Update failed", error);
            let messages = [];
            if (error.response?.data?.errors) {
                messages = Object.values(error.response.data.errors).flat();
            } else if (error.response?.data?.error) {
                messages = [error.response.data.error];
            } else if (error.response?.data?.message) {
                messages = [error.response.data.message];
            } else {
                messages = [error.message || "An unexpected error occurred during profile update."];
            }
            setErrorMessages(messages);
        } finally {
            setLoading(false);
        }
    };

    const isPremium = !!(institute?.is_premium && institute?.premium_expires_at && new Date(institute.premium_expires_at) > new Date());

    return (
        <motion.div
            className="institute-modal-overlay"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
        >
            <motion.div
                className="modal-content"
                onClick={e => e.stopPropagation()}
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
            >
                <button className="modal-close-trigger" onClick={onClose}><X size={24} /></button>

                <div className="modal-header">
                    <h3 className="modal-title">Edit Institute Profile</h3>
                </div>

                <form onSubmit={handleSubmit} className="modal-form">
                    <div className="modal-body">
                        {errorMessages.length > 0 && (
                            <div className="error-summary">
                                {errorMessages.map((msg, idx) => <p key={idx}>{msg}</p>)}
                            </div>
                        )}

                        {successMessage && (
                            <div className="success-summary">
                                <p>{successMessage}</p>
                            </div>
                        )}

                        <div className="modal-body-split">
                            {/* Left: Photos */}
                            <div className="modal-left">
                                <div className="form-group">
                                    <label>Profile Photo (Max 2MB):</label>
                                    <div className="photo-preview">
                                        <img src={previewProfile} alt="Profile" />
                                    </div>
                                    <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'profile')} />
                                </div>
                                <div className="form-group">
                                    <label>Cover Photo (Max 2MB):</label>
                                    <div className="photo-preview">
                                        <img src={previewCover} alt="Cover" />
                                    </div>
                                    <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'cover')} />
                                </div>
                            </div>

                            {/* Right: Details */}
                            <div className="modal-right">
                                <div className="form-group">
                                    <label>Institute Name:</label>
                                    <input type="text" name="institute_name" value={formData.institute_name} onChange={handleChange} required />
                                </div>
                                <div className="form-group">
                                    <label>Institute Type:</label>
                                    <select name="institute_type" value={formData.institute_type} onChange={handleChange} required className="modal-select">
                                        <option value="">Select Type</option>
                                        <option value="University">University</option>
                                        <option value="Higher Education Institute">Higher Education Institute</option>
                                        <option value="College">College</option>
                                        <option value="Institute">Institute</option>
                                        <option value="Training Center">Training Center</option>
                                        <option value="Vocational Training Center">Vocational Training Center</option>
                                        <option value="Technical Institute">Technical Institute</option>
                                        <option value="Professional Institute">Professional Institute</option>
                                        <option value="Academy">Academy</option>
                                        <option value="Government Institute">Government Institute</option>
                                        <option value="International Institute">International Institute</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Location:</label>
                                    <input type="text" name="location" value={formData.location} onChange={handleChange} required />
                                </div>
                                <div className="form-group">
                                    <label>Email:</label>
                                    <input type="email" name="email" value={formData.email} onChange={handleChange} required />
                                </div>
                                <div className="form-group">
                                    <label>Contact Number:</label>
                                    <input type="text" name="contact_number" value={formData.contact_number} onChange={handleChange} required />
                                </div>
                                <div className="form-group">
                                    <label>Website:</label>
                                    <input type="text" name="website" value={formData.website} onChange={handleChange} />
                                </div>
                                <div className="form-group">
                                    <label>Bio:</label>
                                    <textarea name="bio" rows="3" value={formData.bio} onChange={handleChange}></textarea>
                                </div>

                                {isPremium && (
                                    <div className="toggles-column">
                                        <div className="toggle-switch-row">
                                            <label>Enable Followers:</label>
                                            <label className="switch">
                                                <input
                                                    type="checkbox"
                                                    name="followers_enabled"
                                                    checked={formData.followers_enabled}
                                                    onChange={handleChange}
                                                />
                                                <span className="slider round"></span>
                                            </label>
                                        </div>
                                        <div className="toggle-switch-row">
                                            <label>Enable Reviews:</label>
                                            <label className="switch">
                                                <input
                                                    type="checkbox"
                                                    name="reviews_enabled"
                                                    checked={formData.reviews_enabled}
                                                    onChange={handleChange}
                                                />
                                                <span className="slider round"></span>
                                            </label>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="modal-footer">
                        {loading && (
                            <div className="upload-progress-container">
                                <div className="progress-bar-bg">
                                    <div className="progress-bar-fill" style={{ width: `${uploadProgress}%` }}></div>
                                </div>
                                <span className="progress-text">{uploadProgress}% Updating Profile...</span>
                            </div>
                        )}
                        <div className="modal-footer-actions">
                            <button type="submit" className="btn btn-primary" disabled={loading}>
                                {loading ? <Loader2 className="animate-spin" size={18} /> : 'Save Changes'}
                            </button>
                            <button type="button" className="btn btn-cancel" onClick={onClose} disabled={loading}>
                                Cancel
                            </button>
                        </div>
                    </div>
                </form>
            </motion.div>
        </motion.div>
    );
};

export default EditProfileModal;
