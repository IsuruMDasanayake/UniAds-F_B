export const getStorageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    // Base URL for Laravel storage
    const baseUrl = 'http://localhost:8000';
    return `${baseUrl}/storage/${path}`;
};

export const BACKEND_URL = 'http://localhost:8000';
export const API_BASE_URL = `${BACKEND_URL}/api`;
