import React, { useState, useEffect } from 'react';
import { CalendarDays, MapPin, CheckCircle2, Clock, Check, Plus, MessageSquareWarning, ArrowRight, XCircle } from 'lucide-react';
import complaintService from '../../services/complaintService';
import { bookingService } from '../../services/bookingService';
import LoadingSpinner from '../../components/LoadingSpinner';
import StatusBadge from '../../components/StatusBadge';
import Button from '../../components/Button';
import Toast from '../../components/Toast';

const StudentComplaintsPage = () => {
  const [complaints, setComplaints] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ title: '', description: '', bookingId: '' });
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  useEffect(() => {
    fetchComplaints();
    fetchBookings();
  }, []);

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const data = await complaintService.getStudentComplaints();
      setComplaints(data);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch complaints:', err);
      setError('Failed to load your complaints.');
    } finally {
      setLoading(false);
    }
  };

  const fetchBookings = async () => {
    try {
      const data = await bookingService.getStudentBookings();
      // Filter only approved bookings for complaints
      const approved = data.filter(b => b.status === 'Approved');
      setBookings(approved);
      if (approved.length === 1) {
        setFormData(prev => ({ ...prev, bookingId: approved[0]._id }));
      }
    } catch (err) {
      console.error('Failed to fetch bookings:', err);
    }
  };

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setFormData(prev => ({ ...prev, title: '', description: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.bookingId) {
      setToast({ show: true, message: 'Please select an allotted room to report a complaint.', type: 'error' });
      return;
    }

    const selectedBooking = bookings.find(b => b._id === formData.bookingId);
    
    if (!selectedBooking) return;

    try {
      setSubmitting(true);
      await complaintService.createComplaint({
        hostelId: selectedBooking.hostel._id,
        roomId: selectedBooking.room._id,
        title: formData.title,
        description: formData.description
      });
      setToast({ show: true, message: 'Complaint submitted successfully.', type: 'success' });
      handleCloseModal();
      fetchComplaints();
    } catch (err) {
      console.error('Error submitting complaint:', err);
      setToast({ show: true, message: err.response?.data?.message || 'Failed to submit complaint.', type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Resolved': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'In Progress': return 'bg-blue-100 text-blue-700 border-blue-200';
      default: return 'bg-amber-100 text-amber-700 border-amber-200';
    }
  };

  return (
    <div className="space-y-6 relative">
      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ ...toast, show: false })}
        />
      )}

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
            My Complaints
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Report issues and track their resolution status.
          </p>
        </div>
        <Button onClick={handleOpenModal} className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700">
          <Plus className="w-4 h-4" />
          File Complaint
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" className="text-violet-500" />
        </div>
      ) : error ? (
        <div className="p-6 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-500 text-center">
          <p className="font-semibold">{error}</p>
        </div>
      ) : complaints.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 bg-white/50 border border-white rounded-2xl">
          <MessageSquareWarning className="w-12 h-12 text-slate-300 mb-4" />
          <p className="text-slate-500 font-medium">You haven't reported any complaints yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {complaints.map((complaint) => (
            <div key={complaint._id} className="bg-white/80 border border-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-3">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${getStatusColor(complaint.status)}`}>
                    {complaint.status}
                  </span>
                  <div className="text-xs text-slate-400 flex items-center gap-1.5">
                    <CalendarDays className="w-4 h-4" />
                    {new Date(complaint.createdAt).toLocaleDateString()}
                  </div>
                </div>

                <h3 className="text-lg font-bold text-slate-800 leading-tight mb-2">
                  {complaint.title}
                </h3>
                
                <p className="text-sm text-slate-600 mb-4 line-clamp-3">
                  {complaint.description}
                </p>

                <div className="space-y-2 bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs text-slate-600">
                  <div className="flex justify-between">
                    <span className="font-medium text-slate-400">Hostel</span>
                    <span className="font-semibold text-slate-700">{complaint.hostel?.name || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-slate-400">Room</span>
                    <span className="font-semibold text-slate-700">{complaint.room?.roomNumber || 'N/A'}</span>
                  </div>
                </div>

                {complaint.managerResponse && (
                  <div className="mt-4 bg-violet-50/50 p-3 rounded-xl border border-violet-100/50">
                     <p className="text-xs font-bold text-violet-700 mb-1 flex items-center gap-1">
                        <ArrowRight className="w-3 h-3" />
                        Manager Response
                     </p>
                     <p className="text-sm text-slate-700 italic">"{complaint.managerResponse}"</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Complaint Form Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm transition-all">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-lg overflow-hidden border border-white">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h2 className="text-xl font-bold text-slate-800">File a Complaint</h2>
              <button onClick={handleCloseModal} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
                 <XCircle className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Select Room/Hostel</label>
                {bookings.length === 0 ? (
                  <div className="p-3 bg-amber-50 text-amber-700 border border-amber-200 rounded-xl text-sm">
                    You do not have any approved room bookings. You can only file complaints for rooms you occupy.
                  </div>
                ) : (
                  <select
                    required
                    value={formData.bookingId}
                    onChange={(e) => setFormData({ ...formData, bookingId: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none transition-all"
                  >
                    <option value="" disabled>Select your allotted room...</option>
                    {bookings.map(b => (
                      <option key={b._id} value={b._id}>
                        {b.hostel.name} - Room {b.room.roomNumber}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Complaint Category / Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Broken Fan, No Water, etc."
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Detailed Description</label>
                <textarea
                  required
                  rows="4"
                  placeholder="Describe the issue in detail..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none transition-all resize-none"
                />
              </div>

              <div className="pt-2 flex gap-3 justify-end">
                <Button type="button" variant="outline" onClick={handleCloseModal}>
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting || bookings.length === 0} className="bg-violet-600 hover:bg-violet-700">
                  {submitting ? 'Submitting...' : 'Submit Complaint'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default StudentComplaintsPage;
