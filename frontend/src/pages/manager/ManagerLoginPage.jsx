import React, { useState } from 'react';
import { useNavigate, Navigate, Link } from 'react-router-dom';
import { UserCheck, Lock, Mail, AlertCircle, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/Button';

export const ManagerLoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  // Redirect if already logged in as Manager
  if (isAuthenticated && user?.role === 'Hostel Manager') {
    return <Navigate to="/manager/dashboard" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const userProfile = await login(email, password);
      if (userProfile.role !== 'Hostel Manager') {
        setError('Access denied: This portal is only for Hostel Managers.');
      } else {
        navigate('/manager/dashboard');
      }
    } catch (err) {
      console.error('Login error:', err);
      if (!err.response) {
        setError('Cannot connect to backend server (http://localhost:5000). Please start the backend server.');
      } else {
        setError(
          err.response?.data?.message || 'Invalid email or password. Please try again.'
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDemoFill = () => {
    setEmail('vikram.manager@hostel.com');
    setPassword('Password@123');
    setError('');
  };

  return (
    <div className="min-h-screen bg-rose-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-teal-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="flex justify-center">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500 to-cyan-700 flex items-center justify-center text-slate-800 shadow-xl shadow-cyan-600/30 border border-cyan-400/20">
            <UserCheck className="w-8 h-8" />
          </div>
        </div>
        <h2 className="mt-4 text-center text-2xl font-extrabold text-slate-800 tracking-tight">
          Manager Portal Login
        </h2>
        <p className="mt-1 text-center text-xs text-slate-400">
          Hostel Property Listing & Management System
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4">
        <div className="bg-rose-50/90 backdrop-blur-xl py-8 px-6 sm:px-8 border border-white rounded-3xl shadow-2xl space-y-6">
          {/* Error Alert */}
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-3 text-rose-300 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                Manager Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-rose-300 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="manager@hostel.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-rose-50/70 border border-white rounded-xl text-sm text-slate-700 placeholder-rose-300 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-rose-300 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-rose-50/70 border border-white rounded-xl text-sm text-slate-700 placeholder-rose-300 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
                />
              </div>
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                loading={loading}
                className="w-full !bg-cyan-600 hover:!bg-cyan-500 !shadow-cyan-600/25 !border-cyan-500/30 !focus:ring-cyan-500"
              >
                <span>Sign In as Manager</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </form>

          {/* Quick Links & Demo */}
          <div className="pt-4 border-t border-white/80 space-y-3 text-center">
            <button
              type="button"
              onClick={handleDemoFill}
              className="text-xs text-cyan-400 hover:text-cyan-300 font-medium transition-colors"
            >
              Fill Demo Manager Credentials
            </button>
            <p className="text-xs text-rose-300">
              Admin?{' '}
              <Link to="/login" className="text-teal-400 hover:text-teal-600 font-medium">
                Login to Admin Portal
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManagerLoginPage;
