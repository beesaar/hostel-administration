import React, { useState } from 'react';
import { X, AlertTriangle } from 'lucide-react';
import Button from './Button';

export const RejectModal = ({
  isOpen,
  onClose,
  onConfirm,
  hostelName = 'Hostel',
  loading = false,
}) => {
  const [reason, setReason] = useState('');

  if (!isOpen) return null;

  const handleFormSubmit = (e) => {
    e.preventDefault();
    onConfirm(reason);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Reject Hostel</h3>
              <p className="text-xs text-slate-400">Application Moderation</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-sm text-slate-300">
          You are rejecting the registration for{' '}
          <strong className="text-white">"{hostelName}"</strong>. Please provide a
          reason so the hostel manager knows what adjustments or documents are required.
        </p>

        {/* Reason Textarea */}
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Reason for Rejection
            </label>
            <textarea
              rows={3}
              required
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Fire safety license missing, invalid contact information, incomplete address details..."
              className="w-full p-3 bg-slate-950/70 border border-slate-800 rounded-xl text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition-colors"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="danger"
              loading={loading}
              disabled={!reason.trim()}
            >
              Confirm Rejection
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RejectModal;
