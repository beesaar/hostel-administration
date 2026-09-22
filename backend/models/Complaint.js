const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Complaint must belong to a student'],
    },
    hostel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hostel',
      required: [true, 'Complaint must belong to a hostel'],
    },
    room: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Room',
    },
    title: {
      type: String,
      required: [true, 'Please provide a complaint title or category'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Please provide a detailed description'],
    },
    status: {
      type: String,
      enum: ['Pending', 'In Progress', 'Resolved'],
      default: 'Pending',
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

// Prevent very spammy complaints from the same user
complaintSchema.index({ student: 1, createdAt: -1 });
complaintSchema.index({ hostel: 1, status: 1 });

module.exports = mongoose.model('Complaint', complaintSchema);
