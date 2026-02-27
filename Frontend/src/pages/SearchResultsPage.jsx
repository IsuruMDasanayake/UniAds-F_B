import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search, BookOpen, Building2, MapPin, Loader2,
    Bookmark, CheckCircle2, BadgeCheck, X, Send, Info, Link2, Check
} from 'lucide-react';
import axiosClient from '../lib/axios';
import { getStorageUrl } from '../lib/config';
import Navbar from '../components/Navbar';
import ProgrammeInfoModal from '../components/Modals/ProgrammeInfoModal';
import ApplyNowModal from '../components/Modals/ApplyNowModal';
import MoreInfoModal from '../components/Modals/MoreInfoModal';
import './SearchResultsPage.css';

function SearchResultsPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const query = searchParams.get('query') || '';

    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [posts, setPosts] = useState([]);

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
        const fetchResults = async () => {
            setLoading(true);
            try {
                const [userRes, searchRes] = await Promise.all([
                    axiosClient.get('/api/user'),
                    axiosClient.get(`/api/search?query=${query}`)
                ]);
                setUser(userRes.data);

                // The backend now returns paginated posts or an object with 'posts'
                const results = searchRes.data.posts.data || searchRes.data.posts || [];
                setPosts(results);

                // If the search was a share_link match, auto-open the modal
                if (searchRes.data.is_share_link_match && results.length === 1) {
                    setSelectedPost(results[0]);
                    axiosClient.post(`/api/posts/${results[0].id}/track-view`).catch(() => { });
                }
            } catch (error) {
                console.error('Error fetching search results:', error);
            } finally {
                setLoading(false);
            }
        };

        if (query) {
            fetchResults();
        } else {
            setLoading(false);
        }
    }, [query]);

    const handleToggleSave = async (postId) => {
        try {
            await axiosClient.post(`/api/posts/${postId}/save`);
            // Update local state to reflect save status
            setPosts(posts.map(post => {
                if (post.id === postId) {
                    const isSaved = user?.saved_posts?.some(sp => sp.id === postId);
                    // This is a bit tricky since we don't have the full saved status in the search array directly
                    // but we can toggle it if the backend returns it. 
                    // For now, let's just show a notification or assume success.
                }
                return post;
            }));
            // Refresh user to get updated saved_posts
            const userRes = await axiosClient.get('/api/user');
            setUser(userRes.data);
        } catch (error) {
            console.error('Error toggling save:', error);
        }
    };

    const isPostSaved = (postId) => {
        return user?.saved_posts?.some(sp => sp.id === postId);
    };

    const openPostModal = (post) => {
        setSelectedPost(post);
        axiosClient.post(`/api/posts/${post.id}/track-view`).catch(err => console.error(err));
    };

    const handleCopyPostLink = (post) => {
        if (!post?.share_link) return;
        const url = `${window.location.origin}/post/${post.share_link}`;
        navigator.clipboard.writeText(url).then(() => {
            setCopiedPostId(post.id);
            setTimeout(() => setCopiedPostId(null), 2000);
        });
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
                privacy_consent: applyForm.privacyConsent
            });

            setSubmissionStatus({ type: 'success', message: 'Application submitted successfully!' });
            setApplyForm({ name: '', email: '', phone: '', message: '', privacyConsent: false });

            setTimeout(() => {
                setShowApplyModal(false);
                setSubmissionStatus({ type: '', message: '' });
            }, 5000);
        } catch (error) {
            const errorMsg = error.response?.data?.message || "Failed to submit application.";
            setSubmissionStatus({ type: 'error', message: errorMsg });
        } finally {
            setApplying(false);
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
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
        <div className="search-page-container">
            <Navbar user={user} />

            <main className="search-page-content">
                <header className="search-results-header">
                    <h2 className="search-results-title">
                        {query ? `Results for "${query}"` : 'Search Results'}
                    </h2>
                </header>

                {posts.length === 0 ? (
                    <div className="no-results-found-custom">
                        <Search size={48} />
                        <p>No courses found matching your search.</p>
                        <Link to="/feed" className="browse-btn">Go to Feed</Link>
                    </div>
                ) : (
                    <div className="search-posts-list">
                        <AnimatePresence>
                            {posts.map((post) => (
                                <motion.div
                                    key={post.id}
                                    className="search-post-card"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    layout
                                >
                                    <div className="search-post-image">
                                        {post.status !== 'active' && (
                                            <div className="search-inactive-badge">Inactive</div>
                                        )}
                                        <img
                                            src={post.image ? getStorageUrl(post.image) : '/images/course-default.png'}
                                            alt={post.title}
                                        />
                                    </div>

                                    <div className="search-post-content">
                                        <div className="search-post-header">
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
                                                {!!(post.institute?.is_premium) && (
                                                    <BadgeCheck size={18} fill="#ff4757" color="#ffffff" style={{ marginLeft: '4px', verticalAlign: 'middle', display: 'inline-block', marginTop: '-0.4rem' }} />
                                                )}
                                            </Link>
                                            <span className="post-timestamp">{formatDate(post.created_at)}</span>
                                        </div>

                                        <h3 className="search-post-title">{post.title}</h3>
                                        <p className="search-post-description">{post.small_description}</p>

                                        <div className="search-post-meta">
                                            {post.course_type} / {post.duration} / {post.location}
                                        </div>

                                        <div className="search-post-footer">
                                            <button
                                                className="view-programme-btn"
                                                onClick={() => openPostModal(post)}
                                            >
                                                View Programme Information
                                            </button>
                                            <div className="footer-actions-right">
                                                <button
                                                    className={`search-copy-link-btn ${copiedPostId === post.id ? 'copied' : ''}`}
                                                    onClick={() => handleCopyPostLink(post)}
                                                    title="Copy shareable link"
                                                >
                                                    {copiedPostId === post.id ? <Check size={18} /> : <Link2 size={18} />}
                                                </button>
                                                {user?.role === 'User' && (
                                                    <div className="save-action-wrapper">
                                                        <label className="ui-bookmark">
                                                            <input
                                                                type="checkbox"
                                                                checked={isPostSaved(post.id)}
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
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </main>

            <ProgrammeInfoModal
                course={selectedPost}
                isOpen={!!selectedPost && !showApplyModal && !showInfoModal}
                onClose={closeModals}
                onApply={() => setShowApplyModal(true)}
                onMoreInfo={() => setShowInfoModal(true)}
                userRole={user?.role}
                isPremium={!!(selectedPost?.institute?.is_premium && selectedPost?.institute?.premium_expires_at && new Date() <= new Date(selectedPost.institute.premium_expires_at))}
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

export default SearchResultsPage;
