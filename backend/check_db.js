const mongoose = require('mongoose');
require('dotenv').config();
const Booking = require('./models/Booking');
const Hostel = require('./models/Hostel');
const User = require('./models/User');

mongoose.connect(process.env.MONGO_URI, {})
  .then(async () => {
    const booking = await Booking.findOne({ status: 'Approved' })
      .populate({
        path: 'hostel',
        select: 'name address city state type facilities amenities contactPhone contactEmail manager pincode',
        populate: {
          path: 'manager',
          select: 'name phone email'
        }
      })
      .populate('room', 'roomNumber capacity occupiedBeds availableBeds status floor monthlyRent AC attachedBathroom gender');
      
    console.log("Approved Booking:");
    console.log(JSON.stringify(booking, null, 2));

    const pendingBooking = await Booking.findOne({ status: 'Pending' })
      .populate('hostel')
      .populate('room');

    console.log("\nPending Booking:");
    console.log(JSON.stringify(pendingBooking, null, 2));

    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
