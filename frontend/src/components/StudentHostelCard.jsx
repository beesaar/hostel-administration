import React from 'react';
import { Link } from 'react-router-dom';
import {
  MapPin,
  BedDouble,
  DoorOpen,
  IndianRupee,
  Eye,
  Tag,
} from 'lucide-react';

export const StudentHostelCard = ({ hostel }) => {
  return (
    <div className="group bg-rose-50/80 border border-white rounded-2xl overflow-hidden backdrop-blur-xl shadow-lg hover:border-rose-100 transition-all duration-300 hover:-translate-y-0.5">

      <div className="p-5 sm:p-6 space-y-4">
        {/* Header Row: Name, Type Badge */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-slate-800 tracking-tight leading-tight">
              {hostel.name}
            </h3>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <MapPin className="w-3.5 h-3.5 text-teal-400" />
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
          </div>
        </div>

        {/* Quick Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-rose-50/50 border border-white/80 text-xs text-slate-600">
            <DoorOpen className="w-3.5 h-3.5 text-teal-400" />
            <span>
              <strong className="text-slate-800">{hostel.totalRooms || 0}</strong> Rooms
            </span>
          </div>
          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-rose-50/50 border border-white/80 text-xs text-slate-600">
            <BedDouble className="w-3.5 h-3.5 text-cyan-400" />
            <span>
              <strong className="text-slate-800">{hostel.totalBeds || 0}</strong> Beds
            </span>
          </div>
          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-rose-50/50 border border-white/80 text-xs text-slate-600">
            <IndianRupee className="w-3.5 h-3.5 text-amber-400" />
            <span>
              ₹<strong className="text-slate-800">{hostel.startingRent || 0}</strong>/mo
            </span>
          </div>
          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-rose-50/50 border border-white/80 text-xs text-slate-600">
            <IndianRupee className="w-3.5 h-3.5 text-emerald-400" />
            <span>
              ₹<strong className="text-slate-800">{hostel.securityDeposit || 0}</strong> Dep
            </span>
          </div>
        </div>

        {/* Facilities Tags */}
        {hostel.facilities && hostel.facilities.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {hostel.facilities.slice(0, 5).map((f, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-white text-slate-600 border border-rose-100"
              >
                <Tag className="w-2.5 h-2.5 text-teal-400" />
                {f}
              </span>
            ))}
            {hostel.facilities.length > 5 && (
              <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-white text-slate-400 border border-rose-100">
                +{hostel.facilities.length - 5} more
              </span>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="pt-2 border-t border-white/60">
          <Link to={`/student/hostels/${hostel._id}`}>
            <button className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-teal-600 bg-teal-500/10 hover:bg-teal-500/20 border border-teal-500/20 transition-colors cursor-pointer">
              <Eye className="w-3.5 h-3.5" />
              View Details
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default StudentHostelCard;
