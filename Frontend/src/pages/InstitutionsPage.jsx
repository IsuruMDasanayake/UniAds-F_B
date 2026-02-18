import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, ExternalLink, BadgeCheck } from 'lucide-react';
import Navbar from '../components/Navbar';
import axiosClient from '../lib/axios';
import { getStorageUrl } from '../lib/config';
import './InstitutionsPage.css';

const InstitutionsPage = () => {
    const [institutions, setInstitutions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch institutions first, then try to fetch user (as it might fail if guest)
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
                    // Guest user is fine
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

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: {
                type: 'spring',
                stiffness: 100
            }
        }
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
                </header>

                <motion.div
                    className="ins-grid-layout"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    {institutions.length > 0 ? (
                        institutions.map(inst => (
                            <motion.div
                                key={inst.id}
                                className="ins-card-item"
                                variants={itemVariants}
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
                                    <img
                                        src={inst.profile_photo ? getStorageUrl(inst.profile_photo) : '/images/profile.png'}
                                        alt={inst.institute_name}
                                        className="ins-logo-img"
                                    />
                                    {!!inst.is_premium && (
                                        <div className="ins-premium-tag">
                                            <BadgeCheck size={16} fill="#ff4757" color="#fff" />
                                            <span>Premium</span>
                                        </div>
                                    )}
                                </div>
                                <div className="ins-card-body">
                                    <h3>
                                        {inst.institute_name}
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
                                        to={(user?.role === 'Institute' && user?.institute?.id === inst.id) ? '/profile' : `/institutions/${inst.id}/profile`}
                                        className="ins-btn-profile"
                                    >
                                        View Profile
                                        <ExternalLink size={14} />
                                    </Link>
                                </div>
                            </motion.div>
                        ))
                    ) : (
                        <div className="ins-empty-state">
                            <p>No approved institutions found at this time.</p>
                        </div>
                    )}
                </motion.div>
            </main>
        </div>
    );
};

export default InstitutionsPage;
