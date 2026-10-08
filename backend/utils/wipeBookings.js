const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Booking = require('../models/Booking');
const Room = require('../models/Room');
dotenv.config();

mongoose.connect(process.env.MONGO_URI).then(async () => {
    await Booking.deleteMany({});
    console.log("Wiped all bookings.");
    process.exit(0);
});
