import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search, ChevronDown, ChevronUp, Clock, MapPin,
    BookOpen, GraduationCap, BadgeCheck, X, Send,
    Info, Bookmark, Heart, Loader2, Star, ChevronRight, Link2, Check
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
    
    // New Filter States
    const [activeFilters, setActiveFilters] = useState({});
    const [openFilterDropdown, setOpenFilterDropdown] = useState(null);

    // Derived filtering logic using useMemo to ensure stability and avoid race conditions
    const filteredPosts = useMemo(() => {
        let result = [...posts];

        // Apply Search Query (if any)
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            result = result.filter(post => 
                (post.title?.toLowerCase() || '').includes(query) ||
                (post.course_name?.toLowerCase() || '').includes(query) ||
                (post.institute?.institute_name?.toLowerCase() || '').includes(query)
            );
        }

        // Apply Dropdown Filters
        Object.entries(activeFilters).forEach(([category, selectedValues]) => {
            if (selectedValues && selectedValues.length > 0) {
                const columnMap = {
                    'Course Type': 'course_type',
                    'Location': 'location',
                    'Duration': 'duration',
                    'Course Format': 'course_format',
                    'Attendance Type': 'attendance_type'
                };
                const column = columnMap[category];
                if (column) {
                    result = result.filter(post => {
                        if (column === 'location') {
                            const postLoc = post.location?.toLowerCase() || '';
                            return selectedValues.some(val => 
                                postLoc.includes(val.toLowerCase())
                            );
                        }
                        return selectedValues.includes(post[column]);
                    });
                }
            }
        });

        return result;
    }, [posts, searchQuery, activeFilters]);

    // Click outside handler for dropdowns
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (openFilterDropdown && !event.target.closest('.filter-dropdown-container')) {
                setOpenFilterDropdown(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [openFilterDropdown]);

    // Modal states
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
        fetchData();
        // Reset scroll
        window.scrollTo(0, 0);
        // Clear search query when navigating between main categories
        setSearchQuery('');
    }, [filterType, filterValue]);


    const fetchData = async () => {
        setLoading(true);
        let currentUser = null;
        try {
            // Fetch categories first as they are needed in both views now
            const catResponse = await axiosClient.get('/api/categories');
            setCategories(catResponse.data);
            
            // Initialize all sections as expanded for browse view
            const initials = {};
            Object.keys(catResponse.data).forEach(key => initials[key] = true);
            setExpandedSections(initials);

            // Attempt to fetch user profile
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
                
                // Reset active filters when moving to a new main category
                setActiveFilters({});
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

    const toggleFilterValue = (category, value) => {
        setActiveFilters(prev => {
            const currentSelected = prev[category] || [];
            const newSelected = currentSelected.includes(value)
                ? currentSelected.filter(v => v !== value)
                : [...currentSelected, value];

            // If no values left, remove the category key to keep state clean
            if (newSelected.length === 0) {
                const newState = { ...prev };
                delete newState[category];
                return newState;
            }

            return { ...prev, [category]: newSelected };
        });
    };

    const clearAllFilters = () => {
        setActiveFilters({});
        setSearchQuery('');
    };

    const openProgrammeInfo = (post) => {
        setSelectedPost(post);
        // Track view
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

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const datePart = date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
        const timePart = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
        return `${datePart} | ${timePart}`;
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
                            
                            <div className="results-title-bar">
                                <div>
                                    <h1>Programs in {filterValue}</h1>
                                    <p>Showing {filteredPosts.length} programs available now</p>
                                </div>
                                
                                {Object.keys(activeFilters).some(cat => activeFilters[cat].length > 0) && (
                                    <button className="clear-filters-btn" onClick={clearAllFilters}>
                                        <X size={14} /> Clear Filters
                                    </button>
                                )}
                            </div>

                            {/* NEW TOP FILTER BAR */}
                            <div className="top-filter-bar">
                                <div className="filters-container">
                                    {Object.entries(categories)
                                        .filter(([mainCat]) => mainCat !== 'Courses')
                                        .map(([mainCat, items]) => (
                                            <div key={mainCat} className="filter-dropdown-container">
                                                <button 
                                                    className={`filter-dropdown-trigger ${activeFilters[mainCat]?.length > 0 ? 'has-active' : ''} ${openFilterDropdown === mainCat ? 'active' : ''}`}
                                                    onClick={() => setOpenFilterDropdown(openFilterDropdown === mainCat ? null : mainCat)}
                                                >
                                                    {mainCat}
                                                    {activeFilters[mainCat]?.length > 0 && (
                                                        <span className="count-badge">{activeFilters[mainCat].length}</span>
                                                    )}
                                                    <ChevronDown size={16} />
                                                </button>
                                                
                                                <AnimatePresence>
                                                    {openFilterDropdown === mainCat && (
                                                        <motion.div 
                                                            className="filter-dropdown-content"
                                                            initial={{ opacity: 0, y: 10 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            exit={{ opacity: 0, y: 10 }}
                                                        >
                                                            <div className="dropdown-options">
                                                                {items.map(item => (
                                                                    <label key={item.id} className="filter-option">
                                                                        <input 
                                                                            type="checkbox"
                                                                            checked={activeFilters[mainCat]?.includes(item.name) || false}
                                                                            onChange={() => toggleFilterValue(mainCat, item.name)}
                                                                        />
                                                                        <span className="checkbox-custom">
                                                                            <Check size={12} />
                                                                        </span>
                                                                        <span className="option-label">{item.name}</span>
                                                                    </label>
                                                                ))}
                                                            </div>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </div>
                                        ))
                                    }
                                </div>

                                <div className="results-search">
                                    <Search size={18} />
                                    <input 
                                        type="text" 
                                        placeholder="Search within results..." 
                                        value={searchQuery}
                                        onChange={handleSearch}
                                    />
                                    {searchQuery && (
                                        <button className="search-clear" onClick={() => setSearchQuery('')}>
                                            <X size={14} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </header>

                        <motion.div
                            key={`grid-${filterType}-${filterValue}-${searchQuery}-${JSON.stringify(activeFilters)}`}
                            className="posts-grid-v2"
                            variants={containerVariants}
                            initial="hidden"
                            animate="visible"
                        >
                            {filteredPosts.length > 0 ? (
                                filteredPosts.map(post => (
                                    <motion.div
                                        key={post.id}
                                        className={`premium-course-card ${post.status !== 'active' ? 'post-inactive' : ''}`}
                                        variants={itemVariants}
                                    >
                                        <div className="card-top">
                                            {/* Inactive Badge */}
                                            {post.status !== 'active' && (
                                                <div className="inactive-badge">
                                                    Inactive
                                                </div>
                                            )}
                                            <img src={getStorageUrl(post.image)} alt={post.title} />
                                            <div className="type-badge">{post.course_type}</div>
                                            {user?.role !== 'Institute' && (
                                                <button
                                                    className={`save-circle ${post.is_saved ? 'saved' : ''}`}
                                                    onClick={(e) => { e.preventDefault(); handleToggleSave(post.id); }}
                                                >
                                                    <Bookmark size={18} fill={post.is_saved ? "currentColor" : "none"} />
                                                </button>
                                            )}
                                            {/* Copy Link Button - Visible to all roles */}
                                            <button
                                                className={`copy-link-btn ${copiedPostId === post.id ? 'copied' : ''}`}
                                                onClick={(e) => { e.preventDefault(); handleCopyPostLink(post); }}
                                                title="Copy shareable link"
                                            >
                                                {copiedPostId === post.id ? <Check size={18} /> : <Link2 size={18} />}
                                            </button>
                                        </div>
                                        <div className="card-inner">
                                            <div className="inst-row">
                                                <Link
                                                    to={(user?.role === 'Institute' && user?.institute?.id === post.institute?.id) ? '/profile' : `/institutions/${post.institute?.slug || post.institute?.id}/profile`}
                                                    style={{ textDecoration: 'none' }}
                                                >
                                                    <img
                                                        src={getStorageUrl(post.institute?.profile_photo) || '/images/default-logo.png'}
                                                        alt={post.institute?.institute_name}
                                                    />
                                                </Link>
                                                <div className="inst-meta">
                                                    <Link
                                                        to={(user?.role === 'Institute' && user?.institute?.id === post.institute?.id) ? '/profile' : `/institutions/${post.institute?.slug || post.institute?.id}/profile`}
                                                        style={{ textDecoration: 'none', color: 'inherit' }}
                                                    >
                                                        <span className="name">
                                                              {post.institute?.institute_name}
                                                            {!!post.institute?.is_premium && <BadgeCheck size={18} fill="#ff4757" color="#ffffff" style={{ marginLeft: '4px', display: 'inline-block' }} className="v-badge" />}
                                                        </span>
                                                    </Link>
                                                    <span className="loc">{formatDate(post.created_at)}</span>
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
                                    <p>We couldn't find any programs matching your filters. Try adjusting them!</p>
                                    <button onClick={clearAllFilters} className="back-btn">Clear All Filters</button>
                                </div>
                            )
                            }
                        </motion.div>
                    </div >
                ) : (
                    // ---------------- BROWSE BY DISCIPLINE VIEW ----------------
                    <div className="browse-view">
                        <header className="browse-header">
                            <h1>Explore Our <span>Disciplines</span></h1>
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
                            {/* ONLY DISPLAY "COURSES" CATEGORY HERE */}
                            {Object.entries(categories)
                                .filter(([mainCategory]) => mainCategory === 'Courses')
                                .map(([mainCategory, items]) => {
                                    const filteredItems = items.filter(cat =>
                                        cat.name.toLowerCase().includes(searchQuery)
                                    );

                                    if (searchQuery && filteredItems.length === 0) return null;

                                    return (
                                        <div key={mainCategory} className="discipline-group">
                                            {/* <div className="group-header" onClick={() => toggleSection(mainCategory)}>
                                                <h2>{mainCategory}</h2>
                                                {expandedSections[mainCategory] ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                            </div> */}

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
            </main >

            {/* Modals integrated from the system design */}
            {/* Reusable Modals */}
            <ProgrammeInfoModal
                course={selectedPost}
                isOpen={!!selectedPost && !showApplyModal && !showInfoModal}
                onClose={closeModals}
                onApply={() => setShowApplyModal(true)}
                onMoreInfo={() => setShowInfoModal(true)}
                userRole={user?.role}
                isPremium={!!selectedPost?.institute?.is_premium}
                institute={selectedPost?.institute}
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
                course={selectedPost}
            />
        </div >
    );
};

export default CoursesPage;
