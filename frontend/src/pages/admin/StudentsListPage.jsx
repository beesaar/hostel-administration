import React, { useState, useEffect } from 'react';
import { GraduationCap, Mail, Phone, Calendar, RefreshCw } from 'lucide-react';
import { adminService } from '../../services/adminService';
import Table from '../../components/Table';
import StatusBadge from '../../components/StatusBadge';
import Button from '../../components/Button';
import LoadingSpinner from '../../components/LoadingSpinner';

export const StudentsListPage = () => {
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchStudents = async (searchQuery = '') => {
    try {
      setError(null);
      const res = await adminService.getAllStudents(searchQuery);
      if (res.success) {
        setStudents(res.students || []);
      }
    } catch (err) {
      console.error('Error fetching students:', err);
      setError(err.response?.data?.message || 'Failed to fetch students list');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchStudents(search);
    }, 300);

    return () => clearTimeout(timer);
  }, [search]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchStudents(search);
  };

  const columns = [
    {
      header: 'Student Name',
      accessor: 'name',
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-600/20 text-blue-300 border border-blue-500/30 flex items-center justify-center font-bold text-xs">
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
      header: 'Registered On',
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
            <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <GraduationCap className="w-6 h-6" />
            </div>
            <span>Registered Students</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Overview of all student accounts looking for hostel accommodation. Total:{' '}
            <strong className="text-blue-400">{students.length}</strong>
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
        <LoadingSpinner text="Fetching student directory..." />
      ) : (
        <Table
          columns={columns}
          data={students}
          searchValue={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search student by name, email, or phone..."
          emptyMessage="No students found"
          emptySubtext="No student accounts match your search query."
        />
      )}
    </div>
  );
};

export default StudentsListPage;
