const Hostel = require('../models/Hostel');

// @desc    Get Manager Dashboard Stats (hostel counts by status)
// @route   GET /api/manager/dashboard
// @access  Private (Hostel Manager Only)
const getManagerDashboard = async (req, res) => {
  try {
    const managerId = req.user._id;

    const [totalHostels, pendingHostels, approvedHostels, rejectedHostels, recentHostels] =
      await Promise.all([
        Hostel.countDocuments({ manager: managerId }),
        Hostel.countDocuments({ manager: managerId, status: 'Pending' }),
        Hostel.countDocuments({ manager: managerId, status: 'Approved' }),
        Hostel.countDocuments({ manager: managerId, status: 'Rejected' }),
        Hostel.find({ manager: managerId }).sort({ createdAt: -1 }).limit(5),
      ]);

    res.status(200).json({
      success: true,
      stats: {
        totalHostels,
        pendingHostels,
        approvedHostels,
        rejectedHostels,
      },
      recentHostels,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

// @desc    Get all hostels created by this manager
// @route   GET /api/manager/hostels
// @access  Private (Hostel Manager Only)
const getMyHostels = async (req, res) => {
  try {
    const { status, search } = req.query;
    const query = { manager: req.user._id };

    if (status) {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { city: { $regex: search, $options: 'i' } },
        { state: { $regex: search, $options: 'i' } },
      ];
      query.manager = req.user._id; // ensure ownership even with $or
    }

    const hostels = await Hostel.find(query).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: hostels.length,
      hostels,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

// @desc    Get single hostel detail (only if owned by this manager)
// @route   GET /api/manager/hostels/:id
// @access  Private (Hostel Manager Only)
const getMyHostelById = async (req, res) => {
  try {
    const hostel = await Hostel.findOne({
      _id: req.params.id,
      manager: req.user._id,
    });

    if (!hostel) {
      return res.status(404).json({
        success: false,
        message: 'Hostel not found or you do not have permission to view it',
      });
    }

    res.status(200).json({ success: true, hostel });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

// @desc    Create a new hostel (status defaults to Pending)
// @route   POST /api/manager/hostels
// @access  Private (Hostel Manager Only)
const createHostel = async (req, res) => {
  try {
    const {
      name,
      description,
      type,
      address,
      city,
      state,
      pincode,
      contactPhone,
      contactEmail,
      totalRooms,
      totalBeds,
      facilities,
      hostelRules,
      startingRent,
      securityDeposit,
      amenities,
      images,
      latitude,
      longitude,
    } = req.body;

    // Build hostel data object
    const hostelData = {
      name,
      description,
      type,
      address,
      city,
      state,
      pincode,
      contactPhone,
      contactEmail,
      totalRooms: totalRooms || 0,
      totalBeds: totalBeds || 0,
      facilities: facilities || [],
      hostelRules: hostelRules || [],
      startingRent: startingRent || 0,
      securityDeposit: securityDeposit || 0,
      amenities: amenities || [],
      images: images || [],
      manager: req.user._id, // auto-assign to the logged-in manager
      status: 'Pending', // always starts as Pending for Admin approval
    };

    // Set coordinates if provided
    if (latitude && longitude) {
      hostelData.location = {
        type: 'Point',
        coordinates: [parseFloat(longitude), parseFloat(latitude)],
      };
    }

    const hostel = await Hostel.create(hostelData);

    res.status(201).json({
      success: true,
      message: `Hostel '${hostel.name}' created successfully and sent for Admin approval.`,
      hostel,
    });
  } catch (error) {
    // Handle Mongoose validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({ success: false, message: messages.join(', ') });
    }
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

// @desc    Update an existing hostel (only if owned by this manager)
// @route   PUT /api/manager/hostels/:id
// @access  Private (Hostel Manager Only)
const updateHostel = async (req, res) => {
  try {
    let hostel = await Hostel.findOne({
      _id: req.params.id,
      manager: req.user._id,
    });

    if (!hostel) {
      return res.status(404).json({
        success: false,
        message: 'Hostel not found or you do not have permission to edit it',
      });
    }

    // Extract updatable fields
    const {
      name,
      description,
      type,
      address,
      city,
      state,
      pincode,
      contactPhone,
      contactEmail,
      totalRooms,
      totalBeds,
      facilities,
      hostelRules,
      startingRent,
      securityDeposit,
      amenities,
      images,
      latitude,
      longitude,
    } = req.body;

    // Apply updates
    if (name !== undefined) hostel.name = name;
    if (description !== undefined) hostel.description = description;
    if (type !== undefined) hostel.type = type;
    if (address !== undefined) hostel.address = address;
    if (city !== undefined) hostel.city = city;
    if (state !== undefined) hostel.state = state;
    if (pincode !== undefined) hostel.pincode = pincode;
    if (contactPhone !== undefined) hostel.contactPhone = contactPhone;
    if (contactEmail !== undefined) hostel.contactEmail = contactEmail;
    if (totalRooms !== undefined) hostel.totalRooms = totalRooms;
    if (totalBeds !== undefined) hostel.totalBeds = totalBeds;
    if (facilities !== undefined) hostel.facilities = facilities;
    if (hostelRules !== undefined) hostel.hostelRules = hostelRules;
    if (startingRent !== undefined) hostel.startingRent = startingRent;
    if (securityDeposit !== undefined) hostel.securityDeposit = securityDeposit;
    if (amenities !== undefined) hostel.amenities = amenities;
    if (images !== undefined) hostel.images = images;

    // Update coordinates if provided
    if (latitude && longitude) {
      hostel.location = {
        type: 'Point',
        coordinates: [parseFloat(longitude), parseFloat(latitude)],
      };
    }

    // Reset to Pending if hostel was previously Rejected so Admin re-reviews
    if (hostel.status === 'Rejected') {
      hostel.status = 'Pending';
      hostel.rejectionReason = '';
    }

    await hostel.save();

    res.status(200).json({
      success: true,
      message: `Hostel '${hostel.name}' updated successfully.`,
      hostel,
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({ success: false, message: messages.join(', ') });
    }
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

// @desc    Delete a hostel (only if owned by this manager)
// @route   DELETE /api/manager/hostels/:id
// @access  Private (Hostel Manager Only)
const deleteHostel = async (req, res) => {
  try {
    const hostel = await Hostel.findOne({
      _id: req.params.id,
      manager: req.user._id,
    });

    if (!hostel) {
      return res.status(404).json({
        success: false,
        message: 'Hostel not found or you do not have permission to delete it',
      });
    }

    const hostelName = hostel.name;
    await Hostel.deleteOne({ _id: hostel._id });

    res.status(200).json({
      success: true,
      message: `Hostel '${hostelName}' has been permanently deleted.`,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

module.exports = {
  getManagerDashboard,
  getMyHostels,
  getMyHostelById,
  createHostel,
  updateHostel,
  deleteHostel,
};
