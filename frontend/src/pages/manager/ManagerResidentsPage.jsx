import React, { useState, useEffect, useMemo } from 'react';
import {
  Users,
  Building2,
  BedDouble,
  Mail,
  Phone,
  Search,
  RotateCcw,
  Eye,
  X,
  CalendarDays,
  IndianRupee,
  MapPin,
  LogOut,
  CheckCircle2,
} from 'lucide-react';
import { bookingService } from '../../services/bookingService';
import LoadingSpinner from '../../components/LoadingSpinner';
import Toast from '../../components/Toast';

const ManagerResidentsPage = () => {
  const [residents, setResidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedResident, setSelectedResident] = useState(null);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    fetchResidents();
  }, []);

  const fetchResidents = async () => {
    try {
      setLoading(true);
      const data = await bookingService.getManagerResidents();
      setResidents(data);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch residents:', err);
      setError('Failed to load residents. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const filteredResidents = useMemo(() => {
    if (!searchTerm) return residents;
    const term = searchTerm.toLowerCase();
    return residents.filter(r =>
      [r.student?.name, r.student?.email, r.student?.phone, r.hostel?.name, r.room?.roomNumber?.toString()]
        .some(f => f?.toLowerCase().includes(term))
    );
  }, [residents, searchTerm]);

  const activeCount = residents.filter(r => r.status === 'Approved').length;
  const leaveCount = residents.filter(r => r.status === 'Leave_Requested').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-3">
            <div className="p-2 rounded-xl bg-teal-500/10 text-teal-600 border border-teal-500/20">
              <Users className="w-5 h-5" />
            </div>
            Residents Directory
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Current residents in your managed hostels — Active and pending leave.
          </p>
        </div>
        <button
          onClick={fetchResidents}
          className="flex items-center gap-1.5 px-3 py-2 bg-white border border-rose-100 rounded-xl text-xs font-semibold text-slate-600 hover:text-teal-600 hover:border-teal-200 transition-all shrink-0 cursor-pointer shadow-sm"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Refresh
        </button>
      </div>

      {/* KPI Summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white/70 backdrop-blur-xl border border-white p-4 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold text-slate-400">Total Residents</span>
            <Users className="w-4 h-4 text-slate-400" />
          </div>
          <p className="text-2xl font-bold text-slate-800">{residents.length}</p>
        </div>
        <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold text-emerald-700">Active</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-bold text-emerald-700">{activeCount}</p>
        </div>
        <div className="bg-orange-500/10 border border-orange-500/20 p-4 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold text-orange-700">Leave Pending</span>
            <LogOut className="w-4 h-4 text-orange-500" />
          </div>
          <p className="text-2xl font-bold text-orange-700">{leaveCount}</p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white/70 backdrop-blur-xl border border-white p-3 rounded-2xl shadow-sm">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by student name, email, phone, hostel, or room..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-rose-50/70 border border-white rounded-xl text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-400 transition-colors"
          />
        </div>
      </div>

      {/* Residents Grid */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" className="text-teal-500" />
        </div>
      ) : error ? (
        <div className="p-6 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-500 text-center">
          <p className="font-semibold">{error}</p>
          <button onClick={fetchResidents} className="mt-3 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-sm font-semibold cursor-pointer transition-colors">Retry</button>
        </div>
      ) : filteredResidents.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 bg-white/50 border border-white rounded-3xl space-y-2">
          <Users className="w-10 h-10 text-slate-200" />
          <p className="text-slate-500 font-medium">
            {searchTerm ? 'No residents match your search.' : 'No current residents in your hostels.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {filteredResidents.map(resident => (
            <div
              key={resident._id}
              className={`bg-white/80 border rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between ${
                resident.status === 'Leave_Requested' ? 'border-orange-200' : 'border-white'
              }`}
            >
              {resident.status === 'Leave_Requested' && (
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-orange-600 bg-orange-50 border border-orange-200 px-2.5 py-1 rounded-lg mb-3">
                  <LogOut className="w-3 h-3" /> Leave Request Pending
                </div>
              )}

              <div className="flex items-start gap-3 mb-4">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-teal-400 to-cyan-500 text-slate-800 flex items-center justify-center font-bold text-base shadow-md shrink-0">
                  {resident.student?.name ? resident.student.name.charAt(0).toUpperCase() : 'S'}
                </div>
                <div className="min-w-0">
                  <h3 className="font-bold text-slate-800 truncate">{resident.student?.name || 'Unknown'}</h3>
                  <div className="space-y-0.5 mt-0.5">
                    {resident.student?.email && (
                      <p className="text-xs text-slate-500 flex items-center gap-1 truncate">
                        <Mail className="w-3 h-3 text-teal-500 shrink-0" />
                        {resident.student.email}
                      </p>
                    )}
                    {resident.student?.phone && (
                      <p className="text-xs text-slate-500 flex items-center gap-1">
                        <Phone className="w-3 h-3 text-teal-500 shrink-0" />
                        {resident.student.phone}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-rose-50/40 rounded-xl p-3 border border-rose-50/80 space-y-2 text-xs mb-4">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 flex items-center gap-1.5"><Building2 className="w-3.5 h-3.5 text-teal-500" />Hostel</span>
                  <span className="font-bold text-slate-800 truncate max-w-[120px]">{resident.hostel?.name}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 flex items-center gap-1.5"><BedDouble className="w-3.5 h-3.5 text-teal-500" />Room</span>
                  <span className="font-bold text-slate-800">
                    Room {resident.room?.roomNumber}
                    {resident.room?.floor && <span className="font-normal text-slate-500"> · {resident.room.floor}</span>}
                  </span>
                </div>
                {resident.approvedAt && (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 flex items-center gap-1.5"><CalendarDays className="w-3.5 h-3.5 text-teal-500" />Joined</span>
                    <span className="text-slate-600">{new Date(resident.approvedAt).toLocaleDateString()}</span>
                  </div>
                )}
              </div>

              <button
                onClick={() => setSelectedResident(resident)}
                className="w-full flex items-center justify-center gap-2 bg-teal-50 hover:bg-teal-100 text-teal-700 border border-teal-200 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5" />
                View Full Profile
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Resident Detail Modal */}
      {selectedResident && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 border border-white animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-teal-400 to-cyan-500 text-slate-800 flex items-center justify-center font-bold text-lg shadow-md">
                  {selectedResident.student?.name ? selectedResident.student.name.charAt(0).toUpperCase() : 'S'}
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-base">{selectedResident.student?.name}</h3>
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    selectedResident.status === 'Leave_Requested'
                      ? 'bg-orange-100 text-orange-700'
                      : 'bg-emerald-100 text-emerald-700'
                  }`}>
                    {selectedResident.status === 'Leave_Requested'
                      ? <><LogOut className="w-2.5 h-2.5" /> Leave Pending</>
                      : <><CheckCircle2 className="w-2.5 h-2.5" /> Active Resident</>}
                  </span>
                </div>
              </div>
              <button onClick={() => setSelectedResident(null)} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Contact Information</h4>
              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-100 text-xs">
                <div>
                  <span className="text-slate-400 block mb-0.5">Email</span>
                  <span className="font-semibold text-slate-700">{selectedResident.student?.email || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">Phone</span>
                  <span className="font-semibold text-slate-700">{selectedResident.student?.phone || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">Registered On</span>
                  <span className="font-semibold text-slate-700">
                    {selectedResident.student?.createdAt
                      ? new Date(selectedResident.student.createdAt).toLocaleDateString()
                      : 'N/A'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">Role</span>
                  <span className="font-semibold text-slate-700">Student</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Accommodation Details</h4>
              <div className="space-y-2 bg-rose-50/40 p-3.5 rounded-2xl border border-rose-50/80 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 flex items-center gap-1.5"><Building2 className="w-3.5 h-3.5 text-teal-500" />Hostel</span>
                  <span className="font-bold text-slate-800">{selectedResident.hostel?.name}</span>
                </div>
                {selectedResident.hostel?.address && (
                  <div className="flex items-start gap-1.5 text-slate-500">
                    <MapPin className="w-3.5 h-3.5 text-teal-500 mt-0.5 shrink-0" />
                    <span>{selectedResident.hostel.address}, {selectedResident.hostel.city}</span>
                  </div>
                )}
                <div className="flex items-center justify-between pt-1 border-t border-rose-100/80">
                  <span className="text-slate-500 flex items-center gap-1.5"><BedDouble className="w-3.5 h-3.5 text-teal-500" />Room Number</span>
                  <span className="font-bold text-slate-800">Room {selectedResident.room?.roomNumber}</span>
                </div>
                {selectedResident.room?.floor && (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Floor</span>
                    <span className="font-semibold text-slate-700">{selectedResident.room.floor}</span>
                  </div>
                )}
                {selectedResident.room?.gender && (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Room Category</span>
                    <span className="font-semibold text-slate-700">{selectedResident.room.gender}</span>
                  </div>
                )}
                {selectedResident.room?.monthlyRent !== undefined && (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 flex items-center gap-1.5"><IndianRupee className="w-3.5 h-3.5 text-emerald-500" />Monthly Rent</span>
                    <span className="font-bold text-emerald-600">&#8377;{selectedResident.room.monthlyRent}/month</span>
                  </div>
                )}
                {selectedResident.approvedAt && (
                  <div className="flex items-center justify-between pt-1 border-t border-rose-100/80">
                    <span className="text-slate-500 flex items-center gap-1.5"><CalendarDays className="w-3.5 h-3.5 text-teal-500" />Date Joined</span>
                    <span className="font-semibold text-slate-700">
                      {new Date(selectedResident.approvedAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {selectedResident.status === 'Leave_Requested' && (
              <div>
                <h4 className="text-xs font-bold text-orange-600 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <LogOut className="w-3.5 h-3.5" /> Leave Request Details
                </h4>
                <div className="bg-orange-50 border border-orange-200 p-3.5 rounded-2xl space-y-2 text-xs">
                  {selectedResident.leaveRequestedAt && (
                    <div className="flex items-center justify-between">
                      <span className="text-orange-600">Request Date</span>
                      <span className="font-semibold text-slate-700">
                        {new Date(selectedResident.leaveRequestedAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                      </span>
                    </div>
                  )}
                  {selectedResident.leaveReason && (
                    <div>
                      <span className="text-orange-600 block mb-1">Student's Reason:</span>
                      <div className="p-2 bg-white rounded-lg border border-orange-100 text-slate-700 italic">
                        "{selectedResident.leaveReason}"
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedResident(null)}
                className="px-5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}
    </div>
  );
};

export default ManagerResidentsPage;
