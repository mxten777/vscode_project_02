import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Layout from './components/Layout';
import LoginPage from './pages/Login';
import AdminDashboard from './pages/admin/Dashboard';
import FacilityManagement from './pages/admin/FacilityManagement';
import TemplateManagement from './pages/admin/TemplateManagement';
import UserManagement from './pages/admin/UserManagement';
import InspectionStart from './pages/inspector/InspectionStart';
import InspectionForm from './pages/inspector/InspectionForm';
import InspectionList from './pages/inspector/InspectionList';
import InspectionDetail from './pages/inspector/InspectionDetail';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 30_000 },
  },
});

function Spinner() {
  return (
    <div className="flex items-center justify-center h-screen bg-slate-50">
      <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

function ProtectedRoute({ children, adminOnly = false }: { children: React.ReactNode; adminOnly?: boolean }) {
  const { currentUser, appUser, loading } = useAuth();
  if (loading) return <Spinner />;
  if (!currentUser) return <Navigate to="/login" replace />;
  if (adminOnly && appUser?.role !== 'admin') return <Navigate to="/inspect" replace />;
  return <>{children}</>;
}

function AppRoutes() {
  const { currentUser, appUser, loading } = useAuth();
  if (loading) return <Spinner />;

  const defaultPath = appUser?.role === 'admin' ? '/admin' : '/inspect';

  return (
    <Routes>
      <Route
        path="/login"
        element={!currentUser ? <LoginPage /> : <Navigate to={defaultPath} replace />}
      />
      <Route
        path="/"
        element={<Navigate to={currentUser ? defaultPath : '/login'} replace />}
      />

      {/* Admin routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute adminOnly>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="facilities" element={<FacilityManagement />} />
        <Route path="templates" element={<TemplateManagement />} />
        <Route path="users" element={<UserManagement />} />
        <Route path="inspections/:id" element={<InspectionDetail />} />
      </Route>

      {/* Inspector routes */}
      <Route
        path="/inspect"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<InspectionList />} />
        <Route path="start" element={<InspectionStart />} />
        <Route path="form/:id" element={<InspectionForm />} />
        <Route path=":id" element={<InspectionDetail />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}
