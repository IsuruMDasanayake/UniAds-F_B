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
                const { data } = await axiosClient.get('/api/profile/me');

                if (data.role !== 'Institute') {
                    setAccessState('DENIED_USER');
                } else if (!data.institute?.is_premium) {
                    setAccessState('DENIED_NONPREMIUM');
                } else {
                    setAccessState('AUTHORIZED');
                }
            } catch (error) {
                console.error('Access check failed', error);
                // If 401, axiosClient interceptor will handle redirect to login
                // For other errors, we default to denied user to be safe
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
