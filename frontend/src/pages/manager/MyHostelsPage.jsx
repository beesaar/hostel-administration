import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Building2, PlusCircle, RefreshCw, Inbox } from 'lucide-react';
import { managerService } from '../../services/managerService';
import HostelCard from '../../components/HostelCard';
import Button from '../../components/Button';
import LoadingSpinner from '../../components/LoadingSpinner';
import ConfirmDialog from '../../components/ConfirmDialog';
import Toast from '../../components/Toast';

export const MyHostelsPage = () => {
  const [hostels, setHostels] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState({ message: '', type: 'success' });

  // Delete dialog state
  const [deleteDialog, setDeleteDialog] = useState({
    isOpen: false,
    hostel: null,
    loading: false,
  });

  const fetchHostels = async (filter = '') => {
    try {
      setError(null);
      const res = await managerService.getMyHostels(filter);
      if (res.success) {
        setHostels(res.hostels || []);
      }
    } catch (err) {
      console.error('Error fetching hostels:', err);
      setError(err.response?.data?.message || 'Failed to fetch your hostels');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHostels(statusFilter);
  }, [statusFilter]);

  // Open delete confirmation
  const handleDeleteClick = (hostel) => {
    setDeleteDialog({ isOpen: true, hostel, loading: false });
  };

  // Confirm delete
  const handleDeleteConfirm = async () => {
    const { hostel } = deleteDialog;
    if (!hostel) return;

    setDeleteDialog((prev) => ({ ...prev, loading: true }));

    try {
      const res = await managerService.deleteHostel(hostel._id);
      if (res.success) {
        setHostels((prev) => prev.filter((h) => h._id !== hostel._id));
        setToast({ message: res.message, type: 'success' });
      }
    } catch (err) {
      setToast({
        message: err.response?.data?.message || 'Failed to delete hostel',
        type: 'error',
      });
    } finally {
      setDeleteDialog({ isOpen: false, hostel: null, loading: false });
    }
  };

  const tabs = [
    { label: 'All', value: '' },
    { label: 'Approved', value: 'Approved' },
    { label: 'Pending', value: 'Pending' },
    { label: 'Rejected', value: 'Rejected' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Toast */}
      <Toast
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ message: '', type: 'success' })}
      />

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Building2 className="w-6 h-6" />
            </div>
            <span>My Hostels</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Manage all your registered hostel properties. Total:{' '}
            <strong className="text-cyan-400">{hostels.length}</strong>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => { setLoading(true); fetchHostels(statusFilter); }}
            icon={RefreshCw}
          >
            Refresh
          </Button>
          <Link to="/manager/hostels/new">
            <Button variant="primary" size="sm" icon={PlusCircle}>
              Add Hostel
            </Button>
          </Link>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 p-1.5 bg-rose-50/90 border border-white rounded-2xl w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setStatusFilter(tab.value)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              statusFilter === tab.value
                ? 'bg-cyan-600 text-slate-800 shadow-md shadow-cyan-600/20'
                : 'text-slate-400 hover:text-slate-700 hover:bg-white/60'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Error Notice */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm">
          {error}
        </div>
      )}

      {/* Hostels Grid */}
      {loading ? (
        <LoadingSpinner text="Fetching your hostel listings..." />
      ) : hostels.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {hostels.map((hostel) => (
            <HostelCard
              key={hostel._id}
              hostel={hostel}
              onDelete={handleDeleteClick}
            />
          ))}
        </div>
      ) : (
        <div className="bg-rose-50/80 border border-white rounded-3xl p-12 text-center space-y-4">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-white/60 text-rose-300 border border-rose-100/50 flex items-center justify-center">
            <Inbox className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-800">No Hostels Found</h3>
          <p className="text-sm text-slate-400 max-w-md mx-auto">
            {statusFilter
              ? `You have no hostels with "${statusFilter}" status.`
              : 'You haven\'t listed any hostels yet. Start by adding your first property!'}
          </p>
          <Link to="/manager/hostels/new">
            <Button variant="primary" icon={PlusCircle}>
              Add Your First Hostel
            </Button>
          </Link>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        onClose={() => setDeleteDialog({ isOpen: false, hostel: null, loading: false })}
        onConfirm={handleDeleteConfirm}
        title="Delete Hostel"
        message={`Are you sure you want to permanently delete "${deleteDialog.hostel?.name}"? This action cannot be undone.`}
        confirmText="Delete Permanently"
        loading={deleteDialog.loading}
      />
    </div>
  );
};

export default MyHostelsPage;
