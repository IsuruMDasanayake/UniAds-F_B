import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import axiosClient from '../../lib/axios';
import { getStorageUrl } from '../../lib/config';
import './CreateInfoModal.css';

const CreateInfoModal = ({ isOpen, onClose, instituteId, onSuccess }) => {
    const [formData, setFormData] = useState({});
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState({ type: '', message: '' });
    const [uploadProgress, setUploadProgress] = useState(0);
    const [fileErrors, setFileErrors] = useState({});

    const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB

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
                if (multiple) {
                    const existingFiles = formData[name] ? Array.from(formData[name]) : [];
                    setFormData({ ...formData, [name]: [...existingFiles, ...validFiles] });
                } else {
                    setFormData({ ...formData, [name]: validFiles });
                }
            }

            // Reset input value
            e.target.value = '';
        }
    };

    const removeFile = (field, index) => {
        const currentFiles = formData[field] ? Array.from(formData[field]) : [];
        const updatedFiles = currentFiles.filter((_, i) => i !== index);
        setFormData({ ...formData, [field]: updatedFiles });
    };

    // We need to wrap single file inputs too or handle them differently
    // For consistency with the shared helpers, let's keep it simple: 
    // Create mode usually implies "select files". If you mess up, you select again. 
    // But let's try to support removal from preview.

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
            if (files) {
                // Handles both FileList and Array of Files
                if (field.includes('photo')) {
                    // Single file
                    const file = (files instanceof FileList) ? files[0] : (Array.isArray(files) ? files[0] : files);
                    if (file) payload.append(field, file);
                } else {
                    // Multi file
                    Array.from(files).forEach(file => {
                        payload.append(`${field}[]`, file);
                    });
                }
            }
        });

        try {
            await axiosClient.post(`/api/institute/${instituteId}/about`, payload, {
                headers: { 'Content-Type': 'multipart/form-data' },
                onUploadProgress: (progressEvent) => {
                    const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    setUploadProgress(percentCompleted);
                }
            });
            setStatus({ type: 'success', message: 'About section created successfully!' });
            onSuccess();
            setTimeout(() => onClose(), 2000);
        } catch (error) {
            console.error(error);
            const errorMsg = error.response?.data?.message || "Failed to create information. Please try again.";
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
                        className="courses-modal-content create-info-modal"
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        onClick={e => e.stopPropagation()}
                    >
                        <button className="modal-close-trigger" onClick={onClose}><X size={24} /></button>
                        <h2 className="modal-title">Create About Section</h2>

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

                        {loading && (
                            <div className="upload-progress-container">
                                <div className="progress-bar-bg">
                                    <div className="progress-bar-fill" style={{ width: `${uploadProgress}%` }}></div>
                                </div>
                                <span className="progress-text" style={{ marginLeft: '350px' }}>{uploadProgress}% Creating Page...</span>
                            </div>
                        )}

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
                                    <ImageInput field="chancellor_photo" label="Chancellor Photo" files={formData.chancellor_photo} error={fileErrors.chancellor_photo} onChange={handleFileChange} onRemove={removeFile} isSingle={true} />
                                </div>

                                <div className="bg-slate-50 p-4 rounded-lg mb-4 border border-slate-100">
                                    <h3 className="section-subtitle">Vice Chancellor</h3>
                                    <InputField label="Introduction" name="vice_chancellor_intro" value={formData.vice_chancellor_intro} onChange={handleTextChange} type="textarea" />
                                    <ImageInput field="vice_chancellor_photo" label="Vice Chancellor Photo" files={formData.vice_chancellor_photo} error={fileErrors.vice_chancellor_photo} onChange={handleFileChange} onRemove={removeFile} isSingle={true} />
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
                                        <ImageInput field={section.img} label={`${section.label} Images`} files={formData[section.img]} error={fileErrors[section.img]} onChange={handleFileChange} onRemove={removeFile} />
                                    </div>
                                ))}

                                <ImageInput field="campus_images" label="Campus Overview Images" files={formData.campus_images} error={fileErrors.campus_images} onChange={handleFileChange} onRemove={removeFile} />
                            </div>

                            <div className="modal-footer">
                                <button type="submit" className="btn btn-primary" disabled={loading}>
                                    {loading ? <Loader2 className="animate-spin" size={18} /> : 'Create Page'}
                                </button>
                                <button type="button" className="btn btn-cancel" onClick={onClose}>Cancel</button>
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

const ImageInput = ({ field, label, files, error, onChange, onRemove, isSingle = false }) => {
    let images = [];
    if (files) {
        images = Array.from(files);
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

            {images.length > 0 && (
                <div className="image-preview-list">
                    {images.map((file, idx) => (
                        <div key={idx} className="preview-item">
                            <img src={URL.createObjectURL(file)} className="preview-thumbnail" alt="Preview" />
                            <button type="button" className="remove-img-btn" onClick={() => onRemove(field, idx)}>
                                <X size={12} />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default CreateInfoModal;
