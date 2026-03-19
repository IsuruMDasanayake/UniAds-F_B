import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MapPin, Heart, Edit2, Trash2, Send, Info, Link2, Check, Loader2 } from 'lucide-react';
import axiosClient from '../../lib/axios';
import { getStorageUrl } from '../../lib/config';
import './InstitutePosts.css';

// Import Modals
import ApplyNowModal from '../../components/Modals/ApplyNowModal';
import MoreInfoModal from '../../components/Modals/MoreInfoModal';
import ProgrammeInfoModal from '../../components/Modals/ProgrammeInfoModal';
import EditPostModal from '../../components/Modals/EditPostModal';
import DeleteConfirmModal from '../../components/Modals/DeleteConfirmModal';

const PostSkeleton = () => (
    <div className="post-card inst-skeleton-card">
        <div className="post-image-container">
            <div className="inst-skeleton inst-skeleton-image" />
        </div>
        <div className="post-content-area">
            <div className="post-header">
                <div className="inst-skeleton inst-skeleton-avatar" />
                <div className="post-info">
                    <div className="inst-skeleton inst-skeleton-name" />
                    <div className="inst-skeleton inst-skeleton-date" />
                </div>
            </div>
            <div className="post-main-info">
                <div className="inst-skeleton inst-skeleton-title" />
                <div className="inst-skeleton inst-skeleton-description" />
                <div className="inst-skeleton inst-skeleton-description" />
                <div className="inst-skeleton inst-skeleton-description short" />
            </div>
            <div className="post-footer">
                <div className="inst-skeleton inst-skeleton-btn" />
                <div className="inst-skeleton inst-skeleton-btn" />
                <div className="inst-skeleton inst-skeleton-btn-round" />
            </div>
        </div>
    </div>
);

const InstitutePosts = ({ posts: initialPosts, institute, isOwner, user, onPostUpdate }) => {
    const [localPosts, setLocalPosts] = useState(initialPosts || []);

    // Modal States
    const [selectedPost, setSelectedPost] = useState(null);
    const [isProgrammeOpen, setIsProgrammeOpen] = useState(false);
    const [isApplyOpen, setIsApplyOpen] = useState(false);
    const [isInfoOpen, setIsInfoOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [copiedPostId, setCopiedPostId] = useState(null);

    // Form States
    const [applyForm, setApplyForm] = useState({
        name: user?.name || '',
        email: user?.email || '',
        phone: '',
        message: '',
        privacy_consent: false
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState(null);

    // Infinite Scroll States
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    const observer = useRef();

    // Check for mobile on resize
    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Sync with props
    useEffect(() => {
        setLocalPosts(initialPosts || []);
        // Reset pagination if initialPosts changes (e.g. from a fresh profile load)
        setPage(1);
        setHasMore(true);
    }, [initialPosts]);

    const fetchMorePosts = async () => {
        if (loadingMore || !hasMore) return;

        const instId = institute?.slug || institute?.id;
        if (!isOwner && !instId) {
            console.warn("Institute ID/Slug missing for posts fetch");
            return;
        }

        setLoadingMore(true);

        try {
            const nextPage = page + 1;
            let endpoint = '';
            if (isOwner) {
                endpoint = `/api/profile/me?page=${nextPage}`;
            } else {
                endpoint = `/api/institutions/${instId}/profile?page=${nextPage}`;
            }

            const response = await axiosClient.get(endpoint);
            const newPosts = response.data.posts?.data || [];

            if (newPosts.length === 0) {
                setHasMore(false);
            } else {
                setLocalPosts(prev => {
                    // Filter out any duplicates to prevent key warnings
                    const existingIds = new Set(prev.map(p => p.id));
                    const uniqueNewPosts = newPosts.filter(p => !existingIds.has(p.id));
                    
                    if (uniqueNewPosts.length === 0) {
                        setHasMore(false);
                        return prev;
                    }
                    
                    return [...prev, ...uniqueNewPosts];
                });
                
                setPage(nextPage);
                // If we got fewer than 12, we likely reached the end
                if (newPosts.length < 12) {
                    setHasMore(false);
                }
            }
        } catch (error) {
            console.error("Error fetching more posts", error);
            setHasMore(false);
        } finally {
            setLoadingMore(false);
        }
    };

    const lastPostRef = useCallback(node => {
        if (loadingMore) return;
        if (observer.current) observer.current.disconnect();

        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore) {
                fetchMorePosts();
            }
        }, { threshold: 0.1 });

        if (node) observer.current.observe(node);
    }, [loadingMore, hasMore, page]);

    const handleLike = async (postId) => {
        // Optimistic UI Update
        const previousPosts = [...localPosts];
        setLocalPosts(prev => prev.map(p => {
            if (p.id === postId) {
                const isLiked = !p.is_liked_by_user;
                return {
                    ...p,
                    is_liked_by_user: isLiked,
                    likes_count: isLiked ? (p.likes_count || 0) + 1 : Math.max(0, (p.likes_count || 0) - 1)
                };
            }
            return p;
        }));

        try {
            const response = await axiosClient.post(`/api/posts/${postId}/toggle-like`);
            if (response.data.status === 'success') {
                setLocalPosts(current => current.map(p =>
                    p.id === postId ? { ...p, likes_count: response.data.likes_count, is_liked_by_user: response.data.liked } : p
                ));
            }
        } catch (error) {
            console.error("Like failed", error);
            setLocalPosts(previousPosts);
        }
    };

    const handleSave = async (postId) => {
        // Optimistic UI Update
        const previousPosts = [...localPosts];
        setLocalPosts(prev => prev.map(p => {
            if (p.id === postId) {
                return { ...p, is_saved_by_user: !p.is_saved_by_user };
            }
            return p;
        }));

        try {
            const response = await axiosClient.post(`/api/posts/${postId}/save`);
            if (response.data.status === 'success') {
                setLocalPosts(current => current.map(p =>
                    p.id === postId ? { ...p, is_saved_by_user: response.data.saved } : p
                ));
            }
        } catch (error) {
            console.error("Save failed", error);
            setLocalPosts(previousPosts);
        }
    };

    const handleCopyPostLink = (post) => {
        if (!post?.share_link) return;
        const url = `${window.location.origin}/post/${post.share_link}`;
        navigator.clipboard.writeText(url).then(() => {
            setCopiedPostId(post.id);
            setTimeout(() => setCopiedPostId(null), 2000);
        });
    };

    const handleDeleteClick = (post) => {
        setSelectedPost(post);
        setIsDeleteOpen(true);
    };

    const handleConfirmDelete = async () => {
        setIsDeleting(true);
        try {
            await axiosClient.delete(`/api/posts/${selectedPost.id}`);
            setLocalPosts(localPosts.filter(p => p.id !== selectedPost.id));
            if (onPostUpdate) onPostUpdate();
            setIsDeleteOpen(false);
        } catch (error) {
            console.error("Delete post failed", error);
            alert("Failed to delete post. Please try again.");
        } finally {
            setIsDeleting(false);
        }
    };

    const handleEditClick = (post) => {
        setSelectedPost(post);
        setIsEditOpen(true);
    };

    const handlePostUpdate = (updatedPost) => {
        setLocalPosts(current => current.map(p =>
            p.id === updatedPost.id ? { ...p, ...updatedPost } : p
        ));
        if (onPostUpdate) onPostUpdate();
    };

    // Modal Handlers
    const openProgrammeModal = (post) => {
        setSelectedPost(post);
        setIsProgrammeOpen(true);
    };

    const openApplyModal = (post) => {
        setSelectedPost(post || selectedPost);
        setIsApplyOpen(true);
        setIsProgrammeOpen(false);
    };

    const openInfoModal = (post) => {
        setSelectedPost(post || selectedPost);
        setIsInfoOpen(true);
        setIsProgrammeOpen(false);
    };

    const handleApplyChange = (e) => {
        const { name, value, type, checked } = e.target;
        setApplyForm(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleApplySubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setSubmitStatus(null);

        try {
            const data = {
                ...applyForm,
                post_id: selectedPost.id,
                course_title: selectedPost.title
            };

            await axiosClient.post(`/api/course/apply/${institute.id}`, data);
            setSubmitStatus({ type: 'success', message: 'Application sent successfully!' });

            setTimeout(() => {
                setIsApplyOpen(false);
                setSubmitStatus(null);
                setApplyForm(prev => ({ ...prev, phone: '', message: '', privacy_consent: false }));
            }, 2000);
        } catch (error) {
            setSubmitStatus({
                type: 'error',
                message: error.response?.data?.message || 'Failed to send application. Please try again.'
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const isPremium = !!(institute?.is_premium && new Date(institute.premium_expires_at) > new Date());

    const visiblePosts = localPosts.filter(post => {
        // If owner, show all. If not owner, show only active.
        if (isOwner) return true;
        return post.status === 'active';
    });

    if (!visiblePosts || visiblePosts.length === 0) {
        return (
            <div id="institute-profile-posts-wrapper">
                <div className="bg-white rounded-3xl shadow-sm p-12 text-center text-gray-500 border border-slate-100">
                    <p className="text-lg font-medium text-slate-400">No posts shared yet.</p>
                </div>
            </div>
        );
    }

    return (
        <div id="institute-profile-posts-wrapper">
            <div className="posts-container">
                {visiblePosts.map((post, index) => (
                    <div
                        key={post.id}
                        ref={index === visiblePosts.length - 1 ? lastPostRef : null}
                        className={`post-card ${post.status !== 'active' ? 'post-inactive' : ''}`}
                    >
                        {/* Inactive Badge for Owner */}
                        {post.status !== 'active' && isOwner && (
                            <div className="inactive-badge">
                                Inactive
                            </div>
                        )}
                        {/* Left Split: Image */}
                        <div className="post-image-container">
                            <img
                                src={getStorageUrl(post.image)}
                                alt={post.title}
                                className="post-img"
                                loading="lazy"
                            />
                        </div>

                        {/* Right Split: Content Area */}
                        <div className="post-content-area">
                            <div className="post-header">
                                <img
                                    src={getStorageUrl(institute?.profile_photo) || `https://ui-avatars.com/api/?name=${encodeURIComponent(institute?.institute_name || 'I')}&background=random`}
                                    alt={institute?.institute_name}
                                    className="post-avatar"
                                />
                                <div className="post-info">
                                    <div className="post-author">
                                        <span className="author-name">{institute?.institute_name}</span>
                                        {institute?.is_premium && (
                                            <img
                                                src="/images/verified-badge.png"
                                                alt="Premium"
                                                className="premium-badge"
                                                onError={(e) => e.target.style.display = 'none'}
                                            />
                                        )}
                                    </div>
                                    <span className="post-time">{formatDate(post.created_at)}</span>
                                </div>

                                {isOwner && (
                                    <div className="post-header-actions">
                                        <button className="btn-header-action" onClick={() => handleEditClick(post)} title="Edit">
                                            <Edit2 size={16} />
                                        </button>
                                        <button className="btn-header-action delete" onClick={() => handleDeleteClick(post)} title="Delete">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div className="post-main-info">
                                <h3 className="post-title">{post.title}</h3>
                                <p className="post-description-text">{post.small_description || post.description}</p>
                            </div>

                            <div className="post-footer">
                                {isOwner && institute?.is_premium && (
                                    <button className="post-action-btn btn-boost">
                                        Boost Campaign
                                    </button>
                                )}

                                {!isOwner && (
                                    <>
                                        {/* Bookmark - Students only */}
                                        {user?.role === 'User' && (
                                            <div className="save-action-wrapper">
                                                <label className="ui-bookmark">
                                                    <input
                                                        type="checkbox"
                                                        checked={!!post.is_saved_by_user}
                                                        onChange={() => handleSave(post.id)}
                                                    />
                                                    <div className="bookmark">
                                                        <svg viewBox="0 0 32 32">
                                                            <g>
                                                                <path d="M27 4v27a1 1 0 0 1-1.625.781L16 24.281l-9.375 7.5A1 1 0 0 1 5 31V4a4 4 0 0 1 4-4h14a4 4 0 0 1 4 4z"></path>
                                                            </g>
                                                        </svg>
                                                    </div>
                                                </label>
                                            </div>
                                        )}

                                        {/* Copy Link Button */}
                                        <button
                                            className={`post-copy-btn ${copiedPostId === post.id ? 'copied' : ''}`}
                                            onClick={() => handleCopyPostLink(post)}
                                            title="Copy shareable link"
                                        >
                                            {copiedPostId === post.id ? <Check size={20} /> : <Link2 size={20} />}
                                        </button>

                                        {/* Like Button */}
                                        <button
                                            className={`post-action-btn btn-like ${post.is_liked_by_user ? 'liked' : ''}`}
                                            onClick={() => handleLike(post.id)}
                                        >
                                            <Heart size={16} fill={post.is_liked_by_user ? 'white' : 'transparent'} />
                                            <span>{post.likes_count || 0}</span>
                                        </button>

                                        {/* See More Button */}
                                        <button className="post-action-btn btn-see-more" onClick={() => openProgrammeModal(post)}>
                                            See More <Info size={16} />
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                ))}

                {/* Loading State Footers */}
                {loadingMore && (
                    <div className="posts-infinite-scroll-footer">
                        {isMobile ? (
                            <div className="mobile-spinner-container">
                                <div className="ui-loader loader-blk" style={{ width: '30px', height: '30px' }}>
                                    <svg viewBox="22 22 44 44" className="multiColor-loader">
                                        <circle cx="44" cy="44" r="20.2" fill="none" strokeWidth="3.6" className="loader-circle loader-circle-animation"></circle>
                                    </svg>
                                </div>
                            </div>
                        ) : (
                            <div className="skeleton-container">
                                <PostSkeleton />
                                <PostSkeleton />
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Modals */}
            {selectedPost && (
                <>
                    <ProgrammeInfoModal
                        isOpen={isProgrammeOpen}
                        onClose={() => setIsProgrammeOpen(false)}
                        course={selectedPost}
                        userRole={user?.role}
                        onApply={() => openApplyModal()}
                        onMoreInfo={() => openInfoModal()}
                        isPremium={isPremium}
                        institute={institute}
                    />

                    <ApplyNowModal
                        isOpen={isApplyOpen}
                        onClose={() => setIsApplyOpen(false)}
                        courseTitle={selectedPost.title}
                        form={applyForm}
                        onChange={handleApplyChange}
                        onSubmit={handleApplySubmit}
                        isSubmitting={isSubmitting}
                        status={submitStatus}
                    />

                    <MoreInfoModal
                        isOpen={isInfoOpen}
                        onClose={() => setIsInfoOpen(false)}
                        contactNumber={institute?.contact_number || 'N/A'}
                    />

                    <EditPostModal
                        isOpen={isEditOpen}
                        onClose={() => setIsEditOpen(false)}
                        post={selectedPost}
                        onUpdate={handlePostUpdate}
                    />

                    <DeleteConfirmModal
                        isOpen={isDeleteOpen}
                        onClose={() => setIsDeleteOpen(false)}
                        onConfirm={handleConfirmDelete}
                        isDeleting={isDeleting}
                        title={selectedPost?.title}
                    />
                </>
            )}
        </div>
    );
};

export default InstitutePosts;
