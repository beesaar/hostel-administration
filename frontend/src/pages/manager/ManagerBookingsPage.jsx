import React, { useState, useEffect, useMemo } from 'react';
import {
  CalendarDays,
  User,
  Building2,
  CheckCircle,
  XCircle,
  Clock,
  MessageSquare,
  Search,
  RotateCcw,
  IndianRupee,
  Phone,
  Mail,
  DoorOpen,
  BedDouble,
  LogOut,
  X,
  AlertTriangle,
} from 'lucide-react';
import { bookingService } from '../../services/bookingService';
import LoadingSpinner from '../../components/LoadingSpinner';
import Toast from '../../components/Toast';

const STATUS_FILTERS = ['All', 'Pending', 'Approved', 'Leave_Requested', 'Rejected', 'Cancelled'];

const STATUS_LABELS = {
  Pending: 'Pending',
  Approved: 'Approved',
  Rejected: 'Rejected',
  Cancelled: 'Cancelled',
  Leave_Requested: 'Leave Request',
  Completed: 'Completed',
};

const STATUS_STYLES = {
  Approved: 'bg-emerald-50 text-emerald-600 border-emerald-200',
  Pending: 'bg-amber-50 text-amber-600 border-amber-200',
  Rejected: 'bg-rose-50 text-rose-600 border-rose-200',
  Leave_Requested: 'bg-orange-50 text-orange-600 border-orange-200',
  Completed: 'bg-slate-100 text-slate-500 border-slate-200',
  Cancelled: 'bg-slate-100 text-slate-500 border-slate-200',
};

const ManagerBookingsPage = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedStatus, setSelectedStatus] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  const [processingId, setProcessingId] = useState(null);
  const [toast, setToast] = useState(null);

  const [rejectingBooking, setRejectingBooking] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');

  const [leaveAction, setLeaveAction] = useState(null); 
  const [leaveManagerResponse, setLeaveManagerResponse] = useState('');

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const data = await bookingService.getManagerBookings();
      setBookings(data);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch manager bookings:', err);
      setError('Failed to load booking requests.');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (bookingId) => {
    try {
      setProcessingId(bookingId);
      await bookingService.updateBookingStatus(bookingId, 'Approved');
      setToast({ type: 'success', message: 'Booking request approved successfully!' });
      fetchBookings();
    } catch (err) {
      setToast({ type: 'error', message: err.response?.data?.message || 'Failed to approve booking.' });
    } finally {
      setProcessingId(null);
    }
  };

  const handleConfirmReject = async () => {
    if (!rejectingBooking) return;
    try {
      setProcessingId(rejectingBooking._id);
      await bookingService.updateBookingStatus(rejectingBooking._id, 'Rejected', rejectionReason);
      setToast({ type: 'success', message: 'Booking request rejected.' });
      setRejectingBooking(null);
      setRejectionReason('');
      fetchBookings();
    } catch (err) {
      setToast({ type: 'error', message: err.response?.data?.message || 'Failed to reject booking.' });
    } finally {
      setProcessingId(null);
    }
  };

  const handleLeaveAction = async () => {
    if (!leaveAction) return;
    const { booking, action } = leaveAction;
    try {
      setProcessingId(booking._id);
      await bookingService.handleLeaveApproval(booking._id, action, leaveManagerResponse);
      setToast({
        type: 'success',
        message: action === 'approve'
          ? 'Leave approved. Student has been checked out.'
          : 'Leave rejected. Student remains as active resident.',
      });
      setLeaveAction(null);
      setLeaveManagerResponse('');
      fetchBookings();
    } catch (err) {
      setToast({ type: 'error', message: err.response?.data?.message || 'Failed to process leave request.' });
    } finally {
      setProcessingId(null);
    }
  };

  const counts = useMemo(() => ({
    All: bookings.length,
    Pending: bookings.filter(b => b.status === 'Pending').length,
    Approved: bookings.filter(b => b.status === 'Approved').length,
    Rejected: bookings.filter(b => b.status === 'Rejected').length,
    Cancelled: bookings.filter(b => b.status === 'Cancelled').length,
    Leave_Requested: bookings.filter(b => b.status === 'Leave_Requested').length,
  }), [bookings]);

  const filteredBookings = useMemo(() => bookings.filter(booking => {
    if (selectedStatus !== 'All' && booking.status !== selectedStatus) return false;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const match = [
        booking.student?.name,
        booking.student?.email,
        booking.hostel?.name,
        booking.room?.roomNumber?.toString(),
      ].some(f => f?.toLowerCase().includes(term));
      if (!match) return false;
    }
    return true;
  }), [bookings, selectedStatus, searchTerm]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Booking Requests</h1>
          <p className="text-sm text-slate-500 mt-1">
            Review and manage room reservations and leave requests for your hostels.
          </p>
        </div>
        <button
          onClick={fetchBookings}
          className="flex items-center gap-1.5 px-3 py-2 bg-white border border-rose-100 rounded-xl text-xs font-semibold text-slate-600 hover:text-cyan-600 hover:border-cyan-200 transition-all shrink-0 cursor-pointer shadow-sm"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Refresh
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white/70 backdrop-blur-xl border border-white p-4 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold text-slate-400">Total</span>
            <CalendarDays className="w-4 h-4 text-slate-400" />
          </div>
          <p className="text-2xl font-bold text-slate-800">{counts.All}</p>
        </div>
        <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold text-amber-700">Pending</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-bold text-amber-700">{counts.Pending}</p>
        </div>
        <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold text-emerald-700">Approved</span>
            <CheckCircle className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-bold text-emerald-700">{counts.Approved}</p>
        </div>
        <div className="bg-orange-500/10 border border-orange-500/20 p-4 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold text-orange-700">Leave Requests</span>
            <LogOut className="w-4 h-4 text-orange-500" />
          </div>
          <p className="text-2xl font-bold text-orange-700">{counts.Leave_Requested}</p>
        </div>
      </div>

      {/* Filter Tabs + Search */}
      <div className="bg-white/70 backdrop-blur-xl border border-white p-3 rounded-2xl shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {STATUS_FILTERS.map(status => {
            const count = counts[status];
            const isActive = selectedStatus === status;
            return (
              <button
                key={status}
                onClick={() => setSelectedStatus(status)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-cyan-600 text-slate-800 shadow-md shadow-cyan-600/20'
                    : 'bg-rose-50/50 text-slate-600 hover:bg-white hover:text-slate-800'
                }`}
              >
                {STATUS_LABELS[status] || status}
                <span className={`px-1.5 text-[10px] rounded-full font-bold ${isActive ? 'bg-cyan-700 text-slate-800' : 'bg-slate-200 text-slate-600'}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search student, hostel, room..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-rose-50/70 border border-white rounded-xl text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-colors"
          />
        </div>
      </div>

      {/* Bookings List */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" className="text-cyan-500" />
        </div>
      ) : error ? (
        <div className="p-6 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-500 text-center">
          <p className="font-semibold">{error}</p>
          <button onClick={fetchBookings} className="mt-3 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-sm font-semibold transition-colors cursor-pointer">Retry</button>
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 bg-white/50 border border-white rounded-3xl space-y-2">
          <CalendarDays className="w-8 h-8 text-slate-300" />
          <p className="text-slate-500 font-medium">
            {selectedStatus !== 'All' || searchTerm ? 'No bookings match your current filter.' : 'No booking requests found for your hostels.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {filteredBookings.map(booking => {
            const isProcessing = processingId === booking._id;
            const isLeaveRequest = booking.status === 'Leave_Requested';

            return (
              <div
                key={booking._id}
                className={`bg-white/80 border rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between ${
                  isLeaveRequest ? 'border-orange-200' : 'border-white'
                }`}
              >
                <div className="space-y-4">
                  {/* Leave Request Banner */}
                  {isLeaveRequest && (
                    <div className="flex items-center gap-2 px-3 py-2 bg-orange-50 border border-orange-200 rounded-xl text-xs font-semibold text-orange-700">
                      <LogOut className="w-3.5 h-3.5" />
                      Student has requested to leave this room
                    </div>
                  )}

                  {/* Student Info & Status */}
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-3 pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-cyan-400 to-teal-500 text-slate-800 flex items-center justify-center font-bold text-base shadow-md shadow-cyan-500/20 shrink-0">
                        {booking.student?.name ? booking.student.name.charAt(0).toUpperCase() : 'S'}
                      </div>
                      <div className="space-y-0.5 min-w-0">
                        <h3 className="text-base font-bold text-slate-800 truncate">{booking.student?.name || 'Student'}</h3>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-slate-500">
                          {booking.student?.email && (
                            <span className="flex items-center gap-1"><Mail className="w-3 h-3 text-cyan-500" />{booking.student.email}</span>
                          )}
                          {booking.student?.phone && (
                            <span className="flex items-center gap-1"><Phone className="w-3 h-3 text-cyan-500" />{booking.student.phone}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-start sm:items-end gap-1 shrink-0">
                      <span className={`px-3 py-1 rounded-xl text-xs font-bold border uppercase tracking-wider ${STATUS_STYLES[booking.status] || 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                        {STATUS_LABELS[booking.status] || booking.status}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        {new Date(booking.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>
                  </div>

                  {/* Room & Hostel Details */}
                  <div className="bg-rose-50/40 rounded-xl p-3.5 border border-rose-50/80 space-y-2.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 flex items-center gap-1.5 font-medium"><Building2 className="w-3.5 h-3.5 text-cyan-500" />Hostel</span>
                      <span className="font-bold text-slate-800">{booking.hostel?.name}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 flex items-center gap-1.5 font-medium"><DoorOpen className="w-3.5 h-3.5 text-cyan-500" />Room & Floor</span>
                      <span className="font-bold text-slate-800">Room {booking.room?.roomNumber} {booking.room?.floor && `(${booking.room.floor})`}</span>
                    </div>
                    {booking.room?.gender && (
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500 flex items-center gap-1.5 font-medium"><User className="w-3.5 h-3.5 text-cyan-500" />Category</span>
                        <span className="font-semibold text-slate-700 bg-white px-2 py-0.5 rounded border border-slate-200">{booking.room.gender}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between pt-2 border-t border-slate-200/60">
                      <span className="text-slate-500 flex items-center gap-1.5 font-medium"><BedDouble className="w-3.5 h-3.5 text-cyan-500" />Occupancy</span>
                      <span className="font-semibold text-slate-700">{booking.room?.occupiedBeds || 0} / {booking.room?.capacity || 0} beds</span>
                    </div>
                    {booking.room?.monthlyRent !== undefined && (
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500 flex items-center gap-1.5 font-medium"><IndianRupee className="w-3.5 h-3.5 text-emerald-500" />Monthly Rent</span>
                        <span className="font-bold text-emerald-600">₹{booking.room.monthlyRent}/month</span>
                      </div>
                    )}
                  </div>

                  {/* Leave Request Details */}
                  {isLeaveRequest && booking.leaveReason && (
                    <div className="p-3 bg-orange-50/70 border border-orange-200/60 rounded-xl text-xs text-orange-800 space-y-1">
                      <p className="font-semibold flex items-center gap-1.5"><LogOut className="w-3.5 h-3.5" />Leave Reason:</p>
                      <p className="text-orange-700 italic">"{booking.leaveReason}"</p>
                      {booking.leaveRequestedAt && (
                        <p className="text-orange-500 text-[10px]">
                          Requested: {new Date(booking.leaveRequestedAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Manager Response (if any) */}
                  {booking.managerResponse && (
                    <div className="p-3 bg-amber-50/70 border border-amber-200/60 rounded-xl text-xs text-amber-800 flex items-start gap-2">
                      <MessageSquare className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                      <div><span className="font-semibold">Manager Note:</span> {booking.managerResponse}</div>
                    </div>
                  )}
                </div>

                {/* Actions for Pending bookings */}
                {booking.status === 'Pending' && (
                  <div className="flex items-center gap-3 mt-4 pt-4 border-t border-slate-100">
                    <button
                      onClick={() => handleApprove(booking._id)}
                      disabled={isProcessing}
                      className="flex-1 flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white py-2.5 rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-500/20 cursor-pointer"
                    >
                      {isProcessing ? <LoadingSpinner size="sm" className="text-white" /> : <><CheckCircle className="w-4 h-4" />Approve</>}
                    </button>
                    <button
                      onClick={() => { setRejectingBooking(booking); setRejectionReason(''); }}
                      disabled={isProcessing}
                      className="flex-1 flex items-center justify-center gap-2 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 py-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                    >
                      <XCircle className="w-4 h-4" />Reject
                    </button>
                  </div>
                )}

                {/* Actions for Leave_Requested bookings */}
                {isLeaveRequest && (
                  <div className="flex items-center gap-3 mt-4 pt-4 border-t border-orange-100">
                    <button
                      onClick={() => { setLeaveAction({ booking, action: 'approve' }); setLeaveManagerResponse(''); }}
                      disabled={isProcessing}
                      className="flex-1 flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white py-2.5 rounded-xl text-xs font-bold transition-all shadow-md shadow-orange-500/20 cursor-pointer"
                    >
                      {isProcessing ? <LoadingSpinner size="sm" className="text-white" /> : <><CheckCircle className="w-4 h-4" />Approve Leave</>}
                    </button>
                    <button
                      onClick={() => { setLeaveAction({ booking, action: 'reject' }); setLeaveManagerResponse(''); }}
                      disabled={isProcessing}
                      className="flex-1 flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 py-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                    >
                      <XCircle className="w-4 h-4" />Reject Leave
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Rejection Modal */}
      {rejectingBooking && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 text-rose-600">
                <XCircle className="w-5 h-5" />
                <h3 className="font-bold text-slate-800">Reject Booking Request</h3>
              </div>
              <button onClick={() => setRejectingBooking(null)} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"><X className="w-5 h-5" /></button>
            </div>
            <div className="text-xs text-slate-600 space-y-1">
              <p>Student: <strong>{rejectingBooking.student?.name}</strong></p>
              <p>Hostel: <strong>{rejectingBooking.hostel?.name}</strong> (Room {rejectingBooking.room?.roomNumber})</p>
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700">Reason / Note for Student (Optional)</label>
              <textarea
                value={rejectionReason}
                onChange={e => setRejectionReason(e.target.value)}
                placeholder="e.g. Room is under maintenance, criteria not met..."
                rows="3"
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-rose-400 focus:ring-1 focus:ring-rose-400 transition-colors"
              />
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button onClick={() => setRejectingBooking(null)} className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer">Cancel</button>
              <button
                onClick={handleConfirmReject}
                disabled={processingId === rejectingBooking._id}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-rose-600/20 cursor-pointer flex items-center justify-center gap-1.5"
              >
                {processingId === rejectingBooking._id ? <LoadingSpinner size="sm" className="text-white" /> : 'Confirm Rejection'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Leave Approval/Rejection Modal */}
      {leaveAction && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className={`flex items-center gap-2 ${leaveAction.action === 'approve' ? 'text-orange-600' : 'text-slate-600'}`}>
                {leaveAction.action === 'approve' ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                <h3 className="font-bold text-slate-800">
                  {leaveAction.action === 'approve' ? 'Approve Leave Request' : 'Reject Leave Request'}
                </h3>
              </div>
              <button onClick={() => setLeaveAction(null)} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"><X className="w-5 h-5" /></button>
            </div>

            <div className="text-xs text-slate-600 space-y-1">
              <p>Student: <strong>{leaveAction.booking.student?.name}</strong></p>
              <p>Room: <strong>{leaveAction.booking.hostel?.name}</strong> — Room {leaveAction.booking.room?.roomNumber}</p>
              {leaveAction.booking.leaveReason && (
                <div className="mt-2 p-2.5 bg-orange-50 border border-orange-100 rounded-lg">
                  <p className="font-semibold text-orange-800 mb-0.5">Student's Reason:</p>
                  <p className="text-orange-700 italic">"{leaveAction.booking.leaveReason}"</p>
                </div>
              )}
            </div>

            {leaveAction.action === 'approve' && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <p><strong>Warning:</strong> Approving will end this student's accommodation and free up their bed. This action cannot be undone.</p>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700">
                {leaveAction.action === 'approve' ? 'Note for Student (Optional)' : 'Reason for Rejection (Optional)'}
              </label>
              <textarea
                value={leaveManagerResponse}
                onChange={e => setLeaveManagerResponse(e.target.value)}
                placeholder={leaveAction.action === 'approve' ? 'e.g. Approved. Please collect your belongings by...' : 'e.g. Leave not approved at this time...'}
                rows="3"
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400 transition-colors"
              />
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button onClick={() => setLeaveAction(null)} className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer">Cancel</button>
              <button
                onClick={handleLeaveAction}
                disabled={processingId === leaveAction.booking._id}
                className={`flex-1 py-2.5 text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer flex items-center justify-center gap-1.5 ${
                  leaveAction.action === 'approve'
                    ? 'bg-orange-500 hover:bg-orange-600 shadow-orange-500/20'
                    : 'bg-slate-700 hover:bg-slate-800 shadow-slate-500/20'
                }`}
              >
                {processingId === leaveAction.booking._id
                  ? <LoadingSpinner size="sm" className="text-white" />
                  : leaveAction.action === 'approve' ? 'Confirm Approval' : 'Confirm Rejection'
                }
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}
    </div>
  );
};

export default ManagerBookingsPage;
