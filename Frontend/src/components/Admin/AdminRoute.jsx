import React from 'react';
import { Navigate } from 'react-router-dom';

const AdminRoute = ({ children }) => {
    const userStr = localStorage.getItem('APP_USER');
    let user = null;

    if (userStr) {
        try {
            user = JSON.parse(userStr);
        } catch (e) {
            console.error('Error parsing user data', e?.message || e);
        }
    }

    // Check if authenticated and is Admin
    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (user.role !== 'Admin') {
        return <Navigate to="/" replace />;
    }

    return children;
};

export default AdminRoute;
