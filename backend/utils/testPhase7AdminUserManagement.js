require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const API_URL = 'http://localhost:5000/api';

const apiRequest = async (method, endpoint, data = null, token = null) => {
  try {
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const config = { method, headers };
    if (data) config.body = JSON.stringify(data);

    const response = await fetch(`${API_URL}${endpoint}`, config);
    let responseData = {};
    try {
      responseData = await response.json();
    } catch(e) {}
    
    return { status: response.status, data: responseData };
  } catch (error) {
    return { status: 500, data: { message: error.message } };
  }
};

const assert = (condition, message) => {
  if (!condition) {
    console.error(`  ❌ FAIL — ${message}`);
    process.exit(1);
  } else {
    console.log(`  ✅ PASS — ${message}`);
  }
};

let passCount = 0;
let failCount = 0;
const testAssert = (condition, message) => {
  if (!condition) {
    console.error(`  ❌ FAIL — ${message}`);
    failCount++;
  } else {
    console.log(`  ✅ PASS — ${message}`);
    passCount++;
  }
};

const runTests = async () => {
  console.log('\n=== PHASE 7 — ADMIN USER MANAGEMENT TESTS ===\n');

  try {
    // We'll create fresh users for isolation
    const studentData = {
      name: 'Phase7 Student',
      email: `p7student_${Date.now()}@test.com`,
      password: 'password123',
      phone: '1234567890'
    };
    const managerData = {
      name: 'Phase7 Manager',
      email: `p7manager_${Date.now()}@test.com`,
      password: 'password123',
      phone: '0987654321',
      role: 'Hostel Manager'
    };

    console.log('--- Setup: Register test users ---');
    const stuRes = await apiRequest('POST', '/auth/register', studentData);
    assert(stuRes.status === 201, 'Student registered');
    const studentToken = stuRes.data.token;
    const studentId = stuRes.data._id;

    const mgrRes = await apiRequest('POST', '/auth/register', managerData);
    assert(mgrRes.status === 201, 'Manager registered');
    const managerToken = mgrRes.data.token;
    const managerId = mgrRes.data._id;

    // Fetch admin token via API
    let adminToken;
    let adminId;
    const adminLogin = await apiRequest('POST', '/auth/login', {
      email: 'admin@hostel.com',
      password: 'AdminPassword@123',
    });
    adminToken = adminLogin.data.token;
    adminId = adminLogin.data._id;
    assert(!!adminToken, 'Admin logged in');

    console.log('\n--- 1, 2, 3, 4. Admin can fetch users safely ---');
    const stuListRes = await apiRequest('GET', '/admin/students', null, adminToken);
    testAssert(stuListRes.status === 200, 'Admin can fetch Students');
    testAssert(stuListRes.data.students.length > 0, 'Admin can see Students');
    testAssert(stuListRes.data.students.some(s => s._id === studentId), 'Test student is in the list');
    testAssert(stuListRes.data.students[0].password === undefined, 'Password hashes are NOT returned for students');

    const mgrListRes = await apiRequest('GET', '/admin/managers', null, adminToken);
    testAssert(mgrListRes.status === 200, 'Admin can fetch Hostel Managers');
    testAssert(mgrListRes.data.managers.length > 0, 'Admin can see Hostel Managers');
    testAssert(mgrListRes.data.managers[0].password === undefined, 'Password hashes are NOT returned for managers');

    console.log('\n--- 5, 6. Role Protection for User Lists ---');
    const s1 = await apiRequest('GET', '/admin/students', null, studentToken);
    testAssert(s1.status === 403, 'Student cannot access Admin student list');
    const m1 = await apiRequest('GET', '/admin/managers', null, managerToken);
    testAssert(m1.status === 403, 'Hostel Manager cannot access Admin manager list');

    console.log('\n--- 15, 16, 17. Role Protection for Activation/Deactivation ---');
    const s2 = await apiRequest('PATCH', `/admin/users/${studentId}/status`, { isActive: false }, studentToken);
    testAssert(s2.status === 403, 'Student cannot deactivate users');
    const m2 = await apiRequest('PATCH', `/admin/users/${studentId}/status`, { isActive: false }, managerToken);
    testAssert(m2.status === 403, 'Manager cannot deactivate users');
    const noAuth = await apiRequest('PATCH', `/admin/users/${studentId}/status`, { isActive: false });
    testAssert(noAuth.status === 401, 'Non-admin cannot activate/deactivate users');

    console.log('\n--- 7, 8, 21. Deactivate Student & Login Block ---');
    const d1 = await apiRequest('PATCH', `/admin/users/${studentId}/status`, { isActive: false }, adminToken);
    testAssert(d1.status === 200, `Admin can deactivate a Student (Status: ${d1.status}, Msg: ${d1.data.error || d1.data.message})`);
    if (d1.status === 200) {
      testAssert(d1.data.user.isActive === false, 'Student isActive is false');
      testAssert(d1.data.user.role === 'Student', 'Admin cannot change a user\'s role through the status endpoint (19)');
    }
    
    // Student tries to login
    const l1 = await apiRequest('POST', '/auth/login', { email: studentData.email, password: studentData.password });
    testAssert(l1.status === 401, 'Deactivated Student cannot login');
    
    // Student tries to use old JWT
    const p1 = await apiRequest('GET', '/auth/me', null, studentToken);
    testAssert(p1.status === 401, 'Deactivated user with an old JWT cannot access protected APIs (21)');

    console.log('\n--- 9, 10. Reactivate Student & Login Check ---');
    const r1 = await apiRequest('PATCH', `/admin/users/${studentId}/status`, { isActive: true }, adminToken);
    testAssert(r1.status === 200, `Admin can reactivate the Student (Status: ${r1.status}, Msg: ${r1.data.error || r1.data.message})`);
    
    const l2 = await apiRequest('POST', '/auth/login', { email: studentData.email, password: studentData.password });
    testAssert(l2.status === 200, 'Reactivated Student can login');

    console.log('\n--- 11, 12. Deactivate Hostel Manager & Login Block ---');
    const d2 = await apiRequest('PATCH', `/admin/users/${managerId}/status`, { isActive: false }, adminToken);
    testAssert(d2.status === 200, `Admin can deactivate a Hostel Manager (Status: ${d2.status}, Msg: ${d2.data.error || d2.data.message})`);
    
    const l3 = await apiRequest('POST', '/auth/login', { email: managerData.email, password: managerData.password });
    testAssert(l3.status === 401, 'Deactivated Manager cannot login');

    console.log('\n--- 13, 14. Reactivate Hostel Manager & Login Check ---');
    const r2 = await apiRequest('PATCH', `/admin/users/${managerId}/status`, { isActive: true }, adminToken);
    testAssert(r2.status === 200, `Admin can reactivate the Manager (Status: ${r2.status}, Msg: ${r2.data.error || r2.data.message})`);
    
    const l4 = await apiRequest('POST', '/auth/login', { email: managerData.email, password: managerData.password });
    testAssert(l4.status === 200, 'Reactivated Manager can login');

    console.log('\n--- 22, 23, 24, 25. Additional Rules ---');
    // 22. Admin remains able to access system
    const a1 = await apiRequest('GET', '/auth/me', null, adminToken);
    testAssert(a1.status === 200, 'Admin remains able to access the system');
    
    // 23. Public registration cannot create admin
    const a2 = await apiRequest('POST', '/auth/register', { name: 'Admin', email: 'adminhack@x.com', password: 'pwd', phone: '12', role: 'Admin' });
    testAssert(a2.status === 403, 'Public registration cannot create an Admin');
    
    // 24. Invalid user IDs
    const inv1 = await apiRequest('PATCH', '/admin/users/123/status', { isActive: false }, adminToken);
    testAssert(inv1.status === 500 || inv1.status === 400 || inv1.status === 404, 'Invalid user IDs are handled safely');
    
    // 25. Attempting to modify unsupported role (Admin modifying Admin)
    const admMod = await apiRequest('PATCH', `/admin/users/${adminId}/status`, { isActive: false }, adminToken);
    testAssert(admMod.status === 403, 'Attempting to modify an unsupported role is rejected (Admin cannot deactivate Admin)');

    console.log('\n==================================================');
    console.log(`PHASE 7 RESULTS: ${passCount} passed, ${failCount} failed, ${passCount + failCount} total`);
    console.log('==================================================\n');

  } catch (err) {
    console.error('Fatal error during tests:', err);
  } finally {
    process.exit(failCount > 0 ? 1 : 0);
  }
};

runTests();
