const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Attempt to connect to the database using the hidden URI
    const conn = await mongoose.connect(process.env.MONGO_URI);
    
    console.log(`MongoDB Connected successfully: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    // Exit the process with a failure code (1) if connection fails
    process.exit(1);
  }
};

module.exports = connectDB;