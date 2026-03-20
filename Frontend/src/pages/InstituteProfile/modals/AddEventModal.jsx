
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Loader2 } from 'lucide-react';
import axiosClient from '../../../lib/axios';
import '../InstituteModals.css';

const AddEventModal = ({ institute, onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        event_title: '',
        event_description: '',
        event_date: '',
        sub_location: '',
        main_location: ''
    });
    const [image, setImage] = useState(null);
    const [previewImage, setPreviewImage] = useState(null);
    const [loading, setLoading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [errorMessages, setErrorMessages] = useState([]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) {
                setErrorMessages(['Image size exceeds 2MB. Please choose a smaller file.']);
                e.target.value = '';
                return;
            }
            setErrorMessages([]);
            setImage(file);
            const reader = new FileReader();
            reader.onloadend = () => setPreviewImage(reader.result);
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const data = new FormData();
        Object.keys(formData).forEach(key => data.append(key, formData[key]));
        if (image) data.append('event_image', image);

        try {
            setErrorMessages([]);
            setUploadProgress(0);

            await axiosClient.post(`/api/institutes/${institute.id}/events`, data, {
                headers: { 'Content-Type': 'multipart/form-data' },
                onUploadProgress: (progressEvent) => {
                    const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    setUploadProgress(progress);
                }
            });
            onSuccess();
            onClose();
        } catch (error) {
            console.error("DEBUG: Full Event Creation Error:", error);
            let messages = [];
            if (error.response?.data?.errors) {
                messages = Object.values(error.response.data.errors).flat();
            } else if (error.response?.data?.error) {
                messages = [error.response.data.error];
            } else if (error.response?.data?.message) {
                messages = [error.response.data.message];
            } else {
                messages = [error.message || "An unexpected error occurred."];
            }
            setErrorMessages(messages);
        } finally {
            setLoading(false);
        }
    };

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
                    <h3 className="modal-title">Add Upcoming Event</h3>
                </div>

                <form onSubmit={handleSubmit} className="modal-form">
                    <div className="modal-body">
                        {errorMessages.length > 0 && (
                            <div className="error-summary">
                                {errorMessages.map((msg, idx) => <p key={idx}>{msg}</p>)}
                            </div>
                        )}

                        <div className="input-grid">
                            <div className="form-group">
                                <label>Event Title:</label>
                                <input type="text" name="event_title" placeholder="Enter event title" value={formData.event_title} onChange={handleChange} required />
                            </div>

                            <div className="form-group">
                                <label>Event Date:</label>
                                <input type="date" name="event_date" value={formData.event_date} onChange={handleChange} required />
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Event Image (Max 2MB):</label>
                            <input type="file" accept="image/*" onChange={handleImageChange} required />
                            {previewImage && (
                                <div className="photo-preview" style={{ marginTop: '10px' }}>
                                    <img src={previewImage} alt="Preview" />
                                </div>
                            )}
                        </div>

                        <div className="form-group">
                            <label>Event Description:</label>
                            <textarea name="event_description" placeholder="Enter event description" value={formData.event_description} onChange={handleChange} required></textarea>
                        </div>

                        
                            <div className="form-group">
                                <label>Main Location (City/Area):</label>
                                <input type="text" name="main_location" placeholder="Enter main location (e.g. Colombo)" value={formData.main_location} onChange={handleChange} required />
                            </div>
                            <div className="form-group">
                                <label>Location (Sub Location):</label>
                                <input type="text" name="sub_location" placeholder="Enter location details (e.g. Building A)" value={formData.sub_location} onChange={handleChange} required />
                            </div>
                        
                    </div>

                    <div className="modal-footer">
                        {loading && (
                            <div className="upload-progress-container">
                                <div className="progress-bar-bg">
                                    <div className="progress-bar-fill" style={{ width: `${uploadProgress}%` }}></div>
                                </div>
                                <span className="progress-text">{uploadProgress}% Uploading...</span>
                            </div>
                        )}
                        <div className="modal-footer-actions">
                            <button type="submit" className="btn btn-primary" disabled={loading}>
                                {loading ? <Loader2 className="animate-spin" size={18} /> : "Add Event"}
                            </button>
                            <button type="button" className="btn btn-cancel" onClick={onClose}>Cancel</button>
                        </div>
                    </div>
                </form>
            </motion.div>
        </motion.div>
    );
};

export default AddEventModal;
