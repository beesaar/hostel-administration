import React from 'react';
import { CheckCircle2, Clock, XCircle, Shield, UserCheck, GraduationCap } from 'lucide-react';

export const StatusBadge = ({ status }) => {
  const getBadgeConfig = (statusStr) => {
    switch (statusStr?.toLowerCase()) {
      case 'approved':
        return {
          bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
          icon: <CheckCircle2 className="w-3.5 h-3.5" />,
          label: 'Approved',
        };
      case 'pending':
        return {
          bg: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
          icon: <Clock className="w-3.5 h-3.5 animate-pulse" />,
          label: 'Pending Approval',
        };
      case 'rejected':
        return {
          bg: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
          icon: <XCircle className="w-3.5 h-3.5" />,
          label: 'Rejected',
        };
      case 'admin':
        return {
          bg: 'bg-teal-500/10 text-teal-600 border-teal-500/30',
          icon: <Shield className="w-3.5 h-3.5" />,
          label: 'Admin',
        };
      case 'hostel manager':
        return {
          bg: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30',
          icon: <UserCheck className="w-3.5 h-3.5" />,
          label: 'Hostel Manager',
        };
      case 'student':
        return {
          bg: 'bg-blue-500/10 text-blue-300 border-blue-500/30',
          icon: <GraduationCap className="w-3.5 h-3.5" />,
          label: 'Student',
        };
      case 'leave_requested':
        return {
          bg: 'bg-orange-500/10 text-orange-400 border-orange-500/30',
          icon: <Clock className="w-3.5 h-3.5" />,
          label: 'Leave Request',
        };
      case 'cancelled':
        return {
          bg: 'bg-slate-500/10 text-slate-400 border-slate-500/30',
          icon: <XCircle className="w-3.5 h-3.5" />,
          label: 'Cancelled',
        };
      case 'completed':
        return {
          bg: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30',
          icon: <CheckCircle2 className="w-3.5 h-3.5" />,
          label: 'Completed',
        };
      case 'in progress':
        return {
          bg: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
          icon: <Clock className="w-3.5 h-3.5 animate-pulse" />,
          label: 'In Progress',
        };
      case 'resolved':
        return {
          bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
          icon: <CheckCircle2 className="w-3.5 h-3.5" />,
          label: 'Resolved',
        };
      default:
        return {
          bg: 'bg-white text-slate-600 border-rose-100',
          icon: null,
          label: statusStr || 'Unknown',
        };
    }
  };

  const config = getBadgeConfig(status);

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${config.bg}`}
    >
      {config.icon}
      <span>{config.label}</span>
    </span>
  );
};

export default StatusBadge;
