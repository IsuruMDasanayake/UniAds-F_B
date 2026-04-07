import { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, ExternalLink, BadgeCheck, Search, X } from 'lucide-react';
import Navbar from '../components/Navbar';
import axiosClient from '../lib/axios';
import { getStorageUrl } from '../lib/config';
import { isPremiumActive } from '../utils/premium';
import './InstitutionsPage.css';

const InstitutionsPage = () => {
    const [institutions, setInstitutions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [debouncedQuery, setDebouncedQuery] = useState('');
    const [isFirstLoad, setIsFirstLoad] = useState(true);
    const [searching, setSearching] = useState(false);

    const observer = useRef();
    const lastInstitutionRef = useCallback(node => {
        if (loading || loadingMore) return;
        if (observer.current) observer.current.disconnect();
        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore) {
                setPage(prevPage => prevPage + 1);
            }
        });
        if (node) observer.current.observe(node);
    }, [loading, loadingMore, hasMore]);

    // Debounce search query
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedQuery(searchQuery);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    // Initial fetch and search reset
    useEffect(() => {
        setPage(1);
        setHasMore(true);
        fetchInstitutions(1, true);
    }, [debouncedQuery]);

    // Fetch more pages
    useEffect(() => {
        if (page > 1) {
            fetchInstitutions(page, false);
        }
    }, [page]);

    // Fetch user profile
    useEffect(() => {
        fetchUserProfile();
    }, []);

    const fetchUserProfile = async () => {
        try {
            const profileRes = await axiosClient.get('/api/profile/me');
            const payload = profileRes.data.data;
            const currentUser = payload.user;
            if (payload.role === 'Institute') {
                currentUser.institute = payload.institute;
            }
            setUser(currentUser);
        } catch (e) {
            console.error('Error fetching profile', e?.message || e);
            setUser(null);
        }
    };

    const fetchInstitutions = async (pageNum, isInitial) => {
        if (isInitial) {
            if (isFirstLoad) setLoading(true);
            else setSearching(true);
        } else {
            setLoadingMore(true);
        }

        try {
            const response = await axiosClient.get(`/api/institutions?query=${debouncedQuery}&page=${pageNum}&per_page=12`);
            // response.data is { success, message, data: { data: [...], current_page, ... } }
            const paginator = response.data.data;
            const newData = (paginator && Array.isArray(paginator.data)) ? paginator.data : (Array.isArray(paginator) ? paginator : []);
            
            setInstitutions(prev => isInitial ? newData : [...prev, ...newData]);
            
            if (paginator && paginator.current_page !== undefined) {
                setHasMore(paginator.current_page < paginator.last_page);
            } else {
                setHasMore(false);
            }

            if (isFirstLoad) setIsFirstLoad(false);
        } catch (error) {
            console.error('Error fetching institutions:', error?.message || error);
        } finally {
            setLoading(false);
            setLoadingMore(false);
            setSearching(false);
        }
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        // Search is already debounced and triggered by debouncedQuery
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.03 // Faster stagger for better UX
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 15 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                type: 'spring',
                stiffness: 260,
                damping: 20
            }
        },
        exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2 } }
    };

    if (loading) {
        return (
            <div className="ins-loading-state">
                <div className="ui-loader loader-blk">
                    <svg viewBox="22 22 44 44" className="multiColor-loader">
                        <circle cx="44" cy="44" r="20.2" fill="none" strokeWidth="3.6" className="loader-circle loader-circle-animation"></circle>
                    </svg>
                </div>
                <p>Loading Institutions...</p>
            </div>
        );
    }

    return (
        <div className="ins-page-container">
            <Navbar user={user} />
            <main className="ins-main-content">
                <header className="ins-header-section">
                    <div className="ins-header-text">
                        <motion.h1
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5 }}
                        >
                            Our Partner <span>Institutions</span>
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5, delay: 0.1 }}
                        >
                            Discover top-tier educational institutions across the country
                        </motion.p>
                    </div>

                    <div className="ins-search-wrapper">
                        <form onSubmit={handleSearchSubmit} className="ins-search-container">
                            <Search className="ins-search-icon" size={20} />
                            <input
                                type="text"
                                placeholder="Search by name or location..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="ins-search-input"
                            />
                            <AnimatePresence>
                                {(searchQuery || searching) && (
                                    <motion.div 
                                        className="ins-search-actions"
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.8 }}
                                    >
                                        {searching ? (
                                            <div className="ins-search-spinner" />
                                        ) : (
                                            <button
                                                type="button"
                                                onClick={() => setSearchQuery('')}
                                                className="ins-clear-button"
                                                aria-label="Clear search"
                                            >
                                                <X size={16} />
                                            </button>
                                        )}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </form>
                    </div>
                </header>

                <motion.div
                    className={`ins-grid-layout ${searching ? 'ins-searching-active' : ''}`}
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    <AnimatePresence mode="popLayout">
                        {institutions.length > 0 &&
                            institutions.map((inst, index) => (
                                <motion.div
                                    key={inst.id || `inst-${index}`}
                                    ref={index === institutions.length - 1 ? lastInstitutionRef : null}
                                    className="ins-card-item"
                                    variants={itemVariants}
                                    initial="hidden"
                                    animate="visible"
                                    exit="exit"
                                    layout // Enable smooth layout transitions
                                    whileHover={{ y: -5, boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}
                                >
                                    <div className="ins-card-cover">
                                        <img
                                            src={inst.cover_photo ? getStorageUrl(inst.cover_photo) : '/images/cover.png'}
                                            alt=""
                                            className="ins-cover-img"
                                        />
                                    </div>
                                    <div className="ins-card-top">
                                        <Link
                                            to={(user?.role === 'Institute' && user?.institute?.id === inst.id) ? '/profile' : `/institutions/${inst.slug || inst.id}/profile`}
                                        >
                                            <img
                                                src={inst.profile_photo ? getStorageUrl(inst.profile_photo) : '/images/profile.png'}
                                                alt={inst.institute_name}
                                                className="ins-logo-img"
                                            />
                                        </Link>
                                        {isPremiumActive(inst) && (
                                            <div className="ins-premium-tag">
                                                <BadgeCheck size={16} fill="#ff4757" color="#fff" />
                                                <span>Premium</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="ins-card-body">
                                        <h3>
                                            <Link
                                                to={(user?.role === 'Institute' && user?.institute?.id === inst.id) ? '/profile' : `/institutions/${inst.slug || inst.id}/profile`}
                                                style={{ textDecoration: 'none', color: 'inherit' }}
                                            >
                                                {inst.institute_name}
                                            </Link>
                                        </h3>
                                        <div className="ins-meta-info">
                                            <span className="ins-location-text">
                                                <MapPin size={14} />
                                                {inst.location}
                                            </span>
                                        </div>
                                        <p className="ins-bio-text">
                                            {inst.bio ? (inst.bio.length > 120 ? inst.bio.substring(0, 117) + '...' : inst.bio) : 'No description available for this institution.'}
                                        </p>
                                    </div>
                                    <div className="ins-card-actions">
                                        <Link
                                            to={(user?.role === 'Institute' && user?.institute?.id === inst.id) ? '/profile' : `/institutions/${inst.slug || inst.id}/profile`}
                                            className="ins-btn-profile"
                                        >
                                            View Profile
                                            <ExternalLink size={14} />
                                        </Link>
                                    </div>
                                </motion.div>
                            ))
                        }
                        {institutions.length === 0 && !loading && (
                            <motion.div
                                className="ins-empty-state"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                key="empty-state"
                            >
                                <p>No approved institutions found{searchQuery ? ` matching "${searchQuery}"` : ''}.</p>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {loadingMore && (
                        <div className="ins-loading-footer">
                            <div className="ui-loader loader-blk">
                                <svg viewBox="22 22 44 44" className="multiColor-loader">
                                    <circle cx="44" cy="44" r="20.2" fill="none" strokeWidth="3.6" className="loader-circle loader-circle-animation"></circle>
                                </svg>
                            </div>
                        </div>
                    )}
                </motion.div>
            </main>
        </div>
    );
};

export default InstitutionsPage;
