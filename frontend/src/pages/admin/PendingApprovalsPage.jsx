import React, { useState, useEffect } from 'react';
import {
  Clock,
  CheckCircle2,
  XCircle,
  MapPin,
  User,
  Mail,
  Phone,
  BedDouble,
  ShieldCheck,
  Tag,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';
import { adminService } from '../../services/adminService';
import StatusBadge from '../../components/StatusBadge';
import Button from '../../components/Button';
import RejectModal from '../../components/RejectModal';
import LoadingSpinner from '../../components/LoadingSpinner';

export const PendingApprovalsPage = () => {
  const [pendingHostels, setPendingHostels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null); // stores hostel._id being approved/rejected
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Reject modal state
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [selectedHostel, setSelectedHostel] = useState(null);

  const fetchPendingHostels = async () => {
    try {
      setError(null);
      const res = await adminService.getAllHostels('Pending');
      if (res.success) {
        setPendingHostels(res.hostels || []);
      }
    } catch (err) {
      console.error('Error fetching pending hostels:', err);
      setError(err.response?.data?.message || 'Failed to fetch pending approvals');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingHostels();
  }, []);

  // Handle Approve Action
  const handleApprove = async (hostel) => {
    setActionLoading(hostel._id);
    setError(null);
    setSuccessMessage(null);

    try {
      const res = await adminService.approveHostel(hostel._id);
      if (res.success) {
        setSuccessMessage(`✓ "${hostel.name}" has been successfully approved!`);
        // Remove from pending list
        setPendingHostels((prev) => prev.filter((h) => h._id !== hostel._id));
      }
    } catch (err) {
      console.error('Approve failed:', err);
      setError(err.response?.data?.message || 'Failed to approve hostel');
    } finally {
      setActionLoading(null);
    }
  };

  // Open Reject Modal
  const openRejectModal = (hostel) => {
    setSelectedHostel(hostel);
    setRejectModalOpen(true);
  };

  // Handle Reject Confirmation from Modal
  const handleRejectConfirm = async (reason) => {
    if (!selectedHostel) return;
    setActionLoading(selectedHostel._id);
    setError(null);
    setSuccessMessage(null);

    try {
      const res = await adminService.rejectHostel(selectedHostel._id, reason);
      if (res.success) {
        setSuccessMessage(`✓ "${selectedHostel.name}" was rejected.`);
        // Remove from pending list
        setPendingHostels((prev) =>
          prev.filter((h) => h._id !== selectedHostel._id)
        );
        setRejectModalOpen(false);
        setSelectedHostel(null);
      }
    } catch (err) {
      console.error('Reject failed:', err);
      setError(err.response?.data?.message || 'Failed to reject hostel');
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Clock className="w-6 h-6 animate-pulse" />
            </div>
            <span>Pending Hostel Approvals</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Review submitted hostel property applications before making them visible to students.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={fetchPendingHostels}
          icon={RefreshCw}
        >
          Refresh Queue
        </Button>
      </div>

      {/* Success Notification */}
      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-sm flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Error Alert */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Content Section */}
      {loading ? (
        <LoadingSpinner text="Checking moderation queue for pending hostels..." />
      ) : pendingHostels.length > 0 ? (
        <div className="space-y-6">
          {pendingHostels.map((hostel) => (
            <div
              key={hostel._id}
              className="bg-rose-50/90 border border-white rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl space-y-6 hover:border-rose-100 transition-colors"
            >
              {/* Header: Title, Type, Status */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white pb-5">
                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="text-xl font-bold text-slate-800 tracking-tight">
                      {hostel.name}
                    </h3>
                    <span className="px-2.5 py-0.5 rounded-lg text-xs font-semibold bg-teal-500/20 text-teal-600 border border-teal-500/30">
                      {hostel.type} Hostel
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-teal-400" />
                    <span>
                      {hostel.address}, {hostel.city}, {hostel.state} - {hostel.pincode}
                    </span>
                  </p>
                </div>

                <StatusBadge status={hostel.status} />
              </div>

              {/* Grid: Description, Capacity, Manager Info, Amenities */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* 1. Property Details */}
                <div className="space-y-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Property Info
                  </span>
                  <p className="text-xs text-slate-600 leading-relaxed bg-rose-50/60 p-3.5 rounded-xl border border-white/80">
                    {hostel.description || 'No description provided.'}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-slate-600">
                    <BedDouble className="w-4 h-4 text-emerald-400" />
                    <span>
                      Capacity: <strong>{hostel.totalRooms}</strong> Rooms (
                      {hostel.totalBeds} Total Beds)
                    </span>
                  </div>
                </div>

                {/* 2. Manager Contact Info */}
                <div className="space-y-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Manager In-Charge
                  </span>
                  <div className="bg-rose-50/60 p-3.5 rounded-xl border border-white/80 space-y-2 text-xs">
                    <p className="font-semibold text-slate-800 flex items-center gap-2">
                      <User className="w-3.5 h-3.5 text-cyan-400" />
                      <span>{hostel.manager?.name || 'Unassigned Manager'}</span>
                    </p>
                    <p className="text-slate-400 flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-rose-300" />
                      <span>{hostel.manager?.email || hostel.contactEmail}</span>
                    </p>
                    <p className="text-slate-400 flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-rose-300" />
                      <span>{hostel.manager?.phone || hostel.contactPhone}</span>
                    </p>
                  </div>
                </div>

                {/* 3. Amenities */}
                <div className="space-y-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Listed Amenities
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {hostel.amenities && hostel.amenities.length > 0 ? (
                      hostel.amenities.map((amenity, idx) => (
                        <span
                          key={idx}
                          className="px-2.5 py-1 rounded-lg text-xs font-medium bg-white/80 text-slate-600 border border-rose-100/80 flex items-center gap-1"
                        >
                          <Tag className="w-3 h-3 text-teal-400" />
                          <span>{amenity}</span>
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-rose-300">None listed</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons: Approve & Reject */}
              <div className="pt-4 border-t border-white/80 flex flex-col sm:flex-row items-center justify-end gap-3">
                <Button
                  variant="danger"
                  onClick={() => openRejectModal(hostel)}
                  disabled={actionLoading === hostel._id}
                  icon={XCircle}
                  size="md"
                >
                  Reject Application
                </Button>
                <Button
                  variant="success"
                  onClick={() => handleApprove(hostel)}
                  loading={actionLoading === hostel._id}
                  icon={CheckCircle2}
                  size="md"
                >
                  Approve & Publish Hostel
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-rose-50/80 border border-white rounded-3xl p-12 text-center space-y-4">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-800">All Caught Up!</h3>
          <p className="text-sm text-slate-400 max-w-md mx-auto">
            There are no pending hostel applications in the verification queue. All
            registered properties have been moderated.
          </p>
        </div>
      )}

      {/* Reject Confirmation Modal */}
      <RejectModal
        isOpen={rejectModalOpen}
        onClose={() => setRejectModalOpen(false)}
        onConfirm={handleRejectConfirm}
        hostelName={selectedHostel?.name}
        loading={actionLoading === selectedHostel?._id}
      />
    </div>
  );
};

export default PendingApprovalsPage;
