import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2, Save } from 'lucide-react';
import './AdminEditInstituteModal.css';

const AdminEditInstituteModal = ({
    isOpen,
    onClose,
    onUpdate,
    institute,
    isProcessing
}) => {
    const [formData, setFormData] = useState({
        institute_name: '',
        institute_type: '',
        location: '',
        email: '',
        contact_number: '',
        website: '',
        gov_register_number: '' // Hidden or visible? I'll include it as it's part of core identity
    });

    useEffect(() => {
        if (institute) {
            setFormData({
                institute_name: institute.institute_name || '',
                institute_type: institute.institute_type || '',
                location: institute.location || '',
                email: institute.email || '',
                contact_number: institute.contact_number || '',
                website: institute.website || '',
                gov_register_number: institute.gov_register_number || ''
            });
        }
    }, [institute]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onUpdate(formData);
    };

    if (!isOpen) return null;

    return createPortal(
        <AnimatePresence>
            {isOpen && (
                <div className="admin-edit-modal-overlay">
                    <motion.div
                        className="admin-edit-modal-content"
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="admin-edit-modal-header">
                            <h2 className="admin-edit-modal-title">Edit Institute Details</h2>
                            <button className="admin-edit-modal-close" onClick={onClose}>
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="admin-edit-modal-form">
                            <div className="admin-edit-modal-grid">
                                <div className="admin-edit-form-group">
                                    <label>Institute Name</label>
                                    <input
                                        type="text"
                                        name="institute_name"
                                        value={formData.institute_name}
                                        onChange={handleChange}
                                        required
                                        placeholder="Enter institute name"
                                    />
                                </div>

                                <div className="admin-edit-form-group">
                                    <label>Institute Type</label>
                                    <select
                                        name="institute_type"
                                        value={formData.institute_type}
                                        onChange={handleChange}
                                        required
                                    >
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

                                <div className="admin-edit-form-group">
                                    <label>Location</label>
                                    <input
                                        type="text"
                                        name="location"
                                        value={formData.location}
                                        onChange={handleChange}
                                        required
                                        placeholder="Enter location"
                                    />
                                </div>

                                <div className="admin-edit-form-group">
                                    <label>Email Address</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                        placeholder="Enter email address"
                                    />
                                </div>

                                <div className="admin-edit-form-group">
                                    <label>Contact Number</label>
                                    <input
                                        type="text"
                                        name="contact_number"
                                        value={formData.contact_number}
                                        onChange={handleChange}
                                        required
                                        placeholder="Enter contact number"
                                    />
                                </div>

                                <div className="admin-edit-form-group">
                                    <label>Website</label>
                                    <input
                                        type="text"
                                        name="website"
                                        value={formData.website}
                                        onChange={handleChange}
                                        placeholder="https://example.com"
                                    />
                                </div>
                                <div className="admin-edit-form-group">
                                    <label>Gov. Reg. Number</label>
                                    <input
                                        type="text"
                                        name="gov_register_number"
                                        value={formData.gov_register_number}
                                        onChange={handleChange}
                                        required
                                        placeholder="Enter registration number"
                                    />
                                </div>
                            </div>

                            <div className="admin-edit-modal-footer">
                                <button
                                    type="button"
                                    className="admin-edit-btn-cancel"
                                    onClick={onClose}
                                    disabled={isProcessing}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="admin-edit-btn-submit"
                                    disabled={isProcessing}
                                >
                                    {isProcessing ? (
                                        <>
                                            <Loader2 size={18} className="animate-spin" />
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            <Save size={18} />
                                            Update Details
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>,
        document.body
    );
};

export default AdminEditInstituteModal;
