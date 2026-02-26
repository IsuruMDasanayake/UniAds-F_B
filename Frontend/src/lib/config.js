export const BACKEND_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
export const API_BASE_URL = `${BACKEND_URL}/api`;

export const getStorageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    // Use the same BACKEND_URL for storage
    return `${BACKEND_URL}/storage/${path}`;
};
