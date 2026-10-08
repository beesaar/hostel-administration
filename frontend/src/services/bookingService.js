import api from './api';

export const bookingService = {
  createBooking: async (hostelId, roomId) => {
    const response = await api.post('/bookings', { hostelId, roomId });
    return response.data;
  },

  getStudentBookings: async () => {
    const response = await api.get('/bookings/student');
    return response.data;
  },

  getStudentAccommodationStatus: async () => {
    const response = await api.get('/bookings/student/status');
    return response.data;
  },

  getManagerBookings: async () => {
    const response = await api.get('/bookings/manager');
    return response.data;
  },

  getManagerResidents: async () => {
    const response = await api.get('/bookings/manager/residents');
    return response.data;
  },

  updateBookingStatus: async (bookingId, status, managerResponse = '') => {
    const response = await api.patch(`/bookings/${bookingId}/status`, { status, managerResponse });
    return response.data;
  },

  requestLeave: async (leaveReason) => {
    const response = await api.post('/bookings/leave', { leaveReason });
    return response.data;
  },

  handleLeaveApproval: async (bookingId, action, managerResponse = '') => {
    const response = await api.patch(`/bookings/${bookingId}/leave-approval`, { action, managerResponse });
    return response.data;
  }
};
