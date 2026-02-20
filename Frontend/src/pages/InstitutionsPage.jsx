import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, ExternalLink, BadgeCheck, Search, X } from 'lucide-react';
import Navbar from '../components/Navbar';
import axiosClient from '../lib/axios';
import { getStorageUrl } from '../lib/config';
import './InstitutionsPage.css';

const InstitutionsPage = () => {
    const [institutions, setInstitutions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [instRes] = await Promise.all([
                    axiosClient.get('/api/institutions')
                ]);
                setInstitutions(instRes.data);

                try {
                    const profileRes = await axiosClient.get('/api/profile/me');
                    const currentUser = profileRes.data.user;
                    if (profileRes.data.role === 'Institute') {
                        currentUser.institute = profileRes.data.institute;
                    }
                    setUser(currentUser);
                } catch (e) {
                    setUser(null);
                }
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // Filter institutions using useMemo for performance and stability
    const filteredInstitutions = useMemo(() => {
        if (!searchQuery.trim()) return institutions;
        const query = searchQuery.toLowerCase().trim();
        return institutions.filter(inst =>
            (inst.institute_name && inst.institute_name.toLowerCase().includes(query)) ||
            (inst.location && inst.location.toLowerCase().includes(query))
        );
    }, [institutions, searchQuery]);

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
                        <div className="ins-search-container">
                            <Search className="ins-search-icon" size={20} />
                            <input
                                type="text"
                                placeholder="Search by name or location..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="ins-search-input"
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery('')}
                                    className="ins-clear-button"
                                    aria-label="Clear search"
                                >
                                    <X size={16} />
                                </button>
                            )}
                        </div>
                    </div>
                </header>

                <motion.div
                    className="ins-grid-layout"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    <AnimatePresence mode="popLayout">
                        {filteredInstitutions.length > 0 ? (
                            filteredInstitutions.map((inst, index) => (
                                <motion.div
                                    key={inst.id || `inst-${index}`}
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
                                        {!!inst.is_premium && (
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
                        ) : (
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
                </motion.div>
            </main>
        </div>
    );
};

export default InstitutionsPage;
