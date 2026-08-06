const mongoose = require('mongoose');

const hostelSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide hostel name'],
      trim: true,
    },
    type: {
      type: String,
      enum: ['Boys', 'Girls', 'Co-ed'],
      required: [true, 'Please specify hostel type (Boys, Girls, or Co-ed)'],
    },
    description: {
      type: String,
      default: '',
    },
    address: {
      type: String,
      required: [true, 'Please provide physical address'],
    },
    city: {
      type: String,
      required: [true, 'Please provide city'],
    },
    state: {
      type: String,
      required: [true, 'Please provide state'],
    },
    pincode: {
      type: String,
      required: [true, 'Please provide postal code / pincode'],
    },
    // GeoJSON Point for Leaflet / OpenStreetMap mapping
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        default: [77.5946, 12.9716],
      },
    },
    contactPhone: {
      type: String,
      required: [true, 'Please provide hostel contact number'],
    },
    contactEmail: {
      type: String,
      required: [true, 'Please provide hostel contact email'],
    },
    manager: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Hostel must be assigned to a Hostel Manager'],
    },
    totalRooms: {
      type: Number,
      default: 0,
    },
    totalBeds: {
      type: Number,
      default: 0,
    },
    // --- Sprint 2: Manager Module Fields ---
    facilities: {
      type: [String],
      default: [],
    },
    hostelRules: {
      type: [String],
      default: [],
    },
    startingRent: {
      type: Number,
      default: 0,
    },
    securityDeposit: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['Pending', 'Approved', 'Rejected'],
      default: 'Pending',
    },
    rejectionReason: {
      type: String,
      default: '',
    },
    amenities: {
      type: [String],
      default: ['WiFi', 'CCTV', 'Water Purifier', '24/7 Security'],
    },
    images: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// Index for geospatial queries
hostelSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Hostel', hostelSchema);
