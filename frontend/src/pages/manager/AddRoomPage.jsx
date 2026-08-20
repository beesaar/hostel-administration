import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, DoorOpen, PlusCircle, CheckCircle2, X } from 'lucide-react';
import { roomService } from '../../services/roomService';
import { managerService } from '../../services/managerService';
import Button from '../../components/Button';
import LoadingSpinner from '../../components/LoadingSpinner';

export const AddRoomPage = () => {
  const { hostelId } = useParams();
  const navigate = useNavigate();
  
  const [hostel, setHostel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  
  const [formData, setFormData] = useState({
    roomNumbers: [],
    floor: '',
    capacity: 1,
    occupiedBeds: 0,
    monthlyRent: '',
    gender: 'Boys',
    AC: false,
    attachedBathroom: false,
    furnished: false,
    status: 'Available',
  });

  const [currentRoomInput, setCurrentRoomInput] = useState('');
  const [currentRoomCount, setCurrentRoomCount] = useState(0);

  const handleRoomInputKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();

      if (hostel && currentRoomCount + formData.roomNumbers.length >= hostel.totalRooms) {
        alert(`You have reached the maximum room capacity (${hostel.totalRooms}) for this hostel.`);
        return;
      }

      const val = currentRoomInput.trim();
      if (val && !formData.roomNumbers.includes(val)) {
        setFormData(prev => ({ ...prev, roomNumbers: [...prev.roomNumbers, val] }));
      }
      setCurrentRoomInput('');
    }
  };

  const removeRoomNumber = (roomToRemove) => {
    setFormData(prev => ({
      ...prev,
      roomNumbers: prev.roomNumbers.filter(r => r !== roomToRemove)
    }));
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [hostelRes, roomsRes] = await Promise.all([
          managerService.getHostelById(hostelId),
          roomService.getRoomsByHostel(hostelId)
        ]);
        
        if (hostelRes.success) {
          setHostel(hostelRes.hostel);
          if (hostelRes.hostel.type === 'Boys' || hostelRes.hostel.type === 'Girls') {
            setFormData(prev => ({ ...prev, gender: hostelRes.hostel.type }));
          }
        }
        
        if (roomsRes.success) {
          setCurrentRoomCount(roomsRes.rooms?.length || 0);
        }
      } catch (err) {
        setError('Failed to load hostel data.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [hostelId]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      // Basic validation
      if (Number(formData.capacity) < 1) throw new Error('Capacity must be at least 1');
      if (Number(formData.occupiedBeds) < 0) throw new Error('Occupied beds cannot be negative');
      if (Number(formData.occupiedBeds) > Number(formData.capacity)) {
        throw new Error('Occupied beds cannot exceed capacity');
      }
      if (Number(formData.monthlyRent) < 0) throw new Error('Rent cannot be negative');

      if (formData.roomNumbers.length === 0) {
        // Just in case they typed something but forgot to press Enter
        if (currentRoomInput.trim()) {
          formData.roomNumbers.push(currentRoomInput.trim());
        } else {
          throw new Error('Please provide at least one room number');
        }
      }

      const res = await roomService.bulkCreateRooms(hostelId, {
        ...formData,
        capacity: Number(formData.capacity),
        occupiedBeds: Number(formData.occupiedBeds),
        monthlyRent: Number(formData.monthlyRent),
      });

      if (res.success) {
        if (res.failedRooms && res.failedRooms.length > 0) {
          alert(`Created ${res.createdRooms.length} rooms. Failed: ${res.failedRooms.length}\n${res.failedRooms.map(f => `${f.roomNumber}: ${f.error}`).join('\n')}`);
        }
        navigate(`/manager/hostels/${hostelId}/rooms`);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to create room');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner text="Preparing form..." />;

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="space-y-2">
        <Button
          variant="ghost"
          size="sm"
          icon={ArrowLeft}
          onClick={() => navigate(`/manager/hostels/${hostelId}/rooms`)}
        >
          Back to Rooms
        </Button>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/20">
            <PlusCircle className="w-6 h-6" />
          </div>
          <span>Add New Room</span>
        </h1>
        <p className="text-sm text-slate-400">
          Adding a room to <strong className="text-teal-400">{hostel?.name}</strong>
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm font-medium">
          {error}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-rose-50/80 border border-white rounded-3xl p-6 sm:p-8 space-y-8 shadow-xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Room Numbers */}
          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-semibold text-slate-600">Room Number(s) <span className="text-rose-500">*</span></label>
            <div className="w-full bg-rose-50 border border-white rounded-xl p-2 min-h-[56px] flex flex-wrap gap-2 items-center focus-within:border-teal-500 focus-within:ring-1 focus-within:ring-teal-500 transition-all">
              {formData.roomNumbers.map(room => (
                <div key={room} className="flex items-center gap-1 bg-teal-500/20 text-teal-600 px-3 py-1.5 rounded-lg text-sm font-semibold border border-teal-500/30">
                  {room}
                  <button type="button" onClick={() => removeRoomNumber(room)} className="hover:text-slate-800 transition-colors ml-1 focus:outline-none">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
              <input
                type="text"
                value={currentRoomInput}
                onChange={(e) => setCurrentRoomInput(e.target.value)}
                onKeyDown={handleRoomInputKeyDown}
                disabled={hostel && currentRoomCount + formData.roomNumbers.length >= hostel.totalRooms}
                placeholder={
                  hostel && currentRoomCount + formData.roomNumbers.length >= hostel.totalRooms
                    ? "Maximum capacity reached"
                    : formData.roomNumbers.length === 0 ? "Type room number and press Enter or Comma..." : ""
                }
                className="flex-1 min-w-[200px] bg-transparent border-none text-slate-800 focus:outline-none focus:ring-0 text-sm px-2 py-1 disabled:opacity-50"
              />
            </div>
            <p className="text-xs text-rose-300">
              Type a room number and press <strong>Enter</strong> or <strong>Comma (,)</strong> to add it to the batch.
              {hostel && ` (Limit: ${hostel.totalRooms} rooms)`}
            </p>
          </div>

          {/* Floor */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-600">Floor <span className="text-rose-500">*</span></label>
            <select
              name="floor"
              value={formData.floor}
              onChange={handleChange}
              required
              className="w-full bg-rose-50 border border-white rounded-xl px-4 py-2.5 text-slate-800 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all"
            >
              <option value="" disabled>Select Floor</option>
              <option value="Basement">Basement</option>
              <option value="Ground Floor">Ground Floor</option>
              <option value="1st Floor">1st Floor</option>
              <option value="2nd Floor">2nd Floor</option>
              <option value="3rd Floor">3rd Floor</option>
              <option value="4th Floor">4th Floor</option>
              <option value="5th Floor">5th Floor</option>
              <option value="6th Floor">6th Floor</option>
            </select>
          </div>

          {/* Capacity */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-600">Total Capacity (Beds) <span className="text-rose-500">*</span></label>
            <div className="flex flex-wrap gap-3">
              {[1, 2, 3, 4, 5, 6].map(num => (
                <button
                  type="button"
                  key={num}
                  onClick={() => setFormData(prev => ({ ...prev, capacity: num, occupiedBeds: Math.min(prev.occupiedBeds, num) }))}
                  className={`w-11 h-11 rounded-xl font-bold transition-all border ${
                    formData.capacity === num
                      ? 'bg-teal-500 text-slate-800 border-teal-500 shadow-lg shadow-teal-500/25'
                      : 'bg-rose-50 text-slate-400 border-white hover:border-rose-200 hover:text-slate-800'
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>

          {/* Occupied Beds */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-600">Occupied Beds <span className="text-rose-500">*</span></label>
            <div className="flex flex-wrap gap-3">
              {Array.from({ length: formData.capacity + 1 }, (_, i) => i).map(num => (
                <button
                  type="button"
                  key={num}
                  onClick={() => setFormData(prev => ({ ...prev, occupiedBeds: num }))}
                  className={`w-11 h-11 rounded-xl font-bold transition-all border ${
                    formData.occupiedBeds === num
                      ? 'bg-cyan-500 text-slate-800 border-cyan-500 shadow-lg shadow-cyan-500/25'
                      : 'bg-rose-50 text-slate-400 border-white hover:border-rose-200 hover:text-slate-800'
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>
            <p className="text-xs text-rose-300">Available beds will be calculated automatically.</p>
          </div>

          {/* Rent */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-600">Monthly Rent (Per Bed) <span className="text-rose-500">*</span></label>
            <input
              type="number"
              name="monthlyRent"
              min="0"
              value={formData.monthlyRent}
              onChange={handleChange}
              required
              placeholder="e.g., 5000"
              className="w-full bg-rose-50 border border-white rounded-xl px-4 py-2.5 text-slate-800 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all"
            />
          </div>

          {/* Gender */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-600">Gender Category</label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className="w-full bg-rose-50 border border-white rounded-xl px-4 py-2.5 text-slate-800 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all"
            >
              <option value="Boys">Boys</option>
              <option value="Girls">Girls</option>
              <option value="Unisex">Unisex</option>
            </select>
          </div>
          
          {/* Explicit Status Override */}
          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-semibold text-slate-600">Status Override</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full bg-rose-50 border border-white rounded-xl px-4 py-2.5 text-slate-800 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all"
            >
              <option value="Available">Available (Auto-calculates on save)</option>
              <option value="Maintenance">Maintenance (Locks room out of availability)</option>
            </select>
            <p className="text-xs text-rose-300">If set to Maintenance, the room remains unavailable regardless of bed count.</p>
          </div>
        </div>

        {/* Toggles */}
        <div className="pt-4 border-t border-white">
          <h3 className="text-sm font-semibold text-slate-600 mb-4">Room Amenities</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { name: 'AC', label: 'Air Conditioned' },
              { name: 'attachedBathroom', label: 'Attached Bathroom' },
              { name: 'furnished', label: 'Fully Furnished' }
            ].map(amenity => (
              <button
                type="button"
                key={amenity.name}
                onClick={() => setFormData(prev => ({ ...prev, [amenity.name]: !prev[amenity.name] }))}
                className={`p-4 rounded-xl flex items-center justify-between transition-all border ${
                  formData[amenity.name]
                    ? 'bg-teal-500/10 border-teal-500/50 text-teal-600 shadow-inner'
                    : 'bg-rose-50 border-white text-slate-400 hover:border-rose-100 hover:text-slate-600'
                }`}
              >
                <span className="text-sm font-semibold">{amenity.label}</span>
                <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${
                  formData[amenity.name] ? 'bg-teal-500 border-teal-500' : 'bg-white border-rose-100'
                }`}>
                  {formData[amenity.name] && <CheckCircle2 className="w-3.5 h-3.5 text-slate-800" />}
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="pt-6 border-t border-white">
          <Button type="submit" variant="primary" className="w-full justify-center" icon={Save} loading={submitting}>
            Save Room(s)
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AddRoomPage;
