import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Edit2, Trash2, Plus } from 'lucide-react';
import axiosClient from '../../lib/axios';
import { getStorageUrl } from '../../lib/config';
import CreateInfoModal from '../../components/Modals/CreateInfoModal';
import UpdateInfoModal from '../../components/Modals/UpdateInfoModal';
import DeleteConfirmModal from '../../components/Modals/DeleteConfirmModal';
import ImageViewerModal from '../../components/Modals/ImageViewerModal';
import './InstituteAbout.css';

const InstituteAbout = ({ about: initialAbout, institute }) => {
    const [about, setAbout] = useState(initialAbout);
    const [user, setUser] = useState(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showUpdateModal, setShowUpdateModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [viewerIndex, setViewerIndex] = useState(null);

    useEffect(() => {
        // Fetch current user to check permissions
        axiosClient.get('/api/user')
            .then(res => setUser(res.data))
            .catch(() => setUser(null));
    }, []);

    useEffect(() => {
        setAbout(initialAbout);
    }, [initialAbout]);

    const isOwner = user?.role === 'Institute' && user?.id === institute?.user_id;

    // Aggregate all images from different sections into one gallery
    const getFullGallery = () => {
        const galleries = [];
        if (about?.chancellor_photo) galleries.push(about.chancellor_photo);
        if (about?.vice_chancellor_photo) galleries.push(about.vice_chancellor_photo);

        const dynamicSections = [
            about?.academic_images,
            about?.programs_images,
            about?.partnerships_images,
            about?.life_images,
            about?.sports_images,
            about?.upcoming_images,
            about?.campus_images
        ];

        dynamicSections.forEach(section => {
            if (section) {
                try {
                    const parsed = typeof section === 'string' ? JSON.parse(section) : section;
                    if (Array.isArray(parsed)) galleries.push(...parsed);
                } catch (e) {
                    // Skip invalid sections
                }
            }
        });

        return galleries;
    };

    const fullGallery = getFullGallery();

    const openViewer = (image) => {
        const index = fullGallery.indexOf(image);
        if (index !== -1) {
            setViewerIndex(index);
        }
    };

    const nextImage = () => {
        if (fullGallery.length > 0) {
            setViewerIndex((prev) => (prev + 1) % fullGallery.length);
        }
    };

    const prevImage = () => {
        if (fullGallery.length > 0) {
            setViewerIndex((prev) => (prev - 1 + fullGallery.length) % fullGallery.length);
        }
    };

    // Helper to render text with newlines
    const renderText = (text) => {
        if (!text) return null;
        return text.split('\n').map((str, index) => <p key={index} className="mb-2">{str}</p>);
    };

    // Helper to render section images
    const renderImages = (imagesJson) => {
        if (!imagesJson) return null;
        try {
            const images = typeof imagesJson === 'string' ? JSON.parse(imagesJson) : imagesJson;
            if (!Array.isArray(images) || images.length === 0) return null;
            return (
                <div className="gallery-grid">
                    {images.map((img, idx) => (
                        <div key={idx} className="gallery-item" onClick={() => openViewer(img)}>
                            <img src={getStorageUrl(img)} alt="Gallery" className="gallery-img" />
                        </div>
                    ))}
                </div>
            );
        } catch (e) {
            return null;
        }
    };

    const handleDelete = async () => {
        setIsSubmitting(true);
        try {
            await axiosClient.delete(`/api/institute/${institute.id}/about`);
            setAbout(null);
            setShowDeleteModal(false);
            window.location.reload(); // Reload to reflect changes globally
        } catch (error) {
            console.error(error);
            alert("Failed to delete.");
        } finally {
            setIsSubmitting(false);
        }
    };

    // If no about section exists
    if (!about) {
        return (
            <div className="about-container">
                {isOwner ? (
                    <div className="empty-state">
                        <h3 className="section-title">Create Your About Section</h3>
                        <p className="text-content mb-4">Tell detailed stories about your institute, history, and life on campus.</p>
                        <button className="btn btn-create" onClick={() => setShowCreateModal(true)}>
                            <Plus size={20} /> Create About Page
                        </button>
                    </div>
                ) : (
                    <div className="empty-state">
                        <p>No information available specifically for the About section.</p>
                    </div>
                )}

                <CreateInfoModal
                    isOpen={showCreateModal}
                    onClose={() => setShowCreateModal(false)}
                    instituteId={institute.id}
                    onSuccess={() => {
                        window.location.reload();
                    }}
                />
            </div>
        );
    }

    return (
        <div className="about-container">


            {/* Content Sections */}
            <div className="about-section">
                {isOwner && (
                    <div className="about-actions-bar">
                        <button
                            className="action-btn-sm edit-btn"
                            onClick={() => setShowUpdateModal(true)}
                            title="Update Info"
                        >
                            <Edit2 size={16} />
                        </button>
                        <button
                            className="action-btn-sm delete-btn"
                            onClick={() => setShowDeleteModal(true)}
                            title="Delete Info"
                        >
                            <Trash2 size={16} />
                        </button>
                    </div>
                )}
                {/* Overview */}
                {about.institute_overview && (
                    <div className="mb-8">
                        <h2 className="section-title">Institute Overview</h2>
                        <div className="text-content">{renderText(about.institute_overview)}</div>
                    </div>
                )}

                {/* Mission & Vision */}
                <div className="mission-vision-grid">
                    {about.mission && (
                        <div className="mission-box">
                            <h3 className="mv-title mission-title">Mission</h3>
                            <div className="text-content">{renderText(about.mission)}</div>
                        </div>
                    )}
                    {about.vision && (
                        <div className="vision-box">
                            <h3 className="mv-title vision-title">Vision</h3>
                            <div className="text-content">{renderText(about.vision)}</div>
                        </div>
                    )}
                </div>

                <hr className="divider" />

                {/* History */}
                {about.history && (
                    <div className="mb-8">
                        <h3 className="section-title">History</h3>
                        <div className="text-content">{renderText(about.history)}</div>
                    </div>
                )}

                {/* Chancellor Intro */}
                {about.chancellor_intro && (
                    <div className="profile-card">
                        {about.chancellor_photo && (
                            <div className="profile-img-container" onClick={() => openViewer(about.chancellor_photo)}>
                                <img src={getStorageUrl(about.chancellor_photo)} alt="Chancellor" className="profile-img" />
                            </div>
                        )}
                        <div className="profile-info">
                            <h3>Chancellor Introduction</h3>
                            <div className="quote-text">"{about.chancellor_intro}"</div>
                        </div>
                    </div>
                )}

                {/* Vice Chancellor Intro */}
                {about.vice_chancellor_intro && (
                    <div className="profile-card reverse">
                        {about.vice_chancellor_photo && (
                            <div className="profile-img-container" onClick={() => openViewer(about.vice_chancellor_photo)}>
                                <img src={getStorageUrl(about.vice_chancellor_photo)} alt="Vice Chancellor" className="profile-img" />
                            </div>
                        )}
                        <div className="profile-info text-right">
                            <h3>Vice-Chancellor Introduction</h3>
                            <div className="quote-text">"{about.vice_chancellor_intro}"</div>
                        </div>
                    </div>
                )}

                <hr className="divider" />

                {/* Other Sections */}
                {[
                    { title: 'Academic Excellence & Achievements', text: about.academic_excellence, images: about.academic_images },
                    { title: 'Programs Offered', text: about.programs_offered, images: about.programs_images },
                    { title: 'Global Partnerships', text: about.global_partnerships, images: about.partnerships_images },
                    { title: `Life at ${institute.institute_name}`, text: about.life_at_institute, images: about.life_images },
                    { title: 'Sports & Recreation', text: about.sports_recreation, images: about.sports_images },
                    { title: 'Upcoming Programs & Developments', text: about.upcoming_programs, images: about.upcoming_images },
                ].map((section, idx) => (
                    (section.text || section.images) && (
                        <div key={idx} className="mb-12">
                            <h3 className="section-title">{section.title}</h3>
                            <div className="text-content mb-4">{renderText(section.text)}</div>
                            {renderImages(section.images)}
                            <hr className="divider" />
                        </div>
                    )
                ))}

                {/* Campus Overview */}
                {about.campus_images && (
                    <div className="mb-8">
                        <h3 className="section-title text-center">Campus Overview</h3>
                        {renderImages(about.campus_images)}
                    </div>
                )}
            </div>

            {/* Modals */}
            <UpdateInfoModal
                isOpen={showUpdateModal}
                onClose={() => setShowUpdateModal(false)}
                instituteId={institute.id}
                initialData={about}
                onSuccess={() => {
                    window.location.reload();
                }}
            />

            <DeleteConfirmModal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={handleDelete}
                isDeleting={isSubmitting}
                title="all About information"
            />

            {/* Image Viewer Modal */}
            <AnimatePresence>
                {viewerIndex !== null && fullGallery.length > 0 && (
                    <ImageViewerModal
                        images={fullGallery}
                        currentIndex={viewerIndex}
                        onNext={nextImage}
                        onPrevious={prevImage}
                        onClose={() => setViewerIndex(null)}
                        getImageUrl={(img) => getStorageUrl(img)}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

export default InstituteAbout;
