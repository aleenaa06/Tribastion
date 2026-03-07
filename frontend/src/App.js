import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/Navbar';
import DashboardLayout from './components/DashboardLayout';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import FileUploadPage from './pages/FileUploadPage';
import FilesListPage from './pages/FilesListPage';
import FileDetailPage from './pages/FileDetailPage';
import UsersPage from './pages/UsersPage';
import AuditLogsPage from './pages/AuditLogsPage';
import StatsPage from './pages/StatsPage';
import CyberBackground from './components/CyberBackground';

function AdminRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user || user.role !== 'admin') return <Navigate to="/dashboard" replace />;
  return children;
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <CyberBackground />
          <div className="min-h-screen text-cyan-300">
            <Navbar />
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 3000,
                style: { background: '#1e293b', color: '#e2e8f0', border: '1px solid rgba(255,255,255,0.1)' },
                success: { iconTheme: { primary: '#14b8a6', secondary: '#1e293b' } },
                error: { iconTheme: { primary: '#ef4444', secondary: '#1e293b' } },
              }}
            />
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/dashboard" element={<DashboardLayout />}>
                <Route index element={<DashboardPage />} />
                <Route path="upload" element={<AdminRoute><FileUploadPage /></AdminRoute>} />
                <Route path="files" element={<FilesListPage />} />
                <Route path="files/:id" element={<FileDetailPage />} />
                <Route path="users" element={<AdminRoute><UsersPage /></AdminRoute>} />
                <Route path="audit" element={<AdminRoute><AuditLogsPage /></AdminRoute>} />
                <Route path="stats" element={<StatsPage />} />
              </Route>
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
