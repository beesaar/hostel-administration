import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Building2,
  MapPin,
  User,
  BedDouble,
  RefreshCw,
  Clock,
  CheckCircle2,
  XCircle,
  Eye,
  Trash2,
} from 'lucide-react';
import { adminService } from '../../services/adminService';
import Table from '../../components/Table';
import StatusBadge from '../../components/StatusBadge';
import Button from '../../components/Button';
import LoadingSpinner from '../../components/LoadingSpinner';

export const HostelsListPage = () => {
  const [hostels, setHostels] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchHostels = async (filter = '', searchQuery = '') => {
    try {
      setError(null);
      const res = await adminService.getAllHostels(filter, searchQuery);
      if (res.success) {
        setHostels(res.hostels || []);
      }
    } catch (err) {
      console.error('Error fetching hostels:', err);
      setError(err.response?.data?.message || 'Failed to fetch hostels list');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchHostels(statusFilter, search);
    }, 300);

    return () => clearTimeout(timer);
  }, [statusFilter, search]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchHostels(statusFilter, search);
  };

  const handleDelete = async (id, name) => {
    if (
      window.confirm(
        `Are you sure you want to delete hostel "${name}"?\n\nWARNING: All rooms associated with this hostel will also be deleted. This action cannot be undone.`
      )
    ) {
      try {
        const res = await adminService.deleteHostel(id);
        if (res.success) {
          fetchHostels(statusFilter, search);
        }
      } catch (err) {
        console.error('Error deleting hostel:', err);
        setError(err.response?.data?.message || 'Failed to delete hostel');
      }
    }
  };

  const tabs = [
    { label: 'All Hostels', value: '' },
    { label: 'Approved', value: 'Approved' },
    { label: 'Pending', value: 'Pending' },
    { label: 'Rejected', value: 'Rejected' },
  ];

  const columns = [
    {
      header: 'Hostel Name & Type',
      accessor: 'name',
      render: (row) => (
        <div className="space-y-1">
          <p className="font-bold text-slate-800 text-sm">{row.name}</p>
          <div className="flex items-center gap-2 text-xs">
            <span className="px-2 py-0.5 rounded bg-white text-slate-600 border border-rose-100 font-medium">
              {row.type}
            </span>
            <span className="text-slate-400 truncate max-w-xs">{row.description}</span>
          </div>
        </div>
      ),
    },
    {
      header: 'Location',
      accessor: 'city',
      render: (row) => (
        <div className="flex items-start gap-1.5 text-xs text-slate-600">
          <MapPin className="w-3.5 h-3.5 text-teal-400 shrink-0 mt-0.5" />
          <span>
            {row.city}, {row.state} ({row.pincode})
          </span>
        </div>
      ),
    },
    {
      header: 'Assigned Manager',
      accessor: 'manager',
      render: (row) => (
        <div className="space-y-0.5 text-xs">
          <p className="font-semibold text-slate-700 flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-cyan-400" />
            <span>{row.manager?.name || 'Unassigned'}</span>
          </p>
          <p className="text-slate-400 pl-5">{row.manager?.phone || row.contactPhone}</p>
        </div>
      ),
    },
    {
      header: 'Capacity',
      accessor: 'totalRooms',
      render: (row) => (
        <div className="flex items-center gap-2 text-xs text-slate-600">
          <BedDouble className="w-3.5 h-3.5 text-emerald-400" />
          <span>
            <strong>{row.totalRooms}</strong> Rooms ({row.totalBeds} Beds)
          </span>
        </div>
      ),
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (row) => (
        <div className="space-y-1">
          <StatusBadge status={row.status} />
          {row.status === 'Rejected' && row.rejectionReason && (
            <p className="text-[11px] text-rose-400 italic max-w-xs">
              Reason: {row.rejectionReason}
            </p>
          )}
        </div>
      ),
    },
    {
      header: 'Action',
      accessor: '_id',
      render: (row) => (
        <div className="flex items-center gap-2">
          {row.status === 'Pending' && (
            <Link to="/admin/pending-approvals">
              <Button variant="outline" size="sm" icon={Eye}>
                Review
              </Button>
            </Link>
          )}
          <Button
            variant="danger"
            size="sm"
            onClick={() => handleDelete(row._id, row.name)}
            icon={Trash2}
          >
            Delete
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Building2 className="w-6 h-6" />
            </div>
            <span>All Hostels Directory</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Browse and inspect all submitted properties across all approval stages. Total:{' '}
            <strong className="text-emerald-400">{hostels.length}</strong>
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          loading={refreshing}
          icon={RefreshCw}
        >
          Refresh List
        </Button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 p-1.5 bg-rose-50/90 border border-white rounded-2xl w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setStatusFilter(tab.value)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              statusFilter === tab.value
                ? 'bg-teal-600 text-slate-800 shadow-md shadow-teal-600/20'
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

      {/* Table Section */}
      {loading ? (
        <LoadingSpinner text="Fetching hostel properties..." />
      ) : (
        <Table
          columns={columns}
          data={hostels}
          searchValue={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search hostel by name, city, or state..."
          emptyMessage="No hostels found"
          emptySubtext="No properties match your current filter and search query."
        />
      )}
    </div>
  );
};

export default HostelsListPage;
