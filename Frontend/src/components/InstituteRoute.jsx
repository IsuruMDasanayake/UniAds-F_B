import { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import axiosClient from '../lib/axios';

const InstituteRoute = ({ children }) => {
    const [loading, setLoading] = useState(true);
    const [isInstitute, setIsInstitute] = useState(false);

    useEffect(() => {
        const checkUser = async () => {
            try {
                const { data } = await axiosClient.get('/api/user');
                if (data.role === 'Institute') {
                    setIsInstitute(true);
                }
            } catch (error) {
                console.error('Auth check failed', error);
            } finally {
                setLoading(false);
            }
        };

        checkUser();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-slate-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!isInstitute) {
        return <Navigate to="/login" replace />;
    }

    return children ? children : <Outlet />;
};

export default InstituteRoute;
