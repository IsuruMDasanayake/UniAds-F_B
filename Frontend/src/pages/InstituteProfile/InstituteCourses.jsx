import React, { useState, useEffect } from 'react';
import axiosClient from '../../lib/axios';
import { motion } from 'framer-motion';
import { getStorageUrl } from '../../lib/config';
import { Bookmark } from 'lucide-react';
import ProgrammeInfoModal from '../../components/Modals/ProgrammeInfoModal';
import ApplyNowModal from '../../components/Modals/ApplyNowModal';
import MoreInfoModal from '../../components/Modals/MoreInfoModal';
import './InstituteCourses.css';

const InstituteCourses = ({ institute, courses, isOwner }) => {
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [showApplyModal, setShowApplyModal] = useState(false);
    const [showInfoModal, setShowInfoModal] = useState(false);
    const [submissionStatus, setSubmissionStatus] = useState({ type: '', message: '' });
    const [applying, setApplying] = useState(false);

    const [applyForm, setApplyForm] = useState({
        name: '',
        email: '',
        phone: '',
        message: '',
        privacy_consent: false
    });
    const [userRole, setUserRole] = useState(null);
    const [savedPostIds, setSavedPostIds] = useState([]);
    const [localCourses, setLocalCourses] = useState([]);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const response = await axiosClient.get('/api/profile/me');
                setUserRole(response.data.role);
                setSavedPostIds(response.data.savedPosts?.map(p => p.id) || []);
            } catch (error) {
                console.error("Failed to fetch user data", error);
            }
        };
        fetchUserData();
    }, []);

    useEffect(() => {
        // If owner, show all posts. If not, show only active.
        let initialCourses = courses || institute.posts || [];

        if (!isOwner) {
            initialCourses = initialCourses.filter(p => p.status === 'active');
        }

        setLocalCourses(initialCourses);
    }, [courses, institute.posts, isOwner]);


    const openModal = (course) => {
        setSelectedCourse(course);
        setSubmissionStatus({ type: '', message: '' });
        // Track view
        axiosClient.post(`/api/posts/${course.id}/track-view`).catch(() => { });
    };

    const closeModals = () => {
        setSelectedCourse(null);
        setShowApplyModal(false);
        setShowInfoModal(false);
        setSubmissionStatus({ type: '', message: '' });
    };

    const handleApplyChange = (e) => {
        const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
        setApplyForm({ ...applyForm, [e.target.name]: value });
    };

    const submitApplication = async (e) => {
        e.preventDefault();
        if (!selectedCourse) return;

        setApplying(true);
        setSubmissionStatus({ type: '', message: '' });

        try {
            await axiosClient.post(`/api/course/apply/${institute.id}`, {
                ...applyForm,
                course_title: selectedCourse.title,
                post_id: selectedCourse.id
            });

            setSubmissionStatus({ type: 'success', message: 'Application submitted successfully! We wish you all the best for your future.' });

            // Clear form but keep modal open briefly or close?
            setApplyForm({ name: '', email: '', phone: '', message: '', privacy_consent: false });

            // Optional: Close modal after delay
            setTimeout(() => {
                setShowApplyModal(false);
                setSubmissionStatus({ type: '', message: '' });
            }, 5000);

        } catch (error) {
            console.error(error);
            const errorMsg = error.response?.data?.message || "Failed to submit application. Please try again.";
            setSubmissionStatus({ type: 'error', message: errorMsg });
        } finally {
            setApplying(false);
        }
    };

    const handleToggleSave = async (e, postId) => {
        e.stopPropagation();
        if (userRole !== 'User') return;

        // Optimistic UI update
        const isCurrentlySaved = savedPostIds.includes(postId);
        if (isCurrentlySaved) {
            setSavedPostIds(prev => prev.filter(id => id !== postId));
        } else {
            setSavedPostIds(prev => [...prev, postId]);
        }

        try {
            await axiosClient.post(`/api/posts/${postId}/save`);
        } catch (error) {
            console.error("Error saving post:", error);
            // Revert on failure
            if (isCurrentlySaved) {
                setSavedPostIds(prev => [...prev, postId]);
            } else {
                setSavedPostIds(prev => prev.filter(id => id !== postId));
            }
        }
    };

    return (
        <div className="courses-page-container">
            <h3 className="courses-title">Courses Offered</h3>

            <div className="courses-grid">
                {localCourses.map(course => (
                    <motion.div
                        key={course.id}
                        className={`course-card ${course.status !== 'active' ? 'course-inactive' : ''}`}
                        onClick={() => openModal(course)}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.4 }}
                    >
                        {/* Inactive Badge for Owner */}
                        {course.status !== 'active' && isOwner && (
                            <div className="course-inactive-badge">
                                Inactive
                            </div>
                        )}
                        <div className="course-image-wrapper">
                            <img
                                src={course.image ? getStorageUrl(course.image) : getStorageUrl(course.image_path) || '/images/default-course.jpg'}
                                alt={course.title}
                                className="course-image"
                            />
                            {userRole === 'User' && (
                                <button
                                    className={`save-circle ${savedPostIds.includes(course.id) ? 'saved' : ''}`}
                                    onClick={(e) => handleToggleSave(e, course.id)}
                                >
                                    <Bookmark size={18} fill={savedPostIds.includes(course.id) ? "currentColor" : "none"} />
                                </button>
                            )}
                        </div>
                        <div className="course-content">
                            <h4 className="course-title">{course.title}</h4>
                            <p className="course-description-preview">{course.description}</p>
                        </div>
                    </motion.div>
                ))}
            </div>

            <ProgrammeInfoModal
                course={selectedCourse}
                isOpen={!!selectedCourse && !showApplyModal && !showInfoModal}
                onClose={closeModals}
                onApply={() => setShowApplyModal(true)}
                onMoreInfo={() => setShowInfoModal(true)}
                userRole={userRole}
            />

            <ApplyNowModal
                isOpen={showApplyModal}
                onClose={() => setShowApplyModal(false)}
                courseTitle={selectedCourse?.title}
                form={applyForm}
                onChange={handleApplyChange}
                onSubmit={submitApplication}
                isSubmitting={applying}
                status={submissionStatus}
            />

            <MoreInfoModal
                isOpen={showInfoModal}
                onClose={() => setShowInfoModal(false)}
                contactNumber={institute.contact_number}
            />
        </div>
    );
};

export default InstituteCourses;
