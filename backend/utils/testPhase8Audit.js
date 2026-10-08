const BASE_AUTH = 'http://localhost:5000/api/auth';
const BASE_ADMIN = 'http://localhost:5000/api/admin';
const BASE_MANAGER = 'http://localhost:5000/api/manager';
const BASE_STUDENT = 'http://localhost:5000/api/student';
const BASE_BOOKINGS = 'http://localhost:5000/api/bookings';

async function runPhase8Audit() {
  console.log('========================================');
  console.log('UNISTAY PHASE 8 COMPLETE AUDIT');
  console.log('========================================\n');

  let adminToken, managerToken, student1Token, student2Token;
  let hostelId, roomId;
  let bookingId, rejectionBookingId;
  let passed = 0;
  let total = 0;

  function assert(label, condition, details = '') {
    total++;
    if (condition) {
      passed++;
      console.log(`[PASS ${passed}] ${label}`);
    } else {
      console.log(`[FAIL] ${label} - ${details}`);
    }
  }

  try {
    // 1. Logins
    console.log('--- Step 1: Authentication & Setup ---');
    let res = await fetch(BASE_AUTH + '/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@hostel.com', password: 'AdminPassword@123' }),
    });
    adminToken = (await res.json()).token;

    const ts = Date.now();
    res = await fetch(BASE_AUTH + '/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: `Audit Manager ${ts}`,
        email: `audit_mgr_${ts}@unistay.com`,
        phone: '9998887770',
        password: 'Password@123',
        role: 'Hostel Manager',
      }),
    });
    managerToken = (await res.json()).token;

    res = await fetch(BASE_AUTH + '/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: `Audit Student 1 ${ts}`,
        email: `audit1_${ts}@unistay.com`,
        phone: '9998887771',
        password: 'Password@123',
        role: 'Student',
      }),
    });
    student1Token = (await res.json()).token;

    res = await fetch(BASE_AUTH + '/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: `Audit Student 2 ${ts}`,
        email: `audit2_${ts}@unistay.com`,
        phone: '9998887772',
        password: 'Password@123',
        role: 'Student',
      }),
    });
    student2Token = (await res.json()).token;

    assert('Logins and user registrations successful', !!adminToken && !!managerToken && !!student1Token && !!student2Token);

    // 2. Setup Approved Hostel & Room
    res = await fetch(BASE_MANAGER + '/hostels', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + managerToken },
      body: JSON.stringify({
        name: `Audit Hostel ${ts}`,
        type: 'Boys',
        address: '100 University Rd',
        city: 'Metropolis',
        state: 'State',
        pincode: '500001',
        contactPhone: '9876543210',
        contactEmail: 'audit@hostel.com',
        description: 'Audit Test Hostel',
        startingRent: 5000,
        securityDeposit: 2000,
        facilities: ['WiFi', 'CCTV'],
      }),
    });
    let hostelData = await res.json();
    if (res.status !== 201) console.log('Hostel creation failed:', hostelData);
    hostelId = hostelData.hostel._id;

    // Approve Hostel
    await fetch(`${BASE_ADMIN}/hostels/${hostelId}/approve`, {
      method: 'PUT',
      headers: { Authorization: 'Bearer ' + adminToken },
    });

    // Add Room
    res = await fetch(`${BASE_MANAGER}/hostels/${hostelId}/rooms`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + managerToken },
      body: JSON.stringify({
        roomNumber: `A-${ts.toString().slice(-4)}`,
        floor: '2',
        capacity: 2,
        monthlyRent: 5500,
        gender: 'Boys',
        AC: true,
        attachedBathroom: true,
        furnished: true,
      }),
    });
    roomId = (await res.json()).room._id;

    assert('Hostel created, approved by Admin, and room added', !!hostelId && !!roomId);

    // 3. Student Flow - Step 2 & 3: Check Initial Status
    console.log('\n--- Step 2-3: Student Dashboard - NO_ROOM ---');
    res = await fetch(`${BASE_BOOKINGS}/student/status`, {
      headers: { Authorization: 'Bearer ' + student1Token },
    });
    let statusData = await res.json();
    assert('Student 1 initial status is NO_ROOM', res.status === 200 && statusData.state === 'NO_ROOM');

    // 4. Student Flow - Step 4 & 5: Explore & Filter Hostels
    console.log('\n--- Step 4-5: Explore & Filter Hostels ---');
    res = await fetch(`${BASE_STUDENT}/hostels`, {
      headers: { Authorization: 'Bearer ' + student1Token },
    });
    let hostelsData = await res.json();
    assert('Student can explore approved hostels', res.status === 200 && Array.isArray(hostelsData) && hostelsData.some(h => h._id === hostelId));

    // 5. Student Flow - Step 6 & 7: View Hostel Details & Rooms
    console.log('\n--- Step 6-7: Hostel Details & Available Rooms ---');
    res = await fetch(`${BASE_STUDENT}/hostels/${hostelId}`, {
      headers: { Authorization: 'Bearer ' + student1Token },
    });
    let hostelDetail = await res.json();
    assert('Student can view hostel details', res.status === 200 && hostelDetail.name.includes('Audit Hostel'));

    res = await fetch(`${BASE_STUDENT}/hostels/${hostelId}/rooms`, {
      headers: { Authorization: 'Bearer ' + student1Token },
    });
    let roomsData = await res.json();
    assert('Student can view available rooms', res.status === 200 && Array.isArray(roomsData) && roomsData.some(r => r._id === roomId));

    // 6. Student Flow - Step 8-10: Submit Booking & See Pending State
    console.log('\n--- Step 8-10: Create Booking Request & Pending State ---');
    res = await fetch(BASE_BOOKINGS, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + student1Token },
      body: JSON.stringify({ hostelId, roomId }),
    });
    let bookingData = await res.json();
    bookingId = bookingData._id;
    assert('Student successfully submits booking request', res.status === 201 && bookingData.status === 'Pending');

    res = await fetch(`${BASE_BOOKINGS}/student/status`, {
      headers: { Authorization: 'Bearer ' + student1Token },
    });
    statusData = await res.json();
    assert('Student status changes to PENDING', res.status === 200 && statusData.state === 'PENDING' && statusData.booking._id === bookingId);

    // Duplicate Pending Prevention Check
    res = await fetch(BASE_BOOKINGS, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + student1Token },
      body: JSON.stringify({ hostelId, roomId }),
    });
    assert('Prevent student from creating duplicate pending booking', res.status === 400);

    // 7. Manager Flow - Step 11-14: Review & Approve Booking
    console.log('\n--- Step 11-14: Manager Review & Approve Request ---');
    res = await fetch(`${BASE_BOOKINGS}/manager`, {
      headers: { Authorization: 'Bearer ' + managerToken },
    });
    let managerBookings = await res.json();
    assert('Manager can view booking requests for their hostel', res.status === 200 && managerBookings.some(b => b._id === bookingId));

    res = await fetch(`${BASE_BOOKINGS}/${bookingId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + managerToken },
      body: JSON.stringify({ status: 'Approved' }),
    });
    let updateRes = await res.json();
    assert('Manager approves student booking request', res.status === 200 && updateRes.status === 'Approved');

    // 8. Student Flow - Step 15-18: Active Resident State & Single Allocation Rule
    console.log('\n--- Step 15-18: Active Resident State & Allocation Rule ---');
    res = await fetch(`${BASE_BOOKINGS}/student/status`, {
      headers: { Authorization: 'Bearer ' + student1Token },
    });
    statusData = await res.json();
    assert('Student status transforms to ACTIVE_RESIDENT', res.status === 200 && statusData.state === 'ACTIVE_RESIDENT');

    // Room Occupancy Check
    res = await fetch(`${BASE_STUDENT}/hostels/${hostelId}/rooms`, {
      headers: { Authorization: 'Bearer ' + student1Token },
    });
    roomsData = await res.json();
    let currentRoom = roomsData.find(r => r._id === roomId);
    assert('Room occupiedBeds updated to 1', currentRoom && currentRoom.occupiedBeds === 1);

    // Student 1 Attempts another booking after approval
    res = await fetch(BASE_BOOKINGS, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + student1Token },
      body: JSON.stringify({ hostelId, roomId }),
    });
    assert('Student with active accommodation blocked from booking another room', res.status === 400);

    // 9. Rejection Flow Test
    console.log('\n--- Rejection Flow Test ---');
    res = await fetch(BASE_BOOKINGS, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + student2Token },
      body: JSON.stringify({ hostelId, roomId }),
    });
    rejectionBookingId = (await res.json())._id;

    res = await fetch(`${BASE_BOOKINGS}/${rejectionBookingId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + managerToken },
      body: JSON.stringify({ status: 'Rejected', managerResponse: 'Room criteria not met' }),
    });
    let rejectRes = await res.json();
    assert('Manager rejects booking request with manager note', res.status === 200 && rejectRes.status === 'Rejected' && rejectRes.managerResponse === 'Room criteria not met');

    res = await fetch(`${BASE_BOOKINGS}/student`, {
      headers: { Authorization: 'Bearer ' + student2Token },
    });
    let student2Bookings = await res.json();
    assert('Student 2 receives Rejected status with manager note', res.status === 200 && student2Bookings.some(b => b._id === rejectionBookingId && b.status === 'Rejected'));

    // Cleanup
    await fetch(`${BASE_MANAGER}/hostels/${hostelId}`, {
      method: 'DELETE',
      headers: { Authorization: 'Bearer ' + managerToken },
    });

    console.log('\n========================================');
    console.log(`AUDIT COMPLETE: ${passed}/${total} VERIFICATIONS PASSED`);
    console.log('========================================\n');
  } catch (err) {
    console.error('Audit execution error:', err);
  }
}

runPhase8Audit();
