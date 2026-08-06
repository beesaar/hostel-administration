const dotenv = require('dotenv');
dotenv.config();
const connectDB = require('../config/db');
const User = require('../models/User');

const seedAdmin = async () => {
  try {
    await connectDB();

    const adminEmail = 'admin@hostel.com';
    const adminPassword = 'AdminPassword@123';

    let admin = await User.findOne({ email: adminEmail });

    if (admin) {
      console.log(`Admin account '${adminEmail}' already exists in MongoDB Atlas.`);
    } else {
      admin = await User.create({
        name: 'Super Administrator',
        email: adminEmail,
        phone: '9876543210',
        password: adminPassword,
        role: 'Admin',
      });
      console.log(`✓ Admin user successfully seeded into MongoDB Atlas:`);
      console.log(`  - Name: ${admin.name}`);
      console.log(`  - Email: ${admin.email}`);
      console.log(`  - Role: ${admin.role}`);
      console.log(`  - Password: ${adminPassword}`);
    }

    process.exit(0);
  } catch (error) {
    console.error('Error seeding admin:', error);
    process.exit(1);
  }
};

seedAdmin();
