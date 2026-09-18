const Booking = require('../models/Booking');
const Room = require('../models/Room');
const Hostel = require('../models/Hostel');

// @desc    Create a new booking
// @route   POST /api/bookings
// @access  Private (Student)
const createBooking = async (req, res) => {
  try {
    const { hostelId, roomId } = req.body;
    const studentId = req.user._id;

    // 1. Validate hostel is approved
    const hostel = await Hostel.findOne({ _id: hostelId, status: 'Approved' });
    if (!hostel) {
      return res.status(404).json({ message: 'Hostel not found or not approved' });
    }

    // 2. Validate room exists and belongs to hostel
    const room = await Room.findOne({ _id: roomId, hostel: hostelId });
    if (!room) {
      return res.status(404).json({ message: 'Room not found in this hostel' });
    }

    // 3. Verify room availability
    if (room.status === 'Full' || room.status === 'Maintenance' || room.availableBeds <= 0) {
      return res.status(400).json({ message: 'Room is fully occupied or unavailable' });
    }

    // 4. Check if student already has an approved booking anywhere
    const approvedBooking = await Booking.findOne({
      student: studentId,
      status: 'Approved'
    });

    if (approvedBooking) {
      return res.status(400).json({ message: 'You already have an allotted room and cannot book more rooms.' });
    }

    // 4.1 Check for duplicate pending booking by this student for this specific room
    const existingPending = await Booking.findOne({
      student: studentId,
      room: roomId,
      status: 'Pending'
    });

    if (existingPending) {
      return res.status(400).json({ message: 'You already have a pending booking for this room' });
    }

    // 5. Create booking
    const booking = await Booking.create({
      student: studentId,
      hostel: hostelId,
      room: roomId,
      status: 'Pending'
    });

    res.status(201).json(booking);
  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get student's bookings
// @route   GET /api/bookings/student
// @access  Private (Student)
const getStudentBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ student: req.user._id })
      .populate('hostel', 'name city type address')
      .populate('room', 'roomNumber floor monthlyRent')
      .sort({ createdAt: -1 });
    
    res.status(200).json(bookings);
  } catch (error) {
    console.error('Error fetching student bookings:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get manager's hostel bookings
// @route   GET /api/bookings/manager
// @access  Private (Hostel Manager)
const getManagerBookings = async (req, res) => {
  try {
    // 1. Find all hostels managed by this manager
    const managedHostels = await Hostel.find({ manager: req.user._id }).select('_id');
    const hostelIds = managedHostels.map(h => h._id);

    // 2. Find bookings for these hostels
    const bookings = await Booking.find({ hostel: { $in: hostelIds } })
      .populate('student', 'name email phone')
      .populate('hostel', 'name')
      .populate('room', 'roomNumber capacity occupiedBeds availableBeds status')
      .sort({ createdAt: -1 });

    res.status(200).json(bookings);
  } catch (error) {
    console.error('Error fetching manager bookings:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Update booking status
// @route   PATCH /api/bookings/:id/status
// @access  Private (Hostel Manager)
const updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['Approved', 'Rejected'];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status update' });
    }

    const booking = await Booking.findById(req.params.id).populate('hostel');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Verify ownership
    if (booking.hostel.manager.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized to update this booking' });
    }

    // If already approved/rejected, don't allow changing
    if (booking.status !== 'Pending') {
      return res.status(400).json({ message: `Cannot update booking that is already ${booking.status}` });
    }

    if (status === 'Approved') {
      // Check room availability again before approving
      const room = await Room.findById(booking.room);
      if (room.status === 'Full' || room.availableBeds <= 0) {
         booking.status = 'Rejected'; // Auto reject if full
         await booking.save();
         return res.status(400).json({ message: 'Room is full. Booking automatically rejected.' });
      }

      // Update room occupancy
      room.occupiedBeds += 1;
      await room.save(); // The pre-save hook will update availableBeds and status automatically

      // Cancel all other pending bookings for this student
      await Booking.updateMany(
        { student: booking.student, _id: { $ne: booking._id }, status: 'Pending' },
        { $set: { status: 'Cancelled' } }
      );
    }

    booking.status = status;
    await booking.save();

    res.status(200).json(booking);
  } catch (error) {
    console.error('Error updating booking status:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = {
  createBooking,
  getStudentBookings,
  getManagerBookings,
  updateBookingStatus,
};
