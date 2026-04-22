import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, Loader2, Save, AlertCircle, CheckCircle2 } from 'lucide-react';
import axiosClient from '../../lib/axios';
import { getStorageUrl } from '../../lib/config';
import { decodeHTMLEntities } from '../../lib/utils';
import './UpdateInfoModal.css';

const UpdateInfoModal = ({ isOpen, onClose, instituteId, initialData, onSuccess }) => {
    const [formData, setFormData] = useState({});
    const [loading, setLoading] = useState(false);
    const [removedImages, setRemovedImages] = useState({});
    const [status, setStatus] = useState({ type: '', message: '' });
    const [uploadProgress, setUploadProgress] = useState(0);
    const [fileErrors, setFileErrors] = useState({});

    const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB

    // Initialize with data
    useEffect(() => {
        if (isOpen && initialData) {
            const decodedData = Object.keys(initialData).reduce((acc, key) => {
                const value = initialData[key];
                acc[key] = typeof value === 'string' ? decodeHTMLEntities(value) : value;
                return acc;
            }, {});
            setFormData(decodedData);
            setRemovedImages({});
        }
    }, [isOpen, initialData]);

    const handleTextChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        const { name, files, multiple } = e.target;
        if (files && files.length > 0) {
            const rawFiles = Array.from(files);
            const validFiles = [];
            const oversizedFiles = [];

            rawFiles.forEach(file => {
                if (file.size <= MAX_FILE_SIZE) {
                    validFiles.push(file);
                } else {
                    oversizedFiles.push(file.name);
                }
            });

            // Update file specific errors
            if (oversizedFiles.length > 0) {
                setFileErrors(prev => ({
                    ...prev,
                    [name]: `Removed: ${oversizedFiles.join(', ')} (Exceeds 2MB)`
                }));
            } else {
                setFileErrors(prev => {
                    const next = { ...prev };
                    delete next[name];
                    return next;
                });
            }

            if (validFiles.length > 0) {
                const current = formData[name];
                let selection = [];
                if (current instanceof FileList || (Array.isArray(current) && current[0] instanceof File)) {
                    selection = Array.from(current);
                }

                if (multiple) {
                    setFormData({ ...formData, [name]: [...selection, ...validFiles] });
                } else {
                    setFormData({ ...formData, [name]: validFiles });
                }
            }

            // Reset input
            e.target.value = '';
        }
    };

    const markImageForRemoval = (field, identifier, isNew = false) => {
        if (isNew) {
            // identifier is index
            const current = formData[field];
            const currentFiles = (current instanceof FileList) ? Array.from(current) : (Array.isArray(current) ? current : []);
            const updatedFiles = currentFiles.filter((_, i) => i !== identifier);
            setFormData({ ...formData, [field]: updatedFiles });

            // Clear error if all remaining files are valid (which they should be, but let's clear on manual remove too)
            if (updatedFiles.length === 0) {
                setFileErrors(prev => {
                    const next = { ...prev };
                    delete next[field];
                    return next;
                });
            }
        } else {
            // identifier is path
            setRemovedImages(prev => ({
                ...prev,
                [field]: [...(prev[field] || []), identifier]
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setStatus({ type: '', message: '' });
        setUploadProgress(0);

        const payload = new FormData();

        const textFields = [
            'institute_overview', 'mission', 'vision', 'history',
            'chancellor_intro', 'vice_chancellor_intro',
            'academic_excellence', 'programs_offered', 'global_partnerships',
            'life_at_institute', 'sports_recreation', 'upcoming_programs'
        ];

        textFields.forEach(field => {
            if (formData[field]) payload.append(field, formData[field]);
        });

        const fileFields = [
            'chancellor_photo', 'vice_chancellor_photo',
            'academic_images', 'programs_images', 'partnerships_images',
            'life_images', 'sports_images', 'upcoming_images', 'campus_images'
        ];

        fileFields.forEach(field => {
            const files = formData[field];
            // Only append if it's new files (FileList or Array of Files)
            // Existing images are strings (paths), which we don't send back as 'files'
            if (files instanceof FileList || (Array.isArray(files) && files[0] instanceof File)) {
                if (field.includes('photo')) {
                    payload.append(field, files[0]);
                } else {
                    Array.from(files).forEach(file => {
                        payload.append(`${field}[]`, file);
                    });
                }
            }
        });

        Object.keys(removedImages).forEach(field => {
            if (removedImages[field].length > 0) {
                payload.append(`removed_${field}`, JSON.stringify(removedImages[field]));
            }
        });

        try {
            const response = await axiosClient.post(`/api/institute/${instituteId}/update-about`, payload, {
                headers: { 'Content-Type': 'multipart/form-data' },
                onUploadProgress: (progressEvent) => {
                    const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    setUploadProgress(percentCompleted);
                }
            });
            onSuccess(response.data.data?.about); // Assume backend returns updated object
            setStatus({ type: 'success', message: '' });
            setTimeout(() => onClose(), 2000);
        } catch (error) {
            console.error(error);
            const errorMsg = error.response?.data?.message || "Failed to update information. Please try again.";
            setStatus({ type: 'error', message: errorMsg });
        } finally {
            setLoading(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="courses-modal-overlay" onClick={onClose}>
                    <motion.div
                        className="courses-modal-content update-info-modal"
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        onClick={e => e.stopPropagation()}
                    >
                        <button className="modal-close-trigger" onClick={onClose}><X size={24} /></button>
                        <h2 className="modal-title">Update About Section</h2>

                        <AnimatePresence mode="wait">
                            {status.message && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0, marginBottom: 0 }}
                                    animate={{ height: 'auto', opacity: 1, marginBottom: 20 }}
                                    exit={{ height: 0, opacity: 0, marginBottom: 0 }}
                                    className={`modal-alert ${status.type}`}
                                >
                                    {status.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
                                    <span>{status.message}</span>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <form onSubmit={handleSubmit} className="modal-form">
                            <div className="modal-body custom-scrollbar">
                                <InputField label="Institute Overview" name="institute_overview" value={formData.institute_overview} onChange={handleTextChange} type="textarea" />
                                <div className="input-grid">
                                    <InputField label="Mission" name="mission" value={formData.mission} onChange={handleTextChange} type="textarea" />
                                    <InputField label="Vision" name="vision" value={formData.vision} onChange={handleTextChange} type="textarea" />
                                </div>
                                <InputField label="History" name="history" value={formData.history} onChange={handleTextChange} type="textarea" />

                                <hr className="divider my-6 border-slate-200" />

                                <div className="bg-slate-50 p-4 rounded-lg mb-4 border border-slate-100">
                                    <h3 className="section-subtitle">Chancellor</h3>
                                    <InputField label="Introduction" name="chancellor_intro" value={formData.chancellor_intro} onChange={handleTextChange} type="textarea" />
                                    <ImageInput field="chancellor_photo" label="Chancellor Photo" existing={initialData?.chancellor_photo} current={formData.chancellor_photo} removed={removedImages.chancellor_photo} error={fileErrors.chancellor_photo} onChange={handleFileChange} onRemove={markImageForRemoval} isSingle={true} />
                                </div>

                                <div className="bg-slate-50 p-4 rounded-lg mb-4 border border-slate-100">
                                    <h3 className="section-subtitle">Vice Chancellor</h3>
                                    <InputField label="Introduction" name="vice_chancellor_intro" value={formData.vice_chancellor_intro} onChange={handleTextChange} type="textarea" />
                                    <ImageInput field="vice_chancellor_photo" label="Vice Chancellor Photo" existing={initialData?.vice_chancellor_photo} current={formData.vice_chancellor_photo} removed={removedImages.vice_chancellor_photo} error={fileErrors.vice_chancellor_photo} onChange={handleFileChange} onRemove={markImageForRemoval} isSingle={true} />
                                </div>

                                {[
                                    { id: 'academic_excellence', label: 'Academic Excellence', img: 'academic_images' },
                                    { id: 'programs_offered', label: 'Programs Offered', img: 'programs_images' },
                                    { id: 'global_partnerships', label: 'Global Partnerships', img: 'partnerships_images' },
                                    { id: 'life_at_institute', label: 'Life at Institute', img: 'life_images' },
                                    { id: 'sports_recreation', label: 'Sports & Recreation', img: 'sports_images' },
                                    { id: 'upcoming_programs', label: 'Upcoming Programs', img: 'upcoming_images' },
                                ].map(section => (
                                    <div key={section.id} className="mb-6 border-b pb-6 border-slate-100">
                                        <InputField label={section.label} name={section.id} value={formData[section.id]} onChange={handleTextChange} type="textarea" />
                                        <ImageInput field={section.img} label={`${section.label} Images`} existing={initialData?.[section.img]} current={formData[section.img]} removed={removedImages[section.img]} error={fileErrors[section.img]} onChange={handleFileChange} onRemove={markImageForRemoval} />
                                    </div>
                                ))}

                                <ImageInput field="campus_images" label="Campus Overview Images" existing={initialData?.campus_images} current={formData.campus_images} removed={removedImages.campus_images} error={fileErrors.campus_images} onChange={handleFileChange} onRemove={markImageForRemoval} />
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
                                    <button type="button" className="btn btn-cancel" onClick={onClose}>Cancel</button>
                                </div>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

const InputField = ({ label, name, value, onChange, type = 'text' }) => (
    <div className="mb-4">
        <label className="form-label">{label}</label>
        {type === 'textarea' ? (
            <textarea name={name} value={value || ''} onChange={onChange} className="form-textarea" rows="4" placeholder={`Enter ${label}...`} />
        ) : (
            <input name={name} value={value || ''} onChange={onChange} className="form-textarea" />
        )}
    </div>
);

const ImageInput = ({ field, label, existing, current, removed = [], error, onChange, onRemove, isSingle = false }) => {
    let existingToShow = [];
    let newUploads = [];

    // Parse existing images
    if (existing) {
        if (typeof existing === 'string') {
            try {
                const parsed = JSON.parse(existing);
                if (Array.isArray(parsed)) existingToShow = parsed;
                else existingToShow = [existing];
            } catch {
                existingToShow = [existing];
            }
        }
    }

    // Filter out removed existing images
    existingToShow = existingToShow.filter(img => !removed.includes(img));

    // Get new uploads from current session
    if (current instanceof FileList || (Array.isArray(current) && current[0] instanceof File)) {
        newUploads = Array.from(current);
    }

    return (
        <div className="mb-4">
            <label className="form-label">{label}</label>
            <div className="file-input-wrapper">
                <input
                    type="file"
                    name={field}
                    onChange={onChange}
                    className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                    accept="image/*"
                    multiple={!isSingle}
                />
            </div>

            <AnimatePresence>
                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="file-size-alert"
                    >
                        <AlertCircle size={14} />
                        <span>{error}</span>
                    </motion.div>
                )}
            </AnimatePresence>

            {(existingToShow.length > 0 || newUploads.length > 0) && (
                <div className="image-preview-list">
                    {/* Render Existing Images */}
                    {existingToShow.map((img, idx) => (
                        <div key={`old-${idx}`} className="preview-item">
                            <img src={getStorageUrl(img)} className="preview-thumbnail" alt="Existing" />
                            <button type="button" className="remove-img-btn" onClick={() => onRemove(field, img)}>
                                <X size={12} />
                            </button>
                        </div>
                    ))}

                    {/* Render New Uploads */}
                    {newUploads.map((file, idx) => (
                        <div key={`new-${idx}`} className="preview-item">
                            <img src={URL.createObjectURL(file)} className="preview-thumbnail banner" alt="New Upload" />
                            <button type="button" className="remove-img-btn" onClick={() => onRemove(field, idx, true)}>
                                <X size={12} />
                            </button>
                            <div className="new-badge">New</div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default UpdateInfoModal;
