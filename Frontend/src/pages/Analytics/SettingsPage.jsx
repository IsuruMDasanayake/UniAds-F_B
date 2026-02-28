import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Eye, Shield, Save, LogOut, Loader2 } from 'lucide-react';
import axiosClient from '../../lib/axios';
import { getStorageUrl } from '../../lib/config';
import VisibilitySettingsTab from './components/VisibilitySettingsTab';
import SecuritySettingsTab from './components/SecuritySettingsTab';
import ProfileSettingsTab from './components/ProfileSettingsTab';
import './SettingsPage.css';

const SettingsPage = () => {
    const [activeTab, setActiveTab] = useState('profile');
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                // Fetch the freshest user data
                const response = await axiosClient.get('/api/user');
                setUser(response.data);
                localStorage.setItem('APP_USER', JSON.stringify(response.data));
            } catch (error) {
                console.error("Failed to load user data inside settings:", error);
            } finally {
                setLoading(false);
            }
        };
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
        <div className="settings-page-wrapper">
            <div className="settings-header">
                <h2>Institute Settings</h2>
                <p>Manage your profile, visibility preferences, and account security.</p>
            </div>

            <div className="settings-tabs">
                <button
                    className={`settings-tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
                    onClick={() => setActiveTab('profile')}
                >
                    <User size={18} /> Profile
                </button>
                <button
                    className={`settings-tab-btn ${activeTab === 'visibility' ? 'active' : ''}`}
                    onClick={() => setActiveTab('visibility')}
                >
                    <Eye size={18} /> Visibility
                </button>
                <button
                    className={`settings-tab-btn ${activeTab === 'security' ? 'active' : ''}`}
                    onClick={() => setActiveTab('security')}
                >
                    <Shield size={18} /> Security
                </button>
            </div>

            <div className="settings-tab-content">
                <AnimatePresence mode="wait">
                    {activeTab === 'profile' && (
                        <motion.div
                            key="profile"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                        >
                            <ProfileSettingsTab institute={user.institute} />
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
                            <VisibilitySettingsTab institute={user.institute} />
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
                </AnimatePresence>
            </div>
        </div>
    );
};

export default SettingsPage;
