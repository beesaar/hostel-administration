const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Booking must belong to a student'],
    },
    hostel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hostel',
      required: [true, 'Booking must belong to a hostel'],
    },
    room: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Room',
      required: [true, 'Booking must belong to a room'],
    },
    status: {
      type: String,
      enum: ['Pending', 'Approved', 'Rejected', 'Leave_Requested', 'Completed', 'Cancelled'],
      default: 'Pending',
    },
    requestDate: {
      type: Date,
      default: Date.now,
    },
    approvedAt: {
      type: Date,
    },
    rejectedAt: {
      type: Date,
    },
    leaveRequestedAt: {
      type: Date,
    },
    leaveReason: {
      type: String,
      default: '',
    },
    completedAt: {
      type: Date,
    },
    managerResponse: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Prevent multiple queries from scanning entire collection for duplicate pending/approved requests
bookingSchema.index({ student: 1, room: 1, status: 1 });
bookingSchema.index({ student: 1, status: 1 });

// Pre-save hook to enforce business rules
bookingSchema.pre('save', async function () {
  // Only run these checks if the document is new
  if (this.isNew) {
    // Fetch Room and Hostel for validation
    const room = await mongoose.models.Room.findById(this.room);
    const hostel = await mongoose.models.Hostel.findById(this.hostel);

    if (!room) {
      throw new Error('Room not found.');
    }
    if (!hostel) {
      throw new Error('Hostel not found.');
    }

    // Rule 5: The selected room must belong to the selected hostel
    if (room.hostel.toString() !== this.hostel.toString()) {
      throw new Error('The selected room does not belong to the selected hostel.');
    }

    // Rule 6: The hostel must be approved before a booking can be created
    if (hostel.status !== 'Approved') {
      throw new Error('Cannot book a room in a hostel that is not approved.');
    }

    // Rule 7: The room must have available capacity
    if (room.availableBeds <= 0) {
      throw new Error('This room has no available capacity.');
    }

    // Rule 4: Prevent duplicate Pending requests for the SAME room
    const existingPending = await mongoose.models.Booking.findOne({
      student: this.student,
      room: this.room,
      status: 'Pending',
    });
    if (existingPending) {
      throw new Error('You already have a pending request for this room.');
    }

    // Rule 3: A student must not have more than one active accommodation (Approved or Leave_Requested)
    const existingActive = await mongoose.models.Booking.findOne({
      student: this.student,
      status: { $in: ['Approved', 'Leave_Requested'] },
    });
    if (existingActive) {
      if (existingActive.status === 'Leave_Requested') {
        throw new Error('You have a pending leave request. Please wait for it to be processed before booking another room.');
      }
      throw new Error('You already have an approved accommodation.');
    }
  }

  // Handle status transition timestamps
  if (this.isModified('status')) {
    if (this.status === 'Approved') {
      this.approvedAt = Date.now();
    } else if (this.status === 'Rejected') {
      this.rejectedAt = Date.now();
    } else if (this.status === 'Leave_Requested') {
      this.leaveRequestedAt = Date.now();
    } else if (this.status === 'Completed') {
      this.completedAt = Date.now();
    }
  }

});

module.exports = mongoose.model('Booking', bookingSchema);
