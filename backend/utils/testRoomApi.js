const BASE_AUTH = 'http://localhost:5000/api/auth';
const BASE_MANAGER = 'http://localhost:5000/api/manager';

async function testRoomModule() {
  let managerToken;
  let hostelId;
  let roomId;
  let passed = 0;
  let total = 0;

  function check(label, condition) {
    total++;
    if (condition) { passed++; console.log('  PASS: ' + label); }
    else { console.log('  FAIL: ' + label); }
  }

  try {
    // 1. Login as Manager
    console.log('\n--- Setup: Manager Login & Create Hostel ---');
    let res = await fetch(BASE_AUTH + '/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'vikram.manager@hostel.com', password: 'Password@123' }),
    });
    let data = await res.json();
    managerToken = data.token;
    
    // Create a temporary hostel for room testing
    res = await fetch(BASE_MANAGER + '/hostels', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + managerToken },
      body: JSON.stringify({
        name: 'Sprint 3 Test Hostel',
        type: 'Co-ed',
        address: 'Room Test Road',
        city: 'Bangalore',
        state: 'Karnataka',
        pincode: '560002',
        contactPhone: '8888888888',
        contactEmail: 'roomtest@hostel.com',
      }),
    });
    data = await res.json();
    hostelId = data.hostel._id;
    console.log(`Created test hostel with ID: ${hostelId}`);

    // 2. Create Room
    console.log('\n--- Test 1: Create Room ---');
    res = await fetch(`${BASE_MANAGER}/hostels/${hostelId}/rooms`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + managerToken },
      body: JSON.stringify({
        roomNumber: '101A',
        floor: '1st Floor',
        capacity: 2,
        occupiedBeds: 0,
        monthlyRent: 8000,
        gender: 'Boys',
        AC: true,
      }),
    });
    data = await res.json();
    if (res.status !== 201) console.error(data);
    roomId = data.room?._id;
    check('Room created successfully', res.status === 201);
    check('Room belongs to hostel', data.room?.hostel === hostelId);
    check('Available beds calculated as 2', data.room?.availableBeds === 2);
    check('Status automatically set to Available', data.room?.status === 'Available');

    // Test Invalid Capacity
    console.log('\n--- Test 2: Validation - Invalid Capacity & Occupancy ---');
    res = await fetch(`${BASE_MANAGER}/hostels/${hostelId}/rooms`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + managerToken },
      body: JSON.stringify({
        roomNumber: '102B',
        floor: '1st Floor',
        capacity: 2,
        occupiedBeds: 3, // invalid
        monthlyRent: 8000,
        gender: 'Boys',
      }),
    });
    data = await res.json();
    check('Cannot create room with occupied > capacity', res.status === 400 && data.message.includes('exceed capacity'));

    // 3. Get Rooms for Hostel
    console.log('\n--- Test 3: Get Rooms for Hostel ---');
    res = await fetch(`${BASE_MANAGER}/hostels/${hostelId}/rooms`, {
      headers: { Authorization: 'Bearer ' + managerToken },
    });
    data = await res.json();
    check('Rooms retrieved successfully', res.status === 200 && data.count === 1);
    
    // 4. Update Room
    console.log('\n--- Test 4: Update Room ---');
    res = await fetch(`${BASE_MANAGER}/rooms/${roomId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + managerToken },
      body: JSON.stringify({
        occupiedBeds: 2,
      }),
    });
    data = await res.json();
    check('Room updated successfully', res.status === 200);
    check('Available beds recalculated to 0', data.room?.availableBeds === 0);
    check('Status automatically updated to Full', data.room?.status === 'Full');

    // 5. Ownership Enforcement
    console.log('\n--- Test 5: Ownership Enforcement ---');
    res = await fetch(BASE_AUTH + '/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'ramesh.manager@hostel.com', password: 'Password@123' }),
    });
    data = await res.json();
    const otherToken = data.token;

    res = await fetch(`${BASE_MANAGER}/rooms/${roomId}`, {
      headers: { Authorization: 'Bearer ' + otherToken },
    });
    check('Other manager cannot view room (403)', res.status === 403);

    res = await fetch(`${BASE_MANAGER}/rooms/${roomId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + otherToken },
      body: JSON.stringify({ occupiedBeds: 1 }),
    });
    check('Other manager cannot edit room (403)', res.status === 403);

    res = await fetch(`${BASE_MANAGER}/rooms/${roomId}`, {
      method: 'DELETE',
      headers: { Authorization: 'Bearer ' + otherToken },
    });
    check('Other manager cannot delete room (403)', res.status === 403);

    res = await fetch(`${BASE_MANAGER}/hostels/${hostelId}/rooms`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + otherToken },
      body: JSON.stringify({
        roomNumber: '999', floor: '9', capacity: 1, monthlyRent: 100, gender: 'Boys',
      }),
    });
    check('Other manager cannot add room to hostel (403)', res.status === 403);

    // 6. Delete Room
    console.log('\n--- Test 6: Delete Room ---');
    res = await fetch(`${BASE_MANAGER}/rooms/${roomId}`, {
      method: 'DELETE',
      headers: { Authorization: 'Bearer ' + managerToken },
    });
    data = await res.json();
    check('Room deleted successfully', res.status === 200);

    // 7. Cleanup Hostel
    console.log('\n--- Cleanup ---');
    await fetch(BASE_MANAGER + '/hostels/' + hostelId, {
      method: 'DELETE',
      headers: { Authorization: 'Bearer ' + managerToken },
    });
    console.log('Test hostel deleted.');

    console.log('\n========================================');
    console.log('SPRINT 3 API TEST RESULTS: ' + passed + '/' + total + ' PASSED');
    console.log('========================================\n');
  } catch (err) {
    console.error('Test error:', err);
  }

  process.exit(passed === total ? 0 : 1);
}

testRoomModule();
