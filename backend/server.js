const express = require('express');
const path = require('path');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db'); // Import the DB connection

// 1. Load environment variables
dotenv.config();

// 2. Connect to Database
connectDB();

// 3. Initialize the Express application
const app = express();

// 4. Global Middleware
app.use(cors());
app.use(express.json());

const mongoose = require('mongoose');

// 5. Comprehensive Health Check Endpoints (for Render keep-awake ping / cron jobs)
const healthCheckHandler = (req, res) => {
  const dbStatusMap = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  };
  const isDbConnected = mongoose.connection.readyState === 1;

  res.status(isDbConnected ? 200 : 503).json({
    status: isDbConnected ? 'healthy' : 'degraded',
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    database: dbStatusMap[mongoose.connection.readyState] || 'unknown',
    message: 'Hostel Administration API is active and running smoothly!',
  });
};

app.get('/', healthCheckHandler);
app.get('/health', healthCheckHandler);
app.get('/api/health', healthCheckHandler);

// 6. Mount API Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api', require('./routes/publicRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/manager', require('./routes/managerRoutes'));
app.use('/api/manager', require('./routes/roomRoutes'));
app.use('/api/student', require('./routes/studentRoutes'));
app.use('/api/bookings', require('./routes/bookingRoutes'));
app.use('/api/complaints', require('./routes/complaintRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));

// 7. Error Handling Middleware (including Multer file upload errors)
app.use((err, req, res, next) => {
  if (err.name === 'MulterError') {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ success: false, message: 'File too large. Maximum size per image is 5 MB.' });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({ success: false, message: 'Too many files. You can upload up to 30 images at once.' });
    }
    return res.status(400).json({ success: false, message: `Upload error: ${err.message}` });
  }
  if (err) {
    return res.status(400).json({ success: false, message: err.message || 'Server Error' });
  }
  next();
});

// 8. Define Server Port & Start Server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running in development mode on port ${PORT}`);
});