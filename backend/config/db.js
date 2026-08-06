const mongoose = require('mongoose');
const dns = require('dns');

// Prevent querySrv ECONNREFUSED issues on local ISP DNS
dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected successfully: ${conn.connection.host}`);
  } catch (error) {
    console.error('MongoDB Connection Error:', error.message || error);
    process.exit(1);
  }
};

module.exports = connectDB;
