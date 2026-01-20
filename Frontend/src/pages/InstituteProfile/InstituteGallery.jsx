import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import axiosClient from '../../lib/axios';
import { Trash2, X, Upload, Loader2, AlertTriangle, Image as ImageIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ImageViewerModal from '../../components/Modals/ImageViewerModal';
import './InstituteGallery.css';

const DeleteConfirmationModal = ({ onConfirm, onCancel, title, message, isDeleting }) => {
    return createPortal(
        <div className="courses-modal-overlay gallery-modal-overlay" style={{ zIndex: 999999, backgroundColor: 'rgba(15, 23, 42, 0.6)' }} onClick={onCancel}>
            <motion.div
                className="courses-modal-content delete-modal"
                onClick={e => e.stopPropagation()}
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                style={{ maxWidth: '400px', padding: '40px 30px', textAlign: 'center', zIndex: 1000000, borderRadius: '24px' }}
            >
                <button className="modal-close-trigger" onClick={onCancel}><X size={24} /></button>

                <div style={{ color: '#ff4757', marginBottom: '20px' }}>
                    <AlertTriangle size={50} style={{ margin: '0 auto' }} />
                </div>

                <h2 style={{ marginBottom: '15px', fontSize: '1.5rem', fontWeight: '800', color: '#0f172a' }}>{title || 'Delete Image?'}</h2>
                <p style={{ color: '#64748b', marginBottom: '30px', lineHeight: '1.6', fontSize: '0.95rem' }}>
                    {message || 'Are you sure you want to delete this image? This action cannot be undone.'}
                </p>

                <div style={{ display: 'flex', gap: '12px' }}>
                    <button
                        className="gallery-btn"
                        onClick={onCancel}
                        disabled={isDeleting}
                        style={{
                            flex: 1,
                            background: '#e2e8f0',
                            color: '#475569',
                            padding: '14px',
                            borderRadius: '12px',
                            border: 'none',
                            fontWeight: '700',
                            fontSize: '1rem',
                            cursor: 'pointer'
                        }}
                    >
                        Cancel
                    </button>
                    <button
                        className="gallery-btn"
                        onClick={onConfirm}
                        disabled={isDeleting}
                        style={{
                            flex: 1,
                            background: '#ff4757',
                            color: 'white',
                            padding: '14px',
                            borderRadius: '12px',
                            border: 'none',
                            fontWeight: '700',
                            fontSize: '1rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            boxShadow: '0 4px 12px rgba(255, 71, 87, 0.3)'
                        }}
                    >
                        {isDeleting ? <Loader2 className="animate-spin" size={20} /> : 'Delete Now'}
                    </button>
                </div>
            </motion.div>
        </div>,
        document.body
    );
};

const InstituteGallery = ({ institute, gallery, isOwner, onGalleryUpdate }) => {
    const [selectedImage, setSelectedImage] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [viewerIndex, setViewerIndex] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState(null);

    // Delete state
    const [imageToDelete, setImageToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleFileChange = (e) => {
        setError(null);
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            if (file.size > 2 * 1024 * 1024) {
                setError("Image size must be less than 2MB.");
                return;
            }
            setSelectedImage(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleUpload = async () => {
        if (!selectedImage) return;
        setIsUploading(true);
        setError(null);
        const formData = new FormData();
        formData.append('image', selectedImage);
        try {
            await axiosClient.post(`/api/institute/gallery/store/${institute.id}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            if (onGalleryUpdate) onGalleryUpdate();
            setSelectedImage(null);
            setPreviewUrl(null);
        } catch (error) {
            console.error("Gallery upload failed", error);
            setError(error.response?.data?.message || "Failed to upload image. Please try again.");
        } finally {
            setIsUploading(false);
        }
    };

    const handleDelete = async () => {
        if (!imageToDelete) return;
        setIsDeleting(true);
        setError(null);
        try {
            await axiosClient.delete(`/api/institute/gallery/${imageToDelete}`);
            if (onGalleryUpdate) onGalleryUpdate();
            setImageToDelete(null);
        } catch (error) {
            console.error("Delete failed", error);
            setError("Failed to delete image.");
        } finally {
            setIsDeleting(false);
        }
    };

    const triggerFileInput = () => {
        const input = document.getElementById('galleryImageInput');
        if (input) input.click();
    };

    const cancelSelection = () => {
        setSelectedImage(null);
        setPreviewUrl(null);
        setError(null);
        const input = document.getElementById('galleryImageInput');
        if (input) input.value = '';
    }

    const nextImage = () => {
        if (gallery && gallery.length > 0) {
            setViewerIndex((prev) => (prev + 1) % gallery.length);
        }
    };

    const prevImage = () => {
        if (gallery && gallery.length > 0) {
            setViewerIndex((prev) => (prev - 1 + gallery.length) % gallery.length);
        }
    };

    return (
        <div className="institute-gallery-container left-section">
            <div className="gallery-header">
                <h2 className="gallery-title">Institute Gallery</h2>
            </div>

            {isOwner && (
                <div className="gallery-actions">
                    <AnimatePresence>
                        {error && (
                            <motion.div
                                className="error-summary"
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                style={{ marginBottom: '16px', borderRadius: '12px' }}
                            >
                                <p style={{ fontSize: '0.85rem' }}>{error}</p>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {!selectedImage ? (
                        <button id="chooseImageBtn" className="gallery-btn btn-choose" onClick={triggerFileInput}>
                            <ImageIcon size={18} style={{ marginRight: '8px' }} />
                            Choose Image
                        </button>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="upload-preview-wrapper"
                        >
                            <div className="preview-container">
                                <img src={previewUrl} alt="Preview" className="preview-image" />
                                <button className="remove-preview-btn" onClick={cancelSelection}>
                                    <X size={14} />
                                </button>
                            </div>
                            <div style={{ display: 'flex', gap: '8px', width: '100%' }}>
                                <button id="uploadImageBtn" className="gallery-btn btn-upload" onClick={handleUpload} disabled={isUploading} style={{ flex: 1 }}>
                                    {isUploading ? (
                                        <><Loader2 className="animate-spin" size={18} /> Uploading...</>
                                    ) : (
                                        <><Upload size={18} /> Upload Image</>
                                    )}
                                </button>
                                <button className="gallery-btn btn-cancel" onClick={cancelSelection} disabled={isUploading} style={{ width: 'auto' }}>
                                    Cancel
                                </button>
                            </div>
                        </motion.div>
                    )}

                    <input
                        id="galleryImageInput"
                        type="file"
                        name="image"
                        accept="image/*"
                        style={{ display: 'none' }}
                        onChange={handleFileChange}
                    />
                </div>
            )}

            <div id="gallery" className="gallery-grid gallery">
                <AnimatePresence mode="popLayout">
                    {gallery && gallery.map((image, index) => (
                        <motion.div
                            key={image.id}
                            className="gallery-item"
                            layout
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.03 }}
                            onClick={() => setViewerIndex(index)}
                        >
                            <img
                                src={`http://localhost:8000/storage/${image.image_path}`}
                                alt="Gallery"
                                className="gallery-img clickable-image"
                            />
                            {isOwner && (
                                <button className="delete-img-btn" onClick={(e) => {
                                    e.stopPropagation();
                                    setImageToDelete(image.id);
                                }}>
                                    <Trash2 size={14} />
                                </button>
                            )}
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {/* Image Viewer Modal */}
            <AnimatePresence>
                {viewerIndex !== null && gallery && gallery.length > 0 && (
                    <ImageViewerModal
                        images={gallery}
                        currentIndex={viewerIndex}
                        onNext={nextImage}
                        onPrevious={prevImage}
                        onClose={() => setViewerIndex(null)}
                    />
                )}
            </AnimatePresence>

            {/* Delete Confirmation Modal */}
            <AnimatePresence>
                {imageToDelete && (
                    <DeleteConfirmationModal
                        title="Confirm Deletion"
                        message="Are you sure you want to delete this? This cannot be undone."
                        isDeleting={isDeleting}
                        onConfirm={handleDelete}
                        onCancel={() => setImageToDelete(null)}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

export default InstituteGallery;
