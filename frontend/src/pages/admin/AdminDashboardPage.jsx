import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  GraduationCap,
  UserCheck,
  Building2,
  Clock,
  CheckCircle2,
  XCircle,
  RefreshCw,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { adminService } from '../../services/adminService';
import DashboardCard from '../../components/DashboardCard';
import StatusBadge from '../../components/StatusBadge';
import Button from '../../components/Button';
import LoadingSpinner from '../../components/LoadingSpinner';

export const AdminDashboardPage = () => {
  const [data, setData] = useState({
    stats: {
      totalStudents: 0,
      totalManagers: 0,
      totalHostels: 0,
      pendingHostels: 0,
      approvedHostels: 0,
      rejectedHostels: 0,
    },
    recentHostels: [],
    recentUsers: [],
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchDashboardData = async () => {
    try {
      setError(null);
      const res = await adminService.getDashboardStats();
      if (res.success) {
        setData({
          stats: res.stats,
          recentHostels: res.recentHostels || [],
          recentUsers: res.recentUsers || [],
        });
      }
    } catch (err) {
      console.error('Failed to load dashboard metrics:', err);
      setError(err.response?.data?.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  if (loading) {
    return <LoadingSpinner size="lg" text="Loading administrative dashboard metrics..." />;
  }

  const { stats, recentHostels, recentUsers } = data;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight">
            System Overview & Analytics
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Real-time platform metrics, user directory counts, and verification queue.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          loading={refreshing}
          icon={RefreshCw}
        >
          Refresh Stats
        </Button>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm">
          {error}
        </div>
      )}

      {/* Top 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <DashboardCard
          title="Total Students"
          value={stats.totalStudents}
          icon={GraduationCap}
          color="indigo"
          description="Registered hostel seekers"
          link="/admin/students"
        />
        <DashboardCard
          title="Hostel Managers"
          value={stats.totalManagers}
          icon={UserCheck}
          color="cyan"
          description="Property managers"
          link="/admin/managers"
        />
        <DashboardCard
          title="Total Hostels"
          value={stats.totalHostels}
          icon={Building2}
          color="emerald"
          description="Listed hostel properties"
          link="/admin/hostels"
        />
        <DashboardCard
          title="Pending Approvals"
          value={stats.pendingHostels}
          icon={Clock}
          color="amber"
          description={
            stats.pendingHostels > 0
              ? 'Action required for listing'
              : 'Queue is up to date'
          }
          link="/admin/pending-approvals"
        />
      </div>

      {/* Hostel Status Breakdown Banner */}
      <div className="p-5 rounded-2xl bg-rose-50/80 border border-white flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/20">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-800">Hostel Moderation Health</h4>
            <p className="text-xs text-slate-400">Status breakdown of all submitted properties</p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs font-semibold">
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="w-4 h-4" />
            <span>Approved: {stats.approvedHostels}</span>
          </span>
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 text-amber-300 border border-amber-500/20">
            <Clock className="w-4 h-4" />
            <span>Pending: {stats.pendingHostels}</span>
          </span>
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <XCircle className="w-4 h-4" />
            <span>Rejected: {stats.rejectedHostels}</span>
          </span>
        </div>
      </div>

      {/* 2-Column Split: Recent Hostels & Recent User Registrations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Hostels (2 Cols) */}
        <div className="lg:col-span-2 bg-rose-50/80 border border-white rounded-2xl p-6 backdrop-blur-xl space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-800">Recent Hostel Submissions</h3>
              <p className="text-xs text-slate-400">Newly registered accommodation facilities</p>
            </div>
            <Link
              to="/admin/hostels"
              className="text-xs font-medium text-teal-400 hover:text-teal-600 flex items-center gap-1"
            >
              View All <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="text-[11px] uppercase tracking-wider text-slate-400 border-b border-white">
                <tr>
                  <th className="pb-3 px-3">Hostel Name</th>
                  <th className="pb-3 px-3">City</th>
                  <th className="pb-3 px-3">Type</th>
                  <th className="pb-3 px-3">Manager</th>
                  <th className="pb-3 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/60">
                {recentHostels.length > 0 ? (
                  recentHostels.map((hostel) => (
                    <tr key={hostel._id} className="hover:bg-white/30 transition-colors">
                      <td className="py-3 px-3 font-semibold text-slate-800">
                        {hostel.name}
                      </td>
                      <td className="py-3 px-3 text-slate-400">{hostel.city}</td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded-md bg-white text-slate-600 border border-rose-100">
                          {hostel.type}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-600">
                        {hostel.manager?.name || 'Unassigned'}
                      </td>
                      <td className="py-3 px-3">
                        <StatusBadge status={hostel.status} />
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-rose-300">
                      No hostel submissions recorded yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Registrations (1 Col) */}
        <div className="bg-rose-50/80 border border-white rounded-2xl p-6 backdrop-blur-xl space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-800">Recent Users</h3>
              <p className="text-xs text-slate-400">Newly joined accounts</p>
            </div>
          </div>

          <div className="space-y-3">
            {recentUsers.length > 0 ? (
              recentUsers.map((u) => (
                <div
                  key={u._id}
                  className="p-3 rounded-xl bg-rose-50/60 border border-white/80 flex items-center justify-between gap-3"
                >
                  <div className="overflow-hidden">
                    <p className="text-xs font-semibold text-slate-800 truncate">{u.name}</p>
                    <p className="text-[11px] text-slate-400 truncate">{u.email}</p>
                  </div>
                  <StatusBadge status={u.role} />
                </div>
              ))
            ) : (
              <p className="text-xs text-rose-300 text-center py-6">
                No users found.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
