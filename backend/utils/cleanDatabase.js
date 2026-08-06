const dotenv = require('dotenv');
dotenv.config();
const connectDB = require('../config/db');
const User = require('../models/User');
const Hostel = require('../models/Hostel');

const cleanAndSeedRealisticData = async () => {
  try {
    await connectDB();

    console.log('Cleaning up old test accounts...');
    // Remove old test accounts created with timestamp emails
    await User.deleteMany({ email: { $regex: /_17860/ } });
    await User.deleteMany({ email: { $regex: /admin_super/ } });
    await User.deleteMany({ email: { $regex: /admin_1786/ } });

    // 1. Ensure Single Master Admin
    let admin = await User.findOne({ email: 'admin@hostel.com' });
    if (!admin) {
      admin = await User.create({
        name: 'Super Administrator',
        email: 'admin@hostel.com',
        phone: '9876543210',
        password: 'AdminPassword@123',
        role: 'Admin',
      });
      console.log('✓ Created Master Admin: admin@hostel.com');
    } else {
      console.log('✓ Master Admin verified: admin@hostel.com');
    }

    // 2. Ensure Realistic Managers
    let manager1 = await User.findOne({ email: 'vikram.manager@hostel.com' });
    if (!manager1) {
      manager1 = await User.create({
        name: 'Vikram Singh',
        email: 'vikram.manager@hostel.com',
        phone: '9876500001',
        password: 'Password@123',
        role: 'Hostel Manager',
      });
      console.log('✓ Created Manager: Vikram Singh (vikram.manager@hostel.com)');
    }

    let manager2 = await User.findOne({ email: 'ramesh.manager@hostel.com' });
    if (!manager2) {
      manager2 = await User.create({
        name: 'Ramesh Patel',
        email: 'ramesh.manager@hostel.com',
        phone: '9876500002',
        password: 'Password@123',
        role: 'Hostel Manager',
      });
      console.log('✓ Created Manager: Ramesh Patel (ramesh.manager@hostel.com)');
    }

    // 3. Ensure Realistic Students
    let student1 = await User.findOne({ email: 'rahul.student@hostel.com' });
    if (!student1) {
      student1 = await User.create({
        name: 'Rahul Sharma',
        email: 'rahul.student@hostel.com',
        phone: '9876511001',
        password: 'Password@123',
        role: 'Student',
      });
      console.log('✓ Created Student: Rahul Sharma');
    }

    let student2 = await User.findOne({ email: 'ananya.student@hostel.com' });
    if (!student2) {
      student2 = await User.create({
        name: 'Ananya Roy',
        email: 'ananya.student@hostel.com',
        phone: '9876511002',
        password: 'Password@123',
        role: 'Student',
      });
      console.log('✓ Created Student: Ananya Roy');
    }

    let student3 = await User.findOne({ email: 'priya.student@hostel.com' });
    if (!student3) {
      student3 = await User.create({
        name: 'Priya Verma',
        email: 'priya.student@hostel.com',
        phone: '9876511003',
        password: 'Password@123',
        role: 'Student',
      });
      console.log('✓ Created Student: Priya Verma');
    }

    // 4. Ensure Hostels with various status stages
    await Hostel.deleteMany({}); // refresh test hostels

    await Hostel.create([
      {
        name: 'Royal Heritage Boys Hostel',
        type: 'Boys',
        description: 'Premium student accommodation with 3 meals & high speed WiFi',
        address: '5th Main Road, HSR Layout Sector 2',
        city: 'Bangalore',
        state: 'Karnataka',
        pincode: '560102',
        contactPhone: '9876500001',
        contactEmail: 'royalheritage@hostels.com',
        manager: manager1._id,
        totalRooms: 40,
        totalBeds: 120,
        status: 'Approved',
        amenities: ['High Speed WiFi', '24/7 Security', 'CCTV Surveillance', 'Daily Housekeeping', '3 Times Meals'],
      },
      {
        name: 'Lotus Blossom Girls Residence',
        type: 'Girls',
        description: 'Safe gated community with biometric entry, gym, and library',
        address: '14th Cross, Margosa Road, Malleshwaram',
        city: 'Bangalore',
        state: 'Karnataka',
        pincode: '560003',
        contactPhone: '9876500002',
        contactEmail: 'lotusblossom@hostels.com',
        manager: manager2._id,
        totalRooms: 25,
        totalBeds: 75,
        status: 'Pending',
        amenities: ['Biometric Access', 'Gym & Fitness', 'Study Room', 'Attached Washrooms', 'Power Backup'],
      },
      {
        name: 'Greenwood Co-ed Living',
        type: 'Co-ed',
        description: 'Modern co-living space with co-working lounge & laundry facility',
        address: '88 Cyber Park, Whitefield',
        city: 'Bangalore',
        state: 'Karnataka',
        pincode: '560066',
        contactPhone: '9876500001',
        contactEmail: 'greenwood@hostels.com',
        manager: manager1._id,
        totalRooms: 30,
        totalBeds: 60,
        status: 'Pending',
        amenities: ['Co-working Lounge', 'Laundry Service', 'Solar Water Heating', 'Gaming Zone'],
      },
    ]);

    console.log('✓ Seeded 3 hostels (1 Approved, 2 Pending Approvals)');

    console.log('\n=== DATABASE CLEANED AND ORGANIZED SUCCESSFULLY ===');
    const remainingUsers = await User.find({}).select('name email role');
    console.log(`Current Total Users: ${remainingUsers.length}`);
    remainingUsers.forEach((u, i) => console.log(` ${i + 1}. [${u.role}] ${u.name} (${u.email})`));

    process.exit(0);
  } catch (error) {
    console.error('Error during cleanup:', error);
    process.exit(1);
  }
};

cleanAndSeedRealisticData();
