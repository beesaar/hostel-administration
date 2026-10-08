import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Building2,
  PlusCircle,
  UserCheck,
  CalendarDays,
  LogOut,
  X,
  MessageSquareWarning,
  Users,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const ManagerSidebar = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();

  const navItems = [
    { label: 'Dashboard', path: '/manager/dashboard', icon: LayoutDashboard },
    { label: 'My Hostels', path: '/manager/hostels', icon: Building2 },
    { label: 'Add New Hostel', path: '/manager/hostels/new', icon: PlusCircle },
    { label: 'Booking Requests', path: '/manager/bookings', icon: CalendarDays },
    { label: 'Residents', path: '/manager/residents', icon: Users },
    { label: 'Complaints', path: '/manager/complaints', icon: MessageSquareWarning },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-rose-50/80 backdrop-blur-sm lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-rose-50 border-r border-white flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Top Branding */}
        <div>
          <div className="h-16 px-6 flex items-center justify-between border-b border-white">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-teal-500 flex items-center justify-center text-slate-800 shadow-lg shadow-teal-500/30">
                <UserCheck className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-base font-bold text-slate-800 tracking-tight leading-none">
                  Unistay
                </h1>
                <span className="text-[10px] uppercase font-bold tracking-widest text-cyan-400">
                  Manager Portal
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === '/manager/hostels'}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? 'bg-cyan-600 text-slate-800 shadow-lg shadow-cyan-600/25'
                        : 'text-slate-400 hover:text-slate-700 hover:bg-white/60'
                    }`
                  }
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Bottom User Card & Logout */}
        <div className="p-4 border-t border-white bg-rose-50/40">
          <div className="flex items-center justify-between mb-3 px-2">
            <div className="overflow-hidden pr-2">
              <p className="text-sm font-semibold text-slate-800 truncate">
                {user?.name || 'Hostel Manager'}
              </p>
              <p className="text-xs text-slate-400 truncate">{user?.email}</p>
            </div>
            <span className="shrink-0 px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              MANAGER
            </span>
          </div>

          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default ManagerSidebar;
