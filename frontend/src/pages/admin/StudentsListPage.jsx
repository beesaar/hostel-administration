import React, { useState, useEffect } from 'react';
import { GraduationCap, Mail, Phone, Calendar, RefreshCw, Eye, ShieldCheck, ShieldAlert, X, BedDouble, Building2 } from 'lucide-react';
import { adminService } from '../../services/adminService';
import Table from '../../components/Table';
import StatusBadge from '../../components/StatusBadge';
import Button from '../../components/Button';
import LoadingSpinner from '../../components/LoadingSpinner';

export const StudentsListPage = () => {
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Selected student for view details modal
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [actionId, setActionId] = useState(null);

  const fetchStudents = async (searchQuery = '', statusQuery = '') => {
    try {
      setError(null);
      const res = await adminService.getAllStudents(searchQuery, statusQuery);
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
      fetchStudents(search, status);
    }, 300);

    return () => clearTimeout(timer);
  }, [search, status]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchStudents(search, status);
  };

  const handleToggleStatus = async (id, currentStatus) => {
    const targetAction = currentStatus ? 'deactivate' : 'reactivate';
    if (
      window.confirm(
        `Are you sure you want to ${targetAction} this student account? Historical records will be preserved.`
      )
    ) {
      try {
        setActionId(id);
        const res = await adminService.toggleUserStatus(id, !currentStatus);
        if (res.success) {
          fetchStudents(search, status);
        }
      } catch (err) {
        console.error(`Error toggling student status:`, err);
        setError(err.response?.data?.message || `Failed to ${targetAction} student`);
      } finally {
        setActionId(null);
      }
    }
  };

  const columns = [
    {
      header: 'Student Name',
      accessor: 'name',
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-600/20 text-blue-500 border border-blue-500/30 flex items-center justify-center font-bold text-xs">
            {row.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-semibold text-slate-800">{row.name}</p>
            <p className="text-xs text-slate-400">ID: {row._id}</p>
          </div>
        </div>
      ),
    },
    {
      header: 'Email Address',
      accessor: 'email',
      render: (row) => (
        <span className="flex items-center gap-2 text-slate-600">
          <Mail className="w-3.5 h-3.5 text-blue-500" />
          <span>{row.email}</span>
        </span>
      ),
    },
    {
      header: 'Contact Phone',
      accessor: 'phone',
      render: (row) => (
        <span className="flex items-center gap-2 text-slate-600">
          <Phone className="w-3.5 h-3.5 text-blue-500" />
          <span>{row.phone || 'N/A'}</span>
        </span>
      ),
    },
    {
      header: 'Account Status',
      accessor: 'isActive',
      render: (row) => (
        <span
          className={`px-2.5 py-1 rounded-full text-xs font-bold border inline-flex items-center gap-1.5 ${
            row.isActive !== false
              ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
              : 'bg-rose-50 text-rose-600 border-rose-200'
          }`}
        >
          {row.isActive !== false ? (
            <>
              <ShieldCheck className="w-3 h-3" /> Active
            </>
          ) : (
            <>
              <ShieldAlert className="w-3 h-3" /> Deactivated
            </>
          )}
        </span>
      ),
    },
    {
      header: 'Registered Date',
      accessor: 'createdAt',
      render: (row) => (
        <span className="flex items-center gap-2 text-slate-400 text-xs">
          <Calendar className="w-3.5 h-3.5 text-slate-400" />
          <span>{new Date(row.createdAt).toLocaleDateString()}</span>
        </span>
      ),
    },
    {
      header: 'Actions',
      accessor: '_id',
      render: (row) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSelectedStudent(row)}
            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg border border-blue-200 transition-colors cursor-pointer"
            title="View Details"
          >
            <Eye className="w-4 h-4" />
          </button>
          <Button
            variant={row.isActive !== false ? 'danger' : 'outline'}
            size="sm"
            onClick={() => handleToggleStatus(row._id, row.isActive !== false)}
            loading={actionId === row._id}
          >
            {row.isActive !== false ? 'Deactivate' : 'Reactivate'}
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-500 border border-blue-500/20">
              <GraduationCap className="w-6 h-6" />
            </div>
            <span>Registered Students Directory</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Overview of all student accounts in Unistay. Total:{' '}
            <strong className="text-blue-600">{students.length}</strong>
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
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 text-sm">
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
          actions={
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 cursor-pointer"
            >
              <option value="">All Statuses</option>
              <option value="active">Active Accounts</option>
              <option value="inactive">Deactivated</option>
            </select>
          }
        />
      )}

      {/* View Details Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 border border-white animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 font-bold flex items-center justify-center text-sm">
                  {selectedStudent.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-base">{selectedStudent.name}</h3>
                  <p className="text-xs text-slate-400">Role: {selectedStudent.role}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedStudent(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4 bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                <div>
                  <span className="text-slate-400 block mb-0.5">Email</span>
                  <span className="font-semibold text-slate-700">{selectedStudent.email}</span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">Phone</span>
                  <span className="font-semibold text-slate-700">{selectedStudent.phone || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">Account Status</span>
                  <span
                    className={`font-bold ${
                      selectedStudent.isActive !== false ? 'text-emerald-600' : 'text-rose-600'
                    }`}
                  >
                    {selectedStudent.isActive !== false ? 'Active' : 'Deactivated'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">Registered Date</span>
                  <span className="font-semibold text-slate-700">
                    {new Date(selectedStudent.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {/* Accommodation Information */}
              <div className="space-y-2">
                <h4 className="font-bold text-slate-800 flex items-center gap-1.5 text-xs">
                  <Building2 className="w-4 h-4 text-blue-500" /> Accommodation Status
                </h4>
                {selectedStudent.currentAccommodation ? (
                  <div className="p-3 bg-rose-50/40 rounded-xl border border-rose-50/80 space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-slate-800">
                        {selectedStudent.currentAccommodation.hostel?.name}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          selectedStudent.currentAccommodation.status === 'Approved'
                            ? 'bg-emerald-100 text-emerald-700'
                            : selectedStudent.currentAccommodation.status === 'Leave_Requested'
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-amber-50 text-amber-600'
                        }`}
                      >
                        {selectedStudent.currentAccommodation.status === 'Approved'
                          ? 'Active Resident'
                          : selectedStudent.currentAccommodation.status}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 flex items-center gap-1">
                      <BedDouble className="w-3 h-3 text-blue-500" /> Room{' '}
                      {selectedStudent.currentAccommodation.room?.roomNumber}{' '}
                      {selectedStudent.currentAccommodation.room?.floor &&
                        `(${selectedStudent.currentAccommodation.room.floor})`}
                    </p>
                  </div>
                ) : (
                  <p className="text-slate-400 italic">No active or pending room accommodation.</p>
                )}
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedStudent(null)}
                className="px-5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentsListPage;
