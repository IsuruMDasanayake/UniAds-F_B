import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../lib/axios';
import UserProfilePage from '../pages/UserProfilePage';
import MainProfilePage from '../pages/InstituteProfile/MainProfilePage';

const ProfileWrapper = () => {
    const [loading, setLoading] = useState(true);
    const [role, setRole] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProfileData = async () => {
            try {
                const response = await axiosClient.get('/api/profile/me');
                setRole(response.data.role);
            } catch (error) {
                console.error("Error fetching profile info", error);
                navigate('/login');
            } finally {
                setLoading(false);
            }
        };

        fetchProfileData();
    }, [navigate]);

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

    // Routes logic:
    // If User -> UserProfilePage
    // If Institute -> MainProfilePage (which handles fetching its own data when no ID is present)

    if (role === 'Institute') {
        return <MainProfilePage />;
    }

    return <UserProfilePage />;
};

export default ProfileWrapper;
