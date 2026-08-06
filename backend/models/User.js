const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// 1. Define the blueprint based on your PRD
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true, // Prevents two users from registering with the same email
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email'
    ]
  },
  password: {
    type: String,
    required: [true, 'Please add a password'],
    minlength: 6,
    select: false // Crucial: Do not return the password when querying users
  },
  phone: {
    type: String,
    required: [true, 'Please add a phone number']
  },
  role: {
    type: String,
    enum: ['Student', 'Hostel Manager', 'Admin'], // Only these exact strings are allowed
    default: 'Student'
  }
}, {
  timestamps: true // Automatically creates 'createdAt' and 'updatedAt' fields
});

// 2. The Pre-Save Hook (Automation for Security)
userSchema.pre('save', async function(next) {
  // Prevent double-hashing: If the password wasn't modified, skip to the next step
  if (!this.isModified('password')) {
    return next();
  }

  // Generate a 'salt' (random data added to the password to make it uncrackable)
  const salt = await bcrypt.genSalt(10);
  
  // Hash the password with the salt
  this.password = await bcrypt.hash(this.password, salt);
});

// 3. A Helper Method for Login (We will use this in Step 7)
// We attach a function directly to the user object to easily compare passwords later
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// 4. Export the Model
module.exports = mongoose.model('User', userSchema);