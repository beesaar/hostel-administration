import React from 'react';
import { Menu, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const StudentNavbar = ({ onOpenSidebar }) => {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-30 h-16 bg-rose-50/80 backdrop-blur-xl border-b border-white px-4 sm:px-8 flex items-center justify-between">
      {/* Left: Mobile Menu & Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenSidebar}
          className="lg:hidden p-2 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-white transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-sm font-semibold text-slate-800">Student Portal</h2>
          <p className="text-[11px] text-slate-400 hidden sm:block">
            Discover and Explore Hostels
          </p>
        </div>
      </div>

      {/* Right: Profile */}
      <div className="flex items-center gap-3 sm:gap-4">
        <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-xs font-medium">
          <span className="w-2 h-2 rounded-full bg-violet-500 animate-ping" />
          <span>Student Active</span>
        </div>

        <div className="flex items-center gap-3 pl-3 border-l border-white">
          <div className="w-8 h-8 rounded-full bg-violet-500 text-slate-800 flex items-center justify-center text-xs font-bold shadow-md shadow-violet-500/20">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'S'}
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-xs font-bold text-slate-800 leading-tight">
              {user?.name || 'Student'}
            </p>
            <p className="text-[10px] text-violet-400 font-semibold uppercase tracking-wider">
              {user?.role || 'Student'}
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

export default StudentNavbar;
