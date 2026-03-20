import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { createPortal } from 'react-dom';
import axiosClient from '../../lib/axios';
import { getStorageUrl } from '../../lib/config';
import '../../pages/InstituteProfile/InstituteModals.css';
import { X, Calendar, MapPin, ImageIcon, Loader2 } from 'lucide-react';

const EditEventModal = ({ isOpen, onClose, event, onUpdate }) => {
    const [formData, setFormData] = useState({
        event_title: '',
        event_description: '',
        event_date: '',
        sub_location: '',
        main_location: '',
    });
    const [image, setImage] = useState(null);
    const [previewImage, setPreviewImage] = useState(null);
    const [loading, setLoading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [errorMessages, setErrorMessages] = useState([]);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    useEffect(() => {
        if (event && isOpen) {
            setFormData({
                event_title: event.event_title || event.title || '',
                event_description: event.event_description || event.description || '',
                event_date: event.event_date ? new Date(event.event_date).toISOString().split('T')[0] : '',
                sub_location: event.sub_location || '',
                main_location: event.main_location || event.location || '',
            });
            setPreviewImage(event.event_image ? getStorageUrl(event.event_image) : null);
            setImage(null);
            setErrorMessages([]);
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }
        return () => { document.body.style.overflow = 'auto'; };
    }, [event, isOpen]);

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
        data.append('event_title', formData.event_title);
        data.append('event_description', formData.event_description);
        data.append('event_date', formData.event_date);
        data.append('sub_location', formData.sub_location);
        data.append('main_location', formData.main_location);

        if (image) {
            data.append('event_image', image);
        }

        try {
            setErrorMessages([]);
            setUploadProgress(0);

            // Using the new API route we just added
            // Route: Route::post('/events/{id}/update', [EventController::class, 'apiUpdate']);
            const response = await axiosClient.post(`/api/events/${event.id}/update`, data, {
                headers: { 'Content-Type': 'multipart/form-data' },
                onUploadProgress: (progressEvent) => {
                    const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    setUploadProgress(progress);
                }
            });

            onUpdate(response.data.event);
            onClose();
        } catch (error) {
            console.error("Failed to update event:", error);
            let messages = [];
            if (error.response?.data?.errors) {
                messages = Object.values(error.response.data.errors).flat();
            } else if (error.response?.data?.message) {
                messages = [error.response.data.message];
            } else {
                messages = ["An unexpected error occurred."];
            }
            setErrorMessages(messages);
        } finally {
            setLoading(false);
        }
    };

    if (!mounted || !isOpen) return null;

    return createPortal(
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
                    <h3 className="modal-title">Edit Event</h3>
                </div>

                <form className="modal-form" onSubmit={handleSubmit}>
                    <div className="modal-body">
                        {errorMessages.length > 0 && (
                            <div className="error-summary">
                                {errorMessages.map((msg, idx) => <p key={idx}>{msg}</p>)}
                            </div>
                        )}

                        <div className="form-group">
                            <label>Event Title:</label>
                            <input
                                type="text"
                                name="event_title"
                                value={formData.event_title}
                                onChange={handleChange}
                                placeholder="Enter event title"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Event Image (Max 2MB):</label>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                            />
                            {previewImage && (
                                <div className="photo-preview" style={{ marginTop: '10px' }}>
                                    <img src={previewImage} alt="Event Preview" />
                                </div>
                            )}
                        </div>

                        <div className="input-grid">
                            <div className="form-group">
                                <label>Event Date:</label>
                                <input
                                    type="date"
                                    name="event_date"
                                    value={formData.event_date}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Main Location (City/Area):</label>
                                <input
                                    type="text"
                                    name="main_location"
                                    value={formData.main_location}
                                    onChange={handleChange}
                                    placeholder="e.g. Colombo"
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Location (Sub Location):</label>
                            <textarea
                                name="sub_location"
                                value={formData.sub_location}
                                onChange={handleChange}
                                placeholder="e.g. Building A"
                                required
                            ></textarea>
                        </div>

                        <div className="form-group">
                            <label>Event Description:</label>
                            <textarea
                                name="event_description"
                                value={formData.event_description}
                                onChange={handleChange}
                                rows="4"
                                placeholder="Enter event description"
                                required
                            ></textarea>
                        </div>
                    </div>

                    <div className="modal-footer">
                        {loading && (
                            <div className="upload-progress-container">
                                <div className="progress-bar-bg">
                                    <div className="progress-bar-fill" style={{ width: `${uploadProgress}%` }}></div>
                                </div>
                                <span className="progress-text">{uploadProgress}% Updating...</span>
                            </div>
                        )}
                        <div className="modal-footer-actions">
                            <button type="submit" className="btn btn-primary" disabled={loading}>
                                {loading ? <Loader2 className="animate-spin" size={18} /> : "Save Changes"}
                            </button>
                            <button type="button" className="btn btn-cancel" onClick={onClose} disabled={loading}>
                                Cancel
                            </button>
                        </div>
                    </div>
                </form>
            </motion.div>
        </motion.div>,
        document.body
    );
};

export default EditEventModal;
