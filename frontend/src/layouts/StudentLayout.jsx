import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { bookingService } from '../services/bookingService';
import LoadingSpinner from '../components/LoadingSpinner';
import StudentSidebar from '../components/StudentSidebar';
import StudentNavbar from '../components/StudentNavbar';

export const StudentLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [accommodationState, setAccommodationState] = useState(null);
  const [accommodationBooking, setAccommodationBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAccommodationStatus = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await bookingService.getStudentAccommodationStatus();
      setAccommodationState(data.state);
      setAccommodationBooking(data.booking);
    } catch (err) {
      console.error('Failed to fetch accommodation status:', err);
      setError('Unable to load your accommodation status. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccommodationStatus();
  }, []);

  return (
    <div className="min-h-screen bg-rose-50 text-slate-800 flex">
      {/* Sidebar Navigation */}
      <StudentSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        accommodationState={accommodationState}
      />

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-64 flex flex-col min-h-screen">
        <StudentNavbar onOpenSidebar={() => setIsSidebarOpen(true)} />

        {/* Child Pages Rendered via Outlet */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto flex flex-col">
          {loading ? (
            <div className="flex-1 flex flex-col items-center justify-center min-h-[50vh]">
              <LoadingSpinner size="lg" className="text-violet-500 mb-4" />
              <p className="text-slate-500 font-medium">Checking accommodation status...</p>
            </div>
          ) : error ? (
            <div className="flex-1 flex flex-col items-center justify-center min-h-[50vh]">
              <div className="p-6 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-500 text-center max-w-md">
                <p className="font-semibold mb-4">{error}</p>
                <button 
                  onClick={fetchAccommodationStatus}
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-sm font-semibold transition-colors"
                >
                  Retry
                </button>
              </div>
            </div>
          ) : (
            <Outlet 
              context={{ 
                accommodationState, 
                accommodationBooking, 
                refreshStatus: fetchAccommodationStatus 
              }} 
            />
          )}
        </main>
      </div>
    </div>
  );
};

export default StudentLayout;
