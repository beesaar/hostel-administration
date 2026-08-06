import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import ManagerSidebar from '../components/ManagerSidebar';
import ManagerNavbar from '../components/ManagerNavbar';

export const ManagerLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex">
      {/* Sidebar Navigation */}
      <ManagerSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-64 flex flex-col min-h-screen">
        <ManagerNavbar onOpenSidebar={() => setIsSidebarOpen(true)} />

        {/* Child Pages Rendered via Outlet */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default ManagerLayout;
