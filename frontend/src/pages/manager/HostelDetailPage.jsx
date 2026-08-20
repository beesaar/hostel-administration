import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Building2,
  MapPin,
  Phone,
  Mail,
  BedDouble,
  DoorOpen,
  IndianRupee,
  Tag,
  ScrollText,
  ArrowLeft,
  Pencil,
  Trash2,
  Calendar,
} from 'lucide-react';
import { managerService } from '../../services/managerService';
import StatusBadge from '../../components/StatusBadge';
import Button from '../../components/Button';
import LoadingSpinner from '../../components/LoadingSpinner';
import ConfirmDialog from '../../components/ConfirmDialog';
import Toast from '../../components/Toast';

export const HostelDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [hostel, setHostel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState({ message: '', type: 'success' });
  const [deleteDialog, setDeleteDialog] = useState({ isOpen: false, loading: false });

  useEffect(() => {
    const fetchHostel = async () => {
      try {
        const res = await managerService.getHostelById(id);
        if (res.success) {
          setHostel(res.hostel);
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load hostel details');
      } finally {
        setLoading(false);
      }
    };
    fetchHostel();
  }, [id]);

  const handleDelete = async () => {
    setDeleteDialog((prev) => ({ ...prev, loading: true }));
    try {
      const res = await managerService.deleteHostel(id);
      if (res.success) {
        setToast({ message: res.message, type: 'success' });
        setTimeout(() => navigate('/manager/hostels'), 1500);
      }
    } catch (err) {
      setToast({
        message: err.response?.data?.message || 'Failed to delete hostel',
        type: 'error',
      });
    } finally {
      setDeleteDialog({ isOpen: false, loading: false });
    }
  };

  if (loading) {
    return <LoadingSpinner size="lg" text="Loading hostel details..." />;
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

  if (!hostel) return null;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Toast */}
      <Toast
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ message: '', type: 'success' })}
      />

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div className="space-y-2">
          <Button
            variant="ghost"
            size="sm"
            icon={ArrowLeft}
            onClick={() => navigate('/manager/hostels')}
          >
            Back to My Hostels
          </Button>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Building2 className="w-6 h-6" />
            </div>
            <span>{hostel.name}</span>
          </h1>

          <div className="flex items-center gap-3 flex-wrap">
            <span
              className={`px-2.5 py-0.5 rounded-lg text-xs font-semibold border ${
                hostel.type === 'Boys'
                  ? 'bg-blue-500/10 text-blue-300 border-blue-500/30'
                  : hostel.type === 'Girls'
                  ? 'bg-pink-500/10 text-pink-300 border-pink-500/30'
                  : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
              }`}
            >
              {hostel.type} Hostel
            </span>
            <StatusBadge status={hostel.status} />
            <span className="text-xs text-slate-400 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              Listed: {new Date(hostel.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link to={`/manager/hostels/${hostel._id}/edit`}>
            <Button variant="outline" size="sm" icon={Pencil}>
              Edit
            </Button>
          </Link>
          <Button
            variant="danger"
            size="sm"
            icon={Trash2}
            onClick={() => setDeleteDialog({ isOpen: true, loading: false })}
          >
            Delete
          </Button>
        </div>
      </div>

      {/* Rejection Reason */}
      {hostel.status === 'Rejected' && hostel.rejectionReason && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm">
          <strong>Rejection Reason:</strong> {hostel.rejectionReason}
        </div>
      )}

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <div className="bg-rose-50/80 border border-white rounded-2xl p-6 space-y-3">
            <h3 className="text-sm font-bold text-slate-800">Description</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              {hostel.description || 'No description provided.'}
            </p>
          </div>

          {/* Location Details */}
          <div className="bg-rose-50/80 border border-white rounded-2xl p-6 space-y-3">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-400" /> Location
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-600">
              <div>
                <span className="text-rose-300">Address:</span>{' '}
                <span className="text-slate-800">{hostel.address}</span>
              </div>
              <div>
                <span className="text-rose-300">City:</span>{' '}
                <span className="text-slate-800">{hostel.city}</span>
              </div>
              <div>
                <span className="text-rose-300">State:</span>{' '}
                <span className="text-slate-800">{hostel.state}</span>
              </div>
              <div>
                <span className="text-rose-300">Pincode:</span>{' '}
                <span className="text-slate-800">{hostel.pincode}</span>
              </div>
              {hostel.location?.coordinates && (
                <div className="sm:col-span-2">
                  <span className="text-rose-300">Coordinates:</span>{' '}
                  <span className="text-slate-800">
                    {hostel.location.coordinates[1]}°N, {hostel.location.coordinates[0]}°E
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Facilities */}
          {hostel.facilities && hostel.facilities.length > 0 && (
            <div className="bg-rose-50/80 border border-white rounded-2xl p-6 space-y-3">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <Tag className="w-4 h-4 text-teal-400" /> Facilities ({hostel.facilities.length})
              </h3>
              <div className="flex flex-wrap gap-2">
                {hostel.facilities.map((f, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1.5 rounded-xl text-xs font-medium bg-teal-500/10 text-teal-600 border border-teal-500/20"
                  >
                    {f}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Hostel Rules */}
          {hostel.hostelRules && hostel.hostelRules.length > 0 && (
            <div className="bg-rose-50/80 border border-white rounded-2xl p-6 space-y-3">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <ScrollText className="w-4 h-4 text-cyan-400" /> Hostel Rules
              </h3>
              <ol className="space-y-1.5 text-xs text-slate-600 list-decimal list-inside">
                {hostel.hostelRules.map((rule, idx) => (
                  <li key={idx} className="p-2 rounded-lg bg-rose-50/50 border border-white/80">
                    {rule}
                  </li>
                ))}
              </ol>
            </div>
          )}
        </div>

        {/* Right Column: Quick Stats */}
        <div className="space-y-6">
          {/* Contact Card */}
          <div className="bg-rose-50/80 border border-white rounded-2xl p-6 space-y-3">
            <h3 className="text-sm font-bold text-slate-800">Contact Information</h3>
            <div className="space-y-2 text-xs text-slate-600">
              <p className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-rose-300" />
                <span>{hostel.contactPhone}</span>
              </p>
              <p className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-rose-300" />
                <span>{hostel.contactEmail}</span>
              </p>
            </div>
          </div>

          {/* Capacity Stats */}
          <div className="bg-rose-50/80 border border-white rounded-2xl p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-800">Capacity & Pricing</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-xl bg-rose-50/60 border border-white/80">
                <span className="flex items-center gap-2 text-xs text-slate-400">
                  <DoorOpen className="w-4 h-4 text-teal-400" /> Rooms
                </span>
                <span className="text-sm font-bold text-slate-800">{hostel.totalRooms || 0}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-rose-50/60 border border-white/80">
                <span className="flex items-center gap-2 text-xs text-slate-400">
                  <BedDouble className="w-4 h-4 text-cyan-400" /> Beds
                </span>
                <span className="text-sm font-bold text-slate-800">{hostel.totalBeds || 0}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-rose-50/60 border border-white/80">
                <span className="flex items-center gap-2 text-xs text-slate-400">
                  <IndianRupee className="w-4 h-4 text-amber-400" /> Rent (from)
                </span>
                <span className="text-sm font-bold text-slate-800">
                  ₹{hostel.startingRent || 0}/mo
                </span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-rose-50/60 border border-white/80">
                <span className="flex items-center gap-2 text-xs text-slate-400">
                  <IndianRupee className="w-4 h-4 text-emerald-400" /> Deposit
                </span>
                <span className="text-sm font-bold text-slate-800">
                  ₹{hostel.securityDeposit || 0}
                </span>
              </div>
            </div>
          </div>

          {/* Room Management */}
          <div className="bg-rose-50/80 border border-white rounded-2xl p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-800">Room Management</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Manage individual rooms, configure bed capacity, and track occupancy for this property.
            </p>
            <Link to={`/manager/hostels/${hostel._id}/rooms`} className="block">
              <Button variant="primary" className="w-full flex justify-center" icon={DoorOpen}>
                Manage Rooms
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Delete Dialog */}
      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        onClose={() => setDeleteDialog({ isOpen: false, loading: false })}
        onConfirm={handleDelete}
        title="Delete Hostel"
        message={`Are you sure you want to permanently delete "${hostel.name}"? This action cannot be undone.`}
        confirmText="Delete Permanently"
        loading={deleteDialog.loading}
      />
    </div>
  );
};

export default HostelDetailPage;
