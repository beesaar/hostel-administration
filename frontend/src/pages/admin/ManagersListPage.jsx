import React, { useState, useEffect } from 'react';
import { UserCheck, Mail, Phone, Calendar, RefreshCw } from 'lucide-react';
import { adminService } from '../../services/adminService';
import Table from '../../components/Table';
import StatusBadge from '../../components/StatusBadge';
import Button from '../../components/Button';
import LoadingSpinner from '../../components/LoadingSpinner';

export const ManagersListPage = () => {
  const [managers, setManagers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchManagers = async (searchQuery = '') => {
    try {
      setError(null);
      const res = await adminService.getAllManagers(searchQuery);
      if (res.success) {
        setManagers(res.managers || []);
      }
    } catch (err) {
      console.error('Error fetching managers:', err);
      setError(err.response?.data?.message || 'Failed to fetch managers list');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchManagers(search);
    }, 300);

    return () => clearTimeout(timer);
  }, [search]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchManagers(search);
  };

  const columns = [
    {
      header: 'Manager Name',
      accessor: 'name',
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-cyan-600/20 text-cyan-300 border border-cyan-500/30 flex items-center justify-center font-bold text-xs">
            {row.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-semibold text-slate-800">{row.name}</p>
            <p className="text-xs text-rose-300">ID: {row._id}</p>
          </div>
        </div>
      ),
    },
    {
      header: 'Email Address',
      accessor: 'email',
      render: (row) => (
        <span className="flex items-center gap-2 text-slate-600">
          <Mail className="w-3.5 h-3.5 text-rose-300" />
          <span>{row.email}</span>
        </span>
      ),
    },
    {
      header: 'Contact Phone',
      accessor: 'phone',
      render: (row) => (
        <span className="flex items-center gap-2 text-slate-600">
          <Phone className="w-3.5 h-3.5 text-rose-300" />
          <span>{row.phone || 'N/A'}</span>
        </span>
      ),
    },
    {
      header: 'Role',
      accessor: 'role',
      render: (row) => <StatusBadge status={row.role} />,
    },
    {
      header: 'Member Since',
      accessor: 'createdAt',
      render: (row) => (
        <span className="flex items-center gap-2 text-slate-400 text-xs">
          <Calendar className="w-3.5 h-3.5 text-rose-300" />
          <span>{new Date(row.createdAt).toLocaleDateString()}</span>
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <UserCheck className="w-6 h-6" />
            </div>
            <span>Hostel Managers Directory</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Browse and manage all registered property managers. Total:{' '}
            <strong className="text-cyan-400">{managers.length}</strong>
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

      {/* Error Notice */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm">
          {error}
        </div>
      )}

      {/* Table Section */}
      {loading ? (
        <LoadingSpinner text="Fetching manager accounts..." />
      ) : (
        <Table
          columns={columns}
          data={managers}
          searchValue={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search manager by name, email, or phone..."
          emptyMessage="No managers found"
          emptySubtext="No manager accounts match your search query."
        />
      )}
    </div>
  );
};

export default ManagersListPage;
