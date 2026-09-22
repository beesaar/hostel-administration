const express = require('express');
const router = express.Router();
const {
  createBooking,
  getStudentBookings,
  getStudentAccommodationStatus,
  getManagerBookings,
  updateBookingStatus,
} = require('../controllers/bookingController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

// Student Routes
router.post('/', authorize('Student'), createBooking);
router.get('/student', authorize('Student'), getStudentBookings);
router.get('/student/status', authorize('Student'), getStudentAccommodationStatus);

// Manager Routes
router.get('/manager', authorize('Hostel Manager'), getManagerBookings);
router.patch('/:id/status', authorize('Hostel Manager'), updateBookingStatus);

module.exports = router;
