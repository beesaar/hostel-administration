import axios from 'axios';

// Resolved base URL for backend API
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Helper to construct hostel image URLs
export const getHostelImageUrl = (hostelId, imageId) => `${API_BASE_URL}/hostels/${hostelId}/images/${imageId}`;

// Base Axios instance configured for Hostel Administration backend
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Automatically attach JWT Bearer token to headers
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Global error logging and unauthorized handler
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Optional: Auto logout if token expired or invalid
      console.warn('Session expired or unauthorized. Please re-authenticate.');
    }
    return Promise.reject(error);
  }
);

export default api;
