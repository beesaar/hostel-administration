import React, { useState, useEffect } from 'react';
import { CalendarDays, MapPin, CheckCircle2, Clock, XCircle, Ban } from 'lucide-react';
import { bookingService } from '../../services/bookingService';
import LoadingSpinner from '../../components/LoadingSpinner';
import StatusBadge from '../../components/StatusBadge';

const StudentBookingsPage = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const data = await bookingService.getStudentBookings();
      setBookings(data);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch bookings:', err);
      setError('Failed to load your bookings.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Approved':
        return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
      case 'Pending':
        return <Clock className="w-5 h-5 text-amber-500" />;
      case 'Rejected':
        return <XCircle className="w-5 h-5 text-rose-500" />;
      case 'Cancelled':
        return <Ban className="w-5 h-5 text-slate-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
          My Bookings
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Track the status of your room booking requests.
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" className="text-violet-500" />
        </div>
      ) : error ? (
        <div className="p-6 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-500 text-center">
          <p className="font-semibold">{error}</p>
        </div>
      ) : bookings.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 bg-white/50 border border-white rounded-2xl">
          <p className="text-slate-500 font-medium">You haven't made any booking requests yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {bookings.map((booking) => (
            <div key={booking._id} className="bg-white/80 border border-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-3">
                  <div className="space-y-1">
                    <h3 className="text-lg font-bold text-slate-800 leading-tight">
                      {booking.hostel.name}
                    </h3>
                    <p className="text-xs text-slate-500 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-violet-400" />
                      {booking.hostel.city}, {booking.hostel.address}
                    </p>
                  </div>
                  <div>
                     <StatusBadge status={booking.status} />
                  </div>
                </div>

                <div className="mt-4 space-y-3 bg-violet-50/50 p-4 rounded-xl border border-violet-100/50">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-500 font-medium">Room Number</span>
                    <span className="font-bold text-slate-800">{booking.room.roomNumber}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-500 font-medium">Floor</span>
                    <span className="font-semibold text-slate-700">{booking.room.floor}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-500 font-medium">Monthly Rent</span>
                    <span className="font-bold text-emerald-600">₹{booking.room.monthlyRent}</span>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                <div className="text-xs text-slate-400 flex items-center gap-1.5">
                  <CalendarDays className="w-4 h-4" />
                  Requested on {new Date(booking.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StudentBookingsPage;
