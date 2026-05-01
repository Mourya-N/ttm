import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';

import LoginPage        from './pages/LoginPage';
import SignupPage       from './pages/SignupPage';
import DashboardPage    from './pages/DashboardPage';
import ProjectsPage     from './pages/ProjectsPage';
import ProjectDetailPage from './pages/ProjectDetailPage';
import TasksPage        from './pages/TasksPage';
import TeamPage         from './pages/TeamPage';

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

function AdminRoute({ children }) {
  const { isAuthenticated, isAdmin } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!isAdmin) return <Navigate to="/dashboard" replace />;
  return children;
}

function PublicRoute({ children }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : children;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/login"  element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path="/signup" element={<PublicRoute><SignupPage /></PublicRoute>} />

      <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
      <Route path="/projects"  element={<ProtectedRoute><ProjectsPage /></ProtectedRoute>} />
      <Route path="/projects/:id" element={<ProtectedRoute><ProjectDetailPage /></ProtectedRoute>} />
      <Route path="/tasks"     element={<ProtectedRoute><TasksPage /></ProtectedRoute>} />
      <Route path="/team"      element={<AdminRoute><TeamPage /></AdminRoute>} />

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: 'rgba(10, 10, 20, 0.9)',
              color: '#ffffff',
              border: '1px solid rgba(0, 245, 255, 0.2)',
              borderRadius: '14px',
              fontSize: '0.9rem',
              backdropFilter: 'blur(10px)',
              padding: '12px 20px',
            },
            success: { iconTheme: { primary: '#10b981', secondary: '#0a0a14' } },
            error:   { iconTheme: { primary: '#f43f5e', secondary: '#0a0a14' } },
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  );
}
