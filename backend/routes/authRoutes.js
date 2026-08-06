const express = require('express');
const router = express.Router();
const {
  registerUser,
  loginUser,
  getMe,
} = require('../controllers/authController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Public Routes
router.post('/register', registerUser);
router.post('/login', loginUser);

// Protected Routes (Require valid JWT)
router.get('/me', protect, getMe);

// Role-Protected Test Routes
router.get('/admin-test', protect, authorize('Admin'), (req, res) => {
  res.status(200).json({
    message: 'Access granted: You are authorized as Admin!',
    user: req.user,
  });
});

router.get('/manager-test', protect, authorize('Admin', 'Hostel Manager'), (req, res) => {
  res.status(200).json({
    message: 'Access granted: You are authorized as Hostel Manager or Admin!',
    user: req.user,
  });
});

module.exports = router;