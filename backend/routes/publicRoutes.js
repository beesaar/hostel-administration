const express = require('express');
const router = express.Router();
const Hostel = require('../models/Hostel');

// @desc    Get a specific hostel image
// @route   GET /api/hostels/:hostelId/images/:imageId
// @access  Public
router.get('/hostels/:hostelId/images/:imageId', async (req, res) => {
  try {
    const { hostelId, imageId } = req.params;
    
    // We need to explicitly select the +images.data field because it's select: false by default
    const hostel = await Hostel.findById(hostelId).select('+images.data');
    
    if (!hostel) {
      return res.status(404).json({ success: false, message: 'Hostel not found' });
    }

    const image = hostel.images.find(img => img._id.toString() === imageId);
    
    if (!image || !image.data) {
      return res.status(404).json({ success: false, message: 'Image not found' });
    }

    res.set('Content-Type', image.contentType);
    res.send(image.data);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
});

module.exports = router;
