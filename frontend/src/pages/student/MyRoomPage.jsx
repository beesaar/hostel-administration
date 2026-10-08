import React from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import { 
  Building2, Home, UserCircle, 
  MapPin, CheckCircle2, Phone, Mail, 
  Search, CalendarDays, BedDouble, Info
} from 'lucide-react';

const MyRoomPage = () => {
  const { accommodationState, accommodationBooking } = useOutletContext();

  // Guard Clauses for Incorrect States
  if (!accommodationState || accommodationState === 'NO_ROOM') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center space-y-4">
        <div className="p-4 bg-slate-100 text-slate-400 rounded-full mb-2">
          <Home className="w-10 h-10" />
        </div>
        <h1 className="text-2xl font-bold text-slate-800">No Assigned Room</h1>
        <p className="text-slate-500 max-w-md">
          You don't have an active room assignment yet. Explore verified hostels to request a booking.
        </p>
        <Link to="/student/hostels" className="mt-4 inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white px-6 py-2.5 rounded-xl text-sm font-semibold transition-colors shadow-lg shadow-violet-600/20">
          <Search className="w-4 h-4" />
          Discover Hostels
        </Link>
      </div>
    );
  }

  if (accommodationState === 'PENDING') {
    const pendingHostel = accommodationBooking?.hostel;
    const pendingRoom = accommodationBooking?.room;
    const pendingManager = pendingHostel?.manager;

    return (
      <div className="space-y-6 max-w-5xl mx-auto">
        <div className="flex flex-col items-center justify-center text-center space-y-4">
          <div className="p-4 bg-amber-100 text-amber-500 rounded-full">
            <CalendarDays className="w-10 h-10" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Booking Pending</h1>
            <p className="text-slate-500 max-w-md">
              Your room booking is still awaiting manager approval.
            </p>
          </div>
          <Link to="/student/bookings" className="inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-900 text-white px-6 py-2.5 rounded-xl text-sm font-semibold transition-colors">
            <CalendarDays className="w-4 h-4" />
            View My Booking
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white/70 border border-white p-6 rounded-3xl shadow-sm">
            <h2 className="text-xl font-bold text-slate-800 mb-5 flex items-center gap-3">
              <Building2 className="w-5 h-5 text-emerald-600" />
              Hostel Information
            </h2>
            <div className="space-y-4 text-sm">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Hostel Name</p>
                <p className="text-lg font-bold text-slate-800">{pendingHostel?.name || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Address</p>
                <p className="text-slate-700">{pendingHostel?.address || 'N/A'}</p>
                <p className="text-slate-500">
                  {pendingHostel?.city || ''}{pendingHostel?.state ? `, ${pendingHostel.state}` : ''}{pendingHostel?.pincode ? ` - ${pendingHostel.pincode}` : ''}
                </p>
              </div>
              {pendingHostel?.type && (
                <p><span className="text-slate-400">Type: </span><span className="font-semibold text-slate-700">{pendingHostel.type} Hostel</span></p>
              )}
              {pendingHostel?.contactPhone && (
                <a href={`tel:${pendingHostel.contactPhone}`} className="block text-violet-700 hover:text-violet-800 font-medium">
                  Phone: {pendingHostel.contactPhone}
                </a>
              )}
              {pendingHostel?.contactEmail && (
                <a href={`mailto:${pendingHostel.contactEmail}`} className="block text-violet-700 hover:text-violet-800 break-all">
                  Email: {pendingHostel.contactEmail}
                </a>
              )}
            </div>
          </div>

          <div className="bg-slate-800 border border-slate-700 p-6 rounded-3xl text-white shadow-lg shadow-slate-800/20">
            <h2 className="text-xl font-bold mb-5 flex items-center gap-3">
              <UserCircle className="w-5 h-5 text-violet-400" />
              Hostel Manager
            </h2>
            <div className="space-y-4 text-sm">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Name</p>
                <p className="font-semibold">{pendingManager?.name || 'Contact Administration'}</p>
              </div>
              {pendingManager?.phone && (
                <a href={`tel:${pendingManager.phone}`} className="flex items-center gap-2 text-violet-300 hover:text-white">
                  <Phone className="w-4 h-4" /> {pendingManager.phone}
                </a>
              )}
              {pendingManager?.email && (
                <a href={`mailto:${pendingManager.email}`} className="flex items-center gap-2 text-violet-300 hover:text-white break-all">
                  <Mail className="w-4 h-4" /> {pendingManager.email}
                </a>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white/70 border border-white p-6 rounded-3xl shadow-sm">
          <h2 className="text-xl font-bold text-slate-800 mb-5">Requested Room</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
            <div><p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Room Number</p><p className="font-semibold text-slate-800">{pendingRoom?.roomNumber || 'N/A'}</p></div>
            <div><p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Floor</p><p className="font-semibold text-slate-800">{pendingRoom?.floor || 'N/A'}</p></div>
            <div><p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Monthly Rent</p><p className="font-semibold text-slate-800">₹{pendingRoom?.monthlyRent || 'N/A'}</p></div>
          </div>
        </div>
      </div>
    );
  }

  // Active Resident State Variables
  const hostel = accommodationBooking?.hostel;
  const room = accommodationBooking?.room;
  const manager = hostel?.manager;
  
  // Format Facilities if it's an array or string
  const facilities = Array.isArray(hostel?.facilities) 
    ? hostel.facilities 
    : typeof hostel?.facilities === 'string' 
      ? hostel.facilities.split(',').map(s => s.trim())
      : [];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
          My Room
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Your current accommodation details
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* ROOM INFORMATION COLUMN */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white/70 border border-white p-6 sm:p-8 rounded-3xl shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-3">
                <div className="p-2 bg-violet-100 text-violet-600 rounded-xl">
                  <BedDouble className="w-5 h-5" />
                </div>
                Room Information
              </h2>
              {room?.status && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700">
                  {room.status}
                </span>
              )}
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-8">
              {room?.roomNumber && (
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Room Number</p>
                  <p className="text-lg font-semibold text-slate-800">{room.roomNumber}</p>
                </div>
              )}
              {room?.floor && (
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Floor</p>
                  <p className="text-lg font-semibold text-slate-800">{room.floor}</p>
                </div>
              )}
              {room?.capacity !== undefined && (
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Capacity</p>
                  <p className="text-base font-medium text-slate-800">{room.capacity} Persons</p>
                </div>
              )}
              {room?.occupiedBeds !== undefined && (
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Occupied Beds</p>
                  <p className="text-base font-medium text-slate-800">{room.occupiedBeds}</p>
                </div>
              )}
              {room?.availableBeds !== undefined && (
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Available Beds</p>
                  <p className="text-base font-medium text-emerald-600">{room.availableBeds}</p>
                </div>
              )}
              {room?.monthlyRent !== undefined && (
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Monthly Rent</p>
                  <p className="text-base font-medium text-slate-800">₹{room.monthlyRent}</p>
                </div>
              )}
              {room?.AC !== undefined && (
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Air Conditioning</p>
                  <p className="text-base font-medium text-slate-800">{room.AC ? 'Yes' : 'No'}</p>
                </div>
              )}
              {room?.attachedBathroom !== undefined && (
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Attached Bathroom</p>
                  <p className="text-base font-medium text-slate-800">{room.attachedBathroom ? 'Yes' : 'No'}</p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white/70 border border-white p-6 sm:p-8 rounded-3xl shadow-sm">
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-3 border-b border-slate-100 pb-4 mb-6">
              <div className="p-2 bg-emerald-100 text-emerald-600 rounded-xl">
                <Building2 className="w-5 h-5" />
              </div>
              Hostel Information
            </h2>
            
            <div className="space-y-6">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Hostel Name</p>
                <p className="text-lg font-bold text-slate-800">{hostel?.name}</p>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Address</p>
                  <div className="flex items-start gap-2 mt-1">
                    <MapPin className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-base font-medium text-slate-800">{hostel?.address}</p>
                      <p className="text-sm text-slate-500">
                        {hostel?.city}{hostel?.state ? `, ${hostel.state}` : ''}{hostel?.pincode ? ` - ${hostel.pincode}` : ''}
                      </p>
                    </div>
                  </div>
                </div>
                {hostel?.type && (
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Hostel Type</p>
                    <p className="text-base font-medium text-slate-800">{hostel.type} Hostel</p>
                  </div>
                )}
                {hostel?.contactPhone && (
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Hostel Contact</p>
                    <a href={`tel:${hostel.contactPhone}`} className="text-base font-medium text-violet-700 hover:text-violet-800">
                      {hostel.contactPhone}
                    </a>
                  </div>
                )}
                {hostel?.contactEmail && (
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Hostel Email</p>
                    <a href={`mailto:${hostel.contactEmail}`} className="text-base font-medium text-violet-700 hover:text-violet-800 break-all">
                      {hostel.contactEmail}
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {facilities.length > 0 && (
            <div className="bg-white/70 border border-white p-6 rounded-3xl shadow-sm">
              <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                Hostel Facilities
              </h2>
              <ul className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {facilities.map((fac, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-sm text-slate-700">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                    {fac}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* SIDEBAR COLUMN */}
        <div className="space-y-6">
          <div className="bg-slate-800 border border-slate-700 p-6 rounded-3xl shadow-lg shadow-slate-800/20 text-white">
            <h2 className="text-lg font-bold mb-6 flex items-center gap-3">
              <div className="p-2 bg-slate-700 rounded-xl text-violet-400">
                <UserCircle className="w-5 h-5" />
              </div>
              Hostel Manager
            </h2>
            
            <div className="space-y-6">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Name</p>
                <p className="text-base font-semibold">{manager?.name || 'Contact Administration'}</p>
              </div>
              
              <div className="space-y-3">
                {manager?.phone && (
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Phone</p>
                    <a 
                      href={`tel:${manager.phone}`}
                      className="flex items-center justify-center gap-2 w-full py-2.5 bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl text-sm font-semibold transition-colors"
                    >
                      <Phone className="w-4 h-4" />
                      {manager.phone}
                    </a>
                  </div>
                )}
                
                {manager?.email && (
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 mt-4">Email</p>
                    <a 
                      href={`mailto:${manager.email}`}
                      className="flex items-center justify-center gap-2 w-full py-2.5 bg-violet-600 hover:bg-violet-500 border border-violet-500/50 rounded-xl text-sm font-semibold transition-colors"
                    >
                      <Mail className="w-4 h-4" />
                      Email Manager
                    </a>
                  </div>
                )}
                {(hostel?.contactPhone || hostel?.contactEmail) && (
                  <div className="pt-2 border-t border-white/10">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Hostel Contact</p>
                    {hostel.contactPhone && (
                      <a href={`tel:${hostel.contactPhone}`} className="block text-sm text-violet-300 hover:text-white">
                        {hostel.contactPhone}
                      </a>
                    )}
                    {hostel.contactEmail && (
                      <a href={`mailto:${hostel.contactEmail}`} className="block text-sm text-violet-300 hover:text-white break-all">
                        {hostel.contactEmail}
                      </a>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="bg-violet-50 border border-violet-100 p-5 rounded-3xl">
            <div className="flex gap-3">
              <Info className="w-5 h-5 text-violet-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-violet-900 mb-1">Need help with your room?</p>
                <p className="text-xs text-violet-700 mb-3">If you are facing maintenance issues or problems in your room, you can file a complaint directly to your manager.</p>
                <Link to="/student/complaints" className="text-xs font-bold text-violet-700 hover:text-violet-800 underline">
                  File a Complaint →
                </Link>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default MyRoomPage;
