import React, { useState, useEffect } from 'react';
import { CalendarDays, User, Building2, CheckCircle, XCircle } from 'lucide-react';
import { bookingService } from '../../services/bookingService';
import LoadingSpinner from '../../components/LoadingSpinner';
import Toast from '../../components/Toast';

const ManagerBookingsPage = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Action state
  const [processingId, setProcessingId] = useState(null);
  const [toast, setToast] = useState(null);

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

  const handleUpdateStatus = async (bookingId, status) => {
    try {
      setProcessingId(bookingId);
      await bookingService.updateBookingStatus(bookingId, status);
      setToast({ type: 'success', message: `Booking successfully ${status.toLowerCase()}!` });
      // Refresh list
      fetchBookings();
    } catch (err) {
      setToast({ type: 'error', message: err.response?.data?.message || `Failed to ${status.toLowerCase()} booking.` });
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
          Booking Requests
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Manage incoming room booking requests from students.
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" className="text-cyan-500" />
        </div>
      ) : error ? (
        <div className="p-6 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-500 text-center">
          <p className="font-semibold">{error}</p>
        </div>
      ) : bookings.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 bg-white/50 border border-white rounded-2xl">
          <p className="text-slate-500 font-medium">No booking requests found for your hostels.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {bookings.map((booking) => (
            <div key={booking._id} className="bg-white/80 border border-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
              
              <div className="flex flex-col sm:flex-row justify-between gap-4 mb-4">
                {/* Student Info */}
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-cyan-100 text-cyan-600 flex items-center justify-center font-bold">
                    {booking.student.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-800">{booking.student.name}</h3>
                    <p className="text-xs text-slate-500">{booking.student.email}</p>
                    <p className="text-xs text-slate-500">{booking.student.phone}</p>
                  </div>
                </div>
                
                {/* Status Badge */}
                <div className="shrink-0">
                  <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${
                    booking.status === 'Approved' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' :
                    booking.status === 'Pending' ? 'bg-amber-50 text-amber-600 border-amber-200' :
                    'bg-rose-50 text-rose-600 border-rose-200'
                  }`}>
                    {booking.status}
                  </span>
                </div>
              </div>

              {/* Booking Details */}
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500 flex items-center gap-1.5"><Building2 className="w-4 h-4"/> Hostel</span>
                  <span className="font-bold text-slate-700">{booking.hostel.name}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500 flex items-center gap-1.5"><CalendarDays className="w-4 h-4"/> Room</span>
                  <span className="font-bold text-slate-700">No. {booking.room.roomNumber}</span>
                </div>
                <div className="flex items-center justify-between text-sm pt-2 border-t border-slate-200">
                  <span className="text-slate-500">Room Status</span>
                  <div className="text-right">
                    <span className="font-semibold text-slate-700 text-xs">{booking.room.status}</span>
                    <p className="text-[10px] text-slate-400">
                      {booking.room.occupiedBeds} / {booking.room.capacity} beds occupied
                    </p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              {booking.status === 'Pending' && (
                <div className="flex items-center gap-3 mt-4 pt-4 border-t border-slate-100">
                  <button
                    onClick={() => handleUpdateStatus(booking._id, 'Approved')}
                    disabled={processingId === booking._id}
                    className="flex-1 flex items-center justify-center gap-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 border border-emerald-500/20 py-2 rounded-xl text-sm font-semibold transition-colors"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Approve
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(booking._id, 'Rejected')}
                    disabled={processingId === booking._id}
                    className="flex-1 flex items-center justify-center gap-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 border border-rose-500/20 py-2 rounded-xl text-sm font-semibold transition-colors"
                  >
                    <XCircle className="w-4 h-4" />
                    Reject
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

export default ManagerBookingsPage;
