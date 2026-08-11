const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema(
  {
    hostel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hostel',
      required: [true, 'Room must belong to a hostel'],
    },
    roomNumber: {
      type: String,
      required: [true, 'Please provide a room number'],
      trim: true,
    },
    floor: {
      type: String,
      required: [true, 'Please provide the floor'],
      trim: true,
    },
    capacity: {
      type: Number,
      required: [true, 'Please provide room capacity'],
      min: [1, 'Capacity must be at least 1'],
    },
    occupiedBeds: {
      type: Number,
      default: 0,
      min: [0, 'Occupied beds cannot be negative'],
    },
    availableBeds: {
      type: Number,
      default: 0,
    },
    monthlyRent: {
      type: Number,
      required: [true, 'Please provide monthly rent per bed'],
      min: [0, 'Rent cannot be negative'],
    },
    gender: {
      type: String,
      enum: ['Boys', 'Girls', 'Unisex'],
      required: [true, 'Please specify gender category for this room'],
    },
    AC: {
      type: Boolean,
      default: false,
    },
    attachedBathroom: {
      type: Boolean,
      default: false,
    },
    furnished: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ['Available', 'Partially Occupied', 'Full', 'Maintenance'],
      default: 'Available',
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate room numbers within the same hostel
roomSchema.index({ hostel: 1, roomNumber: 1 }, { unique: true });

// Pre-save hook to calculate availableBeds and update status
roomSchema.pre('save', function () {
  // Validate occupancy vs capacity
  if (this.occupiedBeds > this.capacity) {
    throw new Error(`Occupied beds (${this.occupiedBeds}) cannot exceed capacity (${this.capacity})`);
  }

  // Calculate available beds
  this.availableBeds = this.capacity - this.occupiedBeds;

  // Update status automatically if it's not set to Maintenance
  if (this.status !== 'Maintenance') {
    if (this.occupiedBeds === 0) {
      this.status = 'Available';
    } else if (this.occupiedBeds === this.capacity) {
      this.status = 'Full';
    } else {
      this.status = 'Partially Occupied';
    }
  }
});

module.exports = mongoose.model('Room', roomSchema);
