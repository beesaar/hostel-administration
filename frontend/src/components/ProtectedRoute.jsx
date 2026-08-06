import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FullPageLoader } from './LoadingSpinner';
import { ShieldAlert } from 'lucide-react';
import Button from './Button';

export const ProtectedRoute = ({ requiredRole = 'Admin' }) => {
  const { user, loading, isAuthenticated, logout } = useAuth();

  if (loading) {
    return <FullPageLoader text="Verifying administrative access..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user?.role !== requiredRole) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center space-y-5 shadow-2xl">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center justify-center">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Access Restricted</h2>
            <p className="text-sm text-slate-400 mt-2">
              You are logged in as{' '}
              <span className="font-semibold text-slate-200">{user?.name}</span> (
              <span className="text-indigo-400">{user?.role}</span>). This section
              requires <strong className="text-white">{requiredRole}</strong>{' '}
              privileges.
            </p>
          </div>
          <div className="pt-2 flex justify-center gap-3">
            <Button variant="danger" onClick={logout}>
              Logout & Switch Account
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return <Outlet />;
};

export default ProtectedRoute;
