import React from 'react';
import { useNavigate } from 'react-router-dom';
import './NotFound.css';

const NotFound = () => {
    const navigate = useNavigate();

    return (
        <div className="not-found-container">
            <div className="not-found-content">
                <div className="error-badge">404</div>
                <h1 className="not-found-title">Page Not Found</h1>
                <p className="not-found-text">
                    The page you are looking for might have been removed, had its name changed, or is temporarily unavailable. 
                </p>
                <div className="not-found-actions">
                    {/* <button 
                        onClick={() => navigate('/')} 
                        className="btn-primary-glow"
                    >
                        Back to Home
                    </button> */}
                    <button 
                        onClick={() => navigate(-1)} 
                        className="btn-secondary-flat"
                    >
                        Go Back
                    </button>
                </div>
            </div>
            {/* Subtle background decorative elements */}
            <div className="bg-gradient-orb orb-1"></div>
            <div className="bg-gradient-orb orb-2"></div>
        </div>
    );
};

export default NotFound;
