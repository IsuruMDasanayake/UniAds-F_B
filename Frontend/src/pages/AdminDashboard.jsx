import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, LogOut, Users, BarChart3, Settings, FileText } from 'lucide-react';
import axiosClient from '../lib/axios';
import './Dashboard.css';

function AdminDashboard() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await axiosClient.get('/api/user');
                if (response.data.role !== 'Admin') {
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
            className="dashboard-container admin-dashboard"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
        >
            <header className="dashboard-header admin-header">
                <div className="dashboard-logo">
                    <Shield size={24} className="admin-icon" />
                    <span>Admin Panel</span>
                </div>
                <div className="dashboard-user">
                    <span>{user?.name || 'Admin'}</span>
                    <button onClick={handleLogout} className="logout-btn">
                        <LogOut size={18} /> Logout
                    </button>
                </div>
            </header>

            <div className="admin-layout">
                <aside className="admin-sidebar">
                    <nav>
                        <button className="sidebar-btn active"><BarChart3 size={20} /> Dashboard</button>
                        <button className="sidebar-btn"><Users size={20} /> Users</button>
                        <button className="sidebar-btn"><FileText size={20} /> Posts</button>
                        <button className="sidebar-btn"><Settings size={20} /> Settings</button>
                    </nav>
                </aside>

                <main className="dashboard-main admin-main">
                    <motion.div
                        className="welcome-card admin-welcome"
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                    >
                        <h1>Admin Dashboard</h1>
                        <p>Manage users, content, and system settings.</p>
                    </motion.div>

                    <div className="dashboard-grid admin-grid">
                        <motion.div
                            className="dashboard-card stat-card"
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.3 }}
                        >
                            <h3>Total Users</h3>
                            <p className="stat-number">--</p>
                        </motion.div>
                        <motion.div
                            className="dashboard-card stat-card"
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.4 }}
                        >
                            <h3>Institutions</h3>
                            <p className="stat-number">--</p>
                        </motion.div>
                        <motion.div
                            className="dashboard-card stat-card"
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.5 }}
                        >
                            <h3>Total Posts</h3>
                            <p className="stat-number">--</p>
                        </motion.div>
                    </div>
                </main>
            </div>
        </motion.div>
    );
}

export default AdminDashboard;
