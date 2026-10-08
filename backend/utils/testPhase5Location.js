/**
 * Phase 5 — Map-Based Hostel Location Tests
 * 
 * Tests:
 * 1. Manager creates hostel with valid location → location saved
 * 2. Manager edits own hostel location → update succeeds
 * 3. Manager attempts to modify another manager's hostel → rejected
 * 4. Invalid latitude → rejected
 * 5. Invalid longitude → rejected
 * 6. Student gets approved hostel with location → includes location data
 * 7. Student gets approved hostel without location → still works
 * 8. Unapproved hostel → not visible to student
 * 9. Update with invalid latitude → rejected
 * 10. Update with invalid longitude → rejected
 */

const API_BASE = 'http://localhost:5000/api';

// ─── Helper ──────────────────────────────────────────────────────────────
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

// ─── State ───────────────────────────────────────────────────────────────
let managerToken1 = null;
let managerToken2 = null;
let studentToken = null;
let testHostelId = null;
let testHostel2Id = null;

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

// ─── Main ────────────────────────────────────────────────────────────────
async function runTests() {
  console.log('\n=== PHASE 5 — MAP-BASED HOSTEL LOCATION TESTS ===\n');

  // --- Register test users ---
  console.log('--- Setup: Register test users ---');

  const mgr1Reg = await apiRequest('POST', '/auth/register', {
    name: 'Phase5 Manager1',
    email: `phase5mgr1_${Date.now()}@test.com`,
    password: 'Test1234!',
    phone: '9876543210',
    role: 'Hostel Manager',
  });
  managerToken1 = mgr1Reg.data.token;
  assert(!!managerToken1, 'Manager1 registered');

  const mgr2Reg = await apiRequest('POST', '/auth/register', {
    name: 'Phase5 Manager2',
    email: `phase5mgr2_${Date.now()}@test.com`,
    password: 'Test1234!',
    phone: '9876543210',
    role: 'Hostel Manager',
  });
  managerToken2 = mgr2Reg.data.token;
  assert(!!managerToken2, 'Manager2 registered');

  const stuReg = await apiRequest('POST', '/auth/register', {
    name: 'Phase5 Student',
    email: `phase5stu_${Date.now()}@test.com`,
    password: 'Test1234!',
    phone: '9876543210',
    role: 'Student',
  });
  studentToken = stuReg.data.token;
  assert(!!studentToken, 'Student registered');

  // ── TEST 1: Create hostel with valid location ──
  console.log('\n--- Test 1: Create hostel with valid location ---');
  const createRes = await apiRequest('POST', '/manager/hostels', {
    name: 'Phase5 Location Hostel',
    type: 'Boys',
    address: '100 Test Street',
    city: 'Mumbai',
    state: 'Maharashtra',
    pincode: '400001',
    contactPhone: '9876543210',
    contactEmail: 'phase5@test.com',
    latitude: 19.0760,
    longitude: 72.8777,
  }, managerToken1);

  assert(createRes.status === 201, 'Hostel created (201)');
  assert(createRes.data.success === true, 'Response success=true');
  
  testHostelId = createRes.data.hostel?._id;
  const savedCoords = createRes.data.hostel?.location?.coordinates;
  assert(
    savedCoords && savedCoords[0] === 72.8777 && savedCoords[1] === 19.076,
    `Location saved correctly: [${savedCoords}]`
  );

  // ── TEST 2: Update own hostel location ──
  console.log('\n--- Test 2: Update own hostel location ---');
  const updateRes = await apiRequest('PUT', `/manager/hostels/${testHostelId}`, {
    latitude: 28.6139,
    longitude: 77.2090,
  }, managerToken1);

  assert(updateRes.status === 200, 'Update succeeded (200)');
  const updatedCoords = updateRes.data.hostel?.location?.coordinates;
  assert(
    updatedCoords && updatedCoords[0] === 77.209 && updatedCoords[1] === 28.6139,
    `Updated location: [${updatedCoords}]`
  );

  // ── TEST 3: Another manager tries to modify hostel ──
  console.log('\n--- Test 3: Another manager cannot modify someone else\'s hostel ---');
  const crossUpdateRes = await apiRequest('PUT', `/manager/hostels/${testHostelId}`, {
    latitude: 0,
    longitude: 0,
  }, managerToken2);

  assert(crossUpdateRes.status === 404, `Cross-manager update rejected (${crossUpdateRes.status})`);

  // ── TEST 4: Invalid latitude ──
  console.log('\n--- Test 4: Invalid latitude rejected ---');
  const badLatRes = await apiRequest('POST', '/manager/hostels', {
    name: 'Bad Lat Hostel',
    type: 'Girls',
    address: '200 Bad Lat St',
    city: 'Delhi',
    state: 'Delhi',
    pincode: '110001',
    contactPhone: '9876543211',
    contactEmail: 'badlat@test.com',
    latitude: 95,
    longitude: 77.0,
  }, managerToken1);

  assert(badLatRes.status === 400, `Invalid latitude rejected (${badLatRes.status})`);
  assert(
    badLatRes.data.message?.toLowerCase().includes('latitude'),
    `Error message mentions latitude: "${badLatRes.data.message}"`
  );

  // ── TEST 5: Invalid longitude ──
  console.log('\n--- Test 5: Invalid longitude rejected ---');
  const badLngRes = await apiRequest('POST', '/manager/hostels', {
    name: 'Bad Lng Hostel',
    type: 'Boys',
    address: '300 Bad Lng St',
    city: 'Chennai',
    state: 'Tamil Nadu',
    pincode: '600001',
    contactPhone: '9876543212',
    contactEmail: 'badlng@test.com',
    latitude: 13.0,
    longitude: -200,
  }, managerToken1);

  assert(badLngRes.status === 400, `Invalid longitude rejected (${badLngRes.status})`);
  assert(
    badLngRes.data.message?.toLowerCase().includes('longitude'),
    `Error message mentions longitude: "${badLngRes.data.message}"`
  );

  // ── TEST 6: Student sees approved hostel with location ──
  console.log('\n--- Test 6: Student sees approved hostel with location ---');

  // First, we need to approve the hostel. Need admin token.
  const adminLogin = await apiRequest('POST', '/auth/login', {
    email: 'admin@hostel.com',
    password: 'AdminPassword@123',
  });

  if (adminLogin.data.token) {
    // Approve the hostel
    await apiRequest('PUT', `/admin/hostels/${testHostelId}/approve`, {}, adminLogin.data.token);

    // Student fetches approved hostels
    const studentHostelsRes = await apiRequest('GET', '/student/hostels', null, studentToken);
    assert(studentHostelsRes.status === 200, 'Student can fetch approved hostels');

    const foundHostel = (Array.isArray(studentHostelsRes.data) ? studentHostelsRes.data : [])
      .find(h => h._id === testHostelId);

    assert(!!foundHostel, 'Approved hostel found in student list');
    assert(
      foundHostel?.location?.coordinates?.[0] === 77.209 &&
      foundHostel?.location?.coordinates?.[1] === 28.6139,
      'Student sees correct location coordinates'
    );

    // Student fetches single hostel detail
    const detailRes = await apiRequest('GET', `/student/hostels/${testHostelId}`, null, studentToken);
    assert(detailRes.status === 200, 'Student can fetch hostel detail');
    assert(
      detailRes.data?.location?.coordinates?.length === 2,
      'Location coordinates present in detail response'
    );
  } else {
    console.log('  ⚠️ SKIP — Admin login failed, cannot approve hostel for student test');
  }

  // ── TEST 7: Hostel without location still appears ──
  console.log('\n--- Test 7: Hostel without explicit location still appears ---');
  const noLocRes = await apiRequest('POST', '/manager/hostels', {
    name: 'Phase5 No-Location Hostel',
    type: 'Co-ed',
    address: '400 No Map St',
    city: 'Pune',
    state: 'Maharashtra',
    pincode: '411001',
    contactPhone: '9876543213',
    contactEmail: 'noloc@test.com',
    // No latitude/longitude provided
  }, managerToken1);

  testHostel2Id = noLocRes.data.hostel?._id;
  assert(noLocRes.status === 201, 'Hostel without explicit coords created');

  // Approve it
  if (adminLogin.data.token && testHostel2Id) {
    await apiRequest('PUT', `/admin/hostels/${testHostel2Id}/approve`, {}, adminLogin.data.token);

    const studentHostelsRes2 = await apiRequest('GET', '/student/hostels', null, studentToken);
    const foundNoLoc = (Array.isArray(studentHostelsRes2.data) ? studentHostelsRes2.data : [])
      .find(h => h._id === testHostel2Id);

    assert(!!foundNoLoc, 'Hostel without explicit coords still appears in approved list');
  }

  // ── TEST 8: Unapproved hostel not visible to student ──
  console.log('\n--- Test 8: Unapproved hostel not visible to student ---');
  const pendingRes = await apiRequest('POST', '/manager/hostels', {
    name: 'Phase5 Pending Hostel',
    type: 'Boys',
    address: '500 Pending St',
    city: 'Kolkata',
    state: 'West Bengal',
    pincode: '700001',
    contactPhone: '9876543214',
    contactEmail: 'pending@test.com',
    latitude: 22.5726,
    longitude: 88.3639,
  }, managerToken2);

  const pendingHostelId = pendingRes.data.hostel?._id;
  assert(pendingRes.status === 201, 'Pending hostel created');

  const studentSeesPending = await apiRequest('GET', '/student/hostels', null, studentToken);
  const foundPending = (Array.isArray(studentSeesPending.data) ? studentSeesPending.data : [])
    .find(h => h._id === pendingHostelId);

  assert(!foundPending, 'Unapproved hostel NOT visible to student');

  // ── TEST 9: Update with invalid lat on existing hostel ──
  console.log('\n--- Test 9: Update with invalid latitude rejected ---');
  const badUpdateLat = await apiRequest('PUT', `/manager/hostels/${testHostelId}`, {
    latitude: -100,
    longitude: 77.0,
  }, managerToken1);
  assert(badUpdateLat.status === 400, `Update with invalid lat rejected (${badUpdateLat.status})`);

  // ── TEST 10: Update with invalid lng on existing hostel ──
  console.log('\n--- Test 10: Update with invalid longitude rejected ---');
  const badUpdateLng = await apiRequest('PUT', `/manager/hostels/${testHostelId}`, {
    latitude: 28.0,
    longitude: 250,
  }, managerToken1);
  assert(badUpdateLng.status === 400, `Update with invalid lng rejected (${badUpdateLng.status})`);

  // ─── CLEANUP ───────────────────────────────────────────────────────
  console.log('\n--- Cleanup ---');
  if (testHostelId) await apiRequest('DELETE', `/manager/hostels/${testHostelId}`, null, managerToken1);
  if (testHostel2Id) await apiRequest('DELETE', `/manager/hostels/${testHostel2Id}`, null, managerToken1);
  if (pendingHostelId) await apiRequest('DELETE', `/manager/hostels/${pendingHostelId}`, null, managerToken2);

  // ─── SUMMARY ───────────────────────────────────────────────────────
  console.log(`\n${'='.repeat(50)}`);
  console.log(`PHASE 5 RESULTS: ${passed} passed, ${failed} failed, ${passed + failed} total`);
  console.log(`${'='.repeat(50)}\n`);

  if (failed > 0) process.exit(1);
}

runTests().catch((err) => {
  console.error('Test runner error:', err);
  process.exit(1);
});
