const BASE_AUTH = 'http://localhost:5000/api/auth';
const BASE_MANAGER = 'http://localhost:5000/api/manager';
const BASE_BOOKINGS = 'http://localhost:5000/api/bookings';

async function testFetch() {
  try {
    let res = await fetch(BASE_AUTH + '/login', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'vikram.manager@hostel.com', password: 'Password@123' }),
    });
    const managerToken = (await res.json()).token;

    let ts = Date.now();
    res = await fetch(BASE_AUTH + '/register', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'TestFetch', email: `test_${ts}@hostel.com`, phone: '123', password: 'Password@123', role: 'Student' }),
    });
    const studentToken = (await res.json()).token;

    res = await fetch(BASE_MANAGER + '/hostels', {
      method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + managerToken },
      body: JSON.stringify({ name: 'Fetch Hostel', type: 'Boys', address: 'A', city: 'B', state: 'C', pincode: '1', contactPhone: '1', contactEmail: '1@h.com' }),
    });
    const hostelData = await res.json();
    console.log('Hostel:', hostelData);
    const hostelId = hostelData.hostel._id;

    res = await fetch(BASE_MANAGER + '/hostels/' + hostelId + '/rooms', {
      method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + managerToken },
      body: JSON.stringify({ roomNumber: '101', capacity: 2, monthlyRent: 100, floor: '1', gender: 'Boys' }),
    });
    const roomData = await res.json();
    console.log('Room:', roomData);
    const roomId = roomData.room._id;

    res = await fetch(BASE_AUTH + '/login', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@hostel.com', password: 'AdminPassword@123' }),
    });
    const adminToken = (await res.json()).token;
    
    await fetch('http://localhost:5000/api/admin/hostels/' + hostelId + '/status', {
      method: 'PATCH', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + adminToken },
      body: JSON.stringify({ status: 'Approved' }),
    });

    res = await fetch(BASE_BOOKINGS, {
      method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + studentToken },
      body: JSON.stringify({ hostelId, roomId }),
    });
    let booking = await res.json();
    console.log('Booking created:', booking);
    let bookingId = booking._id;

    let appRes = await fetch(BASE_BOOKINGS + '/' + bookingId + '/status', {
      method: 'PATCH', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + managerToken },
      body: JSON.stringify({ status: 'Approved' }),
    });
    console.log('Approve result:', await appRes.json());

    res = await fetch(BASE_BOOKINGS + '/student/status', {
      method: 'GET', headers: { Authorization: 'Bearer ' + studentToken },
    });
    const statusData = await res.json();
    
    console.log('STATUS:', JSON.stringify(statusData, null, 2));

  } catch (error) {
    console.error(error);
  }
}

testFetch();
