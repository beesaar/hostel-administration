import React from 'react';
import { Menu, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const ManagerNavbar = ({ onOpenSidebar }) => {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-30 h-16 bg-slate-900/80 backdrop-blur-xl border-b border-slate-800 px-4 sm:px-8 flex items-center justify-between">
      {/* Left: Mobile Menu & Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenSidebar}
          className="lg:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-sm font-semibold text-white">Property Management</h2>
          <p className="text-[11px] text-slate-400 hidden sm:block">
            Manage Your Hostel Listings & Track Approvals
          </p>
        </div>
      </div>

      {/* Right: Profile */}
      <div className="flex items-center gap-3 sm:gap-4">
        <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-medium">
          <span className="w-2 h-2 rounded-full bg-cyan-500 animate-ping" />
          <span>Manager Active</span>
        </div>

        <div className="flex items-center gap-3 pl-3 border-l border-slate-800">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-600 to-cyan-400 text-white flex items-center justify-center text-xs font-bold shadow-md shadow-cyan-600/20">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'M'}
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-xs font-bold text-white leading-tight">
              {user?.name || 'Manager'}
            </p>
            <p className="text-[10px] text-cyan-400 font-semibold uppercase tracking-wider">
              {user?.role || 'Hostel Manager'}
            </p>
          </div>
        </div>

        <button
          onClick={logout}
          title="Sign Out"
          className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-all cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};

export default ManagerNavbar;
