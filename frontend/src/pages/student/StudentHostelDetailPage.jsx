import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, useOutletContext } from 'react-router-dom';
import { ArrowLeft, MapPin, BedDouble, CheckCircle2, User, Building2, Tag, IndianRupee, Clock } from 'lucide-react';
import { studentService } from '../../services/studentService';
import { bookingService } from '../../services/bookingService';
import LoadingSpinner from '../../components/LoadingSpinner';
import Toast from '../../components/Toast';
import HostelMap from '../../components/HostelMap';

const StudentHostelDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { accommodationState, accommodationBooking, refreshStatus } = useOutletContext() || {};

  const [hostel, setHostel] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Toast and booking operation state
  const [toast, setToast] = useState(null);
  const [bookingRoomId, setBookingRoomId] = useState(null);

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
    if (bookingRoomId) return;

    try {
      setBookingRoomId(roomId);
      await bookingService.createBooking(hostel._id, roomId);
      
      // Refresh global accommodation status
      if (refreshStatus) {
        await refreshStatus();
      }

      setToast({
        type: 'success',
        message: 'Booking request submitted successfully! Your request is now Pending approval.',
      });
    } catch (err) {
      console.error('Booking request failed:', err);
      const statusCode = err.response?.status;
      const apiMessage = err.response?.data?.message;

      let errorMsg = 'Failed to submit booking request. Please try again.';

      if (statusCode === 401) {
        errorMsg = 'Session expired. Please log in again.';
      } else if (apiMessage) {
        errorMsg = apiMessage;
      }

      setToast({ type: 'error', message: errorMsg });
    } finally {
      setBookingRoomId(null);
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
        {/* Hostel Image Gallery / Banner if available */}
        {hostel.images && hostel.images.length > 0 && (
          <div className="h-64 sm:h-80 w-full overflow-hidden relative bg-slate-100 border-b border-white">
            <img
              src={hostel.images[0]}
              alt={hostel.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
            {hostel.images.length > 1 && (
              <div className="absolute bottom-4 right-4 flex gap-2">
                {hostel.images.slice(1, 4).map((img, i) => (
                  <img
                    key={i}
                    src={img}
                    alt={`${hostel.name} ${i + 2}`}
                    className="w-14 h-14 object-cover rounded-xl border-2 border-white shadow-md cursor-pointer hover:scale-105 transition-transform"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        )}

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
                  {hostel.type} Hostel
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
                <MapPin className="w-4 h-4 text-violet-400 shrink-0" />
                <span>
                  {hostel.address}, {hostel.city}, {hostel.state} - {hostel.pincode}
                </span>
              </div>
            </div>
            
            {/* Contact Manager Section */}
            {hostel.manager && (
               <div className="flex flex-col items-start sm:items-end gap-1">
                 <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Hostel Manager</p>
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

          {/* Amenities & Services */}
          {((hostel.facilities && hostel.facilities.length > 0) || (hostel.amenities && hostel.amenities.length > 0)) && (
            <div>
              <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-violet-500" />
                Amenities & Services
              </h3>
              <div className="flex flex-wrap gap-2">
                {[...new Set([...(hostel.facilities || []), ...(hostel.amenities || [])])].map((f, idx) => (
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

          {/* Location & Map */}
          {(() => {
            const coords = hostel.location?.coordinates;
            const hasValidCoords =
              coords &&
              Array.isArray(coords) &&
              coords.length === 2 &&
              !isNaN(coords[0]) &&
              !isNaN(coords[1]) &&
              (coords[0] !== 0 || coords[1] !== 0);

            return (
              <div>
                <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-emerald-500" />
                  Location
                </h3>
                <div className="text-sm text-slate-600 mb-3">
                  {hostel.address}, {hostel.city}, {hostel.state} — {hostel.pincode}
                </div>
                {hasValidCoords ? (
                  <HostelMap
                    center={[coords[1], coords[0]]}
                    zoom={16}
                    markers={[
                      {
                        id: hostel._id,
                        lat: coords[1],
                        lng: coords[0],
                        name: hostel.name,
                        address: hostel.address,
                        city: hostel.city,
                      },
                    ]}
                    height="300px"
                  />
                ) : (
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-center">
                    <p className="text-xs text-slate-400">
                      Map location not available for this hostel.
                    </p>
                  </div>
                )}
              </div>
            );
          })()}
        </div>
      </div>

      {/* Rooms Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <BedDouble className="w-5 h-5 text-violet-500" />
            Rooms & Availability
          </h2>
          <span className="text-xs font-semibold text-slate-400 bg-white/70 px-3 py-1 rounded-lg border border-white">
            {rooms.filter(r => r.availableBeds > 0 && r.status !== 'Maintenance').length} of {rooms.length} rooms available
          </span>
        </div>
        
        {rooms.length === 0 ? (
           <div className="p-8 bg-white/50 border border-white rounded-3xl text-center">
             <p className="text-slate-500 font-medium">No rooms have been added to this hostel yet.</p>
           </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {rooms.map((room) => {
              const isCapacityAvailable = room.availableBeds > 0 && room.status !== 'Maintenance' && room.status !== 'Full';
              const isPendingForThisRoom = accommodationState === 'PENDING' && (
                accommodationBooking?.room?._id === room._id || accommodationBooking?.room === room._id
              );
              const isPendingElsewhere = accommodationState === 'PENDING' && !isPendingForThisRoom;
              const isResident = accommodationState === 'ACTIVE_RESIDENT';

              const canBook = isCapacityAvailable && !isPendingForThisRoom && !isPendingElsewhere && !isResident;
              const isCurrentRoomLoading = bookingRoomId === room._id;

              return (
                <div 
                  key={room._id} 
                  className={`bg-white rounded-2xl p-5 border transition-all duration-200 flex flex-col justify-between ${
                    isPendingForThisRoom
                      ? 'border-amber-300 bg-amber-50/30 shadow-sm'
                      : canBook
                      ? 'border-slate-100 shadow-sm hover:shadow-md hover:border-violet-200'
                      : 'border-slate-200/60 bg-slate-50/50 opacity-80'
                  }`}
                >
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-bold text-slate-800">Room {room.roomNumber}</h3>
                          {room.gender && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                              {room.gender}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 font-medium">Floor {room.floor}</p>
                      </div>

                      <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${
                        isPendingForThisRoom ? 'bg-amber-100 text-amber-700 border-amber-300' :
                        room.status === 'Available' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' :
                        room.status === 'Partially Occupied' ? 'bg-amber-50 text-amber-600 border-amber-200' :
                        room.status === 'Full' ? 'bg-rose-50 text-rose-600 border-rose-200' :
                        'bg-slate-100 text-slate-500 border-slate-200'
                      }`}>
                        {isPendingForThisRoom ? 'Pending' : room.status}
                      </span>
                    </div>
                    
                    {/* Room Specs */}
                    <div className="space-y-2 bg-rose-50/30 p-3 rounded-xl border border-rose-50/60">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-500">Capacity</span>
                        <span className="font-semibold text-slate-700">{room.capacity} Person(s)</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-500">Available Beds</span>
                        <span className={`font-semibold ${room.availableBeds > 0 ? 'text-violet-600' : 'text-rose-500'}`}>
                          {room.availableBeds} / {room.capacity}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100">
                        <span className="text-slate-500">Monthly Rent</span>
                        <span className="font-bold text-emerald-600 flex items-center text-sm">
                          <IndianRupee className="w-3.5 h-3.5" />
                          {room.monthlyRent}
                          <span className="text-[10px] text-slate-400 font-normal">/mo</span>
                        </span>
                      </div>
                    </div>

                    {/* Room Features */}
                    <div className="flex flex-wrap gap-1.5">
                      {room.AC && (
                        <span className="px-2 py-1 bg-slate-50 text-slate-600 rounded-md text-[10px] font-medium flex items-center gap-1 border border-slate-100">
                          <CheckCircle2 className="w-3 h-3 text-emerald-500" /> AC
                        </span>
                      )}
                      {room.attachedBathroom && (
                        <span className="px-2 py-1 bg-slate-50 text-slate-600 rounded-md text-[10px] font-medium flex items-center gap-1 border border-slate-100">
                          <CheckCircle2 className="w-3 h-3 text-emerald-500" /> Attached Bath
                        </span>
                      )}
                      {room.furnished && (
                        <span className="px-2 py-1 bg-slate-50 text-slate-600 rounded-md text-[10px] font-medium flex items-center gap-1 border border-slate-100">
                          <CheckCircle2 className="w-3 h-3 text-emerald-500" /> Furnished
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Booking Action Button */}
                  <div className="mt-4 pt-4 border-t border-slate-100">
                    <button
                      onClick={() => handleBookRoom(room._id)}
                      disabled={!canBook || !!bookingRoomId}
                      className={`w-full py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                        isCurrentRoomLoading
                          ? 'bg-violet-600 text-white opacity-80 cursor-wait'
                          : isPendingForThisRoom
                          ? 'bg-amber-100 text-amber-800 border border-amber-300 cursor-default'
                          : isPendingElsewhere || isResident
                          ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                          : !isCapacityAvailable
                          ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                          : 'bg-violet-600 hover:bg-violet-700 text-white shadow-md shadow-violet-600/20 active:scale-[0.98]'
                      }`}
                    >
                      {isCurrentRoomLoading ? (
                        <>
                          <LoadingSpinner size="sm" className="text-white" />
                          <span>Submitting...</span>
                        </>
                      ) : isPendingForThisRoom ? (
                        <>
                          <Clock className="w-3.5 h-3.5 text-amber-700" />
                          <span>Request Pending</span>
                        </>
                      ) : isPendingElsewhere ? (
                        <span>Pending Request Elsewhere</span>
                      ) : isResident ? (
                        <span>Already Accommodated</span>
                      ) : !isCapacityAvailable ? (
                        <span>{room.status === 'Maintenance' ? 'Under Maintenance' : 'Fully Occupied'}</span>
                      ) : (
                        <span>Request Booking</span>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
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
