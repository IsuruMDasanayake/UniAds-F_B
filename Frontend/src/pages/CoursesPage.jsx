import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search, ChevronDown, ChevronUp, Clock, MapPin,
    BookOpen, GraduationCap, BadgeCheck, X, Send,
    Info, Bookmark, Heart, Loader2, Star, ChevronRight
} from 'lucide-react';
import Navbar from '../components/Navbar';
import axiosClient from '../lib/axios';
import { getStorageUrl } from '../lib/config';
import ProgrammeInfoModal from '../components/Modals/ProgrammeInfoModal';
import ApplyNowModal from '../components/Modals/ApplyNowModal';
import MoreInfoModal from '../components/Modals/MoreInfoModal';
import './CoursesPage.css';

const CoursesPage = () => {
    const { filterType, filterValue } = useParams();
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [categories, setCategories] = useState({});
    const [posts, setPosts] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [expandedSections, setExpandedSections] = useState({});

    // Modal states
    const [selectedPost, setSelectedPost] = useState(null);
    const [showApplyModal, setShowApplyModal] = useState(false);
    const [showInfoModal, setShowInfoModal] = useState(false);
    const [applying, setApplying] = useState(false);
    const [submissionStatus, setSubmissionStatus] = useState({ type: '', message: '' });
    const [applyForm, setApplyForm] = useState({
        name: '',
        email: '',
        phone: '',
        message: '',
        privacyConsent: false
    });

    useEffect(() => {
        fetchData();
        // Reset scroll
        window.scrollTo(0, 0);
    }, [filterType, filterValue]);

    const fetchData = async () => {
        setLoading(true);
        let currentUser = null;
        try {
            // Attempt to fetch user profile to check for saved posts
            try {
                const userRes = await axiosClient.get('/api/profile/me');
                currentUser = userRes.data.user;
                if (userRes.data.role === 'Institute') {
                    currentUser.institute = userRes.data.institute;
                }
                setUser(currentUser);
                try {
                    localStorage.setItem('APP_USER', JSON.stringify(currentUser));
                } catch (e) { }
            } catch (err) {
                console.warn('User not authenticated, proceeding as guest');
            }

            if (filterType && filterValue) {
                const response = await axiosClient.get(`/api/posts/filter/${filterType}/${filterValue}`);
                let fetchedPosts = response.data.posts || [];

                // If user is logged in, map saved status
                if (currentUser && currentUser.saved_posts) {
                    const savedIds = currentUser.saved_posts.map(p => p.id);
                    fetchedPosts = fetchedPosts.map(post => ({
                        ...post,
                        is_saved: savedIds.includes(post.id)
                    }));
                }

                setPosts(fetchedPosts);
            } else {
                const response = await axiosClient.get('/api/categories');
                setCategories(response.data);
                // Initialize all sections as expanded
                const initials = {};
                Object.keys(response.data).forEach(key => initials[key] = true);
                setExpandedSections(initials);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const toggleSection = (section) => {
        setExpandedSections(prev => ({
            ...prev,
            [section]: !prev[section]
        }));
    };

    const handleSearch = (e) => {
        setSearchQuery(e.target.value.toLowerCase());
    };

    const openProgrammeInfo = (post) => {
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
                post_id: selectedPost.id,
                course_title: selectedPost.title,
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
            console.error('Application error:', error);
            const errorMsg = error.response?.data?.message || "Failed to submit application. Please try again.";
            setSubmissionStatus({ type: 'error', message: errorMsg });
        } finally {
            setApplying(false);
        }
    };

    const handleToggleSave = async (postId) => {
        try {
            await axiosClient.post(`/api/posts/${postId}/save`);
            // Update local state
            setPosts(posts.map(p => p.id === postId ? { ...p, is_saved: !p.is_saved } : p));
        } catch (error) {
            console.error('Error saving post:', error);
        }
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1 }
    };

    return (
        <div className="courses-page-v2">
            <Navbar user={user} />

            <main className="courses-container">
                {loading ? (
                    <div className="courses-loading-overlay">
                        <div className="spinner-box">
                            <div className="ui-loader loader-blk">
                                <svg viewBox="22 22 44 44" className="multiColor-loader">
                                    <circle cx="44" cy="44" r="20.2" fill="none" strokeWidth="3.6" className="loader-circle loader-circle-animation"></circle>
                                </svg>
                            </div>
                            <p>Loading programs...</p>
                        </div>
                    </div>
                ) : filterType && filterValue ? (
                    // ---------------- FILTERED RESULTS VIEW ----------------
                    <div className="results-view">
                        <header className="results-header">
                            <div className="header-breadcrumbs">
                                <Link to="/courses">Courses</Link>
                                <ChevronRight size={16} />
                                <span>{filterType}</span>
                                <ChevronRight size={16} />
                                <span className="active">{filterValue}</span>
                            </div>
                            <h1>Programs in {filterValue}</h1>
                            <p>Showing {posts.length} programs available now</p>
                        </header>

                        <motion.div
                            className="posts-grid-v2"
                            variants={containerVariants}
                            initial="hidden"
                            animate="visible"
                        >
                            {posts.length > 0 ? (
                                posts.map(post => (
                                    <motion.div
                                        key={post.id}
                                        className="premium-course-card"
                                        variants={itemVariants}
                                    >
                                        <div className="card-top">
                                            <img src={getStorageUrl(post.image)} alt={post.title} />
                                            <div className="type-badge">{post.course_type}</div>
                                            <button
                                                className={`save-circle ${post.is_saved ? 'saved' : ''}`}
                                                onClick={(e) => { e.preventDefault(); handleToggleSave(post.id); }}
                                            >
                                                <Bookmark size={18} fill={post.is_saved ? "currentColor" : "none"} />
                                            </button>
                                        </div>
                                        <div className="card-inner">
                                            <div className="inst-row">
                                                <Link
                                                    to={(user?.role === 'Institute' && user?.institute?.id === post.institute?.id) ? '/profile' : `/institutions/${post.institute?.id}/profile`}
                                                    style={{ textDecoration: 'none' }}
                                                >
                                                    <img
                                                        src={getStorageUrl(post.institute?.profile_photo) || '/images/default-logo.png'}
                                                        alt={post.institute?.institute_name}
                                                    />
                                                </Link>
                                                <div className="inst-meta">
                                                    <Link
                                                        to={(user?.role === 'Institute' && user?.institute?.id === post.institute?.id) ? '/profile' : `/institutions/${post.institute?.id}/profile`}
                                                        style={{ textDecoration: 'none', color: 'inherit' }}
                                                    >
                                                        <span className="name">
                                                            {post.institute?.institute_name}
                                                            {!!post.institute?.is_premium && <BadgeCheck size={14} className="v-badge" />}
                                                        </span>
                                                    </Link>
                                                    <span className="loc">{post.location}</span>
                                                </div>
                                            </div>
                                            <h3 className="course-title">{post.title}</h3>
                                            <p className="description">{post.small_description}</p>
                                            <div className="course-stats">
                                                <span><Clock size={14} /> {post.duration}</span>
                                                <span><MapPin size={14} /> {post.location}</span>
                                            </div>
                                            <button className="main-apply-btn" onClick={() => openProgrammeInfo(post)}>
                                                View Information
                                            </button>
                                        </div>
                                    </motion.div>
                                ))
                            ) : (
                                <div className="no-courses">
                                    <Info size={48} />
                                    <h3>No programs found</h3>
                                    <p>We couldn't find any programs in this category. Try browsing others!</p>
                                    <Link to="/courses" className="back-btn">Back to Disciplines</Link>
                                </div>
                            )}
                        </motion.div>
                    </div>
                ) : (
                    // ---------------- BROWSE BY DISCIPLINE VIEW ----------------
                    <div className="browse-view">
                        <header className="browse-header">
                            <h1>Explore Our Disciplines</h1>
                            <p>Find your perfect course from our extensive range of programs</p>

                            <div className="browse-search">
                                <Search size={20} />
                                <input
                                    type="text"
                                    placeholder="Search for a program or discipline..."
                                    value={searchQuery}
                                    onChange={handleSearch}
                                />
                            </div>
                        </header>

                        <div className="disciplines-sections">
                            {Object.entries(categories).map(([mainCategory, items]) => {
                                const filteredItems = items.filter(cat =>
                                    cat.name.toLowerCase().includes(searchQuery)
                                );

                                if (searchQuery && filteredItems.length === 0) return null;

                                return (
                                    <div key={mainCategory} className="discipline-group">
                                        <div className="group-header" onClick={() => toggleSection(mainCategory)}>
                                            <h2>{mainCategory}</h2>
                                            {expandedSections[mainCategory] ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                        </div>

                                        <AnimatePresence>
                                            {expandedSections[mainCategory] && (
                                                <motion.div
                                                    className="category-grid"
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: 'auto', opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                >
                                                    {filteredItems.map(category => (
                                                        <Link
                                                            key={category.id}
                                                            to={`/courses/${mainCategory}/${category.name}`}
                                                            className="category-card"
                                                        >
                                                            <div className="card-icon">
                                                                <i className={category.icon || 'fas fa-graduation-cap'}></i>
                                                            </div>
                                                            <p>{category.name}</p>
                                                        </Link>
                                                    ))}
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </main>

            {/* Modals integrated from the system design */}
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
};

export default CoursesPage;
