const Complaint = require('../models/Complaint');
const Booking = require('../models/Booking');
const Hostel = require('../models/Hostel');
const Notification = require('../models/Notification');

// @desc    Create a new complaint
// @route   POST /api/complaints
// @access  Private (Student)
const createComplaint = async (req, res) => {
  try {
    const { hostelId, roomId, title, description } = req.body;
    const studentId = req.user._id;

    if (!hostelId || !title || !description) {
      return res.status(400).json({ message: 'Please provide hostelId, title, and description.' });
    }

    // Validate that the student has an active/current accommodation at this hostel/room
    // Only residents with Approved or Leave_Requested status can file complaints
    const bookingQuery = {
      student: studentId,
      hostel: hostelId,
      status: { $in: ['Approved', 'Leave_Requested'] },
    };
    if (roomId) {
      bookingQuery.room = roomId;
    }

    const activeBooking = await Booking.findOne(bookingQuery);

    if (!activeBooking) {
      return res.status(403).json({ message: 'You can only file complaints for your current active accommodation.' });
    }

    const complaint = await Complaint.create({
      student: studentId,
      hostel: hostelId,
      room: roomId || activeBooking.room,
      title,
      description,
      status: 'Pending',
    });

    // Create Notification for the Hostel Manager
    const hostel = await Hostel.findById(hostelId);
    if (hostel && hostel.manager) {
      try {
        await Notification.create({
          recipient: hostel.manager,
          type: 'COMPLAINT_CREATED',
          title: 'New Complaint Filed',
          message: `A new complaint "${title}" was filed for ${hostel.name}.`,
          complaint: complaint._id,
          isRead: false,
        });
      } catch (notifErr) {
        console.error('Failed to create manager notification on complaint create:', notifErr);
      }
    }

    res.status(201).json(complaint);
  } catch (error) {
    console.error('Error creating complaint:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get student's complaints
// @route   GET /api/complaints/student
// @access  Private (Student)
const getStudentComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find({ student: req.user._id })
      .populate('hostel', 'name')
      .populate('room', 'roomNumber')
      .sort({ createdAt: -1 });

    res.status(200).json(complaints);
  } catch (error) {
    console.error('Error fetching student complaints:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get manager's hostel complaints
// @route   GET /api/complaints/manager
// @access  Private (Hostel Manager)
const getManagerComplaints = async (req, res) => {
  try {
    // Find all hostels managed by this manager
    const managedHostels = await Hostel.find({ manager: req.user._id }).select('_id');
    const hostelIds = managedHostels.map(h => h._id);

    // Find complaints for these hostels
    const complaints = await Complaint.find({ hostel: { $in: hostelIds } })
      .populate('student', 'name email phone')
      .populate('hostel', 'name')
      .populate('room', 'roomNumber')
      .sort({ createdAt: -1 });

    res.status(200).json(complaints);
  } catch (error) {
    console.error('Error fetching manager complaints:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Update complaint status
// @route   PATCH /api/complaints/:id/status
// @access  Private (Hostel Manager)
const updateComplaintStatus = async (req, res) => {
  try {
    const { status, managerResponse } = req.body;
    const validStatuses = ['Pending', 'In Progress', 'Resolved'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const complaint = await Complaint.findById(req.params.id).populate('hostel');

    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    // Verify ownership: Manager can only update complaints for their hostels
    if (complaint.hostel.manager.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized to update this complaint' });
    }

    complaint.status = status;
    if (managerResponse !== undefined) {
      complaint.managerResponse = managerResponse;
    }

    await complaint.save();

    // Create Notification for the Student
    if (complaint.student) {
      try {
        await Notification.create({
          recipient: complaint.student,
          type: 'COMPLAINT_UPDATED',
          title: 'Complaint Status Updated',
          message: `Your complaint "${complaint.title}" has been updated to "${status}".`,
          complaint: complaint._id,
          isRead: false,
        });
      } catch (notifErr) {
        console.error('Failed to create student notification on complaint update:', notifErr);
      }
    }

    res.status(200).json(complaint);
  } catch (error) {
    console.error('Error updating complaint status:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = {
  createComplaint,
  getStudentComplaints,
  getManagerComplaints,
  updateComplaintStatus,
};
