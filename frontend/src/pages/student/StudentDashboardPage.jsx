import React from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import { 
  Search, Building2, UserCheck, ShieldCheck, 
  Clock, MapPin, BedDouble, CalendarDays, 
  MessageSquareWarning, Home 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import DashboardCard from '../../components/DashboardCard';

const StudentDashboardPage = () => {
  const { user } = useAuth();
  const { accommodationState, accommodationBooking } = useOutletContext();

  const renderNoRoomDashboard = () => (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
            Welcome back, {user?.name || 'Student'}! 👋
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Ready to find your perfect hostel? Explore verified listings today.
          </p>
        </div>
        <Link to="/student/hostels">
          <button className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors shadow-lg shadow-violet-600/20">
            <Search className="w-4 h-4" />
            Discover Hostels
          </button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <DashboardCard
          title="Verified Hostels"
          value="Find Homes"
          icon={ShieldCheck}
          description="Browse approved listings"
          link="/student/hostels"
          color="violet"
        />
        <DashboardCard
          title="Amenities & Rooms"
          value="Explore"
          icon={Building2}
          description="Check live availability"
          link="/student/hostels"
          color="emerald"
        />
        <DashboardCard
          title="Student Support"
          value="24/7"
          icon={UserCheck}
          description="Secure platform"
          link="/student/hostels"
          color="cyan"
        />
      </div>

      <div className="bg-white/70 border border-white p-6 rounded-3xl shadow-sm">
        <h2 className="text-lg font-bold text-slate-800 mb-4">Getting Started</h2>
        <div className="space-y-4 text-sm text-slate-600">
          <p>
            Welcome to the Student Portal! Here you can discover various hostels approved by our administration.
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li>Navigate to <strong>Discover Hostels</strong> to browse through all available listings.</li>
            <li>Click on <strong>View Details</strong> on any hostel card to inspect the facilities and room availability.</li>
            <li>Check the live room availability status before planning your stay.</li>
          </ul>
        </div>
      </div>
    </div>
  );

  const renderPendingDashboard = () => (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="bg-amber-50 border border-amber-200 p-6 rounded-3xl shadow-sm flex items-start gap-4">
        <div className="p-3 bg-amber-100 text-amber-600 rounded-2xl shrink-0">
          <Clock className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-amber-900 tracking-tight mb-1">
            Booking Request Pending ⏳
          </h1>
          <p className="text-sm text-amber-700">
            Your room booking request is currently waiting for manager approval. We will notify you once it has been reviewed.
          </p>
        </div>
      </div>

      <div className="bg-white/70 border border-white p-6 sm:p-8 rounded-3xl shadow-sm space-y-6">
        <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
          <CalendarDays className="w-5 h-5 text-violet-500" />
          Request Details
        </h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Hostel</p>
            <p className="font-medium text-slate-800">{accommodationBooking?.hostel?.name}</p>
            <p className="text-sm text-slate-500 flex items-center gap-1 mt-1">
              <MapPin className="w-3.5 h-3.5" />
              {accommodationBooking?.hostel?.address}, {accommodationBooking?.hostel?.city}
            </p>
          </div>
          
          <div className="space-y-1">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Room</p>
            <p className="font-medium text-slate-800 flex items-center gap-2">
              <BedDouble className="w-4 h-4 text-slate-400" />
              Room {accommodationBooking?.room?.roomNumber}
            </p>
            <p className="text-sm text-slate-500 mt-1">
              {accommodationBooking?.room?.floor} • ₹{accommodationBooking?.room?.monthlyRent}/month
            </p>
          </div>

          <div className="space-y-1">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Requested On</p>
            <p className="font-medium text-slate-800">
              {new Date(accommodationBooking?.createdAt).toLocaleDateString(undefined, { 
                year: 'numeric', month: 'long', day: 'numeric' 
              })}
            </p>
          </div>
          
          <div className="space-y-1">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</p>
            <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-amber-100 text-amber-700">
              {accommodationBooking?.status}
            </span>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100">
          <Link to="/student/bookings">
            <button className="w-full sm:w-auto flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-900 text-white px-6 py-2.5 rounded-xl text-sm font-semibold transition-colors">
              <CalendarDays className="w-4 h-4" />
              View My Booking
            </button>
          </Link>
        </div>
      </div>
    </div>
  );

  const renderActiveResidentDashboard = () => (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
          Welcome to {accommodationBooking?.hostel?.name || 'your hostel'}, {user?.name || 'Student'}! 👋
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Here is a summary of your current accommodation.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Room Card */}
        <div className="bg-white/70 border border-white p-6 rounded-3xl shadow-sm flex flex-col h-full">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-violet-100 text-violet-600 rounded-2xl">
              <Home className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800 leading-tight">My Room</h2>
              <p className="text-sm font-medium text-violet-600">
                Room {accommodationBooking?.room?.roomNumber}
              </p>
            </div>
          </div>
          
          <div className="space-y-4 flex-1">
            {accommodationBooking?.room?.capacity !== undefined && (
              <div className="flex justify-between items-center py-2 border-b border-slate-100">
                <span className="text-sm text-slate-500">Capacity</span>
                <span className="text-sm font-medium text-slate-800">{accommodationBooking.room.capacity} Persons</span>
              </div>
            )}
            {accommodationBooking?.room?.occupiedBeds !== undefined && (
              <div className="flex justify-between items-center py-2 border-b border-slate-100">
                <span className="text-sm text-slate-500">Occupied</span>
                <span className="text-sm font-medium text-slate-800">{accommodationBooking.room.occupiedBeds}</span>
              </div>
            )}
            {accommodationBooking?.room?.availableBeds !== undefined && (
              <div className="flex justify-between items-center py-2 border-b border-slate-100">
                <span className="text-sm text-slate-500">Available</span>
                <span className="text-sm font-medium text-emerald-600">{accommodationBooking.room.availableBeds}</span>
              </div>
            )}
          </div>
          
          <div className="mt-6 pt-4 border-t border-slate-100">
            <Link to="/student/room">
              <button className="w-full bg-violet-50 hover:bg-violet-100 text-violet-700 py-2.5 rounded-xl text-sm font-semibold transition-colors">
                View My Room
              </button>
            </Link>
          </div>
        </div>

        {/* Hostel Card */}
        <div className="bg-white/70 border border-white p-6 rounded-3xl shadow-sm flex flex-col h-full">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-emerald-100 text-emerald-600 rounded-2xl">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800 leading-tight">Hostel Details</h2>
              <p className="text-sm font-medium text-emerald-600">
                {accommodationBooking?.hostel?.name}
              </p>
            </div>
          </div>
          
          <div className="space-y-4 flex-1">
            <div className="flex items-start gap-3">
              <MapPin className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm text-slate-800 font-medium">{accommodationBooking?.hostel?.address}</p>
                <p className="text-xs text-slate-500">{accommodationBooking?.hostel?.city}</p>
              </div>
            </div>
            {accommodationBooking?.hostel?.type && (
              <div className="flex items-center gap-3">
                <UserCheck className="w-4 h-4 text-slate-400 shrink-0" />
                <p className="text-sm text-slate-600">{accommodationBooking.hostel.type} Hostel</p>
              </div>
            )}
          </div>
        </div>

        {/* Complaints Card */}
        <div className="bg-white/70 border border-white p-6 rounded-3xl shadow-sm lg:col-span-2 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-rose-100 text-rose-600 rounded-2xl">
              <MessageSquareWarning className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">My Complaints</h2>
              <p className="text-sm text-slate-500">Manage your hostel complaints and issues.</p>
            </div>
          </div>
          <Link to="/student/complaints" className="w-full sm:w-auto">
            <button className="w-full bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 px-6 py-2.5 rounded-xl text-sm font-semibold transition-colors shadow-sm">
              View My Complaints
            </button>
          </Link>
        </div>
      </div>
    </div>
  );

  // Safe fallback if state is somehow undefined
  if (!accommodationState || accommodationState === 'NO_ROOM') {
    return renderNoRoomDashboard();
  }

  if (accommodationState === 'PENDING') {
    return renderPendingDashboard();
  }

  if (accommodationState === 'ACTIVE_RESIDENT') {
    return renderActiveResidentDashboard();
  }

  // Absolute fallback
  return renderNoRoomDashboard();
};

export default StudentDashboardPage;
