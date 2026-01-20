import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import './ImageViewerModal.css';

/**
 * Reusable Image Viewer Modal
 * @param {Array} images - Array of image objects
 * @param {number} currentIndex - Current active index
 * @param {function} onNext - Function to handle next navigation
 * @param {function} onPrevious - Function to handle previous navigation
 * @param {function} onClose - Function to close the modal
 * @param {function} getImageUrl - Optional function to resolve image URL from an image object
 */
const ImageViewerModal = ({ images, currentIndex, onNext, onPrevious, onClose, getImageUrl }) => {
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'ArrowRight') onNext();
            if (e.key === 'ArrowLeft') onPrevious();
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleKeyDown);
        // Lock scroll
        document.body.style.overflow = 'hidden';

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            // Unlock scroll
            document.body.style.overflow = 'unset';
        };
    }, [onNext, onPrevious, onClose]);

    if (!images || images.length === 0 || currentIndex === null) return null;

    const currentImg = images[currentIndex];

    // Default URL resolver if none provided
    const resolveUrl = (img) => {
        if (getImageUrl) return getImageUrl(img);
        // Fallback for current project structure if direct URL isn't there
        return img.image_path ? `http://localhost:8000/storage/${img.image_path}` : img.url || img.src || '';
    };

    return createPortal(
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="image-viewer-overlay"
            onClick={onClose}
        >
            <div className="viewer-header">
                <span className="image-counter">{currentIndex + 1} / {images.length}</span>
                <button className="modal-close-trigger" onClick={onClose}><X size={24} /></button>
            </div>

            <div className="viewer-main" onClick={e => e.stopPropagation()}>
                <button className="nav-btn prev" onClick={onPrevious} aria-label="Previous Image">
                    <ChevronLeft size={32} />
                </button>

                <div className="viewer-content">
                    <AnimatePresence mode="wait">
                        <motion.img
                            key={currentImg.id || currentIndex}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            drag="x"
                            dragConstraints={{ left: 0, right: 0 }}
                            dragElastic={0.5}
                            onDragEnd={(e, { offset, velocity }) => {
                                const swipe = offset.x;
                                if (swipe < -100) {
                                    onNext();
                                } else if (swipe > 100) {
                                    onPrevious();
                                }
                            }}
                            className="viewer-img"
                            src={resolveUrl(currentImg)}
                            alt="Full View"
                        />
                    </AnimatePresence>
                </div>

                <button className="nav-btn next" onClick={onNext} aria-label="Next Image">
                    <ChevronRight size={32} />
                </button>
            </div>
        </motion.div>,
        document.body
    );
};

export default ImageViewerModal;
