import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axiosClient from '../../lib/axios';
import { X, Loader2 } from 'lucide-react';
import { getStorageUrl } from '../../lib/config';
import '../../pages/InstituteProfile/InstituteModals.css';

const EditPostModal = ({ isOpen, onClose, post, onUpdate }) => {
    const [categories, setCategories] = useState([]);
    const [formData, setFormData] = useState({
        title: '',
        small_description: '',
        description: '',
        course_name: '',
        course_type: '',
        duration: '',
        course_format: '',
        attendance_type: '',
        locations: []
    });
    const [image, setImage] = useState(null);
    const [previewImage, setPreviewImage] = useState(null);
    const [loading, setLoading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [errorMessages, setErrorMessages] = useState([]);
    const [courseSearch, setCourseSearch] = useState('');
    const [showCourseDropdown, setShowCourseDropdown] = useState(false);
    const [showLocationDropdown, setShowLocationDropdown] = useState(false);

    // Fetch categories on mount
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await axiosClient.get('/api/categories');
                const categoryData = res.data;
                const flatCategories = Object.values(categoryData).flat();
                setCategories(flatCategories);
            } catch (error) {
                console.error("Failed to fetch categories", error);
                setCategories([]);
            }
        };
        fetchCategories();
    }, []);

    // Sync with post data
    useEffect(() => {
        if (post && isOpen) {
            setFormData({
                title: post.title || '',
                small_description: post.small_description || '',
                description: post.description || '',
                course_name: post.course_name || '',
                course_type: post.course_type || '',
                duration: post.duration || '',
                course_format: post.course_format || '',
                attendance_type: post.attendance_type || '',
                // If post.location is a string "A, B", convert to ["A", "B"]
                locations: post.location ? post.location.split(', ').filter(Boolean) : []
            });
            setCourseSearch(post.course_name || '');
            setPreviewImage(getStorageUrl(post.image));
            setErrorMessages([]);
        }
    }, [post, isOpen]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) {
                alert('File size exceeds 2MB limit.');
                return;
            }
            setImage(file);
            const reader = new FileReader();
            reader.onloadend = () => setPreviewImage(reader.result);
            reader.readAsDataURL(file);
        }
    };

    const handleLocationToggle = (locName) => {
        setFormData(prev => {
            const current = prev.locations;
            if (current.includes(locName)) {
                return { ...prev, locations: current.filter(l => l !== locName) };
            } else {
                return { ...prev, locations: [...current, locName] };
            }
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const data = new FormData();
        data.append('title', formData.title);
        data.append('small_description', formData.small_description);
        data.append('description', formData.description);
        data.append('course_name', formData.course_name);
        data.append('course_type', formData.course_type);
        data.append('duration', formData.duration);
        data.append('course_format', formData.course_format);
        data.append('attendance_type', formData.attendance_type);

        // Handle array for locations
        formData.locations.forEach(loc => data.append('location[]', loc));

        // Note: For updates with FormData in PHP/Laravel, sometimes we need _method=POST or just POST depending on route.
        // Our route is Route::post('/posts/{id}/update', ...) so POST is fine.
        if (image) data.append('image', image);

        try {
            setErrorMessages([]);
            setUploadProgress(0);

            const response = await axiosClient.post(`/api/posts/${post.id}/update`, data, {
                headers: { 'Content-Type': 'multipart/form-data' },
                onUploadProgress: (progressEvent) => {
                    const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    setUploadProgress(progress);
                }
            });
            onUpdate(response.data.post);
            onClose();
        } catch (error) {
            console.error("Failed to update post:", error);
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

    if (!isOpen) return null;

    const filteredCourses = (Array.isArray(categories) ? categories : []).filter(c =>
        c.main_category === 'Courses' &&
        c.name.toLowerCase().includes(courseSearch.toLowerCase())
    );

    return (
        <motion.div
            className="modal-overlay"
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
                    <h3 className="modal-title">Edit Post</h3>
                </div>

                <form onSubmit={handleSubmit} className="modal-form">
                    <div className="modal-body">
                        {errorMessages.length > 0 && (
                            <div className="error-summary">
                                {errorMessages.map((msg, idx) => <p key={idx}>{msg}</p>)}
                            </div>
                        )}

                        <div className="form-group">
                            <label>Post Title:</label>
                            <input type="text" name="title" placeholder="Enter title" value={formData.title} onChange={handleChange} required />
                        </div>

                        <div className="form-group">
                            <label>Image (1:1 Recommend, Max 2MB):</label>
                            <input type="file" accept="image/*" onChange={handleImageChange} />
                            <p style={{ fontSize: '0.8rem', color: '#666', marginTop: '4px' }}>Leave empty to keep existing image</p>
                            {previewImage && (
                                <div className="photo-preview" style={{ marginTop: '10px' }}>
                                    <img src={previewImage} alt="Preview" />
                                </div>
                            )}
                        </div>

                        <div className="form-group">
                            <label>Small Description (Max 200 chars):</label>
                            <textarea
                                name="small_description"
                                placeholder="Enter small description"
                                maxLength="200"
                                value={formData.small_description}
                                onChange={handleChange}
                                required
                            ></textarea>
                            <div id="characterCount">{200 - formData.small_description.length} characters remaining</div>
                        </div>

                        <div className="form-group">
                            <label>Description:</label>
                            <textarea name="description" placeholder="Enter full description" value={formData.description} onChange={handleChange} required />
                        </div>

                        {/* Course Name Search */}
                        <div className="form-group">
                            <label>Course Name / Category:</label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    type="text"
                                    placeholder="Type to search..."
                                    value={courseSearch}
                                    onChange={(e) => { setCourseSearch(e.target.value); setShowCourseDropdown(true); }}
                                    onFocus={() => setShowCourseDropdown(true)}
                                    onBlur={() => setTimeout(() => setShowCourseDropdown(false), 200)}
                                />
                                {showCourseDropdown && filteredCourses.length > 0 && (
                                    <ul className="dropdown-list">
                                        {filteredCourses.map(c => (
                                            <li key={c.id} onClick={() => {
                                                setCourseSearch(c.name);
                                                setFormData(prev => ({ ...prev, course_name: c.name }));
                                                setShowCourseDropdown(false);
                                            }}>
                                                {c.name}
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        </div>

                        {/* Dropdowns */}
                        <div className="input-grid">
                            <div className="form-group">
                                <label>Course Type:</label>
                                <select name="course_type" value={formData.course_type} onChange={handleChange} required>
                                    <option value="" disabled>Select Course Type</option>
                                    {categories.filter(c => c.main_category === 'Course Type').map(c => (
                                        <option key={c.id} value={c.name}>{c.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Duration:</label>
                                <select name="duration" value={formData.duration} onChange={handleChange} required>
                                    <option value="" disabled>Select Duration</option>
                                    {categories.filter(c => c.main_category === 'Duration').map(c => (
                                        <option key={c.id} value={c.name}>{c.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Location(s):</label>
                            <div className="dropdown-multiselect">
                                <div className="dropdown-selected" onClick={() => setShowLocationDropdown(!showLocationDropdown)}>
                                    {formData.locations.length > 0 ? formData.locations.join(', ') : 'Select Location(s)'}
                                </div>
                                {showLocationDropdown && (
                                    <div className="dropdown-options" style={{ position: 'static', border: '1px solid #ccc', marginTop: '5px' }}>
                                        {categories.filter(c => c.main_category === 'Location').map(c => (
                                            <label key={c.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '5px' }}>
                                                <input
                                                    type="checkbox"
                                                    checked={formData.locations.includes(c.name)}
                                                    onChange={() => handleLocationToggle(c.name)}
                                                />
                                                {c.name}
                                            </label>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="input-grid">
                            <div className="form-group">
                                <label>Course Format:</label>
                                <select name="course_format" value={formData.course_format} onChange={handleChange} required>
                                    <option value="" disabled>Select Course Format</option>
                                    {categories.filter(c => c.main_category === 'Course Format').map(c => (
                                        <option key={c.id} value={c.name}>{c.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Attendance Type:</label>
                                <select name="attendance_type" value={formData.attendance_type} onChange={handleChange} required>
                                    <option value="" disabled>Select Attendance Type</option>
                                    {categories.filter(c => c.main_category === 'Attendance Type').map(c => (
                                        <option key={c.id} value={c.name}>{c.name}</option>
                                    ))}
                                </select>
                            </div>
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
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? "Updating..." : "Save Changes"}
                        </button>
                        <button type="button" className="btn btn-cancel" onClick={onClose}>Cancel</button>
                    </div>
                </form>
            </motion.div>
        </motion.div>
    );
};

export default EditPostModal;
