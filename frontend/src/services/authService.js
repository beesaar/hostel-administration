import api from './api';

export const authService = {
  // Login user (Student, Manager, Admin)
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },

  // Register user
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  // Get current logged-in user profile
  getProfile: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },
};
