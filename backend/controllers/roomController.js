const Room = require('../models/Room');
const Hostel = require('../models/Hostel');

// Helper function to verify hostel ownership
const checkHostelOwnership = async (hostelId, managerId) => {
  const hostel = await Hostel.findOne({ _id: hostelId, manager: managerId });
  return hostel;
};

// @desc    Get all rooms for a specific hostel
// @route   GET /api/manager/hostels/:hostelId/rooms
// @access  Private (Hostel Manager Only)
const getRoomsByHostel = async (req, res) => {
  try {
    const { hostelId } = req.params;

    // Verify the hostel belongs to this manager
    const hostel = await checkHostelOwnership(hostelId, req.user._id);
    if (!hostel) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to view rooms for this hostel',
      });
    }

    const rooms = await Room.find({ hostel: hostelId }).sort({ floor: 1, roomNumber: 1 });

    res.status(200).json({
      success: true,
      count: rooms.length,
      rooms,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

// @desc    Get a single room by ID
// @route   GET /api/manager/rooms/:roomId
// @access  Private (Hostel Manager Only)
const getRoomById = async (req, res) => {
  try {
    const { roomId } = req.params;

    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ success: false, message: 'Room not found' });
    }

    // Verify the hostel belongs to this manager
    const hostel = await checkHostelOwnership(room.hostel, req.user._id);
    if (!hostel) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to view this room',
      });
    }

    res.status(200).json({ success: true, room });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

// @desc    Create a new room in a hostel
// @route   POST /api/manager/hostels/:hostelId/rooms
// @access  Private (Hostel Manager Only)
const createRoom = async (req, res) => {
  try {
    const { hostelId } = req.params;

    // Verify the hostel belongs to this manager
    const hostel = await checkHostelOwnership(hostelId, req.user._id);
    if (!hostel) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to add rooms to this hostel',
      });
    }

    const roomData = {
      ...req.body,
      hostel: hostelId, // Enforce the hostel ID from params
    };

    const room = await Room.create(roomData);

    res.status(201).json({
      success: true,
      message: `Room ${room.roomNumber} created successfully`,
      room,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Room number already exists in this hostel',
      });
    }
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({ success: false, message: messages.join(', ') });
    }
    if (error.message && error.message.includes('cannot exceed capacity')) {
        return res.status(400).json({ success: false, message: error.message });
    }
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

// @desc    Create multiple rooms at once for a hostel
// @route   POST /api/manager/hostels/:hostelId/rooms/bulk
// @access  Private (Hostel Manager Only)
const createMultipleRooms = async (req, res) => {
  try {
    const { hostelId } = req.params;
    const { roomNumbers, ...sharedData } = req.body;

    // Verify ownership
    const hostel = await checkHostelOwnership(hostelId, req.user._id);
    if (!hostel) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to add rooms to this hostel',
      });
    }

    if (!Array.isArray(roomNumbers) || roomNumbers.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an array of room numbers',
      });
    }

    const createdRooms = [];
    const failedRooms = [];
    let addedCapacity = 0;

    for (const roomNumber of roomNumbers) {
      try {
        const room = await Room.create({
          ...sharedData,
          roomNumber: roomNumber.trim(),
          hostel: hostelId,
        });
        createdRooms.push(room.roomNumber);
        addedCapacity += room.capacity;
      } catch (err) {
        let errorMsg = err.message;
        if (err.code === 11000) errorMsg = 'Room number already exists';
        failedRooms.push({ roomNumber, error: errorMsg });
      }
    }

    if (createdRooms.length > 0) {
      // Intentionally not auto-incrementing totalRooms/totalBeds, since they represent the max capacity in Hostel model.
    }

    res.status(201).json({
      success: true,
      message: `Successfully created ${createdRooms.length} rooms. Failed: ${failedRooms.length}`,
      createdRooms,
      failedRooms,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

// @desc    Update a room
// @route   PUT /api/manager/rooms/:roomId
// @access  Private (Hostel Manager Only)
const updateRoom = async (req, res) => {
  try {
    const { roomId } = req.params;

    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ success: false, message: 'Room not found' });
    }

    // Verify the hostel belongs to this manager
    const hostel = await checkHostelOwnership(room.hostel, req.user._id);
    if (!hostel) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to update this room',
      });
    }

    // Prevent changing the hostel ID
    if (req.body.hostel && req.body.hostel !== room.hostel.toString()) {
        return res.status(400).json({ success: false, message: 'Cannot move room to another hostel' });
    }

    // Track old capacity to adjust hostel totals later
    const oldCapacity = room.capacity;

    // Apply updates (pre-save hook will handle availability and status logic)
    Object.keys(req.body).forEach((key) => {
      // Don't allow direct update of availableBeds as it's computed
      if (key !== 'availableBeds' && key !== 'hostel') {
          room[key] = req.body[key];
      }
    });

    await room.save();

    // If capacity changed, update the hostel's totalBeds
    if (room.capacity !== oldCapacity) {
        hostel.totalBeds = hostel.totalBeds - oldCapacity + room.capacity;
        await hostel.save();
    }

    res.status(200).json({
      success: true,
      message: `Room ${room.roomNumber} updated successfully`,
      room,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Room number already exists in this hostel',
      });
    }
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({ success: false, message: messages.join(', ') });
    }
    if (error.message.includes('cannot exceed capacity')) {
        return res.status(400).json({ success: false, message: error.message });
    }
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

// @desc    Delete a room
// @route   DELETE /api/manager/rooms/:roomId
// @access  Private (Hostel Manager Only)
const deleteRoom = async (req, res) => {
  try {
    const { roomId } = req.params;

    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ success: false, message: 'Room not found' });
    }

    // Verify the hostel belongs to this manager
    const hostel = await checkHostelOwnership(room.hostel, req.user._id);
    if (!hostel) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to delete this room',
      });
    }
    
    // Intentionally not auto-decrementing totalRooms/totalBeds, since they represent the max capacity in Hostel model.

    const roomNumber = room.roomNumber;
    await Room.deleteOne({ _id: room._id });

    res.status(200).json({
      success: true,
      message: `Room ${roomNumber} deleted successfully`,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

module.exports = {
  getRoomsByHostel,
  getRoomById,
  createRoom,
  createMultipleRooms,
  updateRoom,
  deleteRoom,
};
