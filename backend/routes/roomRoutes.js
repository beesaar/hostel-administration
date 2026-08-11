const express = require('express');
const router = express.Router();
const {
  getRoomsByHostel,
  getRoomById,
  createRoom,
  createMultipleRooms,
  updateRoom,
  deleteRoom,
} = require('../controllers/roomController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Apply Protect and Hostel Manager Authorization globally to all room routes
router.use(protect);
router.use(authorize('Hostel Manager'));

// Hostel-specific room routes (e.g., /api/manager/hostels/:hostelId/rooms)
router.get('/hostels/:hostelId/rooms', getRoomsByHostel);
router.post('/hostels/:hostelId/rooms', createRoom);
router.post('/hostels/:hostelId/rooms/bulk', createMultipleRooms);

// Individual room routes (e.g., /api/manager/rooms/:roomId)
router.get('/rooms/:roomId', getRoomById);
router.put('/rooms/:roomId', updateRoom);
router.delete('/rooms/:roomId', deleteRoom);

module.exports = router;
