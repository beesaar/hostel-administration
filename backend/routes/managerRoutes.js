const express = require('express');
const router = express.Router();
const {
  getManagerDashboard,
  getMyHostels,
  getMyHostelById,
  createHostel,
  updateHostel,
  deleteHostel,
  uploadHostelImages,
  deleteHostelImage,
} = require('../controllers/managerController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { upload } = require('../middleware/uploadMiddleware');

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

// 3. Image Upload Operations
router.post('/hostels/:id/images', upload.array('images', 10), uploadHostelImages);
router.delete('/hostels/:id/images/:imageId', deleteHostelImage);

module.exports = router;
