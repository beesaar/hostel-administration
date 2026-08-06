import React from 'react';
import { Link } from 'react-router-dom';
import {
  MapPin,
  BedDouble,
  DoorOpen,
  IndianRupee,
  Eye,
  Pencil,
  Trash2,
  Tag,
} from 'lucide-react';
import StatusBadge from './StatusBadge';

export const HostelCard = ({ hostel, onDelete }) => {
  return (
    <div className="group bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden backdrop-blur-xl shadow-lg hover:border-slate-700 transition-all duration-300 hover:-translate-y-0.5">
      {/* Top Gradient Accent */}
      <div
        className={`h-1.5 ${
          hostel.type === 'Boys'
            ? 'bg-gradient-to-r from-blue-500 to-indigo-600'
            : hostel.type === 'Girls'
            ? 'bg-gradient-to-r from-pink-500 to-rose-600'
            : 'bg-gradient-to-r from-emerald-500 to-cyan-600'
        }`}
      />

      <div className="p-5 sm:p-6 space-y-4">
        {/* Header Row: Name, Type Badge, Status */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-white tracking-tight leading-tight">
              {hostel.name}
            </h3>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <MapPin className="w-3.5 h-3.5 text-indigo-400" />
              <span>
                {hostel.city}, {hostel.state} — {hostel.pincode}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`px-2.5 py-0.5 rounded-lg text-xs font-semibold border ${
                hostel.type === 'Boys'
                  ? 'bg-blue-500/10 text-blue-300 border-blue-500/30'
                  : hostel.type === 'Girls'
                  ? 'bg-pink-500/10 text-pink-300 border-pink-500/30'
                  : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
              }`}
            >
              {hostel.type}
            </span>
            <StatusBadge status={hostel.status} />
          </div>
        </div>

        {/* Rejection Reason */}
        {hostel.status === 'Rejected' && hostel.rejectionReason && (
          <div className="p-3 rounded-xl bg-rose-500/5 border border-rose-500/20 text-xs text-rose-300">
            <strong>Reason:</strong> {hostel.rejectionReason}
          </div>
        )}

        {/* Quick Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-950/50 border border-slate-800/80 text-xs text-slate-300">
            <DoorOpen className="w-3.5 h-3.5 text-indigo-400" />
            <span>
              <strong className="text-white">{hostel.totalRooms || 0}</strong> Rooms
            </span>
          </div>
          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-950/50 border border-slate-800/80 text-xs text-slate-300">
            <BedDouble className="w-3.5 h-3.5 text-cyan-400" />
            <span>
              <strong className="text-white">{hostel.totalBeds || 0}</strong> Beds
            </span>
          </div>
          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-950/50 border border-slate-800/80 text-xs text-slate-300">
            <IndianRupee className="w-3.5 h-3.5 text-amber-400" />
            <span>
              ₹<strong className="text-white">{hostel.startingRent || 0}</strong>/mo
            </span>
          </div>
          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-950/50 border border-slate-800/80 text-xs text-slate-300">
            <IndianRupee className="w-3.5 h-3.5 text-emerald-400" />
            <span>
              ₹<strong className="text-white">{hostel.securityDeposit || 0}</strong> Dep
            </span>
          </div>
        </div>

        {/* Facilities Tags */}
        {hostel.facilities && hostel.facilities.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {hostel.facilities.slice(0, 5).map((f, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-800 text-slate-300 border border-slate-700"
              >
                <Tag className="w-2.5 h-2.5 text-indigo-400" />
                {f}
              </span>
            ))}
            {hostel.facilities.length > 5 && (
              <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-800 text-slate-400 border border-slate-700">
                +{hostel.facilities.length - 5} more
              </span>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center gap-2 pt-2 border-t border-slate-800/60">
          <Link to={`/manager/hostels/${hostel._id}`} className="flex-1">
            <button className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-indigo-300 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 transition-colors cursor-pointer">
              <Eye className="w-3.5 h-3.5" />
              View
            </button>
          </Link>
          <Link to={`/manager/hostels/${hostel._id}/edit`} className="flex-1">
            <button className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 transition-colors cursor-pointer">
              <Pencil className="w-3.5 h-3.5" />
              Edit
            </button>
          </Link>
          <button
            onClick={() => onDelete?.(hostel)}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default HostelCard;
