import React, { useState, useEffect, useRef } from 'react';
import axiosClient from '../lib/axios';
import './UserProfilePage.css';
import Navbar from '../components/Navbar';
import {
    User, Mail, ShieldCheck,
    Bookmark, Building2,
    LogOut, CheckCircle2,
    Calendar, MapPin, GraduationCap,
    Clock, AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { getStorageUrl } from '../lib/config';
import { useSettings } from '../context/SettingsContext';

const districts = [
    "Colombo", "Gampaha", "Kalutara", "Kandy", "Matale", "Nuwara Eliya",
    "Galle", "Matara", "Hambantota", "Jaffna", "Kilinochchi", "Mannar",
    "Vavuniya", "Mullaitivu", "Batticaloa", "Ampara", "Trincomalee",
    "Kurunegala", "Puttalam", "Anuradhapura", "Polonnaruwa", "Badulla",
    "Monaragala", "Ratnapura", "Kegalle"
];

const educationLevels = [
    "O/L Student", "A/L Student", "Undergraduate", "Postgraduate", "Other"
];

const UserProfilePage = () => {
    const { settings } = useSettings();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [profileData, setProfileData] = useState(null);
    const [activeTab, setActiveTab] = useState('profile');
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        gender: '',
        birthday: '',
        district: '',
        education_level: '',
        current_password: '',
        new_password: '',
        new_password_confirmation: ''
    });
    const [alert, setAlert] = useState({ show: false, type: '', message: '' });
    const [errors, setErrors] = useState({});
    const [isMobile, setIsMobile] = useState(window.innerWidth < 992);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 992);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const showAlert = (type, message) => {
        setAlert({ show: true, type, message });
        setTimeout(() => setAlert({ show: false, type: '', message: '' }), 3000);
    };

    const fetchProfile = async () => {
        try {
            const response = await axiosClient.get('/api/profile/me');
            const userData = response.data.user;
            setProfileData(response.data);
            setFormData(prev => ({
                ...prev,
                name: userData.name || '',
                email: userData.email || '',
                gender: userData.gender || '',
                birthday: userData.birthday || '',
                district: userData.district || '',
                education_level: userData.education_level || ''
            }));
        } catch (error) {
            console.error("Error fetching profile:", error);
            if (error.response?.status === 401) navigate('/login');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProfile();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setErrors({});

        try {
            const response = await axiosClient.post('/api/profile/update', {
                name: formData.name,
                gender: formData.gender,
                birthday: formData.birthday,
                district: formData.district,
                education_level: formData.education_level
            });
            showAlert('success', 'Profile updated successfully!');
            setProfileData(prev => ({ ...prev, user: response.data.user }));
        } catch (err) {
            console.error(err);
            if (err.response?.status === 422) {
                setErrors(err.response.data.errors);
                showAlert('error', 'Please fix the errors below.');
            } else {
                showAlert('error', 'Failed to update profile.');
            }
        }
    };

    const handleUpdatePassword = async (e) => {
        e.preventDefault();
        setErrors({});

        try {
            await axiosClient.post('/api/profile/password', {
                current_password: formData.current_password,
                new_password: formData.new_password,
                new_password_confirmation: formData.new_password_confirmation
            });
            showAlert('success', 'Password updated successfully!');
            setFormData(prev => ({
                ...prev,
                current_password: '',
                new_password: '',
                new_password_confirmation: ''
            }));
        } catch (err) {
            if (err.response?.status === 422) {
                setErrors(err.response.data.errors);
                showAlert('error', 'Please fix the security errors.');
            } else {
                showAlert('error', 'Failed to update password.');
            }
        }
    };

    const handleLogout = async () => {
        try {
            await axiosClient.post('/api/logout');
        } catch (error) {
            console.error('Logout error:', error);
        }
        localStorage.removeItem('ACCESS_TOKEN');
        localStorage.removeItem('APP_USER');
        navigate('/');
    };



    if (loading) return (
        <div className="profile-loading-overlay">
            <div className="spinner-box">
                <div className="ui-loader loader-blk">
                    <svg viewBox="22 22 44 44" className="multiColor-loader">
                        <circle cx="44" cy="44" r="20.2" fill="none" strokeWidth="3.6" className="loader-circle loader-circle-animation"></circle>
                    </svg>
                </div>
                <p>Loading profile...</p>
            </div>
        </div>
    );

    const user = profileData?.user;
    const savedPosts = user?.saved_posts || [];

    // Fallback avatar using user initials or dicebear properly
    const avatarSrc = user?.profile_picture
        ? getStorageUrl(user.profile_picture)
        : `https://api.dicebear.com/7.x/initials/svg?seed=${user?.name || 'User'}&backgroundColor=ffc107`;

    return (
        <div className="user-profile-page">
            <Navbar user={user} />

            {/* Premium Toast Overlay */}
            <AnimatePresence>
                {alert.show && (
                    <motion.div
                        className={`profile-alert ${alert.type}`}
                        initial={{ opacity: 0, y: -20, x: '-50%' }}
                        animate={{ opacity: 1, y: 20, x: '-50%' }}
                        exit={{ opacity: 0, y: -20, x: '-50%' }}
                    >
                        {alert.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                        <span>{alert.message}</span>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="profile-container">
                <div className="profile-header-card" style={{ paddingTop: '50px' }}>
                    <div className="profile-header-content" style={{ marginTop: '0' }}>
                        <div className="profile-avatar-wrapper">
                            <div className="avatar-container">
                                <img
                                    src={avatarSrc}
                                    alt="Profile"
                                    className="profile-avatar-large"
                                />
                            </div>
                        </div>
                        <div className="profile-identity">
                            <h1>{user?.name}</h1>
                            <p className="flex items-center gap-2">
                                <Mail size={14} /> {user?.email}
                            </p>
                            <span className="profile-badge">
                                {profileData?.role} account
                            </span>
                        </div>
                    </div>
                </div>

                <div className="profile-content-grid">
                    {/* Sidebar */}
                    <aside className="profile-sidebar">
                        <div className="sidebar-widget">
                            <h3 className="widget-title">Quick Stats</h3>
                            <div className="stats-grid">
                                <div className="stat-item cursor-pointer hover:bg-gray-50 transition">
                                    <span className="stat-value">{savedPosts.length}</span>
                                    <span className="stat-label">Saved</span>
                                </div>
                                <div className="stat-item">
                                    <span className="stat-value">{user?.district ? '1' : '0'}</span>
                                    <span className="stat-label">Location</span>
                                </div>
                                <div className="stat-item">
                                    <span className="stat-value">{user?.education_level ? '1' : '0'}</span>
                                    <span className="stat-label">Education</span>
                                </div>
                                <div className="stat-item">
                                    <span className="stat-value">0</span>
                                    <span className="stat-label">Inquiries</span>
                                </div>
                            </div>
                        </div>

                        <div className="sidebar-widget menu-widget">
                            <h3 className="widget-title">Menu</h3>
                            <nav className="sidebar-nav">
                                <button
                                    className={`nav-item ${activeTab === 'profile' ? 'active' : ''}`}
                                    onClick={() => setActiveTab('profile')}
                                >
                                    <User size={18} /> Basic Details
                                </button>
                                <button
                                    className={`nav-item ${activeTab === 'security' ? 'active' : ''}`}
                                    onClick={() => setActiveTab('security')}
                                >
                                    <ShieldCheck size={18} /> Password & Security
                                </button>
                                {/* <button
                                    className={`nav-item ${activeTab === 'saved' ? 'active' : ''}`}
                                    onClick={() => setActiveTab('saved')}
                                >
                                    <Bookmark size={18} /> Saved Posts
                                </button>
                                <div className="border-t my-2 pt-2">
                                    <button
                                        className="nav-item text-red-500 hover:bg-red-50"
                                        onClick={handleLogout}
                                    >
                                        <LogOut size={18} /> Sign Out
                                    </button>
                                </div> */}
                            </nav>
                        </div>

                        {/* <div className="sidebar-widget">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium">Profile Completion</span>
                                <span className="text-xs text-yellow-600 font-bold"> 100%</span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-2">
                                <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '100%' }}></div>
                            </div>
                            <p className="text-[10px] text-gray-500 mt-2">Your profile is up to date!</p>
                        </div> */}
                    </aside>

                    {/* Main Content Area */}
                    <div className="profile-main-area">
                        {(isMobile || activeTab === 'profile') && (
                            <motion.div
                                className="content-card"
                                initial={{ opacity: 0, x: isMobile ? 0 : 20, y: isMobile ? 20 : 0 }}
                                animate={{ opacity: 1, x: 0, y: 0 }}
                                key="profile-tab"
                            >
                                <div className="section-header">
                                    <h2>Basic Details</h2>
                                    <p className="text-sm text-gray-500 mt-1">Update your info to get better recommendations.</p>
                                </div>
                                <form onSubmit={handleUpdateProfile} className="form-grid">
                                    <div className="form-group full-width">
                                        <label>Full Name</label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            className={errors.name ? 'input-error' : ''}
                                        />
                                        {errors.name && <span className="error-text text-xs text-red-500">{errors.name[0]}</span>}
                                    </div>
                                    <div className="form-group full-width">
                                        <label>Email Address</label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            disabled
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Gender</label>
                                        <select
                                            name="gender"
                                            value={formData.gender}
                                            onChange={handleChange}
                                            className={`form-input-select ${errors.gender ? 'input-error' : ''}`}
                                            style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0' }}
                                        >
                                            <option value="">Select Gender</option>
                                            <option value="Male">Male</option>
                                            <option value="Female">Female</option>
                                        </select>
                                        {errors.gender && <span className="error-text text-xs text-red-500">{errors.gender[0]}</span>}
                                    </div>
                                    <div className="form-group">
                                        <label>Birthday</label>
                                        <input
                                            type="date"
                                            name="birthday"
                                            value={formData.birthday}
                                            onChange={handleChange}
                                            className={errors.birthday ? 'input-error' : ''}
                                        />
                                        {errors.birthday && <span className="error-text text-xs text-red-500">{errors.birthday[0]}</span>}
                                    </div>
                                    <div className="form-group">
                                        <label>District</label>
                                        <select
                                            name="district"
                                            value={formData.district}
                                            onChange={handleChange}
                                            style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0' }}
                                        >
                                            <option value="">Select District</option>
                                            {districts.map(d => <option key={d} value={d}>{d}</option>)}
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label>Education Level</label>
                                        <select
                                            name="education_level"
                                            value={formData.education_level}
                                            onChange={handleChange}
                                            style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0' }}
                                        >
                                            <option value="">Select Level</option>
                                            {educationLevels.map(l => <option key={l} value={l}>{l}</option>)}
                                        </select>
                                    </div>

                                    <div className="full-width mt-6 flex justify-end">
                                        <button type="submit" className="btn-save">
                                            <CheckCircle2 size={18} /> Update Details
                                        </button>
                                    </div>
                                </form>
                            </motion.div>
                        )}

                        {(isMobile || activeTab === 'security') && (
                            <motion.div
                                className="content-card"
                                initial={{ opacity: 0, x: isMobile ? 0 : 20, y: isMobile ? 20 : 0 }}
                                animate={{ opacity: 1, x: 0, y: 0 }}
                                key="security-tab"
                            >
                                <div className="section-header">
                                    <h2>Security Settings</h2>
                                    <p className="text-sm text-gray-500 mt-1">Keep your account secure with a strong password.</p>
                                </div>
                                <form onSubmit={handleUpdatePassword} className="form-grid">
                                    <div className="form-group full-width">
                                        <label>Current Password</label>
                                        <input
                                            type="password"
                                            name="current_password"
                                            placeholder="••••••••"
                                            value={formData.current_password}
                                            onChange={handleChange}
                                            className={errors.current_password ? 'input-error' : ''}
                                        />
                                        {errors.current_password && <span className="error-text text-xs text-red-500">{errors.current_password[0]}</span>}
                                    </div>
                                    <div className="form-group">
                                        <label>New Password</label>
                                        <input
                                            type="password"
                                            name="new_password"
                                            placeholder="New strong password"
                                            value={formData.new_password}
                                            onChange={handleChange}
                                            className={errors.new_password ? 'input-error' : ''}
                                        />
                                        {errors.new_password && <span className="error-text text-xs text-red-500">{errors.new_password[0]}</span>}
                                    </div>
                                    <div className="form-group">
                                        <label>Confirm Password</label>
                                        <input
                                            type="password"
                                            name="new_password_confirmation"
                                            placeholder="Confirm new password"
                                            value={formData.new_password_confirmation}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    <div className="full-width mt-4">
                                        <button type="submit" className="btn-save bg-accent hover:bg-red-600">
                                            Update Password
                                        </button>
                                    </div>
                                </form>
                            </motion.div>
                        )}

                        {activeTab === 'saved' && (
                            <motion.div
                                className="content-card"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                key="saved-tab"
                            >
                                <div className="section-header">
                                    <h2>Saved Posts</h2>
                                    <p className="text-sm text-gray-500 mt-1">Items you've bookmarked for later.</p>
                                </div>
                                {savedPosts.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-20 text-center">
                                        <div className="bg-gray-100 p-6 rounded-full mb-4">
                                            <div className="ui-bookmark" style={{ "--icon-size": "40px", "--icon-secondary-color": "#d1d5db" }}>
                                                <svg viewBox="0 0 32 32" className="bookmark">
                                                    <path d="M27 4v27a1 1 0 0 1-1.625.781L16 24.281l-9.375 7.5A1 1 0 0 1 5 31V4a4 4 0 0 1 4-4h14a4 4 0 0 1 4 4z"></path>
                                                </svg>
                                            </div>
                                        </div>
                                        <h3 className="font-semibold text-gray-700">No saved items yet</h3>
                                        <p className="text-sm text-gray-500 max-w-xs mt-2">
                                            Start exploring courses and institutes and save them here for quick access.
                                        </p>
                                        <Link to="/feed" className="btn-save mt-6 no-underline">Explore Feed</Link>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {savedPosts.map(post => (
                                            <Link key={post.id} to={`/feed`} className="saved-post-link no-underline color-inherit">
                                                <div className="flex gap-4 p-3 border rounded-xl hover:bg-gray-50 transition cursor-pointer">
                                                    <img
                                                        src={post.image ? getStorageUrl(post.image) : (settings.logo_url || '/images/logo.png')}
                                                        className="w-20 h-20 rounded-lg object-cover"
                                                        alt={post.title}
                                                    />
                                                    <div>
                                                        <h4 className="font-semibold text-sm line-clamp-1">{post.title}</h4>
                                                        <div className="flex items-center gap-1 text-[10px] text-gray-400 mt-1">
                                                            <Building2 size={10} /> {post.institute?.institute_name}
                                                        </div>
                                                        <div className="mt-2 text-[10px] bg-yellow-50 text-yellow-600 px-2 py-0.5 rounded-full inline-block">
                                                            Post View
                                                        </div>
                                                    </div>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserProfilePage;
