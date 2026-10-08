import React from 'react';
import { Link } from 'react-router-dom';
import {
  MapPin,
  BedDouble,
  DoorOpen,
  IndianRupee,
  Eye,
  Tag,
  Shield,
} from 'lucide-react';

export const StudentHostelCard = ({ hostel }) => {
  // Merge facilities + amenities for display, de-duplicated
  const allAmenities = [
    ...new Set([...(hostel.facilities || []), ...(hostel.amenities || [])]),
  ];

  const hasImage = hostel.images && hostel.images.length > 0 && hostel.images[0];

  return (
    <div className="group bg-white/70 border border-white rounded-2xl overflow-hidden backdrop-blur-xl shadow-lg hover:shadow-xl hover:border-violet-100 transition-all duration-300 hover:-translate-y-0.5 flex flex-col justify-between">
      {hasImage && (
        <div className="h-44 w-full overflow-hidden relative bg-slate-100 shrink-0">
          <img
            src={hostel.images[0]}
            alt={hostel.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
          <div className="absolute top-3 right-3">
            <span
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold backdrop-blur-md shadow-sm border ${
                hostel.type === 'Boys'
                  ? 'bg-blue-500/80 text-white border-blue-400'
                  : hostel.type === 'Girls'
                  ? 'bg-pink-500/80 text-white border-pink-400'
                  : 'bg-emerald-500/80 text-white border-emerald-400'
              }`}
            >
              {hostel.type}
            </span>
          </div>
        </div>
      )}

      <div className="p-5 sm:p-6 space-y-4 flex-1 flex flex-col justify-between">
        <div className="space-y-3">
          {/* Header Row: Name, Type Badge */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
            <div className="space-y-1 min-w-0 flex-1">
              <h3 className="text-lg font-bold text-slate-800 tracking-tight leading-tight truncate">
                {hostel.name}
              </h3>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <MapPin className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                <span className="truncate">
                  {hostel.city}, {hostel.state} — {hostel.pincode}
                </span>
              </div>
            </div>
            {!hasImage && (
              <div className="flex items-center gap-2 shrink-0">
                <span
                  className={`px-2.5 py-0.5 rounded-lg text-xs font-semibold border ${
                    hostel.type === 'Boys'
                      ? 'bg-blue-500/10 text-blue-500 border-blue-500/30'
                      : hostel.type === 'Girls'
                      ? 'bg-pink-500/10 text-pink-500 border-pink-500/30'
                      : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30'
                  }`}
                >
                  {hostel.type}
                </span>
              </div>
            )}
          </div>

          {/* Description (if available) */}
          {hostel.description && (
            <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">
              {hostel.description}
            </p>
          )}

          {/* Quick Stats Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-rose-50/50 border border-white/80 text-xs text-slate-600">
              <DoorOpen className="w-3.5 h-3.5 text-teal-400 shrink-0" />
              <span>
                <strong className="text-slate-800">{hostel.totalRooms || 0}</strong> Rooms
              </span>
            </div>
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-rose-50/50 border border-white/80 text-xs text-slate-600">
              <BedDouble className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span>
                <strong className="text-slate-800">{hostel.totalBeds || 0}</strong> Beds
              </span>
            </div>
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-rose-50/50 border border-white/80 text-xs text-slate-600">
              <IndianRupee className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>
                ₹<strong className="text-slate-800">{hostel.startingRent || 0}</strong>/mo
              </span>
            </div>
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-rose-50/50 border border-white/80 text-xs text-slate-600">
              <Shield className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>
                ₹<strong className="text-slate-800">{hostel.securityDeposit || 0}</strong> Dep
              </span>
            </div>
          </div>

          {/* Amenities Tags */}
          {allAmenities.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {allAmenities.slice(0, 5).map((f, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-white text-slate-600 border border-rose-100"
                >
                  <Tag className="w-2.5 h-2.5 text-teal-400" />
                  {f}
                </span>
              ))}
              {allAmenities.length > 5 && (
                <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-white text-slate-400 border border-rose-100">
                  +{allAmenities.length - 5} more
                </span>
              )}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="pt-2 border-t border-white/60">
          <Link to={`/student/hostels/${hostel._id}`}>
            <button className="w-full flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-semibold text-violet-600 bg-violet-500/10 hover:bg-violet-500/20 border border-violet-500/20 transition-colors cursor-pointer">
              <Eye className="w-3.5 h-3.5" />
              View Details & Rooms
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default StudentHostelCard;
