import React from 'react';
import { Link } from 'react-router-dom';
import { Search, Building2, UserCheck, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import DashboardCard from '../../components/DashboardCard';

const StudentDashboardPage = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
            Welcome back, {user?.name || 'Student'}! 👋
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Ready to find your perfect hostel? Explore verified listings today.
          </p>
        </div>
        <Link to="/student/hostels">
          <button className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors shadow-lg shadow-violet-600/20">
            <Search className="w-4 h-4" />
            Discover Hostels
          </button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <DashboardCard
          title="Verified Hostels"
          value="Find Homes"
          icon={ShieldCheck}
          description="Browse approved listings"
          link="/student/hostels"
          color="violet"
        />
        <DashboardCard
          title="Amenities & Rooms"
          value="Explore"
          icon={Building2}
          description="Check live availability"
          link="/student/hostels"
          color="emerald"
        />
        <DashboardCard
          title="Student Support"
          value="24/7"
          icon={UserCheck}
          description="Secure platform"
          link="/student/hostels"
          color="cyan"
        />
      </div>

      <div className="bg-white/70 border border-white p-6 rounded-3xl shadow-sm">
        <h2 className="text-lg font-bold text-slate-800 mb-4">Getting Started</h2>
        <div className="space-y-4 text-sm text-slate-600">
          <p>
            Welcome to the Student Portal! Here you can discover various hostels approved by our administration.
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li>Navigate to <strong>Discover Hostels</strong> to browse through all available listings.</li>
            <li>Click on <strong>View Details</strong> on any hostel card to inspect the facilities and room availability.</li>
            <li>Check the live room availability status before planning your stay.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboardPage;
