const express = require('express');
const router = express.Router();
const {
  getAdminDashboardStats,
  getAllManagers,
  getAllStudents,
  getAllHostels,
  approveHostel,
  rejectHostel,
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Apply Protect and Admin Authorization globally to all admin routes
router.use(protect);
router.use(authorize('Admin'));

// 1. Admin Dashboard Analytics Route
router.get('/dashboard', getAdminDashboardStats);

// 2. User Management Routes
router.get('/managers', getAllManagers);
router.get('/students', getAllStudents);

// 3. Hostel Verification & Moderation Routes
router.get('/hostels', getAllHostels);
router.put('/hostels/:id/approve', approveHostel);
router.put('/hostels/:id/reject', rejectHostel);

module.exports = router;
