import axios from 'axios';

import { BACKEND_URL } from './config';

const axiosClient = axios.create({
    baseURL: BACKEND_URL,
    headers: {
        'Accept': 'application/json',
    },
    withCredentials: false,
});

// Request interceptor to add the Bearer token
axiosClient.interceptors.request.use((config) => {
    const token = localStorage.getItem('ACCESS_TOKEN');
    if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Response interceptor for handling 401 errors
axiosClient.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        const { response, config } = error;
        
        // Don't auto-logout for login/register/password-reset endpoints
        const publicEndpoints = ['/api/login', '/api/register', '/api/register-institute', '/api/password/forgot', '/api/password/reset', '/api/user'];
        const isPublicEndpoint = publicEndpoints.some(endpoint => config?.url?.includes(endpoint));
        
        if (response && response.status === 401 && !isPublicEndpoint) {
            const token = localStorage.getItem('ACCESS_TOKEN');
            
            if (token) {
                console.warn('Unauthorized request. Clearing token and redirecting...', config.url);
                localStorage.removeItem('ACCESS_TOKEN');
                localStorage.removeItem('APP_USER');
                
                // Avoid infinite redirect if already navigating to /
                if (window.location.pathname !== '/' && !window.location.pathname.match(/^\/(login|register)/)) {
                    window.location.href = '/';
                }
            }
        }
        throw error;
    }
);

export default axiosClient;
