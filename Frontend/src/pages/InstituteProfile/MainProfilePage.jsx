import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axiosClient from '../../lib/axios';
import { useInstituteProfile, useInstituteGallery } from '../../hooks/useInstituteProfile';
import Navbar from '../../components/Navbar';
import ProfileHeader from './ProfileHeader';
import InstituteFeed from './InstituteFeed';
import InstituteAbout from './InstituteAbout';
import InstituteEvents from './InstituteEvents';
import InstituteCourses from './InstituteCourses';
import InstituteContact from './InstituteContact';

const MainProfilePage = () => {
    const { id } = useParams(); // If present, viewing specific institute
    const navigate = useNavigate();
    const location = useLocation();

    const [currentUser, setCurrentUser] = useState(null);
    const [isFollowing, setIsFollowing] = useState(false);
    const [userLoading, setUserLoading] = useState(true);

    // Determine Active Tab from URL
    // Routes: /institutions/:id/about, /profile/contact, etc.
    const getActiveTab = () => {
        const path = location.pathname;
        if (path.endsWith('/about')) return 'about';
        if (path.endsWith('/events')) return 'events';
        if (path.endsWith('/courses')) return 'courses';
        if (path.endsWith('/contact')) return 'contact';
        return 'feed'; // Default to feed (profile or profile/feed)
    };

    const activeTab = getActiveTab();

    const setActiveTab = (tab) => {
        // Construct new URL based on current context (profile or institutions/:id)
        if (id) {
            // Public view
            if (tab === 'feed') navigate(`/institutions/${id}/profile`, { state: { preserveScroll: true } });
            else navigate(`/institutions/${id}/${tab}`, { state: { preserveScroll: true } });
        } else {
            // Dashboard view
            if (tab === 'feed') navigate(`/profile`, { state: { preserveScroll: true } });
            else navigate(`/profile/${tab}`, { state: { preserveScroll: true } });
        }
    };

    // Fetch Current User (Navbar Context)
    useEffect(() => {
        const fetchUser = async () => {
            try {
                setUserLoading(true);
                const res = await axiosClient.get('/api/profile/me');
                const payload = res.data.data;
                const userData = payload?.user || payload; // fallback depending on format

                if (payload?.role === 'Institute' && payload?.institute) {
                    userData.institute = payload.institute;
                }

                setCurrentUser(userData);
            } catch (e) {
                setCurrentUser(null);
            } finally {
                setUserLoading(false);
            }
        };
        fetchUser();
    }, []);

    // Load Profile via TanStack Query
    const { data: profilePayload, isLoading: profileLoading, refetch: refetchProfile } = useInstituteProfile(id);
    const { data: galleryPayload, refetch: refetchGallery } = useInstituteGallery(id || currentUser?.institute?.id);

    const institute = profilePayload?.institute || null;
    const posts = profilePayload?.posts?.data || [];
    const events = profilePayload?.events?.data || [];
    const about = profilePayload?.about || null;
    const gallery = galleryPayload || [];

    // Track views exactly once per load if public
    useEffect(() => {
        if (id) {
            axiosClient.post(`/api/institutions/${id}/track-view`).catch(e => console.error(e));
        }
    }, [id]);

    useEffect(() => {
        if (profilePayload?.isFollowing !== undefined) {
            setIsFollowing(!!profilePayload.isFollowing);
        }
        
        // Handle URL correction for SEO/Slugs
        if (id && institute && /^\d+$/.test(id) && institute.slug) {
            const newPath = location.pathname.replace(`/institutions/${id}`, `/institutions/${institute.slug}`);
            navigate(newPath, { replace: true });
        }
    }, [profilePayload, id, institute, navigate, location.pathname]);

    const refreshData = () => {
        refetchProfile();
        refetchGallery();
    };


    // Handlers for Header Actions
    const handleFollow = async () => {
        if (!currentUser) {
            navigate('/login');
            return;
        }

        const previousFollowing = isFollowing;
        const previousFollowersCount = institute?.followers_count || 0;

        // Optimistic update
        setIsFollowing(!isFollowing);
        // Note: the component doesn't update the cache directly, but doing a soft update of local state is fine here 
        // since we are passing down a merged generic `institute`
        
        try {
            const res = await axiosClient.post(`/api/institutions/${institute.id}/follow`);
            setIsFollowing(res.data.data?.status === 'followed');
            refetchProfile(); // Let TanStack resync correctly
        } catch (e) {
            console.error("Follow error", e?.message || e);
            // Rollback
            setIsFollowing(previousFollowing);
        }
    };

    const handleAddPost = () => {
        // Trigger modal logic (to be implemented)
        console.log("Add Post triggered");
    };

    const handleAddEvent = () => {
        // Trigger modal logic (to be implemented)
        console.log("Add Event triggered");
    };

    const handleEditProfile = () => {
        // Trigger modal logic (to be implemented)
        console.log("Edit Profile triggered");
    };

    const handleViewReviews = () => {
        // Trigger modal logic (to be implemented)
        console.log("View Reviews triggered");
    };

    if (profileLoading || userLoading) return (
        <div>
            <Navbar />
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
        </div>
    );

    if (!institute) return <div className="p-8 text-center">Profile not found.</div>;

    // Ownership logic
    const isOwner = !id || (currentUser?.role === 'Institute' && currentUser?.id == institute.user_id);

    return (
        <div className="bg-gray-50 min-h-screen font-sans text-gray-900" style={{ backgroundColor: '#f5f5f5' }}>
            <Navbar user={currentUser} />

            <ProfileHeader
                institute={institute}
                onUpdate={refetchProfile}
                onRefresh={refreshData}
                isFollowing={isFollowing}
                showFollow={!isOwner}
                onFollow={handleFollow}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                isOwner={isOwner}
                currentUser={currentUser}
            />

            <main className="pb-12">
                {activeTab === 'feed' && (
                    <InstituteFeed
                        institute={institute}
                        isOwner={isOwner}
                        posts={posts}
                        events={events}
                        gallery={gallery}
                        onGalleryUpdate={refreshData}
                        onPostUpdate={refreshData}
                        onEventsUpdate={refreshData}
                        user={currentUser}
                    />
                )}
                {activeTab === 'about' && (
                    <InstituteAbout about={about} institute={institute} isOwner={isOwner} />
                )}
                {activeTab === 'events' && (
                    <div className="container mx-auto px-4 py-8">
                        <InstituteEvents
                            events={events}
                            institute={institute}
                            isOwner={isOwner}
                            onEventsUpdate={refreshData}
                        />
                    </div>
                )}
                {activeTab === 'courses' && (
                    <InstituteCourses institute={institute} courses={posts} isOwner={isOwner} />
                )}
                {activeTab === 'contact' && (
                    <InstituteContact institute={institute} isOwner={isOwner} />
                )}
                {activeTab === 'analytics' && (
                    <div className="container mx-auto px-4 py-8">
                        <div className="bg-white rounded-3xl p-8 shadow-sm text-center">
                            <h2 className="text-2xl font-bold mb-4">Analytics Dashboard</h2>
                            <p className="text-gray-600">This feature is coming soon to your React Dashboard.</p>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default MainProfilePage;
