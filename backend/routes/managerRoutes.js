const express = require('express');
const router = express.Router();
const {
  getManagerDashboard,
  getMyHostels,
  getMyHostelById,
  createHostel,
  updateHostel,
  deleteHostel,
} = require('../controllers/managerController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Apply Protect and Hostel Manager Authorization globally to all manager routes
router.use(protect);
router.use(authorize('Hostel Manager'));

// 1. Manager Dashboard Analytics
router.get('/dashboard', getManagerDashboard);

// 2. Hostel CRUD Operations
router.get('/hostels', getMyHostels);
router.get('/hostels/:id', getMyHostelById);
router.post('/hostels', createHostel);
router.put('/hostels/:id', updateHostel);
router.delete('/hostels/:id', deleteHostel);

module.exports = router;
