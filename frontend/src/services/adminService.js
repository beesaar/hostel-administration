import api from './api';

export const adminService = {
  // 1. Fetch dashboard overview analytics
  getDashboardStats: async () => {
    const response = await api.get('/admin/dashboard');
    return response.data;
  },

  // 2. Fetch all hostel managers (with optional search)
  getAllManagers: async (search = '') => {
    const params = search ? { search } : {};
    const response = await api.get('/admin/managers', { params });
    return response.data;
  },

  // 3. Fetch all registered students (with optional search)
  getAllStudents: async (search = '') => {
    const params = search ? { search } : {};
    const response = await api.get('/admin/students', { params });
    return response.data;
  },

  // 4. Fetch all hostels with status filter and search
  getAllHostels: async (status = '', search = '') => {
    const params = {};
    if (status) params.status = status;
    if (search) params.search = search;
    const response = await api.get('/admin/hostels', { params });
    return response.data;
  },

  // 5. Approve a pending hostel
  approveHostel: async (id) => {
    const response = await api.put(`/admin/hostels/${id}/approve`);
    return response.data;
  },

  // 6. Reject a hostel application with reason
  rejectHostel: async (id, reason) => {
    const response = await api.put(`/admin/hostels/${id}/reject`, { reason });
    return response.data;
  },

  // 7. Delete a user (student or manager)
  deleteUser: async (id) => {
    const response = await api.delete(`/admin/users/${id}`);
    return response.data;
  },

  // 8. Delete a hostel
  deleteHostel: async (id) => {
    const response = await api.delete(`/admin/hostels/${id}`);
    return response.data;
  },
};
