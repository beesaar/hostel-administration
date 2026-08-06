import api from './api';

export const managerService = {
  // 1. Fetch manager dashboard stats
  getDashboardStats: async () => {
    const response = await api.get('/manager/dashboard');
    return response.data;
  },

  // 2. Fetch all hostels created by this manager
  getMyHostels: async (status = '', search = '') => {
    const params = {};
    if (status) params.status = status;
    if (search) params.search = search;
    const response = await api.get('/manager/hostels', { params });
    return response.data;
  },

  // 3. Fetch single hostel detail by ID
  getHostelById: async (id) => {
    const response = await api.get(`/manager/hostels/${id}`);
    return response.data;
  },

  // 4. Create a new hostel
  createHostel: async (hostelData) => {
    const response = await api.post('/manager/hostels', hostelData);
    return response.data;
  },

  // 5. Update an existing hostel
  updateHostel: async (id, hostelData) => {
    const response = await api.put(`/manager/hostels/${id}`, hostelData);
    return response.data;
  },

  // 6. Delete a hostel
  deleteHostel: async (id) => {
    const response = await api.delete(`/manager/hostels/${id}`);
    return response.data;
  },
};
