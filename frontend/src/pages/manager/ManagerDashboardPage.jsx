import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Building2,
  Clock,
  CheckCircle2,
  XCircle,
  PlusCircle,
  RefreshCw,
  ArrowRight,
} from 'lucide-react';
import { managerService } from '../../services/managerService';
import DashboardCard from '../../components/DashboardCard';
import StatusBadge from '../../components/StatusBadge';
import Button from '../../components/Button';
import LoadingSpinner from '../../components/LoadingSpinner';

export const ManagerDashboardPage = () => {
  const [data, setData] = useState({
    stats: { totalHostels: 0, pendingHostels: 0, approvedHostels: 0, rejectedHostels: 0 },
    recentHostels: [],
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchDashboardData = async () => {
    try {
      setError(null);
      const res = await managerService.getDashboardStats();
      if (res.success) {
        setData({ stats: res.stats, recentHostels: res.recentHostels || [] });
      }
    } catch (err) {
      console.error('Dashboard fetch error:', err);
      setError(err.response?.data?.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return <LoadingSpinner size="lg" text="Loading your property management dashboard..." />;
  }

  const { stats, recentHostels } = data;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight">
            Manager Dashboard
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Overview of your hostel property submissions and approval status.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => { setRefreshing(true); fetchDashboardData(); }}
            loading={refreshing}
            icon={RefreshCw}
          >
            Refresh
          </Button>
          <Link to="/manager/hostels/new">
            <Button variant="primary" size="sm" icon={PlusCircle}>
              Add Hostel
            </Button>
          </Link>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm">
          {error}
        </div>
      )}

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <DashboardCard
          title="My Hostels"
          value={stats.totalHostels}
          icon={Building2}
          color="cyan"
          description="Total listed properties"
          link="/manager/hostels"
        />
        <DashboardCard
          title="Pending Review"
          value={stats.pendingHostels}
          icon={Clock}
          color="amber"
          description="Awaiting Admin approval"
        />
        <DashboardCard
          title="Approved"
          value={stats.approvedHostels}
          icon={CheckCircle2}
          color="emerald"
          description="Live and visible to students"
        />
        <DashboardCard
          title="Rejected"
          value={stats.rejectedHostels}
          icon={XCircle}
          color="rose"
          description="Requires amendments"
        />
      </div>

      {/* Recent Hostels */}
      <div className="bg-rose-50/80 border border-white rounded-2xl p-6 backdrop-blur-xl shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-800">Recent Hostel Submissions</h3>
            <p className="text-xs text-slate-400">Your latest property listings</p>
          </div>
          <Link
            to="/manager/hostels"
            className="text-xs font-medium text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
          >
            View All <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="text-[11px] uppercase tracking-wider text-slate-400 border-b border-white">
              <tr>
                <th className="pb-3 px-3">Hostel Name</th>
                <th className="pb-3 px-3">Type</th>
                <th className="pb-3 px-3">City</th>
                <th className="pb-3 px-3">Rent</th>
                <th className="pb-3 px-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/60">
              {recentHostels.length > 0 ? (
                recentHostels.map((hostel) => (
                  <tr key={hostel._id} className="hover:bg-white/30 transition-colors">
                    <td className="py-3 px-3 font-semibold text-slate-800">
                      <Link
                        to={`/manager/hostels/${hostel._id}`}
                        className="hover:text-cyan-400 transition-colors"
                      >
                        {hostel.name}
                      </Link>
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded-md bg-white text-slate-600 border border-rose-100">
                        {hostel.type}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-400">{hostel.city}</td>
                    <td className="py-3 px-3 text-slate-600">
                      ₹{hostel.startingRent || 0}/mo
                    </td>
                    <td className="py-3 px-3">
                      <StatusBadge status={hostel.status} />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-rose-300">
                    You have not submitted any hostels yet.{' '}
                    <Link to="/manager/hostels/new" className="text-cyan-400 hover:underline">
                      Add your first hostel →
                    </Link>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ManagerDashboardPage;
