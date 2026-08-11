import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, DoorOpen, CheckCircle2 } from 'lucide-react';
import { roomService } from '../../services/roomService';
import Button from '../../components/Button';
import LoadingSpinner from '../../components/LoadingSpinner';

export const EditRoomPage = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [hostelId, setHostelId] = useState(null);
  
  const [formData, setFormData] = useState({
    roomNumber: '',
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

  useEffect(() => {
    const fetchRoom = async () => {
      try {
        const res = await roomService.getRoomById(roomId);
        if (res.success) {
          const room = res.room;
          setHostelId(room.hostel);
          setFormData({
            roomNumber: room.roomNumber,
            floor: room.floor,
            capacity: room.capacity,
            occupiedBeds: room.occupiedBeds,
            monthlyRent: room.monthlyRent,
            gender: room.gender,
            AC: room.AC,
            attachedBathroom: room.attachedBathroom,
            furnished: room.furnished,
            status: room.status,
          });
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load room details.');
      } finally {
        setLoading(false);
      }
    };
    fetchRoom();
  }, [roomId]);

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
      if (Number(formData.capacity) < 1) throw new Error('Capacity must be at least 1');
      if (Number(formData.occupiedBeds) < 0) throw new Error('Occupied beds cannot be negative');
      if (Number(formData.occupiedBeds) > Number(formData.capacity)) {
        throw new Error('Occupied beds cannot exceed capacity');
      }
      if (Number(formData.monthlyRent) < 0) throw new Error('Rent cannot be negative');

      const res = await roomService.updateRoom(roomId, {
        ...formData,
        capacity: Number(formData.capacity),
        occupiedBeds: Number(formData.occupiedBeds),
        monthlyRent: Number(formData.monthlyRent),
      });

      if (res.success) {
        navigate(`/manager/hostels/${hostelId}/rooms`);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to update room');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner text="Loading room data..." />;

  if (error && !hostelId) {
    return (
      <div className="space-y-4">
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm">
          {error}
        </div>
        <Button variant="outline" icon={ArrowLeft} onClick={() => navigate(-1)}>
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      <div className="space-y-2">
        <Button
          variant="ghost"
          size="sm"
          icon={ArrowLeft}
          onClick={() => navigate(`/manager/hostels/${hostelId}/rooms`)}
        >
          Back to Rooms
        </Button>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <DoorOpen className="w-6 h-6" />
          </div>
          <span>Edit Room {formData.roomNumber}</span>
        </h1>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm font-medium">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-8 shadow-xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-300">Room Number <span className="text-rose-500">*</span></label>
            <input type="text" name="roomNumber" value={formData.roomNumber} onChange={handleChange} required className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all" />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-300">Floor <span className="text-rose-500">*</span></label>
            <input type="text" name="floor" value={formData.floor} onChange={handleChange} required className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all" />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-300">Total Capacity (Beds) <span className="text-rose-500">*</span></label>
            <input type="number" name="capacity" min="1" value={formData.capacity} onChange={handleChange} required className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all" />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-300">Occupied Beds <span className="text-rose-500">*</span></label>
            <input type="number" name="occupiedBeds" min="0" max={formData.capacity} value={formData.occupiedBeds} onChange={handleChange} required className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all" />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-300">Monthly Rent (Per Bed) <span className="text-rose-500">*</span></label>
            <input type="number" name="monthlyRent" min="0" value={formData.monthlyRent} onChange={handleChange} required className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all" />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-300">Gender Category</label>
            <select name="gender" value={formData.gender} onChange={handleChange} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all">
              <option value="Boys">Boys</option>
              <option value="Girls">Girls</option>
              <option value="Unisex">Unisex</option>
            </select>
          </div>
          
          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-semibold text-slate-300">Status Override</label>
            <select name="status" value={formData.status} onChange={handleChange} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all">
              <option value="Available">Available (Auto-calculates on save)</option>
              <option value="Maintenance">Maintenance (Locks room out of availability)</option>
            </select>
            <p className="text-xs text-slate-500">If set to Maintenance, the room remains unavailable regardless of bed count.</p>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-800">
          <h3 className="text-sm font-semibold text-slate-300 mb-4">Room Amenities</h3>
          <div className="flex flex-wrap gap-6">
            <label className="flex items-center gap-3 cursor-pointer group">
              <div className="relative flex items-center justify-center">
                <input type="checkbox" name="AC" checked={formData.AC} onChange={handleChange} className="sr-only" />
                <div className={`w-5 h-5 rounded border ${formData.AC ? 'bg-indigo-500 border-indigo-500' : 'bg-slate-950 border-slate-700'} transition-colors flex items-center justify-center`}>
                  {formData.AC && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                </div>
              </div>
              <span className="text-sm text-slate-300 group-hover:text-white transition-colors">Air Conditioned</span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer group">
              <div className="relative flex items-center justify-center">
                <input type="checkbox" name="attachedBathroom" checked={formData.attachedBathroom} onChange={handleChange} className="sr-only" />
                <div className={`w-5 h-5 rounded border ${formData.attachedBathroom ? 'bg-indigo-500 border-indigo-500' : 'bg-slate-950 border-slate-700'} transition-colors flex items-center justify-center`}>
                  {formData.attachedBathroom && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                </div>
              </div>
              <span className="text-sm text-slate-300 group-hover:text-white transition-colors">Attached Bathroom</span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer group">
              <div className="relative flex items-center justify-center">
                <input type="checkbox" name="furnished" checked={formData.furnished} onChange={handleChange} className="sr-only" />
                <div className={`w-5 h-5 rounded border ${formData.furnished ? 'bg-indigo-500 border-indigo-500' : 'bg-slate-950 border-slate-700'} transition-colors flex items-center justify-center`}>
                  {formData.furnished && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                </div>
              </div>
              <span className="text-sm text-slate-300 group-hover:text-white transition-colors">Fully Furnished</span>
            </label>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-800">
          <Button type="submit" variant="primary" className="w-full justify-center" icon={Save} loading={submitting}>
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
};

export default EditRoomPage;
