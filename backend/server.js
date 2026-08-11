const express = require('express');
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

// 5. Basic Health Check Route
app.get('/', (req, res) => {
  res.status(200).json({ message: 'Hostel Administration API is running smoothly!' });
});

// 6. Mount API Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/manager', require('./routes/managerRoutes'));
app.use('/api/manager', require('./routes/roomRoutes'));

// 7. Define Server Port & Start Server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running in development mode on port ${PORT}`);
});