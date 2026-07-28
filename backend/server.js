const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db'); // 1. Import the connection function

// Load environment variables
dotenv.config();

// 2. Connect to the database
connectDB();

const app = express();

// Middleware
app.use(express.json());

// Basic test route
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to the Hostel Administration System API'
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is successfully running on port ${PORT}`);
});