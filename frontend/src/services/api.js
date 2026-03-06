import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_URL,
    headers: { 'Content-Type': 'application/json' },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('tribastion_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Handle auth errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401 || error.response?.status === 403) {
            // Token expired or invalid
            if (error.response?.data?.error === 'Invalid or expired token') {
                localStorage.removeItem('tribastion_token');
                localStorage.removeItem('tribastion_user');
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

// Auth APIs
export const authAPI = {
    login: (username, password) => api.post('/auth/login', { username, password }),
    register: (data) => api.post('/auth/register', data),
    getProfile: () => api.get('/auth/profile'),
};

// File APIs
export const fileAPI = {
    upload: (formData) => api.post('/files/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    }),
    list: (params) => api.get('/files', { params }),
    get: (id) => api.get(`/files/${id}`),
    download: (id) => api.get(`/files/${id}/download`, { responseType: 'blob' }),
    downloadOriginal: (id) => api.get(`/files/${id}/original`, { responseType: 'blob' }),
    delete: (id) => api.delete(`/files/${id}`),
};

// User APIs
export const userAPI = {
    list: () => api.get('/users'),
    create: (data) => api.post('/users', data),
    update: (id, data) => api.put(`/users/${id}`, data),
    delete: (id) => api.delete(`/users/${id}`),
};

// Stats API
export const statsAPI = {
    get: () => api.get('/stats'),
};

// Audit API
export const auditAPI = {
    list: (params) => api.get('/audit', { params }),
};

export default api;
