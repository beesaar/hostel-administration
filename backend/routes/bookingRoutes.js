const express = require('express');
const router = express.Router();
const {
  createBooking,
  getStudentBookings,
  getStudentAccommodationStatus,
  requestLeave,
  getManagerBookings,
  getManagerResidents,
  updateBookingStatus,
  handleLeaveApproval,
} = require('../controllers/bookingController');
const { protect, authorize } = require('../middleware/authMiddleware');


router.use(protect);
// Student Routes
router.post('/', authorize('Student'), createBooking);
router.post('/leave', authorize('Student'), requestLeave);
router.get('/student', authorize('Student'), getStudentBookings);
router.get('/student/status', authorize('Student'), getStudentAccommodationStatus);

// Manager Routes — specific named routes BEFORE param routes
router.get('/manager', authorize('Hostel Manager'), getManagerBookings);
router.get('/manager/residents', authorize('Hostel Manager'), getManagerResidents);
router.patch('/:id/status', authorize('Hostel Manager'), updateBookingStatus);
router.patch('/:id/leave-approval', authorize('Hostel Manager'), handleLeaveApproval);

module.exports = router;
