const mongoose = require('mongoose');
const User = require('../models/User');
const Hostel = require('../models/Hostel');
const Room = require('../models/Room');
const Booking = require('../models/Booking');

const API_BASE = 'http://localhost:5000/api';

async function apiRequest(method, path, body = null, token = null) {
  const url = `${API_BASE}${path}`;
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const opts = { method, headers };
  if (body) opts.body = JSON.stringify(body);

  const res = await fetch(url, opts);
  let data;
  try {
    data = await res.json();
  } catch (err) {
    data = { message: res.statusText };
  }
  return { status: res.status, data };
}

let passed = 0;
let failed = 0;

function assert(condition, testName) {
  if (condition) {
    console.log(`  ✅ PASS — ${testName}`);
    passed++;
  } else {
    console.log(`  ❌ FAIL — ${testName}`);
    failed++;
  }
}

async function runTests() {
  console.log('\n=== PHASE 6 — STUDENT LEAVE / HOSTEL CHANGE WORKFLOW TESTS ===\n');

  // --- Setup: Register test users ---
  console.log('--- Setup: Register test users ---');

  const mgr1Reg = await apiRequest('POST', '/auth/register', {
    name: 'Phase6 Manager1',
    email: `phase6mgr1_${Date.now()}@test.com`,
    password: 'Test1234!',
    phone: '9876543210',
    role: 'Hostel Manager',
  });
  const managerToken1 = mgr1Reg.data.token;
  assert(!!managerToken1, 'Manager1 registered');

  const mgr2Reg = await apiRequest('POST', '/auth/register', {
    name: 'Phase6 Manager2',
    email: `phase6mgr2_${Date.now()}@test.com`,
    password: 'Test1234!',
    phone: '9876543210',
    role: 'Hostel Manager',
  });
  const managerToken2 = mgr2Reg.data.token;
  assert(!!managerToken2, 'Manager2 registered');

  const stuReg = await apiRequest('POST', '/auth/register', {
    name: 'Phase6 Student',
    email: `phase6stu_${Date.now()}@test.com`,
    password: 'Test1234!',
    phone: '9876543210',
    role: 'Student',
  });
  const studentToken = stuReg.data.token;
  assert(!!studentToken, 'Student registered');

  const adminLogin = await apiRequest('POST', '/auth/login', {
    email: 'admin@hostel.com',
    password: 'AdminPassword@123',
  });
  const adminToken = adminLogin.data.token;
  assert(!!adminToken, 'Admin logged in');

  // Create Hostel 1
  const hostel1Res = await apiRequest('POST', '/manager/hostels', {
    name: `Phase6 Hostel 1 - ${Date.now()}`,
    type: 'Boys',
    address: '100 Phase6 St',
    city: 'Mumbai',
    state: 'Maharashtra',
    pincode: '400001',
    contactPhone: '9876543210',
    contactEmail: 'phase6h1@test.com',
    latitude: 19.076,
    longitude: 72.8777
  }, managerToken1);
  if (!hostel1Res.data || !hostel1Res.data.hostel) {
    console.error('Failed to create hostel 1:', JSON.stringify(hostel1Res, null, 2));
    process.exit(1);
  }
  const hostel1Id = hostel1Res.data.hostel._id;

  // Approve Hostel 1
  await apiRequest('PUT', `/admin/hostels/${hostel1Id}/approve`, {}, adminToken);

  // Create Room in Hostel 1
  const room1Res = await apiRequest('POST', `/manager/hostels/${hostel1Id}/rooms`, {
    roomNumber: '101',
    capacity: 2,
    monthlyRent: 5000,
    floor: '1st',
    AC: true,
    attachedBathroom: true,
    gender: 'Boys'
  }, managerToken1);
  if (!room1Res.data || !room1Res.data.room) {
    console.error('Failed to create room 1:', JSON.stringify(room1Res, null, 2));
    process.exit(1);
  }
  const room1Id = room1Res.data.room._id;

  // Create Hostel 2 (for another manager)
  const hostel2Res = await apiRequest('POST', '/manager/hostels', {
    name: `Phase6 Hostel 2 - ${Date.now()}`,
    type: 'Boys',
    address: '200 Phase6 St',
    city: 'Mumbai',
    state: 'Maharashtra',
    pincode: '400001',
    contactPhone: '9876543210',
    contactEmail: 'phase6h2@test.com',
    latitude: 19.076,
    longitude: 72.8777
  }, managerToken2);
  const hostel2Id = hostel2Res.data.hostel._id;
  await apiRequest('PUT', `/admin/hostels/${hostel2Id}/approve`, {}, adminToken);

  const room2Res = await apiRequest('POST', `/manager/hostels/${hostel2Id}/rooms`, {
    roomNumber: '201',
    capacity: 2,
    monthlyRent: 5000,
    floor: '1st',
    gender: 'Boys'
  }, managerToken2);
  if (!room2Res.data || !room2Res.data.room) {
    console.error('Failed to create room 2:', JSON.stringify(room2Res, null, 2));
    process.exit(1);
  }
  const room2Id = room2Res.data.room._id;

  // --- Step 20: Cannot request leave without active accommodation ---
  console.log('\n--- 20. Cannot request leave without active accommodation ---');
  const noAccRes = await apiRequest('POST', '/bookings/leave', { leaveReason: 'Testing' }, studentToken);
  assert(noAccRes.status === 400, 'Leave request rejected for no active accommodation');

  // --- Create active accommodation ---
  console.log('\n--- Setup: Create Active Accommodation ---');
  const bookRes = await apiRequest('POST', '/bookings', { hostelId: hostel1Id, roomId: room1Id }, studentToken);
  if (bookRes.status !== 201) {
    console.error('Failed to create booking:', bookRes);
    process.exit(1);
  }
  const bookingId = bookRes.data._id;
  
  const approveBookingRes = await apiRequest('PATCH', `/bookings/${bookingId}/status`, { status: 'Approved' }, managerToken1);
  if (approveBookingRes.status !== 200) {
    console.error('Failed to approve booking:', approveBookingRes);
    process.exit(1);
  }
  
  // Verify occupancy
  let r1 = await apiRequest('GET', `/manager/rooms/${room1Id}`, null, managerToken1);
  let occupancy = r1.data.room.occupiedBeds;
  let initialOccupancy = occupancy;
  assert(initialOccupancy === 1, 'Initial room occupancy is 1');

  // --- Step 2 & 3: Empty / whitespace reason rejected ---
  console.log('\n--- 2 & 3. Invalid Leave Reason ---');
  const emptyRes = await apiRequest('POST', '/bookings/leave', { leaveReason: '' }, studentToken);
  assert(emptyRes.status === 400, 'Empty reason rejected');
  const spaceRes = await apiRequest('POST', '/bookings/leave', { leaveReason: '   ' }, studentToken);
  assert(spaceRes.status === 400, 'Whitespace reason rejected');

  // --- Step 1, 4 & 5: Request leave with valid reason ---
  console.log('\n--- 1, 4 & 5. Valid Leave Request ---');
  const validRes = await apiRequest('POST', '/bookings/leave', { leaveReason: ' Moving away ' }, studentToken);
  assert(validRes.status === 200, 'Leave request successful');
  assert(validRes.data.booking.status === 'Leave_Requested', 'Booking status changed to Leave_Requested');
  assert(validRes.data.booking.leaveReason === 'Moving away', 'Leave reason stored and trimmed');

  // --- Step 7: Duplicate leave request rejected ---
  console.log('\n--- 7. Duplicate Leave Request Rejected ---');
  const dupRes = await apiRequest('POST', '/bookings/leave', { leaveReason: 'Again' }, studentToken);
  assert(dupRes.status === 400, 'Duplicate leave request rejected');

  // --- Step 6: Cannot create another booking while Leave_Requested ---
  console.log('\n--- 6. Cannot book another while Leave_Requested ---');
  const secondBookRes = await apiRequest('POST', '/bookings', { hostelId: hostel2Id, roomId: room2Id }, studentToken);
  assert(secondBookRes.status === 400, 'New booking rejected while Leave_Requested');
  assert(secondBookRes.data.message.includes('pending leave request'), 'Correct error message');

  // --- Step 8: Manager can see their own leave request ---
  console.log('\n--- 8. Manager sees pending request ---');
  const mgrBookings = await apiRequest('GET', '/bookings/manager', null, managerToken1);
  const pendingLeave = mgrBookings.data.find(b => b._id === bookingId && b.status === 'Leave_Requested');
  assert(!!pendingLeave, 'Manager can fetch Leave_Requested booking');

  // --- Step 9: Another manager cannot approve/reject ---
  console.log('\n--- 9. Another manager cannot act on it ---');
  const wrongMgrRes = await apiRequest('PATCH', `/bookings/${bookingId}/leave-approval`, { action: 'reject' }, managerToken2);
  assert(wrongMgrRes.status === 403 || wrongMgrRes.status === 404, 'Other manager rejected');

  // --- Step 10, 11, 12, 13: Reject leave request ---
  console.log('\n--- 10, 11, 12, 13. Reject Leave Request ---');
  const rejectRes = await apiRequest('PATCH', `/bookings/${bookingId}/leave-approval`, { action: 'reject' }, managerToken1);
  assert(rejectRes.status === 200, 'Manager rejected leave');
  assert(rejectRes.data.booking.status === 'Approved', 'Status reverted to Approved');
  
  const stuStatusRes = await apiRequest('GET', '/bookings/student/status', null, studentToken);
  assert(stuStatusRes.data.state === 'ACTIVE_RESIDENT', 'Student is still active resident');
  
  r1 = await apiRequest('GET', `/manager/rooms/${room1Id}`, null, managerToken1);
  assert(r1.data.room.occupiedBeds === 1, 'Occupancy remains 1');

  // Request leave again for approval
  await apiRequest('POST', '/bookings/leave', { leaveReason: 'Moving away for real' }, studentToken);

  // --- Step 14, 15, 16, 17: Approve leave request ---
  console.log('\n--- 14, 15, 16, 17. Approve Leave Request ---');
  const approveRes = await apiRequest('PATCH', `/bookings/${bookingId}/leave-approval`, { action: 'approve' }, managerToken1);
  assert(approveRes.status === 200, 'Manager approved leave');
  assert(approveRes.data.booking.status === 'Completed', 'Status changed to Completed');
  
  r1 = await apiRequest('GET', `/manager/rooms/${room1Id}`, null, managerToken1);
  assert(r1.data.room.occupiedBeds === 0, 'Occupancy decreased exactly once (now 0)');
  
  const stuStatusRes2 = await apiRequest('GET', '/bookings/student/status', null, studentToken);
  assert(stuStatusRes2.data.state === 'NO_ROOM', 'Student no longer has active accommodation');

  // --- Step 19: Completed leave cannot be processed again ---
  console.log('\n--- 19. Cannot process completed leave ---');
  const doubleApprove = await apiRequest('PATCH', `/bookings/${bookingId}/leave-approval`, { action: 'approve' }, managerToken1);
  assert(doubleApprove.status === 400, 'Double approval rejected');
  
  r1 = await apiRequest('GET', `/manager/rooms/${room1Id}`, null, managerToken1);
  assert(r1.data.room.occupiedBeds === 0, 'Occupancy did not decrease below 0');

  // --- Step 18: Student can create a new booking after approved leave ---
  console.log('\n--- 18. Can create new booking after leave ---');
  const newBookRes = await apiRequest('POST', '/bookings', { hostelId: hostel2Id, roomId: room2Id }, studentToken);
  assert(newBookRes.status === 201, 'Student created a new booking successfully');

  console.log('\n==================================================');
  console.log(`PHASE 6 RESULTS: ${passed} passed, ${failed} failed, ${passed + failed} total`);
  console.log('==================================================\n');
}

runTests().catch(console.error);
