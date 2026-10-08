const User = require('../models/User');
const Hostel = require('../models/Hostel');
const Room = require('../models/Room');
const Booking = require('../models/Booking');

// @desc    Get Admin Dashboard Analytics & Overview Stats
// @route   GET /api/admin/dashboard
// @access  Private (Admin Only)
const getAdminDashboardStats = async (req, res) => {
  try {
    const [
      totalStudents,
      totalManagers,
      totalHostels,
      pendingHostels,
      approvedHostels,
      rejectedHostels,
      recentHostels,
      recentUsers,
    ] = await Promise.all([
      User.countDocuments({ role: 'Student' }),
      User.countDocuments({ role: 'Hostel Manager' }),
      Hostel.countDocuments(),
      Hostel.countDocuments({ status: 'Pending' }),
      Hostel.countDocuments({ status: 'Approved' }),
      Hostel.countDocuments({ status: 'Rejected' }),
      Hostel.find()
        .populate('manager', 'name email phone')
        .sort({ createdAt: -1 })
        .limit(5),
      User.find({ role: { $in: ['Student', 'Hostel Manager'] } })
        .select('-password')
        .sort({ createdAt: -1 })
        .limit(5),
    ]);

    res.status(200).json({
      success: true,
      stats: {
        totalStudents,
        totalManagers,
        totalHostels,
        pendingHostels,
        approvedHostels,
        rejectedHostels,
      },
      recentHostels,
      recentUsers,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

// @desc    Get all registered Hostel Managers
// @route   GET /api/admin/managers
// @access  Private (Admin Only)
const getAllManagers = async (req, res) => {
  try {
    const { search, status } = req.query;
    let query = { role: 'Hostel Manager' };

    if (status === 'active') query.isActive = true;
    if (status === 'inactive') query.isActive = false;

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ];
    }

    const managers = await User.find(query).select('-password').sort({ createdAt: -1 }).lean();

    // Populate managed hostels for each manager
    const managerIds = managers.map(m => m._id);
    const hostels = await Hostel.find({ manager: { $in: managerIds } }).select('name city type status manager');

    const managersWithHostels = managers.map(m => ({
      ...m,
      managedHostels: hostels.filter(h => h.manager.toString() === m._id.toString()),
    }));

    res.status(200).json({
      success: true,
      count: managersWithHostels.length,
      managers: managersWithHostels,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

// @desc    Get all registered Students
// @route   GET /api/admin/students
// @access  Private (Admin Only)
const getAllStudents = async (req, res) => {
  try {
    const { search, status } = req.query;
    let query = { role: 'Student' };

    if (status === 'active') query.isActive = true;
    if (status === 'inactive') query.isActive = false;

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ];
    }

    const students = await User.find(query).select('-password').sort({ createdAt: -1 }).lean();

    // Populate active/pending accommodation for each student
    const studentIds = students.map(s => s._id);
    const activeBookings = await Booking.find({
      student: { $in: studentIds },
      status: { $in: ['Approved', 'Pending', 'Leave_Requested'] },
    })
      .populate('hostel', 'name city type')
      .populate('room', 'roomNumber floor monthlyRent');

    const studentsWithAccommodation = students.map(s => {
      const activeBooking = activeBookings.find(b => b.student.toString() === s._id.toString());
      return {
        ...s,
        currentAccommodation: activeBooking || null,
      };
    });

    res.status(200).json({
      success: true,
      count: studentsWithAccommodation.length,
      students: studentsWithAccommodation,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

// @desc    Toggle user active status (Deactivate / Reactivate)
// @route   PATCH /api/admin/users/:id/status
// @access  Private (Admin Only)
const toggleUserStatus = async (req, res) => {
  try {
    const { isActive } = req.body;
    if (typeof isActive !== 'boolean') {
      return res.status(400).json({ success: false, message: 'Please provide a valid isActive status (true/false)' });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.role === 'Admin') {
      return res.status(403).json({ success: false, message: 'Cannot modify Admin account status through this endpoint' });
    }

    // Safety Rule: If deactivating a student, verify they do not have an active approved accommodation
    if (!isActive && user.role === 'Student') {
      const activeBooking = await Booking.findOne({ student: user._id, status: 'Approved' });
      if (activeBooking) {
        return res.status(400).json({
          success: false,
          message: 'Cannot deactivate a student with an active approved accommodation. The accommodation must be ended first.',
        });
      }
    }

    user.isActive = isActive;
    await user.save();

    res.status(200).json({
      success: true,
      message: `User ${user.name} has been ${isActive ? 'reactivated' : 'deactivated'} successfully.`,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

// @desc    Get all hostels (with status filter and manager population)
// @route   GET /api/admin/hostels
// @access  Private (Admin Only)
const getAllHostels = async (req, res) => {
  try {
    const { status, search } = req.query;
    let query = {};

    if (status) {
      query.status = status; // Filter by 'Pending', 'Approved', or 'Rejected'
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { city: { $regex: search, $options: 'i' } },
        { state: { $regex: search, $options: 'i' } },
      ];
    }

    const hostels = await Hostel.find(query)
      .populate('manager', 'name email phone')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: hostels.length,
      hostels,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

// @desc    Approve a pending hostel
// @route   PUT /api/admin/hostels/:id/approve
// @access  Private (Admin Only)
const approveHostel = async (req, res) => {
  try {
    const hostel = await Hostel.findById(req.params.id);

    if (!hostel) {
      return res.status(404).json({ success: false, message: 'Hostel not found' });
    }

    hostel.status = 'Approved';
    hostel.rejectionReason = ''; // Clear any previous rejection notes
    await hostel.save();

    const updatedHostel = await Hostel.findById(req.params.id).populate('manager', 'name email phone');

    res.status(200).json({
      success: true,
      message: `Hostel '${hostel.name}' has been approved successfully.`,
      hostel: updatedHostel,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

// @desc    Reject a hostel application
// @route   PUT /api/admin/hostels/:id/reject
// @access  Private (Admin Only)
const rejectHostel = async (req, res) => {
  try {
    const { reason } = req.body;
    const hostel = await Hostel.findById(req.params.id);

    if (!hostel) {
      return res.status(404).json({ success: false, message: 'Hostel not found' });
    }

    hostel.status = 'Rejected';
    hostel.rejectionReason = reason || 'Documentation or verification criteria not fulfilled';
    await hostel.save();

    const updatedHostel = await Hostel.findById(req.params.id).populate('manager', 'name email phone');

    res.status(200).json({
      success: true,
      message: `Hostel '${hostel.name}' has been rejected.`,
      hostel: updatedHostel,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

// @desc    Delete a User (Student or Manager) and cascade delete hostels/rooms
// @route   DELETE /api/admin/users/:id
// @access  Private (Admin Only)
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.role === 'Hostel Manager') {
      const hostels = await Hostel.find({ manager: user._id });
      const hostelIds = hostels.map(h => h._id);

      if (hostelIds.length > 0) {
        // Delete all rooms associated with these hostels
        await Room.deleteMany({ hostel: { $in: hostelIds } });
        // Delete all hostels managed by this user
        await Hostel.deleteMany({ manager: user._id });
      }
    }

    await User.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'User and associated data deleted successfully',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

// @desc    Delete a Hostel and cascade delete rooms
// @route   DELETE /api/admin/hostels/:id
// @access  Private (Admin Only)
const deleteHostel = async (req, res) => {
  try {
    const hostel = await Hostel.findById(req.params.id);

    if (!hostel) {
      return res.status(404).json({ success: false, message: 'Hostel not found' });
    }

    // Delete all rooms associated with this hostel
    await Room.deleteMany({ hostel: hostel._id });
    
    await Hostel.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Hostel and associated rooms deleted successfully',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

module.exports = {
  getAdminDashboardStats,
  getAllManagers,
  getAllStudents,
  getAllHostels,
  approveHostel,
  rejectHostel,
  deleteUser,
  deleteHostel,
  toggleUserStatus,
};
