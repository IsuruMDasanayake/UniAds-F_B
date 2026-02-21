import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Home, Building2, GraduationCap, Bookmark, CheckCircle2, BadgeCheck,
    X, Send, Info, Loader2, Link2, Check
} from 'lucide-react';
import axiosClient from '../lib/axios';
import { getStorageUrl } from '../lib/config';
import Navbar from '../components/Navbar';
import ProgrammeInfoModal from '../components/Modals/ProgrammeInfoModal';
import ApplyNowModal from '../components/Modals/ApplyNowModal';
import MoreInfoModal from '../components/Modals/MoreInfoModal';
import './SavedPostsPage.css';

function SavedPostsPage() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [savedPosts, setSavedPosts] = useState([]);
    const [selectedPost, setSelectedPost] = useState(null);
    const [showApplyModal, setShowApplyModal] = useState(false);
    const [showInfoModal, setShowInfoModal] = useState(false);
    const [applying, setApplying] = useState(false);
    const [submissionStatus, setSubmissionStatus] = useState({ type: '', message: '' });
    const [copiedPostId, setCopiedPostId] = useState(null);
    const [applyForm, setApplyForm] = useState({
        name: '',
        email: '',
        phone: '',
        message: '',
        privacyConsent: false
    });

    useEffect(() => {
        const fetchSavedPosts = async () => {
            try {
                const [userRes, savedRes] = await Promise.all([
                    axiosClient.get('/api/user'),
                    axiosClient.get('/api/posts/saved')
                ]);
                setUser(userRes.data);

                let posts = savedRes.data.posts.data || [];
                // For normal users, filter out inactive posts
                if (userRes.data.role === 'User') {
                    posts = posts.filter(p => p.status === 'active');
                }

                setSavedPosts(posts);
            } catch (error) {
                console.error('Failed to fetch saved posts:', error);
                if (error.response?.status === 401) navigate('/login');
            } finally {
                setLoading(false);
            }
        };
        fetchSavedPosts();
    }, [navigate]);

    const handleToggleSave = async (postId) => {
        try {
            await axiosClient.post(`/api/posts/${postId}/save`);
            setSavedPosts(savedPosts.filter(post => post.id !== postId));
        } catch (error) {
            console.error('Error un-saving post:', error);
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

    const openPostModal = (post) => {
        setSelectedPost(post);
        // Track view
        axiosClient.post(`/api/posts/${post.id}/track-view`).catch(err => console.error(err));
    };

    const closeModals = () => {
        setSelectedPost(null);
        setShowApplyModal(false);
        setShowInfoModal(false);
        setSubmissionStatus({ type: '', message: '' });
    };

    const handleApplySubmit = async (e) => {
        e.preventDefault();

        setApplying(true);
        setSubmissionStatus({ type: '', message: '' });

        try {
            await axiosClient.post(`/api/course/apply/${selectedPost.institute_id}`, {
                ...applyForm,
                course_title: selectedPost.title,
                post_id: selectedPost.id,
                privacy_consent: applyForm.privacyConsent // Map for backend
            });

            setSubmissionStatus({ type: 'success', message: 'Application submitted successfully! We wish you all the best for your future.' });

            // Clear form
            setApplyForm({ name: '', email: '', phone: '', message: '', privacyConsent: false });

            setTimeout(() => {
                setShowApplyModal(false);
                setSubmissionStatus({ type: '', message: '' });
            }, 5000);

        } catch (error) {
            console.error('Error submitting application:', error);
            const errorMsg = error.response?.data?.message || "Failed to submit application. Please try again.";
            setSubmissionStatus({ type: 'error', message: errorMsg });
        } finally {
            setApplying(false);
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const datePart = date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
        const timePart = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
        return `${datePart} | ${timePart}`;
    };

    if (loading) {
        return (
            <div className="loading-screen">
                <div className="ui-loader loader-blk">
                    <svg viewBox="22 22 44 44" className="multiColor-loader">
                        <circle cx="44" cy="44" r="20.2" fill="none" strokeWidth="3.6" className="loader-circle loader-circle-animation"></circle>
                    </svg>
                </div>
            </div>
        );
    }

    return (
        <div className="saved-page-container">
            <Navbar user={user} />

            <main className="saved-page-content">
                <h2 className="saved-page-title">Your Saved Posts</h2>

                {savedPosts.length === 0 ? (
                    <div className="no-saved-posts">
                        <Bookmark size={48} />
                        <p>You haven&apos;t saved any posts yet.</p>
                        <Link to="/feed" className="browse-btn">Browse Feed</Link>
                    </div>
                ) : (
                    <div className="saved-posts-list">
                        <AnimatePresence>
                            {savedPosts.map((post) => (
                                <motion.div
                                    key={post.id}
                                    className="saved-post-card"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    layout
                                >
                                    <div className="saved-post-image">
                                        {/* Inactive Badge */}
                                        {post.status !== 'active' && (
                                            <div className="saved-inactive-badge">
                                                Inactive
                                            </div>
                                        )}
                                        <img
                                            src={post.image ? getStorageUrl(post.image) : '/images/profile.png'}
                                            alt={post.title}
                                        />
                                    </div>

                                    <div className="saved-post-content">
                                        <div className="saved-post-header">
                                            <Link
                                                to={(user?.role === 'Institute' && user?.institute?.id === post.institute?.id) ? '/profile' : `/institutions/${post.institute?.slug || post.institute?.id}/profile`}
                                                className="institute-badge-top"
                                                style={{ textDecoration: 'none', color: 'inherit' }}
                                            >
                                                <div className="institute-icon">
                                                    {post.institute?.profile_photo ? (
                                                        <img
                                                            src={getStorageUrl(post.institute.profile_photo)}
                                                            alt={post.institute.institute_name}
                                                        />
                                                    ) : (
                                                        <span>{post.institute?.institute_name?.charAt(0) || 'U'}</span>
                                                    )}
                                                </div>
                                                <span className="institute-name-text">
                                                    {post.institute?.institute_name || 'UniAds'}
                                                </span>
                                                {!!(post.institute?.is_premium && post.institute?.premium_expires_at && new Date() <= new Date(post.institute.premium_expires_at)) && (
                                                    <BadgeCheck size={18} fill="#ff4757" color="#ffffff" style={{ marginLeft: '4px', verticalAlign: 'middle', display: 'inline-block', marginTop: '-0.4rem' }} />
                                                )}
                                            </Link>
                                            <span className="post-timestamp">{formatDate(post.created_at)}</span>
                                        </div>

                                        <h3 className="saved-post-title">{post.title}</h3>

                                        <p className="saved-post-description">{post.small_description}</p>

                                        <div className="saved-post-meta">
                                            {post.course_type} / {post.duration} / {post.location}
                                        </div>

                                        <div className="saved-post-footer">
                                            <button
                                                className="view-programme-btn"
                                                onClick={() => openPostModal(post)}
                                            >
                                                View Programme Information
                                            </button>
                                            <div className="footer-actions-right">
                                                {/* Copy Link Button */}
                                                <button
                                                    className={`saved-copy-btn ${copiedPostId === post.id ? 'copied' : ''}`}
                                                    onClick={() => handleCopyPostLink(post)}
                                                    title="Copy shareable link"
                                                >
                                                    {copiedPostId === post.id ? <Check size={20} /> : <Link2 size={20} />}
                                                </button>
                                                <div className="save-action-wrapper">
                                                    <label className="ui-bookmark">
                                                        <input
                                                            type="checkbox"
                                                            checked={true}
                                                            onChange={() => handleToggleSave(post.id)}
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
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </main>

            {/* Reusable Modals */}
            <ProgrammeInfoModal
                course={selectedPost}
                isOpen={!!selectedPost && !showApplyModal && !showInfoModal}
                onClose={closeModals}
                onApply={() => setShowApplyModal(true)}
                onMoreInfo={() => setShowInfoModal(true)}
                userRole={user?.role}
            />

            <ApplyNowModal
                isOpen={showApplyModal}
                onClose={() => setShowApplyModal(false)}
                courseTitle={selectedPost?.title}
                form={{ ...applyForm, privacy_consent: applyForm.privacyConsent }}
                onChange={(e) => {
                    const { name, value, checked, type } = e.target;
                    if (name === 'privacy_consent') {
                        setApplyForm({ ...applyForm, privacyConsent: checked });
                    } else {
                        setApplyForm({ ...applyForm, [name]: type === 'checkbox' ? checked : value });
                    }
                }}
                onSubmit={handleApplySubmit}
                isSubmitting={applying}
                status={submissionStatus}
            />

            <MoreInfoModal
                isOpen={showInfoModal}
                onClose={() => setShowInfoModal(false)}
                contactNumber={selectedPost?.institute?.contact_number}
            />
        </div>
    );
}

export default SavedPostsPage;
