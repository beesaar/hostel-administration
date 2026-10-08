const mongoose = require('mongoose');
require('dotenv').config();
const Booking = require('./models/Booking');
const Hostel = require('./models/Hostel');
const User = require('./models/User');

mongoose.connect(process.env.MONGO_URI, {})
  .then(async () => {
    console.log('Connected to DB');
    const bookings = await Booking.find({ status: { $in: ['Approved', 'Leave_Requested'] } })
      .populate({
        path: 'hostel',
        select: 'name address city state type facilities amenities contactPhone contactEmail manager',
        populate: {
          path: 'manager',
          select: 'name phone email'
        }
      })
      .populate('room');
      
    if (bookings.length === 0) {
      console.log('No active bookings found.');
    } else {
      for (const b of bookings) {
        console.log('Booking:', b._id, '| Status:', b.status);
        if (!b.hostel) {
          console.log('  Hostel: null (Hostel may have been deleted)');
        } else {
          console.log('  Hostel:', b.hostel.name);
          console.log('  Manager populated:', b.hostel.manager ? 'YES' : 'NO');
          if (b.hostel.manager) {
            console.log('    Manager details:', b.hostel.manager.name, b.hostel.manager.email);
          } else {
            console.log('    Wait, if manager is null, what is the raw ID?');
            const rawHostel = await Hostel.findById(b.hostel._id);
            console.log('    Raw manager ObjectId in Hostel:', rawHostel.manager);
          }
        }
      }
    }
    process.exit(0);
  })
  .catch(console.error);
