import React, { useState } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import {
  Search,
  Building2,
  UserCheck,
  ShieldCheck,
  Clock,
  MapPin,
  BedDouble,
  CalendarDays,
  MessageSquareWarning,
  Home,
  CheckCircle2,
  Info,
  Lock,
  IndianRupee,
  Phone,
  LogOut,
  X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { bookingService } from '../../services/bookingService';
import DashboardCard from '../../components/DashboardCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import Toast from '../../components/Toast';

const StudentDashboardPage = () => {
  const { user } = useAuth();
  const { accommodationState, accommodationBooking, refreshStatus } = useOutletContext() || {};

  // Leave Request Modal State
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [leaveReason, setLeaveReason] = useState('');
  const [isSubmittingLeave, setIsSubmittingLeave] = useState(false);
  const [toast, setToast] = useState(null);

  const handleRequestLeave = async (e) => {
    e.preventDefault();
    if (!leaveReason.trim()) {
      setToast({ type: 'error', message: 'Please provide a valid reason for leaving the hostel.' });
      return;
    }

    try {
      setIsSubmittingLeave(true);
      await bookingService.requestLeave(leaveReason.trim());
      setToast({ type: 'success', message: 'Leave request submitted successfully! Waiting for manager approval.' });
      setShowLeaveModal(false);
      setLeaveReason('');
      if (refreshStatus) {
        await refreshStatus();
      }
    } catch (err) {
      setToast({
        type: 'error',
        message: err.response?.data?.message || 'Failed to submit leave request.',
      });
    } finally {
      setIsSubmittingLeave(false);
    }
  };

  // ==========================================
  // STATE 1 — NO ROOM (Student has no room)
  // ==========================================
  const renderNoRoomDashboard = () => (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white/70 backdrop-blur-xl border border-white p-6 sm:p-8 rounded-3xl shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-violet-100 text-violet-700 mb-1">
            <Info className="w-3.5 h-3.5" /> No Active Accommodation
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight">
            Welcome back, {user?.name || 'Student'}! 👋
          </h1>
          <p className="text-sm text-slate-500 max-w-xl">
            You do not have an active hostel accommodation yet. Explore verified listings and request a room that fits your needs.
          </p>
        </div>

        <Link to="/student/hostels" className="shrink-0">
          <button className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white px-5 py-3 rounded-2xl text-sm font-semibold transition-all shadow-lg shadow-violet-600/25 active:scale-95 cursor-pointer">
            <Search className="w-4 h-4" />
            Explore Hostels
          </button>
        </Link>
      </div>

      {/* Discovery Quick Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <DashboardCard
          title="Verified Hostels"
          value="Explore All"
          icon={ShieldCheck}
          description="Browse admin approved hostels"
          link="/student/hostels"
          color="violet"
        />
        <DashboardCard
          title="Amenities & Rooms"
          value="Live Status"
          icon={Building2}
          description="Check available beds & pricing"
          link="/student/hostels"
          color="emerald"
        />
        <DashboardCard
          title="Student Support"
          value="24/7 Platform"
          icon={UserCheck}
          description="Direct manager contact"
          link="/student/hostels"
          color="cyan"
        />
      </div>

      {/* Booking Guidance Box */}
      <div className="bg-white/70 backdrop-blur-xl border border-white p-6 sm:p-8 rounded-3xl shadow-sm space-y-4">
        <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
          <Info className="w-5 h-5 text-violet-500" />
          How Hostel Booking Works
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          <div className="bg-rose-50/50 border border-rose-100/80 p-4 rounded-2xl space-y-2">
            <span className="w-7 h-7 rounded-xl bg-violet-500 text-white font-bold text-xs flex items-center justify-center">1</span>
            <h3 className="font-bold text-sm text-slate-800">Discover Hostels</h3>
            <p className="text-xs text-slate-500 leading-relaxed">Filter by city, rent, gender category, and amenities to find the right hostel.</p>
          </div>
          <div className="bg-rose-50/50 border border-rose-100/80 p-4 rounded-2xl space-y-2">
            <span className="w-7 h-7 rounded-xl bg-teal-500 text-white font-bold text-xs flex items-center justify-center">2</span>
            <h3 className="font-bold text-sm text-slate-800">Select an Available Room</h3>
            <p className="text-xs text-slate-500 leading-relaxed">Choose a room with available bed capacity and click "Request Booking".</p>
          </div>
          <div className="bg-rose-50/50 border border-rose-100/80 p-4 rounded-2xl space-y-2">
            <span className="w-7 h-7 rounded-xl bg-cyan-500 text-white font-bold text-xs flex items-center justify-center">3</span>
            <h3 className="font-bold text-sm text-slate-800">Manager Approval</h3>
            <p className="text-xs text-slate-500 leading-relaxed">The hostel manager reviews your request and approves your room allocation.</p>
          </div>
        </div>
      </div>
    </div>
  );

  // ==========================================
  // STATE 2 — PENDING BOOKING (Waiting Manager Approval)
  // ==========================================
  const renderPendingDashboard = () => (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Pending Banner Alert */}
      <div className="bg-amber-500/10 border border-amber-500/20 p-6 sm:p-8 rounded-3xl shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-amber-500 text-white rounded-2xl shrink-0 shadow-lg shadow-amber-500/20">
            <Clock className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 mb-1">
              STATUS: PENDING APPROVAL
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-amber-950 tracking-tight">
              Booking Request Submitted ⏳
            </h1>
            <p className="text-xs sm:text-sm text-amber-800/90 mt-1 leading-relaxed">
              Your room booking request is currently waiting for hostel manager approval. We will update your status as soon as it is reviewed.
            </p>
          </div>
        </div>
      </div>

      {/* Pending Details Card */}
      <div className="bg-white/70 backdrop-blur-xl border border-white p-6 sm:p-8 rounded-3xl shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-amber-500" />
            Pending Booking Summary
          </h2>
          <span className="px-3 py-1 rounded-xl text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
            Pending Approval
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
          <div className="space-y-1">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Hostel Name</p>
            <p className="font-bold text-slate-800 text-base">{accommodationBooking?.hostel?.name}</p>
            {accommodationBooking?.hostel?.address && (
              <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                <MapPin className="w-3.5 h-3.5 text-violet-400" />
                {accommodationBooking.hostel.address}, {accommodationBooking.hostel.city}
              </p>
            )}
          </div>

          <div className="space-y-1">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Requested Room</p>
            <p className="font-bold text-slate-800 text-base flex items-center gap-2">
              <BedDouble className="w-4 h-4 text-violet-500" />
              Room {accommodationBooking?.room?.roomNumber}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              {accommodationBooking?.room?.floor && `${accommodationBooking.room.floor} • `}
              ₹{accommodationBooking?.room?.monthlyRent}/month
            </p>
          </div>

          <div className="space-y-1">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Request Date</p>
            <p className="font-medium text-slate-800">
              {accommodationBooking?.createdAt
                ? new Date(accommodationBooking.createdAt).toLocaleDateString(undefined, {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })
                : 'N/A'}
            </p>
          </div>

          <div className="space-y-1">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Hostel Type</p>
            <p className="font-medium text-slate-800">
              {accommodationBooking?.hostel?.type ? `${accommodationBooking.hostel.type} Hostel` : 'General'}
            </p>
          </div>
        </div>

        {/* Lock Notice preventing double bookings */}
        <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-start gap-3 text-xs text-amber-900">
          <Lock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <p>
            <strong>Note:</strong> You cannot submit additional room booking requests while your current request is pending manager review.
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row gap-3">
          <Link to="/student/bookings" className="flex-1">
            <button className="w-full flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-900 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer">
              <CalendarDays className="w-4 h-4" />
              View My Bookings History
            </button>
          </Link>
          <Link to="/student/hostels" className="flex-1">
            <button className="w-full flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-5 py-2.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer">
              <Search className="w-4 h-4" />
              Browse Hostels
            </button>
          </Link>
        </div>
      </div>
    </div>
  );

  // ==========================================
  // STATE 3 — ACTIVE RESIDENT (Approved Room Allocation)
  // ==========================================
  const renderActiveResidentDashboard = () => {
    const hostel = accommodationBooking?.hostel;
    const room = accommodationBooking?.room;
    const manager = hostel?.manager;

    return (
      <div className="space-y-6">
        {accommodationBooking?.status === 'Leave_Requested' && (
          <div className="bg-amber-500/10 border border-amber-500/20 p-6 sm:p-8 rounded-3xl shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-amber-500 text-white rounded-2xl shrink-0 shadow-lg shadow-amber-500/20">
                <Clock className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 mb-1">
                  STATUS: LEAVE REQUEST PENDING
                </div>
                <h1 className="text-xl sm:text-2xl font-bold text-amber-950 tracking-tight">
                  Leave Request Pending Approval ⏳
                </h1>
                <p className="text-xs sm:text-sm text-amber-800/90 mt-1 leading-relaxed">
                  Your request to leave the hostel has been submitted with reason: <strong>"{accommodationBooking?.leaveReason || 'No reason provided'}"</strong>. Please wait for your hostel manager to review and approve your request.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Welcome Resident Header */}
        <div className="bg-white/70 backdrop-blur-xl border border-white p-6 sm:p-8 rounded-3xl shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 mb-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Active Resident
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight">
              Welcome to {hostel?.name || 'your hostel'}, {user?.name || 'Student'}! 👋
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Here is your active accommodation summary and room details.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {accommodationBooking?.status !== 'Leave_Requested' && (
              <button
                onClick={() => setShowLeaveModal(true)}
                className="flex items-center gap-2 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                Request to Leave Hostel
              </button>
            )}
            <Link to="/student/room">
              <button className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md shadow-violet-600/20 cursor-pointer">
                <Home className="w-4 h-4" />
                Manage My Room
              </button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Room Allocation Info Card */}
          <div className="bg-white/70 backdrop-blur-xl border border-white p-6 rounded-3xl shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-violet-100 text-violet-600 rounded-2xl">
                  <BedDouble className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-800 leading-tight">Room Allocation</h2>
                  <p className="text-xs font-bold text-violet-600 uppercase tracking-wider">
                    Room {room?.roomNumber}
                  </p>
                </div>
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex justify-between items-center py-2 border-b border-slate-100">
                  <span className="text-slate-500">Room Number</span>
                  <span className="font-bold text-slate-800">Room {room?.roomNumber}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-100">
                  <span className="text-slate-500">Floor</span>
                  <span className="font-semibold text-slate-800">{room?.floor || 'N/A'}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-100">
                  <span className="text-slate-500">Room Category / Type</span>
                  <span className="font-semibold text-slate-800">{room?.gender || hostel?.type || 'Standard'}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-100">
                  <span className="text-slate-500">Monthly Rent</span>
                  <span className="font-bold text-emerald-600 flex items-center">
                    <IndianRupee className="w-3 h-3" />
                    {room?.monthlyRent}/mo
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-100">
                  <span className="text-slate-500">Status</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-700">
                    Active Allotment
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100">
              <Link to="/student/room">
                <button className="w-full bg-violet-50 hover:bg-violet-100 text-violet-700 py-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer">
                  View Full Room Specs
                </button>
              </Link>
            </div>
          </div>

          {/* Hostel Info Card */}
          <div className="bg-white/70 backdrop-blur-xl border border-white p-6 rounded-3xl shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-emerald-100 text-emerald-600 rounded-2xl">
                  <Building2 className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-800 leading-tight">Hostel Details</h2>
                  <p className="text-xs font-bold text-emerald-600 truncate">
                    {hostel?.name}
                  </p>
                </div>
              </div>

              <div className="space-y-4 text-xs">
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm text-slate-800 font-semibold">{hostel?.address}</p>
                    <p className="text-xs text-slate-500">{hostel?.city}, {hostel?.state} - {hostel?.pincode}</p>
                  </div>
                </div>

                {hostel?.type && (
                  <div className="flex items-center gap-3">
                    <UserCheck className="w-4 h-4 text-slate-400 shrink-0" />
                    <p className="text-slate-600 font-medium">{hostel.type} Hostel</p>
                  </div>
                )}

                {manager && (
                  <div className="p-3 bg-rose-50/50 rounded-xl border border-rose-50/80 space-y-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Manager Contact</p>
                    <p className="font-bold text-slate-800">{manager.name}</p>
                    {manager.phone && (
                      <p className="text-slate-500 flex items-center gap-1">
                        <Phone className="w-3 h-3 text-emerald-500" /> {manager.phone}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Complaints Section (Prepared for future complaints phase) */}
          <div className="bg-white/70 backdrop-blur-xl border border-white p-6 rounded-3xl shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-rose-100 text-rose-600 rounded-2xl">
                  <MessageSquareWarning className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-800 leading-tight">My Complaints</h2>
                  <p className="text-xs font-medium text-rose-500">Student Issue Portal</p>
                </div>
              </div>

              <p className="text-xs text-slate-500 leading-relaxed">
                Facing maintenance issues, cleanliness problems, or amenity concerns in your room? File a complaint directly to your manager.
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100">
              <Link to="/student/complaints">
                <button className="w-full bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 py-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer">
                  File / View Complaints
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      {(!accommodationState || accommodationState === 'NO_ROOM') && renderNoRoomDashboard()}
      {accommodationState === 'PENDING' && renderPendingDashboard()}
      {accommodationState === 'ACTIVE_RESIDENT' && renderActiveResidentDashboard()}

      {/* Leave Request Confirmation Modal */}
      {showLeaveModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-white animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 text-rose-600">
                <LogOut className="w-5 h-5" />
                <h3 className="font-bold text-slate-800">Request to Leave Hostel</h3>
              </div>
              <button
                onClick={() => setShowLeaveModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRequestLeave} className="space-y-4">
              <p className="text-xs text-slate-600 leading-relaxed">
                Please state your reason for leaving <strong>{accommodationBooking?.hostel?.name}</strong> (Room {accommodationBooking?.room?.roomNumber}). A reason is required for your manager to review.
              </p>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  Reason for Leaving <span className="text-rose-500">*</span>
                </label>
                <textarea
                  value={leaveReason}
                  onChange={(e) => setLeaveReason(e.target.value)}
                  placeholder="e.g. Moving to another hostel closer to my college..."
                  rows="3"
                  required
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-rose-400 focus:ring-1 focus:ring-rose-400 transition-colors"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowLeaveModal(false)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingLeave || !leaveReason.trim()}
                  className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-rose-600/20 cursor-pointer flex items-center justify-center gap-1.5"
                >
                  {isSubmittingLeave ? (
                    <LoadingSpinner size="sm" className="text-white" />
                  ) : (
                    'Submit Request'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}
    </>
  );
};

export default StudentDashboardPage;
