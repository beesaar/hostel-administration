const Hostel = require('../models/Hostel');
const Room = require('../models/Room');

// @desc    Get all approved hostels
// @route   GET /api/student/hostels
// @access  Private (Student)
const getApprovedHostels = async (req, res) => {
  try {
    const hostels = await Hostel.find({ status: 'Approved' }).select('-rejectionReason');
    res.status(200).json(hostels);
  } catch (error) {
    console.error('Error fetching approved hostels:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get hostel by ID (if approved)
// @route   GET /api/student/hostels/:id
// @access  Private (Student)
const getHostelById = async (req, res) => {
  try {
    const hostel = await Hostel.findOne({ _id: req.params.id, status: 'Approved' }).populate('manager', 'name email phone');

    if (!hostel) {
      return res.status(404).json({ message: 'Hostel not found or not approved' });
    }

    res.status(200).json(hostel);
  } catch (error) {
    console.error('Error fetching hostel details:', error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Hostel not found' });
    }
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get rooms for an approved hostel
// @route   GET /api/student/hostels/:id/rooms
// @access  Private (Student)
const getHostelRooms = async (req, res) => {
  try {
    // Verify hostel is approved first
    const hostel = await Hostel.findOne({ _id: req.params.id, status: 'Approved' });
    if (!hostel) {
      return res.status(404).json({ message: 'Hostel not found or not approved' });
    }

    const rooms = await Room.find({ hostel: req.params.id });
    res.status(200).json(rooms);
  } catch (error) {
    console.error('Error fetching hostel rooms:', error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Hostel not found' });
    }
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = {
  getApprovedHostels,
  getHostelById,
  getHostelRooms,
};
