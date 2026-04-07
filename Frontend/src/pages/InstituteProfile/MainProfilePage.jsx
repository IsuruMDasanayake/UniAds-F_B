import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axiosClient from '../../lib/axios';
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

    const [institute, setInstitute] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);
    const [posts, setPosts] = useState([]);
    const [events, setEvents] = useState([]);
    const [about, setAbout] = useState(null);
    const [gallery, setGallery] = useState([]);
    const [isFollowing, setIsFollowing] = useState(false);
    const [loading, setLoading] = useState(true);

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
            if (tab === 'feed') navigate(`/institutions/${id}/profile`);
            else navigate(`/institutions/${id}/${tab}`);
        } else {
            // Dashboard view
            if (tab === 'feed') navigate(`/profile`);
            else navigate(`/profile/${tab}`);
        }
    };

    // Fetch Current User (Navbar Context)
    useEffect(() => {
        const fetchUser = async () => {
            try {
                // Use /api/profile/me so we get the 'institute' relation if logged in as Institute
                const res = await axiosClient.get('/api/profile/me');
                const payload = res.data.data;
                const userData = payload?.user;

                // If Institute, we merge the institute details so Navbar can access user.institute
                if (payload?.role === 'Institute' && payload?.institute) {
                    userData.institute = payload.institute;
                }

                setCurrentUser(userData);
            } catch (e) {
                // Not logged in or error
                setCurrentUser(null);
            }
        };
        fetchUser();
    }, []);

    const loadProfile = async () => {
        setLoading(true);
        try {
            let endpoint = '';
            if (id) {
                endpoint = `/api/institutions/${id}/profile`;
            } else {
                endpoint = `/api/profile/me`;
            }

            const response = await axiosClient.get(endpoint, {
                params: { per_page: 12 }
            });
            const data = response.data.data;

            if (!id && data?.role === 'Institute') {
                setInstitute(data.institute);
                setPosts(data.posts?.data || []);
                setEvents(data.events?.data || []);
                setAbout(data.about);
                
                // Sync session cache with fresh data from server
                const savedUser = JSON.parse(localStorage.getItem('APP_USER') || '{}');
                if (savedUser && data.user) {
                    const updatedUser = { ...data.user, institute: data.institute };
                    localStorage.setItem('APP_USER', JSON.stringify(updatedUser));
                    setCurrentUser(updatedUser);
                }
            } else if (id) {
                setInstitute(data.institute);
                setPosts(data.posts?.data || []);
                setEvents(data.events?.data || []);
                setAbout(data.about);
                setIsFollowing(!!data.isFollowing);

                // If this happens to be the logged in user's profile found via ID
                if (currentUser && currentUser.id === data.institute.user_id) {
                    const updatedUser = { ...currentUser, institute: data.institute };
                    localStorage.setItem('APP_USER', JSON.stringify(updatedUser));
                }

                // Add redirection logic for numeric IDs to slugs
                if (/^\d+$/.test(id) && data.institute.slug) {
                    const newPath = location.pathname.replace(`/institutions/${id}`, `/institutions/${data.institute.slug}`);
                    navigate(newPath, { replace: true });
                }
            }

            if (!id && data?.institute) {
                fetchExtras(data.institute.id);
            } else if (id) {
                fetchExtras(id);
            }
        } catch (error) {
            console.error("Error loading profile", error?.message || error);
            if (error.response?.status === 401 && !id) {
                navigate('/login');
            }
        } finally {
            setLoading(false);
        }
    };

    const fetchExtras = async (instId) => {
        try {
            const res = await axiosClient.get(`/api/institutions/${instId}/gallery`);
            // GalleryController returns paginated successResponse: { success: true, data: { data: [...], current_page, ... } }
            const payload = res.data.data;
            const images = (payload && Array.isArray(payload.data)) ? payload.data : (Array.isArray(payload) ? payload : []);
            setGallery(images);
        } catch (e) {
            console.error("Error fetching gallery", e?.message || e);
        }
    };

    const trackProfileView = async (instId) => {
        try {
            await axiosClient.post(`/api/institutions/${instId}/track-view`);
        } catch (e) {
            console.error("Error tracking profile view", e?.message || e);
        }
    };

    useEffect(() => {
        loadProfile();
        if (id) {
            trackProfileView(id);
        }
    }, [id, navigate]);

    const refreshData = () => {
        loadProfile();
    };


    // Handlers for Header Actions
    const handleFollow = async () => {
        if (!currentUser) {
            navigate('/login');
            return;
        }

        const previousFollowing = isFollowing;
        const previousFollowersCount = institute.followers_count;

        // Optimistic update
        setIsFollowing(!isFollowing);
        setInstitute(prev => ({
            ...prev,
            followers_count: !isFollowing ? (prev.followers_count + 1) : Math.max(0, prev.followers_count - 1)
        }));

        try {
            const res = await axiosClient.post(`/api/institutions/${institute.id}/follow`);
            setIsFollowing(res.data.data?.status === 'followed');
            setInstitute(prev => ({ ...prev, followers_count: res.data.data?.followers_count }));
        } catch (e) {
            console.error("Follow error", e?.message || e);
            // Rollback
            setIsFollowing(previousFollowing);
            setInstitute(prev => ({ ...prev, followers_count: previousFollowersCount }));
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

    if (loading) return (
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
                onUpdate={setInstitute}
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
