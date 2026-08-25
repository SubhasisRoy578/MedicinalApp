import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { PatientDashboard } from './pages/patient/PatientDashboard';
import { ConsultationInterviewPage } from './pages/patient/ConsultationInterviewPage';
import { DoctorDashboard } from './pages/doctor/DoctorDashboard';
import { DoctorPatientsPage } from './pages/doctor/DoctorPatientsPage';
import { DoctorConsultationReviewPage } from './pages/doctor/DoctorConsultationReviewPage';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { UserRole } from './types';

// Protected Route Guard
interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-xs font-bold text-slate-500">Authenticating session...</div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    if (user.role === 'PATIENT') return <Navigate to="/patient/dashboard" replace />;
    if (user.role === 'DOCTOR') return <Navigate to="/doctor/dashboard" replace />;
    if (user.role === 'ADMIN') return <Navigate to="/admin/dashboard" replace />;
  }

  return <>{children}</>;
};

export const App: React.FC = () => {
  return (
    <ToastProvider>
      <AuthProvider>
        <Router>
          <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans gov-app">
            <Navbar />
            <main className="flex-1">
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />

                {/* Patient Protected Routes */}
                <Route
                  path="/patient/dashboard"
                  element={
                    <ProtectedRoute allowedRoles={['PATIENT', 'ADMIN']}>
                      <PatientDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/patient/consultation/new"
                  element={
                    <ProtectedRoute allowedRoles={['PATIENT', 'ADMIN']}>
                      <PatientDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/patient/consultation/:id"
                  element={
                    <ProtectedRoute allowedRoles={['PATIENT', 'DOCTOR', 'ADMIN']}>
                      <ConsultationInterviewPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/patient/consultation/:id/reports"
                  element={
                    <ProtectedRoute allowedRoles={['PATIENT', 'DOCTOR', 'ADMIN']}>
                      <ConsultationInterviewPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/patient/consultation/:id/summary"
                  element={
                    <ProtectedRoute allowedRoles={['PATIENT', 'DOCTOR', 'ADMIN']}>
                      <ConsultationInterviewPage />
                    </ProtectedRoute>
                  }
                />

                {/* Doctor Protected Routes */}
                <Route
                  path="/doctor/dashboard"
                  element={
                    <ProtectedRoute allowedRoles={['DOCTOR', 'ADMIN']}>
                      <DoctorDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/doctor/patients"
                  element={
                    <ProtectedRoute allowedRoles={['DOCTOR', 'ADMIN']}>
                      <DoctorPatientsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/doctor/patients/:id"
                  element={
                    <ProtectedRoute allowedRoles={['DOCTOR', 'ADMIN']}>
                      <DoctorPatientsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/doctor/consultations/:id"
                  element={
                    <ProtectedRoute allowedRoles={['DOCTOR', 'ADMIN']}>
                      <DoctorConsultationReviewPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/doctor/consultations/:id/review"
                  element={
                    <ProtectedRoute allowedRoles={['DOCTOR', 'ADMIN']}>
                      <DoctorConsultationReviewPage />
                    </ProtectedRoute>
                  }
                />

                {/* Admin Protected Routes */}
                <Route
                  path="/admin/dashboard"
                  element={
                    <ProtectedRoute allowedRoles={['ADMIN']}>
                      <AdminDashboard />
                    </ProtectedRoute>
                  }
                />

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </Router>
      </AuthProvider>
    </ToastProvider>
  );
};

export default App;
