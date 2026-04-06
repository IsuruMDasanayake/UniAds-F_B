import React, { useState } from 'react';
import { Mail, MapPin, UserPlus, Check, PlusCircle, Calendar as CalendarIcon, Edit, BarChart3, Star, StarHalf, MessageSquare, BadgeCheck, Building2, Send } from 'lucide-react';
import { useChat } from '../../context/ChatContext';
import ChatService from '../../services/ChatService';
import { getStorageUrl } from '../../lib/config';
import { isPremiumActive } from '../../utils/premium';
import './ProfileHeader.css';

// Assuming these modals are defined elsewhere and imported
import EditProfileModal from './modals/EditProfileModal';
import AddPostModal from './modals/AddPostModal';
import AddEventModal from './modals/AddEventModal';
import ReviewsModal from './modals/ReviewsModal';
import AccessDeniedModal from '../../components/Modals/AccessDeniedModal';

const ProfileHeader = ({
    institute,
    isFollowing,
    onFollow,
    activeTab,
    setActiveTab,
    isOwner,
    onUpdate, // Function to update institute state in parent
    onRefresh, // Function to trigger a complete soft data refresh
    showFollow, // This prop might become redundant if currentUser logic handles it
    currentUser // New prop for current user context
}) => {
    if (!institute) return null;

    // State for modals
    const [showEditProfile, setShowEditProfile] = useState(false);
    const [showAddPost, setShowAddPost] = useState(false);
    const [showAddEvent, setShowAddEvent] = useState(false);
    const [showReviews, setShowReviews] = useState(false);
    const [showAccessDenied, setShowAccessDenied] = useState(false);
    const { selectConversation } = useChat();
    const [isMsgLoading, setIsMsgLoading] = useState(false);

    // Helpers
    const isPremium = isPremiumActive(institute);

    const isApproved = institute.status === 'approved';

    // Handlers
    const handleProfileUpdate = (updatedInstitute) => {
        if (onUpdate) onUpdate(updatedInstitute);
        setShowEditProfile(false);
    };

    const handleAddPostClick = () => {
        if (isApproved) setShowAddPost(true);
        else setShowAccessDenied(true);
    };

    const handleAddEventClick = () => {
        if (isApproved) setShowAddEvent(true);
        else setShowAccessDenied(true);
    };

    const renderStars = () => {
        const rating = parseFloat(institute.average_rating || 0);
        const count = institute.rating_count || 0;
        const stars = [];
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating - fullStars >= 0.5;

        for (let i = 0; i < fullStars; i++) {
            stars.push(<Star key={`full-${i}`} size={14} fill="#ffc107" color="#ffc107" />);
        }
        if (hasHalfStar) {
            stars.push(<StarHalf key="half" size={14} fill="#ffc107" color="#ffc107" />);
        }
        const remaining = 5 - stars.length;
        for (let i = 0; i < remaining; i++) {
            stars.push(<Star key={`empty-${i}`} size={14} color="#ffc107" />);
        }

        return (
            <div className="stars-summary">
                <div className="star-display">{stars}</div>
                <span className="numeric-rating">({rating.toFixed(1)}) - {count} Ratings</span>
            </div>
        );
    };

    return (
        <div className="profile-header-section">
            {/* SVG mask for half stars - Optional if using Lucide StarHalf directly with fill, but keeping for custom needs if any */}
            {/* Removed the SVG mask as StarHalf is used directly */}

            {/* Cover Photo */}
            <div className="cover-photo-container">
                <img
                    src={getStorageUrl(institute.cover_photo) || '/images/cover.png'}
                    alt="Cover"
                    className="cover-photo"
                />
                <div className="cover-overlay"></div>
            </div>

            <div className="container mx-auto px-4">
                <div className="profile-content">
                    {/* Profile Photo */}
                    <div className="profile-photo-wrapper">
                        <div className="photo-inner">
                            <img
                                src={getStorageUrl(institute.profile_photo) || `https://api.dicebear.com/7.x/initials/svg?seed=${institute.institute_name || 'Institute'}&backgroundColor=ffc107`}
                                alt={institute.institute_name}
                                className="profile-photo"
                            />
                        </div>
                    </div>

                    {/* Info */}
                    <div className="profile-details-col">
                        <div className="title-row">
                            <h1>
                                {institute.institute_name}
                                {isPremium && (
                                    <BadgeCheck
                                        size={22}
                                        fill="#ff4757"
                                        color="#ffffff"
                                        style={{ marginLeft: '0px', verticalAlign: 'middle', display: 'inline-block' }}
                                    />
                                )}
                            </h1>
                        </div>

                        <p className="profile-bio">{institute.bio || ""}</p>

                        <div className="profile-stats-row">
                            <div className="profile-stats-grid">
                                <div className="meta-item">
                                    <MapPin size={16} /> {institute.location}
                                </div>

                                {institute.institute_type && (
                                    <div className="meta-item">
                                        <Building2 size={16} /> {institute.institute_type}
                                    </div>
                                )}
                            </div>

                            <div className="profile-stats-grid">
                                {isPremium && institute.reviews_enabled == 1 && (
                                    <div className="meta-item">
                                        {renderStars()}
                                    </div>
                                )}

                                {isPremium && institute.followers_enabled == 1 && (
                                    <div className="meta-item">
                                        <UserPlus size={16} /> <strong>{institute.followers_count || 0}</strong> &nbsp;Followers
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="profile-actions-col">
                        {isOwner ? (
                            <div className="owner-tools">
                                {/* Duplicate Star view for owner? Blade shows it inside action-buttons for mobile/layout reasons sometimes, skipping to avoid clutter unless requested specifically, sticking to main info area for stars */}

                                <button className="btn-inst btn-add-post" onClick={handleAddPostClick}>
                                    <PlusCircle size={16} /> Add Post
                                </button>
                                <button className="btn-inst btn-add-event" onClick={handleAddEventClick}>
                                    <CalendarIcon size={16} /> Add Event
                                </button>
                                <button className="btn-inst btn-edit-profile" onClick={() => setShowEditProfile(true)}>
                                    <Edit size={16} /> Edit Profile
                                </button>
                            </div>
                        ) : (
                            <div className="visitor-tools">
                                {currentUser && !isOwner && isPremium && institute.chat_enabled == 1 && (
                                    currentUser.role !== 'Institute' || 
                                    isPremiumActive(currentUser.institute)
                                ) && (
                                    <button
                                        className="btn-inst btn-message"
                                        onClick={async () => {
                                            if (isMsgLoading) return;
                                            setIsMsgLoading(true);
                                            try {
                                                const res = await ChatService.startConversation('Institute', institute.id);
                                                selectConversation(res.data.data);
                                            } catch (e) {
                                                console.error("Chat start error", e);
                                            } finally {
                                                setIsMsgLoading(false);
                                            }
                                        }}
                                        disabled={isMsgLoading}
                                    >
                                        <Send size={16} /> {isMsgLoading ? 'Starting...' : 'Message'}
                                    </button>
                                )}
                                {/* Checks based on Blade: Auth check && Not Institute Role && Premium && Active && Enabled */}
                                {showFollow && isPremium && institute.followers_enabled == 1 && (
                                    <button
                                        onClick={onFollow}
                                        className={`btn-inst btn-follow ${isFollowing ? 'btn-followed' : ''}`}
                                    >
                                        {isFollowing ? <><Check size={16} /> Followed</> : <><UserPlus size={16} /> Follow</>}
                                    </button>
                                )}

                                {currentUser && isPremium && institute.reviews_enabled == 1 && (
                                    <button className="btn-inst btn-reviews" onClick={() => setShowReviews(true)}>
                                        <MessageSquare size={16} /> Reviews
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Navigation Tabs */}
                <div className="profile-tabs-wrapper">
                    <div className="profile-tabs">
                        {['feed', 'events', 'about', 'courses', 'contact'].map((tab) => (
                            <button
                                key={tab}
                                className={`tab-btn ${activeTab === tab ? 'active' : ''} ${tab === 'events' ? 'mobile-only-tab' : ''}`}
                                onClick={() => setActiveTab(tab)}
                            >
                                {tab.toUpperCase()}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Render Modals */}
            {showEditProfile && (
                <EditProfileModal
                    institute={institute}
                    onClose={() => setShowEditProfile(false)}
                    onUpdate={handleProfileUpdate}
                />
            )}
            {showAddPost && (
                <AddPostModal
                    institute={institute}
                    onClose={() => setShowAddPost(false)}
                    onSuccess={() => window.location.reload()}
                />
            )}
            {showAddEvent && (
                <AddEventModal
                    institute={institute}
                    onClose={() => setShowAddEvent(false)}
                    onSuccess={() => window.location.reload()}
                />
            )}
            {showReviews && (
                <ReviewsModal
                    institute={institute}
                    currentUser={currentUser}
                    onClose={() => setShowReviews(false)}
                    onSuccess={onRefresh}
                />
            )}

            <AccessDeniedModal
                isOpen={showAccessDenied}
                onClose={() => setShowAccessDenied(false)}
            />
        </div>
    );
};

export default ProfileHeader;