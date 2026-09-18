import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, BedDouble, CheckCircle2, User, Building2, Tag, IndianRupee } from 'lucide-react';
import { studentService } from '../../services/studentService';
import { bookingService } from '../../services/bookingService';
import LoadingSpinner from '../../components/LoadingSpinner';
import Toast from '../../components/Toast';

const StudentHostelDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [hostel, setHostel] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Toast state
  const [toast, setToast] = useState(null);
  const [isBooking, setIsBooking] = useState(false);

  useEffect(() => {
    fetchHostelDetails();
  }, [id]);

  const fetchHostelDetails = async () => {
    try {
      setLoading(true);
      const [hostelData, roomsData] = await Promise.all([
        studentService.getHostelById(id),
        studentService.getHostelRooms(id)
      ]);
      setHostel(hostelData);
      setRooms(roomsData);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch hostel details:', err);
      setError(err.response?.data?.message || 'Failed to load hostel details. It may not exist or is not approved.');
    } finally {
      setLoading(false);
    }
  };

  const handleBookRoom = async (roomId) => {
    try {
      setIsBooking(true);
      await bookingService.createBooking(hostel._id, roomId);
      setToast({ type: 'success', message: 'Booking request submitted successfully! Check My Bookings.' });
    } catch (err) {
      setToast({ type: 'error', message: err.response?.data?.message || 'Failed to submit booking request.' });
    } finally {
      setIsBooking(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <LoadingSpinner size="lg" className="text-violet-500" />
      </div>
    );
  }

  if (error || !hostel) {
    return (
      <div className="space-y-4">
        <button
          onClick={() => navigate('/student/hostels')}
          className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Hostels
        </button>
        <div className="p-6 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-500 text-center">
          <p className="font-semibold">{error || 'Hostel not found'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back button */}
      <button
        onClick={() => navigate('/student/hostels')}
        className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-violet-600 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Hostels
      </button>

      {/* Main Hostel Info Card */}
      <div className="bg-white/70 backdrop-blur-xl border border-white rounded-3xl overflow-hidden shadow-sm">
        <div className="p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">
                  {hostel.name}
                </h1>
                <span
                  className={`px-3 py-1 rounded-lg text-xs font-bold border ${
                    hostel.type === 'Boys'
                      ? 'bg-blue-500/10 text-blue-500 border-blue-500/30'
                      : hostel.type === 'Girls'
                      ? 'bg-pink-500/10 text-pink-500 border-pink-500/30'
                      : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30'
                  }`}
                >
                  {hostel.type}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
                <MapPin className="w-4 h-4 text-violet-400" />
                <span>
                  {hostel.address}, {hostel.city}, {hostel.state} - {hostel.pincode}
                </span>
              </div>
            </div>
            
            {/* Contact Manager Section */}
            {hostel.manager && (
               <div className="flex flex-col items-start sm:items-end gap-1">
                 <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Manager Contact</p>
                 <div className="flex items-center gap-2 bg-violet-50/50 px-3 py-1.5 rounded-xl border border-violet-100">
                    <User className="w-3.5 h-3.5 text-violet-500"/>
                    <span className="text-sm font-semibold text-slate-700">{hostel.manager.name}</span>
                 </div>
                 {hostel.manager.phone && (
                   <span className="text-xs text-slate-500 px-1">{hostel.manager.phone}</span>
                 )}
               </div>
            )}
          </div>

          <div className="bg-rose-50/50 rounded-2xl p-5 border border-white/60">
            <h3 className="text-sm font-bold text-slate-800 mb-2">About this Hostel</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              {hostel.description || 'No description provided by the manager.'}
            </p>
          </div>

          {/* Facilities List */}
          {hostel.facilities && hostel.facilities.length > 0 && (
            <div>
              <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-violet-500" />
                Facilities & Services
              </h3>
              <div className="flex flex-wrap gap-2">
                {hostel.facilities.map((f, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white text-slate-600 border border-slate-100 shadow-sm"
                  >
                    <Tag className="w-3.5 h-3.5 text-violet-400" />
                    {f}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Rooms Section */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2 px-1">
          <BedDouble className="w-5 h-5 text-violet-500" />
          Available Rooms
        </h2>
        
        {rooms.length === 0 ? (
           <div className="p-8 bg-white/50 border border-white rounded-3xl text-center">
             <p className="text-slate-500 font-medium">No rooms have been added to this hostel yet.</p>
           </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {rooms.map((room) => (
              <div key={room._id} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-lg font-bold text-slate-800">Room {room.roomNumber}</h3>
                    <p className="text-xs text-slate-500 font-medium">Floor {room.floor}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${
                    room.status === 'Available' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' :
                    room.status === 'Full' ? 'bg-rose-50 text-rose-600 border-rose-200' :
                    room.status === 'Partially Occupied' ? 'bg-amber-50 text-amber-600 border-amber-200' :
                    'bg-slate-50 text-slate-600 border-slate-200'
                  }`}>
                    {room.status}
                  </span>
                </div>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">Capacity</span>
                    <span className="font-semibold text-slate-700">{room.capacity} Person(s)</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">Available Beds</span>
                    <span className="font-semibold text-violet-600">{room.availableBeds}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">Monthly Rent</span>
                    <span className="font-semibold text-emerald-600 flex items-center">
                      <IndianRupee className="w-3 h-3" />
                      {room.monthlyRent}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-3 border-t border-slate-100">
                  {room.AC && (
                    <span className="px-2 py-1 bg-slate-50 text-slate-600 rounded text-[10px] font-medium flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-500" /> AC
                    </span>
                  )}
                  {room.attachedBathroom && (
                    <span className="px-2 py-1 bg-slate-50 text-slate-600 rounded text-[10px] font-medium flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-500" /> Attached Bath
                    </span>
                  )}
                  {room.furnished && (
                    <span className="px-2 py-1 bg-slate-50 text-slate-600 rounded text-[10px] font-medium flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-500" /> Furnished
                    </span>
                  )}
                </div>

                {/* Booking Button */}
                <div className="mt-4 pt-4 border-t border-slate-100">
                  <button
                    onClick={() => handleBookRoom(room._id)}
                    disabled={isBooking || room.status === 'Full' || room.status === 'Maintenance'}
                    className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
                      room.status === 'Full' || room.status === 'Maintenance'
                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                        : 'bg-violet-600 hover:bg-violet-700 text-white shadow-md shadow-violet-600/20'
                    }`}
                  >
                    {room.status === 'Full' || room.status === 'Maintenance' 
                      ? 'Unavailable' 
                      : 'Book Room'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

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

export default StudentHostelDetailPage;
