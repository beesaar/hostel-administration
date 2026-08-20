import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Pencil, ArrowLeft } from 'lucide-react';
import { managerService } from '../../services/managerService';
import HostelForm from '../../components/HostelForm';
import Button from '../../components/Button';
import LoadingSpinner from '../../components/LoadingSpinner';
import Toast from '../../components/Toast';

export const EditHostelPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [hostel, setHostel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState({ message: '', type: 'success' });

  useEffect(() => {
    const fetchHostel = async () => {
      try {
        const res = await managerService.getHostelById(id);
        if (res.success) {
          setHostel(res.hostel);
        }
      } catch (err) {
        console.error('Fetch hostel error:', err);
        setError(err.response?.data?.message || 'Failed to load hostel details');
      } finally {
        setLoading(false);
      }
    };

    fetchHostel();
  }, [id]);

  const handleSubmit = async (formData) => {
    setSaving(true);
    setToast({ message: '', type: 'success' });

    try {
      const res = await managerService.updateHostel(id, formData);
      if (res.success) {
        setToast({ message: res.message, type: 'success' });
        setTimeout(() => navigate('/manager/hostels'), 1500);
      }
    } catch (err) {
      console.error('Update hostel error:', err);
      setToast({
        message: err.response?.data?.message || 'Failed to update hostel.',
        type: 'error',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingSpinner size="lg" text="Loading hostel details for editing..." />;
  }

  if (error) {
    return (
      <div className="space-y-4">
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm">
          {error}
        </div>
        <Button variant="outline" icon={ArrowLeft} onClick={() => navigate('/manager/hostels')}>
          Back to My Hostels
        </Button>
      </div>
    );
  }

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
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Pencil className="w-6 h-6" />
            </div>
            <span>Edit Hostel</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Editing: <strong className="text-slate-800">{hostel?.name}</strong>
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

      {/* Hostel Form (pre-filled with existing data) */}
      {hostel && (
        <HostelForm
          initialData={hostel}
          onSubmit={handleSubmit}
          loading={saving}
          submitLabel="Save Changes"
        />
      )}
    </div>
  );
};

export default EditHostelPage;
