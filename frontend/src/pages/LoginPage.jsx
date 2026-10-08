import React, { useState } from 'react';
import { useNavigate, Navigate, Link, useLocation } from 'react-router-dom';
import { 
  Building2, 
  Lock, 
  Mail, 
  AlertCircle, 
  ArrowRight, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  UserCheck, 
  GraduationCap, 
  Sparkles 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Button from '../components/Button';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // If already authenticated, redirect to appropriate role dashboard
  if (isAuthenticated && user) {
    if (user.role === 'Admin') return <Navigate to="/admin/dashboard" replace />;
    if (user.role === 'Hostel Manager') return <Navigate to="/manager/dashboard" replace />;
    if (user.role === 'Student') return <Navigate to="/student/dashboard" replace />;
    return <Navigate to="/dashboard" replace />;
  }

  const redirectByRole = (role) => {
    // Check if there was a redirected path originally attempted
    const from = location.state?.from?.pathname;
    if (from && from !== '/login') {
      navigate(from, { replace: true });
      return;
    }

    if (role === 'Admin') {
      navigate('/admin/dashboard', { replace: true });
    } else if (role === 'Hostel Manager') {
      navigate('/manager/dashboard', { replace: true });
    } else if (role === 'Student') {
      navigate('/student/dashboard', { replace: true });
    } else {
      navigate('/dashboard', { replace: true });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const userProfile = await login(email.trim(), password);
      redirectByRole(userProfile.role);
    } catch (err) {
      console.error('Login error:', err);
      if (!err.response) {
        setError('Cannot connect to backend server (http://localhost:5000). Please verify the server is running.');
      } else {
        setError(
          err.response?.data?.message || 'Invalid email or password. Please check your credentials.'
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDemoFill = (role) => {
    setError('');
    if (role === 'Admin') {
      setEmail('admin@hostel.com');
      setPassword('AdminPassword@123');
    } else if (role === 'Manager') {
      setEmail('vikram.manager@hostel.com');
      setPassword('Password@123');
    } else if (role === 'Student') {
      setEmail('rahul.student@hostel.com');
      setPassword('Password@123');
    }
  };

  return (
    <div className="min-h-screen bg-rose-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden selection:bg-teal-500 selection:text-slate-800">
      {/* Background Animated Glowing Orbs */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-teal-600/15 rounded-full blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-cyan-600/15 rounded-full blur-3xl pointer-events-none animate-pulse delay-700" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header / Logo */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-500 via-teal-600 to-cyan-500 text-slate-800 shadow-xl shadow-teal-500/25 border border-teal-400/20 mb-4 transform hover:scale-105 transition-transform duration-300">
          <Building2 className="w-8 h-8" />
        </div>
        <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">
          Unistay
        </h2>
        <p className="mt-1.5 text-sm text-slate-400">
          Unified Portal for Students, Managers & Administrators
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-rose-50/90 backdrop-blur-xl py-8 px-6 sm:px-8 border border-white rounded-3xl shadow-2xl space-y-6">
          

          {/* Error Alert */}
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-3 text-rose-300 text-xs animate-shake">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-rose-300 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.name@example.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-rose-50/70 border border-white rounded-xl text-sm text-slate-700 placeholder-rose-300 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-colors"
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
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-10 py-2.5 bg-rose-50/70 border border-white rounded-xl text-sm text-slate-700 placeholder-rose-300 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-rose-300 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                loading={loading}
                className="w-full !bg-gradient-to-r !from-teal-600 !to-teal-500 hover:!from-teal-500 hover:!to-teal-400 !shadow-teal-500/25"
              >
                <span>Sign In to Account</span>
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </div>
          </form>

          {/* Registration link */}
          <div className="pt-4 border-t border-white/80 text-center">
            <p className="text-xs text-slate-400">
              Don't have an account?{' '}
              <Link to="/register" className="text-teal-400 hover:text-teal-600 font-semibold transition-colors">
                Create new account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
