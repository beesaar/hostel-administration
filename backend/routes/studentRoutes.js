const express = require('express');
const router = express.Router();
const { getApprovedHostels, getHostelById, getHostelRooms } = require('../controllers/studentController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);
router.use(authorize('Student'));

router.get('/hostels', getApprovedHostels);
router.get('/hostels/:id', getHostelById);
router.get('/hostels/:id/rooms', getHostelRooms);

module.exports = router;
