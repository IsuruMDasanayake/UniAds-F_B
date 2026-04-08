import axios from 'axios';

import { BACKEND_URL } from './config';

const axiosClient = axios.create({
    baseURL: BACKEND_URL,
    headers: {
        'Accept': 'application/json',
    },
    withCredentials: true,
    withXSRFToken: true,
});

// Note: We no longer manually inject the Bearer token from localStorage.
// Instead, we rely on secure HttpOnly cookies and withCredentials: true.

import { toast } from 'sonner';

axiosClient.interceptors.response.use(
    (response) => {
        // Handle success messages if returned from API
        if (response.data && response.data.success && response.data.message && 
            (window.location.pathname.includes('/create') || window.location.pathname.includes('/edit'))) {
            toast.success(response.data.message);
        }
        return response;
    },
    (error) => {
        const { response, config } = error;
        
        // Handling specific status codes
        if (response) {
            const message = response.data?.message || 'An unexpected error occurred';
            
            switch (response.status) {
                case 401:
                    // Only redirect if not on a public endpoint
                    const publicEndpoints = ['/api/login', '/api/register', '/api/register-institute', '/api/password/forgot', '/api/password/reset', '/api/user'];
                    const isPublicEndpoint = publicEndpoints.some(endpoint => config?.url?.includes(endpoint));
                    
                    if (!isPublicEndpoint) {
                        // Tokens are in HttpOnly cookies — no localStorage to clear.
                        // Just redirect to home so App.jsx re-runs fetchUser() and
                        // correctly resolves to unauthenticated state.
                        if (window.location.pathname !== '/' && !window.location.pathname.match(/^\/(login|register)/)) {
                            window.location.href = '/';
                        }
                    }
                    break;
                case 403:
                    toast.error('Permission Denied', { description: message });
                    break;
                case 422:
                    // Validation errors
                    const errors = response.data.errors;
                    if (errors) {
                        Object.keys(errors).forEach(key => {
                            toast.error(`Validation Error: ${key}`, { description: errors[key][0] });
                        });
                    } else {
                        toast.error(message);
                    }
                    break;
                case 500:
                    const correlationId = response.data?.correlation_id;
                    const displayId = correlationId ? ` (Ref: ${correlationId.substring(0, 8)})` : '';
                    toast.error('Server Error', { 
                        description: `A server-side error occurred. Please try again later.${displayId}` 
                    });
                    break;
                default:
                    toast.error('Error', { description: message });
            }
        } else {
            toast.error('Network Error', { description: 'Please check your internet connection.' });
        }
        
        throw error;
    }
);

export default axiosClient;
