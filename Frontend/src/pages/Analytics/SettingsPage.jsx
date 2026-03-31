import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Eye, Shield, FileClock, FileText, Save, LogOut, Loader2 } from 'lucide-react';
import axiosClient from '../../lib/axios';
import { getStorageUrl } from '../../lib/config';
import VisibilitySettingsTab from './components/VisibilitySettingsTab';
import SecuritySettingsTab from './components/SecuritySettingsTab';
import ProfileSettingsTab from './components/ProfileSettingsTab';
import ActivityLogsTab from './components/ActivityLogsTab';
import ReportsTab from './components/ReportsTab';
import './SettingsPage.css';

const SettingsPage = () => {
    const [activeTab, setActiveTab] = useState('profile');
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchUserData = async () => {
        try {
            const response = await axiosClient.get('/api/user');
            const userData = response.data.data;
            setUser(userData);
            localStorage.setItem('APP_USER', JSON.stringify(userData));
        } catch (error) {
            console.error("Failed to load user data inside settings:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUserData();
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-full">
                <Loader2 className="animate-spin text-blue-500" size={48} />
            </div>
        );
    }

    if (!user || user.role !== 'Institute' || !user.institute) {
        return <div className="text-center text-gray-500 mt-10">Only institutes can access this page.</div>;
    }

    return (
        <div className="sp-page-wrapper">
            <div className="sp-header">
                <h2>Institute Settings</h2>
                <p>Manage your profile, visibility preferences, and account security.</p>
            </div>

            <div className="sp-tabs">
                <button
                    className={`sp-tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
                    onClick={() => setActiveTab('profile')}
                >
                    <User size={18} /> Profile
                </button>
                <button
                    className={`sp-tab-btn ${activeTab === 'visibility' ? 'active' : ''}`}
                    onClick={() => setActiveTab('visibility')}
                >
                    <Eye size={18} /> Visibility
                </button>
                <button
                    className={`sp-tab-btn ${activeTab === 'security' ? 'active' : ''}`}
                    onClick={() => setActiveTab('security')}
                >
                    <Shield size={18} /> Security
                </button>
                <button
                    className={`sp-tab-btn ${activeTab === 'logs' ? 'active' : ''}`}
                    onClick={() => setActiveTab('logs')}
                >
                    <FileClock size={18} /> Activity Logs
                </button>
                <button
                    className={`sp-tab-btn ${activeTab === 'reports' ? 'active' : ''}`}
                    onClick={() => setActiveTab('reports')}
                >
                    <FileText size={18} /> Reports
                </button>
            </div>

            <div className="sp-tab-content">
                <AnimatePresence mode="wait">
                    {activeTab === 'profile' && (
                        <motion.div
                            key="profile"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                        >
                            <ProfileSettingsTab institute={user.institute} onRefresh={fetchUserData} />
                        </motion.div>
                    )}

                    {activeTab === 'visibility' && (
                        <motion.div
                            key="visibility"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                        >
                            <VisibilitySettingsTab institute={user.institute} onRefresh={fetchUserData} />
                        </motion.div>
                    )}

                    {activeTab === 'security' && (
                        <motion.div
                            key="security"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                        >
                            <SecuritySettingsTab />
                        </motion.div>
                    )}

                    {activeTab === 'logs' && (
                        <motion.div
                            key="logs"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                        >
                            <ActivityLogsTab />
                        </motion.div>
                    )}

                    {activeTab === 'reports' && (
                        <motion.div
                            key="reports"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                        >
                            <ReportsTab />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default SettingsPage;
