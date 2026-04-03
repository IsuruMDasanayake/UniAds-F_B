import { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import axiosClient from '../lib/axios';
import UnauthorizedAccess from './Analytics/UnauthorizedAccess';

const InstituteRoute = ({ children }) => {
    const [loading, setLoading] = useState(true);
    const [accessState, setAccessState] = useState('LOADING'); // LOADING, AUTHORIZED, DENIED_USER, DENIED_NONPREMIUM

    useEffect(() => {
        const checkAccess = async () => {
            try {
                const response = await axiosClient.get('/api/profile/me');
                const payload = response.data.data;

                if (payload.role !== 'Institute') {
                    setAccessState('DENIED_USER');
                } else if (!payload.institute?.is_premium || 
                           !payload.institute?.premium_expires_at || 
                           new Date(payload.institute.premium_expires_at) < new Date()) {
                    setAccessState('DENIED_NONPREMIUM');
                } else {
                    setAccessState('AUTHORIZED');
                }
            } catch (error) {
                console.error('Access check failed', error);
                setAccessState('DENIED_USER');
            } finally {
                setLoading(false);
            }
        };

        checkAccess();
    }, []);

    if (loading) {
        return (
            <div className="loading-overlay-v2">
                <div className="spinner-box">
                    <div className="ui-loader loader-blk">
                        <svg viewBox="22 22 44 44" className="multiColor-loader">
                            <circle cx="44" cy="44" r="20.2" fill="none" strokeWidth="3.6" className="loader-circle loader-circle-animation"></circle>
                        </svg>
                    </div>
                    <p>Verifying access...</p>
                </div>
            </div>
        );
    }

    if (accessState === 'DENIED_USER') {
        return <UnauthorizedAccess type="USER" />;
    }

    if (accessState === 'DENIED_NONPREMIUM') {
        return <UnauthorizedAccess type="NON_PREMIUM" />;
    }

    return children ? children : <Outlet />;
};

export default InstituteRoute;
