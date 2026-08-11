import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { DoorOpen, PlusCircle, ArrowLeft, Trash2, Pencil, RefreshCw, CheckCircle2 } from 'lucide-react';
import { roomService } from '../../services/roomService';
import { managerService } from '../../services/managerService';
import Button from '../../components/Button';
import LoadingSpinner from '../../components/LoadingSpinner';
import ConfirmDialog from '../../components/ConfirmDialog';
import Toast from '../../components/Toast';

export const RoomsListPage = () => {
  const { hostelId } = useParams();
  const navigate = useNavigate();
  
  const [hostel, setHostel] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState({ message: '', type: 'success' });
  const [deleteDialog, setDeleteDialog] = useState({ isOpen: false, room: null, loading: false });

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      // Fetch hostel details and rooms concurrently
      const [hostelRes, roomsRes] = await Promise.all([
        managerService.getHostelById(hostelId),
        roomService.getRoomsByHostel(hostelId)
      ]);
      
      if (hostelRes.success) setHostel(hostelRes.hostel);
      if (roomsRes.success) setRooms(roomsRes.rooms || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch rooms data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [hostelId]);

  const handleDeleteClick = (room) => {
    setDeleteDialog({ isOpen: true, room, loading: false });
  };

  const handleDeleteConfirm = async () => {
    const { room } = deleteDialog;
    if (!room) return;

    setDeleteDialog((prev) => ({ ...prev, loading: true }));

    try {
      const res = await roomService.deleteRoom(room._id);
      if (res.success) {
        setRooms((prev) => prev.filter((r) => r._id !== room._id));
        setToast({ message: res.message, type: 'success' });
      }
    } catch (err) {
      setToast({
        message: err.response?.data?.message || 'Failed to delete room',
        type: 'error',
      });
    } finally {
      setDeleteDialog({ isOpen: false, room: null, loading: false });
    }
  };

  if (loading) {
    return <LoadingSpinner size="lg" text="Loading rooms..." />;
  }

  if (error) {
    return (
      <div className="space-y-4">
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm">
          {error}
        </div>
        <Button variant="outline" icon={ArrowLeft} onClick={() => navigate('/manager/hostels')}>
          Back to My Hostels
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <Toast
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ message: '', type: 'success' })}
      />

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="space-y-2">
          <Button
            variant="ghost"
            size="sm"
            icon={ArrowLeft}
            onClick={() => navigate(`/manager/hostels/${hostelId}`)}
          >
            Back to Hostel Details
          </Button>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <DoorOpen className="w-6 h-6" />
            </div>
            <span>Manage Rooms</span>
          </h1>
          <p className="text-sm text-slate-400">
            {hostel?.name} • <span className="text-indigo-400 font-semibold">{rooms.length} Rooms</span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" icon={RefreshCw} onClick={fetchData}>
            Refresh
          </Button>
          {hostel && rooms.length >= hostel.totalRooms ? (
            <Button variant="primary" size="sm" icon={PlusCircle} disabled className="opacity-50 cursor-not-allowed">
              Add Room (Max Reached)
            </Button>
          ) : (
            <Link to={`/manager/hostels/${hostelId}/rooms/new`}>
              <Button variant="primary" size="sm" icon={PlusCircle}>
                Add Room
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Rooms Table */}
      {rooms.length > 0 ? (
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="text-xs uppercase bg-slate-950/50 text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="px-6 py-4 font-semibold">Room No.</th>
                  <th className="px-6 py-4 font-semibold">Floor</th>
                  <th className="px-6 py-4 font-semibold">Gender</th>
                  <th className="px-6 py-4 font-semibold text-center">Beds (Occ / Cap)</th>
                  <th className="px-6 py-4 font-semibold">Rent (mo)</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {rooms.map((room) => {
                  const getStatusColor = (status) => {
                    switch (status) {
                      case 'Available': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
                      case 'Partially Occupied': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
                      case 'Full': return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
                      case 'Maintenance': return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
                      default: return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
                    }
                  };

                  return (
                    <tr key={room._id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="px-6 py-4 font-bold text-white">{room.roomNumber}</td>
                      <td className="px-6 py-4">{room.floor}</td>
                      <td className="px-6 py-4">{room.gender}</td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-cyan-400 font-bold">{room.occupiedBeds}</span>
                        <span className="text-slate-500"> / </span>
                        <span>{room.capacity}</span>
                      </td>
                      <td className="px-6 py-4 text-emerald-400 font-semibold">₹{room.monthlyRent}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold border ${getStatusColor(room.status)}`}>
                          {room.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <Link to={`/manager/rooms/${room._id}/edit`}>
                            <button className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors">
                              <Pencil className="w-4 h-4" />
                            </button>
                          </Link>
                          <button
                            onClick={() => handleDeleteClick(room)}
                            className="p-2 rounded-lg bg-rose-500/10 text-rose-400 hover:text-rose-300 hover:bg-rose-500/20 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-12 text-center space-y-4 shadow-xl">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-slate-800/60 text-slate-500 border border-slate-700/50 flex items-center justify-center">
            <DoorOpen className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-white">No rooms have been added to this hostel yet.</h3>
          <p className="text-sm text-slate-400 max-w-md mx-auto">
            Get started by adding rooms to track capacity and occupancy.
          </p>
          <Link to={`/manager/hostels/${hostelId}/rooms/new`}>
            <Button variant="primary" icon={PlusCircle}>
              Add Room
            </Button>
          </Link>
        </div>
      )}

      {/* Delete Dialog */}
      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        onClose={() => setDeleteDialog({ isOpen: false, room: null, loading: false })}
        onConfirm={handleDeleteConfirm}
        title="Delete Room"
        message={`Are you sure you want to delete Room ${deleteDialog.room?.roomNumber}? This will affect the hostel's total capacity.`}
        confirmText="Delete Room"
        loading={deleteDialog.loading}
      />
    </div>
  );
};

export default RoomsListPage;
