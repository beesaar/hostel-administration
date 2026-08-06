const BASE_AUTH = 'http://localhost:5000/api/auth';
const BASE_MANAGER = 'http://localhost:5000/api/manager';

async function testManagerModule() {
  let managerToken;
  let hostelId;
  let passed = 0;
  let total = 0;

  function check(label, condition) {
    total++;
    if (condition) { passed++; console.log('  PASS: ' + label); }
    else { console.log('  FAIL: ' + label); }
  }

  try {
    // 1. Login as Manager
    console.log('\n--- Test 1: Manager Login ---');
    let res = await fetch(BASE_AUTH + '/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'vikram.manager@hostel.com', password: 'Password@123' }),
    });
    let data = await res.json();
    managerToken = data.token;
    check('Login successful', res.status === 200 && data.role === 'Hostel Manager');

    // 2. Manager Dashboard
    console.log('\n--- Test 2: Manager Dashboard ---');
    res = await fetch(BASE_MANAGER + '/dashboard', {
      headers: { Authorization: 'Bearer ' + managerToken },
    });
    data = await res.json();
    check('Dashboard returns stats', data.success && data.stats !== undefined);

    // 3. Create Hostel
    console.log('\n--- Test 3: Create Hostel ---');
    res = await fetch(BASE_MANAGER + '/hostels', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + managerToken },
      body: JSON.stringify({
        name: 'Sprint 2 Test Hostel',
        type: 'Boys',
        description: 'Created during Sprint 2 integration test',
        address: '123 Test Road',
        city: 'Bangalore',
        state: 'Karnataka',
        pincode: '560001',
        contactPhone: '9999999999',
        contactEmail: 'test@hostel.com',
        totalRooms: 10,
        totalBeds: 30,
        startingRent: 5000,
        securityDeposit: 10000,
        facilities: ['WiFi', 'Gym', 'Laundry'],
        hostelRules: ['No smoking', 'Gate closes at 10 PM'],
        latitude: 12.97,
        longitude: 77.59,
      }),
    });
    data = await res.json();
    hostelId = data.hostel?._id;
    check('Hostel created with Pending status', res.status === 201 && data.hostel?.status === 'Pending');
    check('Manager auto-assigned', data.hostel?.manager != null);
    check('Facilities saved', JSON.stringify(data.hostel?.facilities) === JSON.stringify(['WiFi', 'Gym', 'Laundry']));
    check('Rules saved', data.hostel?.hostelRules?.length === 2);
    check('Rent saved', data.hostel?.startingRent === 5000);

    // 4. Get My Hostels
    console.log('\n--- Test 4: Get My Hostels ---');
    res = await fetch(BASE_MANAGER + '/hostels', {
      headers: { Authorization: 'Bearer ' + managerToken },
    });
    data = await res.json();
    check('My hostels returned', data.success && data.count > 0);

    // 5. Get Single Hostel
    console.log('\n--- Test 5: Get Single Hostel ---');
    res = await fetch(BASE_MANAGER + '/hostels/' + hostelId, {
      headers: { Authorization: 'Bearer ' + managerToken },
    });
    data = await res.json();
    check('Single hostel retrieved', data.success && data.hostel?.name === 'Sprint 2 Test Hostel');

    // 6. Update Hostel
    console.log('\n--- Test 6: Update Hostel ---');
    res = await fetch(BASE_MANAGER + '/hostels/' + hostelId, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + managerToken },
      body: JSON.stringify({
        name: 'Sprint 2 Updated Hostel',
        startingRent: 6000,
        facilities: ['WiFi', 'Gym', 'Laundry', 'Parking'],
      }),
    });
    data = await res.json();
    check('Hostel name updated', data.hostel?.name === 'Sprint 2 Updated Hostel');
    check('Rent updated', data.hostel?.startingRent === 6000);
    check('Facilities updated', data.hostel?.facilities?.length === 4);

    // 7. Ownership Test: Login as different manager
    console.log('\n--- Test 7: Ownership Enforcement ---');
    res = await fetch(BASE_AUTH + '/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'ramesh.manager@hostel.com', password: 'Password@123' }),
    });
    data = await res.json();
    const otherToken = data.token;

    res = await fetch(BASE_MANAGER + '/hostels/' + hostelId, {
      headers: { Authorization: 'Bearer ' + otherToken },
    });
    check('Other manager cannot view (404)', res.status === 404);

    res = await fetch(BASE_MANAGER + '/hostels/' + hostelId, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + otherToken },
      body: JSON.stringify({ name: 'Hacked Name' }),
    });
    check('Other manager cannot edit (404)', res.status === 404);

    res = await fetch(BASE_MANAGER + '/hostels/' + hostelId, {
      method: 'DELETE',
      headers: { Authorization: 'Bearer ' + otherToken },
    });
    check('Other manager cannot delete (404)', res.status === 404);

    // 8. Role Test: Student cannot access manager routes
    console.log('\n--- Test 8: Role Enforcement ---');
    res = await fetch(BASE_AUTH + '/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'rahul.student@hostel.com', password: 'Password@123' }),
    });
    data = await res.json();
    const studentToken = data.token;

    res = await fetch(BASE_MANAGER + '/dashboard', {
      headers: { Authorization: 'Bearer ' + studentToken },
    });
    check('Student blocked from manager dashboard (403)', res.status === 403);

    // 9. Delete Hostel (cleanup)
    console.log('\n--- Test 9: Delete Hostel ---');
    res = await fetch(BASE_MANAGER + '/hostels/' + hostelId, {
      method: 'DELETE',
      headers: { Authorization: 'Bearer ' + managerToken },
    });
    data = await res.json();
    check('Hostel deleted', data.success);

    // Verify deletion
    res = await fetch(BASE_MANAGER + '/hostels/' + hostelId, {
      headers: { Authorization: 'Bearer ' + managerToken },
    });
    check('Deleted hostel returns 404', res.status === 404);

    console.log('\n========================================');
    console.log('SPRINT 2 API TEST RESULTS: ' + passed + '/' + total + ' PASSED');
    console.log('========================================\n');
  } catch (err) {
    console.error('Test error:', err);
  }

  process.exit(passed === total ? 0 : 1);
}

testManagerModule();
