const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware to verify JWT and authenticate the request
const protect = async (req, res, next) => {
  let token;

  // Check if Authorization header exists and begins with 'Bearer'
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Extract token from header string "Bearer <token>"
      token = req.headers.authorization.split(' ')[1];

      // Verify token signature against JWT_SECRET
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Fetch user from database excluding the password field and attach to request
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        return res.status(401).json({ message: 'User not found with this token' });
      }

      // Proceed to the next middleware or controller
      next();
    } catch (error) {
      console.error('Auth verification error:', error.message);
      return res.status(401).json({ message: 'Not authorized, token failed or expired' });
    }
  }

  // Handle missing token
  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token provided' });
  }
};

// Middleware to restrict access based on user role (RBAC)
const authorize = (...roles) => {
  return (req, res, next) => {
    // Ensure user object exists and role is authorized
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `User role '${req.user ? req.user.role : 'Unknown'}' is not authorized to access this route`,
      });
    }
    next();
  };
};

module.exports = { protect, authorize };
