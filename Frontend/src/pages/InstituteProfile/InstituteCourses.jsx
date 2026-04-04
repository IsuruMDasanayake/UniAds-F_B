import React, { useState, useEffect, useRef, useCallback } from 'react';
import axiosClient from '../../lib/axios';
import { motion } from 'framer-motion';
import { getStorageUrl } from '../../lib/config';
import { copyToClipboard } from '../../lib/clipboard';
import { Bookmark, Link2, Check, Loader2 } from 'lucide-react';
import ProgrammeInfoModal from '../../components/Modals/ProgrammeInfoModal';
import ApplyNowModal from '../../components/Modals/ApplyNowModal';
import MoreInfoModal from '../../components/Modals/MoreInfoModal';
import { isPremiumActive } from '../../utils/premium';
import './InstituteCourses.css';

const InstituteCourses = ({ institute, courses, isOwner }) => {
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [showApplyModal, setShowApplyModal] = useState(false);
    const [showInfoModal, setShowInfoModal] = useState(false);
    const [submissionStatus, setSubmissionStatus] = useState({ type: '', message: '' });
    const [applying, setApplying] = useState(false);
    const [copiedPostId, setCopiedPostId] = useState(null);

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

    // Infinite Scroll States
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const observer = useRef();

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const response = await axiosClient.get('/api/profile/me');
                const payload = response.data.data;
                setUserRole(payload.role);
                const savedIds = payload.savedPosts?.map(p => String(p.id).trim()) || [];
                setSavedPostIds(savedIds);
                
                // If courses were passed, we can also sync their internal state for extra reliability
                if (localCourses.length > 0) {
                    setLocalCourses(current => current.map(c => ({
                        ...c,
                        is_saved_by_user: savedIds.includes(String(c.id).trim())
                    })));
                }
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
        // Reset pagination for new initial courses
        setPage(1);
        setHasMore(true);
    }, [courses, institute.posts, isOwner]);

    const fetchMoreCourses = async () => {
        if (loadingMore || !hasMore) return;

        const instId = institute?.slug || institute?.id;
        if (!isOwner && !instId) return;

        setLoadingMore(true);
        try {
            const nextPage = page + 1;
            // Use per_page=12 to match our new backend default
            const endpoint = isOwner ? `/api/profile/me?page=${nextPage}&per_page=12` : `/api/institutions/${instId}/profile?page=${nextPage}&per_page=12`;
            
            const response = await axiosClient.get(endpoint);
            const newPosts = response.data.data?.posts?.data || [];

            if (newPosts.length === 0) {
                setHasMore(false);
            } else {
                setLocalCourses(prev => {
                    const existingIds = new Set(prev.map(p => p.id));
                    // Filter active only if not owner
                    const filteredNew = isOwner ? newPosts : newPosts.filter(p => p.status === 'active');
                    const uniqueNew = filteredNew.filter(p => !existingIds.has(p.id));
                    
                    if (uniqueNew.length === 0 && newPosts.length > 0) {
                        return prev;
                    }
                    
                    if (newPosts.length === 0) {
                        setHasMore(false);
                        return prev;
                    }

                    return [...prev, ...uniqueNew];
                });
                
                setPage(nextPage);
                // If we got fewer than 12, we reached the end
                if (newPosts.length < 12) {
                    setHasMore(false);
                }
            }
        } catch (error) {
            console.error("Error fetching more courses", error);
            setHasMore(false);
        } finally {
            setLoadingMore(false);
        }
    };

    const lastCourseRef = useCallback(node => {
        if (loadingMore) return;
        if (observer.current) observer.current.disconnect();

        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore) {
                fetchMoreCourses();
            }
        });

        if (node) observer.current.observe(node);
    }, [loadingMore, hasMore, page]);


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
        const stringPostId = String(postId).trim();
        const targetCourse = localCourses.find(c => String(c.id).trim() === stringPostId);
        const isCurrentlySaved = savedPostIds.some(id => String(id).trim() === stringPostId) || (targetCourse && !!targetCourse.is_saved_by_user);
        
        if (isCurrentlySaved) {
            setSavedPostIds(prev => prev.filter(id => String(id).trim() !== stringPostId));
            setLocalCourses(prev => prev.map(c => 
                String(c.id).trim() === stringPostId ? { ...c, is_saved_by_user: false } : c
            ));
        } else {
            setSavedPostIds(prev => [...prev, stringPostId]);
            setLocalCourses(prev => prev.map(c => 
                String(c.id).trim() === stringPostId ? { ...c, is_saved_by_user: true } : c
            ));
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

    const handleCopyPostLink = (e, course) => {
        e.stopPropagation();
        if (!course?.share_link) return;
        const url = `${window.location.origin}/post/${course.share_link}`;
        copyToClipboard(url).then(() => {
            setCopiedPostId(course.id);
            setTimeout(() => setCopiedPostId(null), 2000);
        }).catch(err => {
            console.error('Copy failed:', err);
        });
    };

    return (
        <div className="courses-page-container">
            <h3 className="courses-title">Courses Offered</h3>

            <div className="courses-grid">
                {localCourses.map((course, index) => (
                    <motion.div
                        key={course.id}
                        ref={index === localCourses.length - 1 ? lastCourseRef : null}
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
                                    className={`save-circle ${ (savedPostIds.some(id => String(id).trim() === String(course.id).trim()) || course.is_saved_by_user) ? 'saved' : ''}`}
                                    onClick={(e) => handleToggleSave(e, course.id)}
                                    title={(savedPostIds.some(id => String(id).trim() === String(course.id).trim()) || course.is_saved_by_user) ? "Remove from saved" : "Save post"}
                                >
                                    <Bookmark size={18} fill={(savedPostIds.some(id => String(id).trim() === String(course.id).trim()) || course.is_saved_by_user) ? "currentColor" : "none"} />
                                </button>
                            )}
                            {/* Copy Link Button */}
                            <button
                                className={`copy-circle ${copiedPostId === course.id ? 'copied' : ''}`}
                                onClick={(e) => handleCopyPostLink(e, course)}
                                title="Copy shareable link"
                            >
                                {copiedPostId === course.id ? <Check size={18} /> : <Link2 size={18} />}
                            </button>
                        </div>
                        <div className="course-content">
                            <h4 className="course-title">{course.title}</h4>
                            <p className="course-description-preview">{course.description}</p>
                        </div>
                    </motion.div>
                ))}
            </div>

            {loadingMore && (
                <div className="courses-loading-footer">
                    <div className="ui-loader loader-blk" style={{ width: '40px', height: '40px' }}>
                        <svg viewBox="22 22 44 44" className="multiColor-loader">
                            <circle cx="44" cy="44" r="20.2" fill="none" strokeWidth="3.6" className="loader-circle loader-circle-animation"></circle>
                        </svg>
                    </div>
                    {/* <p>Loading more courses...</p> */}
                </div>
            )}

            <ProgrammeInfoModal
                course={selectedCourse}
                isOpen={!!selectedCourse && !showApplyModal && !showInfoModal}
                onClose={closeModals}
                onApply={() => setShowApplyModal(true)}
                onMoreInfo={() => setShowInfoModal(true)}
                userRole={userRole}
                isPremium={isPremiumActive(institute)}
                institute={institute}
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
                course={selectedCourse}
            />
        </div>
    );
};

export default InstituteCourses;
