import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, ArrowLeft } from 'lucide-react';
import { managerService } from '../../services/managerService';
import HostelForm from '../../components/HostelForm';
import Button from '../../components/Button';
import Toast from '../../components/Toast';

export const AddHostelPage = () => {
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ message: '', type: 'success' });
  const navigate = useNavigate();

  const handleSubmit = async (formData) => {
    setLoading(true);
    setToast({ message: '', type: 'success' });

    try {
      const res = await managerService.createHostel(formData);
      if (res.success) {
        setToast({ message: res.message, type: 'success' });
        // Navigate to My Hostels after a short delay so user sees the toast
        setTimeout(() => navigate('/manager/hostels'), 1500);
      }
    } catch (err) {
      console.error('Create hostel error:', err);
      setToast({
        message: err.response?.data?.message || 'Failed to create hostel. Please check all required fields.',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

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
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <PlusCircle className="w-6 h-6" />
            </div>
            <span>Add New Hostel</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Fill in all details to submit your property for Admin approval.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          icon={ArrowLeft}
          onClick={() => navigate('/manager/hostels')}
        >
          Back to My Hostels
        </Button>
      </div>

      {/* Hostel Form */}
      <HostelForm
        onSubmit={handleSubmit}
        loading={loading}
        submitLabel="Submit for Approval"
      />
    </div>
  );
};

export default AddHostelPage;
