import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Building2, LogOut, PlusCircle, Calendar, Users, MessageSquare, Star } from 'lucide-react';
import axiosClient from '../lib/axios';
import './Dashboard.css';

function InstituteDashboard() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await axiosClient.get('/api/user');
                if (response.data.role !== 'Institute') {
                    navigate('/dashboard');
                    return;
                }
                setUser(response.data);
            } catch (error) {
                console.error('Failed to fetch user:', error);
                navigate('/login');
            } finally {
                setLoading(false);
            }
        };
        fetchUser();
    }, [navigate]);

    const handleLogout = async () => {
        try {
            await axiosClient.post('/api/logout');
        } catch (error) {
            console.error('Logout error:', error);
        }
        navigate('/');
    };

    if (loading) {
        return (
            <div className="dashboard-loading">
                <div className="ui-loader loader-blk">
                    <svg viewBox="22 22 44 44" className="multiColor-loader">
                        <circle cx="44" cy="44" r="20.2" fill="none" strokeWidth="3.6" className="loader-circle loader-circle-animation"></circle>
                    </svg>
                </div>
            </div>
        );
    }

    return (
        <motion.div
            className="dashboard-container institute-dashboard"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
        >
            <header className="dashboard-header institute-header">
                <div className="dashboard-logo">
                    <Building2 size={24} className="institute-icon" />
                    <span>Institute Portal</span>
                </div>
                <div className="dashboard-user">
                    <span>{user?.name || 'Institute'}</span>
                    <button onClick={handleLogout} className="logout-btn">
                        <LogOut size={18} /> Logout
                    </button>
                </div>
            </header>

            <main className="dashboard-main">
                <motion.div
                    className="welcome-card institute-welcome"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                >
                    <h1>Institute Dashboard</h1>
                    <p>Manage your institution&apos;s presence and connect with students.</p>
                </motion.div>

                <div className="dashboard-grid">
                    <motion.div
                        className="dashboard-card action-card"
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.3 }}
                    >
                        <PlusCircle size={32} />
                        <h3>Create Post</h3>
                        <p>Share updates with your followers</p>
                    </motion.div>
                    <motion.div
                        className="dashboard-card action-card"
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.4 }}
                    >
                        <Calendar size={32} />
                        <h3>Events</h3>
                        <p>Manage your upcoming events</p>
                    </motion.div>
                    <motion.div
                        className="dashboard-card action-card"
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.5 }}
                    >
                        <Users size={32} />
                        <h3>Followers</h3>
                        <p>View your follower analytics</p>
                    </motion.div>
                    <motion.div
                        className="dashboard-card action-card"
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.6 }}
                        onClick={() => navigate('/pricing')}
                    >
                        <Star size={32} color="#ffc107" />
                        <h3>Premium</h3>
                        <p>Manage your premium subscription</p>
                    </motion.div>
                </div>
            </main>
        </motion.div>
    );
}

export default InstituteDashboard;
