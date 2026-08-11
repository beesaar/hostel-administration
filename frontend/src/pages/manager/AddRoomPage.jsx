import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, DoorOpen, PlusCircle, CheckCircle2 } from 'lucide-react';
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
    const fetchHostel = async () => {
      try {
        const res = await managerService.getHostelById(hostelId);
        if (res.success) {
          setHostel(res.hostel);
          // Auto-select gender based on hostel type if it's strictly Boys or Girls
          if (res.hostel.type === 'Boys' || res.hostel.type === 'Girls') {
            setFormData(prev => ({ ...prev, gender: res.hostel.type }));
          }
        }
      } catch (err) {
        setError('Failed to load hostel context.');
      } finally {
        setLoading(false);
      }
    };
    fetchHostel();
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

      const res = await roomService.createRoom(hostelId, {
        ...formData,
        capacity: Number(formData.capacity),
        occupiedBeds: Number(formData.occupiedBeds),
        monthlyRent: Number(formData.monthlyRent),
      });

      if (res.success) {
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
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <PlusCircle className="w-6 h-6" />
          </div>
          <span>Add New Room</span>
        </h1>
        <p className="text-sm text-slate-400">
          Adding a room to <strong className="text-indigo-400">{hostel?.name}</strong>
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm font-medium">
          {error}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-8 shadow-xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Room Number */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-300">Room Number <span className="text-rose-500">*</span></label>
            <input
              type="text"
              name="roomNumber"
              value={formData.roomNumber}
              onChange={handleChange}
              required
              placeholder="e.g., 101, A203"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
            />
          </div>

          {/* Floor */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-300">Floor <span className="text-rose-500">*</span></label>
            <input
              type="text"
              name="floor"
              value={formData.floor}
              onChange={handleChange}
              required
              placeholder="e.g., Ground, 1st Floor"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
            />
          </div>

          {/* Capacity */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-300">Total Capacity (Beds) <span className="text-rose-500">*</span></label>
            <input
              type="number"
              name="capacity"
              min="1"
              value={formData.capacity}
              onChange={handleChange}
              required
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
            />
          </div>

          {/* Occupied Beds */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-300">Occupied Beds <span className="text-rose-500">*</span></label>
            <input
              type="number"
              name="occupiedBeds"
              min="0"
              max={formData.capacity}
              value={formData.occupiedBeds}
              onChange={handleChange}
              required
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
            />
            <p className="text-xs text-slate-500">Available beds will be calculated automatically.</p>
          </div>

          {/* Rent */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-300">Monthly Rent (Per Bed) <span className="text-rose-500">*</span></label>
            <input
              type="number"
              name="monthlyRent"
              min="0"
              value={formData.monthlyRent}
              onChange={handleChange}
              required
              placeholder="e.g., 5000"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
            />
          </div>

          {/* Gender */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-300">Gender Category</label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
            >
              <option value="Boys">Boys</option>
              <option value="Girls">Girls</option>
              <option value="Unisex">Unisex</option>
            </select>
          </div>
          
          {/* Explicit Status Override */}
          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-semibold text-slate-300">Status Override</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
            >
              <option value="Available">Available (Auto-calculates on save)</option>
              <option value="Maintenance">Maintenance (Locks room out of availability)</option>
            </select>
            <p className="text-xs text-slate-500">If set to Maintenance, the room remains unavailable regardless of bed count.</p>
          </div>
        </div>

        {/* Toggles */}
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
            Save Room
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AddRoomPage;
