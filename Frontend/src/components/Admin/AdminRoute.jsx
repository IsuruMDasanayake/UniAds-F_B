import React from 'react';
import { Navigate } from 'react-router-dom';

const AdminRoute = ({ children }) => {
    const token = localStorage.getItem('ACCESS_TOKEN');
    const userStr = localStorage.getItem('APP_USER');
    let user = null;

    if (userStr) {
        try {
            user = JSON.parse(userStr);
        } catch (e) {
            console.error('Error parsing user data', e);
        }
    }

    // Check if authenticated and is Admin
    if (!token || !user || user.role !== 'Admin') {
        // If we have a token but wrong role, redirect to unauthorized or home
        // For now, redirecting to login if no token, home if wrong role
        if (!token) return <Navigate to="/login" replace />;
        return <Navigate to="/" replace />;
    }

    return children;
};

export default AdminRoute;
