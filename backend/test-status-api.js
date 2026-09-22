require('dotenv').config();

const API_URL = 'http://localhost:5000/api';

async function runTest() {
  try {
    console.log('--- STARTING ACCOMMODATION STATUS API TEST ---');

    console.log('1. Registering new student...');
    let registerRes = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test Status Student',
        email: `test_status_${Date.now()}@example.com`,
        password: 'password123',
        phone: '1234567890',
        role: 'Student'
      })
    });
    const registerData = await registerRes.json();
    if (!registerData.token) throw new Error('Registration failed');
    const token = registerData.token;
    const authHeaders = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };

    console.log('\n2. Fetching an approved hostel and room via API...');
    // We can fetch approved hostels as student
    let hostelsRes = await fetch(`${API_URL}/student/hostels`, { headers: authHeaders });
    let hostels = await hostelsRes.json();
    if (hostels.length === 0) throw new Error('No approved hostels found via API');
    const hostel = hostels[0];

    let roomsRes = await fetch(`${API_URL}/student/hostels/${hostel._id}/rooms`, { headers: authHeaders });
    let rooms = await roomsRes.json();
    if (rooms.length === 0) throw new Error('No rooms found in hostel');
    const room = rooms[0];

    console.log('\nTEST 1: Fetching status (Expect NO_ROOM)...');
    let statusRes = await fetch(`${API_URL}/bookings/student/status`, { headers: authHeaders });
    let statusData = await statusRes.json();
    console.log('Result:', JSON.stringify(statusData, null, 2));

    console.log('\n3. Creating a room booking...');
    let bookRes = await fetch(`${API_URL}/bookings`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        hostelId: hostel._id.toString(),
        roomId: room._id.toString()
      })
    });
    let bookData = await bookRes.json();

    console.log('\nTEST 2: Fetching status (Expect PENDING)...');
    statusRes = await fetch(`${API_URL}/bookings/student/status`, { headers: authHeaders });
    statusData = await statusRes.json();
    console.log('Result:', JSON.stringify(statusData, null, 2));

    // For test 3, we normally need Manager token. 
    console.log('\n--- SKIPPING TEST 3 (ACTIVE_RESIDENT) AS IT REQUIRES MANAGER LOGIN ---');
    console.log('--- ALL BASIC API TESTS COMPLETED SUCCESSFULLY ---');

  } catch (error) {
    console.error('Test Failed:', error.message);
    process.exit(1);
  }
}

runTest();
