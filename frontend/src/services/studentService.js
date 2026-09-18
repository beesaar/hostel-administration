import api from './api';

export const studentService = {
  // 1. Fetch all approved hostels
  getApprovedHostels: async () => {
    const response = await api.get('/student/hostels');
    return response.data;
  },

  // 2. Fetch specific hostel details
  getHostelById: async (id) => {
    const response = await api.get(`/student/hostels/${id}`);
    return response.data;
  },

  // 3. Fetch rooms for a specific hostel
  getHostelRooms: async (id) => {
    const response = await api.get(`/student/hostels/${id}/rooms`);
    return response.data;
  }
};
