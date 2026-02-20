import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, ShieldAlert, LogOut, Home, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../../lib/axios';
import './UnauthorizedAccess.css';

const UnauthorizedAccess = ({ type = 'USER' }) => {
    const navigate = useNavigate();
    const [countdown, setCountdown] = useState(type === 'USER' ? 10 : 10);

    const isNonPremium = type === 'NON_PREMIUM';

    useEffect(() => {
        const timer = setInterval(() => {
            setCountdown(prev => {
                if (prev <= 1) {
                    handleFinalAction();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    const handleLogout = async () => {
        try {
            await axiosClient.post('/api/logout');
        } catch (error) {
            console.error('Logout failed:', error);
        }
        localStorage.removeItem('ACCESS_TOKEN');
        localStorage.removeItem('APP_USER');
        window.location.href = '/login';
    };

    const handleFinalAction = () => {
        if (isNonPremium) {
            navigate('/pricing');
        } else {
            handleLogout();
        }
    };

    const handleGoBack = () => {
        navigate(-1);
    };

    return (
        <div className="ua-unauthorized-access-container">
            <motion.div
                className="ua-unauthorized-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <div className={`ua-icon-circle ${isNonPremium ? 'ua-warning' : 'ua-danger'}`}>
                    {isNonPremium ? <ShieldAlert size={48} /> : <Lock size={48} />}
                </div>

                <h1 className="ua-unauthorized-title">
                    {isNonPremium ? 'Premium Required' : 'Access Restricted'}
                </h1>

                <p className="ua-unauthorized-message">
                    {isNonPremium ? (
                        <>
                            This analytics dashboard is exclusive to <strong>Premium Institutions</strong>.
                            To access these features, please upgrade your subscription.
                        </>
                    ) : (
                        <>
                            You do not have permission to access the analytics dashboard.
                            This area is reserved for <strong>Institutional Partners</strong>.
                        </>
                    )}
                </p>

                <div className="ua-countdown-timer">
                    {isNonPremium ? (
                        <>You will be redirected to pricing in <span>{countdown}s</span></>
                    ) : (
                        <>You will be automatically logged out in <span>{countdown}s</span></>
                    )}
                </div>

                <div className="ua-unauthorized-actions">
                    <button className="ua-back-btn" onClick={handleGoBack}>
                        <ArrowLeft size={18} />
                        Go Back
                    </button>
                    {isNonPremium ? (
                        <button className="ua-logout-btn" onClick={() => navigate('/pricing')}>
                            <ShieldAlert size={18} />
                            Upgrade Now
                        </button>
                    ) : (
                        <button className="ua-logout-btn" onClick={handleLogout}>
                            <LogOut size={18} />
                            Logout Now
                        </button>
                    )}
                </div>

                <div className="ua-unauthorized-footer">
                    <button onClick={() => navigate('/feed')} className="ua-home-link">
                        <Home size={16} />
                        Back to Home
                    </button>
                </div>
            </motion.div>

            <div className="ua-unauthorized-background">
                <div className="ua-blob ua-blob-1"></div>
                <div className="ua-blob ua-blob-2"></div>
            </div>
        </div>
    );
};

export default UnauthorizedAccess;
