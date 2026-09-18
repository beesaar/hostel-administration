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

  getManagerBookings: async () => {
    const response = await api.get('/bookings/manager');
    return response.data;
  },

  updateBookingStatus: async (bookingId, status) => {
    const response = await api.patch(`/bookings/${bookingId}/status`, { status });
    return response.data;
  }
};
