const jwt = require('jsonwebtoken');

const generateToken = (id) => {
  // Sign the payload (user id) with our secret key, making it valid for 30 days
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

module.exports = generateToken;