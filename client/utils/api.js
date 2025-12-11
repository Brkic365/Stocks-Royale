import axios from 'axios';
import { getToken } from './auth';

// Hardcoded to 4000 to fix configuration mismatch
export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

const api = axios.create({
    baseURL: `${API_URL}/api`,
});

api.interceptors.request.use((config) => {
    const token = getToken();
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default api;
