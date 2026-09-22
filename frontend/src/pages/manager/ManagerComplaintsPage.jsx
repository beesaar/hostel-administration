import React, { useState, useEffect } from 'react';
import { CalendarDays, MapPin, Search, Edit, MessageSquareWarning, XCircle, ArrowRight } from 'lucide-react';
import complaintService from '../../services/complaintService';
import LoadingSpinner from '../../components/LoadingSpinner';
import StatusBadge from '../../components/StatusBadge';
import Button from '../../components/Button';
import Toast from '../../components/Toast';

const ManagerComplaintsPage = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [formData, setFormData] = useState({ status: '', managerResponse: '' });
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const data = await complaintService.getManagerComplaints();
      setComplaints(data);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch complaints:', err);
      setError('Failed to load complaints.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (complaint) => {
    setSelectedComplaint(complaint);
    setFormData({ status: complaint.status, managerResponse: complaint.managerResponse || '' });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedComplaint(null);
    setFormData({ status: '', managerResponse: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedComplaint) return;

    try {
      setSubmitting(true);
      await complaintService.updateComplaintStatus(selectedComplaint._id, {
        status: formData.status,
        managerResponse: formData.managerResponse
      });
      setToast({ show: true, message: 'Complaint updated successfully.', type: 'success' });
      handleCloseModal();
      fetchComplaints();
    } catch (err) {
      console.error('Error updating complaint:', err);
      setToast({ show: true, message: err.response?.data?.message || 'Failed to update complaint.', type: 'error' });
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

  const filteredComplaints = filter === 'All' 
    ? complaints 
    : complaints.filter(c => c.status === filter);

  return (
    <div className="space-y-6 relative">
      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ ...toast, show: false })}
        />
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
            Complaints Management
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Review and resolve student complaints for your hostels.
          </p>
        </div>
        
        <div className="flex bg-white border border-slate-200 p-1 rounded-xl">
          {['All', 'Pending', 'In Progress', 'Resolved'].map(tab => (
             <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                  filter === tab 
                    ? 'bg-violet-100 text-violet-700' 
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
             >
               {tab}
             </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" className="text-violet-500" />
        </div>
      ) : error ? (
        <div className="p-6 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-500 text-center">
          <p className="font-semibold">{error}</p>
        </div>
      ) : filteredComplaints.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 bg-white/50 border border-white rounded-2xl">
          <MessageSquareWarning className="w-12 h-12 text-slate-300 mb-4" />
          <p className="text-slate-500 font-medium">No complaints found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredComplaints.map((complaint) => (
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
                  <div className="flex justify-between border-b border-slate-200 pb-2">
                    <span className="font-medium text-slate-400">Student</span>
                    <span className="font-semibold text-slate-700">{complaint.student?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-slate-400">Hostel</span>
                    <span className="font-semibold text-slate-700">{complaint.hostel?.name || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-slate-400">Room</span>
                    <span className="font-semibold text-slate-700">{complaint.room?.roomNumber || 'N/A'}</span>
                  </div>
                </div>
              </div>
              
              <div className="mt-5 pt-4 border-t border-slate-100 flex justify-end">
                 <Button onClick={() => handleOpenModal(complaint)} variant="outline" className="w-full text-sm py-2 bg-violet-50 text-violet-700 hover:bg-violet-100 border-violet-200">
                    Update Status
                 </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Complaint Update Modal */}
      {isModalOpen && selectedComplaint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm transition-all">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-lg overflow-hidden border border-white">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h2 className="text-xl font-bold text-slate-800">Update Complaint</h2>
              <button onClick={handleCloseModal} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
                 <XCircle className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Update Status</label>
                <select
                  required
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none transition-all"
                >
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Manager Response / Note</label>
                <textarea
                  rows="4"
                  placeholder="Leave a response for the student (e.g. Maintenance team informed)..."
                  value={formData.managerResponse}
                  onChange={(e) => setFormData({ ...formData, managerResponse: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none transition-all resize-none"
                />
              </div>

              <div className="pt-2 flex gap-3 justify-end">
                <Button type="button" variant="outline" onClick={handleCloseModal}>
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting} className="bg-violet-600 hover:bg-violet-700">
                  {submitting ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default ManagerComplaintsPage;
