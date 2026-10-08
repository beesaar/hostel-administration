const express = require('express');
const router = express.Router();
const {
  getAdminDashboardStats,
  getAllManagers,
  getAllStudents,
  getAllHostels,
  approveHostel,
  rejectHostel,
  deleteUser,
  deleteHostel,
  toggleUserStatus,
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
router.patch('/users/:id/status', toggleUserStatus);

// 3. Hostel Verification & Moderation Routes
router.get('/hostels', getAllHostels);
router.put('/hostels/:id/approve', approveHostel);
router.put('/hostels/:id/reject', rejectHostel);

// 4. Delete Management Routes
router.delete('/users/:id', deleteUser);
router.delete('/hostels/:id', deleteHostel);

module.exports = router;
