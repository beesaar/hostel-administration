const Booking = require('../models/Booking');
const Room = require('../models/Room');
const Hostel = require('../models/Hostel');

const hydrateBookingHostel = async (booking) => {
  if (!booking) return booking;

  if (booking.hostel) return booking;

  const roomId = booking.room?._id || booking.room;
  if (!roomId) return booking;

  const room = booking.room?._id
    ? booking.room
    : await Room.findById(roomId).select('hostel');

  if (!room?.hostel) return booking;

  booking.hostel = await Hostel.findById(room.hostel)
    .populate({
      path: 'manager',
      select: 'name phone email'
    })
    .select('name address city state pincode type description facilities amenities contactPhone contactEmail manager');

  if (booking.hostel) {
    await Booking.updateOne(
      { _id: booking._id },
      { $set: { hostel: booking.hostel._id } }
    );
    booking.hostel = booking.hostel.toObject ? booking.hostel.toObject() : booking.hostel;
  }

  return booking;
};

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

    // 4. Check if student already has an active accommodation (Approved or Leave_Requested)
    const activeBooking = await Booking.findOne({
      student: studentId,
      status: { $in: ['Approved', 'Leave_Requested'] }
    });

    if (activeBooking) {
      if (activeBooking.status === 'Leave_Requested') {
        return res.status(400).json({ message: 'You have a pending leave request. Please wait for your manager to process it before booking another room.' });
      }
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
    res.status(error.name === 'ValidationError' || error.message ? 400 : 500).json({ message: error.message || 'Server Error' });
  }
};

// @desc    Get student's bookings
// @route   GET /api/bookings/student
// @access  Private (Student)
const getStudentBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ student: req.user._id })
      .populate({
        path: 'hostel',
        select: 'name city state type address contactPhone contactEmail manager',
        populate: {
          path: 'manager',
          select: 'name phone email'
        }
      })
      .populate('room', 'roomNumber floor monthlyRent hostel')
      .sort({ createdAt: -1 });

    const hydratedBookings = await Promise.all(
      bookings.map((booking) => hydrateBookingHostel(booking))
    );

    res.status(200).json(hydratedBookings);
  } catch (error) {
    console.error('Error fetching student bookings:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get student accommodation status
// @route   GET /api/bookings/student/status
// @access  Private (Student)
const getStudentAccommodationStatus = async (req, res) => {
  try {
    // 1. Check for an Approved or Leave_Requested booking (Active Resident)
    let booking = await Booking.findOne({ student: req.user._id, status: { $in: ['Approved', 'Leave_Requested'] } })
      .populate({
        path: 'hostel',
        select: 'name address city state type facilities amenities contactPhone contactEmail manager',
        populate: {
          path: 'manager',
          select: 'name phone email'
        }
      })
      .populate('room', 'roomNumber capacity occupiedBeds availableBeds status floor monthlyRent AC attachedBathroom gender hostel');

    if (booking) {
      const hydratedBooking = await hydrateBookingHostel(booking);
      return res.status(200).json({
        state: 'ACTIVE_RESIDENT',
        booking: hydratedBooking
      });
    }

    // 3. If no Approved or Leave_Requested booking, check for a Pending booking
    booking = await Booking.findOne({ student: req.user._id, status: 'Pending' })
      .populate({
        path: 'hostel',
        select: 'name address city state pincode type description facilities amenities contactPhone contactEmail manager',
        populate: {
          path: 'manager',
          select: 'name phone email'
        }
      })
      .populate('room', 'roomNumber capacity occupiedBeds availableBeds status floor monthlyRent AC attachedBathroom gender hostel');

    if (booking) {
      const hydratedBooking = await hydrateBookingHostel(booking);
      return res.status(200).json({
        state: 'PENDING',
        booking: hydratedBooking
      });
    }

    // 4. Otherwise, they have no active room
    return res.status(200).json({
      state: 'NO_ROOM',
      booking: null
    });
  } catch (error) {
    console.error('Error fetching student accommodation status:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Student submits request to leave hostel
// @route   POST /api/bookings/leave
// @access  Private (Student)
const requestLeave = async (req, res) => {
  try {
    const { leaveReason } = req.body;
    
    if (!leaveReason || !leaveReason.trim()) {
      return res.status(400).json({ message: 'Please provide a valid reason for leaving the hostel.' });
    }

    const booking = await Booking.findOne({ student: req.user._id, status: 'Approved' });
    if (!booking) {
      return res.status(400).json({ message: 'You do not have an active approved accommodation to leave.' });
    }

    booking.status = 'Leave_Requested';
    booking.leaveReason = leaveReason.trim();
    booking.leaveRequestedAt = Date.now();
    await booking.save();

    res.status(200).json({
      message: 'Leave request submitted successfully. Waiting for manager approval.',
      booking
    });
  } catch (error) {
    console.error('Error submitting leave request:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
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
      .populate('hostel', 'name city type address')
      .populate('room', 'roomNumber capacity occupiedBeds availableBeds status gender floor monthlyRent')
      .sort({ createdAt: -1 });

    res.status(200).json(bookings);
  } catch (error) {
    console.error('Error fetching manager bookings:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get current residents in manager's hostels (Approved + Leave_Requested)
// @route   GET /api/bookings/manager/residents
// @access  Private (Hostel Manager)
const getManagerResidents = async (req, res) => {
  try {
    // 1. Find all hostels managed by this manager
    const managedHostels = await Hostel.find({ manager: req.user._id }).select('_id');
    const hostelIds = managedHostels.map(h => h._id);

    // 2. Find all active residents (Approved or Leave_Requested = still physically in the hostel)
    const residents = await Booking.find({
      hostel: { $in: hostelIds },
      status: { $in: ['Approved', 'Leave_Requested'] },
    })
      .populate('student', 'name email phone createdAt')
      .populate('hostel', 'name city type address')
      .populate('room', 'roomNumber floor monthlyRent gender capacity occupiedBeds availableBeds status')
      .sort({ approvedAt: -1 });

    res.status(200).json(residents);
  } catch (error) {
    console.error('Error fetching manager residents:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Update booking status (Approve / Reject booking or Process Leave)
// @route   PATCH /api/bookings/:id/status
// @access  Private (Hostel Manager)
const updateBookingStatus = async (req, res) => {
  try {
    const { status, managerResponse } = req.body;
    const validStatuses = ['Approved', 'Rejected', 'Completed'];
    
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

    // Handling Leave_Requested approvals (Status transition to Completed)
    if (booking.status === 'Leave_Requested') {
      if (status === 'Completed') {
        const room = await Room.findById(booking.room);
        if (room) {
          room.occupiedBeds = Math.max(0, room.occupiedBeds - 1);
          await room.save();
        }

        booking.status = 'Completed';
        booking.completedAt = Date.now();
        if (managerResponse) booking.managerResponse = managerResponse;
        await booking.save();

        return res.status(200).json(booking);
      } else if (status === 'Approved' || status === 'Rejected') {
        // Manager rejects leave request: revert status to Approved (active resident)
        booking.status = 'Approved';
        if (managerResponse) booking.managerResponse = managerResponse;
        await booking.save();

        return res.status(200).json(booking);
      }
    }

    // Guard: prevent re-processing a booking that is already Completed or Cancelled
    if (booking.status === 'Completed' || booking.status === 'Cancelled') {
      return res.status(400).json({ message: `Cannot update booking that is already ${booking.status}` });
    }

    // If already approved/rejected/completed, don't allow changing
    if (booking.status !== 'Pending') {
      return res.status(400).json({ message: `Cannot update booking that is already ${booking.status}` });
    }

    if (status === 'Approved') {
      // Verify student does not already have another Approved or Leave_Requested booking
      const existingActive = await Booking.findOne({
        student: booking.student,
        status: { $in: ['Approved', 'Leave_Requested'] }
      });
      if (existingActive) {
        return res.status(400).json({ message: 'This student already has an active accommodation (or a pending leave request). Cannot approve another booking.' });
      }

      // Check room availability again before approving
      const room = await Room.findById(booking.room);
      if (room.status === 'Full' || room.availableBeds <= 0) {
         booking.status = 'Rejected'; // Auto reject if full
         if (managerResponse) booking.managerResponse = managerResponse;
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
    if (managerResponse !== undefined) {
      booking.managerResponse = managerResponse;
    }
    
    await booking.save();

    res.status(200).json(booking);
  } catch (error) {
    console.error('Error updating booking status:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Process student leave request (Approve or Reject leave)
// @route   PATCH /api/bookings/:id/leave-approval
// @access  Private (Hostel Manager)
const handleLeaveApproval = async (req, res) => {
  try {
    const { action, managerResponse } = req.body;
    if (!['approve', 'reject'].includes(action)) {
      return res.status(400).json({ message: 'Invalid action. Must be approve or reject.' });
    }

    const booking = await Booking.findById(req.params.id).populate('hostel');
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.hostel.manager.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized to update this booking' });
    }

    if (booking.status !== 'Leave_Requested') {
      return res.status(400).json({ message: 'Booking does not have a pending leave request' });
    }

    if (action === 'approve') {
      const room = await Room.findById(booking.room);
      if (room) {
        room.occupiedBeds = Math.max(0, room.occupiedBeds - 1);
        await room.save();
      }

      booking.status = 'Completed';
      booking.completedAt = Date.now();
      if (managerResponse) booking.managerResponse = managerResponse;
      await booking.save();

      return res.status(200).json({ message: 'Leave request approved. Accommodation ended.', booking });
    } else {
      booking.status = 'Approved';
      if (managerResponse) booking.managerResponse = managerResponse;
      await booking.save();

      return res.status(200).json({ message: 'Leave request rejected. Student remains active resident.', booking });
    }
  } catch (error) {
    console.error('Error handling leave approval:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = {
  createBooking,
  getStudentBookings,
  getStudentAccommodationStatus,
  requestLeave,
  getManagerBookings,
  getManagerResidents,
  updateBookingStatus,
  handleLeaveApproval,
};
