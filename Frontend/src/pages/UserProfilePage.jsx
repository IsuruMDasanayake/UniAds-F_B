import React, { useState, useEffect, useRef } from 'react';
import axiosClient from '../lib/axios';
import './UserProfilePage.css';
import Navbar from '../components/Navbar';
import ReactMarkdown from 'react-markdown';
import {
    User, Mail, ShieldCheck,
    Bookmark, Building2,
    LogOut, CheckCircle2,
    Calendar, MapPin, GraduationCap,
    Clock, AlertCircle, Sparkles, Trash2, ChevronDown, ChevronUp, FileText, BadgeCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { getStorageUrl } from '../lib/config';
import { useSettings } from '../context/SettingsContext';
import { Download, Loader2 } from 'lucide-react';
import DeleteConfirmModal from '../components/Modals/DeleteConfirmModal';
import ProgrammeInfoModal from '../components/Modals/ProgrammeInfoModal';
import ApplyNowModal from '../components/Modals/ApplyNowModal';
import MoreInfoModal from '../components/Modals/MoreInfoModal';
import { Link2, Check, ExternalLink } from 'lucide-react';
import { districts, educationLevels } from '../lib/constants';


const UserProfilePage = () => {
    const { settings } = useSettings();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [profileData, setProfileData] = useState(null);
    const avatarSeedRef = useRef(null); 
    const [activeTab, setActiveTab] = useState(() => {
        const params = new URLSearchParams(window.location.search);
        const tab = params.get('tab');
        const validTabs = ['profile', 'roadmaps', 'applications', 'saved', 'security', 'posts', 'events', 'followers'];
        return validTabs.includes(tab) ? tab : 'profile';
    });
    const [savedRoadmaps, setSavedRoadmaps] = useState([]);
    const [expandedRoadmap, setExpandedRoadmap] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [roadmapToDelete, setRoadmapToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [applications, setApplications] = useState([]);
    const [loadingApplications, setLoadingApplications] = useState(false);
    const [isProgrammeOpen, setIsProgrammeOpen] = useState(false);
    const [isInfoOpen, setIsInfoOpen] = useState(false);
    const [selectedPost, setSelectedPost] = useState(null);
    const [selectedInstitute, setSelectedInstitute] = useState(null);
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

    // Saved Posts Migration States
    const [savedPostsData, setSavedPostsData] = useState([]);
    const [loadingSavedPosts, setLoadingSavedPosts] = useState(false);
    const [copiedPostId, setCopiedPostId] = useState(null);
    const [showSavedApplyModal, setShowSavedApplyModal] = useState(false);
    const [savedApplying, setSavedApplying] = useState(false);
    const [savedSubmissionStatus, setSavedSubmissionStatus] = useState({ type: '', message: '' });
    const [savedApplyForm, setSavedApplyForm] = useState({
        name: '',
        email: '',
        phone: '',
        message: '',
        privacyConsent: false
    });

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
            if (!avatarSeedRef.current) {
                avatarSeedRef.current = userData.name || 'User';
            }
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

    const [downloadingId, setDownloadingId] = useState(null);

    const handleDownloadPDF = async (e, roadmap) => {
        e.stopPropagation(); // Prevent expanding the card
        setDownloadingId(roadmap.id);
        
        try {
            // Create a temporary container for the PDF content
            const element = document.createElement('div');
            element.className = 'pdf-export-container';
            element.style.padding = '40px';
            element.style.width = '800px';
            element.style.background = '#fff';
            element.style.fontFamily = "'Inter', -apple-system, sans-serif";
            element.style.color = '#1e293b';
            element.style.position = 'absolute';
            element.style.left = '-9999px';

            // Convert markdown structure to readable HTML for the PDF
            const formattedContent = roadmap.recommendation_text
                .replace(/^# (.*$)/gim, '<h1 style="color: #0f172a; border-bottom: 2px solid #ef4444; padding-bottom: 10px; margin-top: 30px;">$1</h1>')
                .replace(/^## (.*$)/gim, '<h2 style="color: #0f172a; margin-top: 25px; font-size: 1.25rem; border-left: 4px solid #ef4444; padding-left: 10px;">$1</h2>')
                .replace(/^### (.*$)/gim, '<h3 style="color: #334155; margin-top: 20px;">$1</h3>')
                .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
                .replace(/\*(.*)\*/gim, '<em>$1</em>')
                .replace(/^\* (.*$)/gim, '<li style="margin-left: 20px; margin-bottom: 5px;">$1</li>')
                .replace(/\n/gim, '<br />');

            element.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 40px; border-bottom: 1px solid #e2e8f0; padding-bottom: 20px;">
                    <div>
                        <h1 style="font-size: 24px; font-weight: 800; color: #0f172a; margin: 0;">MY CAREER ROADMAP</h1>
                        <p style="color: #64748b; margin: 5px 0 0 0;">Personalized Guide by EMY UniAds Advisor</p>
                    </div>
                    <div style="text-align: right;">
                        <p style="font-size: 12px; color: #94a3b8; margin: 0;">UniAds Career Planning</p>
                        <p style="font-size: 11px; color: #cbd5e1; margin: 2px 0 0 0;">www.uniads.lk</p>
                    </div>
                </div>

                <div style="margin-bottom: 30px; background: #f8fafc; padding: 20px; border-radius: 12px; border: 1px solid #e2e8f0;">
                    <p style="font-size: 12px; font-weight: 700; color: #ef4444; text-transform: uppercase; margin: 0 0 8px 0; letter-spacing: 0.05em;">Target Goal</p>
                    <h2 style="font-size: 20px; font-weight: 700; color: #0f172a; margin: 0;">${roadmap.career_goal}</h2>
                </div>

                <div style="margin-bottom: 40px;">
                    <p style="font-size: 12px; font-weight: 700; color: #ef4444; text-transform: uppercase; margin: 0 0 15px 0; letter-spacing: 0.05em;">Career Path & Advice</p>
                    <div style="line-height: 1.6; color: #334155; font-size: 14px;">
                        ${formattedContent}
                    </div>
                </div>

                ${roadmap.real_posts && roadmap.real_posts.length > 0 ? `
                <div style="margin-top: 40px;">
                    <p style="font-size: 12px; font-weight: 700; color: #ef4444; text-transform: uppercase; margin: 0 0 15px 0; letter-spacing: 0.05em;">Recommended Institutions & Programs</p>
                    <div style="display: grid; grid-template-columns: 1fr; gap: 15px;">
                        ${roadmap.real_posts.map(post => `
                            <div style="display: flex; align-items: center; gap: 15px; padding: 15px; background: #fff; border: 1px solid #e2e8f0; border-radius: 12px;">
                                <div style="width: 50px; height: 50px; border-radius: 8px; background: #f1f5f9; overflow: hidden; flex-shrink: 0;">
                                    <img src="${post.image ? getStorageUrl(post.image) : '/images/logo.png'}" style="width: 100%; height: 100%; object-fit: cover;" />
                                </div>
                                <div style="min-width: 0;">
                                    <h4 style="font-size: 14px; font-weight: 700; color: #0f172a; margin: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${post.title}</h4>
                                    <p style="font-size: 12px; color: #64748b; margin: 2px 0 0 0;">${post.institute_name}</p>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
                ` : ''}

                <div style="margin-top: 60px; border-top: 1px solid #e2e8f0; padding-top: 20px; text-align: center;">
                    <p style="font-size: 11px; color: #94a3b8; margin: 0;">© ${new Date().getFullYear()} UniAds Sri Lanka. All Rights Reserved.</p>
                </div>
            `;

            document.body.appendChild(element);
            
            const canvas = await html2canvas(element, { 
                scale: 2, 
                useCORS: true, 
                logging: false,
                backgroundColor: '#ffffff'
            });
            
            const imgData = canvas.toDataURL('image/png');
            document.body.removeChild(element);

            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            });

            const imgProps = pdf.getImageProperties(imgData);
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
            
            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(`${roadmap.career_goal.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_roadmap.pdf`);
            
        } catch (error) {
            console.error('PDF Download failed:', error);
            showAlert('error', 'Failed to generate PDF. Please try again.');
        } finally {
            setDownloadingId(null);
        }
    };

    const fetchRoadmaps = async () => {
        try {
            const response = await axiosClient.get('/api/ai-advisor/saved-roadmaps');
            setSavedRoadmaps(response.data);
        } catch (error) {
            console.error("Error fetching roadmaps:", error);
        }
    };

    const fetchApplications = async () => {
        setLoadingApplications(true);
        try {
            const response = await axiosClient.get('/api/applications/me');
            setApplications(response.data);
        } catch (error) {
            console.error("Error fetching applications:", error);
        } finally {
            setLoadingApplications(false);
        }
    };

    const fetchSavedPostsData = async () => {
        setLoadingSavedPosts(true);
        try {
            const response = await axiosClient.get('/api/posts/saved');
            let posts = response.data.posts.data || [];
            // For normal users, filter out inactive posts
            if (profileData?.user?.role === 'User') {
                posts = posts.filter(p => p.status === 'active');
            }
            setSavedPostsData(posts);
        } catch (error) {
            console.error("Error fetching saved posts:", error);
        } finally {
            setLoadingSavedPosts(false);
        }
    };

    useEffect(() => {
        fetchProfile();
        fetchRoadmaps();
        fetchApplications();
    }, []);

    useEffect(() => {
        if (activeTab === 'saved') {
            fetchSavedPostsData();
        }
    }, [activeTab]);

    const handleToggleSave = async (postId) => {
        try {
            await axiosClient.post(`/api/posts/${postId}/save`);
            setSavedPostsData(prev => prev.filter(post => post.id !== postId));
            // Optional: update user profile saved_posts list in local state
            setProfileData(prev => ({
                ...prev,
                user: {
                    ...prev.user,
                    saved_posts: prev.user.saved_posts.filter(p => p.id !== postId)
                }
            }));
            showAlert('success', 'Post removed from saved.');
        } catch (error) {
            console.error('Error un-saving post:', error);
            showAlert('error', 'Failed to remove post.');
        }
    };

    const handleCopyPostLink = (post) => {
        if (!post?.share_link) return;
        const url = `${window.location.origin}/post/${post.share_link}`;
        navigator.clipboard.writeText(url).then(() => {
            setCopiedPostId(post.id);
            setTimeout(() => setCopiedPostId(null), 2000);
        });
    };

    const handleSavedApplySubmit = async (e) => {
        e.preventDefault();
        setSavedApplying(true);
        setSavedSubmissionStatus({ type: '', message: '' });

        try {
            await axiosClient.post(`/api/course/apply/${selectedPost.institute_id}`, {
                ...savedApplyForm,
                course_title: selectedPost.title,
                post_id: selectedPost.id,
                privacy_consent: savedApplyForm.privacyConsent 
            });

            setSavedSubmissionStatus({ type: 'success', message: 'Application submitted successfully! We wish you all the best.' });
            setSavedApplyForm({ name: '', email: '', phone: '', message: '', privacyConsent: false });

            setTimeout(() => {
                setShowSavedApplyModal(false);
                setSavedSubmissionStatus({ type: '', message: '' });
                fetchApplications(); // Refresh applications list
            }, 5000);

        } catch (error) {
            console.error('Error submitting application:', error);
            const errorMsg = error.response?.data?.message || "Failed to submit application. Please try again.";
            setSavedSubmissionStatus({ type: 'error', message: errorMsg });
        } finally {
            setSavedApplying(false);
        }
    };

    const confirmDeleteRoadmap = (e, roadmap) => {
        e.stopPropagation();
        setRoadmapToDelete(roadmap);
        setShowDeleteModal(true);
    };

    const handleDeleteRoadmap = async () => {
        if (!roadmapToDelete) return;
        setIsDeleting(true);
        try {
            await axiosClient.delete(`/api/ai-advisor/roadmap/${roadmapToDelete.id}`);
            setSavedRoadmaps(prev => prev.filter(r => r.id !== roadmapToDelete.id));
            showAlert('success', 'Roadmap deleted.');
            setShowDeleteModal(false);
            setRoadmapToDelete(null);
        } catch (error) {
            showAlert('error', 'Failed to delete roadmap.');
        } finally {
            setIsDeleting(false);
        }
    };

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

    const openProgrammeModal = (post, institute) => {
        setSelectedPost(post);
        setSelectedInstitute(institute);
        setIsProgrammeOpen(true);
    };

    const openInfoModal = (post, institute) => {
        setSelectedPost(post || selectedPost);
        setSelectedInstitute(institute || selectedInstitute);
        setIsInfoOpen(true);
        setIsProgrammeOpen(false);
    };

    const openSavedApplyModal = () => {
        setSavedApplyForm({
            name: '',
            email: '',
            phone: '',
            message: '',
            privacyConsent: false
        });
        setSavedSubmissionStatus({ type: '', message: '' });
        setShowSavedApplyModal(true);
        setIsProgrammeOpen(false);
    };

    if (loading) return (
        <div className="upp-profile-loading-overlay">
            <div className="upp-spinner-box">
                <div className="ui-loader loader-blk">
                    <svg viewBox="22 22 44 44" className="multiColor-loader">
                        <circle cx="44" cy="44" r="20.2" fill="none" strokeWidth="3.6" className="loader-circle loader-circle-animation"></circle>
                    </svg>
                </div>
                <p>Loading Profile...</p>
            </div>
        </div>
    );

    const user = profileData?.user;
    const savedPosts = user?.saved_posts || [];

    const avatarSrc = user?.profile_picture
        ? getStorageUrl(user.profile_picture)
        : `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(avatarSeedRef.current || user?.name || 'User')}&backgroundColor=ffc107`;

    return (
        <div className="upp-user-profile-page">
            <Navbar user={user} />

            <AnimatePresence>
                {alert.show && (
                    <motion.div
                        className={`upp-profile-alert upp-${alert.type}`}
                        initial={{ opacity: 0, y: -20, x: '-50%' }}
                        animate={{ opacity: 1, y: 20, x: '-50%' }}
                        exit={{ opacity: 0, y: -20, x: '-50%' }}
                    >
                        {alert.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                        <span>{alert.message}</span>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="upp-profile-container">
                <div className="upp-profile-header-card" style={{ paddingTop: '50px' }}>
                    <div className="upp-profile-header-content" style={{ marginTop: '0' }}>
                        <div className="upp-profile-avatar-wrapper">
                            <div className="upp-avatar-container">
                                <img
                                    src={avatarSrc}
                                    alt="Profile"
                                    className="upp-profile-avatar-large"
                                />
                            </div>
                        </div>
                        <div className="upp-profile-identity">
                            <h1>{user?.name}</h1>
                            <p className="flex items-center gap-2">
                                <Mail size={14} /> {user?.email}
                            </p>
                            <span className="upp-profile-badge">
                                {profileData?.role} account
                            </span>
                        </div>
                    </div>

                    {/* Mobile Tab Bar */}
                    <div className="upp-mobile-tabs">
                        <button 
                            className={`upp-mobile-tab-item ${activeTab === 'profile' ? 'active' : ''}`}
                            onClick={() => setActiveTab('profile')}
                        >
                            <User size={18} />
                            <span>Details</span>
                        </button>
                        <button 
                            className={`upp-mobile-tab-item ${activeTab === 'roadmaps' ? 'active' : ''}`}
                            onClick={() => setActiveTab('roadmaps')}
                        >
                            <Sparkles size={18} />
                            <span>EMY Advice</span>
                        </button>
                        <button 
                            className={`upp-mobile-tab-item ${activeTab === 'applications' ? 'active' : ''}`}
                            onClick={() => setActiveTab('applications')}
                        >
                            <FileText size={18} />
                            <span>Apps</span>
                        </button>
                        <button 
                            className={`upp-mobile-tab-item ${activeTab === 'saved' ? 'active' : ''}`}
                            onClick={() => setActiveTab('saved')}
                        >
                            <Bookmark size={18} />
                            <span>Saved</span>
                        </button>
                        <button 
                            className={`upp-mobile-tab-item ${activeTab === 'security' ? 'active' : ''}`}
                            onClick={() => setActiveTab('security')}
                        >
                            <ShieldCheck size={18} />
                            <span>Security</span>
                        </button>
                    </div>
                </div>

                <div className="upp-profile-content-grid">
                    <aside className="upp-profile-sidebar">
                        <div className="upp-sidebar-widget">
                            <h3 className="upp-widget-title">Quick Stats</h3>
                            <div className="upp-stats-grid">
                                <div className="upp-stat-item cursor-pointer" onClick={() => setActiveTab('saved')}>
                                    <span className="upp-stat-value">{savedPosts.length}</span>
                                    <span className="upp-stat-label">Saved</span>
                                </div>
                                <div className="upp-stat-item">
                                    <span className="upp-stat-value">{user?.district ? '1' : '0'}</span>
                                    <span className="upp-stat-label">Location</span>
                                </div>
                                <div className="upp-stat-item">
                                    <span className="upp-stat-value">{savedRoadmaps.length}</span>
                                    <span className="upp-stat-label">EMY Advice</span>
                                </div>
                                <div className="upp-stat-item">
                                    <span className="upp-stat-value">0</span>
                                    <span className="upp-stat-label">Inquiries</span>
                                </div>
                            </div>
                        </div>

                        <div className="upp-sidebar-widget upp-menu-widget">
                            <h3 className="upp-widget-title">Menu</h3>
                            <nav className="upp-sidebar-nav">
                                <button
                                    className={`upp-nav-item ${activeTab === 'profile' ? 'upp-active' : ''}`}
                                    onClick={() => setActiveTab('profile')}
                                >
                                    <User size={18} /> Basic Details
                                </button>
                                <button
                                    className={`upp-nav-item ${activeTab === 'saved' ? 'upp-active' : ''}`}
                                    onClick={() => setActiveTab('saved')}
                                >
                                    <Bookmark size={18} /> Saved Posts
                                </button>
                                <button
                                    className={`upp-nav-item ${activeTab === 'roadmaps' ? 'upp-active' : ''}`}
                                    onClick={() => setActiveTab('roadmaps')}
                                >
                                    <Sparkles size={18} /> EMY Suggestions
                                </button>
                                <button
                                    className={`upp-nav-item ${activeTab === 'applications' ? 'upp-active' : ''}`}
                                    onClick={() => setActiveTab('applications')}
                                >
                                    <FileText size={18} /> My Applications
                                </button>
                                <button
                                    className={`upp-nav-item ${activeTab === 'security' ? 'upp-active' : ''}`}
                                    onClick={() => setActiveTab('security')}
                                >
                                    <ShieldCheck size={18} /> Password & Security
                                </button>
                            </nav>
                        </div>
                    </aside>

                    <div className="upp-profile-main-area">
                        {activeTab === 'profile' && (
                            <motion.div className="upp-content-card" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                                <div className="upp-section-header">
                                    <h2>Basic Details</h2>
                                    <p className="text-sm text-gray-500 mt-1">Update your info to get better recommendations.</p>
                                </div>
                                <form onSubmit={handleUpdateProfile} className="upp-form-grid">
                                    <div className="upp-form-group upp-full-width">
                                        <label>Full Name</label>
                                        <input type="text" name="name" value={formData.name} onChange={handleChange} className={errors.name ? 'upp-input-error' : ''} />
                                        {errors.name && <span className="upp-error-text text-xs text-red-500">{errors.name[0]}</span>}
                                    </div>
                                    <div className="upp-form-group upp-full-width">
                                        <label>Email Address</label>
                                        <input type="email" value={formData.email} disabled />
                                    </div>
                                    <div className="upp-form-group">
                                        <label>Gender</label>
                                        <select name="gender" value={formData.gender} onChange={handleChange} className={`form-input-select ${errors.gender ? 'upp-input-error' : ''}`} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                                            <option value="">Select Gender</option>
                                            <option value="Male">Male</option>
                                            <option value="Female">Female</option>
                                        </select>
                                    </div>
                                    <div className="upp-form-group">
                                        <label>Birthday</label>
                                        <input type="date" name="birthday" value={formData.birthday} onChange={handleChange} />
                                    </div>
                                    <div className="upp-form-group">
                                        <label>District</label>
                                        <select name="district" value={formData.district} onChange={handleChange} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                                            <option value="">Select District</option>
                                            {districts.map(d => <option key={d} value={d}>{d}</option>)}
                                        </select>
                                    </div>
                                    <div className="upp-form-group">
                                        <label>Education Level</label>
                                        <select name="education_level" value={formData.education_level} onChange={handleChange} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                                            <option value="">Select Level</option>
                                            {educationLevels.map(l => <option key={l} value={l}>{l}</option>)}
                                        </select>
                                    </div>
                                    <div className="upp-full-width mt-6 flex justify-end">
                                        <button type="submit" className="upp-btn-save">Update Details</button>
                                    </div>
                                </form>
                            </motion.div>
                        )}

                        {activeTab === 'security' && (
                            <motion.div className="upp-content-card" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                                <div className="upp-section-header">
                                    <h2>Security Settings</h2>
                                </div>
                                <form onSubmit={handleUpdatePassword} className="upp-form-grid">
                                    <div className="upp-form-group upp-full-width">
                                        <label>Current Password</label>
                                        <input type="password" name="current_password" value={formData.current_password} onChange={handleChange} />
                                    </div>
                                    <div className="upp-form-group">
                                        <label>New Password</label>
                                        <input type="password" name="new_password" value={formData.new_password} onChange={handleChange} />
                                    </div>
                                    <div className="upp-form-group">
                                        <label>Confirm Password</label>
                                        <input type="password" name="new_password_confirmation" value={formData.new_password_confirmation} onChange={handleChange} />
                                    </div>
                                    <div className="upp-full-width mt-4 flex justify-end">
                                        <button type="submit" className="upp-btn-save">Update Password</button>
                                    </div>
                                </form>
                            </motion.div>
                        )}
                        {activeTab === 'saved' && (
                            <motion.div className="upp-content-card" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                                <div className="upp-section-header">
                                    <h2>Your Saved Posts</h2>
                                    <p className="text-sm text-gray-500 mt-1">Manage and apply for posts you've bookmarked.</p>
                                </div>
                                
                                {loadingSavedPosts ? (
                                    <div className="py-20 text-center">
                                        <Loader2 size={30} className="animate-spin mx-auto text-primary opacity-20" />
                                    </div>
                                ) : savedPostsData.length === 0 ? (
                                    <div className="py-20 text-center text-gray-500">
                                        <Bookmark size={40} className="mx-auto mb-4 opacity-20" />
                                        <p>You haven't saved any posts yet.</p>
                                        <Link to="/feed" className="text-primary font-semibold mt-4 inline-block hover:underline">Browse Feed</Link>
                                    </div>
                                ) : (
                                    <div className="upp-saved-posts-list">
                                        {savedPostsData.map(post => (
                                            <div key={post.id} className="upp-saved-post-card">
                                                <div className="upp-saved-post-grid">
                                                    <div className="upp-saved-post-image">
                                                        <img src={post.image ? getStorageUrl(post.image) : '/images/logo.png'} alt={post.title} />
                                                        {post.status !== 'active' && <span className="upp-inactive-badge">Inactive</span>}
                                                    </div>
                                                    
                                                    <div className="upp-saved-post-details">
                                                        <div className="upp-saved-post-top">
                                                            <Link to={`/institutions/${post.institute?.slug || post.institute?.id}/profile`} className="upp-saved-institute">
                                                                {post.institute?.profile_photo ? (
                                                                    <img src={getStorageUrl(post.institute.profile_photo)} alt="" />
                                                                ) : <Building2 size={12} />}
                                                                {post.institute?.institute_name}
                                                                {!!post.institute?.is_premium && <BadgeCheck size={14} className="text-red-500 ml-1" />}
                                                            </Link>
                                                            <span className="upp-saved-date">{new Date(post.created_at).toLocaleDateString()}</span>
                                                        </div>
                                                        
                                                        <h3 className="upp-saved-title">{post.title}</h3>
                                                        <p className="upp-saved-desc">{post.small_description}</p>
                                                        
                                                        <div className="upp-saved-meta">
                                                            <span>{post.course_type}</span>
                                                            <span className="separator">•</span>
                                                            <span>{post.duration}</span>
                                                            <span className="separator">•</span>
                                                            <span>{post.location}</span>
                                                        </div>
                                                        
                                                        <div className="upp-saved-footer">
                                                            <button 
                                                                className="upp-saved-view-btn"
                                                                onClick={() => openProgrammeModal(post, post.institute)}
                                                            >
                                                                View Programme Info
                                                            </button>
                                                            
                                                            <div className="upp-saved-actions">
                                                                <button 
                                                                    className={`upp-action-icon ${copiedPostId === post.id ? 'copied' : ''}`}
                                                                    onClick={() => handleCopyPostLink(post)}
                                                                    title="Copy Link"
                                                                >
                                                                    {copiedPostId === post.id ? <Check size={18} /> : <Link2 size={18} />}
                                                                </button>
                                                                
                                                                <button 
                                                                    className="upp-action-icon active"
                                                                    onClick={() => handleToggleSave(post.id)}
                                                                    title="Unsave"
                                                                >
                                                                    <Bookmark size={18} fill="currentColor" />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </motion.div>
                        )}


                        {activeTab === 'roadmaps' && (
                            <motion.div className="upp-content-card" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                                <div className="upp-section-header">
                                    <h2>EMY Career Roadmaps</h2>
                                    <p className="text-sm text-gray-500 mt-1">Personalized career guidance specifically for you.</p>
                                </div>
                                {savedRoadmaps.length === 0 ? (
                                    <div className="py-20 text-center text-gray-500">
                                        <Sparkles size={40} className="mx-auto mb-4 opacity-20" />
                                        <p>You haven't saved any roadmaps yet. Talk to EMY to get one!</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {savedRoadmaps.map(roadmap => (
                                            <div key={roadmap.id} className={`roadmap-card ${expandedRoadmap === roadmap.id ? 'roadmap-expanded' : ''}`}>
                                                <div 
                                                    className="roadmap-header"
                                                    onClick={() => setExpandedRoadmap(expandedRoadmap === roadmap.id ? null : roadmap.id)}
                                                >
                                                    <div className="roadmap-icon-wrapper">
                                                        <Sparkles size={18} />
                                                    </div>
                                                    <div className="roadmap-info">
                                                        <h4 className="roadmap-goal">Goal: {roadmap.career_goal}</h4>
                                                        <p className="roadmap-date">Created on {new Date(roadmap.created_at).toLocaleDateString()}</p>
                                                    </div>
                                                    <div className="roadmap-actions">
                                                        <button 
                                                            className="roadmap-action-btn download"
                                                            onClick={(e) => handleDownloadPDF(e, roadmap)}
                                                            disabled={downloadingId === roadmap.id}
                                                            title="Download PDF"
                                                        >
                                                            {downloadingId === roadmap.id ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
                                                        </button>
                                                        <button 
                                                            className="roadmap-action-btn delete"
                                                            onClick={(e) => confirmDeleteRoadmap(e, roadmap)}
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                        <div className={`roadmap-chevron ${expandedRoadmap === roadmap.id ? 'rotated' : ''}`}>
                                                            <ChevronDown size={18} />
                                                        </div>
                                                    </div>
                                                </div>
                                                <AnimatePresence>
                                                    {expandedRoadmap === roadmap.id && (
                                                        <motion.div 
                                                            initial={{ height: 0, opacity: 0 }}
                                                            animate={{ height: 'auto', opacity: 1 }}
                                                            exit={{ height: 0, opacity: 0 }}
                                                            transition={{ duration: 0.3, ease: "easeInOut" }}
                                                        >
                                                            <div className="roadmap-body">
                                                                <div className="markdown-body prose prose-sm max-w-none">
                                                                    <ReactMarkdown>{roadmap.recommendation_text}</ReactMarkdown>
                                                                </div>
                                                            </div>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </motion.div>
                        )}
                        {activeTab === 'applications' && (
                            <motion.div className="upp-content-card" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                                <div className="upp-section-header">
                                    <h2>My Course Applications</h2>
                                    <p className="text-sm text-gray-500 mt-1">Status of your applications to various institutions.</p>
                                </div>
                                
                                {loadingApplications ? (
                                    <div className="py-20 text-center">
                                        <Loader2 size={30} className="animate-spin mx-auto text-primary opacity-20" />
                                    </div>
                                ) : applications.length === 0 ? (
                                    <div className="py-20 text-center text-gray-500">
                                        <FileText size={40} className="mx-auto mb-4 opacity-20" />
                                        <p>You haven't applied for any courses yet.</p>
                                        <Link to="/feed" className="text-primary font-semibold mt-4 inline-block hover:underline">Browse Courses</Link>
                                    </div>
                                ) : (
                                    <div className="upp-applications-list">
                                        {applications.map(app => (
                                            <div key={app.id} className="upp-application-card">
                                                <div className="upp-app-info-grid">
                                                    <div className="upp-app-post-thumb">
                                                        <img src={app.post?.image ? getStorageUrl(app.post.image) : (app.institute?.profile_photo ? getStorageUrl(app.institute.profile_photo) : '/images/logo.png')} alt={app.course_title} />
                                                    </div>
                                                    <div className="upp-app-details">
                                                        <h3>{app.course_title}</h3>
                                                        <p className="upp-app-institute">
                                                            <Building2 size={14} />
                                                            <Link to={`/institutions/${app.institute?.slug || app.institute?.id}/profile`}>
                                                                {app.institute?.institute_name}
                                                            </Link>
                                                        </p>
                                                        <div className="upp-app-meta">
                                                            <span className="flex items-center gap-1">
                                                                <Calendar size={12} /> {new Date(app.applied_at).toLocaleDateString()}
                                                            </span>
                                                            <span className={`status-badge status-${app.status}`}>
                                                                {app.status === 'sent' && <Clock size={12} />}
                                                                {app.status === 'viewed' && <CheckCircle2 size={12} />}
                                                                {app.status === 'contacted' && <Sparkles size={12} />}
                                                                {app.status}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="upp-app-actions">
                                                        <button 
                                                            onClick={() => openProgrammeModal(app.post, app.institute)}
                                                            className="upp-app-btn"
                                                        >
                                                            View Details
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </div>
                </div>
            </div>
            <DeleteConfirmModal 
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={handleDeleteRoadmap}
                isDeleting={isDeleting}
                title="Delete Roadmap"
            />

            {selectedPost && (
                <>
                    <ProgrammeInfoModal
                        isOpen={isProgrammeOpen}
                        onClose={() => setIsProgrammeOpen(false)}
                        course={selectedPost}
                        institute={selectedInstitute}
                        userRole={profileData?.user?.role}
                        isPremium={selectedInstitute?.is_premium}
                        onMoreInfo={() => openInfoModal()}
                        onApply={() => openSavedApplyModal()}
                        hideApply={activeTab === 'applications'}
                    />

                    <MoreInfoModal 
                        isOpen={isInfoOpen}
                        onClose={() => setIsInfoOpen(false)}
                        course={selectedPost}
                        institute={selectedInstitute}
                    />

                    <ApplyNowModal 
                        isOpen={showSavedApplyModal}
                        onClose={() => setShowSavedApplyModal(false)}
                        courseTitle={selectedPost?.title}
                        form={{ ...savedApplyForm, privacy_consent: savedApplyForm.privacyConsent }}
                        onChange={(e) => {
                            const { name, value, checked, type } = e.target;
                            if (name === 'privacy_consent') {
                                setSavedApplyForm({ ...savedApplyForm, privacyConsent: checked });
                            } else {
                                setSavedApplyForm({ ...savedApplyForm, [name]: type === 'checkbox' ? checked : value });
                            }
                        }}
                        onSubmit={handleSavedApplySubmit}
                        isSubmitting={savedApplying}
                        status={savedSubmissionStatus}
                    />
                </>
            )}
        </div>
    );
};

export default UserProfilePage;
