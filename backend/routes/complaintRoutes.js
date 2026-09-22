const express = require('express');
const router = express.Router();
const {
  createComplaint,
  getStudentComplaints,
  getManagerComplaints,
  updateComplaintStatus,
} = require('../controllers/complaintController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Student Routes
router.post('/', protect, authorize('Student'), createComplaint);
router.get('/student', protect, authorize('Student'), getStudentComplaints);

// Manager Routes
router.get('/manager', protect, authorize('Hostel Manager'), getManagerComplaints);
router.patch('/:id/status', protect, authorize('Hostel Manager'), updateComplaintStatus);

module.exports = router;
