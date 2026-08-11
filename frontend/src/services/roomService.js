import api from './api';

export const roomService = {
  // Get all rooms for a hostel
  getRoomsByHostel: async (hostelId) => {
    const response = await api.get(`/manager/hostels/${hostelId}/rooms`);
    return response.data;
  },

  // Get a single room
  getRoomById: async (roomId) => {
    const response = await api.get(`/manager/rooms/${roomId}`);
    return response.data;
  },

  // Add a new room
  createRoom: async (hostelId, roomData) => {
    const response = await api.post(`/manager/hostels/${hostelId}/rooms`, roomData);
    return response.data;
  },

  // Bulk create rooms
  bulkCreateRooms: async (hostelId, payload) => {
    const response = await api.post(`/manager/hostels/${hostelId}/rooms/bulk`, payload);
    return response.data;
  },

  // Update a room
  updateRoom: async (roomId, roomData) => {
    const response = await api.put(`/manager/rooms/${roomId}`, roomData);
    return response.data;
  },

  // Delete a room
  deleteRoom: async (roomId) => {
    const response = await api.delete(`/manager/rooms/${roomId}`);
    return response.data;
  },
};

export default roomService;
