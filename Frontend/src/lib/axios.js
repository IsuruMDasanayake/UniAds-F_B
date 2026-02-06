import axios from 'axios';

const axiosClient = axios.create({
    baseURL: 'http://localhost:8000',
    headers: {
        'Accept': 'application/json',
    },
    withCredentials: false, // Use token-based auth only
});

// Request interceptor to add the Bearer token
axiosClient.interceptors.request.use((config) => {
    const token = localStorage.getItem('ACCESS_TOKEN');
    if (token) {
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
        const publicEndpoints = ['/api/login', '/api/register', '/api/register-institute', '/api/password/forgot', '/api/password/reset'];
        const isPublicEndpoint = publicEndpoints.some(endpoint => config?.url?.includes(endpoint));
        
        if (response && response.status === 401 && !isPublicEndpoint) {
            // Only clear and redirect if we're actually authenticated
            const token = localStorage.getItem('ACCESS_TOKEN');
            
            if (token) {
                localStorage.removeItem('ACCESS_TOKEN');
                localStorage.removeItem('APP_USER');
                
                // Only redirect if we're not already on a public page
                if (!window.location.pathname.match(/^\/(login|register|$)/)) {
                    window.location.href = '/';
                }
            }
        }
        throw error;
    }
);

export default axiosClient;
