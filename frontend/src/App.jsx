import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Unified Auth Imports
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

// Admin Imports
import AdminLayout from './layouts/AdminLayout';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import ManagersListPage from './pages/admin/ManagersListPage';
import StudentsListPage from './pages/admin/StudentsListPage';
import HostelsListPage from './pages/admin/HostelsListPage';
import PendingApprovalsPage from './pages/admin/PendingApprovalsPage';

// Manager Imports
import ManagerLayout from './layouts/ManagerLayout';
import ManagerDashboardPage from './pages/manager/ManagerDashboardPage';
import MyHostelsPage from './pages/manager/MyHostelsPage';
import AddHostelPage from './pages/manager/AddHostelPage';
import EditHostelPage from './pages/manager/EditHostelPage';
import HostelDetailPage from './pages/manager/HostelDetailPage';

import RoomsListPage from './pages/manager/RoomsListPage';
import AddRoomPage from './pages/manager/AddRoomPage';
import EditRoomPage from './pages/manager/EditRoomPage';

// Student Imports
import StudentLayout from './layouts/StudentLayout';
import StudentDashboardPage from './pages/student/StudentDashboardPage';
import HostelsDiscoveryPage from './pages/student/HostelsDiscoveryPage';
import StudentHostelDetailPage from './pages/student/StudentHostelDetailPage';

// Root redirector based on authentication state and role
const RootRedirect = () => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) return null;

  if (isAuthenticated) {
    if (user?.role === 'Admin') return <Navigate to="/admin/dashboard" replace />;
    if (user?.role === 'Hostel Manager') return <Navigate to="/manager/dashboard" replace />;
    if (user?.role === 'Student') return <Navigate to="/student/dashboard" replace />;
    return <Navigate to="/dashboard" replace />;
  }

  return <Navigate to="/login" replace />;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Unified Public Auth Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Legacy route redirects for backward compatibility */}
          <Route path="/admin/login" element={<Navigate to="/login" replace />} />
          <Route path="/manager/login" element={<Navigate to="/login" replace />} />

          {/* Root Redirect */}
          <Route path="/" element={<RootRedirect />} />

          {/* Protected Admin Routes */}
          <Route element={<ProtectedRoute requiredRole="Admin" />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="dashboard" element={<AdminDashboardPage />} />
              <Route path="managers" element={<ManagersListPage />} />
              <Route path="students" element={<StudentsListPage />} />
              <Route path="hostels" element={<HostelsListPage />} />
              <Route path="pending-approvals" element={<PendingApprovalsPage />} />
            </Route>
          </Route>

          {/* Protected Manager Routes */}
          <Route element={<ProtectedRoute requiredRole="Hostel Manager" />}>
            <Route path="/manager" element={<ManagerLayout />}>
              <Route index element={<Navigate to="/manager/dashboard" replace />} />
              <Route path="dashboard" element={<ManagerDashboardPage />} />
              <Route path="hostels" element={<MyHostelsPage />} />
              <Route path="hostels/new" element={<AddHostelPage />} />
              <Route path="hostels/:id" element={<HostelDetailPage />} />
              <Route path="hostels/:id/edit" element={<EditHostelPage />} />
              <Route path="hostels/:hostelId/rooms" element={<RoomsListPage />} />
              <Route path="hostels/:hostelId/rooms/new" element={<AddRoomPage />} />
              <Route path="rooms/:roomId/edit" element={<EditRoomPage />} />
            </Route>
          </Route>

          {/* Protected Student Routes */}
          <Route element={<ProtectedRoute requiredRole="Student" />}>
            <Route path="/student" element={<StudentLayout />}>
              <Route index element={<Navigate to="/student/dashboard" replace />} />
              <Route path="dashboard" element={<StudentDashboardPage />} />
              <Route path="hostels" element={<HostelsDiscoveryPage />} />
              <Route path="hostels/:id" element={<StudentHostelDetailPage />} />
            </Route>
          </Route>

          {/* Catch-all fallback */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
